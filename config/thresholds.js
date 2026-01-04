/**
 * thresholds.js - 图像识别阈值配置
 * 
 * 针对不同图像和场景的识别阈值精细调整
 */

var Thresholds = {
    // ==========================================
    // 界面识别阈值
    // ==========================================
    screens: {
        // 主界面识别
        home: {
            attackBtn: 0.85,      // 进攻按钮
            trophy: 0.80,         // 奖杯图标
            shopBtn: 0.80         // 商店按钮
        },

        // 搜索界面识别
        search: {
            nextBtn: 0.85,        // 下一个按钮
            attackBtn: 0.85,      // 确认进攻按钮
            enemyBase: 0.70       // 敌方基地
        },

        // 战斗界面识别
        battle: {
            surrenderBtn: 0.80,   // 投降按钮
            troops: 0.75          // 部队图标
        },

        // 战斗结算识别
        battleEnd: {
            returnBtn: 0.85,      // 返回按钮
            stars: 0.90           // 星星
        },

        // 加载界面识别
        loading: {
            loadingBar: 0.70      // 加载条
        }
    },

    // ==========================================
    // 建筑识别阈值
    // ==========================================
    buildings: {
        // 采集器识别
        collectors: {
            goldCollector: 0.75,
            elixirCollector: 0.75,
            darkElixirDrill: 0.75
        },

        // 存储器识别
        storages: {
            goldStorage: 0.75,
            elixirStorage: 0.75,
            darkElixirStorage: 0.75
        },

        // 防御建筑识别
        defenses: {
            cannon: 0.70,
            archerTower: 0.70,
            mortar: 0.70,
            airDefense: 0.70,
            wizardTower: 0.70,
            xbow: 0.75,
            inferno: 0.75,
            eagleArtillery: 0.80
        }
    },

    // ==========================================
    // 资源采集识别阈值
    // ==========================================
    collection: {
        // 可收集图标识别
        collectIcon: 0.80,

        // 满载状态识别 (通过颜色)
        fullStatus: {
            gold: 0.75,
            elixir: 0.75,
            darkElixir: 0.75
        }
    },

    // ==========================================
    // 部队识别阈值
    // ==========================================
    troops: {
        barbarian: 0.80,
        archer: 0.80,
        giant: 0.80,
        goblin: 0.80,
        wallBreaker: 0.80,
        balloon: 0.80,
        wizard: 0.80,
        healer: 0.80,
        dragon: 0.80,
        pekka: 0.80,

        // 暗黑兵种
        minion: 0.80,
        hogRider: 0.80,
        valkyrie: 0.80,
        golem: 0.80,
        witch: 0.80,
        lavaHound: 0.80,
        bowler: 0.80
    },

    // ==========================================
    // 按钮识别阈值
    // ==========================================
    buttons: {
        // 通用按钮
        confirm: 0.85,
        cancel: 0.85,
        close: 0.85,

        // 特殊按钮
        donate: 0.80,
        train: 0.80,
        upgrade: 0.80,

        // 战斗按钮
        attack: 0.85,
        next: 0.85,
        surrender: 0.80,
        returnHome: 0.85
    },

    // ==========================================
    // 颜色识别配置
    // ==========================================
    colors: {
        // 颜色容差 (0-255)
        defaultTolerance: 20,

        // 特定颜色容差
        gold: {
            color: "#FFD700",
            tolerance: 30
        },
        elixir: {
            color: "#FF69B4",  // 粉色/紫色
            tolerance: 30
        },
        darkElixir: {
            color: "#2F2F2F",  // 深色
            tolerance: 20
        },

        // 状态颜色
        ready: {
            color: "#00FF00",  // 绿色 - 可用
            tolerance: 25
        },
        busy: {
            color: "#FF0000",  // 红色 - 不可用
            tolerance: 25
        }
    },

    // ==========================================
    // OCR 识别配置 (如果使用)
    // ==========================================
    ocr: {
        // 数字识别置信度
        numberConfidence: 0.70,

        // 文字识别置信度
        textConfidence: 0.60,

        // 资源数量区域
        resourceRegion: {
            width: 100,
            height: 30
        }
    }
};

module.exports = Thresholds;
