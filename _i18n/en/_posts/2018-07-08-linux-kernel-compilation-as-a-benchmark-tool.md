---
layout: post
title:  "Linux kernel compilation as a benchmark tool"
categories:
- linux
- geek hobbies
---

Back in the days, compiling the Linux kernel was a rough (but still
remotely useful) measure of the performance of a machine. How long does it
take to compile a modern Linux kernel on a modern piece of hardware? Let's
find out!

I started off by downloading kernel 4.17.4 from https://www.kernel.org and
unpacking it:

```shell
$ wget https://cdn.kernel.org/pub/linux/kernel/v4.x/linux-4.17.4.tar.xz
$ tar xvf ~/Downloads/linux-4.17.4.tar.xz
```

Then I was looking for my kernel config in `/proc/config.gz` or similar,
but apparently it wasn't available there. `/boot/config-4.16.0-2-amd64` had
it though.

I tried running `make oldconfig` to use this config (and add potentially
new configurations from 4.17.4 to it):

```
$ make oldconfig
  HOSTCC  scripts/basic/fixdep
  HOSTCC  scripts/kconfig/conf.o
  YACC    scripts/kconfig/zconf.tab.c
  LEX     scripts/kconfig/zconf.lex.c
/bin/sh: 1: flex: not found
scripts/Makefile.lib:188: recipe for target `'scripts/kconfig/zconf.lex.c' failed
make[1]: *** [scripts/kconfig/zconf.lex.c] Error 127
Makefile:528: recipe for target 'oldconfig' failed
make: *** [oldconfig] Error 2
```

`sudo apt-get install flex` to the rescue. I re-ran `make oldconfig` and
answered "No" to most new things added in 4.17.4. (I just went with the
suggested defaults.) And there were quite a lot of them actually, for being
a minor release!

Then I attempted to start the kernel compilation. Since my CPU is a [6-core
Ryzen](https://www.amd.com/en/products/cpu/amd-ryzen-5-1600) with
hyperthreading, I used `make -j12` to allow up to 12 parallel `gcc` jobs -
it failed first because of yet another missing dependency:

```
$ time make -j12
scripts/kconfig/conf  --syncconfig Kconfig
Makefile:970: *** "Cannot generate ORC metadata for CONFIG_UNWINDER_ORC=y, please install libelf-dev, libelf-devel or elfutils-libelf-devel".  Stop.

real	0m1.625s
user	0m1.039s
sys	0m0.852s
```

Once that had been resolved, it said `bc: not found` on the next attempt.
Then, I got an error about certificates:

```
$ time make -j12
[...]
make[1]: *** No rule to make target 'debian/certs/test-signing-certs.pem', needed by 'certs/x509_certificate_list'.  Stop.
Makefile:1063: recipe for target 'certs' failed
make: *** [certs] Error 2
```

This was because my `.config` referred to an non-existing file; it exists
inside the Debian-patched kernel tree, but my kernel source was a pristine,
upstream tarball with no Debian-added files present.

I edited my `.config`, removing `CONFIG_SYSTEM_TRUSTED_KEYRING` and
`CONFIG_SYSTEM_TRUSTED_KEYS` and re-ran `make oldconfig` and `make clean`.

After that, it finally worked and I could sit back and relax.

```
$ time make -j12
  LD [M]  sound/usb/snd-usbmidi-lib.ko
  LD [M]  sound/usb/usx2y/snd-usb-us122l.ko
  LD [M]  sound/usb/usx2y/snd-usb-usx2y.ko
  LD [M]  sound/x86/snd-hdmi-lpe-audio.ko
  LD [M]  virt/lib/irqbypass.ko

real	16m14.810s
user	168m15.336s
sys	15m37.348s
```

16 minutes - IIRC, I think it used to take about 6 minutes about 20 years
ago, so the figure right now feels a bit high. The machine used back then
was obviously not as fast as this one (which has a super-nice M2 PCIe SSD
drive), but OTOH the sheer size of the kernel tree has likely grown quite
significantly since then.

Just for the sake of it, I downloaded a kernel from "that era", namely
2.4.10 - released on September 2001.

```
$ ls -lh linux*
-rw-r--r-- 1 per per 22M Jul  8 20:48 linux-2.4.10.tar.bz2
-rw-r--r-- 1 per per 98M Jul  8 07:33 linux-4.17.4.tar.xz
```

So the new kernel tree is approximately _four times_ as large as the old
one, if we assume that `bzip2` and `xz` are equally efficient in
compression (which is likely not entirely true; my guess is that `xz`
produces a somewhat leaner file).

----

Looking closer at the kernel tree where I did the compilation, the total
number of `.o` files (i.e. ELF object files) generated during this
compilation was 15841, and the total compilation time was 16 * 60 + 14 =
974 seconds. That gives me a total of about _16 files_ being compiled per
second on average during this compilation cycle, which is pretty
impressive. So slighly below 1s per file on average, given the "12
parallel jobs" setup - this seems moor than reasonable to me.

So the bottom line: yes, the machines are indeed much, _much_ faster
nowadays, but the Linux kernel has also grown significantly in size since
then, making the compilation still take a bit of time - even more than
before. On the other hand, most of us very seldom _need_ to compile a
custom kernel these days so maybe it doesn't really matter so much.
