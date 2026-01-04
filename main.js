/**
 * main.js - CoC-AutoX 主入口
 * 
 * 基于 AutoX.js 的《部落冲突》自动化脚本
 * 设备分辨率: 720x1280 dpi320
 * 游戏版本: 国际服
 */

"use strict";

// ==========================================
// 模块导入
// ==========================================

// 核心工具
var Utils = require("./utils.js");

// 配置文件
var Settings = require("./config/settings.js");
var Coordinates = require("./config/coordinates.js");

// 功能模块 (按需加载)
var StateDetector = require("./src/modules/state/detector.js");
var GameState = require("./src/modules/state/constants.js").GameState;
var Collector = require("./src/modules/village/collector.js");
var DeadBaseSearcher = require("./src/modules/battle/searcher.js");
var Trainer = require("./src/modules/train/trainer.js");
var Donator = require("./src/modules/donate/donator.js");

// ==========================================
// 全局变量
// ==========================================

var isRunning = true;           // 脚本运行状态
var loopCount = 0;              // 主循环计数
var lastAntiAfkTime = 0;        // 上次防掉线时间
var failureCount = 0;           // 连续失败计数

// ==========================================
// 初始化
// ==========================================

function init() {
    console.log("========================================");
    console.log("   CoC-AutoX 自动化脚本 v1.0.0");
    console.log("   设备: 720x1280 dpi320");
    console.log("   游戏: 国际服");
    console.log("========================================");

    // 开启控制台
    if (Settings.logging.showConsole) {
        console.show();
    }

    // 申请截图权限
    if (!requestScreenCapture()) {
        toast("请求截图权限失败!");
        console.error("截图权限获取失败，脚本退出");
        exit();
    }

    console.log("[Main] 截图权限已获取");

    // 初始化模块
    StateDetector.init();
    Collector.init();
    DeadBaseSearcher.init();
    Trainer.init();
    Donator.init();

    console.log("[Main] 模块初始化完成");

    // 启动游戏
    Utils.launchGame();

    // 等待游戏加载
    console.log("[Main] 等待游戏加载...");
    sleep(Settings.game.loadingWaitTime);

    console.log("[Main] 初始化完成，进入主循环");
}

// ==========================================
// 主循环
// ==========================================

function mainLoop() {
    while (isRunning) {
        loopCount++;

        try {
            // 1. 检测当前状态
            var currentState = StateDetector.detectState();

            // 2. 根据状态执行对应操作
            handleState(currentState);

            // 3. 防掉线检查
            checkAntiAfk();

            // 4. 重置失败计数
            failureCount = 0;

        } catch (e) {
            console.error("[Main] 主循环异常: " + e);
            failureCount++;

            // 连续失败过多，尝试恢复
            if (failureCount >= Settings.safety.maxFailureCount) {
                console.warn("[Main] 连续失败过多，尝试恢复...");
                attemptRecovery();
            }
        }

        // 5. 主循环间隔
        var waitTime = random(
            Settings.timing.mainLoopInterval.min,
            Settings.timing.mainLoopInterval.max
        );
        sleep(waitTime);
    }
}

// ==========================================
// 状态处理
// ==========================================

function handleState(state) {
    switch (state) {
        case GameState.HOME_VILLAGE:
            handleHomeVillage();
            break;

        case GameState.ENEMY_BASE:
            handleEnemyBase();
            break;

        case GameState.IN_BATTLE:
            handleInBattle();
            break;

        case GameState.BATTLE_END:
            handleBattleEnd();
            break;

        case GameState.SEARCHING:
            // 正在搜索，等待即可
            console.log("[Main] 搜索中，等待...");
            sleep(1000);
            break;

        case GameState.POPUP:
            handlePopup();
            break;

        case GameState.DISCONNECTED:
            handleDisconnected();
            break;

        case GameState.LOADING:
            console.log("[Main] 加载中，等待...");
            sleep(2000);
            break;

        default:
            console.log("[Main] 未知状态: " + state);
            Utils.antiAfk();  // 执行防掉线
    }
}

/**
 * 处理村庄主界面
 */
function handleHomeVillage() {
    console.log("[Main] 当前状态: 村庄主界面");

    // 检查是否需要收菜
    if (Collector.needsCollection()) {
        console.log("[Main] 执行资源收集...");
        Collector.collect(Utils);
    }

    // 检查是否需要训练
    if (Trainer.needsTraining()) {
        console.log("[Main] 执行自动训练...");
        Trainer.trainTroops(Utils);
    }

    // 检查是否需要捐赠
    if (Donator.needsDonationCheck()) {
        console.log("[Main] 检查捐赠请求...");
        Donator.checkAndDonate(Utils);
    }

    // 示例: 自动开始搜索 (可配置)
    if (Settings.deadBase.enabled) {
        console.log("[Main] 开始死鱼搜索...");
        var found = DeadBaseSearcher.startSearch(Utils);

        if (found) {
            console.log("[Main] 找到死鱼目标!");
            // 后续处理在 handleEnemyBase 中
        }
    }
}

/**
 * 处理敌方基地界面
 */
function handleEnemyBase() {
    console.log("[Main] 当前状态: 查看敌方基地");

    // 分析基地
    var analysis = DeadBaseSearcher.analyzeBase();

    if (analysis.isDeadBase) {
        console.log("[Main] 确认为死鱼，准备攻击...");

        // 执行攻击
        executeAttack();

    } else {
        console.log("[Main] 不满足条件，搜索下一个...");
        Utils.tap(Coordinates.search.nextBtn.x, Coordinates.search.nextBtn.y);
        sleep(random(1000, 1500));
    }
}

/**
 * 执行攻击 (简化版 - 放置野蛮人)
 */
function executeAttack() {
    console.log("[Main] 开始攻击...");

    // 选择第一个兵种槽位 (假设是野蛮人)
    var troopSlot = Coordinates.battle.troopSlots[0];
    Utils.tap(troopSlot.x, troopSlot.y);
    sleep(300);

    // 在边缘区域部署兵力
    var deployPoints = [
        { x: 100, y: 400 },
        { x: 150, y: 450 },
        { x: 200, y: 500 },
        { x: 250, y: 550 },
        { x: 100, y: 600 },
        { x: 150, y: 650 }
    ];

    // 连续点击部署
    for (var i = 0; i < deployPoints.length; i++) {
        Utils.tapExact(deployPoints[i].x, deployPoints[i].y);
        sleep(random(30, 50));
    }

    console.log("[Main] 兵力部署完成");

    // 等待战斗结束 (最多3分钟)
    sleep(random(5000, 8000));
}

/**
 * 处理战斗中
 */
function handleInBattle() {
    console.log("[Main] 当前状态: 战斗中");

    // 等待战斗结束
    // 可以添加智能投降逻辑
    sleep(2000);
}

/**
 * 处理战斗结算
 */
function handleBattleEnd() {
    console.log("[Main] 当前状态: 战斗结算");

    // 等待一会，然后点击返回
    sleep(random(2000, 3000));

    // 点击返回家园
    Utils.tap(
        Coordinates.battleEnd.returnHomeBtn.x,
        Coordinates.battleEnd.returnHomeBtn.y
    );

    sleep(random(2000, 3000));
}

/**
 * 处理弹窗
 */
function handlePopup() {
    console.log("[Main] 检测到弹窗，尝试关闭...");
    Utils.closePopup();
}

/**
 * 处理断线
 */
function handleDisconnected() {
    console.log("[Main] 检测到断线，尝试重连...");

    // 点击屏幕尝试重连
    Utils.tap(360, 800);
    sleep(3000);

    // 检查游戏是否在前台
    Utils.returnToGame();
}

/**
 * 防掉线检查
 */
function checkAntiAfk() {
    var now = Date.now();
    var interval = random(
        Settings.timing.antiAfkInterval.min,
        Settings.timing.antiAfkInterval.max
    );

    if (now - lastAntiAfkTime > interval) {
        Utils.antiAfk();
        lastAntiAfkTime = now;
    }
}

/**
 * 尝试恢复
 */
function attemptRecovery() {
    console.log("[Main] 执行恢复流程...");

    // 尝试关闭弹窗
    Utils.closePopup();
    sleep(1000);

    // 尝试返回游戏
    Utils.returnToGame();
    sleep(Settings.safety.recoveryWaitTime);

    // 重置失败计数
    failureCount = 0;
}

// ==========================================
// 脚本控制
// ==========================================

/**
 * 停止脚本
 */
function stop() {
    console.log("[Main] 正在停止脚本...");
    isRunning = false;

    // 清理资源
    StateDetector.cleanup();
    DeadBaseSearcher.cleanup();

    console.log("[Main] 脚本已停止");

    // 打印统计信息
    console.log("========================================");
    console.log("运行统计:");
    console.log("  主循环次数: " + loopCount);
    console.log("  收集统计: " + JSON.stringify(Collector.getStats()));
    console.log("  搜索统计: " + JSON.stringify(DeadBaseSearcher.getStats()));
    console.log("  训练统计: " + JSON.stringify(Trainer.getStats()));
    console.log("  捐赠统计: " + JSON.stringify(Donator.getStats()));
    console.log("========================================");
}

// 监听脚本停止事件
events.on("exit", function () {
    stop();
});

// ==========================================
// 启动脚本
// ==========================================

try {
    init();
    mainLoop();
} catch (e) {
    console.error("[Main] 致命错误: " + e);
    stop();
}