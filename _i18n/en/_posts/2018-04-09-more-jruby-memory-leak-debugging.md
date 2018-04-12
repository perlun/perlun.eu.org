---
layout: post
title:  "More JRuby memory leak debugging"
categories:
- programming
---

I thought we were done with this for now, but apparently I was wrong. It just
happened to take a couple of weeks before the server went down to its knees
this time...

The above is a reference to [the last time](http://perlun.eu.org/en/2018/02/27/jruby-memory-leak-hunting-wrestling-with-a-gigantic-ruby-object-var5)
I was debugging this. We did indeed find a likely cause of the leak there, and
after updating to a version that didn't use this Celluloid code, things worked
a lot better. I got one report a while ago about memory shortage, but I logged
on there and took a memory dump - the heap was just 200 MiB, and the memory
dump triggered a GC that seemed to make things better, so I left it for the
time being.

Until now, that is, when I started receiving [Sentry](http://getsentry.io/)
errors like these:

```
Java::JavaLang::OutOfMemoryError: Java heap space
Sequel::DatabaseError: Java::JavaLang::OutOfMemoryError: Java heap space
```

This time, it _was_ actually really using a lot of memory. The heap dump was
larger than 2 GiB. I used `jcmd` like last time and got a heap dump, then
restarted the server.

Transferring a 2 GiB file from a Windows machine to another is not so easy, I
got errors when trying to copy it using Remote Desktop. I ended up using a [Ruby one-liner web server](https://gist.github.com/willurd/5720255)
and then [cURL:ed](https://curl.haxx.se/) it down to my local computer.

Remembering that MAT was problematic last time, I decided to try with Java
VisualVM this time instead, as I was suggested in [this Twitter thread](https://twitter.com/perlundberg/status/968950707180187648)
and [this great blog post](https://engineering.talkdesk.com/ninjas-guide-to-getting-started-with-visualvm-f8bff061f7e7)
@ninja was referring to.

One obvious advantage with Java VisualVM was that it would start without
any major problems. :wink: (I used Java 8, out of old habit - I assumed it
would work best, since the heap dump was from a Java 8 process. Thinking
more about it, that shouldn't really matter actually.)

"Compute retained size" which can be useful to find large objects
seemed to take _a long_ time to run on this 2,439.4 MiB large heap dump.
We're talking more than 30 minutes.

Once it was done though, the result was pretty interesting though:

![Largest objects by size](/images/2018-04-09-more-jruby-memory-leak-debugging-1.png)

A RubyArray taking up almost _1,5 gigabyte_, that's definitely an interesting
suspect to start the investigation with. _Who_ has been allocating this
array and what is its content?

The answer: a huge amount of `IRubyObject` instances:

![A lot of IRubyObjects](/images/2018-04-09-more-jruby-memory-leak-debugging-2.png)

This is one of the clear downsides of debugging higher-level languages like
Ruby down on the "bare metal" level (i.e. using a JVM heap dump like this.)
Sure, it's _useful_ but it would be much nicer if we could see _what_ these
`IRubyObject`s are, right?

## Seeing a pattern

Looking at these objects briefly gave me these indications:

- The objects seemed to be `RubyHash` objects.
- They all seemed to be, interestingly enough, 813 bytes large.

This picture illustrates it well:

![Seeing a pattern](/images/2018-04-09-more-jruby-memory-leak-debugging-3.png)

At this stage, I was reminded of [Oleg Dashevskii's epic blog post](http://www.be9.io/2015/09/21/memory-leak/),
where he used some really good debugging techniques and eventually found a
memory leak in a C extension - [it would leak 320 bytes on every render call](https://github.com/vmg/redcarpet/pull/516).

Surprisingly, we seem to have a similar pattern here, in the sense that _the
same amount of memory is leaked every time_. So we probably have a case of
_some_ Ruby array in our code, somewhere (either in our own code or in a
3rd-party gem), that adds Ruby Hash objects to an Array on semi-regular
occasions. That Array never gets cleared, or so it seems => hence, memory is
never reclaimed to the Java runtime.

Looking at the Hash objects, they seemed to contain an item at location 6 in
the underlying `table` structure. I tried inspecting this with an OQL query
like this:

```
select x.table[6].key from org.jruby.RubyHash x where x.size = 813
```

## A single Ruby symbol being used many times

The result was this:

![Many instances of the same RubySymbol](/images/2018-04-09-more-jruby-memory-leak-debugging-4.png)

It would be interesting to see what this symbol is, wouldn't it? I tried
changing the query to `select x.table[6].key.toString() from
org.jruby.RubyHash x where x.size = 813` instead; however, it didn't really
give me the real symbol contents - instead, I just got
`org.netbeans.lib.profiler.heap.InstanceDump@1d6c5e34` which isn't so
incredibly helpful. Here, MAT actually worked better than JVisualVM, but the
data structure is a bit more complex this time to be honest.

However, something that _did_ work great was accessing a (private) field,
which I discovered by [reading the JRuby source code](https://github.com/jruby/jruby/blob/e8dfcb420149cdc9d5a7930a21806a174ccdc6a8/core/src/main/java/org/jruby/RubySymbol.java#L82)
of the class in question.

```
select x.table[6].key.symbol from org.jruby.RubyHash x where x.size = 813
```

This would then give me this result:

![PoNumber being part of the problem](/images/2018-04-09-more-jruby-memory-leak-debugging-5.png)

`PoNumber`, or Purchase Order number - this is interesting. This is definitely
"our code", not some 3rd party gem or something. Purchase Order numbers is a
common term in the ERP systems we work with.

## Digging deeper into the data, finding out more about the problem

I looked some more at the underlying table of the RubyHash object and
concluded that entry 6, 8 and 10 seemed to be used:

![RubyHash used table entries](/images/2018-04-09-more-jruby-memory-leak-debugging-6.png)

So I adjusted the code to display these entries in the query (the syntax of
OQL was a bit different to SQL, so I couldn't just do `select foo, bar, baz` -
it would just display a single column in the list. However, mapping it to a
JSON object like this worked fine for my use case right now.)

```
select {
    key6: x.table[6].key.symbol,
    key8: x.table[8].key.symbol,
    key10: x.table[10].key.symbol
}
from org.jruby.RubyHash x
where x.size = 813
```

This gave me now some really good help in pinpointing the problem:

![The "bad" field names](/images/2018-04-09-more-jruby-memory-leak-debugging-7.png)

So, they are `PoNumber`, `PoLineNumber` and `MoNumber`.

I was interested about the actual _values_ now, but it was hard - I couldn't
just `toString()` the `RubyString` object in
`x.table[6].value`. I tried with calling [`decodeString()`](https://github.com/jruby/jruby/blob/e8dfcb420149cdc9d5a7930a21806a174ccdc6a8/core/src/main/java/org/jruby/RubyString.java#L771)
but it just returned `undefined` which wasn't so incredibly helpful.

The underlying data structure being used by RubyString is the nice little [ByteList](https://github.com/jruby/bytelist/blob/master/src/org/jruby/util/ByteList.java)
class. I tried printing out its `stringValue` but it would again be just
`undefined` which wasn't so helpful - _unless the actual value was
undefined_??? (I realized this while writing it - you can't really
underestimate the value of talking to your blog readers when debugging these
kind of complex, hard problems.)

I looked at the bytes manually, converting them to a string using a silly
little C program:

```c
#include <stdio.h>

int main(void) {
    char s[11] = { 49, 50, 52, 53, 52, 54, 52, 32, 32, 32, 0 };
    printf("%s\n", s);

    return 0;
}
```

Indeed, it wasn't `undefined` - it was `1245464   `.

## Looking at the application-level code

There were only two different Ruby scripts that used these three names, so I
looked more closely at these.

Nothing obvious surfaced, which is both _good_ (that we hadn't been obviously
sloppy) and _bad_ (because it makes it harder to solve the problem) at the
same time... I decided to try and reproduce some of this behavior locally.
Since I had access to the application code, I set up so I could run it on my
machine (it's an application developed jointly with us and the customer, with
the majority done by them, which explains why I didn't have it already or
could just take it from our own GitHub repo or something.)

Once I had it set up, I attached my VisualVM to the process and put it under
`siege`, to get the memory usage to increase a bit:

```
$ siege -v -c 15 http://localhost:8000/path-number-one
```

(I only let it run for a short while, since it was hitting the production
database at the customer.)

This is what the memory Heap Histogram looked like:

![The memory Heap Histogram](/images/2018-04-09-more-jruby-memory-leak-debugging-8.png)

I couldn't see anything obvious while looking at the memory sampler, so I took
a heap dump to be able to run a OQL query to potentially find these `RubyHash`
instances again.

```
select {
    key6: x.table[6].key.symbol,
    key8: x.table[8].key.symbol,
    key10: x.table[10].key.symbol
}
from org.jruby.RubyHash x
where x.size = 813
```

This query did _not_ work; I would get an error saying
`javax.script.ScriptException: TypeError: Cannot get property "key" of null in
at line number 1`. I removed the result transformation and tried just querying
for `x` instead, for starters.

I looked at the result, and it seemed to include a bunch of uninteresting
hashes, which were not the ones I was looking for. Perhaps this was just a
coincidence; querying for RubyHash objects of a particular _size_ can
naturally give a few false positives.

I tried tweaking the query a bit, but it was indeed hard to get some progress
here.

## The importance of taking a break every once in a while

Then I went for a lunch break and had some really good thoughts. (Breaks are
good! They are actually a really important of getting your work done sometimes.)

- The reason why it behaves differently could be caused by a difference in the
  Java or JRuby version. Also, the production environment was running on
  Windows where I was running on macOS.

- Perhaps even more likely: the OQL query returned a huge number of rows in
  the production heap dump. What if these "false positives" are available
  there, but they are just so late in the result that they don't get included?
  Only the first 100 rows are normally shown here.

I realized that I could probably just write a simple Javascript function to
handle these differences. This ended up not being as simple as I had hoped (I
couldn't seem to combine a `select` query with custom functions being
defined), so I wrote my logic inline in the query instead:

```
select {
    key6: x.table[6] && x.table[6].key.symbol,
    key8: x.table[8] && x.table[8].key.symbol,
    key10: x.table[10] && x.table[10].key.symbol
}
from org.jruby.RubyHash x
where x.size = 813
```

Unfortunately, the result wasn't very exciting:

```javascript
{
key6 = java.lang.String#21493 - executables,
key8 = java.lang.String#21481 - version,
key10 = java.lang.String#21478 - cert_chain
}

{
key6 = undefined,
key8 = undefined,
key10 = undefined
}

{
key6 = undefined,
key8 = undefined,
key10 = undefined
}

{
key6 = undefined,
key8 = undefined,
key10 = undefined
}

{
key6 = undefined,
key8 = undefined,
key10 = undefined
}

{
key6 = undefined,
key8 = undefined,
key10 = undefined
}

// ...
```

Maybe I had to rewrite the whole query in Javascript after all. [This gist](https://gist.github.com/bonifaido/2464414)
by @bonifaido was helpful - thank you!

## Being surprised by the language syntax

This was the time when I realized that my querying syntax was probably _wrong_.

I tried rewriting the filtering using a Javascript filter function instead:

```javascript
function isCandidateHash(c) {
  return c.size == 813;
}

filter(heap.objects('org.jruby.RubyHash'), isCandidateHash);
```

However, the problem with the code above was that it didn't return any
rows.

I tweaked my original OQL query, only to be _very_ surprised:

```
select {
    key6: x.table[6] && x.table[6].key.symbol,
    key8: x.table[8] && x.table[8].key.symbol,
    key10: x.table[10] && x.table[10].key.symbol
}
from org.jruby.RubyHash x
where x.size = 12321321
```

_Whatever_ value I put there in the `x.size = foo` condition seemed to give me
the same results. :astonished: I started suspecting that it should actually be
`==` instead. Grr!

I looked at the heap dump some more, and couldn't see any obvious pattern in
the list of `RubyHash` objects. I had made about 100 requests; if there was
indeed a leak on each request like in my previous heap dump, I should be
seeing 100 identically-sized hashes. Which I didn't.

I decided to try and run this towards the customer test environment instead,
where it would be less of a problem if I would hammer in a few tens of
thousands of requests or something. But first, I looked once more at the user
code to see if there could be _anything_ that would leak in this code.

Nothing apparent, but I did found a potentially incorrect usage of the [Sequel](http://sequel.jeremyevans.net/)
gem. I'm not sure about anything at this stage, but... who knows!

I also switched over to the other (potentially faulty) script here, since I
hadn't had any great luck with reproducing it with the first script.

I enabled the VisualVM profiler, and put the server under `siege` again. I
also took a snapshot in the profiler at an early stage, to try out the
"compare snapshots" functionality in VisualVM.

With the profiler enabled, and a pretty heave SQL query, it was rather slow so
I canceled the siege hammering after a mere 50 requests.

Comparing the snapshots counter-proved me, unfortunately:

![RubyHash decreasing in Live Bytes](/images/2018-04-09-more-jruby-memory-leak-debugging-9.png)

In the heap dump I was looking at earlier, we saw a giant RubyArray with a
huge number of RubyHash objects. Here, the number of live RubyHash objects was
actually _decreasing_. It was the same when looking at `RubyArray` usage, it
was actually decreasing in size.

## Going back to the original heap dump

Reproducing this seemed surprisingly hard. I could try setting the application
up on a local Windows VM, copying the exact Java & JRuby versions from the
remote server, but I wouldn't have any _guarantee_ that it would help. I think
I would be better off debugging this in the live environment in that case,
i.e. by running VisualVM on the production server. But first, I decided to
look a bit more at the original heap dump. Could we find _anything_ more about
what parts of the code was holding references to this giant `RubyArray`
instance?

(Loading the heap dump and computing the "Retained Sizes" of it took a long
time, as mentioned before, so I tried getting VisualVM working on the server
in the meanwhile. This was a bit complex, since I had to [enable JMX](https://stackoverflow.com/questions/856881/how-to-activate-jmx-on-my-jvm-for-access-with-jconsole)
in the startup parameters for my Java process, and restart it.

I played around with VisualVM on the server, but it wasn't so easy to get
anything sensible from it right after the restart; I was also using a newer,
fancy version of VisualVM with a quite different user experience I wasn't yet
so familiar with so... it was hard. In the meanwhile, calculating the retained
sizes was done so I switched to my local session.

So, `org.jruby.RubyArray#6922` - _who is holding a reference to you_?

![A CallBlock](/images/2018-04-09-more-jruby-memory-leak-debugging-10.png)

Not incredibly useful. I was really missing the "Shortest path to the
accumulation point" feature in MAT here. Maybe VisualVM has something like it,
but I decided to cheat at this point and switch over to MAT again. At the end
of the day, what's important is that we get the job done, not that we use a
particular tool.

Opening MAT and loading the heap dump gave me very much the same overall
picture as with VisualVM:

![Leak Suspects](/images/2018-04-09-more-jruby-memory-leak-debugging-11.png)

## An interesting detail in the reference hierarchy

Opening the details of "Problem Suspect 1" however, was _very_ interesting:

![Leak Suspects](/images/2018-04-09-more-jruby-memory-leak-debugging-12.png)

Do you see that line? `puma-3.11.2-java/lib/puma/server.rb:355` - that's _not
our code_ actually! I immediately jumped into my editor to see what that code
looks like:

```ruby
        while @status == :run
          begin
            ios = IO.select sockets
            ios.first.each do |sock|    # line 355
              if sock == check
                break if handle_check
              else
```

Hmm, very strange - it seems extremely unlikely that that line has anything to
do with it. I wonder if this could be a bug in JRuby, showing an incorrect
line number there or something.

I tried opening the object instead, viewing its inbound references:

![RubyArray with inbound references](/images/2018-04-09-more-jruby-memory-leak-debugging-13.png)

The `result` is the one that is most interesting here, so I opened that object
with _its_ inbound references. Unfortunately, it was hard for me to get
anywhere here.

The huge heap dump was a bit awkward to work with, added to the fact that I
wasn't really getting anywhere here, so I decided to look at the server
instead, where the current heap size was a lot smaller.

I then noted something incredibly interesting. _This RubyArray is a [GC root](https://www.dynatrace.com/resources/ebooks/javabook/how-garbage-collection-works/)_.
So the `Ruby-0-Thread` in the image above is likely the actual thread that
created it, and the thread/object that causes it to be a GC root.

I looked a bit more in the Puma code and concluded that this is probably where
the thread is created:

```ruby
      if background
        @thread = Thread.new { handle_servers }
        return @thread
      else
        handle_servers
      end
```

But why _on earth_ is this thread creating a giant Array, storing 1 883 880
RubyHashes in it?

> I had to leave the office for the day, even though I wasn't finished with
this. (That's something you have to learn to get used to when debugging
complex problems; you will often have to pause the work and resume later. Some
people tend to dislike this - they tend to just bang their head to the wall,
staying late in the office etc. Even though you _can_ do that, given family
conditions and others, it's typically not a good idea anyway. We are more
productive when we have regular breaks, not to mention the best ideas
sometimes comes when you are in the shower, in your bed, walking the dog
etc...)

## Looking more at the original OQL query

Unfortunately, one _disadvantage_ of leaving the debugging until the day after
here was that VisualVM stopped working. I was hesitant to shut it down since
calculating the "retained size" was such a heavy operation given the size of
the heap dump, so I looked at the live data in the production environment
instead.

Comparing with the heap dump from yesterday, the memory usage was only up
slightly - from 117 MiB yesterday to 128 Mib today. Not very much. The number
of objects was up from 1 944 817 to 2 112 389.

I switched over to the older version of VisualVM, since I was more familiar
with it and likely more productive in the debugging.

I ran a modified version of the original query, using `==` instead of `=` (It
should be criminal to make an SQL-like language with different semantics on
critical operators, btw...):

```
select {
    key6: x.table[6].key.symbol,
    key8: x.table[8].key.symbol,
    key10: x.table[10].key.symbol
}
from org.jruby.RubyHash x
where x.size == 813
```

However, there were no matches using this query. After having re-opened the
heap dump and waited for "Computing retained sizes" on my local VisualVM, I
tried it there as well and it gave the same result.

## Invalidating the previous analysis

So... does this mean all I've done until now is invalidated? Hopefully not,
but it clearly shows that _some_ of it might be invalid. After looking a bit more, my conclusion is "not really":

```
select {
    key6: x.table[6].key.symbol,
    key8: x.table[8].key.symbol,
    key10: x.table[10].key.symbol,
    size: x.size
}
from org.jruby.RubyHash x
```

The results look like this:

```javascript
{
size = 3,
key6 = java.lang.String#124124 - PoNumber,
key8 = java.lang.String#124821 - PoLineNumber,
key10 = java.lang.String#124824 - MoNumber
}

{
size = 3,
key6 = java.lang.String#124124 - PoNumber,
key8 = java.lang.String#124821 - PoLineNumber,
key10 = java.lang.String#124824 - MoNumber
}

// ...
```

So _size_ is not really the "retained size" in this case, but the size of the
hash, i.e. the _number of non-null elements in it_... :man_facepalming:

Utilizing this new realization, I constructed a new query to run towards the
production dump:

```
select {
    key6: x.table[6].key.symbol,
    key8: x.table[8].key.symbol,
    key10: x.table[10].key.symbol
}
from org.jruby.RubyHash x
where x.size == 3 &&
x.table[6] != null &&
x.table[8] != null &&
x.table[10] != null
```

Sadly though, I did not get any results from this. When running it locally, it
worked great though so I wonder if it could be that it hasn't started leaking
in production yet - which is _weird_, but would explain why I had problems
reproducing this locally.

I think, what I will do is to apply @ninja's suggestion and add the
`-Xreify.classes=true` option to the JRuby startup parameters and see if makes
any bit of a difference. I will then leave this running for a week or so,
after which I should have a new sample of data that I can look at. _Maybe_,
just _maybe_ that will help me find a way forward here.

## Ideas about the root cause

Before I'll leave this for now, I want to show some of the code of the
_suspected_ problem file here:

```ruby
def get_material_for(mo_number, db)
  db[:MWOMAT]
    .inner_join(
      :MITMAS, { :MMITNO => :VMMTNO, :MMCONO => 1 }
    )
    .where(
      VMMFNO: mo_number,
      VMCONO: 1
    )
    .select(
      :VMMSEQ.as('SeqNumber'),
      :VMRORC.as('RefCat'),
      :VMRORN.as('RefNumber'),
      :VMRORL.as('PoLineNumber'),
      :VMMTNO.as('ItemNumber'),
      :VMWMST.as('MaterialStatus'),
      :MMDWNO.as('DrawingNumber'),
      :MMSTAT.as('ItemStatus'),
      po_line_subselect.as('PoText')
    )
    .map do |row|
      row[:MoNumber] = (row[:RefNumber] if row[:RefCat] == REFERENCE_ORDER_CATEGORY_MO) || ''
      row[:PoNumber] = (row[:RefNumber] if row[:RefCat] == REFERENCE_ORDER_CATEGORY_PO) || ''
      row[:PoLineNumber] = nil if row[:PoLineNumber] == 0
      row.delete :RefNumber
      row
    end
end
```

This uses [Sequel](http://sequel.jeremyevans.net/) querying to retrieve data
from the M3 database, using Sequel's abstraction layer on top of SQL.

The interesting thing is that:

- The leak hashes seem to contain _these very symbols_ as the keys:
  `MoNumber`, `PoNumber` and `PoLineNumber`. It is as if these hashes never
  get collected. The fact that it's a block here (`.map do |row|`) being
  called also coincides pretty well with what we saw earlier, since a block
  seems to be holding on to a reference to this array...
- We use the [`.map`](http://sequel.jeremyevans.net/rdoc/classes/Sequel/Dataset.html#method-i-map)
  form in Sequel here, which does _not_ convert the whole result to an array
  first, but it yields the result as it loads data from the database. This is
  a pattern that technically should be better, but I've personally not used it
  much (if at all), so... it _could_ theoretically be part o the problem.

Another method that's perhaps even _more_ susceptible to being the problem is this:

```ruby
def get_po_numbers_for_purchase_orders(mo_numbers, db)
  db[:MPLINE]
    .where(
      IBCONO: 1,
      IBRORN: mo_numbers
    )
    .select(
      :IBRORN.as('MoNumber'),
      :IBPUNO.as('PoNumber'),
      :IBPNLI.as('PoLineNumber')
    )
    .to_a
end
```

The reason being is that it creates hashes with _these exact fields_ in them.
The result from this query is indeed also being used from a block, but it all
looks sane to me:

```ruby
sequel do |db|
  rows = get_material_for(request[:MoNumber], db)
  mo_numbers = get_mo_numbers(rows)
  po_number_rows =
    get_po_numbers_for_planned_purchase_orders(mo_numbers, db) +
    get_po_numbers_for_purchase_orders(mo_numbers, db)
  update_mo_rows_with_po_info(rows, po_number_rows)
  rows.map do |row| rtrim_strings!(row) end
end
```

Sure, we are allocating new Hash objects here and Arrays, but I can't see how
this could would start piling up all this data over time.

So, no obvious source of leakage here. I'll leave this now until next week
sometime and give it a new look; it's probably best to wait until the Java
heap is about 500 MiB or something so we have a larger dataset to work on. I
also thought about adding debug code; we could add a dummy field in the
`get_po_numbers_for_purchase_orders` method, just to be able to see if we can
see it being present in the `RubyHash` objects in the heap dump afterwards.

The needle in the haystack _is_ there somewhere, but indeed, the haystack
seems quite large and the needle quite tiny at this stage...

## Leaving it running

After a few days, I got an email from Sentry, saying that the server was
out of memory again. I logged on using Remote Desktop, and the usage was
pretty high but just forcing a manual GC made it go down to something like
100 MiB. Nothing to worry about for now, and no obvious sign of leakage. I
left it running _again_.

Actually, I left it running for a _long_ time. The next time I revisited
this (because of automated alerts I received from our Sentry logging
system), the Java process had been running for a total of 941 hours, or
almost 40 days.
