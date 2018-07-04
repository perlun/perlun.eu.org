---
layout: post
title:  "Wrestling with Debian GNU/Linux and nVidia"
categories:
- linux
- nvidia
---

I wish I wouldn't have to write this, but: nVidia graphics cards seem to be
a horrible choice for Linux desktops these days. Maybe it's always been
like that, but the issues still remains to a certain degree.

Some might find the above statement to be overly negative, but believe me:
I really don't have any negative prejudice towards nVidia as a company. If
I would, why would I just have spent around 150€ on a GTX 1050 graphics
card produced by them?

With Windows 10, this graphics card worked like a charm. It was a true
plug-and-play experience. I just assembled the machine, installed Windows -
it first used a more low-res setup but once it had downloaded the drivers
(or so I presume), it switched over to a nice, native resolution and _that
was pretty much it_. I really wish GNU/Linux would have such a smooth
installation experience! It's literally "in your face", in a positive sense
of the word. You don't have to go looking for it; it finds you.

Not so with Debian GNU/Linux, unfortunately.

## My Debian experiences with nVidia

Shortly after installing Windows 10, I also installed Debian GNU/Linux on
the same machine. I was planning from beforehand to make this a dualboot setup:

- Windows 10 for casual web surfing, gaming, Microsoft Office, these kind
  of things.
- Linux for my programming hobbies, writing posts for this blog, etc etc.
  I've been a macOS user since 2011 so using a native Unix system feels
  very natural to me and I prefer systems with a great terminal/command
  line experience.

Yes, Windows has improved in that area in recent years (with WSL and all of
that), but I still prefer a Unix-based system. I also find the freedom a
nice aspect. I could choose Ubuntu as another option to Debian, but I
wanted to give Debian a try for real on my machine because I know others
who use it and like it. (Hello Daniel. :smiley:)

