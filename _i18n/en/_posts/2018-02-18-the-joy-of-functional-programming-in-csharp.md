---
layout: post
title:  "The joy of functional programming in C#"
categories:
- programming
---

Functional programming can be a really pleasant way to program the machine, since it encourages a very good way of thinking when it comes to code; a thinking that generalizes problems and helps to make the code you are working on more reusable and more easily testable (less focus on side effects, more focus on returning a new result based on an input.)

(This post focuses on a particular scenario I was working with, but in the end I'll also share some of my thoughts on functional programming and multi-paradigm languages in general.)

Sometimes we make the false assumption that functional programming only relates to a particular type of languages, like Haskell, OCaml, Lisp, etc. While these languages are indeed _functional_ in spirit, the fact is that modern languages like C#, JavaScript, Rust etc. _also_ does a good job at providing the necessary building blocks for coding in a functionally oriented style.

I recently wrote a method that looked like this:

```csharp
public static class NpgsqlDataReaderExtensionMethods
{
    public static List<T> GetFirstColumnAs<T>(this NpgsqlDataReader reader)
    {
        var result = new List<T>();
        while (reader.Read())
        {
            result.Add((T)reader[0]);
        }
        return result;
    }
}
```

This was nice; it let me read the full results of a simple SQL query like `SELECT foo FROM bar` very easily.

Now, I needed to expand that use case to support multiple columns. I started from the other end - how would the typical _usage_ of the method I was writing look like? Something like this would be generically useful:

```csharp
using (var command = new NpgsqlCommand(queryString, connection))
{
    using (var reader = command.ExecuteReader())
    {
        return reader.MapResult(reader => ((string)reader[0], (string)reader[1]));
    }
}
```

This uses the built-in-support for N-level _tuples_ I've [blogged about before](http://perlun.eu.org/en/2017/03/17/new-features-in-c-sharp-6-0-and-7-0), which may be new for those of you who have mostly used older C#/Visual Studio versions. It basically works like this: `var foo = (a, b, c)` creates an _anonymous tuple_ with three elements. That's why I wrote `((string)reader[0], (string)reader[1]))` up there; the extra level of parentheses creates an implicit tuple type behind the scenes, which becomes the `T` type that the method returns.

Speaking about the method - here is the actual implementation I came up with:

```csharp
public static List<T> MapResult<T>(this NpgsqlDataReader reader, Func<NpgsqlDataReader, T> mapper)
{
    var result = new List<T>();
    while (reader.Read())
    {
        result.Add(mapper(reader));
    }
    return result;
}
```

Nothing fancy; it uses the `mapper` function you provide to do the actual transformation to the result data type. This `Func` is what makes this whole thing be a _functional_ approach - you provide a function, and I (the `MapResult` method) takes care of the rest. Nice and easy.

Once I had this in place, I could then refactor my initial `GetFirstColumnAs` method to be much simpler:

```csharp
public static List<T> GetFirstColumnAs<T>(this NpgsqlDataReader reader)
{
    return reader.MapResult(innerReader => (T)innerReader[0]);
}
```

I'm pretty happy with the result.

----

I believe functional programming, or the _functional paradigm_ to be more precise, is here to stay. Functional programming in terms of _functional languages_ are interesting, but have had a hard time making their way into the mainstream "top 10" list of languages; if you don't belive me, just look at the [TIOBE Index](https://www.tiobe.com/tiobe-index/) or [GitHub's Octoverse](https://octoverse.github.com/) reports. Both of these have other types of languages (typically OOP and imperative languages) in their top-10 lists. The _most_ functional language in theses lists, I'd say, is JavaScript - it's functional binding approach with `.bind(foo)` and `.apply(bar)` is pretty interesting in this aspect. But I don't think anyone would call JavaScript a "functional programming language", in the traditional sense of the word.

But: _functional programming is more than using a special language_. It's a way of thinking, where you deliberately try and avoid side effects, and focus on _reusable, generic functions_ which are only limited in terms of reusability to the point necessary for them to do anything useful.

The "functional way of thinking" can be well-applied in many modern languages: of the ones I know myself, at least C#, JavaScript, Ruby and now even _Java_ supports this pattern (with its recent introduction of lambdas). Probably other languages like Python as well, but I don't know them well enough.

In my opinion, _multi-paradigm languages_ is the way forward. It's simply silly for a language to _force_ you into a paradigm when it's not really useful for your current problem. Multi-paradigm solves this by letting _you as the developer_ choose. Ruby is a typical (and very good) example of a multi-paradigm language. I'd argue that C# and many of the others do a pretty decent jobs in this area nowadays as well.

I'm hoping the multi-paradigm approach will extend to other areas as well, like _garbage collection_ or _manual memory management_. It's really silly for a language to _force_ you into using garbage collection (like Java, Ruby, C# etc does) when you don't want it (perhaps because you want predictable performance, and GC pauses can clearly be a problem.) It's also very silly to _force_ you into manual memory management, since this is very unsuitable for many high-level problems. This is what C and C++ does.

Rust strikes a pretty good mix there, where it's "manual memory management" by default, but the compiler tries to help you do it right. There's also the option of using garbage collection (well, reference-counted shared objects to be more precise) _if_ you need it. I'm hoping to see further development in this area in the future.
