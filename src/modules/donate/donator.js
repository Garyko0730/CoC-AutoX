/**
 * donator.js - 捐赠系统核心模块
 * 
 * 自动检测并响应部落成员的捐赠请求
 */

// 导入依赖
var Coordinates = require("../../config/coordinates.js");
var Settings = require("../../config/settings.js");

/**
 * 捐赠器
 */
var Donator = {
    // 上次检查时间
    _lastCheckTime: 0,

    // 捐赠统计
    _stats: {
        donatedCount: 0,
        requestsFound: 0,
        sessionStart: 0
    },

    /**
     * 初始化捐赠器
     */
    init: function () {
        console.log("[Donator] 初始化捐赠系统...");

        this._lastCheckTime = 0;
        this._stats = {
            donatedCount: 0,
            requestsFound: 0,
            sessionStart: Date.now()
        };

        console.log("[Donator] 初始化完成");
        console.log("[Donator] 捐赠优先级: " + Settings.donation.donationPriority.join(" > "));

        return this;
    },

    /**
     * 检查是否需要处理捐赠
     */
    needsDonationCheck: function () {
        if (!Settings.donation.enabled) {
            return false;
        }

        var now = Date.now();
        return (now - this._lastCheckTime) >= Settings.donation.checkInterval;
    },

    /**
     * 执行捐赠检查流程
     * @param {object} Utils - 工具模块引用
     * @returns {boolean} 是否成功捐赠
     */
    checkAndDonate: function (Utils) {
        console.log("[Donator] 开始检查捐赠请求...");

        // 1. 打开聊天界面
        if (!this._openClanChat(Utils)) {
            console.warn("[Donator] 无法打开部落聊天");
            return false;
        }

        // 2. 搜索捐赠请求
        var requests = this._findDonationRequests(Utils);

        // 3. 处理找到的请求
        var donated = false;
        if (requests.length > 0) {
            console.log("[Donator] 找到 " + requests.length + " 个捐赠请求");
            this._stats.requestsFound += requests.length;

            for (var i = 0; i < requests.length; i++) {
                if (this._handleDonationRequest(Utils, requests[i])) {
                    donated = true;
                    this._stats.donatedCount++;
                }
            }
        } else {
            console.log("[Donator] 没有找到捐赠请求");
        }

        // 4. 关闭聊天界面
        this._closeClanChat(Utils);

        // 5. 更新时间
        this._lastCheckTime = Date.now();

        return donated;
    },

    /**
     * 打开部落聊天
     */
    _openClanChat: function (Utils) {
        console.log("[Donator] 打开部落聊天...");

        Utils.tap(Coordinates.clan.chatBtn.x, Coordinates.clan.chatBtn.y);
        sleep(random(1000, 1500));

        // 简单验证
        return true;
    },

    /**
     * 关闭部落聊天
     */
    _closeClanChat: function (Utils) {
        console.log("[Donator] 关闭部落聊天...");

        Utils.tap(Coordinates.clan.closeChatBtn.x, Coordinates.clan.closeChatBtn.y);
        sleep(random(500, 800));
    },

    /**
     * 搜索捐赠请求
     * @returns {Array} 找到的请求位置数组
     */
    _findDonationRequests: function (Utils) {
        var requests = [];
        var screenshot = captureScreen();

        if (!screenshot) {
            return requests;
        }

        // 捐赠按钮通常是绿色的 "捐赠" 或 "Donate" 按钮
        // 在聊天区域搜索
        var donateColor = "#4CAF50";  // 绿色捐赠按钮
        var searchRegion = [400, 300, 300, 800];  // 聊天区域右侧

        try {
            var point = images.findColor(screenshot, donateColor, {
                threshold: 25,
                region: searchRegion
            });

            while (point && requests.length < 5) {
                requests.push({ x: point.x, y: point.y });

                // 继续向下搜索
                searchRegion[1] = point.y + 50;
                searchRegion[3] = searchRegion[3] - 50;

                if (searchRegion[3] <= 0) break;

                point = images.findColor(screenshot, donateColor, {
                    threshold: 25,
                    region: searchRegion
                });
            }
        } catch (e) {
            console.warn("[Donator] 搜索捐赠请求出错: " + e);
        }

        screenshot.recycle();
        return requests;
    },

    /**
     * 处理单个捐赠请求
     */
    _handleDonationRequest: function (Utils, request) {
        console.log("[Donator] 处理捐赠请求 @ (" + request.x + ", " + request.y + ")");

        // 点击捐赠按钮
        Utils.tap(request.x, request.y);
        sleep(random(500, 800));

        // 捐赠界面会弹出，按优先级选择兵种
        var donated = this._selectAndDonate(Utils);

        // 关闭捐赠弹窗 (点击空白区域)
        Utils.tap(100, 1000);
        sleep(random(300, 500));

        return donated;
    },

    /**
     * 选择并执行捐赠
     */
    _selectAndDonate: function (Utils) {
        var donationPriority = Settings.donation.donationPriority;

        // 优先级列表中的兵种
        var troopSlots = {
            "barbarian": 0,
            "archer": 1,
            "giant": 2,
            "goblin": 3,
            "wall_breaker": 4,
            "balloon": 5,
            "wizard": 6
        };

        // 尝试按优先级捐赠
        for (var i = 0; i < donationPriority.length; i++) {
            var troopName = donationPriority[i].toLowerCase();
            var slot = troopSlots[troopName];

            if (slot !== undefined) {
                // 计算兵种在捐赠界面的位置
                var x = 150 + slot * 80;
                var y = 600;  // 捐赠弹窗中兵种栏的大致Y坐标

                // 多次点击尝试捐赠
                for (var j = 0; j < 5; j++) {
                    Utils.tapExact(x, y);
                    sleep(random(50, 100));
                }

                console.log("[Donator] 已捐赠: " + troopName);
                return true;
            }
        }

        return false;
    },

    /**
     * 滚动聊天寻找更多请求
     */
    scrollChatUp: function (Utils) {
        var startX = Coordinates.clan.chatScrollArea.x;
        var startY = Coordinates.clan.chatScrollArea.y;
        var endX = startX;
        var endY = startY - 300;

        Utils.swipe(startX, startY, endX, endY, 300);
        sleep(random(500, 800));
    },

    /**
     * 获取捐赠统计
     */
    getStats: function () {
        return {
            donatedCount: this._stats.donatedCount,
            requestsFound: this._stats.requestsFound,
            lastCheckTime: this._lastCheckTime,
            enabled: Settings.donation.enabled,
            uptime: Math.floor((Date.now() - this._stats.sessionStart) / 1000) + "s"
        };
    }
};

module.exports = Donator;
