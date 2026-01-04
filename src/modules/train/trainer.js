/**
 * trainer.js - 训练系统核心模块
 * 
 * 自动训练兵种和法术
 */

// 导入依赖
var Coordinates = require("../../config/coordinates.js");
var Settings = require("../../config/settings.js");
var RecipeModule = require("./recipes.js");
var TroopType = RecipeModule.TroopType;
var Recipes = RecipeModule.Recipes;

/**
 * 训练器
 */
var Trainer = {
    // 上次训练检查时间
    _lastCheckTime: 0,

    // 当前配方
    _currentRecipe: null,

    // 训练统计
    _stats: {
        trainedCount: 0,
        sessionStart: 0
    },

    /**
     * 初始化训练器
     */
    init: function () {
        console.log("[Trainer] 初始化训练系统...");

        this._lastCheckTime = 0;
        this._stats = {
            trainedCount: 0,
            sessionStart: Date.now()
        };

        // 加载默认配方
        var defaultRecipeName = Settings.training.defaultRecipe;
        this._currentRecipe = RecipeModule.getRecipe(defaultRecipeName);

        if (this._currentRecipe) {
            console.log("[Trainer] 已加载配方: " + this._currentRecipe.name);
            console.log("[Trainer] 配方空间: " + RecipeModule.calculateRecipeSpace(this._currentRecipe));
        } else {
            console.warn("[Trainer] 未找到配方: " + defaultRecipeName + "，使用默认 barch");
            this._currentRecipe = Recipes.barch;
        }

        return this;
    },

    /**
     * 设置当前配方
     * @param {string} recipeName - 配方名称
     */
    setRecipe: function (recipeName) {
        var recipe = RecipeModule.getRecipe(recipeName);
        if (recipe) {
            this._currentRecipe = recipe;
            console.log("[Trainer] 已切换配方: " + recipe.name);
            return true;
        }
        console.warn("[Trainer] 配方不存在: " + recipeName);
        return false;
    },

    /**
     * 获取当前配方
     */
    getCurrentRecipe: function () {
        return this._currentRecipe;
    },

    /**
     * 检查是否需要训练
     */
    needsTraining: function () {
        if (!Settings.training.enabled) {
            return false;
        }

        var now = Date.now();
        return (now - this._lastCheckTime) >= Settings.training.checkInterval;
    },

    /**
     * 执行训练流程
     * @param {object} Utils - 工具模块引用
     * @returns {boolean} 是否成功执行
     */
    trainTroops: function (Utils) {
        if (!this._currentRecipe) {
            console.error("[Trainer] 没有设置配方");
            return false;
        }

        console.log("[Trainer] 开始训练: " + this._currentRecipe.name);

        // 1. 打开训练界面
        if (!this._openTrainingPanel(Utils)) {
            console.warn("[Trainer] 无法打开训练界面");
            return false;
        }

        // 2. 按配方训练兵种
        var trained = this._trainByRecipe(Utils);

        // 3. 关闭训练界面
        this._closeTrainingPanel(Utils);

        // 4. 更新统计
        this._lastCheckTime = Date.now();
        if (trained) {
            this._stats.trainedCount++;
        }

        return trained;
    },

    /**
     * 打开训练界面
     */
    _openTrainingPanel: function (Utils) {
        console.log("[Trainer] 打开训练界面...");

        // 点击训练按钮 (底部工具栏)
        Utils.tap(Coordinates.train.trainBtn.x, Coordinates.train.trainBtn.y);
        sleep(random(800, 1200));

        // 检测是否成功打开 (通过检测关闭按钮)
        var screenshot = captureScreen();
        if (!screenshot) {
            return false;
        }

        // 简单验证：检测训练界面特征
        // 训练界面顶部应该有标签页
        var isOpen = this._verifyTrainingPanelOpen(screenshot);
        screenshot.recycle();

        return isOpen;
    },

    /**
     * 验证训练界面是否打开
     */
    _verifyTrainingPanelOpen: function (screenshot) {
        // 通过检测训练界面的特征色来验证
        // 训练界面背景通常是深色
        var tabY = Coordinates.train.barracksTab.y;
        var pixel = images.pixel(screenshot, 360, tabY);

        // 简单验证
        if (pixel) {
            return true;  // 暂时假设打开成功
        }
        return true;  // 默认返回 true，后续根据实际情况调整
    },

    /**
     * 按配方训练兵种
     */
    _trainByRecipe: function (Utils) {
        var recipe = this._currentRecipe;

        console.log("[Trainer] 开始按配方训练...");

        // 切换到普通兵营标签
        Utils.tap(Coordinates.train.barracksTab.x, Coordinates.train.barracksTab.y);
        sleep(random(300, 500));

        // 训练普通兵种
        for (var i = 0; i < recipe.troops.length; i++) {
            var item = recipe.troops[i];
            var troop = item.troop;
            var count = item.count;

            // 跳过暗黑兵种 (稍后处理)
            if (this._isDarkTroop(troop)) {
                continue;
            }

            console.log("[Trainer] 训练 " + troop.name + " x" + count);
            this._trainTroop(Utils, troop, count);
        }

        // 切换到暗黑兵营标签 (如果有暗黑兵种)
        var hasDarkTroops = recipe.troops.some(function (item) {
            return this._isDarkTroop(item.troop);
        }.bind(this));

        if (hasDarkTroops) {
            Utils.tap(Coordinates.train.darkBarracksTab.x, Coordinates.train.darkBarracksTab.y);
            sleep(random(300, 500));

            for (var i = 0; i < recipe.troops.length; i++) {
                var item = recipe.troops[i];
                var troop = item.troop;
                var count = item.count;

                if (this._isDarkTroop(troop)) {
                    console.log("[Trainer] 训练 " + troop.name + " x" + count);
                    this._trainTroop(Utils, troop, count);
                }
            }
        }

        // 训练法术 (如果有)
        if (recipe.spells && recipe.spells.length > 0) {
            Utils.tap(Coordinates.train.spellFactoryTab.x, Coordinates.train.spellFactoryTab.y);
            sleep(random(300, 500));

            for (var i = 0; i < recipe.spells.length; i++) {
                var item = recipe.spells[i];
                var spell = item.spell;
                var count = item.count;

                console.log("[Trainer] 训练 " + spell.name + " x" + count);
                this._trainSpell(Utils, spell, count);
            }
        }

        return true;
    },

    /**
     * 检查是否为暗黑兵种
     */
    _isDarkTroop: function (troop) {
        var darkTroops = [
            TroopType.MINION, TroopType.HOG_RIDER, TroopType.VALKYRIE,
            TroopType.GOLEM, TroopType.WITCH, TroopType.LAVA_HOUND, TroopType.BOWLER
        ];

        for (var i = 0; i < darkTroops.length; i++) {
            if (darkTroops[i].id === troop.id) {
                return true;
            }
        }
        return false;
    },

    /**
     * 训练单个兵种
     */
    _trainTroop: function (Utils, troop, count) {
        // 计算兵种在训练界面的位置
        var grid = Coordinates.train.troopGrid;
        var slot = troop.slot;
        var row = Math.floor(slot / grid.cols);
        var col = slot % grid.cols;

        var x = grid.startX + col * grid.cellWidth + grid.cellWidth / 2;
        var y = grid.startY + row * grid.cellHeight + grid.cellHeight / 2;

        // 连续点击训练
        for (var i = 0; i < count; i++) {
            Utils.tapExact(x, y);

            // 每10个单位稍微等待一下
            if (i > 0 && i % 10 === 0) {
                sleep(random(50, 100));
            }
        }

        sleep(random(100, 200));
    },

    /**
     * 训练法术
     */
    _trainSpell: function (Utils, spell, count) {
        // 法术界面布局类似兵种
        var grid = Coordinates.train.troopGrid;
        var slot = spell.slot;
        var row = Math.floor(slot / grid.cols);
        var col = slot % grid.cols;

        var x = grid.startX + col * grid.cellWidth + grid.cellWidth / 2;
        var y = grid.startY + row * grid.cellHeight + grid.cellHeight / 2;

        for (var i = 0; i < count; i++) {
            Utils.tapExact(x, y);
            sleep(random(100, 150));
        }

        sleep(random(100, 200));
    },

    /**
     * 关闭训练界面
     */
    _closeTrainingPanel: function (Utils) {
        console.log("[Trainer] 关闭训练界面...");
        Utils.tap(Coordinates.train.closeBtn.x, Coordinates.train.closeBtn.y);
        sleep(random(500, 800));
    },

    /**
     * 使用快速训练
     * @param {object} Utils - 工具模块引用
     * @param {number} slot - 快速训练槽位 (0-2)
     */
    quickTrain: function (Utils, slot) {
        slot = slot || 0;

        console.log("[Trainer] 使用快速训练槽位: " + slot);

        // 打开训练界面
        if (!this._openTrainingPanel(Utils)) {
            return false;
        }

        // 点击快速训练按钮
        Utils.tap(Coordinates.train.quickTrainBtn.x, Coordinates.train.quickTrainBtn.y);
        sleep(random(500, 800));

        // 选择槽位 (根据slot计算位置)
        var slotX = 200 + slot * 250;
        var slotY = 600;
        Utils.tap(slotX, slotY);
        sleep(random(300, 500));

        // 点击训练按钮
        Utils.tap(360, 900);
        sleep(random(300, 500));

        // 关闭界面
        this._closeTrainingPanel(Utils);

        return true;
    },

    /**
     * 获取训练统计
     */
    getStats: function () {
        return {
            trainedCount: this._stats.trainedCount,
            currentRecipe: this._currentRecipe ? this._currentRecipe.name : "无",
            lastCheckTime: this._lastCheckTime,
            uptime: Math.floor((Date.now() - this._stats.sessionStart) / 1000) + "s"
        };
    }
};

module.exports = Trainer;
