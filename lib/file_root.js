const { exec } = require('child_process');

// 获取表单元素
let exePathInput = document.querySelector('input[name="exePath"]');
let hookPathInput = document.querySelector('input[name="hookPath"]');
let startHookButton = document.querySelector('button[lay-filter="startHook"]');

// 当点击"连接"按钮时
startHookButton.addEventListener('click', function() {
    let exePath = exePathInput.value;
    let hookPath = hookPathInput.value;

    // 启动 exe 文件
    exec(`"${exePath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`执行的错误: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });

    // 启动 hookServer.exe
    exec(`"${hookPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`执行的错误: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
});