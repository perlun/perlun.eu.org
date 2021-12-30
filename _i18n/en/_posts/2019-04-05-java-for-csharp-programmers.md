---
layout: post
title:  "Java for C# programmers"
categories:
- programming
---

In this post I'll write about a number of differences between Java and C# that I've experienced at my current job. First a bit of a background: Before I switched jobs in August 2018, I had been working with C#, Ruby and other programming languages for the last 15 years; Java was pretty much out of the picture for me. I had worked as a Java programmer from the year 2000 to 2001, but this was indeed a _long_ time ago.

But then, something happened. As the saying goes, "the Lord works in mysterious ways" - this was really the case for me this time. I [wrote in a blog post](/en{% post_url 2017-04-03-my-three-favourite-programming-languages %}) a few years ago about my feelings for the Java programming language; they weren't exactly ecstatic:

> Java lacks a lot of the nice things that has happened in C# for the last ten years that improve developer ergonomics and code readability. Yes, it's slowly improving, but the improvement process is dead slow. Let this VM die a painful death and rest in pieces. :laughing: Well, to be honest, the _VM_ is quite OK, it's the Java language that really deserves to be replaced with better alternatives.

Little did I know back then I would be here, pretty much _exactly_ two years later, working full-time as a Java programmer. Sometimes, life makes you surprised. (Or, put another way, you can say that _the Lord_ makes you surprised sometimes.)

Have I changed my mind, or was I wrong that time, two years ago? Or both?

