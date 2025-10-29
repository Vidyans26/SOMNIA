# 📱 Expo Go SDK 51 - Installation Guide

**⚠️ CRITICAL INFORMATION FOR ANDROID USERS**

SOMNIA requires **Expo Go SDK 51**. The Google Play Store version is **SDK 54** and **will NOT work**.

---

## 🤖 Android Installation (Required)

### Step 1: Download SDK 51 APK

**Download Link:** [https://expo.dev/go?sdkVersion=51&platform=android&device=true](https://expo.dev/go?sdkVersion=51&platform=android&device=true)

### Step 2: Install APK

1. **Enable Unknown Sources:**
   - Open Settings
   - Go to Security (or Apps & notifications → Advanced → Special app access)
   - Enable "Install unknown apps" for your browser

2. **Install APK:**
   - Open Downloads folder
   - Tap on `Expo Go - SDK 51.apk`
   - Tap "Install"
   - Wait for installation

3. **Verify Installation:**
   - Open Expo Go
   - You should see version info showing SDK 51

### Step 3: Trust the App (if needed)

Some Android versions require additional permission:
- Settings → Apps → Expo Go → Permissions
- Grant Camera and Microphone permissions

---

## 🍎 iOS Installation

### Simple Installation

**Download from App Store:** [https://apps.apple.com/app/expo-go/id982107779](https://apps.apple.com/app/expo-go/id982107779)

The App Store version supports SDK 51 natively. No special configuration needed!

---

## ✅ Verification

After installation:

1. **Open Expo Go**
2. **Check Version** - Should support SDK 51
3. **Grant Permissions** - Camera and Microphone
4. **Ready to Scan** - Look for QR code from `npx expo start`

---

## 🚨 Common Issues

### Issue: "SDK version mismatch"

**Problem:** You downloaded the wrong version

**Solution:**
- **Android:** Make sure you downloaded from [https://expo.dev/go?sdkVersion=51&platform=android&device=true](https://expo.dev/go?sdkVersion=51&platform=android&device=true)
- **iOS:** Update to latest App Store version

### Issue: "Can't install APK on Android"

**Problem:** Unknown sources blocked

**Solution:**
1. Settings → Security → Unknown sources → Enable
2. Or: Settings → Apps → Special access → Install unknown apps → Your browser → Allow

### Issue: "App not loading after scan"

**Problem:** Network connection or version issue

**Solution:**
1. Ensure phone and computer on same WiFi
2. Verify SDK 51 is installed
3. Try `npx expo start --tunnel`

---

## 📋 Quick Reference

| Platform | Download Link | Notes |
|----------|---------------|-------|
| **Android** | [SDK 51 APK](https://expo.dev/go?sdkVersion=51&platform=android&device=true) | ⚠️ Required - Don't use Play Store! |
| **iOS** | [App Store](https://apps.apple.com/app/expo-go/id982107779) | ✅ Works fine |

---

## 🔗 Official Resources

- **Expo Go Documentation:** https://docs.expo.dev/get-started/expo-go/
- **SDK 51 Release Notes:** https://expo.dev/changelog/2024/05-07-sdk-51
- **Expo Go Download Page:** https://expo.dev/go

---

## 🆘 Still Having Issues?

1. **Check SDK version:**
   - Open Expo Go
   - Look for version info
   - Should mention SDK 51

2. **Verify SOMNIA compatibility:**
   ```bash
   cd "somnia-app/SOMNIA app/Somnia"
   cat app.json | grep "sdkVersion"
   # Should show: "sdkVersion": "51.0.0"
   ```

3. **Check Expo CLI:**
   ```bash
   npx expo --version
   # Should be compatible with SDK 51
   ```

4. **Need help?**
   - Check [GitHub Issues](https://github.com/Vidyans26/SOMNIA/issues)
   - Read [SETUP.md](../docs/SETUP.md) troubleshooting section

---

## 🎯 Summary

**Android Users:**
- ✅ Download SDK 51 from: https://expo.dev/go?sdkVersion=51&platform=android&device=true
- ❌ Don't use Play Store (has SDK 54)
- ✅ Enable unknown sources to install APK
- ✅ Grant camera/microphone permissions

**iOS Users:**
- ✅ Download from App Store
- ✅ Works out of the box with SDK 51

**Everyone:**
- ✅ Scan QR code from `npx expo start`
- ✅ Grant permissions when prompted
- ✅ Enjoy SOMNIA! 😴

---

*Last Updated: October 29, 2025*  
*SOMNIA v1.0 - Mobile Setup Guide*  
*Team: Chimpanzini Bananini*
