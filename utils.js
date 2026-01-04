/**
 * utils.js - 增强版工具库
 * 
 * CoC-AutoX 核心工具函数
 * 设备分辨率: 720x1280 dpi320
 */

// 导入配置
var Coordinates = require("./config/coordinates.js");
var Settings = require("./config/settings.js");

/**
 * 工具库
 */
var Utils = {
    // ==========================================
    // 基础操作
    // ==========================================

    /**
     * Root 点击封装 (带随机防检测)
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} [offsetRange=10] - 随机偏移范围
     */
    tap: function (x, y, offsetRange) {
        offsetRange = offsetRange || Settings.safety.clickRandomOffset;

        // 随机偏移
        var rx = x + random(-offsetRange, offsetRange);
        var ry = y + random(-offsetRange, offsetRange);

        // 边界检查
        rx = Math.max(0, Math.min(rx, Coordinates.device.width));
        ry = Math.max(0, Math.min(ry, Coordinates.device.height));

        // 执行 Root 点击
        shell("input tap " + rx + " " + ry, true);

        // 随机延迟
        sleep(random(
            Settings.timing.quickDelay.min,
            Settings.timing.quickDelay.max
        ));
    },

    /**
     * 精确点击 (无随机偏移)
     */
    tapExact: function (x, y) {
        shell("input tap " + x + " " + y, true);
        sleep(random(50, 100));
    },

    /**
     * 长按
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} duration - 持续时间(毫秒)
     */
    longPress: function (x, y, duration) {
        duration = duration || 500;
        shell("input swipe " + x + " " + y + " " + x + " " + y + " " + duration, true);
        sleep(random(100, 200));
    },

    /**
     * 滑动
     * @param {number} x1 - 起始X
     * @param {number} y1 - 起始Y
     * @param {number} x2 - 结束X
     * @param {number} y2 - 结束Y
     * @param {number} duration - 持续时间
     */
    swipe: function (x1, y1, x2, y2, duration) {
        duration = duration || 300;
        shell("input swipe " + x1 + " " + y1 + " " + x2 + " " + y2 + " " + duration, true);
        sleep(random(200, 400));
    },

    /**
     * 多点连续点击 (用于快速部署兵力)
     * @param {Array} points - 点击坐标数组 [{x, y}, ...]
     * @param {number} interval - 点击间隔
     */
    multiTap: function (points, interval) {
        interval = interval || 50;

        for (var i = 0; i < points.length; i++) {
            this.tapExact(points[i].x, points[i].y);
            if (i < points.length - 1) {
                sleep(interval);
            }
        }
    },

    // ==========================================
    // 游戏控制
    // ==========================================

    /**
     * 启动游戏
     */
    launchGame: function () {
        console.log("[Utils] 正在启动部落冲突...");
        toast("正在启动部落冲突...");

        var pkg = Settings.game.package;
        app.launchPackage(pkg);

        // 等待应用启动
        var success = waitForPackage(pkg, Settings.game.launchWaitTime);

        if (success) {
            console.log("[Utils] 游戏启动成功");
        } else {
            console.error("[Utils] 游戏启动失败");
        }

        return success;
    },

    /**
     * 检查游戏是否在前台
     */
    isGameRunning: function () {
        var pkg = Settings.game.package;
        var currentPkg = currentPackage();
        return currentPkg === pkg;
    },

    /**
     * 返回游戏
     */
    returnToGame: function () {
        if (!this.isGameRunning()) {
            console.log("[Utils] 游戏不在前台，正在返回...");
            this.launchGame();
            sleep(Settings.game.loadingWaitTime);
        }
    },

    // ==========================================
    // 状态检测 (简化版，兼容旧代码)
    // ==========================================

    /**
     * 检查是否在主界面
     * @returns {boolean}
     */
    isAtHome: function () {
        try {
            var img = captureScreen();
            if (!img) return false;

            // 方法1: 使用模板匹配
            var template = images.read("./images/attack_btn.png");
            if (template) {
                var p = findImage(img, template, {
                    threshold: 0.8,
                    region: [0, 900, 200, 380]
                });
                template.recycle();

                if (p) {
                    return true;
                }
            }

            // 方法2: 颜色检测备用方案
            // 检测进攻按钮区域的特征色 (橙色/红色)
            var attackBtnColor = "#FF5722";
            var point = images.findColor(img, attackBtnColor, {
                threshold: 40,
                region: [20, 1050, 120, 100]
            });

            return point !== null;

        } catch (e) {
            console.warn("[Utils] 状态检测出错: " + e);
            return false;
        }
    },

    /**
     * 检查是否在搜索界面 (看到敌方基地)
     */
    isAtEnemyBase: function () {
        try {
            var img = captureScreen();
            if (!img) return false;

            var template = images.read("./images/next_btn.png");
            if (template) {
                var p = findImage(img, template, {
                    threshold: 0.8,
                    region: [500, 1000, 220, 280]
                });
                template.recycle();
                return p !== null;
            }

            return false;
        } catch (e) {
            return false;
        }
    },

    // ==========================================
    // 通用操作
    // ==========================================

    /**
     * 防掉线操作
     */
    antiAfk: function () {
        console.log("[Utils] 执行防掉线点击...");
        this.tap(
            Coordinates.home.safeClickArea.x,
            Coordinates.home.safeClickArea.y
        );
    },

    /**
     * 关闭弹窗 (通用)
     */
    closePopup: function () {
        console.log("[Utils] 尝试关闭弹窗...");

        // 尝试点击右上角关闭按钮
        this.tap(680, 150);
        sleep(300);

        // 尝试点击屏幕边缘
        this.tap(50, 640);
        sleep(300);

        // 尝试返回键
        back();
        sleep(300);
    },

    /**
     * 等待界面加载
     * @param {number} timeout - 超时时间(毫秒)
     * @param {function} checkFunc - 检测函数
     */
    waitForScreen: function (timeout, checkFunc) {
        var startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            if (checkFunc()) {
                return true;
            }
            sleep(500);
        }

        return false;
    },

    // ==========================================
    // 随机工具
    // ==========================================

    /**
     * 随机延迟
     */
    randomSleep: function (min, max) {
        sleep(random(min, max));
    },

    /**
     * 标准操作延迟
     */
    standardDelay: function () {
        this.randomSleep(
            Settings.timing.standardDelay.min,
            Settings.timing.standardDelay.max
        );
    },

    /**
     * 长延迟
     */
    longDelay: function () {
        this.randomSleep(
            Settings.timing.longDelay.min,
            Settings.timing.longDelay.max
        );
    },

    // ==========================================
    // 日志工具
    // ==========================================

    /**
     * 日志输出 (带时间戳)
     */
    log: function (message, level) {
        level = level || "info";
        var timestamp = new Date().toLocaleTimeString();
        var logMsg = "[" + timestamp + "] [" + level.toUpperCase() + "] " + message;

        if (Settings.logging.showConsole) {
            console.log(logMsg);
        }
    },

    /**
     * 调试日志
     */
    debug: function (message) {
        if (Settings.logging.level === "debug") {
            this.log(message, "debug");
        }
    },

    /**
     * 警告日志
     */
    warn: function (message) {
        this.log(message, "warn");
    },

    /**
     * 错误日志
     */
    error: function (message) {
        this.log(message, "error");
    }
};

module.exports = Utils;