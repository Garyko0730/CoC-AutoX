// 进攻与操作逻辑
const config = require("./config");
const POINTS = {
  trainBtn: { x: 0.86, y: 0.88 },
  quickTrainTab: { x: 0.20, y: 0.18 },
  quickTrainSlot1: { x: 0.20, y: 0.34 },
  attackBtn: { x: 0.11, y: 0.86 },
  searchBtn: { x: 0.82, y: 0.86 },
  nextBtn: { x: 0.88, y: 0.84 },
  endBattleBtn: { x: 0.10, y: 0.80 },
  endBattleConfirm: { x: 0.50, y: 0.60 },
  returnHomeBtn: { x: 0.86, y: 0.84 },
  // 采集相关
  collectorsBtn: { x: 0.08, y: 0.58 },      // 采集器按钮（近似）
  treasuryBtn: { x: 0.50, y: 0.50 },        // 宝库按钮
  treasuryCollect: { x: 0.50, y: 0.65 },    // 宝库收集确认
  // 除草相关
  shopBtn: { x: 0.92, y: 0.50 },            // 商店按钮
  obstacleArea: { x: 0.50, y: 0.40 },       // 障碍物区域（中心）
  removeBtn: { x: 0.50, y: 0.70 },          // 移除按钮
  // 捐兵相关
  clanCastleBtn: { x: 0.50, y: 0.50 },      // 部落城堡
  donateBtn: { x: 0.70, y: 0.50 },          // 捐兵按钮
  donateConfirm: { x: 0.50, y: 0.60 },      // 捐兵确认
  // 护盾相关
  shieldIcon: { x: 0.08, y: 0.12 },         // 护盾图标
  removeShieldBtn: { x: 0.50, y: 0.70 },    // 移除护盾按钮
  confirmBtn: { x: 0.60, y: 0.60 }          // 通用确认按钮
};

function trainArmy(missingCapacity) {
  if (config.trainMode === "CUSTOM") {
    trainArmyCustom(missingCapacity);
    return;
  }
  trainArmyQuick();
}

function trainArmyQuick() {
  openArmyMenu();
  tapRatio(POINTS.trainBtn);
  sleep(600);
  tapRatio(POINTS.quickTrainTab);
  sleep(500);
  tapRatio(POINTS.quickTrainSlot1);
  sleep(400);
}

function trainArmyCustom(missingCapacity) {
  openArmyMenu();
  tapRatio(POINTS.trainBtn);
  sleep(600);
  if (config.trainAddButtonPoint) {
    tapRatio(config.trainAddButtonPoint);
    sleep(400);
  }
  const housing = config.trainTroopHousing || 1;
  const defaultCount = config.trainTroopCount || 0;
  const missing = typeof missingCapacity === "number" ? missingCapacity : 0;
  const tapCount = missing > 0 ? Math.ceil(missing / housing) : defaultCount;
  const target = config.trainTroopPoint;
  if (!target || tapCount <= 0) {
    return;
  }
  for (let i = 0; i < tapCount; i += 1) {
    tapRatio(target);
    sleep(120);
  }
  if (config.trainCloseButtonPoint) {
    sleep(300);
    tapRatio(config.trainCloseButtonPoint);
  }
}

function openArmyMenu() {
  if (config.homeArmyButtonPoint) {
    tapRatio(config.homeArmyButtonPoint);
    sleep(500);
  }
}

function startSearch() {
  tapRatio(POINTS.attackBtn);
  sleep(800);
  tapRatio(POINTS.searchBtn);
  sleep(800);
}

function nextSearch() {
  tapRatio(POINTS.nextBtn);
  sleep(600);
}

function deployTroops(strategy) {
  const slots = getTroopSlots(8);
  for (let i = 0; i < slots.length; i += 1) {
    tapRatio(slots[i]);
    sleep(120);
    deployByStrategy(strategy);
  }
}

function deployHeroes() {
  const heroes = getHeroSlots();
  for (let i = 0; i < heroes.length; i += 1) {
    tapRatio(heroes[i]);
    sleep(120);
    deployByStrategy("FOUR_SIDES");
  }
}

function deploySpells() {
  const spells = getSpellSlots();
  for (let i = 0; i < spells.length; i += 1) {
    tapRatio(spells[i]);
    sleep(120);
    tapRatio({ x: 0.50, y: 0.50 });
  }
}

let _wardenThread = null;

function scheduleWardenSkill() {
  cancelWardenSkill();
  _wardenThread = threads.start(function () {
    sleep(config.delays ? config.delays.wardenSkillDelay : 10000);
    tapRatio({ x: 0.70, y: 0.92 });
    _wardenThread = null;
  });
}

