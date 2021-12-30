---
layout: post
title:  "The dangers of referential equality in Java"
categories:
- programming
---

In this post I'll write about referential equality (ie the `==` operator) and why it can be _very_ dangerous to use this operator incorrectly in Java. I made this mistake today, and it is my hope that this blog post will help you to avoid doing the same mistake yourself (or at least get a good laugh). :wink:

Here was my use case today. I had some code that looked like this:

```java
    for ( IdTime<ID> idTime : result ) {
        Optional<T> matchingSnapshot = allObjectSnapshots.stream()
                .filter( obj -> obj.getId() == idTime.getId() && obj.getTime().equals( idTime.getTime() ) )
                .findFirst();

        if ( matchingSnapshot.isPresent() ) {
            latestObjectSnapshotsBuilder.put( idTime.getId(), matchingSnapshot.get() );
        }
        else {
            logger.warn( "Failed to locate latest snapshot for {} {}", dao.getTableName(), idTime.getId() );
        }
    }
}
```

`idTime.getId()` is defined to return a value of type `ID` (generic type parameter to the method in question), and I had previously used this with an `IdTime<Integer>` object. It worked correctly, and I hadn't thought much about whether the code above was correct or not.

All of that changed today. I was doing some changes to the code where I also needed to use `String` values as an `ID`. This meant that `obj.getId()` would now return a `String` instead of an `Integer`.

### `String` instances cannot be compared this way

And obviously (for those of you who know your Java by heart), this did not work. This is simple when you look at some example values in `jshell`:

```
$ jshell
|  Welcome to JShell -- Version 11.0.11
|  For an introduction type: /help intro
S
jshell> String s1 = new String("foo")
s1 ==> "foo"

jshell> String s2 = new String("foo")
s2 ==> "foo"

jshell> s1 == s2
$3 ==> false

jshell> s1.equals(s2)
$4 ==> true
```

The reason is simple: these two strings refer to _different instances_. The _content equality_ check (`s1.equals(s2)`) works, but `==` is almost always a referential equality check. Other languages (C#, I'm jealously looking at you!) have overloaded the `==` operator for the `String` class to do the least unexpected thing (i.e. check for "content equality"), but Java currently doesn't work that way. (at least not right now; Valhalla _might_ fix this if we are lucky. More about this later.)

### One gotcha: `String` literals is the exception that confirms the rule

Note, _however_, that there are exceptions to this rule. String literals with the same content are, interestingly enough, "interned" to refer to the same instance. This is [explained in JLS 3.10.5](https://docs.oracle.com/javase/specs/jls/se8/html/jls-3.html#jls-3.10.5) (but not in a very clear, readable way IMO). See this example for an illustration:

```
$ jshell
|  Welcome to JShell -- Version 11.0.11
|  For an introduction type: /help intro

jshell> String s1 = "foo";
s1 ==> "foo"

jshell> String s2 = "foo";
s2 ==> "foo"

jshell> s1 == s2
$3 ==> true

jshell> s1.equals(s2)
$4 ==> true
```

Both of these strings refer to the same `String` instance. They can be compared using both referential equality (`s1 == s2`) and value equality (`s1.equals(s2)`).

### How did this ever work with `Integer` values in my use case?

This is now the $1,000,000 question...

How did this ever work with my previous `Integer` parameter?!?

Well. There is again a significant exception to the rule, that can bite you really hard if you are unlucky. I'll start with the example from `jshell` first, and then try to explain why it works like this:

#### Boxed small integers: refer to the same `Integer` instance

```
$ jshell
|  Welcome to JShell -- Version 11.0.11
|  For an introduction type: /help intro

jshell> Integer i = 1;
i ==> 1

jshell> Integer j = 1;
j ==> 1

jshell> i == j
$3 ==> true
```

#### Boxed larger integers: _does not_ refer to the same `Integer` instance

```
jshell> Integer k = 1048576;
k ==> 1048576

jshell> Integer l = 1048576;
l ==> 1048576

jshell> k == l
$6 ==> false
```

Now, if the previous semantic details for how `String`s are handled weren't enough, this should be more than enough to make a grown man cry... :joy:

Some more details around this can be found in the [`Integer.valueOf()`](https://github.com/openjdk/jdk/blob/9a9add8825a040565051a09010b29b099c2e7d49/jdk/src/share/classes/java/lang/Integer.java#L814-L833) implementation. I can' say I know for sure, but I _presume_ this is the method that gets called by the JVM whenever an `int` (integer primitive) value is auto-boxed into an `Integer` (full Java-object with object identity, wrapping an `int`)

Interestingly enough, the code in the linked class goes as far as to say that this is actually _required by the JLS_ for values between `-128` and `127`. I presume it's a quite critical optimization in the JVM; the alternative (to always instantiate a new `Integer` object _every single time an int would be auto-boxed_ would likely lead to a huge performance impact both in terms of memory allocation and perhaps even more importantly, GC pressure).

Needless to say though, this is definitely something that can be a _huge_ gotcha in the current Java version(s). Luckily, the good people in the JDK project are actively working on improving this. Quoting the "State of Valhalla Part 2" design note linked below:

> Many of the impediments to optimization that Valhalla seeks to remove center around unwanted object identity. The primitive wrapper classes have identity, but not only is this identity not directly useful, it can be a source of bugs. (For example, due to caching, `Integer`s can be accidentally compared correctly with == just often enough that people keep doing it.)

Well, _yes_ - this was exactly what happened to me. Thanks to Sebastian Lövdahl for sharing that link with me after I had cried out to him in agony today. :grin:

### Further reading

* [State of Valhalla
Part 2: The Language Model (Brian Goetz)](https://openjdk.java.net/projects/valhalla/design-notes/state-of-valhalla/02-object-model)
