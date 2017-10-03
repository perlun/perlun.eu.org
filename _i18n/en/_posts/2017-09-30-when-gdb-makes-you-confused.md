---
layout: post
title:  "chaos: When GDB makes you confused"
categories:
- programming
---

Sometimes when working on chaos, you run into weird errors that takes ages to debug. Like the one that happened to me today - a strange "stack overflow", for code that shouldn't cause any problems at first glance.

Here is the new code I was adding:

```c
return_type rv;
log_print(&log_structure, LOG_URGENCY_DEBUG, "Reading startup script...");
string_copy(directory_entry.path_name, STARTUP_FILE);
if ((rv = file_get_info(&vfs_structure, &directory_entry)) != FILE_RETURN_SUCCESS)
{
    // This is the new line being edited.
    log_print_formatted(&log_structure, LOG_URGENCY_ERROR, "%s not found. Return value was %d", STARTUP_FILE, rv);

    return -1;
}
```

Nothing really strange here. I was tweaking the `file_get_info` call to not only check if the function call was successful, but also _print_ the return value. The reason I wanted to make this change was that I was having problems with the call failing, and I wanted to understand why this was happening to I took the time and improved the log message at the same time.

The `return_type`, by the way, is defined like this:

```c
typedef int32_t return_type;
```

...so `%d` should be a fully valid format specifier for printing it.

When I ran the code above, this is what I got:

![chaos running, causing a Stack Overflow](/images/2017-09-30-when-gdb-makes-you-confused-chaos1.png)

Hmm, that was _not_ what I was expecting! Let's try and find out why this was happening.

## objdump to the rescue

The crash dump indicated quite clearly that the `boot` process was causing this. Unsurprisingly, the `boot` code was exactly the file has been edited prior to this happening.

I opened up my terminal and launched `objdump` to try and see what method the `0x4003295` address corresponded to:

```c
vagrant@debian-9rc1-i386:/vagrant$ objdump -S servers/system/boot/boot | less
40002390 <number_to_string>:
}

// Converts a number to a string.
static char *number_to_string(char *string, unsigned long number, int base,
                              int size, int precision, int flags)
{
40002390:       55                      push   %ebp
40002391:       57                      push   %edi
40002392:       89 c5                   mov    %eax,%ebp
40002394:       56                      push   %esi
40002395:       53                      push   %ebx
40002396:       89 d0                   mov    %edx,%eax
    char pad_character, sign = 0, tmp_string[66];
    const char *digits = "0123456789abcdefghijklmnopqrstuvwxyz";
40002398:       bf 08 43 00 40          mov    $0x40004308,%edi
4000239d:       ba e0 42 00 40          mov    $0x400042e0,%edx
{
400023a2:       83 c4 80                add    $0xffffff80,%esp
    const char *digits = "0123456789abcdefghijklmnopqrstuvwxyz";
400023a5:       f6 84 24 9c 00 00 00    testb  $0x40,0x9c(%esp)
400023ac:       40
400023ad:       0f 44 fa                cmove  %edx,%edi
    }
```

As can be seen, `objdump` is an invaluable tool for analyzing these kind of issues. It doesn't only show you the disassembled code, it gives you the full C code as well! (I don't know the exact prerequisites for making this work, but it's probably only then you've compiled the program with the `-g` comipler flag and the source files are available next to the binary, or something like this.)

Anyway, we can quite clearly see that the problem seems to be in the `number_to_string` method here. When it's pushing some of the CPU registers to the stack (probably since it is going to overwrite them), it ran out of stack space.

## `gdb` making you confused

I tried firing up `gdb` and placing a breakpoint at the `number_to_string` entry point, but it gave quite weird output:

