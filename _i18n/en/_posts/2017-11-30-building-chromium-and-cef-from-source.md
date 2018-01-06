---
layout: post
title:  "Building Chromium and CEF from source"
categories:
- geek hobbies
- programming
---

(Alternative title: _50 ways to drive yourself crazy._)

For various reasons, I needed to build a custom CefSharp version with support for MP3 audio (essentially https://github.com/cefsharp/CefSharp/issues/1479.) MP3 has historically been a patent-encumbered algorithm, but the patent for it has expired so it's legal status should now be "more free" than before. The impression I had was that Google had planned for the MP3 support to be included in Chromium 62, so this was "just" a matter of upgrading CefSharp to CEF 62 and we would be all set.

That's what _I_ thought... It ended up being a lot more complex than that.

It turned out that [this](https://chromium.googlesource.com/chromium/third_party/ffmpeg/+/6ff143c61bc81049d730872b23e4993ca18080fc) and [this](https://chromium.googlesource.com/chromium/src.git/+/d69958f1aa564e532d7edc7f57f7ba4e6dd77f43) commit had been pushed back to Chromium 63, per [this Chromium bug](https://bugs.chromium.org/p/chromium/issues/detail?id=746579). This was bad, since I had hoped that these changes were indeed included in Chromium 62...

Waiting on CEF 63 was not an option; we needed this support _now_. I had to resort to trying to build Chromium and CEF from source. This is rather tedious though; just cloning the Chromium source code took almost _two hours_ on my machine (with a rather fast Internet connection.)

For the overall build setup, I used this guide: https://bitbucket.org/chromiumembedded/cef/wiki/MasterBuildQuickStart.md. One early problem was that I ran into some issues with "Filename too long" issues (got to love Windows!) It also complained that the source tree was dirty.

The original plan was to keep the Chromium folder on my macOS (host) drive, but because of these issues I had to move it to the Windows VM. This was just a bit hard, since I didn't have that much free disk space in the VM to begin with. I created a separate D volume in my Windows VM, and moved the code there.

I then downloaded the code _again_, which took around an hour this time... In the meanwhile, I participated in the discussion at the [Chromium bug](https://bugs.chromium.org/p/chromium/issues/detail?id=746579) and concluded that for my particular use case, setting `proprietary_codecs=true` was the way to go, until we had a proper CEF 63 release including this. I used [this page](https://bitbucket.org/chromiumembedded/cef/wiki/AutomatedBuildSetup.md) to construct a valid `bat` file for building.

Some of the prerequisites was missing on my machine, namely Windows Debugging Tools. Win10 SDK install from the web URL provided in one of the aforementioned links gave me version 10.0.16299.15, which resulted in a compilation error like this:

```
-------- Running "ninja -C out\Debug_GN_x86 cefclient" in "D:\code\chromium_git\chromium\src"...
ninja: Entering directory `out\Debug_GN_x86'
[8/31028] CXX obj/breakpad/breakpad_handler/crash_generation_client.obj
FAILED: obj/breakpad/breakpad_handler/crash_generation_client.obj
ninja -t msvc -e environment.x86 -- "c:\program files (x86)\microsoft visual studio 14.0\vc\bin\amd64_x86/cl.exe" /nologo /showIncludes  @obj/breakpad/breakpad_handler/crash_generation_client.obj.rsp /c ../../breakpad/src/client/windows/crash_generation/crash_generation_client.cc /Foobj/breakpad/breakpad_handler/crash_generation_client.obj /Fd"obj/breakpad/breakpad_handler_cc.pdb"
D:\code\chromium_git\chromium\src\breakpad\src\client/windows/crash_generation/crash_generation_client.h(33): fatal error C1083: Cannot open include file: 'windows.h': No such file or directory
```

Then I installed the 10.0.10586 version using Visual Studio 2015 installer. I tried the build again, still failed to find `windows.h`.

Just to test, I created a blank C-based Win32 app in VS2015, worked - it could locate `windows.h` without problems.

Then I tried in a VS2015 Developer Command prompt. This time it actually seemed to work better! So now there's only 31000 files waiting to be compiled... :wink: For each target, and there are eight (!) of them.

> **Important note**: I noted Windows AntiMalware/Windows Defender was slowing it down noticeably, so I disabled it. You probably want to do the same.

At around 5000 files, it failed while linking `brotli.exe`:

```
solved external symbol __imp__UnhandledExceptionFilter@4
libucrt.lib(invalid_parameter.obj) : error LNK2001: unresolved external symbol __imp__UnhandledExceptionFilter@4
LIBCMT.lib(gs_report.obj) : error LNK2001: unresolved external symbol __imp__SetUnhandledExceptionFilter@4
LIBCMT.lib(utility_desktop.obj) : error LNK2001: unresolved external symbol __imp__SetUnhandledExceptionFilter@4
libucrt.lib(invalid_parameter.obj) : error LNK2001: unresolved external symbol __imp__SetUnhandledExceptionFilter@4
LIBCMT.lib(gs_report.obj) : error LNK2001: unresolved external symbol __imp__GetCurrentProcess@0
libucrt.lib(exit.obj) : error LNK2001: unresolved external symbol __imp__GetCurrentProcess@0
libucrt.lib(invalid_parameter.obj) : error LNK2001: unresolved external symbol __imp__GetCurrentProcess@0
LIBCMT.lib(gs_report.obj) : error LNK2001: unresolved external symbol __imp__TerminateProcess@8
libucrt.lib(exit.obj) : error LNK2001: unresolved external symbol __imp__TerminateProcess@8
libucrt.lib(invalid_parameter.obj) : error LNK2001: unresolved external symbol __imp__TerminateProcess@8
LIBCMT.lib(gs_report.obj) : error LNK2001: unresolved external symbol _IsProcessorFeaturePresent@4
LIBCMT.lib(utility_desktop.obj) : error LNK2001: unresolved external symbol _IsProcessorFeaturePresent@4
LIBCMT.lib(_cpu_disp_.obj) : error LNK2001: unresolved external symbol _IsProcessorFeaturePresent@4
LIBCMT.lib(gs_support.obj) : error LNK2001: unresolved external symbol __imp__QueryPerformanceCounter@4
LIBCMT.lib(gs_support.obj) : error LNK2001: unresolved external symbol __imp__GetCurrentProcessId@0
LIBCMT.lib(gs_support.obj) : error LNK2001: unresolved external symbol __imp__GetCurrentThreadId@0
libucrt.lib(per_thread_data.obj) : error LNK2001: unresolved external symbol __imp__GetCurrentThreadId@0
LIBCMT.lib(gs_support.obj) : error LNK2001: unresolved external symbol __imp__GetSystemTimeAsFileTime@4
libucrt.lib(winapi_thunks.obj) : error LNK2001: unresolved external symbol __imp__GetSystemTimeAsFileTime@4
LIBCMT.lib(tncleanup.obj) : error LNK2001: unresolved external symbol __imp__InitializeSListHead@4
LIBCMT.lib(utility_desktop.obj) : error LNK2001: unresolved external symbol __imp__IsDebuggerPresent@0
libucrt.lib(invalid_parameter.obj) : error LNK2001: unresolved external symbol __imp__IsDebuggerPresent@0
libucrt.lib(crtmbox.obj) : error LNK2001: unresolved external symbol __imp__IsDebuggerPresent@0
```

I rebuilt again, this time using a regular `cmd.exe` session. Went back to the `windows.h not found` issue. I found [this GitHub issue](https://github.com/curl/curl/issues/454) speaking about a similar problem. It let me to [this Windows issue](https://connect.microsoft.com/VisualStudio/feedback/details/1610302/universalcrt-detection-breaks-when-windows-driver-kit-is-installed)

I now had both Windows SDK version 10.0.10586 _and_ 10.0.16299 installed. The latter contained the Windows Debugging Tools so I wanted to keep that, but get rid of all of all the other parts it provided (since it is the package that brings in the Windows Driver Kit, causing the builds to fail...)

It would still complain about `windows.h`. What about trying to compile the whole thing with VS2017 instead, can that be done?

I tried adding the `--force-clean` flag, to ensure we get a proper build. _Seemed_ like a bad idea, since it started cloning the repos from scratch again. I _really_ don't want it to sit and download the Chromium code once more, since it takes a full hour.

I tried with a VS2015 x86 Native Tools Command Prompt instead (the earlier one I used was a VS2015 x64 Native Toools Command prompt.) It _may_ be the thing that makes the difference... This got me a bit further, failed with this error now:

```
[8121/26167] CXX obj/ui/gfx/color_space/color_space_win.obj
FAILED: obj/ui/gfx/color_space/color_space_win.obj
ninja -t msvc -e environment.x86 -- "c:\program files (x86)\microsoft visual studio 14.0\vc\bin\amd64_x86/cl.exe" /nologo /showIncludes  @obj/ui/gfx/color_space/color_space_win.obj.rsp /c ../../ui/gfx/color_space_win.cc /Foobj/ui/gfx/color_space/color_space_win.obj /Fd"obj/ui/gfx/color_space_cc.pdb"
../../ui/gfx/color_space_win.cc(142): error C2065: 'DXGI_COLOR_SPACE_RGB_STUDIO_G2084_NONE_P2020': undeclared identifier../../ui/gfx/color_space_win.cc(152): error C2065: 'DXGI_COLOR_SPACE_RGB_FULL_G2084_NONE_P2020': undeclared identifier
../../ui/gfx/color_space_win.cc(154): error C2065: 'DXGI_COLOR_SPACE_RGB_FULL_G22_NONE_P2020': undeclared identifier
../../ui/gfx/color_space_win.cc(168): error C2065: 'DXGI_COLOR_SPACE_YCBCR_STUDIO_G2084_LEFT_P2020': undeclared identifier
[8126/26167] CXX obj/ui/gfx/gfx/font_fallback_win.obj
ninja: build stopped: subcommand failed.
Traceback (most recent call last):
  File "..\automate\automate-git.py", line 1085, in <module>
    if options.buildlogfile else None)
  File "..\automate\automate-git.py", line 55, in run
    args, cwd=working_dir, env=env, shell=(sys.platform == 'win32'))
  File "d:\code\depot_tools\win_tools-2_7_6_bin\python\bin\lib\subprocess.py", line 540, in check_call
    raise CalledProcessError(retcode, cmd)
subprocess.CalledProcessError: Command '['ninja', '-C', 'out\\Debug_GN_x86', 'cefclient']' returned non-zero exit status 1
```

I decided to try a new route: how about trying to set up a blank VS2015/etc setup in a Windows 7 VM instead? Luckily, I had a Windows 7 VM available that I could use for this, and access to Visual Studio 2015 installation media (well, on a remote file share where I could download it from.) But first, I verified that Chromium and CEF would compile on Windows 7: yes, this was indeed the case.

To be able to do the build, I had to expand my Windows disk - as mentioned before, I did this by creating a separate D volume. This turned out to be a _really good_ idea, since I could now add that virtual disk to the Windows 7 VM also (shutting down the Windows 10 VM first etc.), so I don't have to re-clone the Chromium repo etc. Nice!

I installed VS2015 once the download was complete, using these settings (**note**: as you will see further down in this file, I chose the wrong Windows 10 SDK here, so don't just follow this blindly):

![VS2015 install #1](/images/2017-11-30-visual-studio-2015-install-1.png)

![VS2015 install #2](/images/2017-11-30-visual-studio-2015-install-2.png)

![VS2015 install #3](/images/2017-11-30-visual-studio-2015-install-3.png)

I also upgraded VS2015 to Update 3 (using the "Extensions and Updates" menu item inside Visual Studio.) Then I started the build, which failed at "You must install the "Debugging Tools for Windows" again.

Used the advice given in [this SO thread](https://stackoverflow.com/questions/37230401/how-to-install-windbg-when-vs-2015-is-already-installed) to update the Win10 SDK so that the Debugging Tools were installed.

Restarted the build, just to see it failing on "cannot find windows.h", _again_.

Tried in a "Developer Command Prompt for VS2015" instead. Got the _same error_: `../../ui/gfx/color_space_win.cc(142): error C2065: 'DXGI_COLOR_SPACE_RGB_STUDIO_G2084_NONE_P2020': undeclared identifier`. I was starting to suspect I had stale files in my build somewhere. Added the `--force-clean` after all; it's better than the machine spending time getting the build done than me spending time trying to wrestle with it.

Added more cores to the VM to make it build faster. Also did the same thing as on Windows 10, disabling Windows Defender since it would take an awful lot of CPU and make the build a lot slower (only difference is that on Windows 7 it's actually _easy_ to disable it... A one-click in the UI and it stops bothering you. Much nicer!)

The next error was this:

```
[2535/30861] CXX obj/sandbox/win/sandbox/process_mitigations.obj
FAILED: obj/sandbox/win/sandbox/process_mitigations.obj
ninja -t msvc -e environment.x86 -- "c:\program files (x86)\microsoft visual studio 14.0\vc\bin\amd64_x86/cl.exe" /nologo /showIncludes  @obj/sandbox/win/sandbox/process_mitigations.obj.rsp /c ../../sandbox/win/src/process_mitigations.cc /Foobj/sandbox/win/sandbox/process_mitigations.obj /Fd"obj/sandbox/win/sandbox_cc.pdb"
../../sandbox/win/src/process_mitigations.cc(169): error C2039: 'AllowThreadOptOut': is not a member of '_PROCESS_MITIGATION_DYNAMIC_CODE_POLICY'
c:\program files (x86)\windows kits\10\include\10.0.10586.0\um\winnt.h(11182): note: see declaration of '_PROCESS_MITIGATION_DYNAMIC_CODE_POLICY'
../../sandbox/win/src/process_mitigations.cc(225): error C2039: 'PreferSystem32Images': is not a member of '_PROCESS_MITIGATION_IMAGE_LOAD_POLICY'
c:\program files (x86)\windows kits\10\include\10.0.10586.0\um\winnt.h(11225): note: see declaration of '_PROCESS_MITIGATION_IMAGE_LOAD_POLICY'
../../sandbox/win/src/process_mitigations.cc(249): error C2065: 'THREAD_DYNAMIC_CODE_ALLOW': undeclared identifier
../../sandbox/win/src/process_mitigations.cc(263): error C2065: 'ThreadDynamicCodePolicy': undeclared identifier
```

Hmm. Interesting. [This MSDN page](https://msdn.microsoft.com/en-us/library/windows/desktop/mt706243(v=vs.85).aspx) indicated that it should exist, but looking at the relevant line in `winnt.h` indicated otherwise:

```c
typedef struct _PROCESS_MITIGATION_DYNAMIC_CODE_POLICY {
    union {
        DWORD Flags;
        struct {
            DWORD ProhibitDynamicCode : 1;
            DWORD ReservedFlags : 31;
        } DUMMYSTRUCTNAME;
    } DUMMYUNIONNAME;
} PROCESS_MITIGATION_DYNAMIC_CODE_POLICY, *PPROCESS_MITIGATION_DYNAMIC_CODE_POLICY;
```

So it _seems_ like the Chromium code is trying to use stuff not available in the Windows SDK version it's being compiled towards... [This CEF page](https://bitbucket.org/chromiumembedded/cef/wiki/AutomatedBuildSetup.md) mentions 10.0.10586, which is the version I have, but [this CEF page](https://bitbucket.org/chromiumembedded/cef/wiki/MasterBuildQuickStart.md) talks about 10.0.15063 (and Visual Studio 2017, whereas the first one talks about VS2015!)

Reading more: [This Chromium page](https://chromium.googlesource.com/chromium/src/+/master/docs/windows_build_instructions.md) indicated that VS2017 is indeed _required_, and we need the Windows SDK 10.0.15063 or newer. Alright, let's switch back to the Win10 VM where I have VS2017 and let's check the Windows SDK version listed there.

It seems I have 10.1.16299, so that should work (since it said "or newer".) It _did_ seem to lack a bunch of "Windows SDK for C++ apps" components though, so I added these.

Alright, a new attempt in a "Developer Command Prompt for VS 2017".

Then it ran into strange issue with the `cef` folder that couldn't be removed, even though it didn't have any files. Didn't even work in "admin command prompt". Workaround: renamed folder to `foo` for now...

Hmm, more errors. It has suddenly started to fail recognizing the `.git` folders in the `chromium_git` folder. I _think_ this is caused by me sharing the same NTFS volume between different Windows versions or something (I know what you're thinking, but they were **not** running simultaneously, but shutdown between the compiles)... Painful as it is, I see no other solution but to remove the whole `chromium/src` folder and let `gclient` download it anew.

Then I got the next error:

```
[5668/31028] CXX obj/third_party/crashpad/crashpad/util/util/nt_internals.obj
FAILED: obj/third_party/crashpad/crashpad/util/util/nt_internals.obj
ninja -t msvc -e environment.x86 -- "c:\program files (x86)\microsoft visual studio 14.0\vc\bin\amd64_x86/cl.exe" /nologo /showIncludes  @obj/third_party/crashpad/crashpad/util/util/nt_internals.obj.rsp /c ../../third_party/crashpad/crashpad/util/win/nt_internals.cc /Foobj/third_party/crashpad/crashpad/util/util/nt_internals.obj /Fd"obj/third_party/crashpad/crashpad/util/util_cc.pdb"
../../third_party/crashpad/crashpad/util/win/nt_internals.cc(22): error C2371: 'CLIENT_ID': redefinition; different basic types
c:\program files (x86)\windows kits\10\include\10.0.16299.0\um\winternl.h(83): note: see declaration of 'CLIENT_ID'
[5673/31028] CXX obj/third_party/crashpad/crashpad/util/util/command_line.obj
ninja: build stopped: subcommand failed.
Traceback (most recent call last):
  File "..\automate\automate-git.py", line 1107, in <module>
    if options.buildlogfile else None)
  File "..\automate\automate-git.py", line 55, in run
    args, cwd=working_dir, env=env, shell=(sys.platform == 'win32'))
  File "d:\code\depot_tools\win_tools-2_7_6_bin\python\bin\lib\subprocess.py", line 540, in check_call
    raise CalledProcessError(retcode, cmd)
subprocess.CalledProcessError: Command '['ninja', '-C', 'out\\Release_GN_x86', 'cefclient']' returned non-zero exit status 1
```

I googled and found [this Qt bug](https://bugreports.qt.io/browse/QTBUG-63713), which let me to realize that Chromium is now switching over to `clang` on Windows, which is a bit interesting (but my build is still seemingly using `cl.exe`, i.e. MSVC.) Anyway, the Qt bug led me to [this Chromium issue](https://bugs.chromium.org/p/chromium/issues/detail?id=773476) which indicated that this is a bug in the *Fall* Creators Update SDK; I guess that's the version I have... Interestingly enough, it speaks _specifically_ about crashpad which is the exact thing here that is breaking. The Chromium issue referred to [this commit](https://chromium.googlesource.com/chromium/src/+/98392ed2d255753c2c8ca5b2f31c333f75b579a8%5E%21/#F0) which fixed this by pinning to 10.0.15063.0, i.e. "*spring* Creators Update SDK".

However, looking at that file in the local Chromium checkout showed something interesting:

```python
    if os.path.exists(script_path):
      # Chromium requires the 10.0.14393.0 SDK. Previous versions don't have all
      # of the required declarations, and 10.0.15063.0 is buggy.
      args = [script_path, 'amd64_x86' if cpu == 'x86' else 'amd64',
              '10.0.14393.0']
      variables = _LoadEnvFromBat(args)
    else:
      variables = []
      for k in sorted(os.environ.keys()):
        variables.append('%s=%s' % (str(k), str(os.environ[k])))
      variables = '\n'.join(variables)
```

Interesting it is! It seems like this is indeed the version I would need to be able to compile this version of Chromium...

I uninstalled 10.0.16299, and installed that specific version (10.0.14393) using the VS2015 installer.

Now, a new error arose:

```
-------- Running "ninja -C out\Release_GN_x86 cefclient" in "D:\code\chromium_git\chromium\src"...
ninja: Entering directory `out\Release_GN_x86'
ninja: error: 'C:/Program Files (x86)/Windows Kits/10/Redist/D3D/x86/d3dcompiler_47.dll', needed by 'd3dcompiler_47.dll', missing and no known rule to make it
Traceback (most recent call last):
  File "..\automate\automate-git.py", line 1107, in <module>
    if options.buildlogfile else None)
  File "..\automate\automate-git.py", line 55, in run
    args, cwd=working_dir, env=env, shell=(sys.platform == 'win32'))
  File "d:\code\depot_tools\win_tools-2_7_6_bin\python\bin\lib\subprocess.py", line 540, in check_call
    raise CalledProcessError(retcode, cmd)
subprocess.CalledProcessError: Command '['ninja', '-C', 'out\\Release_GN_x86', 'cefclient']' returned non-zero exit status 1
```

I located this file, but it wasn't in the expected location (where it supposedly _should_ be, the DirectX/Direct3D SDK is now a [part of the Windows SDK](https://msdn.microsoft.com/en-us/library/windows/desktop/ee663275(v=vs.85).aspx) since Windows 8. For now, I took the ugly and nasty way and _created this folder manually_, copying it from `C:\Program Files (x86)\Windows Kits\10\bin\x86` where I found it. (As long as the binary file is identical, this should be OK even though it is admittedly a bit ugly. I had already spent around 10 hours getting this working now so I was willing to take a few shortcuts if needed...)

I also copied the x64 file, since I was pretty sure it would be needed also by the x64 build.

This managed to get the build started, with VS2015. (I tried changing my `.bat` file to use VS2017 since I was under the impression that it was required, but the tooling wouldn't detect my VS2017 installation for some reason. Also, I checked and verified that my Chrome 62 on Windows was still compiled w/ VS2015 so since that's the version I'm compiling, it must still be compilable with that version. Ergo, the text on [this Chromium page](https://chromium.googlesource.com/chromium/src/+/master/docs/windows_build_instructions.md) must refer to a later version of the Chromium code than the one I'm currently building:

> As of September, 2017 (R503915) Chromium requires Visual Studio 2017 update 3.2 with the 15063 (Creators Update) Windows SDK or later to build.

Building with VS2015 seemed to work fine; it just took a few hours (!) to get everything compiled (I left it running overnight.) And, it ran out of disk space on the _host_ machine so I had to clean up some space, reboot etc. (weirdest error I've seen for a long time: `rm -rf foo` failed _because of lack of disk space_. Seriously???)

I also had to give the VM some more memory, because 6 GiB of physical memory didn't seem to be enough. It was the linking that used an extreme amount; when looking at it in Task Manager, I saw it using 9700 MiB at most (after increasing the VM to be able to have 12 GiB of RAM.) And, it (the linking) took a _long_ time.

This gave me a set of `.tar.bz2` files in `D:\code\chromium_git\chromium\src\cef\binary_distrib`. I could run this build and it _did_ indeed include the proprietary codecs which was a must-have for me. How nice! I then added the `--x64-build` in my `build.bat`, deleted the temporary x86 build output folder (66 GiB and I needed this disk space for the x64 build) and restarted the build.

The x64 build took an _incredibly_ long time. I started it at 1 PM and it wasn't complete at 9:30 PM, which is quite amazing.

Imagine how annoying it was at 11 PM when I got this error, after like _1 hour_ of trying to link this single file:

```
[31021/31022] LINK(DLL) libcef.dll libcef.dll.lib libcef.dll.pdb
FAILED: libcef.dll libcef.dll.lib libcef.dll.pdb
D:/code/depot_tools/win_tools-2_7_6_bin/python/bin/python.exe ../../build/toolchain/win/tool_wrapper.py link-wrapper environment.x64 False link.exe /nologo /IMPLIB:./libcef.dll.lib /DLL /OUT:./libcef.dll /PDB:./libcef.dll.pdb @./libcef.dll.rsp
LINK : fatal error LNK1102: out of memory
ninja: build stopped: subcommand failed.
Traceback (most recent call last):
  File "..\automate\automate-git.py", line 1107, in <module>
    if options.buildlogfile else None)
  File "..\automate\automate-git.py", line 55, in run
    args, cwd=working_dir, env=env, shell=(sys.platform == 'win32'))
  File "d:\code\depot_tools\win_tools-2_7_6_bin\python\bin\lib\subprocess.py", line 540, in check_call
    raise CalledProcessError(retcode, cmd)
subprocess.CalledProcessError: Command '['ninja', '-C', 'out\\Release_GN_x64', 'cefclient']' returned non-zero exit status 1
```

The memory usage was high, but not _that_ high:

![Memory usage](/images/2017-11-30-task-manager-while-linking.png)

I decided to skip the x64 binary for now. I should still be able to use the binaries for my end goal: to make a (custom) version of CefSharp which includes support for playing MP3 audio. x86 is not optimal, but we can live with it for the time being.

## Conclusions

- Don't do this unless you really _must_ do it. :smiley:
- Read the instructions incredibly carefully.
- Use the exact right version of the Windows SDK. I found out the right version by accident by looking in a Python file, but I also found it's listed [here](https://bitbucket.org/chromiumembedded/cef/wiki/BranchesAndBuilding)
- Don't build from a Visual Studio command prompt; it should be from a plain `cmd.exe`.
- Make sure to have enough memory, CPUs and disk space available. Each architecture (x86 and x64) took around 65 GiB for me, in addition to the plain Chromium checkout which was about 20 GiB.

Apart from that, it should be quite simple. :wink:
