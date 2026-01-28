// 坐标拾取工具
// 用于获取屏幕坐标并自动转换为比例值

"ui";

var storage = storages.create("coc_point_picker");
var pickedPoints = [];

ui.layout(
    <vertical bg="#1A1A2E" padding="12">
        <text text="📍 坐标拾取工具" textSize="18sp" textColor="#2196F3" gravity="center" marginBottom="12" />

        <text text="使用方法：" textSize="14sp" textColor="#FF9800" marginBottom="4" />
        <text text="1. 点击【开始取点】进入取点模式" textSize="12sp" textColor="#FFFFFF" />
        <text text="2. 点击屏幕任意位置获取坐标" textSize="12sp" textColor="#FFFFFF" />
        <text text="3. 坐标会自动转换为比例值(0-1)" textSize="12sp" textColor="#FFFFFF" />
        <text text="4. 点击【复制代码】可复制坐标对象" textSize="12sp" textColor="#FFFFFF" marginBottom="12" />

        <View bg="#455A64" h="1" marginBottom="12" />

        <horizontal marginBottom="8">
            <button id="btnStartPick" text="开始取点" textSize="14sp" bg="#4CAF50" textColor="#FFFFFF" layout_weight="1" h="44" />
            <button id="btnClear" text="清空记录" textSize="14sp" bg="#FF5722" textColor="#FFFFFF" layout_weight="1" h="44" marginLeft="8" />
        </horizontal>

        <text text="设备信息:" textSize="12sp" textColor="#78909C" marginBottom="4" />
        <text id="txtDevice" text="" textSize="11sp" textColor="#4CAF50" marginBottom="8" />

        <text text="已拾取坐标 (比例值):" textSize="14sp" textColor="#FF9800" marginBottom="4" />
        <scroll layout_weight="1">
            <vertical id="pointList" />
        </scroll>

        <View bg="#455A64" h="1" marginTop="8" marginBottom="8" />

        <horizontal>
            <button id="btnCopy" text="复制代码" textSize="14sp" bg="#2196F3" textColor="#FFFFFF" layout_weight="1" h="44" />
            <button id="btnExit" text="退出" textSize="14sp" bg="#607D8B" textColor="#FFFFFF" layout_weight="1" h="44" marginLeft="8" />
        </horizontal>
    </vertical>
);

// 显示设备信息
var deviceWidth = device.width || 720;
var deviceHeight = device.height || 1280;
ui.txtDevice.setText("分辨率: " + deviceWidth + " x " + deviceHeight);

// 取点悬浮窗
var pickerWin = null;

function startPicking() {
    if (pickerWin) {
        return;
    }

    pickerWin = floaty.rawWindow(
        <frame id="picker" w="*" h="*" bg="#33000000" />
    );

    pickerWin.setTouchable(true);

    pickerWin.picker.setOnTouchListener(function (view, event) {
        if (event.getAction() === 0) { // ACTION_DOWN
            var rawX = event.getRawX();
            var rawY = event.getRawY();

            // 转换为比例值
            var ratioX = (rawX / deviceWidth).toFixed(3);
            var ratioY = (rawY / deviceHeight).toFixed(3);

            // 保存坐标
            var point = {
                raw: { x: Math.round(rawX), y: Math.round(rawY) },
                ratio: { x: parseFloat(ratioX), y: parseFloat(ratioY) }
            };
            pickedPoints.push(point);

            // 更新UI
            ui.run(function () {
                addPointToList(point, pickedPoints.length);
            });

            // 震动反馈
            device.vibrate(50);

            // 提示
            toast("坐标: " + ratioX + ", " + ratioY);
        }
        return true;
    });

    toast("取点模式已开启，点击屏幕获取坐标");
    ui.btnStartPick.setText("停止取点");
    ui.btnStartPick.attr("bg", "#E91E63");
}

function stopPicking() {
    if (pickerWin) {
        pickerWin.close();
        pickerWin = null;
    }
    ui.btnStartPick.setText("开始取点");
    ui.btnStartPick.attr("bg", "#4CAF50");
}

function addPointToList(point, index) {
    var row = ui.inflate(
        <horizontal bg="#37474F" padding="8" marginBottom="4">
            <text id="txtIndex" textSize="12sp" textColor="#2196F3" w="30" />
            <vertical layout_weight="1">
                <text id="txtRatio" textSize="12sp" textColor="#FFFFFF" />
                <text id="txtRaw" textSize="10sp" textColor="#78909C" />
            </vertical>
            <button id="btnDel" text="删" textSize="10sp" bg="#FF5722" textColor="#FFFFFF" w="40" h="32" />
        </horizontal>
        , ui.pointList, false);

    row.txtIndex.setText("#" + index);
    row.txtRatio.setText("{ x: " + point.ratio.x + ", y: " + point.ratio.y + " }");
    row.txtRaw.setText("原始: " + point.raw.x + ", " + point.raw.y);

    row.btnDel.on("click", function () {
        var idx = ui.pointList.indexOfChild(row);
        if (idx >= 0) {
            pickedPoints.splice(idx, 1);
            ui.pointList.removeView(row);
            refreshPointIndices();
        }
    });

    ui.pointList.addView(row);
}

function refreshPointIndices() {
    for (var i = 0; i < ui.pointList.getChildCount(); i++) {
        var child = ui.pointList.getChildAt(i);
        if (child && child.txtIndex) {
            child.txtIndex.setText("#" + (i + 1));
        }
    }
}

function generateCode() {
    if (pickedPoints.length === 0) {
        return "// 暂无坐标记录";
    }

    var code = "// 拾取的坐标点 (比例值)\n";
    code += "var POINTS = {\n";

    for (var i = 0; i < pickedPoints.length; i++) {
        var p = pickedPoints[i];
        code += "  point" + (i + 1) + ": { x: " + p.ratio.x + ", y: " + p.ratio.y + " }";
        if (i < pickedPoints.length - 1) {
            code += ",";
        }
        code += "\n";
    }

    code += "};\n";
    return code;
}

// 事件绑定
ui.btnStartPick.on("click", function () {
    if (pickerWin) {
        stopPicking();
    } else {
        startPicking();
    }
});

ui.btnClear.on("click", function () {
    pickedPoints = [];
    ui.pointList.removeAllViews();
    toast("已清空");
});

ui.btnCopy.on("click", function () {
    var code = generateCode();
    setClip(code);
    toast("代码已复制到剪贴板");
});

ui.btnExit.on("click", function () {
    stopPicking();
    ui.finish();
});

// 退出时关闭悬浮窗
ui.emitter.on("pause", function () {
    stopPicking();
});
