const bot = require("./bot_core");
const config = require("./config");
const ui_styles = require("./ui_styles");

// 设置 UI 与逻辑的绑定
function setupUI() {
  const win = floaty.window(
    <frame padding="6">
      <vertical id="container" style={ui_styles.mainContainer}>
        <horizontal gravity="center_vertical">
          <text id="title" text="Jarvis CoC" style={ui_styles.titleText} />
          <text id="state" text="IDLE" style={ui_styles.stateText} />
        </horizontal>
        
        <horizontal gravity="center">
          <img id="btnPlay" src="file://assets/icons/play.png" w="40" h="40" margin="4" />
          <img id="btnPause" src="file://assets/icons/pause.png" w="40" h="40" margin="4" />
          <img id="btnStop" src="file://assets/icons/stop.png" w="40" h="40" margin="4" />
          <img id="btnSettings" src="file://assets/icons/settings.png" w="40" h="40" margin="4" />
        </horizontal>

        <text id="logView" text="等待指令..." lines="1" ellipsize="end" style={ui_styles.logText} />
      </vertical>
    </frame>
  );

  // 绑定逻辑监听
  bot.onUpdate((event, data) => {
    ui.run(() => {
      if (event === 'stateChange') {
        win.state.setText(data.current);
      } else if (event === 'log') {
        win.logView.setText(`[${data.level}] ${data.msg}`);
        // 根据 level 改变颜色
        if (data.level === 'ERROR') win.logView.setTextColor(colors.RED);
        else if (data.level === 'WARN') win.logView.setTextColor(colors.parseColor("#FFA500"));
        else win.logView.setTextColor(colors.WHITE);
      } else if (event === 'action') {
        win.title.setText(`Jarvis: ${data}`);
      }
    });
  });

  win.btnPlay.click(() => bot.isRunning ? bot.resume() : bot.start());
  win.btnPause.click(() => bot.pause());
  win.btnStop.click(() => bot.stop());
  
  return win;
}

module.exports = { setupUI };
