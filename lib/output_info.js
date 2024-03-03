layui.use(['jquery'], function () {
    var $ = layui.$;
    window.addEventListener("storage", function (event) {
        if (event.key == "OUTPUTinfo") {
            // 获取新的信息
            var info = JSON.parse(event.newValue);

            // 处理info
            console.log("fillInfo2");
            console.log(info);

            // $("#exe_info").css('visibility', 'visible');
            $('#_heap').html(info.OUTPUT.output1);
            $('#_file').html(info.OUTPUT.output1);
            $('#_net').html(info.OUTPUT.output1);
            $('#_reg').html(info.OUTPUT.output1);
            $('#_mem').html(info.OUTPUT.output1);
            $('#test1').html(info.OUTPUT.output2);
            $('#test2').html(info.OUTPUT.output2);
            $('#test3').html(info.OUTPUT.output2);
            // return document.getElementById('exe_info').innerHTML;
        }
    });
});