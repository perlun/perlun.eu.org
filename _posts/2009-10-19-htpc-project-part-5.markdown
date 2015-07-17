---
layout: post
status: publish
published: true
title: HTPC project, part 5
author:
  display_name: per
  login: per
  email: per@halleluja.nu
  url: http://per.halelluja.nu
author_login: per
author_email: per@halleluja.nu
author_url: http://per.halelluja.nu
wordpress_id: 107
wordpress_url: http://per.halleluja.nu/?p=107
date: !binary |-
  MjAwOS0xMC0xOSAyMDo1MjowNSArMDMwMA==
date_gmt: !binary |-
  MjAwOS0xMC0xOSAxODo1MjowNSArMDMwMA==
categories:
- GNU/Linux
- HTPC
tags: []
comments: []
---
<p>Just a quickie this time. Of course, I couldn't keep my promise of waiting with this until we move into the house. :-) I looked into it again, and this time, I actually got it working! It seemed to work pretty well now, and MythTV surely makes these IPTV streams more useful.</p>
<p>I've set up an m3u file for myself, you can get it at <a href="http://milou.halleluja.nu/anvia.m3u">this</a> URL. (Please, download it and keep a copy at your own server; don't point your MythTV installation to my URL.) Using these settings, I can get all channels except for channel 8 working. (I'm unsure what that channel is; it doesn't work in VLC either.)</p>
<p>So... there are a few channels missing that could be added, but I don't think I'll care about them now. (I could get their IP addresses using the VLC Mozilla plugin + tcpdump, but... some other day.)</p>
<p>MythTV definitely seems like a promising program, that's for sure. Of course, it might be a bit "too technical" in some senses, and the subtitles did seem to work a bit weird (it was configured to Swedish, but it still didn't put on Swedish subtitles on FST5 automatically?? Anyway, pressing M and chosing Swedish subtitles worked, so that's good), but still... the EPG seems great, and its recording availabilities are awesome. You just select a title you want to record, and you can make the program record that title every time it's being broadcast, on any channel... for example. Just one word: awesome!</p>
<p>Now, all that bugs me is that I want the XMLTV listings in Swedish rather than Finnish... (they are available in Swedish, since www.tv.nu publishes them like that... highly annoying! Maybe I'll have to make myself an XMLTV grabber for the Finnish channels in Swedish, seems like some Christmas holiday project... :) )</p>
