// CoC AutoX 核心脚本逻辑
// 从 UI 分离的纯脚本模块

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

const STATE_TIMEOUTS = {
    PREPARATION: 90000,
    SEARCH: 120000,
    ATTACK: 15000,
    MONITOR: 180000,
    POST_BATTLE: 60000
};

// 日志回调（可被外部设置）
let _logCallback = null;
let _stateCallback = null;

function setLogCallback(callback) {
    _logCallback = callback;
}

function setStateCallback(callback) {
    _stateCallback = callback;
}

function log(level, module, status, detail) {
    if (_logCallback) {
        _logCallback(level, module, status, detail);
    } else {
        console.log("[" + level + "] " + module + ": " + status + " - " + detail);
    }
}

function notifyState(stateName) {
    if (_stateCallback) {
        _stateCallback(stateName);
    }
}

// 申请 Root 权限
function ensureRoot() {
    const r = normalizeShellResult(shell("id", true));
    if (!isRootResult(r)) {
        const su = normalizeShellResult(shell("su -c id", true));
        if (!isRootResult(su)) {
            toast("Root 申请失败");
            return false;
        }
    }
    return true;
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

function ensureScreenCapture() {
    if (typeof requestScreenCapture !== "function") {
        return true;
    }
    try {
        const ok = requestScreenCapture();
        if (!ok) {
            log("ERROR", "权限", "截图权限失败", "请授予截图权限");
            return false;
        }
        return true;
    } catch (err) {
        log("ERROR", "权限", "截图权限异常", "请重试");
        return false;
    }
}

function launchGame() {
    const packageName = findGamePackageName();
    if (!packageName) {
        log("ERROR", "启动", "未找到包名", "请检查配置");
        return false;
    }
    try {
        if (typeof app !== "undefined" && typeof app.launchPackage === "function") {
            app.launchPackage(packageName);
        } else {
            shell("monkey -p " + packageName + " -c android.intent.category.LAUNCHER 1", true);
        }
        log("INFO", "启动", "启动游戏", packageName);
        sleep(1500);
        return true;
    } catch (err) {
        log("ERROR", "启动", "启动失败", "请检查权限");
        return false;
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

    // 加载功能开关
    if (!config.features) config.features = {};
    config.features.collectResource = storage.get("collectResource", true);
    config.features.removeGrass = storage.get("removeGrass", true);
    config.features.removeShield = storage.get("removeShield", false);
    config.features.donate = storage.get("donate", false);
    config.features.autoFish = storage.get("autoFish", true);

    // 加载打鱼设置
    if (!config.fishing) config.fishing = {};
    config.fishing.enabled = storage.get("fishEnabled", true);
    config.fishing.loopCount = storage.get("fishLoopCount", 2);
    config.fishing.cloudTimeout = storage.get("cloudTimeout", 80);
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
    combat.cancelWardenSkill();
    currentState = nextState;
    stateEnteredAt = Date.now();
    if (nextState === STATE.ATTACK) {
        ocr.resetBattleStartAt();
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

// 主循环
function runMainLoop() {
    loadSettingsFromStorage();

    if (!ensureRoot()) {
        return;
    }

    if (!ensureScreenCapture()) {
        return;
    }

    launchGame();
    isRunning = true;

    while (isRunning) {
        try {
            if (isStateTimeout()) {
                log("WARN", "状态", "超时", "回到备战");
                setState(STATE.PREPARATION);
                sleep(800);
                continue;
            }

            switch (currentState) {
                case STATE.PREPARATION:
                    notifyState("备战");
                    if (!ocr.isInHome()) {
                        sleep(800);
                        break;
                    }
                    const capacity = ocr.getArmyCapacity();
                    if (!capacity) {
                        log("WARN", "OCR", "读取失败", "使用默认补兵");
                        combat.trainArmy(null);
                        sleep(800);
                        break;
                    }
                    if (capacity.current >= capacity.max) {
                        log("INFO", "状态", "兵已满", "执行主页任务");
                        // 执行主页日常任务（采集、除草、捐兵等）
                        combat.performHomeTasks(config.features);
                        log("INFO", "状态", "主页任务完成", "进入搜鱼");
                        setState(STATE.SEARCH);
                        break;
                    }
                    const missing = Math.max(0, capacity.max - capacity.current);
                    log("INFO", "训练", "补兵", "缺口=" + missing);
                    combat.trainArmy(missing);
                    sleep(1200);
                    break;

                case STATE.SEARCH:
                    notifyState("搜鱼");
                    combat.startSearch();
                    if (ocr.isSearchingCloud()) {
                        log("INFO", "搜索", "云端搜索中", "等待结果");
                        sleep(1200);
                        break;
                    }
                    const loot = ocr.getLoot();
                    if (!loot) {
                        log("WARN", "OCR", "未读到资源", "下一家");
                        combat.nextSearch();
                        sleep(1000);
                        break;
                    }
                    if (loot.gold >= config.minGold && loot.elixir >= config.minElixir) {
                        log("INFO", "搜索", "资源满足", "进入进攻");
                        setState(STATE.ATTACK);
                        break;
                    }
                    log("INFO", "搜索", "资源不足", "下一家");
                    combat.nextSearch();
                    sleep(1000);
                    break;

                case STATE.ATTACK:
                    notifyState("进攻");
                    combat.deployTroops(config.troopStrategy);
                    combat.deployHeroes();
                    combat.deploySpells();
                    combat.scheduleWardenSkill();
                    setState(STATE.MONITOR);
                    break;

                case STATE.MONITOR:
                    notifyState("战斗监控");
                    const stats = ocr.getBattleStats();
                    const hasReturn = ocr.hasReturnButton();
                    if (stats && shouldEndBattle(stats, hasReturn)) {
                        log("INFO", "战斗", "结束战斗", "回营结算");
                        combat.endBattle();
                        setState(STATE.POST_BATTLE);
                        break;
                    }
                    sleep(1200);
                    break;

                case STATE.POST_BATTLE:
                    notifyState("结算");
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
            log("ERROR", "异常", "重置状态", errMsg);
            setState(STATE.PREPARATION);
            sleep(1000);
        } finally {
            ocr.recycleShared();
        }
    }
}

function startBot() {
    log("INFO", "脚本", "启动", "开始运行");
    runMainLoop();
}

function stopBot() {
    isRunning = false;
    log("INFO", "脚本", "停止", "用户停止");
}

function pauseBot() {
    isRunning = false;
    log("INFO", "脚本", "暂停", "用户暂停");
}

function resumeBot() {
    isRunning = true;
    log("INFO", "脚本", "继续", "用户继续");
}

module.exports = {
    STATE,
    startBot,
    stopBot,
    pauseBot,
    resumeBot,
    setLogCallback,
    setStateCallback,
    loadSettingsFromStorage
};

// Auto start when executed directly
if (typeof engines !== "undefined") { startBot(); }


