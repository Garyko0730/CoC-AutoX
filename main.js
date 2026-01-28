// 主入口
const config = require("./config");
const ocr = require("./ocr_util");
const combat = require("./combat");
const storage = typeof storages !== "undefined" ? storages.create("coc_bot_settings") : null;

// 状态常量
const STATE = {
  PREPARATION: 1,
  SEARCH: 2,
  ATTACK: 3,
  MONITOR: 4,
  POST_BATTLE: 5
};

let currentState = STATE.PREPARATION;
let isRunning = false;
let stateEnteredAt = Date.now();
let lastAction = "INIT";
let lastLogLevel = "INFO";

const STATE_TIMEOUTS = {
  PREPARATION: 90000,
  SEARCH: 120000,
  ATTACK: 15000,
  MONITOR: 180000,
  POST_BATTLE: 60000
};

// 申请 Root 权限
function ensureRoot() {
  const r = normalizeShellResult(shell("id", true));
  if (!isRootResult(r)) {
    const su = normalizeShellResult(shell("su -c id", true));
    if (!isRootResult(su)) {
      toast("Root 申请失败");
      exit();
    }
  }
}

function normalizeShellResult(result) {
  if (!result) {
    return { code: -1, out: "" };
  }
  if (typeof result === "string") {
    return { code: 0, out: result };
  }
  if (typeof result === "number") {
    return { code: result, out: "" };
  }
  const code = typeof result.code === "number" ? result.code : result.exitCode;
  const out = result.result || result.out || result.stdout || "";
  return { code: typeof code === "number" ? code : 0, out: out };
}

function isRootResult(result) {
  if (!result || typeof result.out !== "string") {
    return false;
  }
  return result.code === 0 && result.out.indexOf("uid=0") >= 0;
}

const View = android.view.View;
const BitmapFactory = android.graphics.BitmapFactory;
const ImageView = android.widget.ImageView;
const ICONS = {
  play: files.path("assets/icons/play.png"),
  pause: files.path("assets/icons/pause.png"),
  stop: files.path("assets/icons/stop.png"),
  log: files.path("assets/icons/log.png"),
  settings: files.path("assets/icons/settings.png")
};
let isExpanded = true;
let isLogVisible = true;
let pickTarget = "";

// 悬浮窗
const win = floaty.window(
  <frame padding="6">
    <vertical id="expanded">
      <text id="title" text="CoC Bot" textSize="16sp" />
      <text id="state" text="状态: INIT" />
      <horizontal>
        <img id="btnPlay" w="36" h="36" />
        <img id="btnPause" w="36" h="36" />
        <img id="btnStop" w="36" h="36" />
        <img id="btnLog" w="36" h="36" />
        <img id="btnSettings" w="36" h="36" />
      </horizontal>
      <text id="log" text="日志: 待机" />
    </vertical>
    <vertical id="collapsed">
      <button id="btnExpand" text=">>" w="52" h="36" />
    </vertical>
  </frame>
);

win.expanded.setVisibility(View.VISIBLE);
win.collapsed.setVisibility(View.GONE);
applyIcon(win.btnPlay, ICONS.play);
applyIcon(win.btnPause, ICONS.pause);
applyIcon(win.btnStop, ICONS.stop);
applyIcon(win.btnLog, ICONS.log);
applyIcon(win.btnSettings, ICONS.settings);

const settingsWin = floaty.window(
  <frame padding="8">
    <vertical>
      <text id="settingsTitle" text="设置" textSize="16sp" />
      <horizontal>
        <text text="金币阈值" w="120" />
        <input id="inputMinGold" w="120" inputType="number" />
      </horizontal>
      <horizontal>
        <text text="圣水阈值" w="120" />
        <input id="inputMinElixir" w="120" inputType="number" />
      </horizontal>
      <horizontal>
        <text text="补兵次数" w="120" />
        <input id="inputTroopCount" w="120" inputType="number" />
      </horizontal>
      <horizontal>
        <text text="兵种住房" w="120" />
        <input id="inputTroopHousing" w="120" inputType="number" />
      </horizontal>
      <horizontal>
        <text text="进攻策略" w="120" />
        <spinner id="inputStrategy" entries="四边,两边,单点" w="120" />
      </horizontal>
      <text id="textHomePoint" text="配兵按钮: 0.00,0.00" />
      <text id="textTroopPoint" text="兵种按钮: 0.00,0.00" />
      <horizontal>
        <button id="btnPickHome" text="取点配兵" w="120" />
        <button id="btnPickTroop" text="取点兵种" w="120" />
      </horizontal>
      <horizontal>
        <button id="btnSettingsSave" text="保存" w="80" />
        <button id="btnSettingsClose" text="关闭" w="80" />
      </horizontal>
    </vertical>
  </frame>
);

