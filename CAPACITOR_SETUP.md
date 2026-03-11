# Capacitor hybrid app (iOS & Android)

The Colletro web app is wrapped as a native app with [Capacitor](https://capacitorjs.com). The app **is** the app: it opens **https://colletro.com** inside a full-screen WebView, so you stay in the native app the whole time (no browser, no “redirect” to Safari/Chrome). Login and all features work as on the web (same cookies, same session). A native splash screen shows “Colletro” until the first page is ready.

## Prerequisites

- **iOS:** macOS with Xcode (for building and running on simulator/device).
- **Android:** Android Studio and JDK (for building and running on emulator/device).
- **Node:** Run `npm install` in the project root.

## How it works

- **Production:** The app opens `https://colletro.com` directly in the WebView. The user sees a native splash screen, then your Colletro UI—all inside the app. No redirect to a browser.
- **Development:** You can point the app at your local Next.js server. See “Development with live reload” below.

## Build and run

1. **Sync web assets and config into the native projects:**
   ```bash
   npm run cap:sync
   ```

2. **Open and run:**
   - **iOS:** `npm run cap:open:ios` (opens Xcode; run on simulator or device).
   - **Android:** `npm run cap:open:android` (opens Android Studio; run on emulator or device).

After the first redirect, the app shows your live site. Deploy changes to colletro.com as usual; app users get updates the next time the app loads the site (no app store release needed for web-only changes).

## Development with live reload

To test the app against your local Next.js dev server:

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. **iOS (simulator or device on same Wi‑Fi):**  
   Replace `localhost` with your Mac’s LAN IP (e.g. `192.168.1.5`) so the device can reach the dev server:
   ```bash
   CAPACITOR_DEV_SERVER=http://192.168.1.5:3000 npm run cap:sync
   npm run cap:open:ios
   ```

3. **Android (emulator):**  
   Use the special alias for the host machine:
   ```bash
   npm run cap:dev:android
   ```
   (Uses `http://10.0.2.2:3000` so the emulator can reach `localhost:3000` on your machine.)

4. **Android (physical device on same Wi‑Fi):**  
   Use your machine’s LAN IP:
   ```bash
   CAPACITOR_DEV_SERVER=http://192.168.1.5:3000 npm run cap:sync
   npm run cap:open:android
   ```

After syncing with `CAPACITOR_DEV_SERVER`, the app will load your local URL until you run `npm run cap:sync` again without that env var (then it goes back to the production redirect).

## Project layout

| Path | Purpose |
|------|--------|
| `capacitor.config.ts` | App id, name, `webDir`, optional dev server URL. |
| `capacitor-build/` | Minimal `webDir`: single `index.html` that redirects to colletro.com. |
| `ios/` | Xcode project (can be committed for CI/signing). |
| `android/` | Android Studio project (can be committed for CI/signing). |

## Changing the production URL

To point the app at a different URL (e.g. staging), edit `capacitor.config.ts`: set the `server.url` in the branch that runs when `CAPACITOR_DEV_SERVER` is not set (e.g. `'https://colletro.com'`). Then run `npm run cap:sync` and rebuild the native app.

## Store submission notes

- **iOS:** Configure signing in Xcode (Apple Developer account, bundle id `com.colletro.app`). Test on a real device before submitting.
- **Android:** Use the `android/` project; configure signing for release builds (e.g. in Android Studio or CI).
- The app is a WebView wrapper. Apple and Google allow this; ensure your web content works well on mobile (responsive layout, touch targets). You may want to add a status bar plugin (e.g. `@capacitor/status-bar`) or splash screen later.

## Optional next steps

- **Status bar:** `npm install @capacitor/status-bar` and set style (e.g. dark/light) in the native app.
- **Splash screen:** `@capacitor/splash-screen` for a branded launch screen.
- **Deep links:** Configure URL schemes or App Links so links like `colletro.com/collections/123` open in the app when installed.
- **Offline message:** The app needs the network to load colletro.com. You could add a custom error page or plugin to show a “no connection” message when the redirect fails.
