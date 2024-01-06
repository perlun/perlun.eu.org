## Programming

It should come as no big surprise if you've been reading this blog that a big
passion in my life is _programming_. It has been a hobby of mine since sometime
in the nineties (probably 1994, 95 or somewhere around this - my oldest "proof"
of something I wrote is the small BBS intro `flower.com` which is dated
September 1996) and my primary way to make my living since 1999, apart from a
few years in the 2000s when I was working as a Support Technician.

During the years since I started programming, I've produced a number of different
projects on my spare
time, of various size and grade of "seriosity". Here is a list of some of these
projects. I'm hoping to add more links to this list over time, adding binaries
and sometimes the source code (in the cases where it hasn't gotten lost over the
years.) Many have been solo projects, others have been cooperative projects with
my brother Johannes Ridderstedt, who has been an _invaluable_ source of
help and inspiration when learning about computer hardware, software and
programming. This list wouldn't be what it is without him - _thanks bro_,
I owe you a lot! :heart:

<!--

  Note to self: to get git logs for a full year for a repo, use this command:

  git log --since "JAN 1 2019" --until "DEC 31 2019" --pretty=format:"%h %an %ad"

  -->

* 1996: flower.com (BBS intro, written in x86 assembly for MS-DOS.)
* 1997: [Gameland intro](gameland) (original probably in C, for MS-DOS. See
  further down for intro about the later rewrite.
* 1998: rot13 TSR (x86 assembly for MS-DOS)
* 1999: Cybermario, an unfinished Mario-spinoff game (C++ for MS-DOS)
* 1999: Tribes, an unfinished Civilization clone (C, targetting GTK/Linux)
* 1999: [chaos](http://chaosdev.io), an operating system (C & x86 assembly)
* 2000: `autochaos`, a build-tool for generating `Makefile`s for building chaos.
  autoconf & automake-replacement better suited for our needs. (Perl)
* 2004: iZ, a CMS written using PHP & MySQL
* 2007: Imported the chaos code to CVS, did some minor hacking. The most
  interesting part was that I actually got the `ne2000` server working here to
  the point of being able to ping the chaos host from another computer. :)

    Full list of commits for the year is
  [here](https://github.com/chaos4ever/chaos/compare/ed8663f13ffe254bfa4ce40758f2a53fd178d59f...98fbb5c).
* 2008: [cocos](https://github.com/perlun/cocos), a simple operating system-like
  toy for x86-64\. (C & x86 assembly)
* 2008: Spent some minor work on chaos, trying to get the system compilable with
  gcc-4.1, and making it possible to cross-compile from macOS. I eventually
  discarded this approach and set up a proper dev environment with
  [Vagrant](https://www.vagrantup.com/) instead.

    Full list of commits for the year is
  [here](https://github.com/chaos4ever/chaos/compare/98fbb5c...997d50b).
* 2013: [Billigaste Matkassen](https://github.com/perlun/billigastematkassen), a
  shopping price analyzing helper. Web app written using JavaScript & jQuery
  with backend in Ruby, using Redis as data store.
* 2013: Imported the chaos source code to
  [GitHub](https://github.com/chaos4ever/chaos) and started working on some
  general cleanups, like removing GPL copyright file headers, changing from C to
  C++ comment-style and working towards making the system buildable with
  [Rake](https://github.com/ruby/rake), eventually replacing our own `autochaos`
  build system. I think I also might have started making the system work on more
  recent `gcc` versions here or in 2015, since 2.95 was rather outdated at this
  point...

    Full list of commits for the year is
  [here](https://github.com/chaos4ever/chaos/compare/2a4939a9f6cbc83311bd5df02e282866639dd541...a6ec2350d7f7fb42e59c5f959a23d37b06ad95a8).
* 2014: Had a baby boy and a very hectic year at work, so not very much time for
  any hobby programming at all.
* 2015: Continued towards making more and more parts of `chaos` working again,
  along with general cleanups. Also experimented with adding support for writing
  parts of the system in Rust.

    Full list of commits for the year is
  [here](https://github.com/chaos4ever/chaos/compare/df890963f2443d988609d040a98d9e1e1d6a8322...90e7017abae540685b8f369d334e714680b55bc8).
* 2016: [changelog-rs](https://github.com/perlun/changelog-rs), a little utility
  I wrote to get more acquainted with Rust, as well as to be a help with
  creating releases of various software packages at work.
* 2016: Had a nice "hacking weekend" with my brother, experimenting with a
  Raspberry Pi port of chaos.
* 2017:
  * [perlun.eu.org](https://github.com/perlun/perlun.eu.org) (70h) - I seem to
    have spent quite some time on this blog during this year, and the commit
    log hints that I was both active writing blog posts and hacking on the
    blog in general.
  * **chaos** (27h). A bunch of [misc
    fixes](https://github.com/chaos4ever/chaos/compare/529fd70...1ada4b8)
    along with the major undertaking of making the bootup sequence work again
    (see [this blog
    post](http://perlun.eu.org/en/2017/12/30/chaos-why-is-the-boot-server-unable-to-read-the-startup-script)
    for the full story). The [0.1.0
    version](https://github.com/chaos4ever/chaos/releases/tag/0.1.0) was also
    released during the year, but this was before all the boot sequence fixes.
  * [notime](https://github.com/perlun/notime/) (15h). I experimented a bit
    with making a new time tracking app for my job. I tried out both Aurelia
    and React as suitable platforms for it
  * [ignition](https://github.com/perlun/ignition) (8h), an experimental
    application server written in Java that allows you to write your backend
    code in JavaScript or TypeScript. Very unfinished, this was just a
    proof-of-concept I wrote while interviewing with a company.
* 2018: A year where I spent a lot of time job-hunting, preparing for interviews etc.
  I also ended up switching jobs in August after exactly 10 years with my
  previous employer.
  * [Gameland rewrite](gameland), this time in Rust, targetting WebAssembly.
    This one is one of the least boring ones on this list in terms of
    "interactive multimedia experience". :-) (open the page and you'll see
    what I mean)
  * **notime** (44h). I ended up switching over this to Ember.js instead, also
    trying to get things working with CouchDB and PouchDB online/offline
    format for storing data.
  * **perlun.eu.org** (37h). Writing blog posts and also incorporating the
    Gameland intro mentioned above into the site.
  * **chaos** (31h). [Misc
    improvements](https://github.com/chaos4ever/chaos/compare/7c965a1...151798a)
    leading up to [the 0.2.0
    release](https://github.com/chaos4ever/chaos/releases/tag/0.2.0). Apart
    from the bootup sequence fixes already touched upon, the added support for
    booting from a USB pen device was one of the nicer fixes.
  * [UsageLogger](https://github.com/perlun/UsageLogger) (9h), some
    high-quality spyware which you can use to stalk your children a bit. ;-)
    Written in .NET using some direct Win32 API calls.
  * [Pg2Couch](https://github.com/perlun/pg2couch) (9h). This was part of the
    `notime` project; I needed to get some of our existing
    time-tracking related data into CouchDB for usage in my new app. This was
    also an interesting experiment with writing C# on macOS, using .NET Core.
    I remember it was nice to get back to the world of compiled languages
    after having worked mostly with Ruby; the speed increase when crunching
    fairly large volumes of data was pleasant. It was also nice to get back to
    statically typed languages as well. OTOH, .NET Core had its disadvantages
    as a platform as well, especially at this early stage.
  * **notime-pouchdb-server** (4h), written in TypeScript. Unfortunately, I
    seem to have thrown away this one. It was also written to support
    `notime`; I didn't get it very far but still. I think it was after
    working on this that I wrote [the "My first impressions of Node.js" blog
    post](http://perlun.eu.org/en/2018/04/27/my-first-impressions-of-nodejs).
    It was my first real project using Node.js as a backend platform and not
    just for wrestling with CLI stuff.
{% capture programming_2019 %}{% include category/programming/2019.md %}{% endcapture %}
{% capture programming_2020 %}{% include category/programming/2020.md %}{% endcapture %}
{% capture programming_2021 %}{% include category/programming/2021.md %}{% endcapture %}
{% capture programming_2022 %}{% include category/programming/2022.md %}{% endcapture %}
{{ programming_2019 | markdownify }}
{{ programming_2020 | markdownify }}
{{ programming_2021 | markdownify }}
{{ programming_2022 | markdownify }}

## Books that I would like to read

(Unsurprisingly, this is my personal "wishlist" of books so I remember what to
ask from others/buy for myself. :-)

* _Structure and Interpretation of Computer Programs_. This book was recommended
  to me by a good friend named Andreas Finne. He praised it greatly, saying that
  "if you understand what is written in it, you will become a better
  programmer". I want to grow and learn more, so this is definitely one of the
  books I would like to read at some point.

    The book is available for reading online
  [here](https://sarabander.github.io/sicp/html/index.xhtml).

* _[The Art of Multiprocessor Programming - Maurice Herlihy, Nir
  Shavit](https://www.bookdepository.com/The-Art-of-Multiprocessor-Programming--Revised-Reprint/9780123973375)_.
  Parallel programming is something I find fascinating, and even though I've
  been doing it a bit in the past, I know that there is _a lot_ to learn,
  particularly in areas like _lock-free concurrency_ and the general theory
  behind implementing traditional (locking-based) concurrency primitives. Since
  I've never studied CS, I feel there are a lot of areas here where I could
  improve.

    (After writing the above, I have purchased the book and started looking into
    it but it's really not a very easy book to read; it's quite demanding on the
    reader. I anticipate it will take a year or two before I'm through this.
    It's definitely not something that's easy to just pick up and read during
    your lunch break or similar.)

* _[Cyrille Artho](https://people.kth.se/~artho/): Finding faults in
  multi-threaded programs._ Master's thesis, Swiss Federal Institute of
  Technology, March 15, 2001

## Links that I find interesting

Yes, this is sort of my personal collection of "bookmarks" that I intend to read some day. :)

* [How generics were added to .NET](https://mattwarren.org/2018/03/02/How-generics-were-added-to-.NET/)
* [Why Google Stores Billions of Lines of Code in a Single Repository](https://cacm.acm.org/magazines/2016/7/204032-why-google-stores-billions-of-lines-of-code-in-a-single-repository/fulltext)
* [Rosetta Code](https://rosettacode.org/wiki/Rosetta_Code) is a programming
  chrestomathy site. The idea is to present solutions to the same task in as
  many different languages as possible, to demonstrate how languages are similar
  and different, and to aid a person with a grounding in one approach to a
  problem in learning another.
* [Functional Programming in Python](https://stackabuse.com/functional-programming-in-python/)

And, finally:

### My blog posts about programming
