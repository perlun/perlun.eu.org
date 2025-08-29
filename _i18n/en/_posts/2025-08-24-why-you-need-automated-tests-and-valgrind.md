---
layout: post
title:  "Why You Need Automated Tests And Valgrind"
categories:
  - programming
  - perlang
---

In this post, I describe a recent event I encountered when working on my project which illustrates
some of the benefits of automated testing in general, and Valgrind-based testing in particular.

So, I was working on a [merge
request](https://gitlab.perlang.org/perlang/perlang/-/merge_requests/624) some days ago. I thought I
was done, pushed up my feature branch, and pressed the "Set to auto-merge" button on GitLab.

However... instead of getting a nice "Merge request !624 was merged" email, I got this:

```
Pipeline #572 has failed!

Project: perlang ( https://gitlab.perlang.org/perlang/perlang )
Branch: feature/add-string-length-property ( https://gitlab.perlang.org/perlang/perlang/-/commits/feature/add-string-length-property )
Merge request: !624 ( https://gitlab.perlang.org/perlang/perlang/-/merge_requests/624 )

Commit: eb373ebe ( https://gitlab.perlang.org/perlang/perlang/-/commit/eb373ebeae2c114a0e71de4fdfbf0286a32a6923 )
Commit Message: (language) Add `length` property to `ASCIIStrin...
Commit Author: Per Lundberg ( https://gitlab.perlang.org/perlun )


Pipeline #572 ( https://gitlab.perlang.org/perlang/perlang/-/pipelines/572 ) triggered by Per Lundberg ( https://gitlab.perlang.org/perlun )
had 3 failed jobs.

Job #3186 ( https://gitlab.perlang.org/perlang/perlang/-/jobs/3186/raw )

Stage: test
Name: build-freebsd
Job #3190 ( https://gitlab.perlang.org/perlang/perlang/-/jobs/3190/raw )

Stage: test
Name: test: [valgrind]
Job #3188 ( https://gitlab.perlang.org/perlang/perlang/-/jobs/3188/raw )

Stage: test
Name: build-openbsd

--
You're receiving this email because of your account on gitlab.perlang.org.
```

Let's look at [these errors](https://gitlab.perlang.org/perlang/perlang/-/pipelines/572) in more
detail (note, only the relevant part of the CI logs included):

## `build-freebsd`

```
src/stdlib/out/tests --reporter console::out=-::colour-mode=ansi --reporter JUnit::out=native-stdlib-junit-log.xml
Randomness seeded to: 3592658927
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
tests is a Catch2 v3.7.1 host application.
Run with -? for options
-------------------------------------------------------------------------------
perlang::UTF16String::from_copied_string(), returns an identical string for
ASCII-only string
-------------------------------------------------------------------------------
/usr/home/gitlab-runner/builds/perlang/perlang/src/stdlib/test/utf16_string.cc:10
...............................................................................
/usr/home/gitlab-runner/builds/perlang/perlang/src/stdlib/test/utf16_string.cc:18: FAILED:
  REQUIRE( original_utf8 == utf8 )
with expansion:
  "this is a an ASCII string"
  ==
  "this is a an ASCII string㠀瑓楲杮椀杮"
===============================================================================
test cases: 24 | 23 passed | 1 failed
assertions: 23 | 22 passed | 1 failed
gmake: *** [Makefile:186: test-stdlib] Error 42
```

As can be seen, some random Chinese/Japanese characters (㠀瑓楲杮椀杮) seem to be printed at the end
of the string. Interesting.

## `build-openbsd`

```
src/stdlib/out/tests --reporter console::out=-::colour-mode=ansi --reporter JUnit::out=native-stdlib-junit-log.xml
Randomness seeded to: 326418850
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
tests is a Catch2 v3.7.1 host application.
Run with -? for options
-------------------------------------------------------------------------------
perlang::UTF16String::from_copied_string(), returns an identical string for
ASCII-only string
-------------------------------------------------------------------------------
/home/gitlab-runner/builds/perlang/perlang/src/stdlib/test/utf16_string.cc:10
...............................................................................
/home/gitlab-runner/builds/perlang/perlang/src/stdlib/test/utf16_string.cc:10: FAILED:
due to unexpected exception with message:
  wstring_convert: to_bytes error
-------------------------------------------------------------------------------
perlang::UTF16String::from_copied_string(), returns an identical string for
non-ASCII string
-------------------------------------------------------------------------------
/home/gitlab-runner/builds/perlang/perlang/src/stdlib/test/utf16_string.cc:21
...............................................................................
/home/gitlab-runner/builds/perlang/perlang/src/stdlib/test/utf16_string.cc:21: FAILED:
due to unexpected exception with message:
  wstring_convert: to_bytes error
===============================================================================
test cases: 24 | 22 passed | 2 failed
assertions: 23 | 21 passed | 2 failed
gmake: *** [Makefile:186: test-stdlib] Error 42
```

Here, the error message is different, but we're still dealing with the same test
(`utf16_string.cc`). The careful reader might also notice that the OpenBSD job failed with two
errors, whereas the FreeBSD one only had a single failing test case.

And finally, the Valgrind test, which is perhaps the most interesting one of them all (again, this
is not the full output from the log):

## `test: [valgrind]`

```
   Perlang.Tests.Integration.EvalException : An exception occurred during evaluation: Runtime error: Process perlang/tmp/unit_tests/explicitly_typed_UTF16_string_can_be_printed-4B71951689729F48CD983B75C4F762DC163B1275DC88A2B9E1A9D74F42747D88 exited with exit code 1. Valgrind output:
==3516== Memcheck, a memory error detector
==3516== Copyright (C) 2002-2022, and GNU GPL'd, by Julian Seward et al.
==3516== Using Valgrind-3.19.0 and LibVEX; rerun with -h for copyright info
==3516== Command: perlang/tmp/unit_tests/explicitly_typed_UTF16_string_can_be_printed-4B71951689729F48CD983B75C4F762DC163B1275DC88A2B9E1A9D74F42747D88
==3516== Parent PID: 2675
==3516==
==3516== Invalid read of size 2
==3516==    at 0x13B801: std::char_traits<char16_t>::eq(char16_t const&, char16_t const&) (char_traits.h:768)
==3516==    by 0x13B851: std::char_traits<char16_t>::length(char16_t const*) (char_traits.h:789)
==3516==    by 0x13BB7B: std::__cxx11::wstring_convert<std::codecvt_utf8_utf16<char16_t, 1114111ul, (std::codecvt_mode)0>, char16_t, std::allocator<char16_t>, std::allocator<char> >::to_bytes(char16_t const*) (locale_conv.h:361)
==3516==    by 0x13B0CE: perlang::print(perlang::UTF16String const*) (print.cc:45)
==3516==    by 0x13B35B: perlang::print(std::shared_ptr<perlang::UTF16String> const&) (print.cc:128)
==3516==    by 0x10D8F7: main (in /builds/perlang/perlang/src/Perlang.Tests.Integration/bin/Release/net8.0/perlang/tmp/unit_tests/explicitly_typed_UTF16_string_can_be_printed-4B71951689729F48CD983B75C4F762DC163B1275DC88A2B9E1A9D74F42747D88)
==3516==  Address 0x4d6b70c is 0 bytes after a block of size 124 alloc'd
==3516==    at 0x4841F2F: operator new(unsigned long) (vg_replace_malloc.c:422)
==3516==    by 0x122A7B: std::__new_allocator<unsigned short>::allocate(unsigned long, void const*) (new_allocator.h:137)
==3516==    by 0x11CD4C: std::allocator_traits<std::allocator<unsigned short> >::allocate(std::allocator<unsigned short>&, unsigned long) (alloc_traits.h:464)
==3516==    by 0x11AC71: std::_Vector_base<unsigned short, std::allocator<unsigned short> >::_M_allocate(unsigned long) (stl_vector.h:378)
==3516==    by 0x118D06: std::_Vector_base<unsigned short, std::allocator<unsigned short> >::_M_create_storage(unsigned long) (stl_vector.h:395)
==3516==    by 0x1176DC: std::_Vector_base<unsigned short, std::allocator<unsigned short> >::_Vector_base(unsigned long, std::allocator<unsigned short> const&) (stl_vector.h:332)
==3516==    by 0x114511: std::vector<unsigned short, std::allocator<unsigned short> >::vector(std::vector<unsigned short, std::allocator<unsigned short> > const&) (stl_vector.h:598)
==3516==    by 0x13ED4A: perlang::UTF16String::from_owned_string(std::vector<unsigned short, std::allocator<unsigned short> >) (utf16_string.cc:13)
==3516==    by 0x13D49A: perlang::UTF8String::as_utf16() const (utf8_string.cc:268)
==3516==    by 0x10D8C5: main (in /builds/perlang/perlang/src/Perlang.Tests.Integration/bin/Release/net8.0/perlang/tmp/unit_tests/explicitly_typed_UTF16_string_can_be_printed-4B71951689729F48CD983B75C4F762DC163B1275DC88A2B9E1A9D74F42747D88)

[...]
```

I looked into this further, with a slight suspicion of what could be causing this. My branch
included a change that looked like below, but first some introduction to what you're reading. The
method in question is doing UTF-8 to UTF-16 conversion. `data` is a `std::vector<uint16_t>` variable
which gets preallocated with a larger size, coping for the "maximum potential length of the
resulting string" (based on the assumption that the UTF-16 string will be at most exactly twice the
size of the UTF-8 string, because of the way these encodings work). The idea of this change is to
shrink the `std::vector` to the actual size of the converted string.

The reason why I don't just allocate the `std::vector` with the right size to begin with is to avoid
iterating over the string an extra time to determine the size. Doing so would mean you have to parse
each start of a UTF-8 sequence, to see the number of bytes used in it and so forth. The short
version is that it's non-trivial to determine the size before actually having done the conversion,
and it felt more efficient (and also easier) to do it this way.

So, here's the change:

```diff
diff --git src/stdlib/src/utf8_string.cc src/stdlib/src/utf8_string.cc
index c7f2f8b..98785a2 100644
--- src/stdlib/src/utf8_string.cc
+++ src/stdlib/src/utf8_string.cc
@@ -261,8 +261,10 @@ namespace perlang
             }
         }

