---
layout: post
title:  "Why C is a dangerous programming language"
categories:
- programming
---

In this blog post, I describe one particular aspect of the C language that can lead to unpleasant surprises if you’re not careful.

I was writing some code [for the Perlang standard library](https://github.com/perlang-org/perlang/issues/406) which implements printing of floating-point numbers, using the freely available [double-conversion library](https://github.com/google/double-conversion) from Google. To be able to write tests for this, I wrote a wrapper function which overrides `puts()` with some custom logic. The function looks like this;

```c
const char *captured_output = NULL;

extern "C" void __real_puts(const char *s);

extern "C" void __wrap_puts(const char *s) {
    if (puts_mocked) {
        captured_output = s;
    }
    else {
        __real_puts(s);
    }
}
```

Then, in my calling code, I would do something like this (very simplified example with all error handling removed):

```c++
const int PRINT_BUFFER_SIZE = 100;

void print(double d)
{
    char buffer_container[PRINT_BUFFER_SIZE];
    double_conversion::Vector<char> buffer(buffer_container, PRINT_BUFFER_SIZE);
    int length;
    int point;
    bool status = FastDtoa(d, double_conversion::FAST_DTOA_SHORTEST, 0, buffer, &length, &point);

    char formatted_number[length + 1];
    int i = 0;

    while (i < length) {
        // TODO: Add decimal point at the right place
        formatted_number[i] = buffer[i];
        i++;
    }

    formatted_number[length] = '\0';

    puts(formatted_number);
}
```

This worked quite fine, in the sense that the expected value (`12345`) was being printed to the screen.

There was just one problem: the assertion in my test was failing miserably. Here's the assertion (`CHECK_EQ` is an assertion method defined in the `double-conversion` library mentioned above):

```c
TEST(PrintDouble) {
    puts_mocked = true;
    perlang::print(123.45);
    puts_mocked = false;

    // This is the failing assertion
    CHECK_EQ("123.45", captured_output);
}
```

The output from running the tests looked like this:

```
/home/per/git/perlang/src/stdlib/cmake-build-debug/cctest print
/home/per/git/perlang/src/stdlib/test/print.cc:27:
 CHECK_EQ("123.45", captured_output) failed
#  Expected: 123.45
#  Found:    ␛
Signal: SIGABRT (Aborted)
```

What?? Why?! I don’t understand anything. I left the project at the end of the day with a feeling that not much was working as intended...

Then, the morning after when I was still in bed, I realized what was probably happening. It was a typical “C mistake”.

Remember my `__wrap_puts` method above? Take a close look at it again. It takes a parameter and saves the value of this parameter for later use. Then look at my `print()` method above: it declares a **stack variable** (`char formatted_number[length + 1]`), builds up the correct string inside this
variable, then calls `puts()`... and then returns.

I've highlighted "stack variable" here, because this is precisely the problem here. _Pointers to the stack cannot be saved like this_, it's doomed to fail. Unfortunately, the stack will be overwritten between the `puts()` call and the method which checks the `captured_output` content.

### The solution

```c
extern "C" void __wrap_puts(const char* s)
{
    if (puts_mocked) {
        // Note: calling this multiple times will both leak memory and overwrite the captured
        // output from previous calls. Don't use this in the real world without adding suitable
        // free() calls.
        captured_output = strdup(s); // <-- calling strdup(s) here is the fix
    }
    else {
        __real_puts(s);
    }
}
```

By duplicating the string, which can be either located on the stack or on the heap, we are safe, and the assertion will now fail as expected instead:

```
/home/per/git/perlang/src/stdlib/cmake-build-debug/cctest print
/home/per/git/perlang/src/stdlib/test/print.cc:27:
 CHECK_EQ("123.45", captured_output) failed
#  Expected: 123.45
#  Found:    12345
Signal: SIGABRT (Aborted)
```

(The reason it fails is because the implementation is not yet complete; it doesn't add the decimal point at the right place. This is fine and a perfectly "normal" software bug. Figuring out why a garbage value was being printed is a much more "annoying" kind of bug to me.)

### Conclusion

> "C makes it easy to shoot yourself in the foot; C++ makes it harder, but when you do it blows your whole leg off" _Bjarne Stroustrup_

With great power comes great responsibility. The fact that you _can_ easily allocate objects on the stack is actually a really nice and useful thing, and one of the things that has historically given (and perhaps still gives) C and C++ an advantage for writing performance-critical code. To be able to completely eliminate memory allocation and deallocation for short-lived objects is simply very nice. But: like many other advanced features in C (like pointer arithmetics...), it comes at a price. And the real nasty part is that there are very few "safety belts" in C. So arguably, the greatest strengths of the C language are also its greatest weaknesses.

<sub>The careful reader might be wanting to point out that my example code above is technically not C but C++ - I know. Traditional pointers (e.g. `const char *`) are much more "C-style" than "C++-style" though. In C++, references are typically favoured over plain-old pointers. </sub>
