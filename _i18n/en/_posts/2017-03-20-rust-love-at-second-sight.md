---
layout: post
title:  "Rust: Love at second sight"
categories:
- programming
- rust
---

In this post, I will write a little about another of my favourite programming languages, namely, _Rust_. I started experimenting with Rust in 2015 I think, but it took some time for me to really learn to appreciate it. You could call it a "love at second sight" experience.

## Introduction

So, as stated, Rust is one of my favourite programming languages right now. It has a lot of nice design goals, including:

- _Speed_: You can really _feel_ this when you run your programs. Especially when compared to running JRuby programs (which incur a JVM startup penalty hit every time you run them), it's clearly noticeable, but even regular MRI programs are dead slow by comparison. It feels good to get a bit closer to the machine, really! (in the sense of eliminating most of the runtime overhead that the higher-level languages often incur).
- _Zero-cost abstractions_: This is one of the very clearly laid out design goals of the language. It should _feel_ more high-level than languages like C and C++ (to make it possible to write code that is easier to read and maintain), but at the same time, the run-time cost of these abstractions  should be close to zero.
- _Safety_. To be honest, this is not an aspect I've focused on thus far in my learning. My code is _not_ that safe yet; it does stupid things like calling `.unwrap()` on results from method calls, which can have bad effects if the unwrapping fails. But, it's still a good characteristic: _safer than C_, which is a language plagued by the fact that it's _hard_ to get a C program right. Yeah, sure, you can make it _compile_ and _run_ successfully, but can you make it stand the test of time? Will it have zero remote code execution vulnerabilities even after having been used in production for 5-10 years? It's _so_ easy in C or C++ to make a mistake that can have very serious consequences like that, and Rust is truly promising quite a lot in this area as well.

However, let's not be naïve here. _**Learning Rust is hard**_. For me, it has been the most challenging programming language I've ever learned, and I'm nowhere _close_ to having mastered it yet. Still, I feel like I have gotten past some of the initial hurdles so I wanted to share something about my journey so far; maybe it will help other wanderers as well.

