// UI 样式常量
// 参考爱玩 CoC 脚本界面设计

const COLORS = {
    // 主题色
    primary: "#2196F3",      // 蓝色按钮
    primaryDark: "#1976D2",  // 深蓝
    accent: "#4CAF50",       // 绿色强调
    accentLight: "#81C784",  // 浅绿

    // 背景
    background: "#1A1A2E",   // 深色背景
    surface: "#16213E",      // 卡片背景
    overlay: "#0F3460",      // 遮罩层

    // 文字
    textPrimary: "#FFFFFF",  // 主要文字
    textSecondary: "#B0BEC5", // 次要文字
    textHint: "#78909C",     // 提示文字

    // 功能色
    success: "#4CAF50",      // 成功/运行中
    warning: "#FF9800",      // 警告
    error: "#F44336",        // 错误
    info: "#2196F3",         // 信息

    // 按钮色
    btnGreen: "#4CAF50",     // 开始运行
    btnPink: "#E91E63",      // 自动运行倒计时
    btnBlue: "#2196F3",      // 设置按钮
    btnGray: "#607D8B",      // 退出按钮
    btnOrange: "#FF5722",    // 删除/警告按钮

    // 边框
    border: "#37474F",
    divider: "#455A64"
};

const SIZES = {
    // 字体大小 (sp)
    titleLarge: 18,
    titleMedium: 16,
    body: 14,
    caption: 12,
    small: 10,

    // 边距 (dp)
    paddingLarge: 16,
    paddingMedium: 12,
    paddingSmall: 8,
    paddingTiny: 4,

    // 按钮
    btnHeight: 40,
    btnHeightSmall: 32,

    // 输入框
    inputHeight: 40,

    // 圆角
    radiusLarge: 8,
    radiusMedium: 4,
    radiusSmall: 2
};

const STYLES = {
    // 标签页按钮样式
    tabActive: {
        textColor: COLORS.primary,
        textSize: SIZES.titleMedium + "sp",
        bg: "transparent"
    },
    tabInactive: {
        textColor: COLORS.textSecondary,
        textSize: SIZES.titleMedium + "sp",
        bg: "transparent"
    },

    // 主按钮
    btnPrimary: {
        bg: COLORS.primary,
        textColor: COLORS.textPrimary,
        textSize: SIZES.body + "sp"
    },

    // 成功按钮
    btnSuccess: {
        bg: COLORS.btnGreen,
        textColor: COLORS.textPrimary,
        textSize: SIZES.body + "sp"
    },

    // 警告按钮
    btnWarning: {
        bg: COLORS.btnOrange,
        textColor: COLORS.textPrimary,
        textSize: SIZES.body + "sp"
    }
};

module.exports = {
    COLORS,
    SIZES,
    STYLES
};
