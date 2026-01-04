/**
 * settings.js - 全局设置配置
 * 
 * 包含脚本运行参数、阈值、时间间隔等配置
 */

var Settings = {
    // ==========================================
    // 游戏配置
    // ==========================================
    game: {
        // 游戏包名
        package: "com.supercell.clashofclans",  // 国际服
        // package: "com.tencent.tmgp.supercell.clashofclans",  // 国服

        // 游戏启动等待时间 (毫秒)
        launchWaitTime: 15000,

        // 加载界面等待时间 (毫秒)
        loadingWaitTime: 10000
    },

    // ==========================================
    // 图像识别配置
    // ==========================================
    image: {
        // 默认相似度阈值 (0-1)
        defaultThreshold: 0.8,

        // 高精度识别阈值 (用于关键按钮)
        highThreshold: 0.9,

        // 低精度识别阈值 (用于模糊匹配)
        lowThreshold: 0.7,

        // 颜色识别容差
        colorTolerance: 20,

        // 截图缓存时间 (毫秒) - 在此时间内使用缓存截图
        screenshotCacheTime: 500,

        // 采集器满载颜色判定
        collector: {
            // 金币采集器满载颜色 (黄色)
            goldFullColor: "#FFD700",
            goldFullTolerance: 30,

            // 圣水采集器满载颜色 (紫色)
            elixirFullColor: "#9932CC",
            elixirFullTolerance: 30,

            // 黑油钻井满载颜色 (深紫色)
            darkElixirFullColor: "#1C1C1C",
            darkElixirFullTolerance: 20,

            // 满载百分比阈值 (用于死鱼判定)
            fullThreshold: 0.8  // 80%
        }
    },

    // ==========================================
    // 时间间隔配置 (毫秒)
    // ==========================================
    timing: {
        // 主循环间隔
        mainLoopInterval: {
            min: 4000,
            max: 6000
        },

        // 快速操作间隔 (点击后等待)
        quickDelay: {
            min: 100,
            max: 300
        },

        // 标准操作间隔 (界面切换后等待)
        standardDelay: {
            min: 500,
            max: 1000
        },

        // 长等待间隔 (加载等待)
        longDelay: {
            min: 2000,
            max: 3000
        },

        // 收菜循环间隔
        collectInterval: 300000,  // 5分钟

        // 搜索下一个间隔
        searchNextInterval: {
            min: 800,
            max: 1200
        },

        // 防掉线点击间隔
        antiAfkInterval: {
            min: 60000,   // 1分钟
            max: 120000   // 2分钟
        }
    },

    // ==========================================
    // 死鱼搜索配置
    // ==========================================
    deadBase: {
        // 是否启用死鱼搜索
        enabled: true,

        // 最小资源要求 (满足任一条件即可攻击)
        minGold: 200000,
        minElixir: 200000,
        minDarkElixir: 1000,

        // 最大搜索次数 (超过后休息)
        maxSearchCount: 50,

        // 搜索疲劳休息时间 (毫秒)
        searchRestTime: 60000,

        // 外置采集器判定
        outsideCollectorWeight: 0.3,  // 外置采集器权重

        // 奖杯范围 (可选，0表示不限制)
        minTrophies: 0,
        maxTrophies: 0
    },

    // ==========================================
    // 训练配置
    // ==========================================
    training: {
        // 是否启用自动训练
        enabled: true,

        // 默认训练配方 (见 recipes.js)
        defaultRecipe: "barch",

        // 训练检查间隔 (毫秒)
        checkInterval: 180000  // 3分钟
    },

    // ==========================================
    // 捐赠配置
    // ==========================================
    donation: {
        // 是否启用自动捐赠
        enabled: false,

        // 捐赠检查间隔 (毫秒)
        checkInterval: 60000,  // 1分钟

        // 可捐赠兵种 (优先级从高到低)
        donationPriority: ["archer", "barbarian", "giant"]
    },

    // ==========================================
    // 安全配置
    // ==========================================
    safety: {
        // 随机点击偏移范围 (像素)
        clickRandomOffset: 10,

        // 最大连续操作次数 (超过后强制休息)
        maxContinuousActions: 100,

        // 强制休息时间 (毫秒)
        forceRestTime: 30000,

        // 异常检测 - 连续失败次数阈值
        maxFailureCount: 5,

        // 异常恢复等待时间 (毫秒)
        recoveryWaitTime: 10000
    },

    // ==========================================
    // 日志配置
    // ==========================================
    logging: {
        // 是否显示控制台
        showConsole: true,

        // 日志级别: "debug", "info", "warn", "error"
        level: "info",

        // 是否保存日志到文件
        saveToFile: false,

        // 日志文件路径
        logFilePath: "/sdcard/CoC-AutoX/logs/"
    }
};

module.exports = Settings;
