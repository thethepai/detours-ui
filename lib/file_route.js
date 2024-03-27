layui.use(['layer', 'table', 'carousel', 'element', 'util', 'form', 'tree', 'jquery'], function () {
    var element = layui.element,
        layer = layui.layer,
        util = layui.util,
        form = layui.form,
        $ = layui.$,
        tree = layui.tree

    var ws;
    var is_hooking = 0;
    var exe_info = 0;
    var exeAndHook_default = {
        "exePath": "D:\\download\\",
        "hookPath": "D:\\download",
        "hookPath_dll": "D:\\download\\Dll.dll"
    };
    var exeAndHook_info = {
        "exePath": [],
        "hookPath": [],
        "hookPath_dll": []
    };

    // 表单提交事件
    form.on('submit(startHook)', function (d) {
        exeAndHook_info = form.val('hookBegin');
        let data = JSON.stringify(exeAndHook_info);
        if ("WebSocket" in window) {
            if (!is_hooking) {
                ws = new WebSocket("ws://localhost:8111/");
                ws2 = new WebSocket("ws://localhost:8112/");
                ws.onopen = function () {
                    layer.msg("新建连接...");
                    is_hooking = 1;
                    ws.send(data);
                    ws.send("start hook");
                    console.log("data and hook start message has been sent.");
                };

                ws2.onopen = function () {
                    layer.msg("dll传来了信息...");
                    console.log("dll connected.");
                };

                ws.onmessage = function (e) {
                    layer.msg("inject传来了信息...");
                    console.log("inject message received.");
                    var info = JSON.parse(e.data)
                    console.log(info);
                };

                ws2.onmessage = function (e2) {
                    var info = JSON.parse(e2.data);
                    console.log(info);
                    console.log('Type of info:', typeof info);
                    if (typeof info === 'string') {
                        info = JSON.parse(info);
                        // 开始处理数据
                        console.log(info.eventID);
                    }
                    
                    // 弹窗
                    if (info.eventId === "MessageBox") {
                        console.log('messagebox!');
                        if (info.event.Operation === "MessageBoxA") {
                            $('#a_hWnd').html('hWnd:' + info.event.hWnd);
                            $('#a_lpText').html('lpText:' + info.event.lpText);
                            $('#a_lpCaption').html('lpCaption:' + info.event.lpCaption);
                            $('#a_uType').html('uType:' + info.event.uType);
                        } else if (info.event.Operation === "MessageBoxW") {
                            $('#b_hWnd').html('hWnd:' + info.event.hWnd);
                            $('#b_lpText').html('lpText:' + info.event.lpText);
                            $('#b_lpCaption').html('lpCaption:' + info.event.lpCaption);
                            $('#b_uType').html('uType:' + info.event.uType);
                        }
                    }
                    // 堆
                    if (info.eventID === "Heap") {
                        console.log('heap!');
                        if (info.event.Operation === "HeapCreate") {
                            $('#a_hHeap').html('hHeap:' + info.event.hHeap);
                            $('#a_dwInitialSize').html('dwInitialSize:' + info.event.dwInitialSize);
                            $('#a_dwMaximumSize').html('dwMaximumSize:' + info.event.dwMaximumSize);
                            $('#a_fIOptions').html('fIOptions:' + info.event.fIOptions);
                        } else if (info.event.Operation === "HeapAlloc") {
                            $('#b_hHeap').html('hHeap:' + info.event.hHeap);
                            $('#b_dwFlags').html('dwFlags:' + info.event.dwFlags);
                            $('#b_dwBytes').html('dwBytes:' + info.event.dwBytes);
                            $('#b_address').html('address:' + info.event.address);
                        } else if (info.event.Operation === "HeapFree") {
                            $('#c_hHeap').html('hHeap:' + info.event.hHeap);
                            $('#c_dwFlags').html('dwFlags:' + info.event.dwFlags);
                            $('#c_lpMem').html('lpMem:' + info.event.lpMem);
                            $('#c_return').html('return:' + info.event.return);
                        } else if (info.event.Operation === "HeapDestroy") {
                            $('#d_hHeap').html('return:' + info.event.hHeap);
                        }
                    }
                    // 文件
                    if (info.eventID === "File") {
                        console.log('file!');
                        if (info.event.Operation === "CreateFileA") {
                            $('#a_lpFileName').html('lpFileName:' + info.event.lpFileName);
                            $('#a_dwDesiredAccess').html('dwDesiredAccess:' + info.event.dwDesiredAccess);
                            // $('#a_dwShareMode').html('dwShareMode:' + info.event.dwShareMode);
                            $('#a_lpSecurityAttributes').html('lpSecurityAttributes:' + info.event.lpSecurityAttributes);
                            $('#a_dwCreationDisposition').html('dwCreationDisposition:' + info.event.dwCreationDisposition);
                            $('#a_dwFlagsAndAttributes').html('dwFlagsAndAttributes:' + info.event.dwFlagsAndAttributes);
                            // $('#a_hTemplateFile').html('hTemplateFile:' + info.event.hTemplateFile);
                            $('#a_handle').html('handle:' + info.event.handle);
                        } else if (info.event.Operation === "OpenFile") {
                            $('#b_Operation').html('Operation:' + info.event.Operation);
                            $('#b_lpFileName').html('lpFileName:' + info.event.lpFileName);
                            $('#b_lpReOpenBuff').html('lpReOpenBuff:' + info.event.lpReOpenBuff);
                            $('#b_uStyle').html('uStyle:' + info.event.uStyle);
                            $('#b_hFile').html('hFile:' + info.event.hFile);
                            $('#b_errorCode').html('hFile:' + info.event.errorCode);
                        } else if (info.event.Operation === "WriteFile") {
                            $('#c_hFile').html('hFile:' + info.event.hFile);
                            $('#c_pathLen').html('pathLen:' + info.event.pathLen);
                            $('#c_lpBuffer').html('lpBuffer:' + info.event.lpBuffer);
                            $('#c_nNumberOfBytesToWrite').html('nNumberOfBytesToWrite:' + info.event.nNumberOfBytesToWrite);
                            $('#c_lpNumberOfBytesWritten').html('lpNumberOfBytesWritten:' + info.event.lpNumberOfBytesWritten);
                            $('#c_lpOverlapped').html('lpOverlapped:' + info.event.lpOverlapped);
                        } else if (info.event.Operation === "ReadFile") {
                            $('#d_hFile').html('hFile:' + info.event.hFile);
                            $('#d_pathLen').html('pathLen:' + info.event.pathLen);
                            $('#d_lpBuffer').html('lpBuffer:' + info.event.lpBuffer);
                            $('#d_nNumberOfBytesToWrite').html('nNumberOfBytesToWrite:' + info.event.nNumberOfBytesToWrite);
                            $('#d_lpNumberOfBytesWritten').html('lpNumberOfBytesWritten:' + info.event.lpNumberOfBytesWritten);
                            $('#d_lpOverlapped').html('lpOverlapped:' + info.event.lpOverlapped);
                        } else if (info.event.Operation === "_lclose") {
                            $('#e_hFile').html('hFile:' + info.event.hFile);
                            $('#e_return').html('return:' + info.event.return);
                        }
                    }
                    // 注册表
                    if (info.eventID === "Regedit") {
                        console.log('regedit!');
                        if (info.event.Operation === "RegCreateKeyExA") {
                            $('#e_hKey').html('hKey:' + info.event.hKey);
                            $('#e_lpSubKey').html('lpSubKey: ' + info.event.lpSubKey);
                            $('#e_dwOptions').html('dwOptions: ' + info.event.dwOptions);
                            $('#e_samDesired').html('samDesired: ' + info.event.samDesired);
                            $('#e_phkResult').html('phkResult: ' + info.event.phkResult);
                            $('#e_lpdwDisposition').html('lpdwDisposition: ' + info.event.lpdwDisposition);
                        } else if (info.event.Operation === "RegOpenKeyExA") {
                            $('#a_hKey').html('hKey:' + info.event.hKey);
                            $('#a_lpSubKey').html('lpSubKey:' + info.event.lpSubKey);
                            $('#a_ulOptions').html('ulOptions:' + info.event.ulOptions);
                            $('#a_samDesired').html('samDesired:' + info.event.samDesired);
                            $('#a_phkResult').html('phkResult:' + info.event.phkResult);
                            $('#a_status').html('status:' + info.event.status);
                        } else if (info.event.Operation === "RegCloseKey") {
                            $('#b_hKey').html('hKey:' + info.event.hKey);
                            $('#b_status').html('status:' + info.event.status);
                        } else if (info.event.Operation === "RegQueryValueExA") {
                            $('#c_hKey').html('hKey:' + info.event.hKey);
                            $('#c_lpValueName').html('lpValueName:' + info.event.lpValueName);
                            $('#c_lpReserved').html('lpReserved:' + info.event.lpReserved);
                            $('#c_lpType').html('lpType:' + info.event.lpType);
                            $('#c_lpData').html('lpData:' + info.event.lpData);
                            $('#c_status').html('status:' + info.event.status);
                        } else if (info.event.Operation === "RegSetValueExA") {
                            $('#d_hKey').html('hKey:' + info.event.hKey);
                            $('#d_lpValueName').html('lpValueName:' + info.event.lpValueName);
                            $('#d_dwType').html('dwType:' + info.event.dwType);
                            $('#d_lpData').html('lpData:' + info.event.lpData);
                            $('#d_cbData').html('cbData:' + info.event.cbData);
                            $('#d_status').html('status:' + info.event.status);
                        }
                    }
                    // socket
                    if (info.eventID === "Socket") {
                        console.log('socket!');
                        if (info.event.Operation === "socket") {
                            $('#a_af').html('af:' + info.event.af);
                            $('#a_type').html('type:' + info.event.type);
                            $('#a_protocol').html('protocol:' + info.event.protocol);
                            $('#a_socket').html('socket:' + info.event.socket);
                        } else if (info.event.Operation === "WSAStartup") {
                            $('#b_wVersionRequired').html('wVersionRequired:' + info.event.wVersionRequired);
                            $('#b_wVersionRequiredPrimary').html('wVersionRequiredPrimary:' + info.event.wVersionRequiredPrimary);
                            $('#b_wVersionRequiredSecondary').html('wVersionRequiredSecondary:' + info.event.wVersionRequiredSecondary);
                            $('#b_lpWSAData').html('lpWSAData:' + info.event.lpWSAData);
                            $('#bb_status').html('status:' + info.event.status);
                        } else if (info.event.Operation === "connect") {
                            $('#c_s').html('s:' + info.event.s);
                            $('#c_sockaddr').html('sockaddr:' + info.event.sockaddr);
                            $('#c_namelen').html('namelen:' + info.event.namelen);
                            $('#cc_status').html('status:' + info.event.status);
                        } else if (info.event.Operation === "recv") {
                            $('#d_s').html('s:' + info.event.s);
                            $('#d_buf').html('buf:' + info.event.buf);
                            $('#d_len').html('len:' + info.event.len);
                            $('#d_flags').html('flags:' + info.event.flags);
                            $('#dd_status').html('status:' + info.event.status);
                        } else if (info.event.Operation === "send") {
                            $('#e_s').html('s:' + info.event.s);
                            $('#e_buf').html('buf:' + info.event.buf);
                            $('#e_len').html('len:' + info.event.len);
                            $('#e_flags').html('flags:' + info.event.flags);
                            $('#ee_status').html('status:' + info.event.status);
                        } else if (info.event.Operation === "closesocket") {
                            $('#f_s').html('s:' + info.event.s);
                            $('#ff_status').html('status:' + info.event.status);
                        }
                    }
                }

                ws.onclose = function () {
                    // 关闭 websocket
                    if (is_hooking) {
                        layer.msg("连接已关闭...");
                        console.log('inject closed.');
                        is_hooking = 0;
                        // setTimeout(function () { location.reload(); }, 1000);// 刷新页面
                    } else {
                        layer.msg("连接失败，请检查是否运行服务端");
                    }
                };

                ws2.onclose = function () {
                    console.log('dll closed.');
                }
            } else {
                layer.msg('连接已经是开启状态了');
                ws.send("start hook");
            }
        } else {
            // 浏览器不支持 WebSocket
            alert("您的浏览器不支持 WebSocket!");
        }
        return false;
    });

    // 按钮事件
    util.event('lay-btn', {
        setDefault: function () {
            form.val('hookBegin', exeAndHook_default);
        },
        btn_close: function () {
            if (is_hooking) {
                ws.send("stop hook");
                setTimeout(function () { ws.close(); }, 1000); // 1秒后关闭连接
                setTimeout(function () { ws2.close(); }, 1000);
            } else {
                ws.send("stop hook");
                ws.close();
                ws2.close();
                layer.msg('Hook 未连接');
            }
        },
    });
});