// CoC AutoX 全屏 UI 入口
// 参考爱玩 CoC 脚本界面设计

"ui";

var config = require("./config");
var storage = storages.create("coc_bot_settings");

var currentTab = 0;
var currentAccountIndex = 1;

ui.layout(
    <vertical bg="#1A1A2E">
        <horizontal bg="#16213E" padding="12" gravity="center_vertical">
            <text id="appTitle" text="CoC AutoX v1.0" textSize="18sp" textColor="#FFFFFF" layout_weight="1" />
            <text id="deviceInfo" text="" textSize="10sp" textColor="#78909C" />
        </horizontal>

        <horizontal bg="#16213E" padding="8">
            <text id="tabHome" text="首页设置" textSize="14sp" textColor="#2196F3" layout_weight="1" gravity="center" padding="8" />
            <text id="tabAccount" text="账号设置" textSize="14sp" textColor="#B0BEC5" layout_weight="1" gravity="center" padding="8" />
            <text id="tabSpecial" text="特殊功能" textSize="14sp" textColor="#B0BEC5" layout_weight="1" gravity="center" padding="8" />
        </horizontal>

        <viewpager id="pager" layout_weight="1">
            <scroll>
                <vertical padding="12" id="pageHome">
                    <horizontal marginBottom="12">
                        <button id="btnAutoRun" text="43秒后自动运行" textSize="11sp" bg="#E91E63" textColor="#FFFFFF" layout_weight="1" h="44" />
                        <button id="btnStart" text="开始运行" textSize="12sp" bg="#4CAF50" textColor="#FFFFFF" layout_weight="1" h="44" marginLeft="8" />
                        <button id="btnReset" text="恢复默认" textSize="11sp" bg="#2196F3" textColor="#FFFFFF" layout_weight="1" h="44" marginLeft="8" />
                    </horizontal>

                    <text id="txtDeviceInfo" text="设备信息加载中..." textSize="11sp" textColor="#4CAF50" marginBottom="8" />
                    <View bg="#455A64" h="1" marginBottom="12" marginTop="4" />

                    <text text="===== 资源阈值设置 =====" textSize="12sp" textColor="#FF9800" gravity="center" marginBottom="8" />
                    <horizontal marginBottom="8" gravity="center_vertical">
                        <text text="金币阈值:" textSize="13sp" textColor="#FFFFFF" w="80" />
                        <input id="inputMinGold" inputType="number" text="1000" textSize="13sp" textColor="#FFFFFF" bg="#37474F" layout_weight="1" padding="8" />
                    </horizontal>
                    <horizontal marginBottom="8" gravity="center_vertical">
                        <text text="圣水阈值:" textSize="13sp" textColor="#FFFFFF" w="80" />
                        <input id="inputMinElixir" inputType="number" text="1000" textSize="13sp" textColor="#FFFFFF" bg="#37474F" layout_weight="1" padding="8" />
                    </horizontal>
                    <horizontal marginBottom="8" gravity="center_vertical">
                        <text text="黑油阈值:" textSize="13sp" textColor="#FFFFFF" w="80" />
                        <input id="inputMinDark" inputType="number" text="0" textSize="13sp" textColor="#FFFFFF" bg="#37474F" layout_weight="1" padding="8" />
                    </horizontal>

                    <View bg="#455A64" h="1" marginBottom="12" marginTop="4" />
                    <text text="===== 进攻策略设置 =====" textSize="12sp" textColor="#FF9800" gravity="center" marginBottom="8" />
                    <horizontal marginBottom="8" gravity="center_vertical">
                        <text text="出兵策略:" textSize="13sp" textColor="#FFFFFF" w="80" />
                        <spinner id="spinnerStrategy" entries="四边下兵|两边下兵|单点下兵" textSize="13sp" bg="#37474F" layout_weight="1" />
                    </horizontal>
                    <horizontal marginBottom="8" gravity="center_vertical">
                        <text text="造兵模式:" textSize="13sp" textColor="#FFFFFF" w="80" />
                        <spinner id="spinnerTrainMode" entries="快速造兵|自定义造兵" textSize="13sp" bg="#37474F" layout_weight="1" />
                    </horizontal>

                    <View bg="#455A64" h="1" marginBottom="12" marginTop="4" />
                    <text text="===== 功能开关 =====" textSize="12sp" textColor="#FF9800" gravity="center" marginBottom="8" />
                    <horizontal marginBottom="8">
                        <checkbox id="chkCollectResource" text="采集+收集宝库" textSize="12sp" textColor="#FFFFFF" checked="true" layout_weight="1" />
                        <checkbox id="chkRemoveGrass" text="除草" textSize="12sp" textColor="#FFFFFF" checked="true" layout_weight="1" />
                    </horizontal>
                    <horizontal marginBottom="8">
                        <checkbox id="chkRemoveShield" text="移除护盾" textSize="12sp" textColor="#FFFFFF" layout_weight="1" />
                        <checkbox id="chkDonate" text="捐兵" textSize="12sp" textColor="#FFFFFF" layout_weight="1" />
                    </horizontal>
                    <horizontal marginBottom="8">
                        <checkbox id="chkAutoFish" text="打鱼" textSize="12sp" textColor="#FFFFFF" checked="true" layout_weight="1" />
                        <checkbox id="chkShowStats" text="显示统计" textSize="12sp" textColor="#FFFFFF" layout_weight="1" />
                    </horizontal>
                </vertical>
            </scroll>

            <scroll>
                <vertical padding="12" id="pageAccount">
                    <checkbox id="chkRememberAccount" text="账号记忆(从上次停止的账号继续)" textSize="12sp" textColor="#FFFFFF" checked="true" marginBottom="12" />
                    <horizontal marginBottom="8" gravity="center_vertical">
                        <text text="创建账号:" textSize="11sp" textColor="#FFFFFF" />
                        <input id="inputCreateFrom" text="1" inputType="number" textSize="12sp" textColor="#FFFFFF" bg="#37474F" w="40" padding="4" gravity="center" marginLeft="4" />
                        <text text="~" textSize="12sp" textColor="#FFFFFF" marginLeft="4" marginRight="4" />
                        <input id="inputCreateTo" text="7" inputType="number" textSize="12sp" textColor="#FFFFFF" bg="#37474F" w="40" padding="4" gravity="center" />
                        <button id="btnCreateAccounts" text="创建" textSize="11sp" bg="#4CAF50" textColor="#FFFFFF" w="60" h="36" marginLeft="auto" />
                    </horizontal>
                    <View bg="#455A64" h="1" marginBottom="12" marginTop="4" />
                    <checkbox id="chkImageTrain" text="使用图形造兵界面" textSize="11sp" textColor="#FFFFFF" marginBottom="12" />
                    <vertical id="accountListContainer">
                        <horizontal marginBottom="8" gravity="center_vertical">
                            <checkbox id="chkAcc1" text="账号1" textSize="11sp" textColor="#FFFFFF" />
                            <button id="btnSet1" text="设置" textSize="10sp" bg="#2196F3" textColor="#FFFFFF" w="50" h="32" marginLeft="8" />
                        </horizontal>
                        <horizontal marginBottom="8" gravity="center_vertical">
                            <checkbox id="chkAcc2" text="账号2" textSize="11sp" textColor="#FFFFFF" />
                            <button id="btnSet2" text="设置" textSize="10sp" bg="#2196F3" textColor="#FFFFFF" w="50" h="32" marginLeft="8" />
                        </horizontal>
                        <horizontal marginBottom="8" gravity="center_vertical">
                            <checkbox id="chkAcc3" text="账号3" textSize="11sp" textColor="#FFFFFF" />
                            <button id="btnSet3" text="设置" textSize="10sp" bg="#2196F3" textColor="#FFFFFF" w="50" h="32" marginLeft="8" />
                        </horizontal>
                        <horizontal marginBottom="8" gravity="center_vertical">
                            <checkbox id="chkAcc4" text="账号4" textSize="11sp" textColor="#FFFFFF" />
                            <button id="btnSet4" text="设置" textSize="10sp" bg="#2196F3" textColor="#FFFFFF" w="50" h="32" marginLeft="8" />
                        </horizontal>
                        <horizontal marginBottom="8" gravity="center_vertical">
                            <checkbox id="chkAcc5" text="账号5" textSize="11sp" textColor="#FFFFFF" />
                            <button id="btnSet5" text="设置" textSize="10sp" bg="#2196F3" textColor="#FFFFFF" w="50" h="32" marginLeft="8" />
                        </horizontal>
                    </vertical>
                </vertical>
            </scroll>

            <scroll>
                <vertical padding="12" id="pageSpecial">
                    <horizontal marginBottom="8" gravity="center_vertical">
                        <text id="txtAccountNote" text="账号1 详细设置" textSize="14sp" textColor="#2196F3" layout_weight="1" />
                        <button id="btnDeleteConfig" text="删除配置" textSize="10sp" bg="#FF5722" textColor="#FFFFFF" w="70" h="32" />
                    </horizontal>
                    <horizontal marginBottom="12">
                        <button id="btnPrevAccount" text="上一个号" textSize="12sp" bg="#37474F" textColor="#FFFFFF" layout_weight="1" h="36" />
                        <button id="btnNextAccount" text="下一个号" textSize="12sp" bg="#37474F" textColor="#FFFFFF" layout_weight="1" h="36" marginLeft="8" />
                    </horizontal>
                    <View bg="#455A64" h="1" marginBottom="12" marginTop="4" />

                    <text text="===== 造兵设置 =====" textSize="12sp" textColor="#FF9800" gravity="center" marginBottom="8" />
                    <horizontal marginBottom="8" gravity="center_vertical">
                        <text text="兵种住房:" textSize="13sp" textColor="#FFFFFF" w="80" />
                        <input id="inputTroopHousing" inputType="number" text="1" textSize="13sp" textColor="#FFFFFF" bg="#37474F" layout_weight="1" padding="8" />
                    </horizontal>
                    <horizontal marginBottom="8" gravity="center_vertical">
                        <text text="补兵次数:" textSize="13sp" textColor="#FFFFFF" w="80" />
                        <input id="inputTroopCount" inputType="number" text="20" textSize="13sp" textColor="#FFFFFF" bg="#37474F" layout_weight="1" padding="8" />
                    </horizontal>

                    <View bg="#455A64" h="1" marginBottom="12" marginTop="4" />
                    <text text="===== 打鱼设置 =====" textSize="12sp" textColor="#FF9800" gravity="center" marginBottom="8" />
                    <horizontal marginBottom="8" gravity="center_vertical">
                        <checkbox id="chkFishEnabled" text="打鱼" textSize="12sp" textColor="#FFFFFF" checked="true" />
                        <text text="每次循环打" textSize="12sp" textColor="#FFFFFF" marginLeft="8" />
                        <input id="inputFishCount" text="2" inputType="number" textSize="12sp" textColor="#FFFFFF" bg="#37474F" w="40" padding="4" gravity="center" marginLeft="4" />
                        <text text="次" textSize="12sp" textColor="#FFFFFF" marginLeft="4" />
                    </horizontal>
                    <horizontal marginBottom="8" gravity="center_vertical">
                        <text text="飘云超时:" textSize="11sp" textColor="#FFFFFF" />
                        <input id="inputCloudTimeout" text="80" inputType="number" textSize="12sp" textColor="#FFFFFF" bg="#37474F" w="50" padding="4" gravity="center" marginLeft="4" />
                        <text text="分钟后停止打鱼" textSize="11sp" textColor="#FFFFFF" marginLeft="4" />
                    </horizontal>
                </vertical>
            </scroll>
        </viewpager>

        <horizontal bg="#16213E" padding="12">
            <button id="btnExit" text="退出" textSize="14sp" bg="#607D8B" textColor="#FFFFFF" layout_weight="1" h="44" />
            <button id="btnContinue" text="保存并继续" textSize="14sp" bg="#2196F3" textColor="#FFFFFF" layout_weight="1" h="44" marginLeft="12" />
        </horizontal>
    </vertical>
);

// ==================== 初始化函数 ====================

function updateDeviceInfo() {
    try {
        var w = device.width || 720;
        var h = device.height || 1280;
        ui.txtDeviceInfo.setText("分辨率:" + w + "x" + h);
    } catch (e) {
        ui.txtDeviceInfo.setText("设备信息");
    }
}

function loadSettings() {
    // 基础配置
    ui.inputMinGold.setText(String(storage.get("minGold", config.minGold)));
    ui.inputMinElixir.setText(String(storage.get("minElixir", config.minElixir)));
    ui.inputMinDark.setText(String(storage.get("minDarkElixir", 0)));
    ui.inputTroopHousing.setText(String(storage.get("trainTroopHousing", config.trainTroopHousing)));
    ui.inputTroopCount.setText(String(storage.get("trainTroopCount", config.trainTroopCount)));

    var strategy = storage.get("troopStrategy", config.troopStrategy);
    if (strategy === "TWO_SIDES") {
        ui.spinnerStrategy.setSelection(1);
    } else if (strategy === "SINGLE_POINT") {
        ui.spinnerStrategy.setSelection(2);
    } else {
        ui.spinnerStrategy.setSelection(0);
    }

    var trainMode = storage.get("trainMode", config.trainMode);
    ui.spinnerTrainMode.setSelection(trainMode === "CUSTOM" ? 1 : 0);

    // 功能开关
    ui.chkCollectResource.setChecked(storage.get("collectResource", true));
    ui.chkRemoveGrass.setChecked(storage.get("removeGrass", true));
    ui.chkRemoveShield.setChecked(storage.get("removeShield", false));
    ui.chkDonate.setChecked(storage.get("donate", false));
    ui.chkAutoFish.setChecked(storage.get("autoFish", true));
    ui.chkShowStats.setChecked(storage.get("showStats", false));

    // 打鱼设置
    ui.chkFishEnabled.setChecked(storage.get("fishEnabled", true));
    ui.inputFishCount.setText(String(storage.get("fishLoopCount", 2)));
    ui.inputCloudTimeout.setText(String(storage.get("cloudTimeout", 80)));

    // 账号设置
    ui.chkRememberAccount.setChecked(storage.get("rememberAccount", true));
}

