/**
 * collector.js - 资源收割模块
 * 
 * 自动收集村庄中的金币、圣水、黑油
 */

// 导入依赖
var Coordinates = require("../../config/coordinates.js");
var Settings = require("../../config/settings.js");

/**
 * 资源收集器
 */
var Collector = {
    // 上次收集时间
    _lastCollectTime: 0,

    // 收集统计
    _stats: {
        gold: 0,
        elixir: 0,
        darkElixir: 0,
        totalClicks: 0
    },

    /**
     * 初始化收集器
     */
    init: function () {
        console.log("[Collector] 初始化资源收集器...");
        this._lastCollectTime = 0;
        this._stats = { gold: 0, elixir: 0, darkElixir: 0, totalClicks: 0 };
        return this;
    },

    /**
     * 检查是否需要收集
     */
    needsCollection: function () {
        var now = Date.now();
        return (now - this._lastCollectTime) >= Settings.timing.collectInterval;
    },

    /**
     * 执行资源收集
     * @param {object} Utils - 工具模块引用
     * @returns {boolean} 是否成功收集
     */
    collect: function (Utils) {
        console.log("[Collector] 开始收集资源...");

        var collectedCount = 0;
        var screenshot = captureScreen();

        if (!screenshot) {
            console.error("[Collector] 无法获取截图");
            return false;
        }

        // 方法1: 扫描预设坐标点
        collectedCount += this._scanPredefinedPoints(Utils);

        // 方法2: 通过颜色识别收集图标
        collectedCount += this._scanByColor(Utils, screenshot);

        // 回收截图
        screenshot.recycle();

        // 更新统计
        this._lastCollectTime = Date.now();
        this._stats.totalClicks += collectedCount;

        console.log("[Collector] 收集完成，本次点击: " + collectedCount);
        return collectedCount > 0;
    },

    /**
     * 扫描预设坐标点
     * 适用于固定布局的村庄
     */
    _scanPredefinedPoints: function (Utils) {
        var scanPoints = Coordinates.collectors.scanPoints;
        var clickCount = 0;

        console.log("[Collector] 扫描 " + scanPoints.length + " 个预设点...");

        for (var i = 0; i < scanPoints.length; i++) {
            var point = scanPoints[i];

            // 点击采集器位置
            Utils.tap(point.x, point.y);

            // 短暂延迟后再次点击 (确保收集)
            sleep(random(50, 100));

            // 点击收集图标位置 (偏移量)
            var collectPoint = {
                x: point.x + Coordinates.collectors.collectIconOffset.x,
                y: point.y + Coordinates.collectors.collectIconOffset.y
            };
            Utils.tap(collectPoint.x, collectPoint.y);

            clickCount++;

            // 随机延迟，模拟人类操作
            sleep(random(100, 200));
        }

        return clickCount;
    },

    /**
     * 通过颜色识别收集图标
     * 更精确但需要模板图片
     */
    _scanByColor: function (Utils, screenshot) {
        var clickCount = 0;

        // 金币收集图标颜色 (金黄色)
        var goldColor = "#FFD700";

        // 圣水收集图标颜色 (紫色/粉色)
        var elixirColor = "#FF69B4";

        // 搜索金币收集图标
        var goldPoints = this._findAllColors(screenshot, goldColor, 30);
        console.log("[Collector] 找到 " + goldPoints.length + " 个金币图标");

        for (var i = 0; i < goldPoints.length && i < 10; i++) {
            Utils.tap(goldPoints[i].x, goldPoints[i].y);
            clickCount++;
            sleep(random(100, 150));
        }

        // 搜索圣水收集图标
        var elixirPoints = this._findAllColors(screenshot, elixirColor, 30);
        console.log("[Collector] 找到 " + elixirPoints.length + " 个圣水图标");

        for (var i = 0; i < elixirPoints.length && i < 10; i++) {
            Utils.tap(elixirPoints[i].x, elixirPoints[i].y);
            clickCount++;
            sleep(random(100, 150));
        }

        return clickCount;
    },

    /**
     * 查找所有匹配颜色的点
     */
    _findAllColors: function (screenshot, color, tolerance) {
        var points = [];
        var region = [50, 200, 620, 800];  // 村庄显示区域

        try {
            // 使用 images.findAllPointsForColor 如果可用
            // 否则使用循环查找
            var point = images.findColor(screenshot, color, {
                threshold: tolerance,
                region: region
            });

            while (point && points.length < 20) {
                points.push({ x: point.x, y: point.y });

                // 在找到的点周围标记为已搜索 (通过缩小区域)
                region = [point.x + 50, region[1], region[2], region[3]];

                if (region[0] >= region[2] + 50) {
                    break;
                }

                point = images.findColor(screenshot, color, {
                    threshold: tolerance,
                    region: region
                });
            }
        } catch (e) {
            console.warn("[Collector] 颜色搜索出错: " + e);
        }

        return points;
    },

    /**
     * 快速收集 (只点击一次屏幕中心)
     * 用于触发悬浮的收集动画
     */
    quickCollect: function (Utils) {
        console.log("[Collector] 执行快速收集...");

        // 连续点击屏幕多个位置
        var quickPoints = [
            { x: 200, y: 400 },
            { x: 360, y: 500 },
            { x: 520, y: 400 },
            { x: 280, y: 600 },
            { x: 440, y: 600 }
        ];

        for (var i = 0; i < quickPoints.length; i++) {
            Utils.tap(quickPoints[i].x, quickPoints[i].y);
            sleep(random(50, 100));
        }
    },

    /**
     * 获取收集统计
     */
    getStats: function () {
        return this._stats;
    },

    /**
     * 重置统计
     */
    resetStats: function () {
        this._stats = { gold: 0, elixir: 0, darkElixir: 0, totalClicks: 0 };
    }
};

module.exports = Collector;
