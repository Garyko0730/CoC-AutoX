# 🤖 CoC-AutoX (Android 原生版)

<p align="center">
  <strong>下一代部落冲突自动化辅助客户端</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Android-green" alt="平台">
  <img src="https://img.shields.io/badge/Language-Kotlin-purple" alt="语言">
  <img src="https://img.shields.io/badge/Architecture-Jetpack%20Compose-blue" alt="架构">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="协议">
</p>

---

## 📖 项目概述

**CoC-AutoX** (原生版) 是原自动化脚本的完全重构版本，现在使用 **Kotlin** 和 **Jetpack Compose** 构建为原生的 Android 应用程序。

本项目旨在为《部落冲突》提供一个稳健、高效且用户友好的自动化工具，利用现代 Android API 消除对不稳定 Shell 命令或外部脚本运行器的依赖。

### ✨ 核心功能 (开发中)

- **🚫 无需 Root**: 利用 `AccessibilityService` 模拟点击和手势。
- **📸 高性能视觉**: 使用 `MediaProjection` 进行屏幕截取，结合 Google ML Kit/OpenCV 进行实时图像识别。
- **🎨 现代 UI**: 基于 Jetpack Compose 构建响应式且直观的悬浮窗控制面板。
- **⚡ 原生性能**: 优化逻辑直接在 JVM 上运行，避免 JavaScript 桥接开销。

---

## 🛠️ 技术栈

| 组件 | 技术选型 |
|------|----------|
| **语言** | Kotlin |
| **UI 框架** | Jetpack Compose |
| **自动化** | AccessibilityService |
| **屏幕截取** | MediaProjection API |
| **架构** | MVVM / Clean Architecture |
| **构建系统** | Gradle (Agp 8.x) |

---

## 📂 项目结构

```
coc-autox/
├── android-app/             # Android 项目根目录
│   ├── app/                 # App 模块
│   │   ├── src/main/java/bot/jarvis/coc
│   │   │   ├── core/        # 机器人引擎 & 状态机
│   │   │   ├── service/     # 无障碍 & 悬浮窗服务
│   │   │   └── ui/          # Compose UI 组件
│   │   └── src/main/res/    # 资源文件
│   ├── build.gradle         # 根构建配置
│   └── settings.gradle      # 项目设置
├── assets/                  # 共享资源 (图片/图标)
├── .github/                 # CI/CD 工作流
└── README.md                # 文档
```

---

## 🚀 快速开始

### 环境要求

- Android Studio Iguana 或更新版本
- JDK 17
- Android 设备 (Android 8.0+)

### 源码构建

1. **克隆仓库**:
   ```bash
   git clone https://github.com/garyko0730/coc-autox.git
   cd coc-autox
   git checkout feature/android-migration
   ```

2. **在 Android Studio 中打开**:
   - 选择 `Open` 并选择 `android-app` 目录。

3. **构建与运行**:
   - 通过 USB 连接您的 Android 设备。
   - 运行 `adb devices` 确保设备已连接。
   - 在 Android Studio 中点击 **Run 'app'**。

### 权限说明

应用需要以下敏感权限才能运行：
- **无障碍服务**: 用于执行点击/滑动操作。
- **悬浮窗**: 用于显示悬浮控制面板。
- **媒体投影**: 用于截取屏幕进行分析。

---

## 🤝 参与贡献

我们欢迎您的贡献！请遵循以下步骤：

1. Fork 本仓库。
2. 创建您的特性分支: `git checkout -b feature/AmazingFeature`
3. 提交您的更改: `git commit -m 'Add some AmazingFeature'`
4. 推送到分支: `git push origin feature/AmazingFeature`
5. 发起 Pull Request。

---

## ⚠️ 免责声明

本工具仅供学习和研究使用。游戏自动化可能违反 Supercell 的服务条款。**使用风险自负**。我们不对任何账号封禁负责。

---

<p align="center">
  Made with ❤️ by the CoC-AutoX Team
</p>
