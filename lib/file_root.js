import { fillInfo } from './hook_info.js';

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
        "exePath": "D:\\download\\pop.exe",
        "hookPath": "D:\\download\\hookServer.exe"
    };
    var exeAndHook_info = {
        "exePath": [],
        "hookPath": []
    };

    //监听提交
    form.on('submit(startHook)', function (d) {
        exeAndHook_info = form.val('hookBegin');
        let data = JSON.stringify(exeAndHook_info);
        if ("WebSocket" in window) {
            if (!is_hooking) {
                ws = new WebSocket("ws://localhost:8111/");
                ws.onopen = function () {
                    layer.msg("success connected");
                    is_hooking = 1;
                    ws.send(data);
                    ws.send("start hook");
                };

                ws.onmessage = function (e) {
                    console.log(e.data);
                    var info = JSON.parse(e.data)
                    if (info.name == "memcpy")
                        console.log(info);
                    if ("err" in info) {
                        layer.msg("进程打开失败，请检查路径");
                        setTimeout(function () { ws.onclose(); }, 3000);// 刷新页面
                    }
                    if ("EXE" in info) {
                        // 显示进程信息
                        // $("#exe_info").css('visibility', 'visible');
                        // $('#pro_name').html(info.name);
                        // $('#pro_pid').html(info.id);
                        // $('#pro_priority').html(info.priority);
                        // $('#exe_path').html(d.field.exePath);
                        // $('#exe_size').html((parseInt(info.EXE.size) / 1024).toString() + ' KB');
                        // $('#exe_drive').html(info.EXE.drive);
                        // $('#thread_id').html(info.thread.id);
                        // $('#thread_handle').html(info.thread.handle);
                        processHtml = fillInfo(info, d);
                    } else if ("type" in info) {
                        $.each(page_info, function (index, item) {
                            if (info.name in item) {
                                item[info.name].push(info); // 更新Hook到的函数信息列表
                                item.num = item.num + 1;
                                if (item != MessageBox)
                                    checkUnexpected(item, info); // 检查新Hook的函数是否异常，更新异常行为，并存入about_analysis中
                                if (is_refresh_auto) {
                                    if (nowPage == page_info.indexOf(item)) {
                                        setHtml(nowPage);
                                    } else if (nowPage_2 == page_info.indexOf(item)) //TODO：因为直接刷新会使树形组件重新展开，很影响观感，所以使用按钮刷新
                                        setHtml_2(nowPage_2);
                                }
                                // refreshNav();
                                return false;
                            }
                        });
                    }
                };

                ws.onclose = function () {
                    // 关闭 websocket
                    if (is_hooking) {
                        layer.msg("连接已关闭...");
                        setTimeout(function () { location.reload(); }, 1000);// 刷新页面
                    } else {
                        layer.msg("连接失败，请检查是否运行服务端");
                    }
                };
            } else {
                layer.msg('连接已经开启');
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
                ws.close();
            } else {
                ws.send("stop hook");// 为了保险起见，在is_hooking为0时也试探着向服务端断开连接
                ws.close();
                layer.msg('Hook 未连接');
            }
        },
    });
});