function saveSettings() {
    // 基础配置
    storage.put("minGold", parseInt(ui.inputMinGold.getText()) || 1000);
    storage.put("minElixir", parseInt(ui.inputMinElixir.getText()) || 1000);
    storage.put("minDarkElixir", parseInt(ui.inputMinDark.getText()) || 0);
    storage.put("trainTroopHousing", parseInt(ui.inputTroopHousing.getText()) || 1);
    storage.put("trainTroopCount", parseInt(ui.inputTroopCount.getText()) || 20);

    var strategyIndex = ui.spinnerStrategy.getSelectedItemPosition();
    var strategies = ["FOUR_SIDES", "TWO_SIDES", "SINGLE_POINT"];
    storage.put("troopStrategy", strategies[strategyIndex]);

    var trainModeIndex = ui.spinnerTrainMode.getSelectedItemPosition();
    storage.put("trainMode", trainModeIndex === 1 ? "CUSTOM" : "QUICK");

    // 功能开关
    storage.put("collectResource", ui.chkCollectResource.isChecked());
    storage.put("removeGrass", ui.chkRemoveGrass.isChecked());
    storage.put("removeShield", ui.chkRemoveShield.isChecked());
    storage.put("donate", ui.chkDonate.isChecked());
    storage.put("autoFish", ui.chkAutoFish.isChecked());
    storage.put("showStats", ui.chkShowStats.isChecked());

    // 打鱼设置
    storage.put("fishEnabled", ui.chkFishEnabled.isChecked());
    storage.put("fishLoopCount", parseInt(ui.inputFishCount.getText()) || 2);
    storage.put("cloudTimeout", parseInt(ui.inputCloudTimeout.getText()) || 80);

    // 账号设置
    storage.put("rememberAccount", ui.chkRememberAccount.isChecked());

    toast("配置已保存");
}