-        // TODO: Allocate a new array as described above and copy the data it, to minimize the amount of retained heap
-        // memory. For now, we allow the algorithm to be a little bit less inefficient.
+        // Shrink the std::vector to the actual size we need, now that we know the actual length of the converted
+        // string.
+        data.resize(new_length);
+
         return UTF16String::from_owned_string(std::move(data));
     }
```

A small, innocuous change like that, aimed to save some memory on the heap. What damage could it
possibly do?

Well...

Quite a lot, in fact. I checked in the print code (mentioned in the Valgrind stack trace above,
`perlang::print(perlang::UTF16String const*)`) and, interestingly enough:

```c++
auto data = (char16_t*)bytes;

// wstring_convert is deprecated in C++17 and removed in C++20, but should be fine for now. Once we have an
// as_utf8() method in UTF16String, we can use that instead.
std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t> convert;
std::string utf8 = convert.to_bytes(data);

puts(utf8.c_str());
```

...the `convert.to_bytes()` only passes a `char16_t *` parameter to the method. **No string length
parameter was provided**. In other words, my "hunch" seemed to be correct; the UTF-16-to-UTF-8
conversion code seemed to expect a _NUL-terminated string_. I checked and
[cppreference.com](https://en.cppreference.com/w/cpp/locale/wstring_convert/to_bytes.html) confirmed
that the method was indeed expecting a NUL-terminated string.

And that's precisely what it no longer would be getting. Because I was now shrinking the UTF-16
string to the exact amount of `uint16_t` elements, the string would no longer contain any "extra",
default-initialized (zero) elements at the end => attempting to print it would trigger the
undesirable _undefined behaviour_ we were seeing above. Sometimes (FreeBSD), printing
garbage characters. Sometimes (OpenBSD), triggering an error in the C++ standard library. And
sometimes (and this is perhaps the _worst one of them all_), **working just like I had intended it
to work**, printing only the "this is a an ASCII string" content.

Where is this log, you say? It's [actually
there](https://gitlab.perlang.org/perlang/perlang/-/jobs/3191), but I haven't shown it to you yet.
The regular `test: []` job runs on Linux, without Valgrind, and... seemed to work just fine:

`Passed!  - Failed:     0, Passed:  1527, Skipped:   444, Total:  1971, Duration: 4 m 46 s - Perlang.Tests.Integration.dll (net8.0)`

(This test doesn't output anything in case all goes well, so we can only see that it was successful
in the `Failed: 0` figure above)

## The fix

In the end, as it often is, the actual fix was simple. Just do this:

```diff
diff --git src/stdlib/src/utf16_string.cc src/stdlib/src/utf16_string.cc
index d283bfd..a344799 100644
--- src/stdlib/src/utf16_string.cc
+++ src/stdlib/src/utf16_string.cc
@@ -55,7 +55,8 @@ namespace perlang

     size_t UTF16String::length() const
     {
-        return data_.size();
+        // The vector always contains an extra NUL terminating character for now, because our print() implementation needs it.
+        return data_.size() - 1;
     }

     bool UTF16String::is_ascii()