function cancelWardenSkill() {
  if (_wardenThread && typeof _wardenThread.interrupt === "function") {
    _wardenThread.interrupt();
  }
  _wardenThread = null;
}

function endBattle() {
  tapRatio(POINTS.endBattleBtn);
  sleep(400);
  tapRatio(POINTS.endBattleConfirm);
  sleep(800);
}

function returnHome() {
  tapRatio(POINTS.returnHomeBtn);
  sleep(600);
}

function handlePostBattlePopups() {
  tapRatio({ x: 0.50, y: 0.60 });
  sleep(600);
}

function deployByStrategy(strategy) {
  if (strategy === "FOUR_SIDES") {
    multiPointSwipe([
      edgeSwipe(0.20, 0.20, 0.20, 0.30),
      edgeSwipe(0.80, 0.20, 0.80, 0.30),
      edgeSwipe(0.20, 0.80, 0.20, 0.70)
    ], 250);
    multiPointSwipe([
      edgeSwipe(0.80, 0.80, 0.80, 0.70)
    ], 250);
    return;
  }
  if (strategy === "SINGLE_POINT") {
    multiPointSwipe([
      edgeSwipe(0.50, 0.85, 0.50, 0.75)
    ], 250);
    return;
  }
  multiPointSwipe([
    edgeSwipe(0.50, 0.20, 0.50, 0.30),
    edgeSwipe(0.50, 0.80, 0.50, 0.70)
  ], 250);
}

function edgeSwipe(x1, y1, x2, y2) {
  return { x1: x1, y1: y1, x2: x2, y2: y2 };
}

function getTroopSlots(count) {
  const slots = [];
  const start = 0.08;
  const end = 0.92;
  const step = (end - start) / Math.max(1, count - 1);
  for (let i = 0; i < count; i += 1) {
    slots.push({ x: start + i * step, y: 0.92 });
  }
  return slots;
}

function getHeroSlots() {
  return [
    { x: 0.60, y: 0.92 },
    { x: 0.68, y: 0.92 },
    { x: 0.76, y: 0.92 }
  ];
}

function getSpellSlots() {
  return [
    { x: 0.84, y: 0.92 },
    { x: 0.90, y: 0.92 }
  ];
}

function tapRatio(point) {
  const x = randOffset(Math.round((device.width || 720) * point.x));
  const y = randOffset(Math.round((device.height || 1280) * point.y));
  shell("input tap " + x + " " + y, true);
}

function multiPointSwipe(touches, duration) {
  if (typeof gestures === "function") {
    const args = touches.map(touch => {
      return [duration, [px(touch.x1), py(touch.y1)], [px(touch.x2), py(touch.y2)]];
    });
    gestures.apply(null, args);
    return;
  }
  for (let i = 0; i < touches.length; i += 1) {
    const t = touches[i];
    bezierSwipe(
      { x: px(t.x1), y: py(t.y1) },
      { x: px(t.x2), y: py(t.y2) },
      duration
    );
    sleep(30);
  }
}

function bezierSwipe(p0, p3, duration) {
  const control = getBezierControl(p0, p3);
  const points = buildBezierPoints(p0, control.p1, control.p2, p3, 6);
  const stepDuration = Math.max(30, Math.floor(duration / points.length));
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    shell("input swipe " + a.x + " " + a.y + " " + b.x + " " + b.y + " " + stepDuration, true);
    sleep(10);
  }
}

function getBezierControl(p0, p3) {
  const dx = p3.x - p0.x;
  const dy = p3.y - p0.y;
  const p1 = { x: p0.x + dx * 0.3 + randomRange(-20, 20), y: p0.y + dy * 0.3 + randomRange(-20, 20) };
  const p2 = { x: p0.x + dx * 0.7 + randomRange(-20, 20), y: p0.y + dy * 0.7 + randomRange(-20, 20) };
  return { p1: p1, p2: p2 };
}

function buildBezierPoints(p0, p1, p2, p3, steps) {
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = cubicBezier(p0.x, p1.x, p2.x, p3.x, t);
    const y = cubicBezier(p0.y, p1.y, p2.y, p3.y, t);
    points.push({ x: Math.round(x), y: Math.round(y) });
  }
  return points;
}

function cubicBezier(a, b, c, d, t) {
  const mt = 1 - t;
  return mt * mt * mt * a + 3 * mt * mt * t * b + 3 * mt * t * t * c + t * t * t * d;
}

function randOffset(val) {
  return val + randomRange(-5, 5);
}

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function px(v) {
  return randOffset(Math.round((device.width || 720) * v));
}

