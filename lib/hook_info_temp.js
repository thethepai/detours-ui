layui.use(['jquery'], function () {
    var $ = layui.$;
    $(document).ready(function() {
        $('#pro_name').html("info.name");
        $('#pro_pid').html("info.id");
        $('#pro_priority').html("info.priority");
        $('#exe_path').html("d.field.exePath");
        $('#exe_size').html("(parseInt(info.EXE.size) / 1024).toString() + ' KB'");
        $('#exe_drive').html("info.EXE.drive");
        $('#thread_id').html("info.thread.id");
        $('#thread_handle').html("info.thread.handle");
    });
});