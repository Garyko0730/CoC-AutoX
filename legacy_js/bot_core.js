// 核心逻辑：解耦状态管理与具体执行
const config = require("./config");
const ocr = require("./ocr_util");
const combat = require("./combat");

/**
 * 状态机模型
 * 优点：易于测试、逻辑清晰
 */
const STATE = {
  PREPARATION: 'PREPARATION',
  SEARCH: 'SEARCH',
  ATTACK: 'ATTACK',
  MONITOR: 'MONITOR',
  POST_BATTLE: 'POST_BATTLE',
  IDLE: 'IDLE'
};

class BotCore {
  constructor() {
    this.state = STATE.IDLE;
    this.isRunning = false;
    this.stateStartTime = 0;
    this.listeners = [];
  }

  onUpdate(callback) {
    this.listeners.push(callback);
  }

  notify(event, data) {
    this.listeners.forEach(cb => cb(event, data));
  }

  setState(nextState) {
    if (this.state === nextState) return;
    
    // 退出旧状态的清理
    if (this.state === STATE.MONITOR || this.state === STATE.ATTACK) {
      combat.cancelWardenSkill();
    }

    const prevState = this.state;
    this.state = nextState;
    this.stateStartTime = Date.now();
    
    if (nextState === STATE.ATTACK) {
      ocr.resetBattleStartAt();
    }

    this.notify('stateChange', { prev: prevState, current: nextState });
  }

  start() {
    this.isRunning = true;
    this.setState(STATE.PREPARATION);
    this.notify('log', { level: 'INFO', msg: '脚本启动' });
  }

  stop() {
    this.isRunning = false;
    this.setState(STATE.IDLE);
    this.notify('log', { level: 'WARN', msg: '脚本停止' });
  }

  pause() {
    this.isRunning = false;
    this.notify('log', { level: 'INFO', msg: '脚本暂停' });
  }

  resume() {
    this.isRunning = true;
    this.notify('log', { level: 'INFO', msg: '脚本恢复' });
  }

  /**
   * 核心循环逻辑
   */
  tick() {
    if (!this.isRunning) return;

    try {
      this.checkTimeout();
      
      switch (this.state) {
        case STATE.PREPARATION:
          this.handlePreparation();
          break;
        case STATE.SEARCH:
          this.handleSearch();
          break;
        case STATE.ATTACK:
          this.handleAttack();
          break;
        case STATE.MONITOR:
          this.handleMonitor();
          break;
        case STATE.POST_BATTLE:
          this.handlePostBattle();
          break;
      }
    } catch (e) {
      this.notify('log', { level: 'ERROR', msg: `循环异常: ${e.message}` });
      this.setState(STATE.PREPARATION);
    } finally {
      ocr.recycleShared();
    }
  }

  checkTimeout() {
    const elapsed = Date.now() - this.stateStartTime;
    const timeouts = config.timeouts || {
      PREPARATION: 90000,
      SEARCH: 120000,
      ATTACK: 30000,
      MONITOR: 210000,
      POST_BATTLE: 60000
    };

    if (timeouts[this.state] && elapsed > timeouts[this.state]) {
      this.notify('log', { level: 'WARN', msg: `状态 ${this.state} 超时，强制重置` });
      this.setState(STATE.PREPARATION);
    }
  }

  handlePreparation() {
    this.notify('action', '检测主页状态');
    if (!ocr.isInHome()) return;

    // 执行日常任务
    combat.performHomeTasks();

    const capacity = ocr.getArmyCapacity();
    if (!capacity) {
      this.notify('log', { level: 'WARN', msg: '无法读取兵力，执行默认补兵' });
      combat.trainArmy(null);
      return;
    }

    if (capacity.current >= capacity.max) {
      this.notify('log', { level: 'INFO', msg: '兵力充足，开始搜鱼' });
      this.setState(STATE.SEARCH);
    } else {
      const missing = capacity.max - capacity.current;
      this.notify('log', { level: 'INFO', msg: `补兵中: 缺口 ${missing}` });
      combat.trainArmy(missing);
    }
  }

  handleSearch() {
    this.notify('action', '搜索对手');
    combat.startSearch();

    if (ocr.isSearchingCloud()) {
      this.notify('log', { level: 'INFO', msg: '正在白云中...' });
      return;
    }

    const loot = ocr.getLoot();
    if (!loot) {
      this.notify('log', { level: 'WARN', msg: '无法识别资源，跳过' });
      combat.nextSearch();
      return;
    }

    const goldMatch = loot.gold >= config.minGold;
    const elixirMatch = loot.elixir >= config.minElixir;

    if (goldMatch && elixirMatch) {
      this.notify('log', { level: 'INFO', msg: `目标达成: 金币=${loot.gold}, 圣水=${loot.elixir}` });
      this.setState(STATE.ATTACK);
    } else {
      this.notify('log', { level: 'INFO', msg: `资源不足，继续搜索` });
      combat.nextSearch();
    }
  }

  handleAttack() {
    this.notify('action', '投放部队');
    combat.deployTroops(config.troopStrategy);
    combat.deployHeroes();
    combat.deploySpells();
    combat.scheduleWardenSkill();
    this.setState(STATE.MONITOR);
  }

  handleMonitor() {
    this.notify('action', '监控战况');
    const stats = ocr.getBattleStats();
    const hasReturn = ocr.hasReturnButton();

    if (hasReturn || (stats && this.isBattleFinished(stats))) {
      this.notify('log', { level: 'INFO', msg: '战斗结束，返回营地' });
      combat.endBattle();
      this.setState(STATE.POST_BATTLE);
    }
  }

  handlePostBattle() {
    this.notify('action', '结算清理');
    combat.returnHome();
    combat.handlePostBattlePopups();
    this.setState(STATE.PREPARATION);
  }

  isBattleFinished(stats) {
    // 简单逻辑：摧毁率 100% 或 时间到 或 兵力耗尽
    return stats.destruction >= 1.0 || stats.elapsedMs > 180000;
  }
}

module.exports = new BotCore();