Getting Debian GNU/Linux to work with this GTX 1050 was clearly not a
painless experience. After the initial install (which went smooth), I got
an X session but only in 1024x768 (where my old BenQ LCD has a native
resolution of 1680x1050). I tried installing the nVidia binary driver from
[their web site](http://www.nvidia.com/object/unix.html). It was
cumbersome; I didn't get it working OOTB and the README also stated this:

> Note that many Linux distributions provide their own packages of the
> NVIDIA Linux Graphics Driver in the distribution's native package
> management format. This may interact better with the rest of your
> distribution's framework, and you may want to use this rather than
> NVIDIA's official package.

This is actually the case with Debian also. They have an `nvidia-driver`
package that you can use, and [their wiki
page](https://wiki.debian.org/NvidiaGraphicsDrivers) describes how to use
it. However, it was hard and I often ran into the case where all I got on
X.Org startup was a black screen and a _completely frozen system_. I
couldn't even switch to another virtual console! So it was really, really
crashed hard.

I eventually managed to get it working after uninstalling the
[xserver-xorg-video-nouveau](https://packages.debian.org/stretch/xserver-xorg-video-nouveau)
package... That was nice; I could start spending time on _real work_
instead of just wrestling with the machine. I copied over files from my old
machine (a MacBook Pro), started setting up my dotfiles etc.

## Back on black

Then I booted up the Linux system a few days after and _now it was back_ on
the black screen. And a frozen system. Did I uninstall something by
mistake? What on earth had just happened?

I wrestled with the system for a few hours, trying to `apt-get purge
nvidia*` and stuff like that, and reinstalling. I could easily get the
`nouveau`-based X.Org but that was really not enough. I wanted to use my
screen using its native resolution.

I ended up trying to uninstall basically _all packages_ in my whole Debian
system, rendering it unusable and un-bootable. So I had to reinstall it.

But, I didn't want to wipe the root partition completely, since I had
unfortunately already copied in my personal files to it (and deleted them
from the source)

I got an idea: How about removing all folders except the `/home` folder?
That should work, shouldn't it? I did that, and did a clean reinstall on
the partition _without formatting it_ (be careful here!)

I also renamed my `/home/per` folder just to be on the safe side that the
installer wouldn't mess things up.

In the `tasksel` menu, I didn't choose any set of packages. I wanted to go to
Debian `testing` first before installing anything extra. Unfortunately,
things started to mess with me again...

## A new problem: GRUB failing to install

There were troubles with installing GRUB, potentially because there was
already a GRUB installation on my EFI boot drive, or so I presumed.

I got into the GRUB bootup from the old installation, but I didn't get any
menu, only the command line, and booting Linux has become _way_ more
complex than it used to be 15-20 years ago (with `initrd`, modular GRUB,
UEFI etc etc). I re-booted the Debian installer in "Rescue mode", in which
I managed to mount my `/dev/nvme0n1p2` partition and wipe all the old
`debian` folder from it completely. Maybe this would help now.

I managed to get a root shell with my new root file system mounted. But how
do you install GRUB manually on Debian nowadays? I took an easy route and
upgraded to Debian `testing` - I wanted to do so anyway, and I assumed that
this would mean a kernel upgrade => updates to the boot loader which would
"magically" make things work. Perhaps.

This gave me an error:

```
Reading package lists...
Building dependency tree...
Reading state information...
Preconfiguring packages ...
0 upgraded, 0 newly installed, 1 reinstalled, 0 to remove and 0 not upgraded.
Need to get 0 B/55.5 kB of archives.
After this operation, 0 B of additional disk space will be used.
E: Can not write log (Is /dev/pts mounted?) - posix_openpt (19: No such device)
(Reading database ... 22467 files and directories currently installed.)
Preparing to unpack .../grub-efi-amd64_2.02+dfsg1-4_amd64.deb ...
Unpacking grub-efi-amd64 (2.02+dfsg1-4) over (2.02+dfsg1-4) ...
Setting up grub-efi-amd64 (2.02+dfsg1-4) ...
Installing for x86_64-efi platform.
Could not prepare Boot variable: No such file or directory
grub-install: error: efibootmgr failed to register the boot entry: Input/output error.
Failed: grub-install --target=x86_64-efi
WARNING: Bootloader is not properly installed, system may not be bootable
```

I googled this error and found [this StackExchange
post](https://unix.stackexchange.com/questions/379774/grub-installation-failed/379824)

Mounting the `efivarfs` file system led me to this, i.e. the exact same
scenario as in the post.

```
Reading package lists...
Building dependency tree...
Reading state information...
Preconfiguring packages ...
0 upgraded, 0 newly installed, 1 reinstalled, 0 to remove and 0 not upgraded.
Need to get 0 B/55.5 kB of archives.
After this operation, 0 B of additional disk space will be used.
E: Can not write log (Is /dev/pts mounted?) - posix_openpt (19: No such device)
(Reading database ... 22467 files and directories currently installed.)
Preparing to unpack .../grub-efi-amd64_2.02+dfsg1-4_amd64.deb ...
Unpacking grub-efi-amd64 (2.02+dfsg1-4) over (2.02+dfsg1-4) ...
Setting up grub-efi-amd64 (2.02+dfsg1-4) ...
Installing for x86_64-efi platform.
Could not prepare Boot variable: No space left on device
grub-install: error: efibootmgr failed to register the boot entry: Input/output error.
Failed: grub-install --target=x86_64-efi
WARNING: Bootloader is not properly installed, system may not be bootable
```

I deleted the dump files, just as described:

```
# rm /sys/firmware/efi/efivars/dump-*
```

And voila! This time it actually _worked_! How gorgeous.

```
Reading package lists...
Building dependency tree...
Reading state information...
Preconfiguring packages ...
0 upgraded, 0 newly installed, 1 reinstalled, 0 to remove and 0 not upgraded.
Need to get 0 B/55.5 kB of archives.
After this operation, 0 B of additional disk space will be used.
E: Can not write log (Is /dev/pts mounted?) - posix_openpt (19: No such device)
(Reading database ... 22467 files and directories currently installed.)
Preparing to unpack .../grub-efi-amd64_2.02+dfsg1-4_amd64.deb ...
Unpacking grub-efi-amd64 (2.02+dfsg1-4) over (2.02+dfsg1-4) ...
Setting up grub-efi-amd64 (2.02+dfsg1-4) ...
Installing for x86_64-efi platform.
Installation finished. No error reported.
```

Unfortunately, rebooting would _still_ just give me a text console in GRUB.
Not quite nice. I want the nice graphical menu, please! I rebooted into the
rescue system again.

I ran `update-grub` and hoped it would help.

```
Generating grub configuration file ...
Found linux image: /boot/vmlinuz-4.16.0-2-amd64
Found initrd image: /boot/initrd.img-4.16.0-2-amd64
Found linux image: /boot/vmlinuz-4.9.0-3-amd64
Found initrd image: /boot/initrd.img-4.9.0-3-amd64
Found Windows Boot Manager on /dev/nvme0n1p2@/EFI/Microsoft/Boot/bootmgfw.efi
Adding boot menu entry for EFI firmware configuration
done
```

It clearly _looked_ promising. And it had created a `/boot/grub/grub.cfg`
file. Let's reboot (one more time...) and see. (Interestingly enough, the
"Rescue mode" prompt now offered me the choice to "Reinstall GRUB boot
loader". I didn't test it; I wanted to reboot first and see if it worked
already.)

And it did! Hallelujah! Sure, it was a text-mode GRUB (no graphical splash
screen) but still, I can live with that.

## System booted. What next?

I decided to try out [the guide at the Debian
wiki](https://wiki.debian.org/NvidiaGraphicsDrivers#NVIDIA_Proprietary_Driver)
step by step now. I really didn't want to waste any more time on this
meaningless mess.

(I followed the `stretch` steps, even though I was technically now on
`buster`, i.e. the next-to-be Debian release.)

```shell
$ sudo nano /etc/apt/sources.list # Must enable contrib and non-free.
$ sudo apt-get update
$ sudo apt-get install linux-headers-$(uname -r|sed 's/[^-]*-[^-]*-//')
$ sudo apt-get install nvidia-driver
```

(Funny coincidence: while I was running these commands via SSH my _mac_,
i.e. the computer where I'm writing this, started lagging greatly and the
fans started spinning wildly. The machine is currently so slow that it's
barely usable. It's like it's reminding me why I wanted to get rid of this
Mac mess also... :smiley:)

The last command brought in a huge number of packages, including X.Org
server packages etc.

The installation warned me that the conflicting `nouveau` kernel module was
loaded. This should be fine, I'll just reboot the machine afterwards.

And so I did. After rebooting, things looked well - the text mode on the
console was much more low-res, but OTOH the `nouveau` module was gone and
the `nvidia` stuff was there.

```shell
$ lsmod | grep nouv
$ lsmod | grep nvidia
nvidia_drm             45056  0
drm_kms_helper        196608  1 nvidia_drm
drm                   458752  3 nvidia_drm,drm_kms_helper
nvidia_modeset       1110016  1 nvidia_drm
nvidia              14372864  1 nvidia_modeset
ipmi_msghandler        61440  2 nvidia,ipmi_devintf
```

I didn't have any X display manager installed, so I didn't get a graphical
login screen on bootup. I installed `sddm` and started it up:

```shell
$ sudo apt-get install sddm
$ sudo /etc/init.d/sddm start
```

## Triggering a "kernel bug", or nVidia driver bug

Now the interesting things started happening:

- I got a new "black screen of death". Could not switch to any virtual
  consoles or anything.
- But, interestingly enough, _the machine wasn't really dead_. My SSH
  session survived, and even more interesting, it printed out this on the
  console.

```
Message from syslogd@ceres at Jul  4 22:03:04 ...
  kernel:[  263.822142] usercopy: Kernel memory exposure attempt detected
  from SLUB object 'nvidia_stack_cache' (offset 11440, size 3)!
```

I googled and found [this Debian BTS
entry](https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=899201),
indicating that this is an issue that the nVidia developers must solve. It
didn't really tell me about the criticality of the message. Was it the
source of all my pain and agony right now?

I was running this on kernel 4.16.0-2. Maybe it works better on 4.9.0-3?
(which I also have installed)

Before rebooting into 4.9.0, I coincidentally looked at
`/var/log/kern.log`. It was incredibly interesting, since it gave lots more
info about this issue:

```
Jul  4 22:03:03 ceres kernel: [  263.287688] resource sanity check: requesting [mem 0x000c0000-0x000fffff], which spans more than PCI Bus 0000:00 [mem 0x000c0000-0x000dffff window]
Jul  4 22:03:03 ceres kernel: [  263.287988] caller _nv001169rm+0xe3/0x1d0 [nvidia] mapping multiple BARs
Jul  4 22:03:04 ceres kernel: [  263.710494] nvidia-modeset: Allocated GPU:0 (GPU-832b0bbf-217f-e775-512d-49b0829f3811) @ PCI:0000:23:00.0
Jul  4 22:03:04 ceres kernel: [  263.822142] usercopy: Kernel memory exposure attempt detected from SLUB object 'nvidia_stack_cache' (offset 11440, size 3)!
Jul  4 22:03:04 ceres kernel: [  263.822147] ------------[ cut here ]------------
Jul  4 22:03:04 ceres kernel: [  263.822148] kernel BUG at /build/linux-uwVqDp/linux-4.16.16/mm/usercopy.c:100!
Jul  4 22:03:04 ceres kernel: [  263.822153] invalid opcode: 0000 [#1] SMP NOPTI
Jul  4 22:03:04 ceres kernel: [  263.822154] Modules linked in: fuse btrfs zstd_compress zstd_decompress xxhash xor raid6_pq ufs qnx4 hfsplus hfs minix ntfs msdos jfs xfs libcrc32c dm_mod snd_hda_codec_hdmi nls_ascii ses enclosure
 nls_cp437 snd_hda_codec_realtek edac_mce_amd vfat snd_hda_codec_generic sd_mod scsi_transport_sas fat wmi_bmof ppdev sg kvm snd_hda_intel irqbypass crct10dif_pclmul crc32_pclmul snd_hda_codec efi_pstore ghash_clmulni_intel snd_hd
a_core snd_hwdep pcspkr efivars snd_pcm evdev snd_timer sp5100_tco k10temp joydev ccp snd soundcore rng_core shpchp parport_pc wmi parport nvidia_drm(PO) button acpi_cpufreq drm_kms_helper drm nvidia_modeset(PO) nvidia(PO) ipmi_de
vintf ipmi_msghandler efivarfs ip_tables x_tables autofs4 ext4 crc16 mbcache jbd2 crc32c_generic fscrypto ecb hid_logitech_hidpp hid_logitech_dj uas usb_storage
Jul  4 22:03:04 ceres kernel: [  263.822188]  hid_generic usbhid hid crc32c_intel ahci aesni_intel libahci aes_x86_64 xhci_pci crypto_simd libata cryptd glue_helper xhci_hcd i2c_piix4 nvme r8169 usbcore mii scsi_mod usb_common nvm
e_core gpio_amdpt gpio_generic
Jul  4 22:03:04 ceres kernel: [  263.822199] CPU: 6 PID: 6325 Comm: Xorg Tainted: P           O     4.16.0-2-amd64 #1 Debian 4.16.16-2
Jul  4 22:03:04 ceres kernel: [  263.822200] Hardware name: Micro-Star International Co., Ltd. MS-7A34/B350 TOMAHAWK (MS-7A34), BIOS 1.80 09/13/2017
Jul  4 22:03:04 ceres kernel: [  263.822204] RIP: 0010:usercopy_abort+0x69/0x80
Jul  4 22:03:04 ceres kernel: [  263.822205] RSP: 0018:ffffc143cbe97b50 EFLAGS: 00010282
Jul  4 22:03:04 ceres kernel: [  263.822206] RAX: 000000000000006f RBX: 0000000000000003 RCX: 0000000000000000
Jul  4 22:03:04 ceres kernel: [  263.822207] RDX: 0000000000000000 RSI: ffff9d3116796738 RDI: ffff9d3116796738
Jul  4 22:03:04 ceres kernel: [  263.822208] RBP: 0000000000000003 R08: 0000000000000392 R09: 0000000000000004
Jul  4 22:03:04 ceres kernel: [  263.822209] R10: ffffffffa4e77e48 R11: ffffffffa55a8dcd R12: 0000000000000001
Jul  4 22:03:04 ceres kernel: [  263.822210] R13: ffff9d30f32ddcb3 R14: 0000000000000000 R15: ffff9d30f32ddcf8
Jul  4 22:03:04 ceres kernel: [  263.822211] FS:  00007f25402bf6c0(0000) GS:ffff9d3116780000(0000) knlGS:0000000000000000
Jul  4 22:03:04 ceres kernel: [  263.822212] CS:  0010 DS: 0000 ES: 0000 CR0: 0000000080050033
Jul  4 22:03:04 ceres kernel: [  263.822213] CR2: 00007f25385d7010 CR3: 00000001ff494000 CR4: 00000000003406e0
```

I think it's safe to assume that this error being printed here is clearly
related to the issue I am having, with no display manager/X session visible
on the screen. Let's retry the process on 4.9.0 and see what we get there.

## Rebooting with kernel 4.9.0, finding other people with the same problem

Interestingly enough, when I rebooted now I got a graphical splash screen
in GRUB, probably because of some package that got installed along the
`nvidia-driver` etc. packages.

Booting up didn't start the X display manager this time, which is fine and
expected - there is no nvidia kernel module compiled for this kernel, and I
don't even have the kernel header files for it installed. But, around this
time I found [this very interesting
thread](https://devtalk.nvidia.com/default/topic/1036979/linux/-solved-it-cracks-with-kernel-4-16-16-in-debian-/)
in the nVidia forum, where another user describes problems with the
**exact** same kernel/distribution combination - kernel 4.16 on Debian.

I added to my `/etc/default/grub` file the following:

```
GRUB_CMDLINE_LINUX="slab_common.usercopy_fallback=y"
```

Then I ran `sudo update-grub` and rebooted again, this time back into
4.16.0.

And voila! This time it actually _worked_! This is definitely much more of
a _workaround_ than a proper fix, but for me right now, it's totally good
enough.

At this stage I was lazy and just did:

```shell
$ sudo apt-get install gnome gnome-tweaks
```

...to get back into a usable GNOME desktop again. (Remember that my Debian
install was a minimal install with no extra packages installed at this
time.) Sure, it will install many hundreds of packages, many that I don't
really _need_ but OTOH it's the quickest way to get a working desktop
environment up and running in a few minutes.

## Wrapping up and conclusions

This was an interesting one. I started out being really frustrated and
annoyed about this. I literally spent a few hours on this yesterday, and
didn't get _anywhere_. I was frustrated when I got to bed and couldn't wait
to get home from work today to continue to debug this until I had resolved
it...

Now, I understand much more of _why_ this happens which is usually a nice
thing. I've learned/re-learned a lot and gotten back into some "Linux
debugging", getting back into a world I haven't been involved with so much
during the last 10-15 years. Actually writing things down in the blog like
this has also been really helpful, since it forces you to write down all the
steps and it encourages you to _think_ more about various alternatives at
each crossroad along the way.

Another thing that greatly helped was to sit and write this on my Mac
laptop with an SSH session to the machine. That's where I got the "Kernel
memory exposure attempt detected" message in the first place, and it's also
where I understood that the machine hadn't actually crashed completely
- it was just the X.Org driver making the local console unusable.

Would I discourage people from buying nVidia graphics cards if they want
them to be usable on Linux machines? Not necessarily, I did say so when I
spoke to my brother earlier on the phone tonight. But maybe that's taking
it too far.

I think that AMD cards are definitely _easier_ to get going with on Linux
(caveat: I don't have any personal experience of it, but I know people who
have very good experience with them). On the other hand, once it works, the
nVidia cards are known to have great performance, on Linux also.

So maybe the bottom line is more something like this: if you buy nVidia and
want to use it on Linux, don't expect it to be a plug-and-play experience.
More like "plug and pray". :smiley:
