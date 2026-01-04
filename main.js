// main.js - 脚本入口

// 1. 导入工具模块
var Tool = require("./utils.js");

// 2. 申请权限
// 开启控制台
console.show(); 
// 申请截图权限 (第一次运行需要手动允许)
if (!requestScreenCapture()) {
    toast("请求截图失败");
    exit();
}

console.log("=== CoC 脚本启动 ===");

// 3. 启动游戏
Tool.launchGame();

// 等待游戏加载 (给个 10 秒缓冲)
console.log("等待游戏加载...");
sleep(10000);

// 4. 进入主循环 (死循环，直到手动停止)
while (true) {
    // 截屏并判断状态
    if (Tool.isAtHome()) {
        console.log("状态: 在家乡主界面");
        
        // --- 可以在这里加入收菜逻辑 ---
        
        // 防掉线操作：点击屏幕空白处 (例如右上角，避开UI)
        console.log("执行防掉线点击...");
        Tool.tap(1000, 100); 
        
    } else {
        console.log("状态: 未知界面 (可能是战斗中或加载中)");
    }

    // 每 5 秒检测一次循环
    // 加上随机时间，防止被服务器判定为机器人
    var waitTime = random(4000, 6000);
    sleep(waitTime);
}