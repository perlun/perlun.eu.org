---
layout: post
title:  "My three favourite programming languages"
categories:
- programming
---

At the moment, I have three programming languages which are closer to my heart than the other languages I am familiar with. In this text I share some of the reasons for this.

For those of you who have followed me closely lately, nothing in this will be very surprising. I have three favourite programming languages at the moment, namely:

1. [TypeScript]({{ site.baseurl }}{% post_url 2017-03-27-typescript-making-web-programming-fun-again %})
2. [C#]({{ site.baseurl }}{% post_url 2017-03-17-new-features-in-c-sharp-6-0-and-7-0 %})
2. [Rust]({{ site.baseurl }}{% post_url 2017-03-20-rust-love-at-second-sight %})

If I were to develop a project from scratch, more or less _any_ project, and were able to freely pick whichever technology I wanted for the job, I would very likely choose one of these languages. My thinking would be something like this:

- For a general-purpose web project, targeting a browser (or Node.js), I would definitely choose TypeScript, any day of the week. In [this post](foo) I write a lot more about why I feel TypeScript is such a valuable addition to the web ecosystem. The editing experience is generally awesome, especially with editors built for it like [Visual Studio Code](foo).

- For something like a web/REST API, or a general-purpose console application, I would consider choosing C# using [.NET Core](linkme). The editing experience is very good in this case also, and I have a significant part of the C# BCL internalized after working with it for years, so my personal level of productivity here is high. .NET Core can also be deployed to basically _anything_ (Windows, Mac or Linux) so it's a very cross-platform solution which is nice.

- For something where performance is key, or where its suitable to be able to run things without a runtime (or with a minimal runtime), I would go with [Rust](http://www.rust-lang.org). There is an interesting [project ongoing](https://github.com/dotnet/corert/tree/master/Documentation) which intends to make C# code compilable to "bare metal", i.e. something that can run without the CLR, but it's not ready for public use yet, and even when it is, Rust will still have advantages over C# in a number of areas, such as:
  - _No garbage collector_ - predictable performance in a different way than C#/CLR-based applications.
  - _Ownership model_ - relates very much to the "no GC" mentioned above. The ownership model forces you to think carefully about which part of your application should own an object at any time, which is a good thing and will produce higher quality programs.
  - _Immutability by default_ - good for forcing you to write your program in a better, more functional style.

## Potential new languages that could make it to the list sometime

I am not saying the languages above are the _only_ great or useful languages, only that they are my personal favourites at the moment. But sometimes, things aren't really that black and white. For example, what if you _need_ to (because of e.g. dependencies on 3rd party Java libraries) run stuff which gets deployed to a JVM? You don't always have full control over the circumstances.

Hence, I would like to add one or more of the following languages to the list above:

- JVM languages
    - [**Groovy**](http://groovy-lang.org/). Groovy is an alternative to other languages like [JRuby](http://www.jruby.org) (a Ruby implementation for the JVM). It is an interesting choice, since it implements _optional typing_ which is a feature I consider critical when picking a language which is otherwise dynamic in nature.
    - [**Scala**](https://www.scala-lang.org/). Seems like an interesting mix of OOP and functional. The [Akka](http://akka.io/) concurrency framework makes it even more interesting. It's also a statically typed language (which I consider a feature, not an annoyance) with good inference support. The Scala language is used at Twitter, so it cannot be _that_ bad. :wink:
- _Functional languages_. I must admit I have never written a single line of code in any functional language (apart from Emacs-lisp...), so there is a lot to learn in this area.
    - [**Haskell**](https://www.haskell.org): The most common of these in terms of code committed on GitHub and number of Stack Overflow questions. I like it that this one is strongly typed
    - [**F#**](http://fsharp.org): Nice because it cooperates well with C# and the CLR; you can use other NuGet packages written in C# etc. Probably not as "pure" as Haskell, which is very strict in avoiding side effects. If I were to incorporate functionality in a .NET application where functional programming would be strong, this would be my first choice.
    - [**Clojure**](https://clojure.org/). Don't know so much about this one, apart from that it runs on the JVM and _seems_ to not be as strictly typed as Haskell and F#. Definitely a disadvantage.
    - [**Elixir**](http://elixir-lang.org/): The least common of these. Runs on the Erlang VM and has some nice traits, like lightweight threads ("processes") which is possible to achieve because of the message-passing approach taken. Seems interesting from a technical point of view, but their implementation of optional typing ("typespecs") feel kludgy and a bit repetitive, and I get the impression that the static analysis based on it isn't yet so well-established. I consider this language too much of a niche for the moment to feel really motivated to dig deeper into it.

## My second & third-tier languages

These are languages that I have all worked with (either professionally or in spare time projects), but would prefer not to work with any more, if possible. Having said that, I still acknowledge their place and it all depends; if I am asked to do a _small change_ to an existing Perl program for example, I will probably not start rewriting the whole thing in "some other language". However, if I'm asked to take over the long-term maintenance of an application, that's a different story and I'm much more likely to be wanting to rewrite at least parts of it in a better, more sustainable language, if possible.

- _C_. Feels too old and inconvenient to use, compared to more modern languages like Rust. Too easy to write unsafe, insecure code that can have serious security implications on the wild Internet.

- _C++_. Too bloated and huge. Yes, _useful_ since a large part of the world's software is written in it (WebKit, Mozilla Firefox, Window...), and of course I could write a few lines of C++ here and there if _needed_. Still, I probably wouldn't really enjoy it as much as writing code in my favourite languages.

- _Java_. Java lacks a lot of the nice things that has happened in C# for the last ten years that improve developer ergonomics and code readability. Yes, it's slowly improving, but the improvement process is dead slow. Let this VM die a painful death and rest in pieces. :laughing: Well, to be honest, the _VM_ is quite OK, it's the Java language that really deserves to be replaced with better alternatives.

- _Perl_. "He's dead, Jim". _Used_ to be a great alternative during the [CGI era](https://en.wikipedia.org/wiki/Common_Gateway_Interface), but nowadays, starting new projects with Perl would make very little sense. There are still significant lines of Perl code out there being actively worked on (like [Bugzilla](https://github.com/bugzilla/bugzilla)), but my guess would be that most of these applications were started during the CGI era.

- _PHP_. Please read ["PHP: a fractal of bad design"](https://eev.ee/blog/2012/04/09/php-a-fractal-of-bad-design/); it describes my feelings about PHP quite accurately. Having that said, I have also written my fair share of PHP programs historically, and recognize its huge impact on the world. I think you could say that "PHP is the JavaScript of the past". The pre-web-2.0 "lingua franca" of the web, where everyone could start "getting things done" without knowing that much about programming (but successfully being able to cut-n-paste things together and in some way get all the pieces of the puzzle laid out together... :wink:)

- _Pascal_. I learned quite a bit of programming during the Turbo Pascal era. Today, both Delphi and Pascal are niche languages that are more or less old and abandoned. Much like Perl, there would be little reason to create new projects in Pascal.

- _Python_. I haven't really done _that_ much Python, apart from [servo/servo#10774](https://github.com/servo/servo/pull/10774) and similar. I find Python to be a decent dynamic language; it's actually "less frustrating" than Ruby, because method bindings are being checked at parse time (not _when each line is being run_, like in Ruby). This of course limits the language a bit, but the advantage is huge since it helps you detect simple mistakes like typing errors etc. at a much earlier stage. I think I could live with writing a few thousand lines of code in Python without feeling _that_ bad about it.

- _Ruby_. My friend, may I strangle you slowly and painfully to death? :wink: Few languages have made me as frustrated as Ruby. I have written a _lot_ of Ruby code the last 2-3, 3-4 years, and as time has grown, gradually gotten more and more tired about it (for reasons explained in [this post]({{ site.baseurl }}{% post_url 2017-03-27-typescript-making-web-programming-fun-again %}).

    Having that said, I definitely see its place for certain script-oriented activities etc, where a very high level of dynamism is needed or useful. I just don't see it as a suitable language for larger-scale enterprise/business-oriented applications; in such cases, write the majority of the solution in some better language (Rust? C#? Scala? Perhaps even _Java_?), and expose the API to the parts that really need to be dynamic, and write these parts in Ruby.

- _x86/x64 assembly_. Don't really need any motivation for this one here. :smile: When writing TSR programs for DOS, assembly made sense since you needed to keep the size of the resident program as small as possible (since it would stay in conventional, 640 KiB-limited RAM, _all_ the time). Today, the only reason why I would use assembly is for invoking low-level instructions which are not possible to use from C or Rust, for inner-loop optimizations where the compiler wouldn't be able to make it fast enough (which is _quite_ seldom these days) or for bootloader code, where you need 100% control over the machine.

----

- _Visual Basic (VB6 or VB.NET)_. If anyone would ask me to do anything in these languages, I would try to run as far from that person as possible. I'd rather muck out the pigs. Visual Basic is one horrible piece of a hack. Avoid it like the plague.