```
$ qemu-system-i386 -s -m 128 -curses -cdrom chaos.iso # Starting up the chaos emulation, in one terminal
$ gdb --init-command "target remote localhost:1234" servers/system/boot/boot # In another terminal
GNU gdb (Debian 7.12-6) 7.12.0.20161007-git
Copyright (C) 2016 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.  Type "show copying"
and "show warranty" for details.
This GDB was configured as "i686-linux-gnu".
Type "show configuration" for configuration details.
For bug reporting instructions, please see:
<http://www.gnu.org/software/gdb/bugs/>.
Find the GDB manual and other documentation resources online at:
<http://www.gnu.org/software/gdb/documentation/>.
For help, type "help".
Type "apropos word" to search for commands related to "word"...

warning: No executable has been specified and target does not support
determining executable automatically.  Try using the "file" command.
0x00007c2f in ?? ()
Reading symbols from servers/system/boot/boot...done.
(gdb) b number_to_string
Breakpoint 1 at 0x40002390: file string.c, line 178.
(gdb) cont
Continuing.

Breakpoint 1, number_to_string (string=0x18 <error: Cannot access memory at address 0x18>, number=3, base=8269833, size=0, precision=12,
    flags=5) at string.c:178
178	{
(gdb) bt
#0  number_to_string (string=0x18 <error: Cannot access memory at address 0x18>, number=3, base=8269833, size=0, precision=12, flags=5)
    at string.c:178
#1  0x00000000 in ?? ()
(gdb) cont
Continuing.

Breakpoint 1, number_to_string (string=0x18 <error: Cannot access memory at address 0x18>, number=3, base=8265737, size=0, precision=9,
    flags=5) at string.c:178
178	{
(gdb) bt
#0  number_to_string (string=0x18 <error: Cannot access memory at address 0x18>, number=3, base=8265737, size=0, precision=9, flags=5)
    at string.c:178
#1  0x00000000 in ?? ()
(gdb) cont
Continuing.

Breakpoint 1, number_to_string (string=0x18 <error: Cannot access memory at address 0x18>, number=3, base=8265736, size=2, precision=9,
    flags=5) at string.c:178
178	{
(gdb) bt
#0  number_to_string (string=0x18 <error: Cannot access memory at address 0x18>, number=3, base=8265736, size=2, precision=9, flags=5)
    at string.c:178
#1  0x00000000 in ?? ()
(gdb) cont
Continuing.

Breakpoint 1, number_to_string (string=0x4003976c "\024", number=4294965596, base=0, size=1073816336, precision=-108, flags=0)
    at string.c:178
178	{
(gdb) cont
Continuing.

Breakpoint 1, number_to_string (string=0x4003976c "\024", number=4294965596, base=0, size=1073816336, precision=-108, flags=0)
    at string.c:178
178	{
(gdb) cont
Continuing.

Breakpoint 1, number_to_string (string=0x4003976c "\024", number=4294965596, base=0, size=1073816336, precision=-108, flags=0)
    at string.c:178
178	{
(gdb) cont
Continuing.

Breakpoint 1, number_to_string (string=0x4003976c "\024", number=4294965596, base=0, size=1073816336, precision=-108, flags=0)
    at string.c:178
178	{
(gdb) cont
Continuing.

Breakpoint 1, number_to_string (string=0x4003976c "\024", number=4294965596, base=0, size=1073816336, precision=-108, flags=0)
    at string.c:178
178	{
(gdb) run
The "remote" target does not support "run".  Try "help target" or "continue".
(gdb) cont
Continuing.

Breakpoint 1, number_to_string (string=0x4003976c "\024", number=4294965596, base=0, size=1073816336, precision=-108, flags=0)
    at string.c:178
178	{
(gdb)
Continuing.

Breakpoint 1, number_to_string (string=0x18 <error: Cannot access memory at address 0x18>, number=3, base=8265736, size=3, precision=9,
    flags=5) at string.c:178
178	{
(gdb)
Continuing.

Breakpoint 1, number_to_string (string=0x18 <error: Cannot access memory at address 0x18>, number=3, base=8265736, size=4, precision=9,
    flags=5) at string.c:178
178	{
(gdb)
Continuing.

Breakpoint 1, number_to_string (string=0x18 <error: Cannot access memory at address 0x18>, number=3, base=8265736, size=5, precision=9,
    flags=5) at string.c:178
178	{
(gdb)
Continuing.

Breakpoint 1, number_to_string (string=0x18 <error: Cannot access memory at address 0x18>, number=3, base=8265736, size=6, precision=9,
    flags=5) at string.c:178
178	{
(gdb)
Continuing.

Breakpoint 1, number_to_string (string=0x18 <error: Cannot access memory at address 0x18>, number=3, base=8265736, size=7, precision=9,
    flags=5) at string.c:178
178	{
(gdb)
Continuing.

Breakpoint 1, number_to_string (string=0x18 <error: Cannot access memory at address 0x18>, number=3, base=8265736, size=8, precision=9,
    flags=5) at string.c:178
178	{
(gdb)
Continuing.

Breakpoint 1, number_to_string (string=0x18 <error: Cannot access memory at address 0x18>, number=3, base=8265736, size=9, precision=9,
    flags=5) at string.c:178
178	{
(gdb)
Continuing.

Breakpoint 1, number_to_string (string=0x18 <error: Cannot access memory at address 0x18>, number=3, base=8265736, size=10, precision=9,
    flags=5) at string.c:178
178	{
(gdb)
Continuing.

Breakpoint 1, number_to_string (string=0x18 <error: Cannot access memory at address 0x18>, number=3, base=8265736, size=11, precision=9,
    flags=5) at string.c:178
178	{
(gdb)
Continuing.

Breakpoint 1, number_to_string (string=0x18 <error: Cannot access memory at address 0x18>, number=3, base=8265736, size=12, precision=9,
    flags=5) at string.c:178
178	{
(gdb)
Continuing.

Breakpoint 1, number_to_string (string=string@entry=0xfffff050 "", number=1, base=base@entry=10, size=-1, precision=-1, flags=2)
    at string.c:178
178	{
(gdb)
Continuing.
(gdb) quit
```

