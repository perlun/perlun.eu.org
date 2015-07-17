---
layout: post
status: publish
published: true
title: HTPC Project, Part 2
author:
  display_name: per
  login: per
  email: per@halleluja.nu
  url: http://per.halelluja.nu
author_login: per
author_email: per@halleluja.nu
author_url: http://per.halelluja.nu
wordpress_id: 88
wordpress_url: http://per.halleluja.nu/?p=88
date: !binary |-
  MjAwOS0xMC0xOCAyMDoxMzoyMCArMDMwMA==
date_gmt: !binary |-
  MjAwOS0xMC0xOCAxODoxMzoyMCArMDMwMA==
categories:
- GNU/Linux
- HTPC
tags: []
comments: []
---
<p>(Warning: this posting doesn't really talk very much about the HTPC project per se; it is more of a general posting regarding the Linux installation and my specific situation with previous partitions causing some issues. If you're only interested about the HTPC project, skip this posting and go straight to part 3 where I'll start installing MythTV.)</p>
<p>So, after installation, this beautiful "Debian GNU/Linux 5.0 nx7400 tty1" prompt approached me. The installation was smooth; I downloaded the CD1 ISO for Debian 5.0.2 (Lenny), burned it using Imgburn (a free Windows application for burning ISO images to CD/DVD) and started the Windows-based (!) installation program. The installation then proceeded in the Linux-based environment after a few initial questions.</p>
<p>Something really convenient these days is that the Debian installer includes a nice program called ntfsresize, which lets you resize an NTFS partition very easily. You basically just tell it how big you want the remaining NTFS partition to be, and it starts working on the resize. In my experience (two times on this same machine), it works really well.</p>
<p>The NTFS resize was actually my main reason for doing the install in the first place. You see, I already had a working Debian installation on the machine, but its partition was becoming too small, so I had to downsize my Windows partition to get some more space for my Linux stuff. So, actually, I wouldn't have to install a fresh install (I could have aborted it after the NTFS resizing), but nevertheless I did.</p>
<p>The installation went just fine. One advantage of the ISO-based install is that is it doesn't (unlike the netinst) require you to have network connectivity in the actual installer. I am on an 802.11bg-based WLAN now, using WPA2, so it is a bit tricky to get it working with the installer (if it works at all). By using the ISO, I worked around this difficulty and will solve it now when the system is actually installed instead (by copying over the config from my previous installation).</p>
<p>I chose to install Debian GNU/Linux on an XFS partition this time, just like the last time. After some more consideration though, I think I'll install it on a regular ext3 partition on the "real" HTPC machine. XFS, just like other special ways of handling file systems (LVM) do have their advantage, I guess, but... they also have their disadvantages. For example, consider LVM. It might be nice when it works, but what about when it don't work (for example when the hard drive fails...)? It's much harder (or, I'd say, impossible) to try and mount an LVM ext3 volume on a Windows XP machine. Yes, there is an ext2 IFS (that should handle ext3 as well), but I doubt that it would work with an LVM volume.</p>
<p>So, I think I'll go with a plain "vanilla" ext3 volume on the "production" machine. Or actually two volumes: one for the system + applications, and one for the storage (keeping all recorded TV programs).</p>
<p>Now, I have done some minor tweaking to the setup: added a non-privileged user account, installed sudo, set this user up as a sudoer. I was just about to try to mount the Linux partition to try to copy the WLAN config over (to get network connectivity), but when I started cfdisk to look the partition name up, it gave me an evil error message like this:</p>
<p>FATAL ERROR: Bad logical partition 7: enlarged logical partitions overlap<br />
Press any key to exit cfdisk</p>
<p>This doesn't sound so good. One problem I know of is that the partitions doesn't come in the proper order: when I resized the NTFS partition, there was a "free hole" before partition 5 and 6, but when I created a logical partition there, it become partition number 7. The problem might be related to this, but... the error message from cfdisk doesn't really say that this is /exactly/ the problem.</p>
<p>Maybe it would be easiest to just get the data out that I want to keep from partitions 5-7 and then recreate them from scratch, in the proper order... I wonder if there's a different way to solve this?</p>
<p>Another problem is that I'm missing some packages: firmware-ipw3945, ipw3945-modules-2.6.18-6-amd64 (I guess I'd need a 2.6.26 version instead) and ipw3945d. These packages control the Intel Pro Wireless<br />
3945 chip in the machine, and without them it is hard to get the wireless LAN to work.</p>
<p>Maybe I'll just reboot into my Windows partition and download these files there...</p>
<p>[After fixing it]</p>
<p>It turned out the only package needed nowadays to get this going was the firmware-iwlwifi package. I downloaded this package on Windows, but still couldn't get it going (even after copying the identical<br />
configuration I had on my other Linux partition). But... it started working when I used tasksel and chose to install the "Laptop" software. This software included the wpasupplicant package, which seemed to be the missing link to get this going. (It seems like wpasupplicant installs certain "hooks" into the system that gets run when certain keywords are being configured in /etc/network/interfaces.)</p>
<p>So... here I am now, with a working "minimal" system and working networking. I don't have any GNOME installed; maybe I should get that set up to more easily access this blog and so forth (or, even better, see if there is a Firefox for framebuffer package available somewhere...).</p>
<p>Time to get started with the MythTV setup and all of that! This will be covered in the next blog posting.</p>
