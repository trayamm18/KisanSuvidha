# ⚙️ Installation & Local Setup Guide

This guide details the step-by-step setup required to run the **Kisan Suvidha** mobile application locally in development mode or build it for production.

---

## 📋 Prerequisites

Ensure you have the following installed on your local development machine:
1. **Node.js** (v18.0 or higher recommended)
2. **npm** (comes with Node.js) or **Yarn**
3. **Expo Go** app installed on your physical mobile device (iOS/Android) for scanning testing QR codes, OR configure:
   * **Android Studio** (with an active Android Emulator configured)
   * **Xcode** (macOS only, with an active iOS Simulator configured)
4. **Git** version control system

---

## 🛠️ Step-by-Step Installation

### 1. Clone the Repository
```bash
git clone https://github.com/trayamm18/KisanSuvidha.git
cd KisanSuvidha
```

### 2. Install Project Dependencies
Run the installation command at the project root to fetch React Native, Firebase, and UI packages:
```bash
npm install
# or
yarn install
```

This will automatically install crucial dependencies:
* `@react-native-firebase/app` & `@react-native-firebase/auth` (Firebase services)
* `@react-native-community/netinfo` (Network status mapping)
* `expo-haptics` (Physical click feedback)
* `expo-router` (Dynamic navigation)
* `react-native-reanimated` & `react-native-chart-kit`

---

## 🔑 Firebase Configuration Setup

Because Kisan Suvidha utilizes Firebase for authentication and database management, you must configure your native configuration credentials.

### 1. Android Configuration
1. Register a project in the [Firebase Console](https://console.firebase.google.com/).
2. Add an Android Application to the Firebase project using the package name `com.kisansuvidha.app`.
3. Download the generated `google-services.json` file.
4. Place `google-services.json` directly into the **root** folder of your cloned project:
   ```
   KisanSuvidha/
   ├── google-services.json  <-- Place here
   ├── package.json
   └── ...
   ```
   *(Note: This file is ignored by Git in `.gitignore` to prevent secret exposure).*

### 2. Cloudinary Upload Configuration
If configuring image uploads for crops or avatars:
1. Register a free account on [Cloudinary](https://cloudinary.com/).
2. Create an **unsigned upload preset** named `unsigned_kisan` in your Cloudinary upload settings.
3. Configure your unique cloud name. In development, the application uploads using the preset configuration defined in `utils/cloudinaryUpload.js`.

---

## 🚀 Running the App Locally

Once dependencies and Firebase settings are configured, launch the Expo bundler:

```bash
npx expo start
```

### Testing Options
* **Physical Device**: Open the camera (iOS) or the Expo Go app (Android) and scan the QR code displayed in your terminal. Ensure your phone and PC are on the same Wi-Fi network.
* **Android Emulator**: Press **a** in the terminal to automatically boot and install the app on your running Android simulator.
* **iOS Simulator**: Press **i** in the terminal to run on your local iOS simulator.
* **Metro Console**: Press **r** to reload the bundle or **d** to open developer options.