settingsWin.setPosition(20, 160);
setFloatyVisibility(settingsWin, false);

const pickerWin = floaty.rawWindow(
  <frame id="picker" w="*" h="*" />
);

setFloatyVisibility(pickerWin, false);
if (typeof colors !== "undefined" && typeof colors.parseColor === "function") {
  pickerWin.picker.setBackgroundColor(colors.parseColor("#33000000"));
}
pickerWin.picker.setOnTouchListener(function (view, event) {
  if (event.getAction() !== 0) {
    return true;
  }
  const ratio = pickPoint(event.getRawX(), event.getRawY());
  if (ratio) {
    setPickedPoint(ratio);
  }
  stopPicking();
  return true;
});

win.title.click(() => {
  toggleExpanded();
});

win.btnExpand.click(() => {
  toggleExpanded();
});

win.btnPlay.click(() => {
  isRunning = true;
  setLog("INFO", "状态", "运行中", "按钮开始");
});

win.btnPause.click(() => {
  isRunning = false;
  setLog("INFO", "状态", "已暂停", "按钮暂停");
});

win.btnStop.click(() => {
  isRunning = false;
  setState(STATE.PREPARATION);
  setLog("WARN", "状态", "已停止", "等待开始");
});

win.btnLog.click(() => {
  isLogVisible = !isLogVisible;
  win.log.setVisibility(isLogVisible ? View.VISIBLE : View.GONE);
  setLog("INFO", "界面", "日志切换", isLogVisible ? "显示" : "隐藏");
});

win.btnSettings.click(() => {
  toggleSettings();
});

settingsWin.btnPickHome.click(() => {
  startPicking("homeArmyButtonPoint");
});

settingsWin.btnPickTroop.click(() => {
  startPicking("trainTroopPoint");
});

settingsWin.btnSettingsSave.click(() => {
  applySettingsFromInputs();
  setLog("INFO", "设置", "已保存", "即时生效");
});

settingsWin.btnSettingsClose.click(() => {
  hideSettings();
});

// 入口
loadSettingsFromStorage();
ensureRoot();
ensureScreenCapture();
launchGame();

while (true) {
  try {
    if (!isRunning) {
      sleep(500);
      continue;
    }

    if (isStateTimeout()) {
      setLog("WARN", "状态", "超时", "回到备战");
      setState(STATE.PREPARATION);
      sleep(800);
      continue;
    }

    switch (currentState) {
      case STATE.PREPARATION:
        win.state.setText("状态: 备战");
        setAction("检测主页/兵营");
        if (!ocr.isInHome()) {
          sleep(800);
          break;
        }
        const capacity = ocr.getArmyCapacity();
        if (!capacity) {
          setLog("WARN", "OCR", "读取失败", "使用默认补兵");
          combat.trainArmy(null);
          sleep(800);
          break;
        }
        if (capacity.current >= capacity.max) {
          setLog("INFO", "状态", "兵已满", "进入搜鱼");
          setState(STATE.SEARCH);
          break;
        }
        setAction("训练部队");
        const missing = Math.max(0, capacity.max - capacity.current);
        setLog("INFO", "训练", "补兵", "缺口=" + missing);
        combat.trainArmy(missing);
        sleep(1200);
        break;

      case STATE.SEARCH:
        win.state.setText("状态: 搜鱼");
        setAction("开始搜索");
        combat.startSearch();
        if (ocr.isSearchingCloud()) {
          setLog("INFO", "搜索", "云端搜索中", "等待结果");
          sleep(1200);
          break;
        }
        const loot = ocr.getLoot();
        if (!loot) {
          setLog("WARN", "OCR", "未读到资源", "下一家");
          combat.nextSearch();
          sleep(1000);
          break;
        }
        if (loot.gold >= config.minGold && loot.elixir >= config.minElixir) {
          setLog("INFO", "搜索", "资源满足", "进入进攻");
          setState(STATE.ATTACK);
          break;
        }
        setLog("INFO", "搜索", "资源不足", "下一家");
        combat.nextSearch();
        sleep(1000);
        break;

      case STATE.ATTACK:
        win.state.setText("状态: 进攻");
        setAction("下兵/英雄/法术");
        combat.deployTroops(config.troopStrategy);
        combat.deployHeroes();
        combat.deploySpells();
        combat.scheduleWardenSkill();
        setState(STATE.MONITOR);
        break;

      case STATE.MONITOR:
        win.state.setText("状态: 战斗监控");
        setAction("读取战斗状态");
        const stats = ocr.getBattleStats();
        const hasReturn = ocr.hasReturnButton();
        if (stats && shouldEndBattle(stats, hasReturn)) {
          setLog("INFO", "战斗", "结束战斗", "回营结算");
          combat.endBattle();
          setState(STATE.POST_BATTLE);
          break;
        }
        sleep(1200);
        break;

      case STATE.POST_BATTLE:
        win.state.setText("状态: 结算");
        setAction("回营/清弹窗");
        combat.returnHome();
        combat.handlePostBattlePopups();
        setState(STATE.PREPARATION);
        break;

      default:
        setState(STATE.PREPARATION);
        break;
    }

    sleep(config.delays ? config.delays.stateLoop : 300);
  } catch (err) {
    const errMsg = err && err.message ? err.message : String(err);
    setLog("ERROR", "异常", "重置状态", errMsg);
    setState(STATE.PREPARATION);
    sleep(1000);
  } finally {
    // 每次循环结束回收截图内存
    ocr.recycleShared();
  }
}

