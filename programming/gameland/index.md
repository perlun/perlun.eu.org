---
layout: default
---


<script src="gameland.js" type="text/javascript"></script>
<script src="dist/webaudio-mod-player/utils.js" type="text/javascript"></script>
<script src="dist/webaudio-mod-player/player.js" type="text/javascript"></script>
<script src="dist/webaudio-mod-player/pt.js" type="text/javascript"></script>

## Gameland intro
### New version

My nice brother Johannes Ridderstedt sent me some old files a few weeks ago
(in late 2017), stuff that he had preserved from an age-old computer of ours.

One of these was the file named `gameland.zip` (not published yet, but I might
put it up here some day.) I managed to get this running, and liked what I saw
(you'll find the YouTube link to it further down on this page.)

Around this time I was reading a bit about [WebAssembly](WebAssembly) which I
think will redefine and help reshape the web as we see it today. I was also
looking at the [Hello, Rust](https://www.hellorust.com) web page, and the ["FizzleFade effect using a Feistel network"](https://www.hellorust.com/demos/feistel/index.html)
page in particular.

I didn't look at the Feistel network code; instead, I was much more interested
in learning about how to draw 2D graphics to a canvas, which this demo was
doing. _Maybe I could reinvent some of my old, cool stuff using new, modern
technology_? And perhaps learn something new in the process of doing so? I
started playing around with this, and spent maybe 5 evenings or so, a little
time here and there trying to get some progress on various areas.

Here is the result:

<input type="image" src="gameland.png" alt="Gameland" id="run-wasm">

Click on the image above to start the demo (it will switch to fullscreen.) Only
tested in Firefox, Chrome and Safari on desktop; the full-screen stuff isn't
fully standardized yet so it uses prefixed, vendor-specific JavaScript calls.

<canvas id="screen" width="320" height="200" style="border: black 1px solid; display: none;"></canvas>

The code is available on [GitHub](https://github.com/perlun/gameland-wasm) if
you are interested in the full details on how it works.

**Update 2018-03-16**: I made some adjustments to make it closer to the
original; faster scrolling, more blinking. I also considered switching to [chiptune2](https://github.com/deskjet/chiptune2.js)
as the `.mod` player but after implementing the change I benchmarked the two
versions and concluded that the CPU usage was basically the same, so it wasn't
quite worth it. `libopenmpt` (the C library used by chiptune2.js under the
hood) has arguably a higher quality mixing code, but my usage of it is not
100% working so... I'm leaving it like this for now.

### The old version

Finally, for reference, here is the output from running the original intro and
the comments I wrote about it on YouTube.

<iframe width="560" height="315" src="https://www.youtube.com/embed/kkfwCpdItks?rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

> This is the output from a fairly simple intro I made for a LAN party we
> were hosting about 20 years ago. The intro runs on MS-DOS so it's a bit
> hard to run nowadays, but DOSBox runs it decently enough to make a
> screencap of it.

> Why the epileptic-style flashing background, you might ask? I think it
> wasn't quite uncommon at the time to do fancy tricks with the VGA palette.
> Flashing the background like this was incredibly cheap in terms of CPU
> (only a few port outputs to change the RGB values for color 0, which was
> the background) but looked quite fancy, so therefore it was added.

> I'm not even sure in what language I coded this, but I think C or C++. The
> music is from the .mod file named "are\_you\_excited?" by the compositor
> Daddy Freddy (http://amp.dascene.net/detail.php?det...) The .mod player
> library used is http://mikmod.sourceforge.net/

> Nostalgia! :)
