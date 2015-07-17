---
layout: post
status: publish
published: true
title: HTPC Project, part 4
author:
  display_name: per
  login: per
  email: per@halleluja.nu
  url: http://per.halelluja.nu
author_login: per
author_email: per@halleluja.nu
author_url: http://per.halelluja.nu
wordpress_id: 104
wordpress_url: http://per.halleluja.nu/?p=104
date: !binary |-
  MjAwOS0xMC0xOCAyMToxOTozNCArMDMwMA==
date_gmt: !binary |-
  MjAwOS0xMC0xOCAxOToxOTozNCArMDMwMA==
categories:
- GNU/Linux
- HTPC
tags: []
comments: []
---
<p>I found a quite interesting page <a href="http://avenard.com/iptv/MythTV.html">here</a> about IPTV and MythTV.</p>
<p>This document describes all the steps you need to take to get an IPTV-based provider added to MythTV. There are quite a few steps involved actually, more than what you might think.</p>
<p>At first, I tried hosting the m3u in a local folder. This did not work. But: the good part is that I have an Apache server set up (on a Windows machine, actually) where I could place the file. By putting it there, it worked better: it complained about how the m3u looked. I compared it to the file provided by avenard.com, and found an error. The error was corrected, but it still didn't work; mythtv-setup just crashed in the face of me.</p>
<p>What I did then was adding -v 10 and then -v 100 to mythtv-setup. With the last setting, it actually started working (!). Very weird. The channel list was fetched, and the channels was added to MythTV.</p>
<p>The problem now is that when I try to watch TV, it doesn't get any contact with these rtp streams. I don't know if the syntax in the m3u file is correct (I've tried "rtp://233.60.167.1:1111" and this doesn't seem to work too well). I'll ned to RTFM, I think...</p>
<p>It might be that you should specify it like udp://233.60.167.1:1111?multicast instead, according to <a href="http://www.gossamer-threads.com/lists/mythtv/users/313469">this link</a>. Right now though, I can't even play the channel in VLC which means that the preconditions are not optimal. :-)</p>
<p>I think I'll just stall the project for some time now, until we've moved in to our new house and I have a real ethernet connection into my computer. I'm on WLAN now and it might not be optimal for these kind of elaborations.</p>
