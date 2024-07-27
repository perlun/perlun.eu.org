---
layout: post
title:  "Saying goodbye to an old friend: Decommissioning a Raspberry Pi web server"
categories:
- devops
- geek hobbies
- linux
---

For a good many years, I have been running some of my personal web hosting from a Raspberry Pi in my home. In this post I describe the process of decommissioning this server and the background to why this happened right now. I also share some of the experiences of using a Raspberry Pi as a server this way and my general feelings around it.

## The background: "Why host a server locally in the first place?" and how it all started

I don't know the exact time when I started running a Raspberry Pi as a production web server but I _think_ it was on March 26, 2015. At least, that's the date I mention in [this Swedish-language blog post](https://perlun.eu.org/sv/2015/03/26/bloggen-publicerad).

At this time, I was running it on a Raspberry Pi Model B (first-generation, released in 2012). I had received it as a gift from my kind brother Johannes, and I guess I was trying to find some good use for it. :wink: Also, I was trying out the [Jekyll](http://jekyllrb.com/) blog engine and I needed somewhere to publish the generated static web site.

I already had a VPS (`milou`) at this point, but somehow I wanted to host this on my local server instead of putting it there. We already had a public IP address which I could use (shared with our local LAN), by port-forwarding the HTTP port to the internal LAN address of the Raspberry Pi. HTTPS was not enabled at this point.

Also, the coolness factor of being able to host these things on such a small, low-power device can't really be denied. :sunglasses:

The first web site to be moved to the new infrastructure was my personal blog (the one you're currently reading). It had previously been hosted on `milou` using Wordpress, but I was really not happy with it. Especially the Wordpress control panel was _very_ slow on this VPS with limited resources.

Said and done: I set up the [`nginx`](https://nginx.org) web server, published some content and updated the relevant DNS entry to point at my public IP. The web site http://per.halleluja.nu was now being served from my Raspberry Pi. :tada:

(I didn't yet have the `perlun.eu.org` domain at this time; it was registered a few years later as you'll see below.)

### Hosting milestones

So, a few milestones in the history of this server and blog alike (some of these dates are approximate):

- 2015-03-26: The first Raspberry Pi (`pi`) was taken into production use for `http://per.halleluja.nu`
- 2015-07-18: I [imported some of the old content](https://github.com/perlun/perlun.eu.org/commit/8d5f52739194237bfd9c1e62b933e01081b3c115) from my Wordpress blog
- 2016-12-24: I received yet another Raspberry Pi from my dear brother as a Christmas gift. This time it was a RPi 2.
  - <small>Funnily enough, I gave this machine the host name `pi2`, as it was my second Raspberry Pi (the first one had the host name `pi`).</small>
- 2017-02-23: After having ordered & received a micro SD card etc., I set up the new Raspberry Pi. This is the day when I installed it, according to [`uprecords`](packages.debian.org/uptimed)
  - <small>I'm not exactly sure about the date when I moved the web site from `pi` to this machine; I guess sometime during 2017 or 2018.</small>
- 2017-03-21: The `perlun.eu.org` domain was registered, using this Raspberry Pi as the primary DNS (secondary on `milou`)
  - <small>This was part of a branding change for this blog, which you can read about more in [this article](https://perlun.eu.org/en/2017/03/17/added-english-blog-version).</small>
- 2017-12-22: The hardware where `milou` was being hosted had a disk failure. I think `milou` was unavailable from this date onwards.
- 2018-11-03: Set up another external IP which I received from my ISP. Not yet on `pi2`, but assigned to a PC-based server first (`owl`).
  - <small>Previously, I had been using port forwarding in my home router. This time I put the machine directly on the external network (i.e. straight into one of the Ethernet ports on the fiber optic media converter).</small>
  - <small>I guess one of my ideas with using an extra IP here was to separate things a bit. From a privacy perspective, it feels better to not be able to connect our LAN traffic to the web hosting. It is also better from a security perspective (an intruder would only have access to `owl`, instead of being already "inside" our LAN)</small>
- 2019-05-27: Moved the `owl` server to the internal network instead, freeing the public IP for use by `pi2`.
- 2019-05-28: Moved services previously running on `pi2` to `owl`, preparing for putting `pi2` outside of the local network.
- 2019-05-29: Moved `pi2` to its current IP address (`85.134.56.62`).

In other words, `pi2` had been running with its current configuration for exactly two years before I now started to change it.

Here's what it looks like, by the way:

![Raspberry Pi 2 photo](/images/2021-06-12-saying-goodbye-to-an-old-friend-decommissioning-a-raspberry-pi-web-server.jpg)

## "If it ain't broken, why fix it?"

That's a very good question, well-deserving an answer. There are a couple of reasons actually:

- As time passed, I started growing a bit unhappy about the Raspberry Pi 2 performance. Static web sites are fast, and I've been quite happy about the performance historically. However, I noted some things recently:
  - Deploying things using [Ansible](https://github.com/ansible/ansible) is dog slow for me, especially when iterating over multiple files, uploading `nginx` configuration files or similar. I _think_ this is mainly because of the limited SD card performance in this machine; it would perhaps be much more performant with an SSD disk. Remember this is on a Raspberry Pi 2 though, so [any SSD disk will max out the USB 2.0 bus in this device](https://jamesachambers.com/raspberry-pi-storage-benchmarks-2019-benchmarking-script/). A Pi 4 would be a completely different thing, supporting USB 3.0 speeds. However, I do not own a Raspberry Pi 4 so it would require me to purchase both a new RPi device _and_ a disk.

        I was also thinking about the TTFB (time to first byte) performance. Looking at my [Fastly](https://www.fastly.com) stats for https://perlang.org indicated that cache misses where Fastly's Varnish services needed to go and get upstream content from my `pi2` server seemed to have a quite high latency. Would this be faster if I would move this service to a cloud-based VPS I was already paying for? Maybe, maybe not - it felt like something worth looking into at least.

- Another detail in this - perhaps the _main_ reason - is the fact that my ISP _Bothnia Broadband_ was [acquired by JNT](https://www.jnt.fi/bob/) <small>(sv)</small>. As part of the acquisition, the network is being renewed and our connection as well as all BoB customers' connections are gradually being moved over to the JNT network. This means that we will be moving over from a static IP address to a dynamic IP address. While it is technically _possible_ to host web content on a dynamic IP address (using services like DynDNS or No-IP), it felt less natural to use that approach. Some services like my own DNS servers are also practically not possible to host on dynamic IP addresses.

      While I had an indication about the approximate time for this, the exact date for the switchover had not been given; it was clear that it _would_ be happening. Rather than waiting too long and be _forced_ to act quickly, I started looking into this preventively while there was still time to do this without unnecessary stress. (I hate stress.)

### Timeline of events

Here's a rough timeline of how and when the transition was made. Many of these steps were not in any way _required_ to be performed to get the move accomplished, but some of the things (like creating Ansible roles and adding the existing configuration from `pi2`) simplified things quite significantly.

With this approach, I could make preparations and once I was ready to move a service from one machine to another, I just moved files around in my Ansible inventory and deployed the configuration files to the new server. Very convenient and nice.

- 2020-06-11: [The acquisition of BoB by JNT was announced](https://www.jnt.fi/malax-kommun-overlater-fiberbolag-till-jnt/) <small>(sv)</small>
- 2020-09-15: Received confirmation that JNT will not be able to provide me a static IP any more.
- 2020-11-18: Ordered a cheap cloud-based VPS (`coruscant`) at [Bahnhof](https://bahnhof.se/ftg/server/cloud-vps) <small>(sv)</small>. And yes, it comes with one (1) static IP included in the price. :tada:
- 2021-05-09: Set up Dropbox-based backups of `coruscant` using [Borgbackup](https://borgbackup.readthedocs.io/en/stable/). I've learned my lesson regarding backups the hard way. **Never go live with an important system without having proper backups in place**. You really will regret it, sooner or later.
- 2021-05-28: Started moving over hosted content from `pi2` to `coruscant`. This involved copying over all static content for the web sites as well as all [Perlang builds](https://builds.perlang.org) to the new server. The [libnginx-mod-http-perl](https://packages.debian.org/libnginx-mod-http-perl) module in `nginx` was also enabled, since I use it for one of these sites.
  - <small>Git commit [3aa5bd3c463d70f902ddbeae5260dcd7ff5342f4](https://github.com/perlun/ansible-roles/commit/3aa5bd3c463d70f902ddbeae5260dcd7ff5342f4)</small>
- 2021-05-29: Created an Ansible role for deploying [bind9](https://packages.debian.org/bind9) along with its configuration files (in particular, the zone files, `named.conf.local` and `named.conf.options`). This allowed me to add the existing configuration from `pi2` to my Ansible inventory repo, and then just move its configuration from `pi2` to `coruscant` in the inventory and deploy it there.
  - <small>Git commit [91d441797b7a9234c73bfb372dd547d7b724d222](https://github.com/perlun/ansible-roles/commit/91d441797b7a9234c73bfb372dd547d7b724d222)</small>
- 2021-05-29: Flipped over the DNS entries for `perlun.eu.org`, `www.halleluja.nu` and a few others to point at `coruscant` instead of `pi2`. The `nginx`/web hosting on `coruscant` was now _live_. :tada:
- 2021-05-30: Created an Ansible role for deploying [awstats](https://awstats.sourceforge.io/) and its configuration files.
  - <small>Git commit [b183123383def917c1521d690afbe9ecef467544](https://github.com/perlun/ansible-roles/commit/b183123383def917c1521d690afbe9ecef467544)</small>
- 2021-05-30: Moved the primary DNS for `perlun.eu.org` and `halleluja.nu` from `pi2` to `coruscant`.
  - <small>The secondary DNS hosting was set up with [FreeDNS](https://freedns.afraid.org/) - highly recommended if you are comfortable with [the AXFR approach](https://en.wikipedia.org/wiki/DNS_zone_transfer) to slave DNS:es. (I know some people who prefer the DJ Bernstein/`djbdns` approach. I have never really used it myself; `bind` + AXFR has been perfectly fine for my use cases so I've never bothered learning something else for this.)</small>
- 2021-06-01: Decided to publish the Ansible roles mentioned above in a public Git repo: https://github.com/perlun/ansible-roles
  - <small>The story of extracting these from my previous monorepo is a story in itself, since it involved a bit of creative rewriting of the git history. You can read more about it in [this blog post](https://perlun.eu.org/en/2021/06/02/rewriting-git-history-with-git-filter-branch). The roles are published in the hope that they will be useful as inspiration for other people wanting to get started with Ansible, similar deployment-related tasks etc.</small>
- 2021-06-08: Created an Ansible role for deploying [Prometheus](https://prometheus.io/) and its configuration files.
  - <small>I had an existing Prometheus instance running. I imported the existing configuration to my Ansible inventory and added monitoring of `coruscant` to it.</small>
  - <small>Git commit [1d9e3609cc26dec3b990dc8c2a4c891c26a180db](https://github.com/perlun/ansible-roles/commit/1d9e3609cc26dec3b990dc8c2a4c891c26a180db)</small>
- 2021-06-11: Created a [Grafana Cloud](https://grafana.com/products/cloud/) trial account.
  - <small>I had heard about this being mentioned in a (Changelog, I think) podcast. The "Synthetic Monitoring" feature that they provide lets you measure the latency of your web site from various geographical regions - really nice. I set it up to monitor a couple of websites hosted on `coruscant`.</small>

So, to summarize things:

- The new web server was now live, serving web content using `nginx`.
- DNS hosting was also moved to the new machine, and "glue"/upstream NS records for `perlun.eu.org` and `halleluja.nu` were updated.
- Backups are in place, so I can sleep well at night, knowing that my data is secure. :pray:
- Basic monitoring and alerts are in place, using Prometheus and Alertmanager

In other words, _all is well_ and I'm now prepared to meet the day when I'll loose these static IPs.

> Six years of Raspberry Pi-based hosting (first on` pi`, then on `pi2`) has now come to an end. It feels both good and bad in a way. It's been an interesting journey and quite fun to host this locally, and I must admit the Raspberry Pi has been extremely reliable (for example, no disk failure yet). At the same time, it's interesting to try out the VPS-based approach again. One advantage is that it's not in any way dependent on my local upstream Internet connection, even though it has been very reliable during the years.

I'll now wrap this blog post up by adding some uptime stats for these machines.

## `pi2` statistics

Here are the figures that [`uprecords`](packages.debian.org/uptimed) gives me. We're not talking about 99.9999% SLA or anything like that, but a good 99.9% is perfectly acceptable to me for a "personal web site/personal blog"-oriented web host.

```
     #               Uptime | System                                     Boot up
----------------------------+---------------------------------------------------
     1   283 days, 06:50:57 | Linux 4.4.50-v7+          Tue Oct  3 11:50:02 2017
->   2   222 days, 02:04:31 | Linux 4.9.35-v7+          Thu Nov  5 19:32:58 2020
     3    85 days, 12:00:19 | Linux 4.9.35-v7+          Wed Jan  2 04:13:45 2019
     4    65 days, 05:37:58 | Linux 4.9.35-v7+          Fri Apr  3 08:18:21 2020
     5    61 days, 20:00:19 | Linux 4.4.50-v7+          Wed Aug  2 15:40:52 2017
     6    60 days, 11:00:09 | Linux 4.9.35-v7+          Wed Dec 11 16:18:00 2019
     7    59 days, 20:00:08 | Linux 4.9.35-v7+          Mon Oct  7 19:47:19 2019
     8    58 days, 16:00:11 | Linux 4.9.35-v7+          Mon Jul 20 12:20:08 2020
     9    58 days, 04:00:09 | Linux 4.9.35-v7+          Sun Nov  4 17:09:57 2018
    10    53 days, 04:20:17 | Linux 4.4.50-v7+          Tue Jun  6 06:28:34 2017
----------------------------+---------------------------------------------------
no1 in    61 days, 04:46:27 | at                        Mon Aug 16 03:23:55 2021
    up  1571 days, 18:46:38 | since                     Thu Feb 23 16:52:19 2017
  down     1 day , 09:58:32 | since                     Thu Feb 23 16:52:19 2017
   %up               99.910 | since                     Thu Feb 23 16:52:19 2017
```

## `coruscant` stats

The machine has only been up for about 7 months, so it's not much to brag about yet. The `%up` sure looks good so far:

```
     #               Uptime | System                                     Boot up
----------------------------+---------------------------------------------------
     1   100 days, 09:44:55 | Linux 4.19.0-13-cloud-am  Thu Dec 10 22:55:15 2020
     2    95 days, 14:17:25 | Linux 4.19.0-14-cloud-am  Sun Mar 21 08:40:21 2021
     3    22 days, 02:15:22 | Linux 4.19.0-12-cloud-am  Wed Nov 18 20:39:42 2020
->   4     0 days, 00:03:41 | Linux 4.19.0-17-cloud-am  Thu Jun 24 23:57:57 2021
----------------------------+---------------------------------------------------
1up in    22 days, 02:11:42 | at                        Sat Jul 17 02:13:20 2021
no1 in   100 days, 09:41:15 | at                        Sun Oct  3 09:42:53 2021
    up   218 days, 02:21:23 | since                     Wed Nov 18 20:39:42 2020
  down     0 days, 00:00:33 | since                     Wed Nov 18 20:39:42 2020
   %up              100.000 | since                     Wed Nov 18 20:39:42 2020
```

### Sites affected by this move

- https://perlun.eu.org (this blog)
- https://www.halleluja.nu
- https://perlang.org (not the actual user-facing web site but the upstream server behind the Fastly CDN)
- https://builds.perlang.org (likewise)
- https://www.chaosdev.io (only a redirect to https://chaosdev.io, which is hosted on GitHub Pages)
