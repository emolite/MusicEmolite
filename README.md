## Desktop Application (Tauri)

Run the desktop application in development mode:

```bash
npx tauri dev
```

Build the desktop application:

```bash
npx tauri build
```

The generated installers can be found in:

```text
src-tauri/target/release/bundle
```

## Mobile Application (Capacitor)

Build the Angular application:

```bash
ng build
```

Sync web assets with native projects:

```bash
npx cap sync
```

Open the Android project:

```bash
npx cap open android
```

Open the iOS project:

```bash
npx cap open ios
```

Use Android Studio or Xcode to build and deploy the mobile application.
