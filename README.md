# 🤖 CoC-AutoX (Android Native)

<p align="center">
  <strong>Next-Generation Clash of Clans Automation Client</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Android-green" alt="Platform">
  <img src="https://img.shields.io/badge/Language-Kotlin-purple" alt="Kotlin">
  <img src="https://img.shields.io/badge/Architecture-Jetpack%20Compose-blue" alt="Compose">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

---

## 📖 Project Overview

**CoC-AutoX** (Native Edition) is a complete rewrite of the original automation script, now built as a native Android application using **Kotlin** and **Jetpack Compose**.

This project aims to provide a robust, efficient, and user-friendly automation tool for Clash of Clans, leveraging modern Android APIs to eliminate the need for unstable shell commands or external script runners.

### ✨ Key Features (In Development)

- **🚫 No Root Required**: Utilizes `AccessibilityService` for simulating touches and gestures.
- **📸 High-Performance Vision**: Uses `MediaProjection` for screen capture and Google ML Kit/OpenCV for real-time image recognition.
- **🎨 Modern UI**: Built with Jetpack Compose for a responsive and intuitive Floating Window interface.
- **⚡ Native Performance**: optimized logic running directly on the JVM, avoiding JavaScript bridge overhead.

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Language** | Kotlin |
| **UI Framework** | Jetpack Compose |
| **Automation** | AccessibilityService |
| **Screen Capture** | MediaProjection API |
| **Architecture** | MVVM / Clean Architecture |
| **Build System** | Gradle (Agp 8.x) |

---

## 📂 Project Structure

```
coc-autox/
├── android-app/             # Android Project Root
│   ├── app/                 # App Module
│   │   ├── src/main/java/bot/jarvis/coc
│   │   │   ├── core/        # Bot Engine & State Machine
│   │   │   ├── service/     # Accessibility & Overlay Services
│   │   │   └── ui/          # Compose UI Components
│   │   └── src/main/res/    # Resources
│   ├── build.gradle         # Root Build Config
│   └── settings.gradle      # Project Settings
├── assets/                  # Shared Assets (Images/Icons)
├── .github/                 # CI/CD Workflows
└── README.md                # Documentation
```

---

## 🚀 Getting Started

### Prerequisites

- Android Studio Iguana or newer
- JDK 17
- Android Device (Android 8.0+)

### Building from Source

1. **Clone the repository**:
   ```bash
   git clone https://github.com/garyko0730/coc-autox.git
   cd coc-autox
   git checkout feature/android-migration
   ```

2. **Open in Android Studio**:
   - Select `Open` and choose the `android-app` directory.

3. **Build & Run**:
   - Connect your Android device via USB.
   - Run `adb devices` to ensure it's connected.
   - Click **Run 'app'** in Android Studio.

### Permissions

The app requires the following sensitive permissions to function:
- **Accessibility Service**: To perform clicks/swipes.
- **Overlay Window**: To display the floating control panel.
- **Media Projection**: To capture the screen for analysis.

---

## 🤝 Contributing

We welcome contributions! Please follow the steps below:

1. Fork the repository.
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request.

---

## ⚠️ Disclaimer

This tool is for educational purposes only. Automation of games may violate the Terms of Service of Supercell. **Use at your own risk.** We are not responsible for any account bans.

---

<p align="center">
  Made with ❤️ by the CoC-AutoX Team
</p>
