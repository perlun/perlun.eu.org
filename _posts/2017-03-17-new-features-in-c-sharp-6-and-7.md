---
layout: post
title:  "New features in C# 6 and 7"
categories:
- programming
- dotnet
- csharp
---

In this blog post, I will share some of my thoughts on the recent years of development in the .NET world, eventually leading up to the release of C# 6.0 in 2015, and C# 7.0 now in 2017 (it was released 10 days before this blog post was written).

## Introduction

First, let's make one thing very clear: Microsoft are not who they used to be. At one time, Microsoft was perceived quite "evil" if you like: a monopoly-oriented company with a very large market share, but with very little technical excellence and a seemingly very narrow-minded way of thinking. It was really Windows-only, IIS-only, and IE-only. Either you accepted the One Microsoft Way to see things, or you were in for problems.

This has clearly changed to the better, and I believe that [Satya Nadella](https://en.wikipedia.org/wiki/Satya_Nadella) is one of the reasons for this. He has had a very positive impact on the company, in my opinion. His decision to really "open up" things have really led to some great things, including:

- The open source release of the .NET Framework ([.NET Core](https://www.microsoft.com/net/download/core)), opening up the .NET development to a much larger audience of potential contributors, and also making it cross-platform (Windows, macOS, Linux), making it much more generally useful.
- [Windows Subsystem for Linux (WSL)](https://msdn.microsoft.com/commandline/wsl/about), making it possible to run an unmodified Ubuntu on top of Windows 10.

I feel very positive about this, and it has been a part of making me interested in what Microsoft is up to again. After all, I have been using macOS since 2011 now, so for me, the cross-platform part is a rather important aspect of this. I have played around a bit with their latest programmer tools (.NET Core 1.x on macOS and Linux, [Visual Studio Code](https://code.visualstudio.com/) and thus far, I am very pleased with them.

Anyway, after this long-winded introduction, let me share some of the things I appreciate in C# 6.0 and 7.0

## C# 6.0

As noted in the introduction above, C# 6.0 has been out for a while at the time of writing (two years). Still, I haven't used it _that_ much since most of my (professional) work is Ruby-based these days, but these are some of the really nice things I've started using in the C# projects which I still work on.

### Expression bodies on method-like members

This is a way to write code which actually, funnily enough, is a bit more like Ruby. Here is the Microsoft-provided example from [their wiki page about C# 6](https://github.com/dotnet/roslyn/wiki/New-Language-Features-in-C%23-6):

```csharp
public void Print() => Console.WriteLine(First + " " + Last);
```

You can also have multiple lines, and what's not shown in the example above is that if you return a value, you may omit the normal `return` statement completely (which is very much like Ruby and Rust). Like this, single-line example first:

```csharp
public static DateTime FromOADate(double days) => new DateTime(1899, 12, 30).AddDays(days);
```

...and here a much more complex, multi-line example:

```csharp
private static MethodInfo GetMethodForSubcommand(TypeInfo commandTypeInfo, string subCommand) =>
    commandTypeInfo
      .GetMethods()
      .Where(m => m
        .GetCustomAttributes(typeof(SubCommandAttribute))
        .SingleOrDefault(a => ((SubCommandAttribute)a).Name == subCommand) != null
      ).SingleOrDefault();
```

It also works for properties (remember that properties is basically just syntactic sugar for methods in C#/.NET):

```csharp
private DatabaseInserter DatabaseInserter => new DatabaseInserter { ConnectionString = ConnectionString };
```

It's a small thing, but once you've gotten used to the convenience of "implicit return" (in Ruby), it's really something you miss in languages that lack it.

### Null-safe navigation

This is a really, really nice one. The newly added `?`-operator means that you navigate to a given property, but _only_ if the object its contained in is non-null, which is a pattern that is very useful in the C# world. So you can write code like this:

```csharp
public void AddWork()
{
    if (SelectedTrelloCard?.EstimateMissing == true)
    {
        // Do something useful
    }
    else
    {
        // Do something else
    }
}
```

...instead of this:

```csharp
public void AddWork()
{
    if (SelectedTrelloCard != null && SelectedTrelloCard.EstimateMissing)
    {
        // Do something useful
    }
    else
    {
        // Do something else
    }
}
```

Nice, and very convenient. The careful reader will note that the first example uses the dreaded `== true` syntax. This is usually seen as an anti-pattern in C#, _for a regular bool_, that is; since the `bool` is already boolean, you can (and should!) just do `if (foo)` rather than `if (foo == true)`. But since the expression in this case can be `null`, the result of that expression (`SelectedTrelloCard?.EstimateMissing`) isn't really `bool` but instead `bool?`, i.e. the nullable version of the `bool` type. So, in that case you actually _have_ to write `== null` to make the code compile, since the compiler refuses to make this conversion implicitly.

### String interpolation

Again, something which has been present in languages like Ruby and CoffeeScript for years already; it's great that the fine folks at Microsoft are finally adding these great features.

The syntax looks like this:

```csharp
public override string ToString() => $"{ParentCategory}: {Name}";
```

Nothing weird in this; the `$"` at the beginning of the string marks this as a "string that should be interpolated". It means that the result of this `ToString()` method call will basically be `ParentCategory + ": " + Name`, it's just a more convenient way to write it. Especially if you have a longer string, it is very useful to just inject a variable or property like that.

The best part of the string interpolation in C# is that _all of this happens at compile-time_, not like in Ruby and CoffeeScript where it's taking place at runtime. This has the advantage that you can get a really great editing experience, with full IntelliSense and squiggles/compilation errors if you make a typing mistake. Microsoft has here really taken something that is useful in the other camps, and made it even _more_ useful and practical in C#-land! Very nice indeed, it's the kind of thing that makes you want to come back to programming more in C# again.

Alright, enough of the goodness of C# 6.0 and over to the most recently released version, namely 7.0.

## C# 7.0

Here I must admit: I don't really know all the features of C# 7.0 by heart yet. It's a very new version of the language, and I've only used a very small subset of the new features. So, I will focus on these here since I can't really advocate features I've never even experienced myself.

Anyhow, here are some of the nice parts. Let's start with Tuples.

### Tuples

Tuples are a nice way to group related things together _without_ having to declare an explicit `class` or `struct` for them. Consider this example, where I use a Tuple return type:

```csharp
 public static (TransactionSummary, TransactionSummary) ParseExcelFile()
    {
        var package = new ExcelPackage(new FileInfo("budget.xlsx"));
        var incomesWorksheet = package.Workbook.Worksheets.FindIncomesWorksheet();
        var expensesWorksheet = package.Workbook.Worksheets.FindExpensesWorksheet();

        var incomes = GetTransactionSummary(incomesWorksheet);
        var expenses = GetTransactionSummary(expensesWorksheet);

        return (incomes, expenses);
    }
```

The parentheses `(TransactionSummary, TransactionSummary)` in the method signature and the return statement: `return (incomes, expenses)` is using the new syntax.

Being able to return multiple values from a method - nice, huh? Again, this is something that's been available in other languages (like, Ruby :wink:) for years already, but it's very nice to see it making its way into C# as well.

Tuples are nice, but without the next feature, it wouldn't be as useful. Namely, _tuple deconstruction_.

## Typle deconstruction

So, you have a parameter which consists of a tuple with multiple values (`start` and `end`) below. But how do you use these values?

```csharp
private static IList<Transaction> GetTransactions(ExcelRange cells, IEnumerable<SubCategory> subCategories, (int, int) start, (int, int) end)
{
    var transactions = new List<Transaction>();

    var (startRow, startColumn) = start;
    var (endRow, endColumn) = end;

    // ...

    return null;
}
```

The `var (startRow, startColumn) = start` is the tuple deconstruction. Again, all of this happens at compile time so the `var` variables will have the proper types, you get compile-time checking if you use these variables incorrectly, etc. Just like you could expect in a statically typed, compiled language like C#.

Alright, that's all of me for now - see you in another blog post shortly.
