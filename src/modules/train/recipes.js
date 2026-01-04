/**
 * recipes.js - 训练配方定义
 * 
 * 定义常用的兵种组合配方
 */

/**
 * 兵种枚举 (内部ID)
 * 按照游戏内训练界面的顺序
 */
var TroopType = {
    // 普通兵营 (按界面顺序)
    BARBARIAN: { id: "barbarian", name: "野蛮人", space: 1, time: 5, slot: 0 },
    ARCHER: { id: "archer", name: "弓箭手", space: 1, time: 6, slot: 1 },
    GIANT: { id: "giant", name: "巨人", space: 5, time: 30, slot: 2 },
    GOBLIN: { id: "goblin", name: "哥布林", space: 1, time: 7, slot: 3 },
    WALL_BREAKER: { id: "wall_breaker", name: "炸弹人", space: 2, time: 15, slot: 4 },
    BALLOON: { id: "balloon", name: "气球兵", space: 5, time: 30, slot: 5 },
    WIZARD: { id: "wizard", name: "法师", space: 4, time: 30, slot: 6 },
    HEALER: { id: "healer", name: "天使", space: 14, time: 120, slot: 7 },
    DRAGON: { id: "dragon", name: "飞龙", space: 20, time: 180, slot: 8 },
    PEKKA: { id: "pekka", name: "皮卡", space: 25, time: 180, slot: 9 },

    // 暗黑兵营
    MINION: { id: "minion", name: "亡灵", space: 2, time: 18, slot: 0 },
    HOG_RIDER: { id: "hog_rider", name: "野猪骑士", space: 5, time: 45, slot: 1 },
    VALKYRIE: { id: "valkyrie", name: "瓦基丽武神", space: 8, time: 90, slot: 2 },
    GOLEM: { id: "golem", name: "石头人", space: 30, time: 300, slot: 3 },
    WITCH: { id: "witch", name: "女巫", space: 12, time: 120, slot: 4 },
    LAVA_HOUND: { id: "lava_hound", name: "熔岩猎犬", space: 30, time: 300, slot: 5 },
    BOWLER: { id: "bowler", name: "巨石投手", space: 6, time: 60, slot: 6 }
};

/**
 * 法术枚举
 */
var SpellType = {
    LIGHTNING: { id: "lightning", name: "雷电法术", space: 2, slot: 0 },
    HEAL: { id: "heal", name: "治疗法术", space: 2, slot: 1 },
    RAGE: { id: "rage", name: "狂暴法术", space: 2, slot: 2 },
    JUMP: { id: "jump", name: "弹跳法术", space: 2, slot: 3 },
    FREEZE: { id: "freeze", name: "冰冻法术", space: 1, slot: 4 },
    POISON: { id: "poison", name: "毒药法术", space: 1, slot: 0 },
    EARTHQUAKE: { id: "earthquake", name: "地震法术", space: 1, slot: 1 },
    HASTE: { id: "haste", name: "急速法术", space: 1, slot: 2 },
    SKELETON: { id: "skeleton", name: "骷髅法术", space: 1, slot: 3 }
};

/**
 * 预设配方库
 */
var Recipes = {
    /**
     * Barch 配方 (野蛮人 + 弓箭手)
     * 适合: 快速农资源，死鱼搜索
     * 兵营容量: 200 (10本常见)
     */
    barch: {
        name: "Barch 配方",
        description: "野蛮人 + 弓箭手，适合快速农资源",
        troops: [
            { troop: TroopType.BARBARIAN, count: 100 },
            { troop: TroopType.ARCHER, count: 100 }
        ],
        spells: [],
        priority: 1  // 配方优先级
    },

    /**
     * GiBarch 配方 (巨人 + 野蛮人 + 弓箭手)
     * 适合: 中等难度农资源
     */
    gibarch: {
        name: "GiBarch 配方",
        description: "巨人 + 野蛮人 + 弓箭手，更稳定的农资源",
        troops: [
            { troop: TroopType.GIANT, count: 10 },       // 50 空间
            { troop: TroopType.BARBARIAN, count: 60 },   // 60 空间
            { troop: TroopType.ARCHER, count: 70 },      // 70 空间
            { troop: TroopType.WALL_BREAKER, count: 10 } // 20 空间
        ],
        spells: [
            { spell: SpellType.HEAL, count: 2 }
        ],
        priority: 2
    },

    /**
     * 纯野蛮人配方
     * 适合: 死鱼外置采集器
     */
    all_barb: {
        name: "纯野蛮人",
        description: "200野蛮人，抢外置采集器专用",
        troops: [
            { troop: TroopType.BARBARIAN, count: 200 }
        ],
        spells: [],
        priority: 3
    },

    /**
     * 纯弓箭手配方
     */
    all_archer: {
        name: "纯弓箭手",
        description: "200弓箭手",
        troops: [
            { troop: TroopType.ARCHER, count: 200 }
        ],
        spells: [],
        priority: 4
    },

    /**
     * GoWiPe 配方 (石头人 + 法师 + 皮卡)
     * 适合: 打正常基地
     */
    gowipe: {
        name: "GoWiPe 配方",
        description: "石头人 + 法师 + 皮卡",
        troops: [
            { troop: TroopType.GOLEM, count: 2 },        // 60 空间
            { troop: TroopType.WIZARD, count: 15 },      // 60 空间
            { troop: TroopType.PEKKA, count: 2 },        // 50 空间
            { troop: TroopType.WALL_BREAKER, count: 8 }, // 16 空间
            { troop: TroopType.ARCHER, count: 14 }       // 14 空间
        ],
        spells: [
            { spell: SpellType.RAGE, count: 2 },
            { spell: SpellType.HEAL, count: 1 },
            { spell: SpellType.POISON, count: 1 }
        ],
        priority: 5
    }
};

/**
 * 获取配方
 * @param {string} recipeName - 配方名称
 * @returns {object|null} 配方对象
 */
function getRecipe(recipeName) {
    return Recipes[recipeName] || null;
}

/**
 * 获取所有配方名称
 * @returns {Array} 配方名称数组
 */
function getAllRecipeNames() {
    return Object.keys(Recipes);
}

/**
 * 计算配方所需空间
 * @param {object} recipe - 配方对象
 * @returns {number} 总兵营空间
 */
function calculateRecipeSpace(recipe) {
    var totalSpace = 0;

    for (var i = 0; i < recipe.troops.length; i++) {
        var item = recipe.troops[i];
        totalSpace += item.troop.space * item.count;
    }

    return totalSpace;
}

/**
 * 计算配方训练时间
 * @param {object} recipe - 配方对象
 * @returns {number} 总训练时间 (秒)
 */
function calculateTrainingTime(recipe) {
    var totalTime = 0;

    for (var i = 0; i < recipe.troops.length; i++) {
        var item = recipe.troops[i];
        totalTime += item.troop.time * item.count;
    }

    return totalTime;
}

/**
 * 导出模块
 */
module.exports = {
    TroopType: TroopType,
    SpellType: SpellType,
    Recipes: Recipes,
    getRecipe: getRecipe,
    getAllRecipeNames: getAllRecipeNames,
    calculateRecipeSpace: calculateRecipeSpace,
    calculateTrainingTime: calculateTrainingTime
};
