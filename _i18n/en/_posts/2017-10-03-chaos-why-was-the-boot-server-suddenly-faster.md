---
layout: post
title:  "chaos: Why was the boot server suddenly faster?"
categories:
- programming
---

One of my dear friends and readers (hello Andreas!) asked a very interesting question after reading my previous post about _"chaos: When GDB makes you confused"_ - **"what was the thing that suddenly made the boot server faster"**? Good question indeed! In the original version of that post, I didn't go further into any of that, but just left the reader in a confused state of despair... After hearing that I left a bit of a "cliffhanger" there in the text, I amended the post with a new paragraph, just to make it clear that I never actually found the reason for the boot server slowness.

But this time, I am planning for us together to go on an exciting "bug hunt" - I thought it's about time now both for me and you to find the underlying reason here! Buckle up your seat belt, here we go!

Let's start by first looking at the [boot server code (boot.c)](https://github.com/chaos4ever/chaos/blob/3293f21554332ce4d445f7f2c5538b670d7a3708/servers/system/boot/boot.c) as it looked at the time of writing this. More specifically, the `main` function:

```c
int main(void)
{
    file_mount_type mount;
    mailbox_id_type mailbox_id[10];
    ipc_structure_type vfs_structure;
    message_parameter_type message_parameter;
    file_handle_type handle;
    file_verbose_directory_entry_type directory_entry;
    uint8_t *buffer;
    uint8_t **buffer_pointer = &buffer;
    char *server_name_buffer;
    char *server[MAX_SERVERS];
    unsigned int where, number_of_servers = 0, server_number;
    process_id_type process_id;
    unsigned int bytes_read;
    unsigned int services = 10;

    system_process_name_set(PACKAGE_NAME);
    system_thread_name_set("Initialising");

    if (log_init(&log_structure, PACKAGE_NAME, &empty_tag) != LOG_RETURN_SUCCESS)
    {
        return -1;
    }

    log_print(&log_structure, LOG_URGENCY_DEBUG, "beginning of boot");

    // Mount the initial ramdisk as //ramdisk. To do this, we must first hook up a connection to the VFS service and
    // resolve the first block service.
    if (ipc_service_resolve("virtual_file_system", mailbox_id, &services, 5, &empty_tag) != IPC_RETURN_SUCCESS)
    {
        log_print(&log_structure, LOG_URGENCY_EMERGENCY, "Couldn't resolve the VFS service.");

        return -1;
    }

    vfs_structure.output_mailbox_id = mailbox_id[0];

    if (ipc_service_connection_request(&vfs_structure) != IPC_RETURN_SUCCESS)
    {
        log_print(&log_structure, LOG_URGENCY_EMERGENCY, "Couldn't connect to the VFS service.");

        return -1;
    }

    services = 1;

    if (ipc_service_resolve("block", mailbox_id, &services, 5, &empty_tag) != IPC_RETURN_SUCCESS)
    {
        log_print(&log_structure, LOG_URGENCY_EMERGENCY, "No block services found.");

        return -1;
    }

    // Obviously this needs to be specified but the neccessary code at the other end (virtual_file_system server) is
    // not there so it proved meaningless to add this yet... it just broke other code from compiling. (because I added
    // the field to the file_mount_type structure)
    // mount.mailbox_id = mailbox_id[0];
    string_copy(mount.location, "ramdisk");

    // That's it. Send the message.
    message_parameter.protocol = IPC_PROTOCOL_FILE;
    message_parameter.message_class = IPC_FILE_MOUNT_VOLUME;
    message_parameter.data = &mount;
    message_parameter.length = sizeof(file_mount_type);
    message_parameter.block = TRUE;
    ipc_send(vfs_structure.output_mailbox_id, &message_parameter);

    log_print(&log_structure, LOG_URGENCY_DEBUG, "Mounted the first available block service as //ramdisk.");

    // Now, read the list of servers to start from here.
    log_print(&log_structure, LOG_URGENCY_DEBUG, "Reading startup script...");
    string_copy(directory_entry.path_name, STARTUP_FILE);
    if (file_get_info(&vfs_structure, &directory_entry) != FILE_RETURN_SUCCESS)
    {
        log_print(&log_structure, LOG_URGENCY_ERROR, STARTUP_FILE " not found.");

        return -1;
    }

    char **server_name_pointer = &server_name_buffer;
    memory_allocate((void **) server_name_pointer, directory_entry.size);

    file_open(&vfs_structure, STARTUP_FILE, FILE_MODE_READ, &handle);
    file_read(&vfs_structure, handle, directory_entry.size, &server_name_buffer);

    // Parse the file.
    server[0] = &server_name_buffer[0];
    number_of_servers++;

    for (where = 1; where < directory_entry.size; where++)
    {

        if (server_name_buffer[where] == '\n')
        {
            server_name_buffer[where] = '\0';
            if (where + 1 < directory_entry.size)
            {
                server[number_of_servers] = &server_name_buffer[where + 1];
                number_of_servers++;
            }
        }
    }

    log_print_formatted(&log_structure, LOG_URGENCY_DEBUG, "Starting %u servers.", number_of_servers);

    for (server_number = 0; server_number < number_of_servers; server_number++)
    {
        log_print_formatted(&log_structure, LOG_URGENCY_INFORMATIVE, "Starting %s.", server[server_number]);

        string_copy(directory_entry.path_name, server[server_number]);
        if (file_get_info(&vfs_structure, &directory_entry) !=
            FILE_RETURN_SUCCESS)
        {
            log_print_formatted(&log_structure, LOG_URGENCY_ERROR,
                                "'%s' could not be accessed!",
                                server[server_number]);
            continue;
        }

        // Open the file.
        file_open(&vfs_structure, server[server_number], FILE_MODE_READ, &handle);

        log_print_formatted(&log_structure, LOG_URGENCY_DEBUG,
                            "Allocating %u bytes for %s.",
                            directory_entry.size, server[server_number]);

        memory_allocate((void **) buffer_pointer, directory_entry.size);

        log_print_formatted(&log_structure, LOG_URGENCY_DEBUG, "Buffer is at %p.", buffer);

        bytes_read = 0;
        while (bytes_read < directory_entry.size)
        {
            unsigned int bytes;

            // Read the file.
            bytes = directory_entry.size - bytes_read;
            if (bytes > 32 * KB)
            {
                bytes = 32 * KB;
            }
            file_read(&vfs_structure, handle, bytes, &buffer[bytes_read]);
            bytes_read += bytes;
        }

        switch (execute_elf((elf_header_type *) buffer, "", &process_id))
        {
            case EXECUTE_ELF_RETURN_SUCCESS:
            {
                log_print_formatted(&log_structure, LOG_URGENCY_INFORMATIVE,
                                    "New process ID %u.", process_id);
                break;
            }

            case EXECUTE_ELF_RETURN_IMAGE_INVALID:
            {
                log_print(&log_structure, LOG_URGENCY_ERROR, "Invalid ELF image.");
                break;
            }

            case EXECUTE_ELF_RETURN_ELF_UNSUPPORTED:
            {
                log_print(&log_structure, LOG_URGENCY_ERROR, "Unsupported ELF.");
                break;
            }

            case EXECUTE_ELF_RETURN_FAILED:
            {
                log_print(&log_structure, LOG_URGENCY_ERROR, "system_process_create failed.");
                break;
            }
        }

        memory_deallocate((void **) buffer_pointer);
    }

    system_call_process_parent_unblock();

    log_print(&log_structure, LOG_URGENCY_DEBUG, "end of boot");

    return 0;
}
```

