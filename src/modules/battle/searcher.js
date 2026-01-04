/**
 * searcher.js - 死鱼搜索模块
 * 
 * 自动搜索并识别"死鱼"目标 (外置满载采集器的基地)
 */

// 导入依赖
var Coordinates = require("../../config/coordinates.js");
var Settings = require("../../config/settings.js");
var Thresholds = require("../../config/thresholds.js");

/**
 * 死鱼搜索器
 */
var DeadBaseSearcher = {
    // 搜索统计
    _searchCount: 0,
    _foundCount: 0,
    _skipCount: 0,

    // 模板缓存
    _templates: {},

    /**
     * 初始化搜索器
     */
    init: function () {
        console.log("[DeadBaseSearcher] 初始化死鱼搜索器...");
        this._searchCount = 0;
        this._foundCount = 0;
        this._skipCount = 0;
        this._loadTemplates();
        return this;
    },

    /**
     * 加载图像模板
     */
    _loadTemplates: function () {
        var basePath = "./images/";

        try {
            // 尝试加载采集器满载模板
            var templates = {
                "collector_full": basePath + "resources/gold_collector_full.png",
                "elixir_full": basePath + "resources/elixir_collector_full.png"
            };

            for (var key in templates) {
                var img = images.read(templates[key]);
                if (img) {
                    this._templates[key] = img;
                    console.log("[DeadBaseSearcher] 加载模板: " + key);
                }
            }
        } catch (e) {
            console.warn("[DeadBaseSearcher] 部分模板加载失败");
        }
    },

    /**
     * 开始搜索
     * @param {object} Utils - 工具模块引用
     * @returns {boolean} 是否找到合适目标
     */
    startSearch: function (Utils) {
        if (!Settings.deadBase.enabled) {
            console.log("[DeadBaseSearcher] 死鱼搜索已禁用");
            return false;
        }

        console.log("[DeadBaseSearcher] 开始搜索死鱼...");
        this._searchCount = 0;

        // 点击进攻按钮
        Utils.tap(Coordinates.home.attackBtn.x, Coordinates.home.attackBtn.y);
        sleep(random(1000, 1500));

        // 确认搜索 (点击"查找对手"按钮)
        Utils.tap(Coordinates.search.confirmAttackBtn.x, Coordinates.search.confirmAttackBtn.y);
        sleep(random(2000, 3000));

        // 进入搜索循环
        return this._searchLoop(Utils);
    },

    /**
     * 搜索循环
     */
    _searchLoop: function (Utils) {
        var maxSearch = Settings.deadBase.maxSearchCount;

        while (this._searchCount < maxSearch) {
            this._searchCount++;
            console.log("[DeadBaseSearcher] 搜索第 " + this._searchCount + "/" + maxSearch + " 个基地");

            // 等待加载
            sleep(random(1500, 2000));

            // 分析当前基地
            var analysis = this.analyzeBase();

            if (analysis.isDeadBase) {
                console.log("[DeadBaseSearcher] ★ 发现死鱼! 资源: G=" +
                    analysis.estimatedGold + " E=" + analysis.estimatedElixir);
                this._foundCount++;
                return true;  // 返回 true 表示找到目标
            }

            // 不满足条件，点击下一个
            console.log("[DeadBaseSearcher] 跳过此基地，搜索下一个...");
            this._skipCount++;
            Utils.tap(Coordinates.search.nextBtn.x, Coordinates.search.nextBtn.y);

            // 等待搜索
            sleep(random(
                Settings.timing.searchNextInterval.min,
                Settings.timing.searchNextInterval.max
            ));
        }

        console.log("[DeadBaseSearcher] 达到最大搜索次数，休息中...");
        sleep(Settings.deadBase.searchRestTime);

        return false;
    },

    /**
     * 分析当前基地
     * @returns {object} 分析结果
     */
    analyzeBase: function () {
        var result = {
            isDeadBase: false,
            estimatedGold: 0,
            estimatedElixir: 0,
            estimatedDarkElixir: 0,
            outsideCollectors: 0,
            fullCollectors: 0,
            score: 0
        };

        var screenshot = captureScreen();
        if (!screenshot) {
            return result;
        }

        // 方法1: 检测满载采集器数量
        result.fullCollectors = this._countFullCollectors(screenshot);

        // 方法2: 检测外置采集器 (边缘区域)
        result.outsideCollectors = this._countOutsideCollectors(screenshot);

        // 计算死鱼评分
        result.score = this._calculateScore(result);

        // 判定是否为死鱼
        // 条件: 满载采集器 >= 3 或 评分 >= 60
        result.isDeadBase = (result.fullCollectors >= 3) || (result.score >= 60);

        // 估算资源 (基于满载采集器数量)
        result.estimatedGold = result.fullCollectors * 100000;  // 粗略估算
        result.estimatedElixir = result.fullCollectors * 100000;

        // 回收截图
        screenshot.recycle();

        return result;
    },

    /**
     * 统计满载采集器数量
     */
    _countFullCollectors: function (screenshot) {
        var count = 0;

        // 使用模板匹配
        if (this._templates["collector_full"]) {
            var results = this._findAllImages(
                screenshot,
                this._templates["collector_full"],
                Thresholds.collection.fullStatus.gold
            );
            count += results.length;
        }

        if (this._templates["elixir_full"]) {
            var results = this._findAllImages(
                screenshot,
                this._templates["elixir_full"],
                Thresholds.collection.fullStatus.elixir
            );
            count += results.length;
        }

        // 如果没有模板，使用颜色检测
        if (count === 0) {
            count = this._countByColor(screenshot);
        }

        return count;
    },

    /**
     * 通过颜色统计满载采集器
     */
    _countByColor: function (screenshot) {
        var count = 0;

        // 满载金币采集器特征色 (亮黄色)
        var goldFullColor = Settings.image.collector.goldFullColor;
        var goldTolerance = Settings.image.collector.goldFullTolerance;

        // 在基地区域搜索
        var region = [100, 200, 520, 700];  // 排除UI区域

        try {
            // 统计满载颜色点数量
            var goldPoints = images.findAllPointsForColor(
                screenshot,
                goldFullColor,
                { tolerance: goldTolerance, region: region }
            );

            if (goldPoints && goldPoints.length > 50) {
                // 每50个满载像素点估算为1个满载采集器
                count += Math.floor(goldPoints.length / 50);
            }
        } catch (e) {
            // findAllPointsForColor 可能不可用
            // 使用简单的颜色检测
            var point = images.findColor(screenshot, goldFullColor, {
                threshold: goldTolerance,
                region: region
            });

            while (point && count < 10) {
                count++;
                region[0] = point.x + 60;  // 移动搜索区域

                if (region[0] >= region[2]) break;

                point = images.findColor(screenshot, goldFullColor, {
                    threshold: goldTolerance,
                    region: region
                });
            }
        }

        return count;
    },

    /**
     * 统计外置采集器 (边缘区域的采集器)
     */
    _countOutsideCollectors: function (screenshot) {
        // 边缘区域定义 (靠近屏幕边缘)
        var edgeRegions = [
            [50, 200, 150, 400],   // 左边缘
            [570, 200, 100, 400],  // 右边缘
            [150, 650, 420, 150]   // 下边缘
        ];

        var count = 0;

        for (var i = 0; i < edgeRegions.length; i++) {
            // 在边缘区域检测采集器
            var detected = this._detectCollectorInRegion(screenshot, edgeRegions[i]);
            count += detected;
        }

        return count;
    },

    /**
     * 在指定区域检测采集器
     */
    _detectCollectorInRegion: function (screenshot, region) {
        // 采集器通常是圆形建筑，可以通过边缘检测
        // 这里使用简化的颜色检测

        var goldColor = "#DAA520";  // 金矿颜色
        var elixirColor = "#8B008B"; // 圣水采集器颜色

        var count = 0;

        var goldPoint = images.findColor(screenshot, goldColor, {
            threshold: 35,
            region: region
        });
        if (goldPoint) count++;

        var elixirPoint = images.findColor(screenshot, elixirColor, {
            threshold: 35,
            region: region
        });
        if (elixirPoint) count++;

        return count;
    },

    /**
     * 计算死鱼评分 (0-100)
     */
    _calculateScore: function (analysis) {
        var score = 0;

        // 满载采集器权重
        score += analysis.fullCollectors * 15;

        // 外置采集器权重
        score += analysis.outsideCollectors * 20;

        // 上限100分
        return Math.min(score, 100);
    },

    /**
     * 查找所有匹配的图像
     */
    _findAllImages: function (screenshot, template, threshold) {
        var results = [];

        try {
            var point = images.findImage(screenshot, template, {
                threshold: threshold
            });

            // 简化版本: 只返回第一个找到的
            if (point) {
                results.push(point);
            }
        } catch (e) {
            console.warn("[DeadBaseSearcher] 图像搜索出错: " + e);
        }

        return results;
    },

    /**
     * 获取搜索统计
     */
    getStats: function () {
        return {
            totalSearched: this._searchCount,
            foundCount: this._foundCount,
            skipCount: this._skipCount,
            successRate: this._searchCount > 0 ?
                (this._foundCount / this._searchCount * 100).toFixed(1) + "%" : "0%"
        };
    },

    /**
     * 退出搜索 (返回村庄)
     */
    exitSearch: function (Utils) {
        console.log("[DeadBaseSearcher] 退出搜索...");

        // 点击结束/返回按钮
        Utils.tap(Coordinates.search.closeBtn.x, Coordinates.search.closeBtn.y);
        sleep(random(500, 800));

        // 确认退出
        Utils.tap(360, 750);  // 确认按钮大致位置
        sleep(random(1000, 1500));
    },

    /**
     * 清理资源
     */
    cleanup: function () {
        for (var key in this._templates) {
            if (this._templates[key]) {
                this._templates[key].recycle();
            }
        }
        this._templates = {};
    }
};

module.exports = DeadBaseSearcher;