Some things have indeed happened since that statement. The improvement process has been significantly revamped; instead of releasing a new major version every 2-3 years, Java has moved to a [_6-month_ release cycle](https://mreinhold.org/blog/forward-faster). Improvements are slowly but steadily making it into the language, and in some areas, Java is even ahead of C# which is quite impressive, given Java's historically lower velocity. And, I'm quite certain that both of these language camps (or rather, development platform teams) are monitoring the steps of each other, trying to learn from the experiences at the other side of the pond instead of necessarily reinventing everything over and over again.

Having that said, there are significant differences between these languages and during my current 6 months of working more or less full-time with Java again, I've tried to jot down a few of these every now and then. This is helpful both for myself and also for other people who are crossing the "border", particularly in the C# -> Java direction. Having worked a long time with a language tends to make you _think_ in a particular way, tends to make you _expect_ certain characteristics of a language and platform. These presumptions can be dangerous, since they are very likely to be incorrect from time to time.

So, here is my list. Bear in mind that this is written from a C# programmer's perspective; it primarily describes ways in which Java is different from C#, not the other way around.

(This is to be considered a "living" document and I'll likely continue updating this as my journey goes on.)

## Differences between Java and C# ##

### Identifier visibility

(See also [this SO question](https://stackoverflow.com/questions/215497/in-java-difference-between-package-private-public-protected-and-private))

- `private` and `public` - works pretty much the same as in C#.
- `protected` - again, similar to its C# counterpart. A type wit this visibility is visible to all subclasses (in the same package and others)
- no modifier - `package private` - like `internal` in C#. Unfortunately, this can *only* be specified by not providing a modifier at all!
- No concept like `InternalsVisibleTo`. This can be rather annoying, especially when working with unit tests and integration tests; you would want to tighten the visibility for a particular class and/or method and `InternalsVisibleTo` plays a nice role in this.

### Language runtime and language version much more tightly coupled

- Cannot use `var` when targeting Java 8 with OpenJDK 10 and 11, even though it would likely not require any changes in the actual bytecode. Contrast this with C# where the `async` and `await` keywords which were introduced in VS2012 and supported in .NET 4.5, but back-ported to 4.0 by means of using a separate NuGet package from Microsoft: https://blogs.msdn.microsoft.com/lucian/2012/04/24/async-targeting-pack/

    While I understand why the Java platform developers are doing it like this to keep things simple and avoid undesirable complexity in the platform, I do hope that it would change eventually; it would be very nice to be able to use modern language traits like pattern matching and other things which mostly touch the compiler even while targetting older runtimes like Java 8. Java 8 is still (as of April 2019) the most popular Java version deployed and will likely remain so for years to come.

## ClassLoader

- Similar in concept to `AppDomain`s in the .NET world. A class loader can only contain a single version of a class (and hence, a particular version of a `.jar` file), but multiple class loaders can contain different versions of the class.

## Debugging

- When debugging, there is no easy way for you to easily see which `.jar` files have been loaded in the current JVM. Technically, `.jar` files is an invisible abstraction layer in the Java world. A class can come from a `.jar` file, or a folder in the file system, and once the class has been loaded and made available to the runtime, the detail about from whence it was loaded *mostly* disappears.
- `[DebuggerStepThrough]` does not exist - https://stackoverflow.com/questions/13394228/debuggerstepthrough-equivalent-for-java

## Static constructors

- Not called *constructors* but rather *initializers*.
- Order is relevant - static fields using values initialized in static constructors must come later in the file, after the static constructor.
- A class can have multiple static initializers. They get executed in the order they appear in the class.
- Full details: https://docs.oracle.com/javase/tutorial/java/javaOO/initial.html

## Static classes

- Does not exist. Make a regular class with a `private` constructor instead.

## Static nested classes

- Does *not* at all come with any similarity to their C# counterpart: https://stackoverflow.com/questions/7486012/static-classes-in-java

## Interfaces

- Unlike in C#, an interface method can return a more sophisticated return type than the type defined in the interface method. The following C# code causes a compile-time error; it's not permitted for `BarMethod()` to return a subtype of `Foo` - _only_ `Foo` itself can be returned in this case. The corresponding Java code works because of its more advanced covariance support, compared to C#.

    ```csharp
    interface IFoo
    {
        IFoo BarMethod();
    }

    interface IBar : IFoo
    {
    }

    class Baz : IFoo
    {
        // Note that we attempt to return a subtype of IFoo here
        public IBar BarMethod()
        {
            throw new System.NotImplementedException();
        }
    }
    ```

## Enums

- Are a completely different beast than in C#
  - C# - “C-style” enums, shorthand for constants: https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/enumeration-types
  - Java - full classes, which can contain (static and/or instance) methods. Java's enums are much more sophisticated than their C# counterpart. You can think of them as a short-hand way to define a fixed set of "named instances" of a class; all instances are initially created when the type is being loaded into the classloader.

## Generics

- Annoying details like “Array[T] does not implement Collection<T>” breaking scenarios like this:

    ```java
    public QueryTerms( Iterable<QueryTerm> terms, QueryTerm... moreTerms ) {
        this.terms = Lists.newArrayList( terms );
        this.terms.addAll( moreTerms );
    }
    ```

- `typeof(T)` cannot be used, but `Foo.class` can emulate it to a certain extent.

- Generics are not reified (=they are erased at compile time), which limits their usage in some scenarios.

### Primitives don’t have methods

- There is no `42.toString()` method. You have to call `Long.toString(42)` instead. In this respect, C# more closely follows the "everything is an object" approach, similar to other languages like Ruby; the latter takes it even further so that even `nil` (its implementation of `null`) is an object with methods you can call! C# does not go quite as far, but trivial things like `42.ToString()` work fine. This works because `int` in C#/NET is technically an alias for `System.Int32` which is a `struct` - i.e. a _value type_, a concept we are still waiting for in the Java world at the time of writing. (see "Project Valhalla" for more information about the current status)

## switch(obj) throws exception on null references

- This is a quite nasty gotcha; the semantics here are different to C#, where `null` is a perfectly valid object for a `switch` statement. Not so in Java; you will get an exception if you try this.

## Do or do not; there is no try

- Parsing an integer *requires* the caller to catch exceptions; there is no `Int32.TryParse()` or similar.

    ```java
    int i;

    try {
        i = Integer.parseInt("42_or_maybe_not");
    }
    catch (NumberFormatException ignored) {
        // Ignore parse errors
    }
    ```

    Luckily, the good folks at Google have implemented a workaround in the `com.google.common.primitives.Ints` class: `Ints.tryParse()`

## No delegates

- However, Java 8 provides functional interfaces and lambdas which can largely do the same thing. Functional interfaces feel a bit more complex though. The `Supplier`, `Function` and `Consumer` class of interfaces are worth mentioning in this regard; they are similar to `Func` and `Action` in the .NET world. Even though Java doesn't have delegates, the compiler and runtime does a pretty impressive job in simulating this by means of single-method functional interfaces. It sure isn't _quite_ as elegant as the C# counterpart, but it's a nice step in the right direction.
