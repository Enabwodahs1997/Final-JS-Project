# Capacitor Mobile App Setup

Your Budget For Life web app has been successfully wrapped with Capacitor! 🎉

## What Was Done

✅ Installed Capacitor core, CLI, and Android platform  
✅ Created `capacitor.config.ts` configuration  
✅ Built your project and added Android platform  
✅ Added Capacitor scripts to `package.json`  
✅ Updated `.gitignore` to exclude platform folders

## Project Structure

```
FinalJSProject/
├── android/              # Android native project (git-ignored)
├── dist/                 # Built web assets
├── capacitor.config.ts   # Capacitor configuration
└── ...your existing files
```

## Available Commands

```bash
# Build and sync changes to Android
npm run cap:sync

# Open Android project in Android Studio
npm run cap:open:android

# Build, sync, and run on connected Android device
npm run cap:run:android
```

## Next Steps to Build Your APK

### 1. Install Android Studio

- Download from: https://developer.android.com/studio
- Install with default settings
- Open Android Studio and complete setup wizard

### 2. Open Your Project

```bash
npm run cap:open:android
```

This opens the Android project in Android Studio.

### 3. Configure Your App (Optional but Recommended)

**App Icon:**

- Place icon files in `android/app/src/main/res/mipmap-*` folders
- Or use Android Studio's Image Asset Studio: `Right-click res → New → Image Asset`

**App Name & ID:**

- Already configured in `capacitor.config.ts`:
  - App ID: `com.budgetforlife.app`
  - App Name: `Budget For Life`

**Permissions:**

- Located in: `android/app/src/main/AndroidManifest.xml`
- Current permissions are minimal (internet access only)

### 4. Build APK in Android Studio

**For Testing (Debug APK):**

1. In Android Studio: `Build → Build Bundle(s) / APK(s) → Build APK(s)`
2. Wait for build to complete
3. Find APK at: `android/app/build/outputs/apk/debug/app-debug.apk`
4. Install on your device for testing

**For Production (Signed Release APK):**

1. `Build → Generate Signed Bundle / APK`
2. Select `APK` → Next
3. Create a new keystore:
   - Click "Create new..."
   - Choose location and password
   - Fill in certificate info
   - **SAVE YOUR KEYSTORE FILE & PASSWORDS SECURELY!**
4. Select `release` build variant
5. Click Finish
6. Find APK at: `android/app/release/app-release.apk`

### 5. Test Your APK

- Install on Android device: `adb install app-release.apk`
- Or transfer file to device and install manually

## Development Workflow

When you make changes to your web app:

1. Edit your HTML/CSS/JS files as normal
2. Test in browser with `npm run dev`
3. When ready for mobile testing:
   ```bash
   npm run cap:sync
   ```
4. Reopen Android Studio or rebuild APK

## Important Notes

### Web vs Mobile

- Your Vercel deployment remains unchanged
- Capacitor creates a separate mobile build
- Both use the same source code

### localStorage

- Works the same on mobile as in browser
- Data is app-specific and persists until uninstalled

### Chart.js CDN

- Works fine in Capacitor (internet permission is included)
- Consider bundling Chart.js locally for offline use

### Privacy Policy & Terms

- ✅ Already added to your app
- Required for Google Play Store submission

## Troubleshooting

**Build errors in Android Studio:**

- Sync Gradle files: `File → Sync Project with Gradle Files`
- Clean build: `Build → Clean Project`, then rebuild

**Changes not showing in app:**

- Run `npm run cap:sync` after every code change
- Rebuild APK after syncing

**Android Studio not opening:**

- Make sure Android Studio is installed
- Add to PATH or use full path to studio executable

## Publishing to Google Play Store

After building your signed release APK, follow the Google Play Store submission process:

1. Create Developer Account ($25 one-time fee)
2. Prepare store listing and screenshots
3. Upload your signed APK
4. Complete questionnaires and policies
5. Submit for review

See your [privacy-policy.html](privacy-policy.html) and [terms-of-service.html](terms-of-service.html) for required documents.

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [App Signing Guide](https://developer.android.com/studio/publish/app-signing)

---

**Your app is ready to be built into an APK!** 🚀
