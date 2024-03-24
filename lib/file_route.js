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
        "exePath": "D:\\programming_works\\vscodeworks\\softwareSec\\hust-detours\\test_sample\\pop_sample\\pop.exe",
        //"hookPath": "D:\\programming_works\\vscodeworks\\softwareSec\\hust-detours\\Dll\\x64\\Debug",
        //"hookPath_dll": "D:\\programming_works\\vscodeworks\\softwareSec\\hust-detours\\Dll\\x64\\Debug\\Dll.dll"
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
                    // 向服务端发送数据
                    ws.send(data);
                    ws.send("start hook");
                    console.log("data and hook start message has been sent.");
                };

                ws2.onopen = function () {
                    layer.msg("启动dll...");
                    console.log("dll connected.");
                };

                ws.onmessage = function (e) {
                    console.log(e.data);
                    var info = JSON.parse(e.data)
                    if (info.name == "memcpy")
                        console.log(info);
                    if ("err" in info) {
                        layer.msg("进程打开失败，请检查路径");
                        // setTimeout(function () { ws.onclose(); }, 3000);// 刷新页面
                    }
                    if ("EXE" in info) {
                        // 给显示页面发送信息，通过localStorage
                        console.log("exe info to page");
                        var dataToStore = {
                            info: info,
                            d: d
                        };
                        localStorage.setItem("EXE", JSON.stringify(dataToStore));
                    }
                    if ("OUTPUT" in info) {
                        // 给显示页面发送信息，通过localStorage
                        console.log("output info to page");
                        var dataToStore = {
                            info: info,
                            d: d
                        };
                        localStorage.setItem("OUTPUT", JSON.stringify(dataToStore));
                    }
                };

                ws2.onmessage = function (e2) {
                    console.log(e2.data);
                    var info = JSON.parse(e2.data);
                }

                ws.onclose = function () {
                    // 关闭 websocket
                    if (is_hooking) {
                        layer.msg("连接已关闭...");
                        is_hooking = 0;
                        // setTimeout(function () { location.reload(); }, 1000);// 刷新页面
                    } else {
                        layer.msg("连接失败，请检查是否运行服务端");
                    }
                };
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
            } else {
                ws.send("stop hook");// 在is_hooking为0时也试探着向服务端断开连接
                ws.close();
                layer.msg('Hook 未连接');
            }
        },
    });
});