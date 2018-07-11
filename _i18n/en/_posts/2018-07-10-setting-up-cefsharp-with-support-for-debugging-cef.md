---
layout: post
title:  "Setting up CefSharp with support for debugging CEF"
categories:
- programming
- cefsharp
---

The steps below have been tested with Visual Studio 2015, but should also
work with Visual Studio 2017 (which has a 2015 compatibility mode for C++
projects.)

- Clone [the repo](https://github.com/cefsharp/CefSharp), using the `cefsharp/65` branch.
- Download the corresponding "Release Symbols" from the Spotify build
   server: http://opensource.spotify.com/cefbuilds/index.html. The "Release
   symbols" are used also  when running CefSharp in Debug mode. (If you run
   in Release mode, debugging will not work well because of CefSharp
   details.)

   To know exactly which version to use, please consult
   https://github.com/cefsharp/CefSharp/blob/cefsharp/65/CefSharp.Core/packages.config:

    ```xml
    <?xml version="1.0" encoding="utf-8"?>
    <packages>
    <package id="cef.sdk" version="3.3325.1758" targetFramework="native" />
    </packages>
    ```

- Also, make sure to download the proper symbols that you are debugging at
  the moment (32 or 64-bit Windows) - you can see in Visual Studio with
  the CefSharp solution open which platform you are currently targeting.
- Unpack the release symbols to a folder of your choice. You might need
  [7-Zip](https://www.7-zip.org/download.html) to unpack `.tar.bz2` files
  on Windows.
- Download the source code for CEF, for the version you are debugging. The
  https://bitbucket.org/chromiumembedded/cef/downloads/?tab=branches has
  `zip/tar.gz/tar.bz2` links for all the branches. Choose the branch that
  corresponds to the `cef.sdk` version as shown above (i.e. 3325 in our
  case). You can also choose to clone the `cef` Git repo if you so prefer.
  If you downloaded the `zip`/etc. file, unpack the file to a folder of
  your choice.
- Open the `CefSharp3.sln` file, set the `CefSharp.Wpf.Example` as the
  startup project.
- Ensure Native code debugging is enabled, as described here:
  https://docs.microsoft.com/en-us/visualstudio/debugger/how-to-debug-in-mixed-mode
  This will trigger downloading of a lot of PDB files from Microsoft's
  servers the next time you run the project.
- Launch the project (F5)
- Open the Modules tab in the Debug window.

     ![Listing the loaded (managed and native) modules](/images/2018-07-10-cefsharp-01-listing-loaded-modules.png)

- Right-click the `libcef.dll` entry and click "Load symbols". Navigate
  to the folder where you unpacked the CEF symbols file. (`libcef.dll.pdb`)
- Place a breakpoint in the `CefSharpSchemeHandlerFactory` class (in the
  `CefSharp.Example` project), and start the project (F5). The breakpoint
  should now be triggered.

    ![CefSharp breakpoint in CefSharpSchemeHandlerFactory](/images/2018-07-10-cefsharp-02-breakpoint-in-cefsharpschemehandlerfactory.png)

- As can be seen, method names inside the `libcef.dll` are shown.
  Double-click on one of these lines in the call stack. You will be
  asked to navigate to the folder where you have the CEF source code:

    ![Visual Studio locating file](/images/2018-07-10-cefsharp-03-locating-file.png)

- Navigate to the folder where you checked out/unpacked the CEF source (the
  original file location from the CEF build server will help you locate the
  file inside - this is the highlighted path in the screenshot above)
- If all goes well, you should now be seeing something like this:

    ![Visual Studio displaying the CEF C++ file](/images/2018-07-10-cefsharp-04-displaying-cef-cpp-file.png)

- Place a breakpoint inside this file, stop the debugging and press F5
  again. The breakpoint inside the CEF C++ file should now be triggered
  and you can inspect local variables etc, just like usual.

    ![Breakpoint inside the CEF C++ file](/images/2018-07-10-cefsharp-05-breakpoint-inside-cef-cpp-file.png)

- You can also open up any other file inside the CEF folder and place
  a breakpoint; it should be triggered if the PDB file for `libcef.dll`
  has been loaded and the method is being called.

    ![Breakpoint in CefInitialize](/images/2018-07-10-cefsharp-06-breakpoint-in-another-cpp-file.png)

You can also step from C# code to the C++ context (both into CefSharp's own
C++ files and into files in the CEF folder). Visual Studio will load the
right file for you, providing a very nice debugging experience.

Congratulations - your environment should now be fully prepared for
debugging the inner workings of both CefSharp and CEF.
