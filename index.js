layui.use(['element', 'layer', 'util', 'jquery'], function () {
    var element = layui.element;
    var layer = layui.layer;
    var util = layui.util;
    var $ = layui.$;

    var firstinit = true;
    // 初始化页面
    $(document).ready(function () {
        if (firstinit) {
            tabFunction.tabAdd('./controlCenter/file_route.html', '3', 'control_center');
            tabFunction.tabChange('3');
            firstinit = false;
        }
    });

    //头部事件
    util.event('lay-header-event', {
        menuLeft: function (othis) { // 左侧菜单事件
            layer.msg('展开左侧菜单的操作', { icon: 0 });
        },
        menuRight: function () {  // 右侧菜单事件
            layer.open({
                type: 1,
                title: '更多',
                content: '<div style="padding: 15px; line-height: 30px;">致谢： OnlyForShowWinterBack<br>指导老师：刘铭<br>项目组成员：12345</div>',
                area: ['260px', '100%'],
                offset: 'rt', // 右上角
                anim: 'slideLeft', // 从右侧抽屉滑出
                shadeClose: true,
                scrollbar: false
            });
        }
    });

    // 左侧菜单点击事件
    // TODO：有个小问题，左侧菜单不点击的话，不会加载对应子页面和相应js环境，有点蠢
    $('.link-active').on('click', function () {
        var dataid = $(this);
        // 判断右侧是否有tab
        if ($('.layui-tab-title li[lay-id]').length <= 0) {
            tabFunction.tabAdd(dataid.attr('lay-href'), dataid.attr('data-id'), dataid.attr('data-title'));
        } else {
            // 判断tab是否已经存在
            var isExist = false;
            $.each($('.layui-tab-title li[lay-id]'), function () {
                // 筛选id是否存在
                if ($(this).attr('lay-id') == dataid.attr("data-id")) {
                    isExist = true;
                }
            });
            // 不存在，增加tab
            if (isExist == false) {
                tabFunction.tabAdd(dataid.attr('lay-href'), dataid.attr('data-id'), dataid.attr('data-title'));
            }
        }
        // 转到要打开的tab
        tabFunction.tabChange(dataid.attr('data-id'));
    });

    // 定义函数 绑定增加tab，删除tab，切换tab几项事件
    var tabFunction = {
        // 新增tab url 页面地址 id 对应data-id name标题
        tabAdd: function (url, id, name) {
            element.tabAdd('tables', {
                title: name,
                content: '<iframe data-frameid="' + id + '" scrolling="auto" frameborder="0" src="' + url + '" style="width:100%;height:800px"></iframe>',
                id: id
            });
        },
        // 根据id切换tab
        tabChange: function (id) {
            element.tabChange('tables', id)
        },
        // 关闭指定的tab
        tabDelete: function (id) {
            element.tabDelete('tables', id)
        }
    }
});