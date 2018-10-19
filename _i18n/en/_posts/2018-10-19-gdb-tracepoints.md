---
layout: post
title:  "GDB tracepoints"
categories:
- linux
- gdb
- programming
- geek hobbies
---

Many of us have been using GNU GDB for debugging sometimes, but at least for me personally, I know that there is a lot more to learn about how to use it effectively. In this blog post I go through something I call _tracepoints_ and why they can be invaluable in debugging complex problems.

Until now, I have typically used GDB by placing _breakpoints_ at interesting functions in my program. However, something I also liked in the world of Microsoft Visual Studio was to have the concept of _tracepoints_. Instead of necessarily breaking the program at a certain line and letting me inspect things, the debugger would instead output a user-defined "trace message", which could even include values of variables and other expressions. This can be particularly useful when the problem occurs not in a particular method call, but rather in a series of method calls or a particular _combination_ of method calls with certain parameters etc.

Is there something similar like this in GDB and if so, how can it be used? Well, there is - enter [_break commands_](https://sourceware.org/gdb/onlinedocs/gdb/Break-Commands.html#Break-Commands):

```
(gdb) break ipc_receive
(gdb) command
Type commands for breakpoint(s) 1, one per line.
End with a line saying just "end".
>silent
>printf "ipc_receive: Receiving from mailbox ID %d with message_parameter %x, in PID/TID: %d/%d\n", >mailbox_id, message_parameter, current_process_id, current_thread_id
>continue
>end
```

So, in essence: first you place a breakpoint on the method you are interested in. Then you run the `command` command in GDB, saying "this is a command sequence". All the commands you then type in will be executed _each time the breakpoint is hit_.

- The `silent` command is important, since without it, GDB will print its default breakpoint information on each hit, which will clutter the output significantly. Many times, you want to silence this output.
- You then add a `printf` command which works pretty much like any `printf` would, and then you say `continue` to continue execution.
- Finally, you say `end` to denote the end of the command sequence and go back to the GDB prompt.

----

This mechanism helped me debug an issue recently which I will go into at more depth now, to explain more about how this can be useful. Below is the GDB output after defining these breakpoints and adding the command sequences. (I added them in a custom GDB init file that I executed by saying `gdb -ix ~/my-gdb-init-script` - that way I wouldn't have to retype the command sequences over and over again.)

```
warning: No executable has been specified and target does not support
determining executable automatically.  Try using the "file" command.
0x000f434f in ?? ()
Breakpoint 1 at 0x1106f6: file mailbox.c, line 242.
Breakpoint 2 at 0x110b96: file mailbox.c, line 365.
Breakpoint 3 at 0x110e10: file mailbox.c, line 418.
(gdb) cont
Continuing.
mailbox_receive: PID: 1 (console) / TID: 12 (Handling connection)
mailbox_receive: no messages available in mailbox, blocking thread. PID: 1 (console) / TID: 12 (Handling connection)
mailbox_send: PID: 3 (vga), TID: 3 (Initialising)
mailbox_receive: PID: 1 (console) / TID: 12 (Handling connection)
mailbox_receive: no messages available in mailbox, blocking thread. PID: 1 (console) / TID: 12 (Handling connection)
mailbox_receive: PID: 1 (console) / TID: 14 (Handling connection)
mailbox_receive: no messages available in mailbox, blocking thread. PID: 1 (console) / TID: 14 (Handling connection)
mailbox_send: PID: 3 (vga), TID: 3 (Handling connection)
mailbox_receive: PID: 1 (console) / TID: 15 (Handling connection)
```

Can you see it? Two threads - TID 12 and TID 14 - are _simultaneously_ being blocked on the same mailbox. This is completely unsupported by the mailbox implementation in our kernel, and indicates something is broken in the calling code (the `console` process in this case.)

So, I added error checking in the `mailbox_receive` code to ensure that only a single thread at a time was waiting on a mailbox. The `gdb` tracepoints helped me _a lot_ in this case, in trying to nail down the root cause. But, it still took me many hours (spread over multiple days) until I managed to _somehow_ understand the problem. When adding conditional breakpoints in GDB, the error would not be consistent; it started changing so that the "multiple blocking" appeared with different mailbox IDs at different times.

**Finally** (praise God!), I managed to find a pattern and even be able to reproduce the problem _with a breakpoint_ that would trigger at the exact right time. I was so incredibly happy!

```
system_call_mailbox_receive: Receiving from mailbox ID 8 with message_parameter ffffff3c, in PID/TID: 1/20
ipc_receive: Receiving from mailbox ID 8 with message_parameter ffffff3c, in PID/TID: 1/20
ipc_receive: Receiving from mailbox ID 1 with message_parameter ffffff74, in PID/TID: 1/1
system_call_mailbox_receive: Receiving from mailbox ID 1 with message_parameter ffffff74, in PID/TID: 1/1
ipc_receive: Receiving from mailbox ID 39 with message_parameter ffffff3c, in PID/TID: 1/32
system_call_mailbox_receive: Receiving from mailbox ID 8 with message_parameter ffffff3c, in PID/TID: 1/20
ipc_receive: Receiving from mailbox ID 8 with message_parameter ffffff3c, in PID/TID: 1/20
system_call_mailbox_receive: Receiving from mailbox ID 8 with message_parameter ffffff3c, in PID/TID: 1/20
ipc_receive: Receiving from mailbox ID 8 with message_parameter ffffff3c, in PID/TID: 1/20
system_call_mailbox_receive: Receiving from mailbox ID 8 with message_parameter ffffff3c, in PID/TID: 1/20
ipc_receive: Receiving from mailbox ID 8 with message_parameter ffffff3c, in PID/TID: 1/20
system_call_mailbox_receive: Receiving from mailbox ID 8 with message_parameter ffffff3c, in PID/TID: 1/20
ipc_receive: Receiving from mailbox ID 8 with message_parameter ffffff3c, in PID/TID: 1/20
system_call_mailbox_receive: Receiving from mailbox ID 8 with message_parameter ffffff3c, in PID/TID: 1/20
system_call_mailbox_receive: Receiving from mailbox ID 39 with message_parameter ffffff3c, in PID/TID: 1/32
ipc_receive: Receiving from mailbox ID 39 with message_parameter ffffff3c, in PID/TID: 1/32
system_call_mailbox_receive: Receiving from mailbox ID 39 with message_parameter ffffff3c, in PID/TID: 1/32
system_call_mailbox_receive: Receiving from mailbox ID 10 with message_parameter fffffe8c, in PID/TID: 1/32
```

What was really interesting there is that there was _one_ call (_"Receiving from mailbox ID 10"_) that did a `system_call_mailbox_receive` _without_ tunneling it through `ipc_receive`. This is the bad one. Let's give it a closer look and check the backtrace:

```
Breakpoint 3, system_call_mailbox_receive (mailbox_id=10, message_parameter=0xfffffe8c) at ../system/system_calls.h:365
365	    j += 42;
(gdb) bt
#0  system_call_mailbox_receive (mailbox_id=10, message_parameter=0xfffffe8c) at ../system/system_calls.h:365
#1  0x400046e7 in video_mode_set (video_structure=0x400058e4 <video_structure>, video_mode=0xfffffed4) at video.c:53
#2  0x40001313 in connection_client (message_parameter=0xffffff3c, our_console=0xffffff30, our_application=0xffffff2c, data=0x7e9000, ipc_structure=0xffffff34) at connection.c:141
#3  0x40001845 in handle_connection (reply_mailbox_id=38) at connection.c:403
#4  0x00000000 in ?? ()
```

You see, my problem until now was that I had _never_ been able to reproduce the problem and get a breakpoint to trigger. I could easily place a breakpoint in the _kernel_ and get it to trigger, but the backtraces from kernelspace to userspace are at the moment not parseable by GDB (which is a real pain...), so it doesn't help me very much; I cannot see where the failing call is being initiated in the user-level code.

Anyway, once I were able to trigger a breakpoint, it was much simpler to understand why this was happening. I could go to bed with a good feeling that night, knowing that I was _close_ now, and I managed to merge a fix to this a few days later: https://github.com/chaos4ever/chaos/pull/124

----

For the record, here is some of my `~/.gdbinit` that helped me nail down this issue. Feel free to let it inspire you.

```shell
# Values look sane in ipc_receive
break ipc_receive
command
silent
printf "ipc_receive: Receiving from mailbox ID %d with message_parameter %x, in PID/TID: %d/%d\n", mailbox_id, message_parameter, current_process_id, current_thread_id
continue
end

 # BAM, here the values look bad!
break system_calls.h:361
command
silent
printf "system_call_mailbox_receive: Receiving from mailbox ID %d with message_parameter %x, in PID/TID: %d/%d\n", mailbox_id, message_parameter, current_process_id, current_thread_id
continue
end

# This was the "bad method call" - I couldn't conditionalize this on mailbox_id and get the breakpoint
# to trigger, but conditionalizing it on the message_parameter worked fine and helped me understand
# the root cause.
break system_calls.h:365 if message_parameter == 0xfffffe8c
```