function resetSettings() {
    storage.clear();
    loadSettings();
    toast("已恢复默认配置");
}

function updateAccountDetail(index) {
    ui.txtAccountNote.setText("账号" + index + " 详细设置");
}

function switchTab(index) {
    currentTab = index;
    ui.pager.setCurrentItem(index);
    ui.tabHome.setTextColor(colors.parseColor(index === 0 ? "#2196F3" : "#B0BEC5"));
    ui.tabAccount.setTextColor(colors.parseColor(index === 1 ? "#2196F3" : "#B0BEC5"));
    ui.tabSpecial.setTextColor(colors.parseColor(index === 2 ? "#2196F3" : "#B0BEC5"));
}

// ==================== 事件绑定 ====================

ui.tabHome.on("click", function () { switchTab(0); });
ui.tabAccount.on("click", function () { switchTab(1); });
ui.tabSpecial.on("click", function () { switchTab(2); });

ui.pager.on("page_selected", function (index) {
    switchTab(index);
});

ui.btnStart.on("click", function () {
    saveSettings();
    toast("开始运行脚本...");
    engines.execScriptFile("./bot_core.js");
    ui.finish();
});

var autoRunSeconds = 43;
var autoRunTimer = null;

function startAutoRunTimer() {
    autoRunTimer = setInterval(function () {
        autoRunSeconds--;
        ui.run(function () {
            ui.btnAutoRun.setText(autoRunSeconds + "秒后自动运行");
        });
        if (autoRunSeconds <= 0) {
            clearInterval(autoRunTimer);
            ui.btnStart.click();
        }
    }, 1000);
}

