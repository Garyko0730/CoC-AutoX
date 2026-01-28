// 默认配置项
module.exports = {
  // 金币阈值
  minGold: 1000,
  // 圣水阈值
  minElixir: 1000,
  // 黑油阈值（暂未接入 OCR）
  minDarkElixir: 0,
  // 游戏包名（若为空则自动匹配）
  gamePackageName: "",
  // 游戏名称（用于通过名称反查包名）
  gameAppName: "部落冲突",
  // 常见包名候选（按需补充）
  gamePackageCandidates: [
    "com.supercell.clashofclans",
    "com.tencent.tmgp.supercell.clashofclans"
  ],
  // 造兵模式：CUSTOM 或 QUICK
  trainMode: "CUSTOM",
  // 兵种住房占用（用于根据缺口估算点击次数）
  trainTroopHousing: 1,
  // 默认点击次数（若无法获取缺口则用该值）
  trainTroopCount: 20,
  // 自定义造兵点击目标（按需调整坐标）
  trainTroopPoint: { x: 0.30, y: 0.27 },
  // “添加”按钮坐标（按需调整）
  trainAddButtonPoint: { x: 0.86, y: 0.72 },
  // 关闭训练界面坐标（按需调整）
  trainCloseButtonPoint: { x: 0.95, y: 0.08 },
  // 主页配兵按钮坐标（你标注的按钮）
  homeArmyButtonPoint: { x: 0.08, y: 0.73 },
  // 出兵策略
  troopStrategy: "FOUR_SIDES",
  // 捐兵关键词
  donateKeywords: ["弓箭手", "气球", "法师"],
  // 延时配置 (ms)
  delays: {
    stateLoop: 300,          // 主循环间隔
    shortWait: 500,          // 短等待
    mediumWait: 800,         // 中等待
    longWait: 1200,          // 长等待
    trainTap: 120,           // 训练点击间隔
    wardenSkillDelay: 10000, // 大守护技能延时
    searchWait: 1000,        // 搜索间隔
    battleCheck: 1200,       // 战斗状态检查间隔
    popupWait: 600           // 弹窗处理间隔
  },
  // 功能开关
  features: {
    collectResource: true,   // 采集+收集宝库
    removeGrass: true,       // 除草
    removeShield: false,     // 移除护盾
    donate: false,           // 捐兵
    autoFish: true,          // 打鱼
    showStats: false         // 显示统计
  },
  // 打鱼设置
  fishing: {
    enabled: true,           // 是否启用打鱼
    loopCount: 2,            // 每次循环打几次
    cloudTimeout: 80         // 飘云超时（分钟）
  },
  // 账号设置
  account: {
    rememberLast: true,      // 记忆上次停止的账号
    currentIndex: 1          // 当前账号索引
  }
};
