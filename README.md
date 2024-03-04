# HUSTCSE software security

a simple front-end for security tools using layui

## file structure

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
```

## usage

just git clone and click index.html

## server in ~test folder

about hookServer.cpp

```bash
#MSYS2 ucrt64~
pacman -Ss boost
pacman -Ss nlohmann
pacman -S ***
```

compile

```bash
#add -lws2_32
"args": [
                "-fdiagnostics-color=always",
                "-g",
                "${file}",
                "-o",
                "${fileDirname}\\${fileBasenameNoExtension}.exe",
                "-lws2_32"
            ],
```