ui.btnAutoRun.on("click", function () {
    if (autoRunTimer) {
        clearInterval(autoRunTimer);
        autoRunTimer = null;
        autoRunSeconds = 43;
        ui.btnAutoRun.setText("43秒后自动运行");
        toast("已取消自动运行");
    } else {
        startAutoRunTimer();
        toast("43秒后自动运行");
    }
});

ui.btnReset.on("click", function () {
    resetSettings();
});

ui.btnCreateAccounts.on("click", function () {
    var from = parseInt(ui.inputCreateFrom.getText()) || 1;
    var to = parseInt(ui.inputCreateTo.getText()) || 7;
    toast("账号范围: " + from + " 到 " + to);
});

ui.btnSet1.on("click", function () { currentAccountIndex = 1; switchTab(2); updateAccountDetail(1); });
ui.btnSet2.on("click", function () { currentAccountIndex = 2; switchTab(2); updateAccountDetail(2); });
ui.btnSet3.on("click", function () { currentAccountIndex = 3; switchTab(2); updateAccountDetail(3); });
ui.btnSet4.on("click", function () { currentAccountIndex = 4; switchTab(2); updateAccountDetail(4); });
ui.btnSet5.on("click", function () { currentAccountIndex = 5; switchTab(2); updateAccountDetail(5); });

ui.btnPrevAccount.on("click", function () {
    if (currentAccountIndex > 1) {
        currentAccountIndex--;
        updateAccountDetail(currentAccountIndex);
    }
});

ui.btnNextAccount.on("click", function () {
    if (currentAccountIndex < 7) {
        currentAccountIndex++;
        updateAccountDetail(currentAccountIndex);
    }
});

ui.btnDeleteConfig.on("click", function () {
    toast("删除账号" + currentAccountIndex + "配置");
});

ui.btnExit.on("click", function () {
    ui.finish();
});

ui.btnContinue.on("click", function () {
    saveSettings();
    ui.finish();
});

// ==================== 启动 ====================

updateDeviceInfo();
loadSettings();
