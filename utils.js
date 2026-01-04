// utils.js - 基础功能封装

var Utils = {};

// 1. Root 点击封装 (加入随机防检测)
Utils.tap = function(x, y) {
    // 随机偏移 ±10 像素
    var rx = x + random(-10, 10);
    var ry = y + random(-10, 10);
    
    // 执行 Root 点击
    shell("input tap " + rx + " " + ry, true);
    
    // 随机延迟，模拟人类操作间隔 (100ms - 300ms)
    sleep(random(100, 300));
};

// 2. 启动游戏
Utils.launchGame = function() {
    toast("正在启动部落冲突...");
    // 国际服包名: com.supercell.clashofclans
    // 国服包名可能是: com.tencent.tmgp.supercell.clashofclans (请根据实际情况修改)
    app.launchPackage("com.supercell.clashofclans");
    waitForPackage("com.supercell.clashofclans", 20000); // 等待应用在前台
};

// 3. 检查是否在主界面 (通过找图)
Utils.isAtHome = function() {
    // 截屏
    var img = captureScreen();
    // 读取本地的进攻按钮图片
    var template = images.read("./images/attack_btn.png");
    
    // 在大图中找小图
    // threshold: 0.8 表示相似度 80%
    var p = findImage(img, template, {
        threshold: 0.8
    });
    
    // 记得回收图片内存，防止脚本崩坏
    template.recycle();
    
    if (p) {
        return true; // 找到了
    } else {
        return false; // 没找到
    }
};

module.exports = Utils;