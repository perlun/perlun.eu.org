---
layout: post
status: publish
published: true
title: HTPC Project, Part 1
author:
  display_name: per
  login: per
  email: per@halleluja.nu
  url: http://per.halelluja.nu
author_login: per
author_email: per@halleluja.nu
author_url: http://per.halelluja.nu
wordpress_id: 84
wordpress_url: http://per.halleluja.nu/?p=84
date: !binary |-
  MjAwOS0xMC0xNiAyMToyOTo1NSArMDMwMA==
date_gmt: !binary |-
  MjAwOS0xMC0xNiAxOToyOTo1NSArMDMwMA==
categories:
- GNU/Linux
- HTPC
tags: []
comments: []
---
<p>Hi,</p>
<p>This is my first posting in a series about my new HTPC, which I aim to construct and use for my family's home entertainment needs. Currently, I'm downloading the ISO of <a href="http://www.debian.org">Debian</a> 5.0.3, which means I can take some time to elaborate on the "hows, whys and whats" of this project.</p>
<p>We start with the "whys". Why build an HTPC, hasn't everyone done this already?</p>

<p>Well, I haven't, so why not? We all need some interesting &amp; fun sparetime project to work on, don't we? Besides, we have some clear needs (I'm tempted to call them "business needs", but hey - this is a private project, not a work thing after all...).</p>
<p>We currently have a setup that looks like this:</p>
<ul>
<li>A CRT TV (28", 4:3) with analogue TV receiver.</li>
<li>An STB (Set-Top Box) for DVB-C (digital cable TV used here in Finland and all of the rest of Europe).</li>
<li>An STB for DVB-S (digital satellite broadcasts), and a satellite dish with 2 LNBs directed to Sirius 4.8°E and Thor 0.8°W.</li>
<li>A recordable DVD player with a 160 GiB HDD (with analogue TV receiver).</li>
</ul>
<p>Through the outlet in the wall, we receive a quite good mix of Swedish and Finnish TV channels (we definitely watch the Swedish channels much more than the Finnish, since neither one of us understands Finnish well enough to watch Finnish programs), both in analogue form and digital. Through the satellite dish, we receive the Swedish channels once again (so we have an "overlap" reception of some of the channels), as well as some very good FTA Christian channels.</p>
<p>(These FTA Christian channels are a must when we plan the future of our home entertainment, which you will notice further down in this text.)</p>
<p>This leads us to a living room with 1 TV and 3 different boxes, giving us a total of 4 remote controls. Needless to mention, we still only have 2 hands. If we want to record a program from one of the STBs, we need to use 3 different remote controls (!). One for the TV, one for the STB, one for the DVD player. Not convenient at all, of course.</p>
<p>Thus, the "one-remote-to-rule-them-all" idea was born. Of course, we will need <em>two</em> remote controls - one for the TV, and one for the HTPC. This is still much better than the current situation.</p>
<p>Another problem with the current situation is that we cannot even plug all the boxes in at the same time. The DVD player only has 2 SCART outlets. One is used for the DVB-<strong>S </strong>STB, the other one is plugged in to the TV. This means that if we would want to record something from the DVB-<strong>C </strong>STB, we would have to make sure that the TV is turned on, to let the signal "pass through" to the DVD player.</p>
<p>Now... something more to take into consideration is that we are currently building ourselves a house. Getting a cable TV connection to the house is pretty expensive; almost 900€. This doesn't feel like too much of a forward-looking solution. After all, fiber connectivity will come sooner or later. It might take 5 or 10 years, but it will come, so paying 900€ for something that will only last for a couple of years doesn't feel like a long-term solution. (We would possibly get some discount on the fiber if we already have the cable, but still...)</p>
<p>So, I've started the investigation for alternative solutions to our TV viewing. Let's forget the HTPC for a while and just think about this, because it's kind of the fundamental thing: <em>how do we get the TV signal into our TV</em>?</p>
<p>There are basically three different options:</p>
<ol>
<li><a href="http://www.anvia.fi">Anvia's</a> Svea TV option. This is a DVB-T-based solution (e.g. regular terrestrial television).<br />
<strong><br />
Pros: </strong>legal option, gives me 5 of the basic Swedish TV channels.<br />
<strong>Cons</strong>: requires me to buy a new terrestrial antenna, doesn't include the Christian FTA channels, quite expensive per-month fee.</li>
<li>Anvia's IPTV option. In the area where we live, Anvia doesn't provide DVB-C. There is only the local cable TV company, which cost about 900€ (mentioned above). But: Anvia do offer an IPTV-based solution, via ADSL.
<p><strong>Pros:</strong> legal option, less expensive than Svea TV. Also gives to opportunity to buy some additional channels (like Kanal 10, one of the Christian FTA channels mentioned before), uses existing infrastructure that we are already paying for (we have 8 Mbit ADSL at the moment, so the additional cost for the IPTV is pretty small).</p>
<p><strong>Cons</strong>: too much of a "locked in" solution. I can only use the provider's own STB; there is no PCI-based solution for example, that lets me use this solution in an HTPC. It also doesn't include the Christian FTA channels (well, some of them are available but as "pay" channels).</li>
<li>And finally, the option I've decided to go for: Viasat's "<a href="http://www.viasat.se/svt">SVT Package</a>". This package is one of their best kept secrets. If you look at it, you can even get the impression that they don't <em>want</em> you to find out about this. You're right: they don't. Of course, Viasat (just like Canal Digital for that matter) of course prefers to have you order one of their "pay" packages, where they get a greater benefit than they get when you use one of the "free", minimal packages.
<p><strong> </strong><strong>Pros</strong>: DVB-S-based; I can get all the Christian FTA channels I want from the same satellite where I'll get the regular Swedish SVT channels (or the other satellite my dish is pointed towards). More open and flexible solution than the IPTV-based solution (i.e. possible to use in an HTPC).</p>
<p><strong>Cons</strong>: not 100% legal in the country where I live. Of course, the problem is not with the reception but rather with the subscription. Viasat's SVT package is only available from within the borders of Sweden; I'll get it by using a Swedish care-of address. <span style="text-decoration: underline;">But</span> what I'll also do, is that I'll order the channel package from Anvia (without getting the IPTV box or the IPTV subscription), so I'll pay for SVT + TV4 anyway. That way, I will have a moral (but maybe not strictly 100% legal) right to receive the channels. :-)</li>
</ol>
<p>The only channels I'll get "for free" with this is TV6 and Kanal 7, but I'm only watching TV6 during the ice hockey world championships (and I'm "kind-of" paying for the channel to Viasat anyway... and it's an advertisment-funded channel anyway...).</p>
<p>Well, it's not strictly legal, but for the channels we watch regularly (SVT and TV4), I argue that we have the moral right on our side (since we're paying for the channels anyway).</p>
<p>How about the Finnish channels then? The good thing about them is that they are being broadcast <em>freely</em> (as in "free non-alcoholic beer") through the Anvia ADSL service. Getting them into the HTPC should definitely be possible.</p>
<p>So... my choice is the DVB-S-based solution + free IPTV for the Finnish channels. What about the rest of the reaons for the HTPC then? Well, one of the things I want to be able to do is to <em>record</em> programs for later viewing. We can do this now, but it's far from simple (because of the 4 remote controls and plethora of STBs/etc). Having all the TV channels in one single HTPC will simplify this, of course.</p>
<p>Something else we want to do is to watch <em>downloaded</em> programs. Yes, it happens that we download TV series, for example if we've missed one episode. This can be seen as "fair use"/"peer sharing", if we're talking about a channel that is included in our subscription anyway. (yeah, I know the TV BitTorrent publishers remove the advertisments... it's a shame, don't blame me... But really, if I would have had a friend record a program, they could have removed them afterwards as well...)</p>
<p>Finally, something that we want to support is <em>streaming</em> of programs. Sports events (Malmö Redhakws games, for example :-) ) or movies (SF Anytime). Now, here is where we're getting into problems.</p>
<p>You see, I'm thinking about building a Linux-based solution for this, maybe with <a href="http://www.mythtv.org">MythTV</a>. The only problem is that SF Anytime and Viasat OnDemand only streams their programs using Windows Media Player technology, which doesn't work so well on Linux. SVT Play is better, since they use Flash (which is supported on Linux). On the other hand, buying a Windows Media Center (or similar) license just to be able to stream seems a bit expensive. Besides, I like the Linux solution, it's more geeky and cool. :-)</p>
<p>So, my download is finished by now, and Debian is on a CD. This became a <strong>long</strong> blog posting, it took quite some time to write... I'll go ahead in a future posting and describe my ideas for the hardware in this HTPC. The Debian installation I will do now (maybe tomorrow since time is so late already) is on my laptop, for testing out MythTV and see how well it works with the free IPTV I mentioned above. I've heard that MythTV is slow in the channel switching because of how it records <em>all</em> programs you're watching automatically. Time will tell if this is indeed a problem.</p>
<p>En guldstjärna till alla som orkade läsa ända hit. :-)</p>