function shouldEndBattle(stats, hasReturn) {
  if (hasReturn) {
    return true;
  }
  if (!stats) {
    return false;
  }
  if (stats.remainingRate >= 0 && stats.remainingRate <= 0.1) {
    return true;
  }
  if (stats.destruction >= 0.5) {
    return true;
  }
  if (stats.elapsedMs >= 150000) {
    return true;
  }
  return false;
}

function setState(nextState) {
  // 状态切换时取消挂起的线程
  combat.cancelWardenSkill();
  currentState = nextState;
  stateEnteredAt = Date.now();
  if (nextState === STATE.ATTACK) {
    ocr.resetBattleStartAt();
  }
}

function loadSettingsFromStorage() {
  if (!storage) {
    return;
  }
  config.minGold = storage.get("minGold", config.minGold);
  config.minElixir = storage.get("minElixir", config.minElixir);
  config.trainTroopCount = storage.get("trainTroopCount", config.trainTroopCount);
  config.trainTroopHousing = storage.get("trainTroopHousing", config.trainTroopHousing);
  config.troopStrategy = storage.get("troopStrategy", config.troopStrategy);
  config.homeArmyButtonPoint = storage.get("homeArmyButtonPoint", config.homeArmyButtonPoint);
  config.trainTroopPoint = storage.get("trainTroopPoint", config.trainTroopPoint);
  runOnUi(syncSettingsInputs);
}

function syncSettingsInputs() {
  if (!settingsWin) {
    return;
  }
  settingsWin.inputMinGold.setText(String(config.minGold));
  settingsWin.inputMinElixir.setText(String(config.minElixir));
  settingsWin.inputTroopCount.setText(String(config.trainTroopCount));
  settingsWin.inputTroopHousing.setText(String(config.trainTroopHousing));
  settingsWin.inputStrategy.setSelection(strategyIndexFromValue(config.troopStrategy));
  syncPointLabels();
}

function applySettingsFromInputs() {
  const nextMinGold = parseNumberInput(settingsWin.inputMinGold, config.minGold);
  const nextMinElixir = parseNumberInput(settingsWin.inputMinElixir, config.minElixir);
  const nextTroopCount = parseNumberInput(settingsWin.inputTroopCount, config.trainTroopCount);
  const nextTroopHousing = parseNumberInput(settingsWin.inputTroopHousing, config.trainTroopHousing);
  const nextStrategy = strategyValueFromIndex(settingsWin.inputStrategy.getSelectedItemPosition());
  config.minGold = nextMinGold;
  config.minElixir = nextMinElixir;
  config.trainTroopCount = nextTroopCount;
  config.trainTroopHousing = nextTroopHousing;
  config.troopStrategy = nextStrategy;
  if (storage) {
    storage.put("minGold", config.minGold);
    storage.put("minElixir", config.minElixir);
    storage.put("trainTroopCount", config.trainTroopCount);
    storage.put("trainTroopHousing", config.trainTroopHousing);
    storage.put("troopStrategy", config.troopStrategy);
    storage.put("homeArmyButtonPoint", config.homeArmyButtonPoint);
    storage.put("trainTroopPoint", config.trainTroopPoint);
  }
  runOnUi(syncSettingsInputs);
}

