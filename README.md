# HUSTCSE software security

a simple front-end for security tools using layui

## file structure

```bash
.
│  index.html # frontend index file
│  README.md
│  
├─controlCenter
│      dev_log.html
│      file_route.html
│      user_guide.html
│      
├─layui
│  │  layui.js
│  ├─css     
│  ├─font     
│  └─img
│          
├─lib
│      
├─~server
│  │  inject.exe
│  │  server.py
│  │  
│  ├─build
│  │  └─server
│  │              
│  └─dist
│       server.exe # server for the frontend
│          
└─~test
        Dll.dll # DLL
        hookServer.cpp
        inject_test.cpp
```

## usage

just git clone and click index.html

to use the server, click `detours_ui\\~server\\dist\\server.exe`

to use the DLL fiel, check it out in `detours_ui\\~test\Dll.dll`

## content in ~test folder

about hookServer.cpp and inject_test.cpp: simple server code using boost and nlohmann

### MSYS2

install:

```bash
# MSYS2 ucrt64~
pacman -Ss boost
pacman -Ss nlohmann
pacman -S ***
```

compile

```bash
# add -lws2_32
"args": [
                "-fdiagnostics-color=always",
                "-g",
                "${file}",
                "-o",
                "${fileDirname}\\${fileBasenameNoExtension}.exe",
                "-lws2_32"
            ],
```

### MSVC

install:

https://www.boost.org/

https://github.com/nlohmann/json

compile:

```bash
# compile boost with VS developer command prompt
bootstrap.bat
# choose one
b2.exe install --prefix="E:/Boost/x64" --build-type=complete --toolset=msvc-14.3 threading=multi --build-type=complete address-model=64
b2.exe install --prefix="E:/Boost/x86" --build-type=complete --toolset=msvc-14.3 threading=multi --build-type=complete address-model=32
```

set include and lib path in VS project

ref:https://blog.csdn.net/qq_33177268/article/details/126044636

https://blog.csdn.net/erjia_/article/details/127573277

## server.py in ~server folder

github action is prepared for generating python package, just choose `python Build EXE` in `actions` page

or you can compile the python file manually:

```bash
# you should install dependencies needed first
pyinstaller --onefile --add-data "./inject.exe;." server.py
```

## others

TODO: C/C++ CI workflow to generate detour dll package