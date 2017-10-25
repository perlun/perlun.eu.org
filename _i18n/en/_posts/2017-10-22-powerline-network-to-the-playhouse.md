---
layout: post
title:  "Powerline network to the playhouse"
categories:
- networking
- geek hobbies
---

Since a while ago, we have a kid playhouse in the garden, and since my children are getting quite old it's obvious that the playhouse also (like the main house) needs decent network connectivity. To solve this problem, I've tried two approaches:

- First, I tried moving the WiFi transmitter closer to the playhouse. That _worked_, but had the downside that it was pretty close to one of the children's beds. And given that I'm not fully convinced that wireless signals are harmless, I felt that was a bad thing; I want to avoid it, if at all possible.

- The next step was to try out [_powerline networking_](https://en.wikipedia.org/wiki/Power-line_communication). It's a fairly new technology (well, new in mainstream usage at least) and I haven't previously used it, and learning new things is usually a fun thing, so... here we go!

I decided to buy the TP-Link TL-WPA4220KIT set for this purpose. Here is what it looked like straight in the box:

![Unboxing #1](/images/2017-10-22-powerline-network-to-the-playhouse-unboxing-1.jpg)

Opening the box gives you this:

![Unboxing #1](/images/2017-10-22-powerline-network-to-the-playhouse-unboxing-2.jpg)

Alright, I read some of the quick starting manual etc, and after a while I plugged it in. I was a bit unsure about which lights were expected to be green, even though I had read it in the instructions. Then I pressed the pair buttons and it _seemed_ to work. I could also connect to the WiFi (as of yet, the wifi adapter still in the same room as the "transmitter" connected to the upstream router.) The WiFi used the default SSID etc, as provided in the docs with the hardware.

I then tried to find the management interface, which wasn't that easy. I made the wild assumption that the WiFi device was on 192.168.1.1, but surprising enough, that was the upstream (existing) router. I remembered having read the address somewhere but couldn't find it now. Eventually, I found it, and it turned out to be http://tplinkplclogin.net/

After doing this, I wanted to try it out for real and moved the WiFi device out to the playhouse. Plugged it in, worked flawlessly (sorry for the bad photo here - the LEDs are power, powerline connected and WiFi):

![Plugged in](/images/2017-10-22-powerline-network-to-the-playhouse-plugged-in.jpg)

Here is what the admin interface looks like:

![Admin interface](/images/2017-10-22-powerline-network-to-the-playhouse-admin-interface.png)

I then tested doing a Google search, worked fine. I also tried playing a YouTube video which also seemed to work flawlessly.

Now I reconfigured the WiFi to use the same password and security settings as the regular network, to be able to use this as a separate access point but to be able to "roam" freely among the access points. (i.e. when moving the computer outdoors, it will jump automatically on to that wireless access point.)

The speed test showed that it was _decent_, but nowhere near the 100 Mbit that would be theoretically possible given my Internet connection:

![Speedtest from the playhouse](/images/2017-10-22-powerline-network-to-the-playhouse-speedtest-playhouse.png)

Some annoying details noted so far:

- As already mentioned, the web interface was hard to locate, but it turned out it _did_ exist; it was "just me". It wouldn't have hurt to have the URL printed in the manual though, I looked there but couldn't find it which seems to be a bit strange. It turned out the address was printed on the actual device, and only there.

- I haven't yet found any way to _see_ the powerline statistics. This feels bad. It's "green", indicating that the signal from the other end is reasonable, but what does that mean? I tried moving it to another outlet, and the speed test was roughly the same:

![Speedtest from the garage](/images/2017-10-22-powerline-network-to-the-playhouse-speedtest-garage.png)

I then moved it very close to the transmitter which gave me this:

![Speedtest very close to the transmitter](
/images/2017-10-22-powerline-network-to-the-playhouse-veryclose.png)

Now this is interesting! The results are actually _much worse_ here. That's not really very strange at all in fact, since I now plugged the "receiver" (Powerline + WiFi) very close to some of the utility equipment heating up the house etc., likely with a lot of electrical interference. I think I'll move both the _transmitter_ and _receiver_ now to different outlets, to see what the "practical maximum" we can get with this equipment actually is.

Said and done, here are the results. Both the transmitter and receiver were in the hosue during this test:

![Speedtest with both transmitter and receiver inside house](
/images/2017-10-22-powerline-network-to-the-playhouse-in-house.png)

This is in fact a lot better than before. Quite decent for a powerline connection IMHO.

We're close to wrapping up, but before we close, let's try one final test. How about letting the _transmitter_ be where it is now (inside the house, not in the "utility room" with all that interference), and the _receiver_ be in the playhouse - what will it give us? Let's try and see!

![Speedtest with transmitter in house, receiver in playhouse](/images/2017-10-22-powerline-network-to-the-playhouse-final-connection.png)

Looks good, even better than the first way I wired up the connection. I think I'll leave it like this (well, I'll unplug it for now since the device isn't really designed for below-freezing temperatures and winter is unfortunately coming in this part of the world right now...)

I decided to make _one_ more test, this time with cable (which was a bit annoying since my work MacBook Pro doesn't have any built-in Ethernet, so I had to locate my dongle and take it with me home etc... shame on you, Apple. :smile:)

![Speedtest again, with cable](/images/2017-10-22-powerline-network-to-the-playhouse-with-cable.png)

Somewhat higher on the download rates now. Remember, this is now out in the playhouse again so the cable length affects it a bit.

## TP-link utility software

Regarding seeing the actual link-speed over the powerline network, there is a utility software called `tpPLC` which claims to be able to configure the TP-link devices, but I was not able to get it working properly. Even when ensuring that my Mac was connected to the right device (by looking at the BSSID MAC address), it would still just give me this:

![TP-link utility, not working](/images/2017-10-22-powerline-network-to-the-playhouse-utility.png)

Odd indeed. Maybe it just works over wired connections? Let's try, now that I have it wired up anyway:

![TP-link utility, working this time](/images/2017-10-22-powerline-network-to-the-playhouse-utility-working.png)

56 Mbit - that's aceptable, given that the cable lengths are perhaps... 30 meters or something in this case (wild guess, it's not really easy to measure.) And the electrical circuits _might_ be different; they are all wired up through the same electricity meter though. I think you get best results if all devices are on the same circuit, connected to the same main fuse.

---

Btw, speaking about the speed tests, here is what it shows back on the "regular" WiFi network inside my house, when sitting just a few meters from the WiFi router:

![Speedtest using main WiFi](/images/2017-10-22-powerline-network-to-the-playhouse-speedtest-main-wifi.png)

Pretty okay for a wireless network, over a 100 Mbit connection upstream.

## Conclusion

I think powerline networking is here to stay. The technology is a neat choice when the option of putting "real" Ethernet cables into the building simply isn't a really viable option. Being able to utilize existing power cabling not only for power supply but for networking is very convenient indeed.

The equipment I use works fine for my use case - home use, no real "high-bandwidth" operations via the powerline network. Being able to stream YouTube videos at a few megabit/s, perhaps play a few simpler online games etc, downloading apps - for such scenarios, the equipment I've chosen seems to work well.

It was also very much a "plug and play" experience, it was just a matter of plugging it in if you were fine with the default settings (but remember to press the pair buttons to enable encryption!) Since I wanted to use a different SSID and WPA2 key, and my home router didn't support WPS, I had to do some manual setup for that, but I'm completely fine with that; it's a bit of an edge case anyway.

If I would sit and work using the powerline network all day long, I might have opted for some more high-performance, business-oriented option. TP-Link has a version which runs up to 1000 Mbit/s over the powerline, and other manufacturers also have options. I went with a kit that had the WiFi built-in, which is convenient to avoid having to have both a powerline receiver _and_ a WiFi access point in the playhouse. It's possible that there are other approaches that could give a higher throughput, if you're willing to sacrifice that point.

I am overall happy with the equipment that I bought; it was reasonably priced ([70€ including shipping](https://www.webhallen.com/fi-fi/verkko_ja_smart_home/178679-tp-link_tl-wpa4220kit-av500-n300-2-pack&atcl=search:live:2)) and seems to do the job fairly well. Over and out for now!
