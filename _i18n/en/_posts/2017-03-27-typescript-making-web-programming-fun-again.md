---
layout: post
title:  "TypeScript: Making web programming fun again"
categories:
- programming
- typescript
excerpt_plain: "In this blog post I will share a few thoughts on why I feel TypeScript is a very valuable addition to the JavaScript/web ecosystem, and some of my initial experiences and feelings around it."

---

In this blog post I will share a few thoughts on why I feel [TypeScript](http://www.typescriptlang.org) is a very valuable addition to the JavaScript/web ecosystem, and some of my initial experiences and feelings around it.

Since this will be a bit long, here are some general notes on the structure of this post.

- The first part talks about my personal journey, from static typing to dynamic typing and eventually longing back to the world of static analysis.
- The second part talks about some of my experiences with TypeScript thus far.
- The third part talks about some of the language features I find nice (apart from the very obvious principle of _optional typing_ which is pretty much weaved into the first two parts).

## My personal journey
### Background: Static and dynamic typing

I have spent many years programming both as a job and as a spare time interest, working both with statically typed languages (Pascal, C, C++, Java, C#) and with dynamically typed languages (Perl, PHP, Ruby, CoffeeScript/JavaScript, and even some Python lately). I used statically typed languages first, and then moved over to the dynamic world. It was an interesting move; at first, I was skeptical (like others) as to if I would really manage to write good programs without typing information embedded into the source code, and if the editing experience would be good enough. I was probably a bit scared of it, actually.

Then, gradually I started liking it quite a lot. Hey, even the _intellisense_/code completion (with the Atom editor) was sometimes even _better_ with Ruby code than what C# with Visual Studio would have been able to offer. And the level of productivity was great! You could get things done, and it was fast and fun. You never had to wait for a recompile, you would just save your file and run your HTTP request and see the effect of your last change _instantly_. This experience is hard to beat really.

However, eventually I started having second thoughts. In larger projects, the lack of typing information started to become painful. The supposed "solution" to this was unit testing (and let me make one thing clear: this is _not_ a post against the use of unit testing). However, the problem with this is that you don't always have full control over a project. It's not so easy to _force_ everyone else to use unit testing, especially when they are unfamiliar with it, when they don't see the full value of it, and when the project budget/time schedule is so constrained that you can't really "squeeze it in" without running into other problems. To me, it is a fact that unit testing costs money, at least in the short term when not everybody are full blown TDD/BDD experts. Yes, you can save time on it, but it will also sometimes take time.

This leads me to my conclusion: you can somehow evade the voice saying "cover your code with tests", but you _cannot_ for any reason evade the voice saying "compilation failed". :laughing: From my perspective, in real-world scenarios, the compiler wins; there's no way you can "cheat" your way around it. You _have_ to make your code pass through the compiler!

There is also another huge win with statically typed languages: they give you a way to express the type information you likely already have in your head anyway. In many, many cases you already _know_ that a parameter coming in to your function has a particular type. The method won't really _work_ unless it is given the correct types anyway. But this information that you have in your head, that the `name` parameter is of type `String`, cannot really be _stored_ in the program source code in a purely dynamic language. The dynamic language in fact forces you to throw away this information, which would otherwise serve as very useful documentation both to yourself and others when reading the code at a later stage.

So, in the last year or two, I have started to feel that dynamic languages really fall short in these areas, and that's quite frustrating when you work with them a lot (I spend about 80% of my professional programming writing Ruby code).

That, in combination with an old Silverlight out-of-browser app that needed to be replaced with an Electron app, had made me investigate TypeScript. I also feel that the language has matured enough since it was initially released in late 2012. It even has some very nice features that make it more advanced than older languages like C#; I will get back to some of these later in this post.

### Ending the war: Optional typing as a reasonable compromise

What I find so great about TypeScript is that _it doesn't really force you_ to do anything. If you like, you can write TypeScript code completely without any type specifiers at all. There are also cases of dynamism where you take advantage of the fact that the type checking happens at runtime, cases that would be really hard to implementing in more traditional statically typed languages. But TypeScript and its companions in this area (like Groovy) take a different standpoint than the age-old ["static vs dynamic" war](https://gist.github.com/non/ec48b0a7343db8291b92). They don't force you to choose, but instead lets you have the best of both worlds:

- **Static typing** in cases where the type of variables and parameters is known, and no other permutation is useful, _or_
- **Dynamic typing** in cases where you want the code to be more "duck typed", or perhaps for the reasonable situations where parameter `foo` can be of different kinds (say `String` or `Hash`) and be handled differently. Yes, this is arguably an anti-pattern, but I think it serves a useful purpose at times.

I think the idea of optional typing is great, and I can't really see _any_ reason why other languages like Ruby shouldn't also adopt this approach. (However, [Matz seems stubborn](https://bugs.ruby-lang.org/issues/9999), even though people like Tony Arcieri has been [trying to convince him](https://tonyarcieri.com/an-open-letter-to-matz-on-ruby-type-systems) to change his mind. I feel it's probably unlikely that we will see optional typing in Ruby anytime soon, which is really sad because it would make writing Ruby code a lot more fun. :cry:)

----

Optional typing means you can _start_ writing your code like this:

```typescript
function logMessage(s) {
    console.log(s);
}

logMessage('foo');
```

Plain and simple, looks just like Javascript. But then you want to make your code more robust (by adding the type specifier, `String` in this case), and also add another parameter:

```typescript
function logMessage(s: String, logLevel: Number) {
    console.log(s);
}

logMessage('foo'); // Error: only one parameter provided.
```

If you open up a `.ts` file in [Visual Studio Code](http://code.visualstudio.com/) and paste that content, it will immediately show you an error (indicated by squiggles). If you read the error message, it says: something like `'Supplied parameters do not match any signature of call target.'`. In other words, a _compile-time_ error indicating that you need to fix your code. The fact that you get all this _right at the point of typing the error_ is one of the big points of all this: the time span from making the error (when writing the code) to when you realize it is very short, which makes the error a whole lot easier to fix. You haven't mentally context switched to any other part of your code, but you can work on a single part of the code base _until it works_ (or at least compiles), and then move over to the next part.

This is one of the big boons of static typing, and TypeScript lets you get it as an opt-in feature. To me, that is being a _pragmatic programmer_ - not dogmatic, but open to new ways of thinking around how to write code in a good way. If you don't feel you need it - just don't use it, but if you (like me) are starting to feel that adding the type annotations really make it easier to understand the code, _the language will let you_ add the annotations instead of forcing you to not do it.

Alright, that was the first part, the background to _why we need a new programming language_ for the web. Some of you might find it odd that I speak about Ruby and TypeScript in the same block of text. Of course they are not "direct competitors" (the Ruby runtime(s) are IMHO a lot more competent than the Node.js one, and the ecosystem is more mature), but to me, they are different tools I can use to solve a particular problem. I also hope that TypeScript's success will eventually pave the way for optional typing in other languages as well (I might have to switch to Python in the end if Matz persists in his stubbornness. :wink:)

Now, what I have done so far with TypeScript?

## My first steps with TypeScript

I did some initial experiments with various frameworks, to get a feeling of what the editing/overall experience would be. The use case here would as mentioned be an Electron-based app. I have previously used Ember.js at work, so I tried using it with Electron and TypeScript [here](https://github.com/perlun/electron-ember-typescript-example) (September 2016)

The experience wasn't really perfect there; Ember.js doesn't _yet_ play so well with TypeScript but [they are working on it](https://discuss.emberjs.com/t/ember-and-typescript/2898).

I also tried out Angular 2 (which emphasizes its TypeScript support). [Here](https://github.com/perlun/electron-angular2-quickstart) is the test I did there (also September 2016). However, I wasn't very pleased with Angular 2; the very idea of [mixing your html code into your components .ts file](https://github.com/perlun/electron-angular2-quickstart/blob/master/app/app.component.ts) looks just odd and I can't really understand how this can be the default for a serious web project?!?

Anyhow, it was still me just scratching the surface and the project wasn't really officially started. Instead, I moved on to something entirely different, namely [_my first TypeScript PR_](https://github.com/Microsoft/vscode/pull/15591) (November 2016). Sadly, it got rejected but maybe it was a bit too massive for the maintainers to accept, especially since I had no previous record of contributions to the project... But still, it was an extremely nice experience! I really got an experience of _refactoring with TypeScript_, and it was very C#-like, in a positive sense of that word. You made a change, saw how the code didn't compile, could sit and work with it until it was all done, with very fast (instant) feedback along the way. Just like it _ought_ to be, but not all languages work that way.

Then I discovered Aurelia.

### Aurelia: When it started to _really_ become fun

[Aurelia](http://aurelia.io/) is a pretty new web framework (was introduced to the public in [January 2015](http://eisenbergeffect.bluespire.com/introducing-aurelia/)). It's definitely less mature than Ember.js and much less commonly used than both Ember.js and Angular 1/Angular 2. _But_ it is still a very good framework, and one of the best parts of it is that it is (just like Angular 2) built very much with TypeScript in mind. This is really not so surprising, given that [it's main author used to work on Angular 2](http://eisenbergeffect.bluespire.com/leaving-angular/), but left because he felt the project wasn't heading in the right direction (more details in the linked article).

Anyway, if you want a framework that really plays well with TypeScript and takes advantage of it, and feels much "easier" to get started with than Angular 2. Aurelia has made some good decisions on how to structure things and I definitely would choose it any day over Angular 2.

Some of the good parts in Aurelia are:

- No `this.set('foo', 'bar')` as we have it in Ember.js. Instead `this.foo = 'bar'` is enough; Aurelia uses the modern Javascript features to get this accomplished.
- Takes advantage of [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html), which means that you do clever things like this:

```typescript
import { autoinject } from 'aurelia-framework';

@autoinject
export class CustomerEditScreen {
  // The CustomerService, CommonDialogs and EventAggregator will be automatically injected whenever the
  // CustomerEditScreen gets instantiated.
  constructor(private customerService: CustomerService, private dialogs: CommonDialogs,
              private ea: EventAggregator) {
    this.customer = null;
  }
}
```

- Reasonable "convention over configuration" approach with a set of defaults, but not a _strong_ set of defaults - you can override them as needed, if you have a corner case that the framework authors didn't really think of.

## Language features in TypeScript

I want to wrap this all up by writing about some of the other really nifty features of the TypeScript language.

As mentioned in the beginning of this post, optional typing is one of the big wins in TypeScript. But there is more to it than _just_ being able to enter the expected type for a parameter. TypeScript, to me, feels like a very modern OOP-style language, for example in these areas:

- **Strong type inference**. As many of us know, statically typed languages can get very obnoxious at times. Who want to write code like this? (C# example)

```c#
SomeObject foo = new SomeObject();
```

Luckily for us, TypeScript just like its cousin C# has good support for type inference. In fact, it has even _better_ type inference than C#. Just look at this example:

```typescript
function foo() {
    return "bar";
}

var i: Number;
i = foo(); // Compile-time error: 'Type 'string' is not assignable to type 'Number'.'
```

How on earth can that work? Well, the TypeScript compiler looks at the code and concludes that all return paths return `String` objects. So, the method's return type becomes `String`. Magic!

Another, somewhat related feature:

- **Implicit interface implementation**

In languages like C#, the static typing can really get in the way (yes, I'll willingly admit that, even though I am a strong fan of static typing). For example, what if a 3rd party class has a particular set of method signatures that _resembles_ a strongly given interface, but doesn't _explicitly_ implement the interface? It won't work; if you try to cast the object to the interface type, you will get a compile-time error (or an `InvalidCastException` if it happens at runtime).

In TypeScript, our friends at Microsoft have solved this in an extremely elegant way. Meet _implicit interface implementation_:

```typescript
interface IService {
    sendMessage(s: String);
}

class Service { // Does not explicitly implement IService
    sendMessage(s: String) {

    }
}

var svc: IService;
svc = new Service(); // No compile-time error!
```

Say what?!? How can this ever work? Well, again, the TypeScript compiler takes a look at your code and does its very best to try and conclude "does the class implement everything needed to satisfy the interface". Since all methods from the interface exist in the class, and the signatures look similar enough, the TypeScript compiler draws the conclusion that the interface constraints are satisfied.

To me, this is really taking "duck typing" to the next level. :smile:

----

Alright, that's all for me for this time. Hope you enjoyed the ride, see you soon again.
