/**
 * detector.js - 界面状态检测器
 * 
 * 通过图像识别判断当前游戏界面状态
 */

// 导入依赖
var Constants = require("./constants.js");
var GameState = Constants.GameState;
var StateDescription = Constants.StateDescription;

// 导入配置
var Coordinates = require("../../config/coordinates.js");
var Settings = require("../../config/settings.js");
var Thresholds = require("../../config/thresholds.js");

/**
 * 状态检测器
 */
var StateDetector = {
    // 上次截图缓存
    _lastScreenshot: null,
    _lastScreenshotTime: 0,

    // 当前状态
    _currentState: GameState.UNKNOWN,

    // 图像模板缓存
    _templates: {},

    /**
     * 初始化检测器
     * 加载所有需要的图像模板
     */
    init: function () {
        console.log("[StateDetector] 初始化状态检测器...");

        // 预加载图像模板
        this._loadTemplates();

        console.log("[StateDetector] 初始化完成");
        return this;
    },

    /**
     * 加载图像模板
     */
    _loadTemplates: function () {
        var basePath = "./images/";

        // 尝试加载模板，如果文件不存在则跳过
        var templates = {
            // 按钮模板
            "attack_btn": basePath + "attack_btn.png",
            "next_btn": basePath + "next_btn.png",

            // 界面识别模板 (需要用户截图)
            "home_trophy": basePath + "screens/home_trophy.png",
            "battle_end": basePath + "screens/battle_end.png",
            "search_loading": basePath + "screens/search_loading.png",

            // 资源识别模板
            "elixir_icon": basePath + "elixir_icon.png"
        };

        for (var key in templates) {
            try {
                var img = images.read(templates[key]);
                if (img) {
                    this._templates[key] = img;
                    console.log("[StateDetector] 加载模板: " + key);
                }
            } catch (e) {
                console.warn("[StateDetector] 模板不存在: " + key);
            }
        }
    },

    /**
     * 获取当前截图 (带缓存)
     */
    getScreenshot: function (forceNew) {
        var now = Date.now();

        // 如果缓存有效，直接返回
        if (!forceNew &&
            this._lastScreenshot &&
            (now - this._lastScreenshotTime) < Settings.image.screenshotCacheTime) {
            return this._lastScreenshot;
        }

        // 获取新截图
        try {
            // 回收旧截图
            if (this._lastScreenshot) {
                this._lastScreenshot.recycle();
            }

            this._lastScreenshot = captureScreen();
            this._lastScreenshotTime = now;

            return this._lastScreenshot;
        } catch (e) {
            console.error("[StateDetector] 截图失败: " + e);
            return null;
        }
    },

    /**
     * 检测当前游戏状态
     * @returns {string} GameState 枚举值
     */
    detectState: function () {
        var screenshot = this.getScreenshot(true);

        if (!screenshot) {
            console.error("[StateDetector] 无法获取截图");
            return GameState.UNKNOWN;
        }

        // 按优先级检测各种状态
        var detectedState = GameState.UNKNOWN;

        // 1. 检测断线/维护状态 (最高优先级)
        if (this._detectDisconnected(screenshot)) {
            detectedState = GameState.DISCONNECTED;
        }
        // 2. 检测弹窗
        else if (this._detectPopup(screenshot)) {
            detectedState = GameState.POPUP;
        }
        // 3. 检测战斗结算
        else if (this._detectBattleEnd(screenshot)) {
            detectedState = GameState.BATTLE_END;
        }
        // 4. 检测战斗中
        else if (this._detectInBattle(screenshot)) {
            detectedState = GameState.IN_BATTLE;
        }
        // 5. 检测敌方基地 (准备攻击)
        else if (this._detectEnemyBase(screenshot)) {
            detectedState = GameState.ENEMY_BASE;
        }
        // 6. 检测搜索中
        else if (this._detectSearching(screenshot)) {
            detectedState = GameState.SEARCHING;
        }
        // 7. 检测训练界面
        else if (this._detectTraining(screenshot)) {
            detectedState = GameState.TRAINING;
        }
        // 8. 检测村庄主界面
        else if (this._detectHomeVillage(screenshot)) {
            detectedState = GameState.HOME_VILLAGE;
        }
        // 9. 默认加载中
        else {
            detectedState = GameState.LOADING;
        }

        // 更新当前状态
        if (this._currentState !== detectedState) {
            console.log("[StateDetector] 状态切换: " +
                StateDescription[this._currentState] + " -> " +
                StateDescription[detectedState]);
            this._currentState = detectedState;
        }

        return detectedState;
    },

    /**
     * 获取当前状态 (不重新检测)
     */
    getCurrentState: function () {
        return this._currentState;
    },

    /**
     * 获取状态描述
     */
    getStateDescription: function (state) {
        return StateDescription[state] || "未知";
    },

    // ==========================================
    // 私有检测方法
    // ==========================================

    /**
     * 检测村庄主界面
     * 通过查找进攻按钮来判断
     */
    _detectHomeVillage: function (screenshot) {
        var template = this._templates["attack_btn"];
        if (!template) {
            // 如果没有模板，使用坐标检测
            return this._detectByColor(screenshot, Coordinates.home.attackBtn, "#FF5722", 40);
        }

        var result = images.findImage(screenshot, template, {
            threshold: Thresholds.screens.home.attackBtn,
            region: [0, 900, 200, 380]  // 只在左下角搜索
        });

        return result !== null;
    },

    /**
     * 检测敌方基地 (搜索到对手后)
     * 通过查找"下一个"按钮来判断
     */
    _detectEnemyBase: function (screenshot) {
        var template = this._templates["next_btn"];
        if (!template) {
            return false;
        }

        var result = images.findImage(screenshot, template, {
            threshold: Thresholds.screens.search.nextBtn,
            region: [500, 900, 220, 380]  // 只在右下角搜索
        });

        return result !== null;
    },

    /**
     * 检测战斗进行中
     * 通过检测投降按钮或部队栏来判断
     */
    _detectInBattle: function (screenshot) {
        // 检测左下角是否有投降按钮 (白旗图标)
        // TODO: 需要投降按钮截图模板

        // 临时方案: 检测底部是否有部队槽位 (通过颜色)
        var troopBarY = 1150;
        var hasTroopBar = false;

        for (var x = 100; x < 600; x += 100) {
            var pixel = images.pixel(screenshot, x, troopBarY);
            // 部队栏背景通常是深色
            if (this._isDarkPixel(pixel)) {
                hasTroopBar = true;
                break;
            }
        }

        return hasTroopBar && !this._detectHomeVillage(screenshot) && !this._detectEnemyBase(screenshot);
    },

    /**
     * 检测战斗结算界面
     */
    _detectBattleEnd: function (screenshot) {
        var template = this._templates["battle_end"];
        if (!template) {
            // 备用方案: 检测返回家园按钮位置
            return this._detectByColor(screenshot, Coordinates.battleEnd.returnHomeBtn, "#4CAF50", 40);
        }

        var result = images.findImage(screenshot, template, {
            threshold: Thresholds.screens.battleEnd.returnBtn
        });

        return result !== null;
    },

    /**
     * 检测搜索中 (正在匹配对手)
     */
    _detectSearching: function (screenshot) {
        var template = this._templates["search_loading"];
        if (!template) {
            return false;
        }

        var result = images.findImage(screenshot, template, {
            threshold: Thresholds.screens.loading.loadingBar
        });

        return result !== null;
    },

    /**
     * 检测训练界面
     */
    _detectTraining: function (screenshot) {
        // TODO: 需要训练界面截图模板
        return false;
    },

    /**
     * 检测弹窗
     */
    _detectPopup: function (screenshot) {
        // 检测常见弹窗: 中央有大面积白色/浅色区域
        var centerX = 360;
        var centerY = 640;
        var popupDetected = false;

        // 检测中心区域是否有弹窗背景色
        var samplePoints = [
            { x: centerX - 100, y: centerY },
            { x: centerX + 100, y: centerY },
            { x: centerX, y: centerY - 50 },
            { x: centerX, y: centerY + 50 }
        ];

        var lightPixelCount = 0;
        for (var i = 0; i < samplePoints.length; i++) {
            var pixel = images.pixel(screenshot, samplePoints[i].x, samplePoints[i].y);
            if (this._isLightPixel(pixel)) {
                lightPixelCount++;
            }
        }

        // 如果大部分采样点都是浅色，可能是弹窗
        return lightPixelCount >= 3;
    },

    /**
     * 检测断线状态
     */
    _detectDisconnected: function (screenshot) {
        // TODO: 需要断线提示截图模板
        return false;
    },

    // ==========================================
    // 辅助方法
    // ==========================================

    /**
     * 通过颜色检测
     */
    _detectByColor: function (screenshot, point, targetColor, tolerance) {
        try {
            var pixel = images.pixel(screenshot, point.x, point.y);
            return colors.isSimilar(pixel, colors.parseColor(targetColor), tolerance);
        } catch (e) {
            return false;
        }
    },

    /**
     * 判断是否为深色像素
     */
    _isDarkPixel: function (pixel) {
        var r = colors.red(pixel);
        var g = colors.green(pixel);
        var b = colors.blue(pixel);
        return (r + g + b) / 3 < 80;
    },

    /**
     * 判断是否为浅色像素
     */
    _isLightPixel: function (pixel) {
        var r = colors.red(pixel);
        var g = colors.green(pixel);
        var b = colors.blue(pixel);
        return (r + g + b) / 3 > 180;
    },

    /**
     * 在指定区域查找图像
     */
    findInRegion: function (template, region) {
        var screenshot = this.getScreenshot();
        if (!screenshot || !template) return null;

        return images.findImage(screenshot, template, {
            threshold: Settings.image.defaultThreshold,
            region: region
        });
    },

    /**
     * 在指定区域查找颜色
     */
    findColorInRegion: function (color, region) {
        var screenshot = this.getScreenshot();
        if (!screenshot) return null;

        return images.findColor(screenshot, color, {
            threshold: Settings.image.colorTolerance,
            region: region
        });
    },

    /**
     * 清理资源
     */
    cleanup: function () {
        // 回收截图
        if (this._lastScreenshot) {
            this._lastScreenshot.recycle();
            this._lastScreenshot = null;
        }

        // 回收模板
        for (var key in this._templates) {
            if (this._templates[key]) {
                this._templates[key].recycle();
            }
        }
        this._templates = {};

        console.log("[StateDetector] 资源已清理");
    }
};

module.exports = StateDetector;