A lot of quite weird output, code seemingly trying to print a very low (`0x18`) address. Then finally, the call that would cause it to crash, but because of the weird output earlier, it's hard to know what you can trust at this point and not...

The reason for this seemingly "incorrect' output is that the chaos system is heavily multi-process. It uses a [micro-kernel](https://en.wikipedia.org/wiki/Microkernel) approach which is very different to e.g. Linux, where all the device drivers, file systems, the TCP/IP subsystem etc. is running in ring 0/kernel mode (with full, unlimited access to the hardware). This means that during a normal chaos startup, to get the system anywhere _near_ even being usable, a large number of processes need to be started. In my particular case, I counted them right now to 11 different programs (called "servers" in chaos terminology.)

Each of these processes have their own virtual address space. So the address `0x40002390` where the breakpoint was set in this case can mean very _different_ functions depending on in which process the breakpoint is being hit. `gdb` and `qemu` doesn't know anything of this, so it will just look at the `EIP` value at a given time and hit the debugger breakpoint.

So, the "easy" way around this (just disabling all other processes) will simply not be useful in this use case, since it will break a lot of the other functionality of the system.

## Trying various other approaches...

Another way to workaround this would be to deliberately put the programs at different virtual locations. But this is a bit awkward, since we at the moment use a single `ld` script for all servers, and I don't know how it could be conditionalized/parameterized to support different load addresses.

I gave it another try, this time setting the breakpoint inside the actual file that made the failing call:

```
vagrant@debian-9rc1-i386:/vagrant$ gdb servers/system/boot/boot
GNU gdb (Debian 7.12-6) 7.12.0.20161007-git
Copyright (C) 2016 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.  Type "show copying"
and "show warranty" for details.
This GDB was configured as "i686-linux-gnu".
Type "show configuration" for configuration details.
For bug reporting instructions, please see:
<http://www.gnu.org/software/gdb/bugs/>.
Find the GDB manual and other documentation resources online at:
<http://www.gnu.org/software/gdb/documentation/>.
For help, type "help".
Type "apropos word" to search for commands related to "word"...

warning: No executable has been specified and target does not support
determining executable automatically.  Try using the "file" command.
0x0000eebd in ?? ()
Reading symbols from servers/system/boot/boot...done.
(gdb) b boot.c:98
Breakpoint 1 at 0x400014c6: file boot.c, line 98.
(gdb) cont
Continuing.

Breakpoint 1, main () at boot.c:98
warning: Source file is more recent than executable.
98	        log_print_formatted(&log_structure, LOG_URGENCY_ERROR, "%s not found. Return value was %d", STARTUP_FILE, rv);
(gdb) rv
Undefined command: "rv".  Try "help".
(gdb) print rv
$1 = 8274032
(gdb) print/x rv
$2 = 0x7e4070
(gdb) next
number_to_string (string=0x7e2000 "P", number=<optimized out>, base=<optimized out>, size=-67105004, precision=1073747169, flags=0)
    at string.c:289
289	            real_index += 2;
(gdb) next
number_to_string (string=0x7e2000 "P", number=<optimized out>, base=<optimized out>, size=8212480, precision=1, flags=0) at string.c:288
288	            string[real_index + 1] = digits[33];
(gdb) next
string_print_va (output=0x7e2000 "P", format_string=0x7e401c "", arguments=0x7e005c "") at string.c:458
458	                    input_index++;
(gdb) next
462	                switch (format_string[input_index])
(gdb) next
string_to_number (string=0xfc000f08 "", number=0x400014e1 <main+1249>, characters=0x7e4070) at string.c:62
62	            switch (string[index])
(gdb) next
string_to_number (string=0x7e4000 "\032\300\312\300", number=0x4, characters=0xfc000f14) at string.c:60
60	            index++;
(gdb) next
0x0010a6c0 in ?? ()
(gdb) next
Cannot find bounds of current function
(gdb) cont
Continuing.

Breakpoint 1, main () at boot.c:98
98	        log_print_formatted(&log_structure, LOG_URGENCY_ERROR, "%s not found. Return value was %d", STARTUP_FILE, rv);
(gdb) print/x rv
$3 = 0x7e4170
(gdb) cont
Continuing.

Breakpoint 1, main () at boot.c:98
98	        log_print_formatted(&log_structure, LOG_URGENCY_ERROR, "%s not found. Return value was %d", STARTUP_FILE, rv);
(gdb) print/x rv
$4 = 0x1
```

As can be seen, this time we also got some other, probably-unrelated hits to the breakpoint. But we also got a likely-correct hit! A value of 1 actually means `FILE_RETURN_FILE_ABSENT` in this case, which is exactly the behavior we were expecting (it seemed to be failing in this way). But _why_ could this not be printed using my nice little `log_print_formatted` method?

I decided to try another approach. How about just passing in a hardwired integer instead to the `log_print_formatted` call, it must surely work? Let's try. Like this:

```c
log_print_formatted(&log_structure, LOG_URGENCY_ERROR, "%s not found. Return value was %d", STARTUP_FILE, 42);
```

Nope, still failed (but at a different address within the `number_to_string` function.)

How about moving it _earlier_ inside the boot server, would that make a difference? Nay - it still crashed, in that same function.

How about printing a _string_ instead of a number?

```c
log_print_formatted(&log_structure, LOG_URGENCY_ERROR, "Debug printout %s", "Hasta la vista, baby");
```

That worked, flawlessly. Interesting! So _something_ is making the numeric conversions fail. What's slightly weird is that I see it working in the `virtual_file_system` server. Like this:

```c
log_print_formatted(&log_structure, LOG_URGENCY_INFORMATIVE, "Mounting %u at //%s.",
                    ipc_structure->output_mailbox_id, mount->location);

```

The line above generates this output:

```
[virtual_file_system] Mounting 29 at //ramdisk.
```

How about changing the line above to have a hardwired 42 as its parameters instead of `ipc_structure->output_mailbox_id`, will it work or will it crash in the same way? Let's try!

```c
log_print_formatted(&log_structure, LOG_URGENCY_INFORMATIVE, "Mounting %u at //%s.",
                    42, mount->location);

```

This is what it printed:

```
[virtual_file_system] Mounting 42 at //ramdisk.
```

That is _one strange_ kind of problem. The same kind of line _works_ in one server, but fails in the other.

The careful reader might notice that the urgencies differ. `LOG_URGENCY_ERROR` in the failing case, and `LOG_URGENCY_INFORMATIVE` in the other. Could it have anything to do with the problem? Let's try tweaking the `boot` server call to use `LOG_URGENCY_INFORMATIVE` as well:

```c
log_print_formatted(&log_structure, LOG_URGENCY_INFORMATIVE, "Debug printout %u", 42);
```