function py(v) {
  return randOffset(Math.round((device.height || 1280) * v));
}

// ==================== 采集功能 ====================

// 采集资源（点击采集器收集资源）
function collectResources() {
  // 在主页滑动查找并点击采集器
  // 采集器通常分布在基地周围
  var collectPoints = [
    { x: 0.20, y: 0.30 },
    { x: 0.80, y: 0.30 },
    { x: 0.20, y: 0.70 },
    { x: 0.80, y: 0.70 },
    { x: 0.50, y: 0.25 },
    { x: 0.50, y: 0.75 }
  ];

  for (var i = 0; i < collectPoints.length; i++) {
    tapRatio(collectPoints[i]);
    sleep(200);
  }

  // 点击空白处取消选中
  tapRatio({ x: 0.50, y: 0.50 });
  sleep(300);
}

// 收集宝库（部落城堡财政）
function collectTreasury() {
  // 点击大本营区域
  tapRatio({ x: 0.50, y: 0.45 });
  sleep(600);

  // 点击宝库/财政按钮
  tapRatio(POINTS.treasuryCollect);
  sleep(400);

  // 确认收集
  tapRatio(POINTS.confirmBtn);
  sleep(400);

  // 点击空白处关闭
  tapRatio({ x: 0.10, y: 0.10 });
  sleep(300);
}

// ==================== 除草功能 ====================

// 除草（移除障碍物）
function removeObstacles() {
  // 在地图上查找障碍物并移除
  var obstacleAreas = [
    { x: 0.15, y: 0.25 },
    { x: 0.85, y: 0.25 },
    { x: 0.15, y: 0.75 },
    { x: 0.85, y: 0.75 },
    { x: 0.10, y: 0.50 },
    { x: 0.90, y: 0.50 }
  ];

  for (var i = 0; i < obstacleAreas.length; i++) {
    // 点击可能有障碍物的区域
    tapRatio(obstacleAreas[i]);
    sleep(400);

    // 尝试点击移除按钮
    tapRatio(POINTS.removeBtn);
    sleep(300);
  }

  // 点击空白处取消选中
  tapRatio({ x: 0.50, y: 0.50 });
  sleep(300);
}

// ==================== 捐兵功能 ====================

// 捐兵
function donateTroops() {
  // 打开部落聊天
  tapRatio({ x: 0.08, y: 0.92 }); // 聊天按钮
  sleep(800);

  // 查找捐兵请求并点击捐兵
  var donatePositions = [
    { x: 0.85, y: 0.30 },
    { x: 0.85, y: 0.50 },
    { x: 0.85, y: 0.70 }
  ];

  for (var i = 0; i < donatePositions.length; i++) {
    tapRatio(donatePositions[i]);
    sleep(400);

    // 点击捐兵槽位（捐第一个兵种）
    tapRatio({ x: 0.30, y: 0.50 });
    sleep(200);
    tapRatio({ x: 0.30, y: 0.50 });
    sleep(200);
  }

  // 关闭聊天
  tapRatio({ x: 0.95, y: 0.05 });
  sleep(400);
}

// ==================== 护盾功能 ====================

// 移除护盾
function removeShield() {
  // 点击护盾图标
  tapRatio(POINTS.shieldIcon);
  sleep(600);

  // 点击移除护盾
  tapRatio(POINTS.removeShieldBtn);
  sleep(400);

  // 确认移除
  tapRatio(POINTS.confirmBtn);
  sleep(400);

  // 点击空白处关闭
  tapRatio({ x: 0.10, y: 0.10 });
  sleep(300);
}

// ==================== 主页操作 ====================

// 执行主页日常任务
function performHomeTasks(features) {
  if (!features) {
    features = config.features || {};
  }

  // 采集资源
  if (features.collectResource) {
    collectResources();
    sleep(500);
  }

  // 收集宝库
  if (features.collectResource) {
    collectTreasury();
    sleep(500);
  }

  // 除草
  if (features.removeGrass) {
    removeObstacles();
    sleep(500);
  }

  // 移除护盾
  if (features.removeShield) {
    removeShield();
    sleep(500);
  }

  // 捐兵
  if (features.donate) {
    donateTroops();
    sleep(500);
  }
}

module.exports = {
  trainArmy,
  startSearch,
  nextSearch,
  deployTroops,
  deployHeroes,
  deploySpells,
  scheduleWardenSkill,
  cancelWardenSkill,
  endBattle,
  returnHome,
  handlePostBattlePopups,
  // 新增功能
  collectResources,
  collectTreasury,
  removeObstacles,
  donateTroops,
  removeShield,
  performHomeTasks
};

