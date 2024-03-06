layui.use(['jquery'], function () {
    var $ = layui.$;
    window.addEventListener("storage", function (event) {
        if (event.key == "EXE") {
            // 获取新的信息
            var data = JSON.parse(event.newValue);
            var info = data.info;
            var d = data.d;

            // 处理info
            console.log("fillInfo1");
            console.log(info, d);

            // $("#exe_info").css('visibility', 'visible');
            $('#pro_name').html(info.name);
            $('#pro_pid').html(info.id);
            $('#pro_priority').html(info.priority);
            $('#exe_path').html(d.field.exePath);
            $('#exe_size').html((parseInt(info.EXE.size) / 1024).toString() + ' KB');
            $('#exe_drive').html(info.EXE.drive);
            $('#thread_id').html(info.thread.id);
            $('#thread_handle').html(info.thread.handle);
            // return document.getElementById('exe_info').innerHTML;
        }
    });
});