function parseNumberInput(view, fallback) {
  if (!view || typeof view.getText !== "function") {
    return fallback;
  }
  const text = String(view.getText()).trim();
  const value = parseInt(text, 10);
  if (isNaN(value)) {
    return fallback;
  }
  return value;
}

function syncPointLabels() {
  if (!settingsWin) {
    return;
  }
  const home = config.homeArmyButtonPoint || { x: 0, y: 0 };
  const troop = config.trainTroopPoint || { x: 0, y: 0 };
  settingsWin.textHomePoint.setText("配兵按钮: " + home.x.toFixed(2) + "," + home.y.toFixed(2));
  settingsWin.textTroopPoint.setText("兵种按钮: " + troop.x.toFixed(2) + "," + troop.y.toFixed(2));
}

function startPicking(target) {
  pickTarget = target;
  setLog("INFO", "设置", "取点", "请点击屏幕");
  setFloatyVisibility(pickerWin, true);
}

function stopPicking() {
  setFloatyVisibility(pickerWin, false);
  pickTarget = "";
}

function pickPoint(rawX, rawY) {
  const w = device.width || 720;
  const h = device.height || 1280;
  if (!w || !h) {
    return null;
  }
  const x = Math.max(0, Math.min(1, rawX / w));
  const y = Math.max(0, Math.min(1, rawY / h));
  return { x: x, y: y };
}

function setPickedPoint(point) {
  if (!pickTarget) {
    return;
  }
  if (pickTarget === "homeArmyButtonPoint") {
    config.homeArmyButtonPoint = point;
    setLog("INFO", "设置", "配兵坐标", point.x.toFixed(2) + "," + point.y.toFixed(2));
  }
  if (pickTarget === "trainTroopPoint") {
    config.trainTroopPoint = point;
    setLog("INFO", "设置", "兵种坐标", point.x.toFixed(2) + "," + point.y.toFixed(2));
  }
  if (storage) {
    storage.put("homeArmyButtonPoint", config.homeArmyButtonPoint);
    storage.put("trainTroopPoint", config.trainTroopPoint);
  }
  runOnUi(syncPointLabels);
}

function runOnUi(action) {
  if (typeof ui !== "undefined" && typeof ui.run === "function") {
    ui.run(action);
  } else if (typeof action === "function") {
    action();
  }
}

function strategyIndexFromValue(value) {
  switch (value) {
    case "FOUR_SIDES":
      return 0;
    case "TWO_SIDES":
      return 1;
    case "SINGLE_POINT":
      return 2;
    default:
      return 0;
  }
}

function strategyValueFromIndex(index) {
  switch (index) {
    case 1:
      return "TWO_SIDES";
    case 2:
      return "SINGLE_POINT";
    default:
      return "FOUR_SIDES";
  }
}

function toggleSettings() {
  if (!settingsWin) {
    return;
  }
  const current = getFloatyVisibility(settingsWin);
  if (current === View.VISIBLE) {
    hideSettings();
  } else {
    showSettings();
  }
}

function showSettings() {
  syncSettingsInputs();
  setFloatyVisibility(settingsWin, true);
}

function hideSettings() {
  setFloatyVisibility(settingsWin, false);
}

function setFloatyVisibility(windowObj, visible) {
  if (!windowObj) {
    return;
  }
  const apply = function () {
    if (typeof windowObj.setVisibility === "function") {
      windowObj.setVisibility(visible ? View.VISIBLE : View.GONE);
    }
  };
  if (typeof ui !== "undefined" && typeof ui.run === "function") {
    ui.run(apply);
  } else {
    apply();
  }
}

function getFloatyVisibility(windowObj) {
  if (!windowObj || typeof windowObj.getVisibility !== "function") {
    return View.GONE;
  }
  return windowObj.getVisibility();
}