Nope, didn't make any difference (which is _good_, since it should in any way affect this behavior).

Let's drop a bunch of servers from the startup sequence and see if it makes any difference:

```shell
# This is the grub config file. It gets automatically copied into the .iso file during the build process.
timeout 5

title chaos 0.1.0
kernel /storm

module /servers/console.gz
module /servers/keyboard.gz
module /servers/vga.gz
module /servers/log.gz
module /servers/boot.gz
```

Still no luck - same problem.

I looked at the build configurations for the VFS server and the boot server. There were _no_ differences there, apart from a difference in the list of dependencies.

## Finally, a clue!

How about _removing_ all the code in the boot server except from this very line?

Hmm, that made it _work_! I think I'm on to something here... Let's uncomment the parts I just removed to see if we can find the delta, the _specific_ line being added/removed that is causing this...

(I felt more and more like a private detective rather than a software engineer at this very point... hunting my suspect, trying to nail him or her down with whatever measure needed...)

I also noted something else very interesting at this point. The system startup had now turned _instantaneous_. It used to take quite a long time to start up chaos, it felt like there was a timeout somewhere, which would eventually be firing. This timeout was now supposedly gone, probably because I had commented out the specific line that was causing it.

Something very important at this time was to avoid making too many changes at the same time. Instead, try changing a few lines, recompile and reboot the VM, verify if it works/doesn't work, and then back to zero. Over and over again. It you make too big a change at once, you will have a much harder time knowing which part of it actually caused the change in behavior, _if_ and _when_ the behavior changes.

Then I realized it, while looking at the code.

The problem was simple, once you saw it.

Let's look at the `main` method of the `boot` server:

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

    // ...
```

A quick counting of this gives me _16_ different variables in this function. If you know your C, you know that local variables are allocated on the stack, so what I started thinking was that _we are indeed running out of stack space_. The `ESP` address in the original stack trace can be seen in the original screenshot:

![chaos running, causing a Stack Overflow](/images/2017-09-30-when-gdb-makes-you-confused-chaos1.png)

`ESP` was `0xFFFFF000`. That is _exactly_ at the page boundary of the highest page of memory (which is 4 KiB in this case, i.e. `0x1000` bytes.) So what we see here is that the first stack page is indeed fully used, both by these local variables and potential other variables kept on the stack.

Now, normally, both in chaos and in many other operating systems, the stack is essentially on-demand mapped (up to a certain limit, to avoid infinite recursion errors using up all the available RAM in the whole machine...) by the page fault handler. So we _should_ be getting more stack space, and no error should be generated.

Imagine the view of my face when I saw _this_ code in the page fault handler:

```c
        // If this pagefault is caused by a growing stack, just map more memory.
        if (address >= BASE_PROCESS_STACK)
        {
            // FIXME: This code should not really be here, but right now, it's good for debugging...

            debug_crash_screen("Stack overflow", current_tss);
            current_tss->state = STATE_ZOMBIE;
            //      if (current_task == TASK_ID_KERNEL)
            //      {
            //        cpu_halt ();
            //      }
            dispatch_next();

            // FIXME: End of temporary code. */
```

In other words: instead of growing the stack, we have hardwired a crash screen here. :rofl: :rofl: :rofl: Not so strange that this is what I'm getting then, huh?

This is the time when you start making use of `git blame` and `git log`. I went back all the way to 2007, which is the time when this code was imported to CVS. (We _used_ to have it in CVS earlier as well, but somehow the CVS tree was lost or bad or whatever, so we did a clean import from a `.tar.bz2` dump instead.) It looked like this in the very first commit.

I fixed it in [revision 3293f21](https://github.com/chaos4ever/chaos/commit/3293f21554332ce4d445f7f2c5538b670d7a3708) and all was fine, right away. My problem was solved, and it felt really good to have found the root cause here. Yay!

(How about the interesting detail mentioned, where system startup was suddenly much faster - what was the reason for that? Well, sorry to disappoint the reader, but I did not investigate this further, since I was focusing on the stack overflow error for now. Eventually, I will definitely check that part out as well, since the slowness of starting the system _is_ indeed a bit annoying right now. But, one thing at a time. :smile:)