(Note: I feel it's relevant to mention here that haven't yet learned any purely functional programming language like [Haskell](https://www.haskell.org/), [F#](http://fsharp.org/), [Elixir](http://elixir-lang.org/) or [Clojure](https://clojure.org/). I expect these to be hard to learn also, because thinking in these languages is very different to the other more object-oriented and/or imperative programming languages I know. However, experimenting with and learning one of these languages is not really on my agenda _yet_; I want to feel that I master my current in-progress languages first, before potentially exploring other uncharted territory.)

----

## My babysteps

Looking at `git` logs and such, it seems my first experiences with Rust was in the summer of 2015. I was hacking on our hobbyist operating system [chaos](http://chaosdev.io/), looking into writing a new server for [virtio](https://wiki.libvirt.org/page/Virtio) networking. That would in the end make it possible to run chaos in a virtualized environment like [VirtualBox](https://www.virtualbox.org) with networking support, which would in turn help in the debugging of bug [#89](https://github.com/chaos4ever/chaos/issues/89), a long-standing issue that's been frozen for more than a decade in fact. We used to have a bunch of network drivers for ISA and PCI network cards included in chaos, but they all were removed in [#51](https://github.com/chaos4ever/chaos/pull/51) because they were:

- Ancient, and not so relevant anymore (who uses an NE2000 or 3C509 card these days?).
- More problematically, they were largely based on the drivers in the Linux kernel, causing these parts of our codebase to be GPL-licensed (when the rest of the code is BSD-licensed).

So, at the moment we don't have any working network driver in chaos apart from loopback, and the `virtio` driver would be a good way to fix that in the "most generally useful" way. Virtualization software usually virtualized other network adapters as well, but `virtio` seemed like the best way to get this task done.

There was just one issue with writing the `virtio` driver: I was completely _fed up_ with C and C++. They are old, outdated languages that really deserve to be replaced by something better. From a personal perspective, one of the major drawbacks that struck me at that time was the fact that you have to _duplicate_ your method signatures in two places: the `.c` file and the `.h` file. That can feel like a miniscule thing, but it can mean you're less likely to refactor code, since the mental cost of doing so is somewhat higher, so it was one of the reasons I didn't feel motivated to write this in C. Instead, I was looking at alternatives.

Rust was a language that I had been aware of for a while then, so I started trying to use it for this particular use case.

Unfortunately, I didn't get very far, and it felt frustrating. Of course, I was already a bit "off the edge" by trying to use Rust in a freestanding, non-`std` way here. The normal way to write a Rust program is that you develop it and run it on e.g. Windows or macOS.  The rust `std` library wraps the operating system libraries in a platform-agnostic way (meaning a Rust program can run on any operating system as long as you recompile it for that specific operating system), and provides some of the most critical building blocks for helping you implement real-world programs.

Now, since I was trying to run my Rust program straight on the metal, I was not able to use the `std` library, since it depends on an underlying operating system it can delegate some of its work to. Instead I had to use something called [The Rust Core Library](https://doc.rust-lang.org/core/), which provides a bare minimum of the standard library, but which has the advantage of being even more cross-platform.

The only problem with this was that I had to do a lot more work myself to get things done (which is hard enough when you're working in a programming language you're unfamiliar with, and it doesn't make things easier when the things you're doing isn't stuff that everyone else is doing, and the programming _language_ itself isn't that commonly used yet, and... you get the picture). I also had to rely on unstable toolchains of Rust since disabling the `std` library relied on feature flags, and feature flags are not available in stable Rust. :smile:

Add to all of that the fact that the existing chaos libraries were never written with Rust in mind. I mean, a simple thing like _strings_ being passed into the system calls, they are expected to be C-like strings with a `NUL` terminator at the end. That is _not_ the case with regular Rust strings, so I had to write a method to convert them to that, which wasn't that easy when the whole approach to managing memory is vastly different in Rust than I was used to.

Simply put: this was too much for me, I gave up; this has been unfinished since October 2015 or so. If you like, you can see that code I wrote [here](https://github.com/chaos4ever/chaos/pull/59).

Before moving on in my storytelling, I am going to include an excerpt that shows in detail how awkward it was just to get _anything_ done. As mentioned, the chaos system calls and standard library functions all rely on C-style `NUL`-terminated strings, so to convert Rust string constants to that I had to come up with this (I admit: I definitely googled, looked at Stack Overflow etc. to try and get examples I could base this on):

```rust
const MAX_LENGTH: usize = 1024;

pub struct CString {
    buffer: [i8; MAX_LENGTH],
}

impl CString {
    pub unsafe fn new(s: &str) -> CString {
        CString {
            buffer: CString::to_c_string(s)
        }
    }

    unsafe fn to_c_string(s: &str) -> [i8; MAX_LENGTH] {
        let mut buffer: [i8; MAX_LENGTH] = [0; MAX_LENGTH];
        let mut i = 0;

        // TODO: ignore the risk for buffer overruns for now. :)
        // TODO: likewise with UTF8; assume that we are ASCII-only.
        for c in s.chars() {
            *buffer.get_unchecked_mut(i) = c as i8;
            i = i + 1;
        }

        *buffer.get_unchecked_mut(s.len()) = '\0' as i8;
        buffer
    }

    // This one was useful for taking a CString and passing it to an external C function.
    pub fn as_ptr(&self) -> *const i8 {
        &self.buffer as *const i8
    }
}
```

It's not the most elegant piece of code I've ever written, if we put it like that; it shows how much nitty-gritty low-level detail I had to do to get some _very_ basic things done for this particular use case. Don't be afraid: normal Rust programs never have to do _this_ low-level stuff themselves, the `std` library takes care of this for you as a programmer.

# Trying some other ways to learn it

Luckily for all of us, I didn't completely give up the Rust endeavour here; it was just paused a bit. Early in 2016 I started playing around with another track: how about doing a web API in Rust? I did a small spike called [copper.rs](https://github.com/perlun/copper.rs) which was in turn based on [nickel.rs](https://github.com/nickel-org/nickel.rs). It doesn't do anything useful, but this time I chose a more reasonable task to continue familiarizing myself with the language.

Shortly thereafter, I started looking into the [Servo](https://servo.org/) project. Now, Servo is a _huge_ project, and it wasn't precisely tiny back then either. After all, why would it be? Writing a web rendering engine is a project that is probably just as big as writing an operating system kernel. Getting into a huge codebase isn't always _that_ easy, especially when you do it on your spare time (evenings and weekends). That said, I did manage to do [a few contributions](https://github.com/servo/servo/commits?author=perlun) even though many of them were actually in Python code that _generated_ Rust code, not so much Rust changes itself. Anyway, I did a few smaller contributions here but nothing fancy yet.

## Scratching my own itch: `changelog-rs`

Then, about half a year later, I started working on my own little Rust project: [changelog-rs](https://github.com/perlun/changelog-rs).

The background to this project was actually a need that had arisen at my workplace. As many companies do, we release software periodically, with version numbers like 0.1.0, 1.0.0 and so forth. For some of our software we produce a _changelog_ that lists the changes included in a particular version, for documentation and maintainability reasons. Previously, I had been using [github-changelog-generator](https://github.com/skywinder/github-changelog-generator) for this. However, it had some bugs (didn't work properly when releases were made in the same time frame on different branches; it would include commits from other branches for a given release which was a very bad bug) and the code base was perhaps not that easy to work with. Also, I was still interested in learning Rust so why not give it a try and use it here?

And so I did. [changelog-rs](https://github.com/perlun/changelog-rs) was born. Because of my real-life circumstances (family with young children), it wasn't possibly for me to devote a _huge_ amount of time for it, but I did try to spend as much as could. It was still not so easy, Rust's memory model (with ownership of data being very explicit in _every method call_) was one of the challenges I faced. It also felt like the Rust API documentation wasn't that great and easy to comprehend; either I'm too incompetent to be able to understand it, or it needs some improvements, or both.

Anyway, it was still not so easy to get things done unfortunately, and I was still frustrated about that.

Around this time, I was emailing a bit with [Jack Moffit](https://en.wikipedia.org/wiki/Jack_Moffitt) (a senior Rust developer), sharing my struggles with learning the language. One of the things I remember mentioning to him was that _Rust felt so different_. For me, coming from a more traditional, OOP-based background, the whole setup with `struct` and `impl` in Rust felt confusing. For example, to define a "class" with a method, you define the `struct` (the data type itself with its fields) and the `impl` implementing the methods on this struct in a decoupled fashion, like this:

```rust
pub struct GitTagParser {
    pub repository_path: String
}

impl GitTagParser {
    fn semver_tags(&self) -> Vec<String> {
        let tags = self.get_tags();
        tags.into_iter().filter(|e| match Version::parse(e) {
            Ok(_) => true,
            Err(_) => false
        }).collect()
    }
```

This felt very unnatural for me, but I discussed both this fact and other things I found hard with Jack and he gave some good answers both to this question and others. He explained how this is Haskell-inspired and gave some links on the thinking behind this and other aspects of the Rust philosophy. In general, he helped to improve my motivation for continuing to learn Rust, for which I am thankful - thank you, Jack!

I continued working on my program, and eventually, things started feeling gradually better. It was like I suddenly _understood_ how I could get things done, instead of just struggling with the language! I realized that because of Rust's nature (with memory ownership being a detail that the language expects you to take responsibility for), it can be perfectly valid to write code like this:

```rust
fn main() {
    let args: Vec<_> = env::args().collect();

    if args.len() == 2 {
        let ref repository_path = args[1];
        let git_tag_parser = GitTagParser {
            repository_path: repository_path.clone() // Make a copy of the command line argument.
        };

        // ...
    }
}
```

There's simply no way _around_ this. Since I don't own the command line arguments coming in, and I need to use them in a few different places, I *must* make a copy of the string (or at least, that's the easiest way to do it). And that's fine! It's actually an important lesson to learn, not only the mechanics for how ownership _works_ but also the more "soft" thinking around it, _"how are you expected to use this in a real-world scenario"_. It is my feeling now that, because of the Rust ownership model, you need to explicitly copy data more often than in other languages (like C# and Ruby). This can feel cumbersome and inefficient, more inefficient than just sharing the data like you do in these other languages, but at the same it's probably a key component in attaining the _safety_ design goal mentioned early in this blog post.

I am still learning, and because of the previously mentioned family situation not able to do _that_ much work on spare-time projects. The journey definitely feels more pleasant now than when it started though, which is nice!

----

If you have read this far and want to try Rust out, but don't know where to start, let me give you a suggestion: [diesel.rs](http://diesel.rs/). It's an ORM designed in the way an ORM _should_ work, in my opinion. It doesn't mandate a particular database structure, instead:

> Unlike Active Record and other ORMs, Diesel is designed to be abstracted over. Diesel enables you to write reusable code and think in terms of your problem domain and not SQL.

I like that. One of the _major_ problems with e.g. Active Record is that you are basically _forced_ to have a particular data structure in your PostgreSQL/whatever database, which is a 1-to-1 correlation to your model classes. What if you're working with traditional ERP systems where this is not really feasible? Then you're in for problems. With Diesel, that would not be an issue at all, since it is _designed_ to be a lower-level layer which you can then write your higher-level data abstraction code on top of.

So, if you have spare time and want to learn something new, I can definitely suggest giving Diesel a try. Since Rust 1.15 was [released a month and a half ago](https://blog.rust-lang.org/2017/02/02/Rust-1.15.html), you don't even have to use an unstable Rust version to use it! :laughing:
