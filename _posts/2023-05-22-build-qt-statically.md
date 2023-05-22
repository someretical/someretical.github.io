---
title: Building Qt 6.5.0 statically on Windows 11
layout: post
author: Yankai Zhu
tags: []
---

First, make sure that [Python 3](https://www.python.org/downloads/), [Ninja](https://ninja-build.org/) and [NASM](https://nasm.us/) are all installed. Furthermore, the paths to their executables must not contain any spaces!

All commands are assumed to be run from the VS >=2022 x64 developer command prompt. Addtionally, pay close attention to the use of forward and backslashes throughout.

First we need to statically compile OpenSSL. The environment variable `OPENSSL_BASE_DIR` should be set to the source directory (again, no spaces).

```
> set OPENSSL_BASE_DIR=E:\openssl
> set OPENSSL_OUTPUT_DIR=%OPENSSL_BASE_DIR%\VC-WIN64A-static
> set OPENSSL_BUILD_DIR=%OPENSSL_BASE_DIR%\build

> mkdir %OPENSSL_BUILD_DIR%
> pushd %OPENSSL_BUILD_DIR%
> mkdir %OPENSSL_OUTPUT_DIR%
> perl %OPENSSL_BASE_DIR%\Configure VC-WIN64A no-shared --prefix=%OPENSSL_OUTPUT_DIR% --openssldir=%OPENSSL_OUTPUT_DIR%
> nmake
> nmake install
```
The `no-shared` flag is required to build `.lib` files that can be linked against statically. We do not want `.lib` files that actually point to `.dll` files. If we get those sorts of library files then the linker will do its job just fine but the program will choke when it runs.

Now we can configure and build Qt. All the paths should use backslashes as separators except for `OPENSSL_OUTPUT_DIR` which should use forward slashes! We will be building a bare bones version of Qt to reduce the build times.

```
> set OPENSSL_OUTPUT_DIR=E:/openssl/VC-WIN64A-static
> set QT_BASE_DIR=E:\Qt\6.5.0
> mkdir %QT_BASE_DIR%\build
> mkdir %QT_BASE_DIR%\msvc2019_64-static-release
> pushd %QT_BASE_DIR%\build
> %QT_BASE_DIR%\Src\configure ^
-prefix %QT_BASE_DIR%\msvc2019_64-static-release ^
-release ^
-static ^
-static-runtime ^
-c++std c++20 ^
-make libs ^
-nomake tools ^
-nomake examples ^
-nomake tests ^
-nomake benchmarks ^
-nomake manual-tests ^
-nomake minimal-static-tests ^
-submodules qtbase,qtsvg,qtcharts ^
-skip qtimageformats ^
-skip qtlanguageserver ^
-skip qtshadertools ^
-skip qtdeclarative ^
-skip qtquicktimeline ^
-skip qtquick3d ^
-skip qtmultimedia ^
-skip qt3d ^
-skip qt5compat ^
-skip qtactiveqt ^
-skip qtcoap ^
-skip qtconnectivity ^
-skip qtdatavis3d ^
-skip qtwebsockets ^
-skip qthttpserver ^
-skip qttools ^
-skip qtserialport ^
-skip qtpositioning ^
-skip qtwebchannel ^
-skip qtwebengine ^
-skip qtdoc ^
-skip qtgrpc ^
-skip qtinsighttracker ^
-skip qtlocation ^
-skip qtlottie ^
-skip qtmqtt ^
-skip qtnetworkauth ^
-skip qtopcua ^
-skip qtquick3dphysics ^
-skip qtquickeffectmaker ^
-skip qtremoteobjects ^
-skip qtscxml ^
-skip qtsensors ^
-skip qtserialbus ^
-skip qtspeech ^
-skip qttranslations ^
-skip qtvirtualkeyboard ^
-skip qtwayland ^
-skip qtwebview ^
-openssl-linked -- -D OPENSSL_USE_STATIC_LIBS=ON -D OPENSSL_ROOT_DIR=%OPENSSL_OUTPUT_DIR%
> cmake  --build . --parallel 16
> cmake --install .
```

Now we need to permanently set the environment variable `OPENSSL_ROOT_DIR=%OPENSSL_OUTPUT_DIR%`. This is only required for building a static executable. If we deploy the exectuable to another machine where `OPENSSL_ROOT_DIR` is not set, it will still work.

It should be easy enough to install the shared build for Qt using the official launcher. The launcher should also add the shared libraries to the PATH as well. If not, manually add the libraries. The path should be something like `E:\Qt\6.5.0\msvc2019_64\bin`. Make sure you use backslashes!

The CMake configuration below will build a statically linked exectuble in the release configuration and a dynamically linked one in the debug configuration. Replace the paths with your own as necessary. Notice how all the path separators must be forward slashes too!

```cmake
IF (CMAKE_BUILD_TYPE MATCHES Release)
    set(CMAKE_PREFIX_PATH "E:/Qt/6.5.0/msvc2019_64-static-release/lib/cmake")

    IF (MSVC)
        add_compile_options($<$<CONFIG:Release>:/MT>)
    ENDIF ()
ELSEIF (CMAKE_BUILD_TYPE MATCHES Debug)
    set(CMAKE_PREFIX_PATH "E:/Qt/6.5.0/msvc2019_64/lib/cmake")
ENDIF ()
```

# Extras

Adding the below configuration to the end of your `CMakeLists.txt` will build an exectuable that doesn't spawn a separate console window when you launch it. This only happens if you build the project in release mode though. 

```
IF (CMAKE_BUILD_TYPE MATCHES Release)
    # Let CMake generate the executable for windows without a console
    # This has to be placed last for some reason
    set_target_properties(FileSyncer PROPERTIES WIN32_EXECUTABLE TRUE)
ENDIF ()
```