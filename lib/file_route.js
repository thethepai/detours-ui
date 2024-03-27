layui.use(['layer', 'table', 'carousel', 'element', 'util', 'form', 'tree', 'jquery'], function () {
    var element = layui.element,
        layer = layui.layer,
        util = layui.util,
        form = layui.form,
        $ = layui.$,
        tree = layui.tree

    var ws;
    var is_hooking = 0;
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
                    if (info.eventId == "MessageBox") {
                        console.log('messagebox!');
                        if (info.event.Operation == "MessageBoxA") {
                            $('#a_hWnd').html('hWnd:' + info.event.hWnd);
                            $('#a_lpText').html('lpText:' + info.event.lpText);
                            $('#a_lpCaption').html('lpCaption:' + info.event.lpCaption);
                            $('#a_uType').html('uType:' + info.event.uType);
                        } else if (info.event.Operation == "MessageBoxW") {
                            $('#b_hWnd').html('hWnd:' + info.event.hWnd);
                            $('#b_lpText').html('lpText:' + info.event.lpText);
                            $('#b_lpCaption').html('lpCaption:' + info.event.lpCaption);
                            $('#b_uType').html('uType:' + info.event.uType);
                        }
                    }
                    // 堆
                    if (info.eventID == "Heap") {
                        console.log('heap!');
                        if (info.event.Operation == "HeapCreate") {
                            $('#a_fIOptions').html('fIOptions:' + info.event.fIOptions);
                            $('#a_dwInitSize').html('dwInitSize:' + info.event.dwInitSize);
                            $('#a_dwMaxSize').html('dwMaxSize:' + info.event.dwMaximumSize);
                        } else if (info.event.Operation == "HeapDestroyed") {
                            $('#b_opt2').html("opt:heapdestroyed");
                            $('#b_hHeap').html('hHeap:' + info.event.hHeap);
                        } else if (info.event.Operation == "HeapFree") {
                            $('#c_hHeap').html('hHeap:' + info.event.hHeap);
                            $('#c_dwFlags').html('dwFlags:' + info.event.dwFlags);
                        } else if (info.event.Operation == "HeapMalicious") {
                            $('#d_opt2').html('opt:' + info.event.opt);
                            $('#d_optinfo2').html('heap free error:trying to free mem');
                        }
                    }
                    // 文件
                    if (info.eventID == "File") {
                        console.log('file!');
                        if (info.event.Operation == "CreateFile") {
                            $('#a_dwDesiredAccess').html('dwDesiredAccess:' + info.event.dwDesiredAccess);
                            $('#a_dwShareMode').html('dwShareMode:' + info.event.dwShareMode);
                            $('#a_lpSecurityAttributes').html('lpSecurityAttributes:' + info.event.lpSecurityAttributes);
                            $('#a_dwCreationDisposition').html('dwCreationDisposition:' + info.event.dwCreationDisposition);
                            $('#a_dwFlagsAndAttributes').html('dwFlagsAndAttributes:' + info.event.dwFlagsAndAttributes);
                            $('#a_hTemplateFile').html('hTemplateFile:' + info.event.hTemplateFile);
                        } else if (info.event.Operation == "DeleteFile") {
                            $('#b_opt').html('opt:' + info.event.opt);
                        } else if (info.event.Operation == "DeleteFileExe") {
                            $('#c_opt').html('opt' + info.event.opt);
                        } else if (info.event.Operation == "ReadFile") {
                            $('#d_opt').html('opt:read');
                            $('#d_hFile').html('hFile:' + info.event.hFile);
                            $('#d_nNumberOfBytesToRead').html('nNumberOfBytesToRead:' + info.event.nNumberOfBytesToRead);
                            $('#d_NumberOfBytesRead').html('NumberOfBytesRead:' + info.event.NumberOfBytesRead);
                            $('#d_lpOverlapped').html('lpOverlapped:' + info.event.lpOverlapped);
                            $('#d_ReadData').html('ReadData:' + info.event.ReadData);
                        } else if (info.event.Operation == "FileCopyItself") {
                            $('#e_opt').html('opt:' + info.event.opt);
                        } else if (info.event.Operation == "FileMove") {
                            $('#f_opt').html('opt:' + info.event.opt);
                        } else if (info.event.Operation == "WriteFile") {
                            $('#g_hFile').html('hFile:' + info.event.hFile);
                            $('#g_nNumberOfBytesToWrite').html('nNumberOfBytesToWrite:' + info.event.nNumberOfBytesToWrite);
                            $('#g_lpNumberOfBytesWritten').html('lpNumberOfBytesWritten:' + info.event.lpNumberOfBytesWritten);
                            $('#g_lpOverlapped').html('lpOverlapped:' + info.event.lpOverlapped);
                            $('#g_WriteData').html('WriteData:' + info.event.WriteData);
                            $('#g_isExe').html('isExe:' + info.event.isExe);
                        } else if (info.event.Operation == "FindFirstFile") {
                            $('#h_lpFileName').html('lpFileName:' + info.event.lpFileName);
                            $('#h_opt').html('opt:' + info.event.opt);
                        } else if (info.event.Operation == "FindNextFile") {
                            $('#i_lpFindFileData').html('lpFindFileData:' + info.event.lpFindFileData);
                            $('#i_opt').html('opt:' + info.event.opt);
                        }
                    }
                    // 注册表
                    if (info.eventID == "Regedit") {
                        console.log('regedit!');
                        if (info.event.Operation == "RegCreateKey") {
                            $('#a_hKey').html('hKey:' + info.event.hKey);
                            $('#a_phkResult').html('phkResult:' + info.event.phkResult);
                        } else if (info.event.Operation == "RegCloseKey") {
                            $('#b_opt3').html('opt:regkey closed');
                            $('#b_hKey').html('hKey:' + info.event.hKey);
                        } else if (info.event.Operation == "RegDeleteKey") {
                            $('#c_opt3').html('opt:regkey deleted');
                            $('#c_hKey').html('hKey:' + info.event.hKey);
                        } else if (info.event.Operation == "RegOpenKey") {
                            $('#d_hKey').html('hKey:' + info.event.hKey);
                            $('#d_phkResult').html('phkResult:' + info.event.phkResult);
                        } else if (info.event.Operation == "SelfStart") {
                            $('#e_opt3').html('hKey:undefined');
                            $('#e_optinfo3').html('opt:' + info.event.opt);
                        }else if(info.event.Operation == "RegSetKeyValue"){
                            $('#f_hKey').html('hKey:' + info.event.hKey);
                            $('#f_dwType').html('dwType:' + info.event.dwType);
                            $('#f_lpData').html('lpData:' + info.event.lpData);
                            $('#f_cbData').html('cbData:' + info.event.cbData);
                        } else if (info.event.Operation == "RegGetKeyValue") {
                            $('#g_hKey').html('hKey:' + info.event.hKey);
                            $('#g_dwType').html('dwType:' + info.event.dwType);
                            $('#g_pdwType').html('pdwType:' + info.event.pdwType);
                            $('#g_pcbData').html('pcbData:' + info.event.pcbData);
                        }
                    }
                    // socket
                    if (info.eventID == "Socket") {
                        console.log('socket!');
                        if (info.event.Operation == "socket") {
                            $('#a_opt4').html('opt:socket');
                            $('#a_addressFamily').html('af:' + info.event.addressFamily);
                            $('#a_type').html('type:' + info.event.type);
                            $('#a_protocol').html('protocol:' + info.event.protocol);
                        } else if (info.event.Operation == "connect") {
                            $('#b_socket').html('socket:' + info.event.socket);
                            $('#b_sockaddr').html('sockaddr:' + info.event.sockaddr);
                            $('#b_port').html('port:' + info.event.port);
                            $('#b_family').html('family:' + info.event.family);
                        } else if (info.event.Operation == "send") {
                            $('#c_socket').html('socket:' + info.event.socket);
                            $('#c_buf').html('buf:' + info.event.buf);
                            $('#c_len').html('len:' + info.event.len);
                            $('#c_flags').html('flags:' + info.event.flags);
                        } else if (info.event.Operation == "recv") {
                            $('#d_socket').html('socket:' + info.event.socket);
                            $('#d_buf').html('buf:' + info.event.buf);
                            $('#d_len').html('len:' + info.event.len);
                            $('#d_flags').html('flags:' + info.event.flags);
                        } else if (info.event.Operation == "sendto") {
                            $('#e_socket').html('socket:' + info.event.socket);
                            $('#e_len').html('len:' + info.event.len);
                            $('#e_flags').html('flags:' + info.event.flags);
                            $('#e_tolen').html('tolen:' + info.event.tolen);
                        } else if (info.event.Operation == "recvfrom") {
                            $('#f_socket').html('socket:' + info.event.socket);
                            $('#f_buf').html('buf:' + info.event.buf);
                            $('#f_len').html('len:' + info.event.len);
                            $('#f_flags').html('flags:' + info.event.flags);
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