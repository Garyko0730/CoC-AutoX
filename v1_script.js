// ==========================================
// 整合版 CoC 脚本 (无需 project.json)
// ==========================================

// --- 第一部分：工具库定义 (原 utils.js) ---
var Utils = {};

// Root 点击封装
Utils.tap = function(x, y) {
    var rx = x + random(-10, 10);
    var ry = y + random(-10, 10);
    // 执行 Root 点击
    shell("input tap " + rx + " " + ry, true);
    sleep(random(100, 300));
};

// 启动游戏
Utils.launchGame = function() {
    toast("正在启动部落冲突...");
    var pkg = "com.supercell.clashofclans"; // 国际服
    // var pkg = "com.tencent.tmgp.supercell.clashofclans"; // 国服(如有需要请取消注释)
    
    app.launchPackage(pkg);
    waitForPackage(pkg, 20000);
};

// 检查是否在主界面
Utils.isAtHome = function() {
    // 临时逻辑：为了防止图片路径报错，先强制返回 true
    // 等脚本跑通了，再把下面这段注释解开
    /*
    var img = captureScreen();
    // 注意：单文件运行时，建议使用绝对路径，或者确保图片已上传到手机
    var template = images.read("/sdcard/脚本/images/attack_btn.png");
    if(!template) return false;
    
    var p = findImage(img, template, { threshold: 0.8 });
    template.recycle();
    return p ? true : false;
    */
    
    return true; // <--- 暂时默认认为在家乡，测试点击功能
};

// --- 第二部分：主逻辑 (原 main.js) ---

// 开启控制台
console.show(); 

// 申请截图权限
if (!requestScreenCapture()) {
    toast("请求截图失败");
    exit();
}

console.log("=== 脚本启动 (单文件版) ===");

// 启动游戏
Utils.launchGame();

console.log("等待游戏加载 5秒...");
sleep(5000);

// 主循环
while (true) {
    if (Utils.isAtHome()) {
        console.log("状态: 在家乡主界面");
        console.log("执行防掉线点击...");
        // 模拟点击屏幕上方
        Utils.tap(600, 200); 
    } else {
        console.log("状态: 未知界面");
    }

    // 随机等待 4-6 秒
    var waitTime = random(4000, 6000);
    console.log("下次操作等待: " + waitTime + "ms");
    sleep(waitTime);
}