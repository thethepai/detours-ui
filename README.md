# HUSTCSE software security

a simple front-end for security tools using layui

## file structure

not up to date

```bash
.
|   favicon.ico
|   index.html
|   index.js
|   
+---controlCenter
|       dev_log.html
|       file_route.html
|       hook_info.html
|       output_info.html
|       user_guide.html
|       
+---layui
|   |   layui.js
|   |   
|   +---css
|   |       layui.css
|   |       
|   +---font
|   |       
|   \---img
|           avatar.png
|           
+---lib
|       file_root.js
|       hook_info.js
|       output_info.js
|       
\---~test
        hookServer.cpp
        hookServer.exe
        inject.cpp
```

## usage

just git clone and click index.html

to use the server, click detours_ui\\~server\\dist\\server.exe

## server in ~test folder

about hookServer.cpp and inject.cpp: simple server code using boost and nlohmann

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

```bash
pyinstaller --onefile --add-data "./inject.exe;." server.py
```