function applyIcon(view, path) {
  if (!view || !path) {
    return;
  }
  const apply = function () {
    const bitmap = BitmapFactory.decodeFile(path);
    if (!bitmap) {
      return;
    }
    view.setImageBitmap(bitmap);
    if (typeof view.setScaleType === "function") {
      view.setScaleType(ImageView.ScaleType.CENTER_INSIDE);
    }
    if (typeof view.setClickable === "function") {
      view.setClickable(true);
    }
  };
  if (typeof ui !== "undefined" && typeof ui.run === "function") {
    ui.run(apply);
  } else {
    apply();
  }
}

function toggleExpanded() {
  isExpanded = !isExpanded;
  win.expanded.setVisibility(isExpanded ? View.VISIBLE : View.GONE);
  win.collapsed.setVisibility(isExpanded ? View.GONE : View.VISIBLE);
}

function setAction(action) {
  lastAction = action;
  updateLog(lastLogLevel, "动作", action, "");
}

function setLog(level, module, status, detail) {
  lastLogLevel = level || "INFO";
  updateLog(lastLogLevel, module, status, detail);
}

function updateLog(level, module, status, detail) {
  const parts = [level, module, status, "动作=" + lastAction];
  if (detail) {
    parts.push(detail);
  }
  win.log.setText(parts.join(" | "));
  if (typeof win.log.setTextColor === "function" && typeof colors !== "undefined") {
    win.log.setTextColor(colorForLevel(level));
  }
}

function colorForLevel(level) {
  if (!colors || typeof colors.parseColor !== "function") {
    return "#1E88E5";
  }
  switch (level) {
    case "ERROR":
      return colors.parseColor("#E53935");
    case "WARN":
      return colors.parseColor("#FB8C00");
    default:
      return colors.parseColor("#1E88E5");
  }
}

function isStateTimeout() {
  const now = Date.now();
  const elapsed = now - stateEnteredAt;
  switch (currentState) {
    case STATE.PREPARATION:
      return elapsed > STATE_TIMEOUTS.PREPARATION;
    case STATE.SEARCH:
      return elapsed > STATE_TIMEOUTS.SEARCH;
    case STATE.ATTACK:
      return elapsed > STATE_TIMEOUTS.ATTACK;
    case STATE.MONITOR:
      return elapsed > STATE_TIMEOUTS.MONITOR;
    case STATE.POST_BATTLE:
      return elapsed > STATE_TIMEOUTS.POST_BATTLE;
    default:
      return elapsed > 60000;
  }
}

function ensureScreenCapture() {
  if (typeof requestScreenCapture !== "function") {
    return;
  }
  try {
    const ok = requestScreenCapture();
    if (!ok) {
      setLog("ERROR", "权限", "截图权限失败", "请授予截图权限");
    }
  } catch (err) {
    setLog("ERROR", "权限", "截图权限异常", "请重试");
  }
}

function launchGame() {
  const packageName = findGamePackageName();
  if (!packageName) {
    setLog("ERROR", "启动", "未找到包名", "请检查配置");
    return;
  }
  try {
    if (typeof app !== "undefined" && typeof app.launchPackage === "function") {
      app.launchPackage(packageName);
    } else {
      shell("monkey -p " + packageName + " -c android.intent.category.LAUNCHER 1", true);
    }
    setLog("INFO", "启动", "启动游戏", packageName);
    sleep(1500);
  } catch (err) {
    setLog("ERROR", "启动", "启动失败", "请检查权限");
  }
}

function findGamePackageName() {
  if (config.gamePackageName && config.gamePackageName.trim()) {
    return config.gamePackageName.trim();
  }
  if (config.gameAppName && typeof app !== "undefined" && typeof app.getPackageName === "function") {
    try {
      const pkg = app.getPackageName(config.gameAppName);
      if (pkg) {
        return pkg;
      }
    } catch (err) {
      // ignore
    }
  }
  if (Array.isArray(config.gamePackageCandidates)) {
    for (let i = 0; i < config.gamePackageCandidates.length; i += 1) {
      const candidate = config.gamePackageCandidates[i];
      if (!candidate) {
        continue;
      }
      if (isPackageInstalled(candidate)) {
        return candidate;
      }
    }
  }
  return "";
}

function isPackageInstalled(packageName) {
  if (typeof app !== "undefined" && typeof app.getAppName === "function") {
    try {
      return !!app.getAppName(packageName);
    } catch (err) {
      return false;
    }
  }
  const res = normalizeShellResult(shell("pm list packages " + packageName, true));
  return res.code === 0 && res.out.indexOf(packageName) >= 0;
}
