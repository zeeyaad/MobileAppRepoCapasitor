# Capacitor — Full Guide: Web App to Mobile App

> Convert your web application into a real native mobile app using Capacitor.
> This guide covers everything from first setup to publishing updates.

---

## Table of Contents

- [What is Capacitor?](#what-is-capacitor)
- [Prerequisites](#prerequisites)
- [Phase 1 — First Setup](#phase-1--first-setup)
- [Phase 2 — Make It Feel Native](#phase-2--make-it-feel-native)
- [Phase 3 — Edit Workflow (Daily Use)](#phase-3--edit-workflow-daily-use)
- [Phase 4 — Live Reload During Development](#phase-4--live-reload-during-development)
- [Phase 5 — Adding New Plugins](#phase-5--adding-new-plugins)
- [Phase 6 — Publishing Updates](#phase-6--publishing-updates)
- [Cheat Sheet](#cheat-sheet)
- [Project File Structure](#project-file-structure)
- [Common Mistakes](#common-mistakes)

---

## What is Capacitor?

Capacitor wraps your web app inside a **native WebView** and packages it as a real Android/iOS app. Unlike opening a website in a phone browser, a Capacitor app:

- Has **no address bar or browser chrome**
- Installs on the device **like a real app** (home screen icon, app drawer)
- Can be **published to Google Play Store and Apple App Store**
- Has access to **native device APIs** (camera, GPS, push notifications, etc.)

---

## Prerequisites

| Requirement | For |
|---|---|
| Node.js (v16+) | Both platforms |
| Android Studio | Android builds |
| JDK 11+ | Android builds |
| Xcode (macOS only) | iOS builds |
| Apple Developer Account | iOS publishing |
| Google Play Console Account | Android publishing |

---

## Phase 1 — First Setup

> Run these steps **once** when setting up the project for the first time.

### Step 1 — Install Capacitor

Run inside your existing web project folder:

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios

# Essential plugins for native feel
npm install @capacitor/status-bar @capacitor/splash-screen @capacitor/app @capacitor/keyboard
```

### Step 2 — Initialize Capacitor

```bash
npx cap init
```

It will ask you:
- **App name** — e.g. `My App`
- **App ID** — reverse domain format, must be unique — e.g. `com.yourname.myapp`

This creates `capacitor.config.ts`. Open it and configure it:

```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.myapp',
  appName: 'My App',
  webDir: 'dist',   // 'build' for CRA, 'out' for Next.js, 'dist' for Vite/Vue
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#000000',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    }
  }
};

export default config;
```

> **webDir values by framework:**
> - Vite / Vue → `dist`
> - Create React App → `build`
> - Next.js → `out`
> - Angular → `dist/your-app-name`

### Step 3 — Add Native Platforms

```bash
npx cap add android
npx cap add ios      # macOS + Xcode only
```

This creates `/android` and `/ios` folders in your project. **Do not delete them.**

### Step 4 — First Build & Sync

```bash
npm run build        # builds your web app to /dist (or /build)
npx cap sync         # copies web build into native projects + installs plugins
```

### Step 5 — Open in Android Studio / Xcode

```bash
npx cap open android   # opens Android Studio
npx cap open ios       # opens Xcode
```

Hit the **Run** button (play icon) to launch on a device or emulator.

> **Note:** Android Studio and Xcode only need to be reopened if you add new native plugins or change native config. For regular web edits, you never need to reopen them.

---

## Phase 2 — Make It Feel Native

This is what separates a real app from "a website opened in a phone."

### 2a — viewport meta tag (critical)

In your `index.html`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0,
  viewport-fit=cover, user-scalable=no">
```

`viewport-fit=cover` fills the entire screen including notches and home indicator areas.

### 2b — Status Bar Configuration

In your `main.ts` / `app.ts` / `App.tsx` (runs on app startup):

```typescript
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';

const initApp = async () => {
  // Make status bar transparent (overlays your content)
  await StatusBar.setStyle({ style: Style.Dark });
  await StatusBar.setBackgroundColor({ color: '#000000' });
  await StatusBar.setOverlaysWebView({ value: true });

  // Hide splash screen after app loads
  await SplashScreen.hide();
};

initApp();
```

### 2c — Safe Areas (Notch, Home Indicator)

In your global CSS:

```css
:root {
  --sat: env(safe-area-inset-top);
  --sab: env(safe-area-inset-bottom);
  --sal: env(safe-area-inset-left);
  --sar: env(safe-area-inset-right);
}

body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  overscroll-behavior: none;          /* disables rubber-band scroll */
  -webkit-overflow-scrolling: touch;
  user-select: none;                  /* disables text selection */
}
```

### 2d — Remove Web-Like Behaviors

```css
* {
  -webkit-tap-highlight-color: transparent;  /* removes blue tap flash */
  touch-action: manipulation;                /* faster tap response */
}

a, button {
  -webkit-touch-callout: none;  /* no long-press popups */
}

html, body {
  overflow: hidden;
  height: 100%;
}

#app {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
```

### 2e — Fix iOS Zoom on Input Focus

iOS zooms in when an input has `font-size < 16px`. Fix it:

```css
input, textarea, select {
  font-size: 16px;
}
```

### What Makes an App Feel Native — Summary

| Problem | Fix |
|---|---|
| Blue tap flash on buttons | `-webkit-tap-highlight-color: transparent` |
| Rubber-band bounce scroll | `overscroll-behavior: none` |
| Text selectable like a webpage | `user-select: none` |
| Content hidden behind notch | `env(safe-area-inset-*)` padding |
| Status bar overlaps your UI | `StatusBar.setOverlaysWebView()` |
| iOS zooms in on input focus | `font-size: 16px` on all inputs |
| Slow tap response | `touch-action: manipulation` |
| Long-press popup menus | `-webkit-touch-callout: none` |

---

## Phase 3 — Edit Workflow (Daily Use)

### The Golden Rule

Every time you edit your website and want the app to update, run:

```bash
npm run build && npx cap sync
```

That's it. **Two commands.** The first builds your web code, the second pushes it into the native app.

### Full Edit Cycle

```
Edit your code → npm run build → npx cap sync → Run on device
```

### When Do You Need to Reopen Android Studio / Xcode?

| Action | Need to reopen IDE? |
|---|---|
| Edited HTML / CSS / JavaScript | No — just `build + sync` |
| Changed a React / Vue component | No — just `build + sync` |
| Added a new Capacitor plugin | **Yes** — reopen IDE after sync |
| Changed `capacitor.config.ts` | **Yes** — reopen IDE after sync |
| Changed app icon or splash screen | **Yes** — reopen IDE after sync |
| Changed Android permissions | **Yes** |

---

## Phase 4 — Live Reload During Development

Live reload lets you see changes instantly on your phone without rebuilding every time.

### Step 1 — Start your dev server

```bash
npm run dev
# Note the URL it prints, e.g.: http://localhost:5173
```

### Step 2 — Set server URL in capacitor.config.ts

```typescript
// capacitor.config.ts — DEVELOPMENT ONLY
const config: CapacitorConfig = {
  appId: 'com.yourname.myapp',
  appName: 'My App',
  webDir: 'dist',
  server: {
    url: 'http://YOUR_COMPUTER_IP:5173',  // use your actual local IP, not localhost
    cleartext: true
  }
};
```

> **How to find your local IP:**
> - Windows: open CMD → `ipconfig` → look for IPv4 Address
> - Mac/Linux: `ifconfig` or `ip addr`
>
> Both your computer and phone must be on the **same WiFi network**.

### Step 3 — Sync and run

```bash
npx cap sync
npx cap run android   # or: npx cap open android and hit Run
```

Now every file save reflects on your device instantly.

### Step 4 — Remove server URL before production

**Critical:** Before building for release, remove the `server` block:

```typescript
// capacitor.config.ts — PRODUCTION (no server block)
const config: CapacitorConfig = {
  appId: 'com.yourname.myapp',
  appName: 'My App',
  webDir: 'dist',
  // No server block here!
};
```

> If you forget this, your production app will try to load from your laptop's IP and show a blank screen for all users.

---

## Phase 5 — Adding New Plugins

```bash
# Example: adding the camera plugin
npm install @capacitor/camera
npx cap sync             # syncs plugin to native projects
npx cap open android     # must reopen IDE after adding plugins
```

### Popular Capacitor Plugins

| Plugin | Install |
|---|---|
| Camera | `@capacitor/camera` |
| Push Notifications | `@capacitor/push-notifications` |
| Geolocation | `@capacitor/geolocation` |
| Local Notifications | `@capacitor/local-notifications` |
| Filesystem | `@capacitor/filesystem` |
| Preferences (storage) | `@capacitor/preferences` |
| Share | `@capacitor/share` |
| Network | `@capacitor/network` |
| Haptics | `@capacitor/haptics` |
| Browser | `@capacitor/browser` |

> Always run `npx cap sync` (not just `npx cap copy`) after installing a new plugin.
> `cap sync` = `cap copy` + `cap update` combined.

---

## Phase 6 — Publishing Updates

### Step 1 — Prepare production build

Make sure `capacitor.config.ts` has **no** `server.url`, then:

```bash
npm run build
npx cap sync
```

### Step 2 — Bump the version number

Every update pushed to the stores needs a higher version number.

**Android** — edit `android/app/build.gradle`:

```gradle
android {
  defaultConfig {
    versionCode 2           // increment by 1 each release
    versionName "1.1.0"     // human-readable version
  }
}
```

**iOS** — in Xcode:
- Click your project name → General → Version (e.g. `1.1.0`) and Build (e.g. `2`)

### Step 3 — Build release APK / IPA

**Android:**
```bash
npx cap open android
# In Android Studio: Build → Generate Signed Bundle/APK
# Choose Android App Bundle (.aab) for Play Store
```

**iOS:**
```bash
npx cap open ios
# In Xcode: Product → Archive → Distribute App
```

Upload `.aab` to Google Play Console and `.ipa` via Xcode / Transporter to App Store Connect.

### Step 4 — Live Updates Without Store Review (Optional)

For small web-only changes (CSS, JS, content), you can push updates to users instantly without a new store submission using **Capgo**:

```bash
npm install @capgo/capacitor-updater
npx cap sync
npx @capgo/cli bundle upload   # deploy update instantly
```

> Live updates only work for web layer changes (HTML/CSS/JS).
> Changes that require native code (new plugins, permissions) still need a store release.

---

## Cheat Sheet

### Daily Commands

| Situation | Command |
|---|---|
| I edited my web code | `npm run build && npx cap sync` |
| I added a new plugin | `npm install [plugin]` → `npx cap sync` → reopen IDE |
| I want live reload on device | Set `server.url` → `npx cap sync` → run app |
| I want to test on emulator | `npx cap run android` or `npx cap run ios` |
| I changed `capacitor.config.ts` | `npx cap sync` → reopen IDE |
| I want to publish an update | Remove `server.url` → build → sync → bump version → archive |

### cap sync vs cap copy — What's the difference?

| Command | What it does |
|---|---|
| `npx cap sync` | Copies web build + updates native plugins. **Use this always.** |
| `npx cap copy` | Only copies web build. Does not update plugins. |
| `npx cap update` | Only updates plugins. Does not copy web build. |

### 3 Most Common Scenarios

**Scenario 1 — You edited CSS or a component:**
```bash
npm run build && npx cap sync
# then run on your device/emulator
```

**Scenario 2 — You added a new Capacitor plugin:**
```bash
npm install @capacitor/camera
npx cap sync
npx cap open android   # must reopen IDE
```

**Scenario 3 — You want live reload while coding:**
```bash
# Terminal 1 — keep running
npm run dev

# Add to capacitor.config.ts
# server: { url: 'http://192.168.1.X:5173', cleartext: true }

# Terminal 2
npx cap sync && npx cap run android
```

---

## Project File Structure

```
your-project/
├── src/                      # your web source code (you work here)
├── dist/                     # web build output (auto-generated, don't edit)
├── android/                  # Android native project
│   └── app/
│       └── src/main/
│           └── assets/public/  # where your web build gets copied to
├── ios/                      # iOS native project
│   └── App/
│       └── public/           # where your web build gets copied to
├── capacitor.config.ts       # Capacitor configuration
├── package.json
└── README.md
```

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| Running `npx cap sync` without building first | Always run `npm run build` before `npx cap sync` |
| Forgetting to remove `server.url` before release | Remove `server` block from config before production build |
| Using `localhost` instead of local IP for live reload | Use your machine's actual IP (e.g. `192.168.1.5`) |
| Not reopening IDE after adding a plugin | After `npm install [plugin] + cap sync`, always reopen Android Studio/Xcode |
| Forgetting to bump versionCode before publishing | Increment `versionCode` in `build.gradle` (Android) and Build number (iOS) |
| Inputs zooming in on iOS | Set `font-size: 16px` on all `input`, `textarea`, `select` elements |

---

## Quick Reference Card

```
FIRST TIME SETUP:
  npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
  npx cap init
  npx cap add android
  npx cap add ios
  npm run build && npx cap sync
  npx cap open android

EVERY TIME YOU EDIT:
  npm run build && npx cap sync

DEVELOPMENT (LIVE RELOAD):
  npm run dev
  [set server.url in capacitor.config.ts]
  npx cap sync && npx cap run android

BEFORE PUBLISHING:
  [remove server.url from config]
  npm run build && npx cap sync
  [bump versionCode + versionName]
  npx cap open android → Build Signed APK/AAB
```

---

*Generated with Capacitor — https://capacitorjs.com*
