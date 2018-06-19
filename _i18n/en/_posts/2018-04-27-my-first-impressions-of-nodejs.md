---
layout: post
title:  "My first impressions of Node.js"
categories:
- javascript
- programming
---

Node.js is an interesting platform for running JavaScript in the
server-side of your web applications, with a significant amount of growth
in the last years. In this blog post I'll share some of my initial feelings
about using it with Express.js

_"What, you haven't used Node.js until now?"_ some of you might ask. Well,
not really. But that's not entirely the truth either.

As far as backend work is concerned, [Ruby](https://www.ruby-lang.org/en/)
(MRI and [JRuby](http://jruby.org/)) is the language I use the most. It
works so well that there has been little reason from a business perspective
to consider switching to something else - be it Node.js, C# or whatever.

For the web frontend build pipelines though, to orchestrate our
[Ember.js](https://emberjs.com/) apps, I have gotten in contact with
Node.js a bit - first with our [Gulp.js](https://gulpjs.com/)-based
pipeline and later with [ember-cli](https://ember-cli.com/). However, this
has only been involved in _building_ the artifacts for the apps - once the
artifacts has been generated, they are running in browser (with browser-JS)
and the backends are typically written in Ruby. So I've clearly _used_
node.js a bit, but only a very limited subset of it.

This time, however, I had the need for a new backend which I was playing
around with on my spare time and I decided to give Node.js a try.

As experienced readers of this blog are already well aware of, TypeScript
is [one of my favourite
languages](http://perlun.eu.org/en/2017/04/03/my-three-favourite-programming-languages).
Thus far, I've only used it (in a very limited amount) for some web &
Electron programming. Why not combine these two into a "dynamic duo" -
write a backend in Node.js, using Express.js and TypeScript, to get a
feeling for it?

And that's what I did. It's only a little proof-of-concept for now, and the
point of this blog post is not to talk about that project so much, but
instead go into some of the "initial reactions of Node.js and Express.js".

## Asynchrony - the big difference

One can easily claim, without exaggerating, that the fact that Node.js is
(almost) completely _asynchronous_ is definitely the biggest difference
when comparing it to virtually _any_ other programming environment (except
the web browser...) I mean, other languages often _support_ asynchronous
programming ([TPL](https://docs.microsoft.com/en-us/dotnet/standard/parallel-programming/task-parallel-library-tpl) and `async`/`await` in .NET,
[concurrent-ruby](https://github.com/ruby-concurrency/concurrent-ruby) in
Ruby and last but not least
[Rayon](https://github.com/rayon-rs/rayon) in Rust) but it's from my
experience very rare that they _force_ you to write all your code in an
asynchronous manner. This is what Node.js does.

Well, "force" is the wrong word perhaps but at least "strongly encourage".
Since the JavaScript execution engine in Node.js is essentially
single-threaded you really _want_ to write your code in an asynchronous
fashion to get decent performance.

Traditionally, it has worked like this:

```javascript
MongoClient.connect(url, function(db) {
    db.collection('timesheets').count(function(c) {
        // TODO: do something here with the result
    });
});
```

The `connect` method takes a callback, and the `count` method takes yet
another callback, and so on. You don't have to be a very experienced
programmer to realize that _this is horrible_ from a code maintainability
point of view, especially if you are dealing with multiple queries and have
to aggregate together multiple results...

Compare this with the equivalent (but synchronous) Ruby code and you'll
easily see what I mean:

```ruby
client = Mongo::Client.new
db = client.database
c = db.collection('timesheets').count
```

Much cleaner and easier to follow.

## Promises - one step in the right direction

The good people in the JavaScript community came up with _promises_ as a
way to make it easier and more pleasant to write asynchronous code. So the
code above (the JavaScript example) then becomes something like this:

```javascript
MongoClient.connect(url).then((db) =>
    db.collection('timesheets').count().then((c) =>
        // TODO: do something here with the result
    });
});
```

_Slightly_ easier to write (especially when using niceties like
[`Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)), but still, not great.

## Enter `async` and `await`

Microsoft is a great company with a lot of great engineers and other people
working on improving their products and platforms. One of the advantages
they had over the open web is that it was _easier_ for them to innovate and
make improvements to the core language and runtime. No
[TC39](http://tc39.github.io/) to take care of, no other vendors that you
have to have endless, perhaps painful discussions with. With good people
like [Anders Hejlsberg](https://en.wikipedia.org/wiki/Anders_Hejlsberg),
what else do you need? :wink:

> Of course I'm a bit sarcastic here, but there is a also a point in what
I'm saying - when they went _alone_ they were able to go significantly
faster than what the JavaScript community is now doing.

So, in 2012 Microsoft added `async` and `await` to the C# language (in
version 5.0, released with Visual Studio 2012.) I'm sure there were other
languages that had it before also, but still, Microsoft was pretty early
with this. And now we have it in JavaScript and TypeScript also. Here is
the `async`-aware version of the above:

```javascript
async function someFunction() {
    const db = await MongoClient.connect(url);
    const c = await db.collection('timesheets').count();
}
```

Do note the `async function` stuff - this is actually critical; you're not
allowed to use `await` in a non-`async` function.

The runtime (or compiler, if you are writing TypeScript and are targetting
pre-ES2017 runtimes) will do the rest for you; it will compile the code
above to a callback/promise-form. (Node.js 7 and newer supports
`async`/`await` right in the runtime, so the emitted code from `tsc` or
`babel` can use `async` and `await` all the way and the runtime will take
care of figuring out what to do.)

---

I hope we can all agree that things are clearly moving in the right
direction. The introduction of `async` and `await` into the JavaScript and
TypeScript family of languages is a great thing, and the future for Node.js
and JavaScript is looking brighter than ever before.

## Further reading

(Some of these don't really relate to what I wrote about above, but they
are still an interesting read.)

- [nodejs.org: Overview of Blocking vs Non-Blocking](https://nodejs.org/en/docs/guides/blocking-vs-non-blocking/)
- [Waiting for DB connections before app-listen in node](https://blog.cloudboost.io/waiting-for-db-connections-before-app-listen-in-node-f568af8b9ec9)
- [Making unhandled promise rejections crash the Node.js process](https://medium.com/@dtinth/making-unhandled-promise-rejections-crash-the-node-js-process-ffc27cfcc9dd)
- [JavaScript — ES8 Introducing `async/await` Functions](https://medium.com/@_bengarrison/javascript-es8-introducing-async-await-functions-7a471ec7de8a)