Wow, that's a long an winding function! Those of you who know me nowadays know that I am a proponent of short methods - the [Ruby Style Guide](https://github.com/bbatsov/ruby-style-guide#short-methods) suggests no longer than 10 LOC per method. Now, C and Ruby are obviously quite different in nature, but it's still a good principle to try and adhere to where applicable.

Then again, there are [people](https://www.youtube.com/watch?v=QM1iUe6IofM) who have different opinions about that matter. I think personally though that this method _is_ indeed too long, and an even bigger problem perhaps is its complexity; it has little abstraction and forces the reader to care very much about _all_ the details of what it's doing.

Compare with this excerpt from another function instead, coming from [main.c](https://github.com/chaos4ever/chaos/blob/3293f21554332ce4d445f7f2c5538b670d7a3708/storm/x86/main.c#L125), and you will see the difference. (Both of these functions are written at the same era, late 90's or early 00's. The function deteriorates at the end though, and gets messy; I have deliberately excluded these parts to illustrate how I think code _preferably_ should be written)

```c
return_type kernel_main(int arguments, char *argument[])
{
    // We have seen cases where these were corrupted this early, so hence these assertions. Better safe than sorry;
    // fail-fast is definitely preferable if memory regions have been corrupted somehow.
    assert(tss_tree_mutex == MUTEX_UNLOCKED, "tss_tree_mutex != MUTEX_UNLOCKED");
    assert(memory_mutex == MUTEX_UNLOCKED, "memory_mutex != MUTEX_UNLOCKED");

    int servers_started = 0;

    // Detect CPU type and flags. Must be done this early, since we want to make sure this CPU has the capabilites we require
    // (for example MMX if this is a kernel compiled for MMX).
    cpuid_init();

    parse_kernel_arguments(arguments, argument);
    debug_init();

    if (help != 0)
    {
        debug_print("Help...\n");
        cpu_halt();
    }

    memory_physical_init();

    debug_print("Starting %s (process ID %u).\n", argument[0], PROCESS_ID_KERNEL);
    debug_print("%s %s booting...\n", PACKAGE_NAME, PACKAGE_VERSION);
    debug_print("Compiled by %s on %s %s (revision %s).\n", CREATOR, __DATE__, __TIME__, REVISION);

    if (multiboot_info.has_module_info == 0 ||
        multiboot_info.number_of_modules == 0)
    {
        debug_print("No servers started. System halted.\n");
        cpu_halt();
    }

    // Prepare paging structures. Paging is not enabled yet though.
    memory_virtual_init();

    // This MUST not be executed before memory_virtual_init, since it relies on stuff that it sets up.
    trap_init();

    avl_debug_tree_check(page_avl_header, page_avl_header->root);

    timer_init();
    time_init();
    system_calls_init();

    if (cpu_info.flags.flags.tsc)
    {
        debug_print("Machine: %s at %u Hz (~%u MHz).\n",
                    parsed_cpu.name, parsed_cpu.speed,
                    parsed_cpu.speed / 1000000);
    }
    else
    {
        debug_print("Machine: %s.\n", parsed_cpu.name);
    }

    // FIXME: Report the correct memory sizes back to the enterprise.
    debug_print("Memory: Total %u MB, kernel %u KB, "
                "reserved 384 KB, free %u KB.\n",
                (memory_physical_get_number_of_pages() * SIZE_PAGE) / MB,
                (memory_physical_get_used() * SIZE_PAGE) / KB - 384,
                (memory_physical_get_free() * SIZE_PAGE) / KB);

    // Enable this if storm could not detect the cpu type, read the values and fill in the cpu type table in cpuid.c.

#if FALSE
    debug_print("CPU: Family %u, model %u.\n", cpu_info.family, cpu_info.model);
#endif

    // Set up paging and map global memory.
    memory_virtual_enable();
    debug_print("VM subsystem initialized.\n");

    memory_global_init();
    debug_print("Global memory initialized.\n");

    debug_log_enable = TRUE;

    port_init();
    debug_print("ISA-based I/O initialized.\n");

    dma_init();
    debug_print("DMA initialized.\n");

    mailbox_init();
    debug_print("IPC initialized.\n");

    // Initialise the thread code. Must be done before any threads are started.
    thread_init();
    debug_print("Thread subsystem initialized.\n");

    process_init();
    debug_print("Process subsystem initialized.\n");
```

This code could clearly also be improved (and as mentioned, I didn't show you the worst parts now), but I think it's still quite clear that the current quality of it is much better than the other `main` method. Here, the `kernel_main` method is more focused on the _high-level_ aspects of what should be done. `memory_physical_init`, `memory_virtual_init`, `memory_virtual_enable` - not all the details about _how_ the physical memory structures are initialized, what structures are set up to prepare for VM enablement, etc. It gives the reader an overall picture of the steps involved in starting up the kernel, which is good - the reader can then "zoom in" on the specific part they are interested at for the moment.

Not so with the `boot.c` method. But still, let's make an attempt at analyzing the various steps it takes in the boot process:

- It sets its own process and thread name (this is mostly for debugging; it makes it easier to see which process has crashed, which process is using most memory or CPU, etc. It is not a strict _requirement_ for a chaos server.)
- It connects to the `log` server and prints out a message that the boot process is starting.
- If connects to the `virtual_file_system` service. I _think_ this is what was making it slow sometimes (because there is a timeout of 5 seconds in the call), but I also remember seeing the slowness when it _does_ indeed resolve the VFS service. If I would manage to finish [chaos#40](https://github.com/chaos4ever/chaos/pull/40) someday, it would help simplify debugging stuff like this, since it would make it easier to see where the delays seems to be located.
- It connects to the first available `block` service. This is typically an initial ramdisk, formatted with a FAT filesystem.
- It tells the VFS service to mount the filesystem at `//ramdisk`.
- It reads a list of servers to start, from the ramdisk.
- It loops over this list, and for each entry:
  - reads the file into memory
  - executed the file
  - deallocates the memory temporary used for the ELF image
- Finally, once all of this is done, it unblocks the "parent process", which is in this case the kernel, to allow the system startup to continue.

So, what in all of this (if any) is causing the system to be so slow at booting? Let's find out!

I _think_ that the VFS service is broken in its current state, and when it's trying to read the list of servers to boot, it fails. So, I disabled this code and onwards:

```c
    if (file_get_info(&vfs_structure, &directory_entry) != FILE_RETURN_SUCCESS)
    {
        log_print(&log_structure, LOG_URGENCY_ERROR, STARTUP_FILE " not found.");

        return -1;
    }
```

However, the interesting this is that _this did not make a single bit of a difference_. There was still a noticeable pause while booting; around 11 seconds is what I came to when doing a simple count while waiting for it.

Hmm, weird stuff. How about disabling the mounting as well?

```c
    // Obviously this needs to be specified but the necessary code at the other end (virtual_file_system server) is
    // not there so it proved meaningless to add this yet... it just broke other code from compiling. (because I added
    // the field to the file_mount_type structure)
    // mount.mailbox_id = mailbox_id[0];
    string_copy(mount.location, "ramdisk");

    // That's it. Send the message.
    message_parameter.protocol = IPC_PROTOCOL_FILE;
    message_parameter.message_class = IPC_FILE_MOUNT_VOLUME;
    message_parameter.data = &mount;
    message_parameter.length = sizeof(file_mount_type);
    message_parameter.block = TRUE;
    ipc_send(vfs_structure.output_mailbox_id, &message_parameter);

    log_print(&log_structure, LOG_URGENCY_DEBUG, "Mounted the first available block service as //ramdisk.");
```

Same thing - no difference whatsoever.

What about this part then?

```c
    if (ipc_service_resolve("block", mailbox_id, &services, 5, &empty_tag) != IPC_RETURN_SUCCESS)
    {
        log_print(&log_structure, LOG_URGENCY_EMERGENCY, "No block services found.");

        return -1;
    }
```

Nope, it was still slow. I decided to get drastic and comment out the whole boot server code, and just let it return right away:

```c
int main(void)
{
    system_call_process_parent_unblock();

    log_print(&log_structure, LOG_URGENCY_DEBUG, "boot server shutting down");

    return 0;
}
```

This was the result: :laughing:

![Illegal page fault](/images/2017-10-03-chaos-why-was-the-boot-server-suddenly-faster-illegal-page-fault.png)

The time was around midnight now. I _should_ go to bed, but how on earth could go you go to bed when things are behaving like this?

I looked up the code with `objdump -S servers/system/boot/boot` again, but it feels silly that I even had to do that. The code above _can never work_. I mean, it tries to print using a completely uninitialized `log_structure`, which is the reason why `CR2` in the page fault handler is indeed `0x00000000` - a classic _null pointer_ error. (If I remember correctly, the ELF loader in chaos initializes the BSS section with zeroes, which comes quite handy at times like this. It's much better to have a clear null pointer error than a random value like `0x0BADBEEF` which can be different each time you boot the system.)

I removed the log printing and rebooted the VM once more. Then I got another very interesting error on startup...

![Failed to start server](/images/2017-10-03-chaos-why-was-the-boot-server-suddenly-faster-failed-to-start-server.png)

Apparently, we have a [weird check](https://github.com/chaos4ever/chaos/blob/3293f21554332ce4d445f7f2c5538b670d7a3708/storm/x86/process.c#L143) in the `process_create` kernel call that verifies that the ELF image being started actually has a non-empty code _and_ data section. This might seem very odd, but I think it's there to try and prevent the system from starting up corrupted images or something. I mean, think of it; it's very unlikely that any _real_ server would have a completely empty data segment. For now, let's just comment out the whole server from the GRUB `menu.lst` file:

```
timeout 5
title chaos 0.1.0
kernel /storm
module /servers/console.gz
module /servers/keyboard.gz
module /servers/vga.gz
module /servers/fat.gz
module /servers/initial_ramdisk.gz
module /servers/log.gz
module /servers/loopback.gz
module /servers/ipv4.gz
module /servers/pci.gz
module /servers/virtual_file_system.gz
```

Not any difference at all. OK, now I'm tired of all this junk. The time I saw it be "fast" was probably at the time when I had disabled most other servers as well. Let's remove the `fat`, `initial_ramdisk` and `virtual_file_system` ones also, leaving this:


```
timeout 5
title chaos 0.1.0
kernel /storm
module /servers/console.gz
module /servers/keyboard.gz
module /servers/vga.gz
module /servers/log.gz
module /servers/loopback.gz
module /servers/ipv4.gz
module /servers/pci.gz
```

**YES!!!** That was it. Now it's super-fast again. Let's take back the FAT server, and _only_ that one.

Interesting. That made it significantly slower. I wonder... Could it be that the FAT server depends on the `virtual_file_system` server? Lets [take a look](https://github.com/chaos4ever/chaos/blob/3293f21554332ce4d445f7f2c5538b670d7a3708/servers/file_system/fat/fat.c) at its code.

The supposed VFS dependency wasn't there, but what I did spot was something fairly obvious: it, like many other servers, tries to lookup the `log` service on startup, so letting that server start before the `log` server is a really bad idea... I rearranged stuff a bit, so that the end result looked like this:

```
timeout 5
title chaos 0.1.0
kernel /storm
module /servers/console.gz
module /servers/keyboard.gz
module /servers/vga.gz
module /servers/log.gz
module /servers/fat.gz
module /servers/initial_ramdisk.gz
module /servers/loopback.gz
module /servers/ipv4.gz
module /servers/pci.gz
module /servers/virtual_file_system.gz
module /servers/boot.gz
```

(I know, I know, I shouldn't be making multiple changes at one go, but I'm cheating a bit this time. Maybe the universe won't punish me for once.)

The careful reader will also notice that the `boot` server was still broken, so I had to unbreak it before I tried the next recompile & run cycle.

The booting was now super-fast, even with the boot server (in crippled form) loaded. I was happy, and I decided to go to bed and leave things as-is for now. The root cause was as simple as _things not starting up in a sane order_, this time. The chaos bootup sequence is essentially serial in sequence, for simplicity, so _if_ you start things in the wrong order... you can get these kind of problems.

(We could perhaps consider getting rid of this somewhat stupid design. I brought the issue up for discussion with some other guys in the old core team. Maybe _someone_ can remember why we designed it like this years ago. I _think_ it was because we didn't typically "sleep" when resolving IPC services, so it made things simpler. But nowadays, when multi-core is the norm (it wasn't like that back then, not at all), it would make sense to try and let things start in parallel instead. Yes, it _might_ mean that we detect parts of the kernel which is not reentrant and not properly mutexed, but those bugs should be found and squashed anyway...

Thanks for tonight, hope to see you soon again!
