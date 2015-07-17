---
layout: post
status: publish
published: true
title: HTPC Project, Part 3
author:
  display_name: per
  login: per
  email: per@halleluja.nu
  url: http://per.halelluja.nu
author_login: per
author_email: per@halleluja.nu
author_url: http://per.halelluja.nu
wordpress_id: 95
wordpress_url: http://per.halleluja.nu/?p=95
date: !binary |-
  MjAwOS0xMC0xOCAyMDozNjoxNiArMDMwMA==
date_gmt: !binary |-
  MjAwOS0xMC0xOCAxODozNjoxNiArMDMwMA==
categories:
- GNU/Linux
- HTPC
tags: []
comments: []
---
<p>I found an interesting "HOWTO"-like document here: <a href="http://www.mythtv.org/wiki/Installing_MythTV_on_Debian_Etch">Installing MythTV on Debian Etch</a>. I can recommend this HOWTO to anyone else interested in getting MythTV set up.</p>

<p>I started off installing mysql-server, as requested. As we all know, this is very convenient and nice with Debian (and its derivatives); you just apt-get install it and get a working configuration set up for you, just like that. In the installation, I was asked which MySQL root password I wanted to use. I chose a good password I use somewhere else (like we all tend to do...).</p>
<p>I installed ALSA, the way I was instructed to. I set the volume, using the alsamixer tool (the old "aumix" tool I've used previously doesn't seem to work too well with ALSA). Now, how do you test the sound card in text mode? Well, I installed bplay first, but it also seemed to rely on OSS, so I used mpg123 and downloaded an mp3 file from a Windows machine in our network, and tried playing it. At first it wasn't hearable, but it was just the volume that was too low. :-)</p>
<p>OK, now I'm ready to install X.Org. This is interesting: I already spent some time getting the intelfb driver to work (which it didn't), so if MythTV uses X11 (rather than directfb), this is probably a positive thing from my perspective.</p>
<p>When installing X11, you have to choose which kind of environment you want to use. The HOWTO recommended Fluxbox; I was considering GNOME. But, interesting enough, the Debian gnome package is HUGE; it will use<br />
1,6 gigs (!) of disk space. This is because we're talking about a full GNOME environment here, including lots of stuff that will be completely irrelevant on my HTPC. Fluxbox OTOH will only consume a little more than<br />
100 megs of disk space. The choice is easy: we try with the Fluxbox route.</p>
<p>It was a similar thing when installing a terminal emulator. I'm used to gnome-terminal, but because I didn't have very many other GNOME-related things, it would be above 150 megs to install it. I chose a smaller program called "mrxvt" instead, which seems to work fairly OK so far. (It looks ugly, but at least the keyboard shortcuts seem to be intuitive. :-) )</p>
<p>What about Firefox? Well... not strictly <em>needed</em> but it will let me read the rest of the HOWTO in a graphical web browser rather than Lynx. :-) Besides, you might want to have a real web browser on an HTPC anyway, to be able to stream flash-based web-TV (SVT Play). So, installing it can be said to be reasonable.</p>
<p>Argh! I just found out (after starting Firefox and playing around) that "tap-to-click" is enabled in X.Org. Annoying, let's get rid of it ASAP. (Remember, this is a laptop I'm playing around with so far.)</p>
<p>Let's hope "Option "MaxTapTime" "0"" does the trick.</p>
<p>Actually, it didn't. This problem seemed to be much harder to fix than it ought to be. Anyway, what I did was connect a "real" mouse instead which works better... ;-)</p>
<p>One initial impression is that this Debian installation is very fast and responsive, so far. My other Debian install was also fast, even though I had a full GNOME setup in that one.</p>
<p>I went on to add the Debian-Multimedia repositories to my /etc/apt/sources.list and installed mythtv, along with all the packages listed as "recommended" by the mythtv package. This took a few minutes, of which some was the download time. (I have an 8 Mbit/s ADSL connection.)</p>
<p>Alright, time to start the mythtv-setup program! Exciting, I wonder if I'll get this working this evening or some other evening? (I changed the password of the mythtv user before doing this; the mythtv-setup has to be run as the mythtv user.)</p>
<p>The setup program is a pretty nice-looking, graphical program. Its startup screen looks like this:</p>
<p><img class="alignnone size-full wp-image-97" title="mythtv_setup" src="http://per.halleluja.nu/wp-content/uploads/2009/10/mythtv_setup.jpg" alt="mythtv_setup" width="768" height="480" /></p>
<p>(The language I've chosen is Swedish, if someone wonders.)</p>
<p>After fiddling with it for a while, I managed to get the mythfilldatabase to fill the EPG database with data from an XMLTV source we have here in Finland. But... when trying to watch some TV with the mythfrontend application, absolutely nothing. Whenever I choose the "Watch TV" option, the screen blanks and I get back to the start menu. No error message, no nothing. I'll have to look into this some other day to see what it can be that prevents it from working correctly...</p>
