/**
 * constants.js - 状态常量定义
 * 
 * 定义游戏所有可能的界面状态
 */

var GameState = {
    // ==========================================
    // 界面状态枚举
    // ==========================================

    // 未知状态
    UNKNOWN: "UNKNOWN",

    // 加载中
    LOADING: "LOADING",

    // 主村庄界面
    HOME_VILLAGE: "HOME_VILLAGE",

    // 建筑大师基地 (夜世界)
    BUILDER_BASE: "BUILDER_BASE",

    // 部落首都
    CLAN_CAPITAL: "CLAN_CAPITAL",

    // 搜索对手界面
    SEARCHING: "SEARCHING",

    // 查看敌方基地 (准备攻击)
    ENEMY_BASE: "ENEMY_BASE",

    // 战斗进行中
    IN_BATTLE: "IN_BATTLE",

    // 战斗结算界面
    BATTLE_END: "BATTLE_END",

    // 训练界面
    TRAINING: "TRAINING",

    // 部落聊天界面
    CLAN_CHAT: "CLAN_CHAT",

    // 商店界面
    SHOP: "SHOP",

    // 设置界面
    SETTINGS: "SETTINGS",

    // 弹窗/对话框 (需要关闭)
    POPUP: "POPUP",

    // 断线重连
    DISCONNECTED: "DISCONNECTED",

    // 维护中
    MAINTENANCE: "MAINTENANCE"
};

/**
 * 状态优先级 (用于状态机)
 * 数值越小优先级越高
 */
var StatePriority = {
    DISCONNECTED: 1,
    MAINTENANCE: 2,
    POPUP: 3,
    LOADING: 4,
    BATTLE_END: 5,
    IN_BATTLE: 6,
    ENEMY_BASE: 7,
    SEARCHING: 8,
    TRAINING: 9,
    CLAN_CHAT: 10,
    SHOP: 11,
    SETTINGS: 12,
    HOME_VILLAGE: 13,
    BUILDER_BASE: 14,
    CLAN_CAPITAL: 15,
    UNKNOWN: 99
};

/**
 * 状态描述 (用于日志)
 */
var StateDescription = {
    UNKNOWN: "未知界面",
    LOADING: "加载中",
    HOME_VILLAGE: "村庄主界面",
    BUILDER_BASE: "建筑大师基地",
    CLAN_CAPITAL: "部落首都",
    SEARCHING: "搜索对手中",
    ENEMY_BASE: "查看敌方基地",
    IN_BATTLE: "战斗进行中",
    BATTLE_END: "战斗结算",
    TRAINING: "训练界面",
    CLAN_CHAT: "部落聊天",
    SHOP: "商店",
    SETTINGS: "设置",
    POPUP: "弹窗",
    DISCONNECTED: "断线重连",
    MAINTENANCE: "维护中"
};

/**
 * 导出模块
 */
module.exports = {
    GameState: GameState,
    StatePriority: StatePriority,
    StateDescription: StateDescription
};
