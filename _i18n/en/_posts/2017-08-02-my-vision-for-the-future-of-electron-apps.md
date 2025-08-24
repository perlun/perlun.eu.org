---
layout: post
title:  "My vision for the future of Electron apps"
categories:
- programming
---

It was quite a long time since I shared my thoughts on this blog, so I thought I'd do a bit of a writeup about some things that I have been thinking about lately. About _Electron_ in particular and _web technologies in general_, and how the current situation can be improved.

Let me first state that this blog post will at first sound a bit negative; I will somewhat give the impression that I hate web technologies and Electron. This is really not the case at all, I am in fact writing this blog post in [Visual Studio Code](https://code.visualstudio.com/) (which is itself powered by Electron). However, I do feel that there is a large room for improvements and that's the purpose of this document: to suggest future improvements in the way Electron apps are _built_ (developed) and _packaged_.

## Introduction and background: Where we came from

I must admit that I have a bit of a hate-love relationship towards web technologies and the "web as a platform". Of course, there's been a _tremendous_ development (in many different areas) since [Tim Berners-Lee](https://en.wikipedia.org/wiki/Tim_Berners-Lee) invented the web. It started off with static web pages, then grew into dynamic, server-generated pages with [CGI](https://en.wikipedia.org/wiki/Common_Gateway_Interface), classic [ASP](https://en.wikipedia.org/wiki/Active_Server_Pages) and all of that. Around the same time as server technologies became more and more dynamic, [Brendan Eich](https://en.wikipedia.org/wiki/Brendan_Eich) created JavaScript which made it possible to make pages that were dynamic on the client-side also (i.e. in the browser). Eventually, web pages grew into supporting what we now talk about as [single-page applications](https://en.wikipedia.org/wiki/Single-page_application), where the `.html` page is more of a "container" of the assets (`.css` and `.js` files more specifically) that compose the "application".

We are quite close to seeing web applications becoming real "applications". In many ways, they already are.

But then again, we still have a long way to go. I recently browsed the [Trello API](https://developers.trello.com/v1.0/reference) pages. They were so slow and sluggish that they were barely usable with my regular Firefox browser. I switched over to try Firefox Nightly (with [stylo](https://wiki.mozilla.org/Quantum/Stylo) enabled), but it was still far from a great experience; slow and sluggish. Maybe it would have worked better in Chrome; unfortunately, we are not always _that_ far away from the "Internet Explorer-only" paradigm that we used to see back in the late 90's, early 00's. The only difference is that we've replaced Internet Explorer with Google Chrome instead.

Am I exaggerating? Maybe. But I'm trying to make a point here: the web is sometimes a horrible, sluggish thing, that gives you a rather unpleasant experience. This is on a fast, quad-core 2.8 GHz, 16 GiB MacBook Pro. What can it be like on even slower machines?

Unfortunately, the Trello API page is not the only sluggish web page I've browsed recently. The [Sentry](http://sentry.io/) page was also rather slow and heavy to load some day ago.

## People used to think more about writing more performant code

What's bothering me with all of this is that _the machines today are extremely powerful_. I mean, think of it. Quad 2.8 GHz, that's a whopping _ten gigahertz_ of computing power. I don't remember how fast my first computer was (hey, it wasn't even my own), but I think 12 _megahertz_. So about 1000 times faster in terms of raw clock frequency. Now, that doesn't tell the full picture of course, since the clock frequency isn't everything, but even if you compare the [MIPS](https://en.wikipedia.org/wiki/Instructions_per_second) values for these machines, my current machine is roughly 100 times faster than my first one in terms of CPU power.

Likewise with memory, but here it's even more extreme: my first machine had 1 megabyte of RAM. 640 KiB of conventional memory and 384 KiB of XMS memory, ergo 1024 KiB = 1 MiB in total. My Mac has _16 thousand_ times more memory!

Does it feel 16 thousand times faster, or even 100 times faster? No, unfortunately not. As computers have gotten faster and RAM and and disk size has increased, we've also seen another trend. Applications have gotten _a lot less_ efficient in terms of their resource usage during these ~20-25 years. This is something that saddens me, actually. We _used_ to think much more about this. Software that was inefficient would simply not make it when compared to its competitors (unless it offered some incredible feature that you couldn't live without). The overall rule was that people spent quite a bit of time thinking about how to write efficient software, and the languages being used at the time (C, Pascal, C++) encouraged this kind of mentality much more than today's languages.

Regretfully, it feels like we've lost an important component about proper software design and engineering during the years that's passed.

## JavaScript destroyed it all

The title here may sound a bit harsh, but it's partially true. JavaScript helped propel the direction towards more and more _dynamically_ interpreted, _dynamically_ typed languages. Of course, JavaScript is not the _only_ dynamic language being used: some of the other major players in this field are Ruby and Python, but JavaScript is *by far* the most popular one.

Why is this a problem? Well, it depends. For certain kinds of applications (like parsing of very loosely/dynamically structured data, reflection over objects where a library doesn't know anything about the objects it is being passed as parameters, and certain other dynamically oriented use cases), dynamic languages are great and much more convenient to work with than their statically typed counterparts.

However, the major problem with JavaScript is that it _forces_ you to write your code in a dynamic manner, even when there is little or no reason for this in the particular use case. JavaScript was from the beginning never "designed for speed". It was designed to be able to dynamically `alert('You haven't entered a value in this field')` and other _extremely simplistic_ "applications" (it's wrong to call such programs applications; they are truly "scripts" in the true sense of the word).

For such use cases, a dynamic language is very convenient and useful. But it has regretfully made the language very limited in its design that makes it hard to perform as well as other languages and runtimes. Yes, runtime implementors (both Chrome with V8, Mozilla with Spidermonkey and others) have done _a lot_ to try and mitigate this, but I believe we (as the software industry) are quite far from being "finished" in this area. **We need something much better than JavaScript!**

(If you don't believe me when I say JavaScript is still quite slow, please check [these benchmarks](http://benchmarksgame.alioth.debian.org/u64q/compare.php?lang=node&lang2=gcc) where JavaScript and C implementations of a variety of different algorithms are being compared. Even with a good runtime like Node.js' V8 (essentially the same engine that powers Google Chrome), a compiled C program is still 2-25 times faster than its JavaScript counterpart, as can be seen in the screenshot below (copied from the linked web page):

<img src="/images/node-js-vs-c.png" alt="Some node.js vs C benchmarks" width="500" align="center" style="display: block; margin: 0 auto;">

## TypeScript makes things better, but still not good

Those of you who have been reading my blog before know that [I am a big fan of TypeScript](http://perlun.eu.org/en/2017/03/27/typescript-making-web-programming-fun-again). It provides a much nicer language for developing the applications, since it doesn't force you to write your code with dynamic typing in the many cases where static typing makes the overall experience better. However, there is still a big problem with TypeScript. Unfortunately the transpiler is forced to throw away all the good information about the types in the application that could be used by the JavaScript JIT compiler/runtime to better optimize the machine code. **There is no way for it to be preserved** in the generated `.js` file(s), which is very sad.

## WebAssembly as the way forward

I am incredibly happy that [WebAssembly](http://webassembly.org/) is here, and that all major browser vendors (Mozilla/Firefox, WebKit, Microsoft/Edge and Apple/Safari) are endorsing it. Finally! It only took 22 years for the world to come up with a proper binary representation of JavaScript code. :smile: &lt;/sarcasm&gt;

WebAssembly _does_ indeed provide a binary representation of the code, which means that languages like TypeScript should be possible to be "compiled to WebAssembly" in the long run. I say "in the long run", since at the moment WebAssembly is mostly targetting C and C++. TypeScript is by nature a more high-level language (since it is really only a superset of JavaScript), but it might be possible in the future to enable a compiler setting in TypeScript to say "enable only features that can work in WebAssembly", to future-proof your code even though you're not _specifically_ yet targetting WebAssembly.

## How Electron apps should be built in 5 years

Here comes a surprise if you think I'm always negative: there's actually not any fundamental error in the way Electron apps are being built (except that they rely on the [npm](https://www.npmjs.com/) ecosystem, which has a number of problems IMHO, but that's a separate blog post...). If you check out the source code code for [Visual Studio Code](https://github.com/Microsoft/vscode), and start the [gulp.js](https://gulpjs.com/)-based build system etc, it's actually a pretty convenient experience. Because of the dynamic nature of being a web application, you can make your change to the code (which is written in TypeScript, and therefore is very convenient to work with in the IDE) and then just _Reload window_ when you have saved your change and the compiler has compiled your file. This is nice! Hence, I don't see any _major_ problems here that would need to be resolved.

On the other hand...

## How Electron apps should be packaged in 5 years

...when it comes to _running_ the Electron apps, there is a lot of room for improvement. Think about it. Every time you start Visual Studio Code, there must be literally a _gazillion_ different `.js` files that it needs to load. Yes, they can be concatenated, they can be minified, etc etc, but still: _every single time_ you start the program, large parts of the editor has to be "recompiled", _on every single computer_ that it's being run.

When thinking about it, you start wondering: _does it really work that way_? I double-checked before posting this: my Visual Studio Code `Contents/Resources/app` folder on macOS contains _2890_ `.js` files. When you think about it, it's quite amazing that it isn't slower than it actually is! :smile:

My vision here is very, very simple. All of these files should be precompiled, ahead of time when the Visual Studio Code package is built, into a binary representation. Yes, as mentioned above, I know very well that we cannot _today_ compile TypeScript files into WebAssembly, but let's not let the limitations of _today_ dictate the vision for our future.

Also, it's not necessarily so that _today's_ generation of NPM packages (authored in JavaScript or TypeScript) would necessarily be compiled to WebAssembly bytecode. What I'm personally hoping for would be a trend where certain packages are being reimplemented in C, C++ or similar (ideally, Rust). The ABI would be preserved so that you can just change your `package.json` to refer to e.g. `lodash_wasm` instead of `lodash`, and you will get the WebAssembly-optimized version. One incredibly nice thing with this is that it would also let each package provide _one_ single `.wasm` file with the compiled binary version of the package. This will be an incredibly nice improvement over today's situation where a regular Node.js-based application can consist of literally 10 000 of files in the `node_modules` folder.

Gradually, more packages would provide a `_wasm` optimized version. Using these packages for its dependencies, and also compiling Visual Studio Code itself into `.wasm` format before shipping it would provide a very significant performance boost for **all users**. Developers, people working on Code, can still run it in the "current" mode (loading these 3000 `.js` files on startup) but for ordinary people like me, we get a much more optimized version in our hands.

The future is bright. The web is here to stay, and along with it, Electron applications. All I'm hoping for is that the (currently quite wide) gap between Electron-based apps and real, native C/C++/Objective C/Rust/etc-baed applications will eventually decrease to the point where _the web beats native_. Or at least is _so close to it_ that the difference will be insignificant!