diff --git src/stdlib/src/utf8_string.cc src/stdlib/src/utf8_string.cc
index 98785a2..6536505 100644
--- src/stdlib/src/utf8_string.cc
+++ src/stdlib/src/utf8_string.cc
@@ -262,8 +262,9 @@ namespace perlang
         }

         // Shrink the std::vector to the actual size we need, now that we know the actual length of the converted
-        // string.
-        data.resize(new_length);
+        // string. The +1 part is because our print() implementation expects the string to be NUL-terminated for now.
+        // We'll try to get rid of this limitation eventually.
+        data.resize(new_length + 1);

         return UTF16String::from_owned_string(std::move(data));
     }
```

...and we are back on the safe (NUL-terminating) side. The second hunk above is the important one;
it makes sure to reserve exactly one character extra for the NUL terminator. I don't plan to let
UTF-16 strings in Perlang be NUL terminated in the long run, but for now, it'll be good enough.

## The moral of the story

- **You need automated testing**. That I even have to write this is a bit tragic, but there are
  still people arguing that automated testing is a waste of time. Suffice to say, if I didn't have
  automated tests in this case, I could very well have merged in broken code this time, without even
  being aware of it. At the very least, I would have realized the breakage when starting to port the
  Perlang compiler to FreeBSD or OpenBSD, which brings us to the next point...

- **Testing on multiple platforms is good**. I know, this isn't always easily doable. I have the
  luxury of a self-hosted on-premise machine where I run ephemeral FreeBSD/NetBSD/OpenBSD containers
  for CI builds. Each time a job runs, a new VM spins up and some basic compilation and tests are
  executed on each of these platforms (in addition to Linux which is kind of our "default" platform
  right now). It may sound more heavyweight than it is, but it actually works quite well, and it
  makes it easy to detect when you write code that is not portable to all the systems you intend to
  support.

- **You need Valgrind**. Well, maybe you don't. This largely depends on what kind of project you're
  working, but _if_ you are working with a language with manual memory management (like C, C++, Zig,
  Odin), chances are that [Valgrind]((https://en.wikipedia.org/wiki/Valgrind)) will be useful to
  you. It helps you find common errors like the one's we saw above (reading outside an allocated
  buffer), use-after-free, double-free and memory leaks. It can also help you spot potential bad
  patterns like mixing `malloc` and `delete` (or `new` and `free`) in C++. I think there's a bunch
  of other checks it can help you with too, but the `memcheck` stuff is the one I have experience
  with myself and that I find helpful.

I hope this has encouraged or inspired you too. If you like my writing, please let me know!
