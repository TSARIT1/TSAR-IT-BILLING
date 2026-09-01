# TSAR IT BILLING ERP — ANDROID MOBILE APPLICATION

**App Package ID:** `com.tsarit.billing`  
**Version:** 4.0.0 Enterprise Release  
**Platform:** Native Android (Gradle + Java 17 + AndroidX) & Cross-Platform Hybrid UI

---

## 1. Features & Capabilities

* **100% Feature Parity with Web Portal**: Same design system, identical double-entry accounting formulas, GST engine, and data models.
* **All-Sector Indian Commerce**:
  - 🌾 Fertilizers & Agro Chemicals (NPK %, seed license, DBT subsidy)
  - 👗 Clothing & Garments (Size matrix XS-3XL, color swatches, 5%/12% GST slabs)
  - 📱 Electronics & Mobiles (Dual IMEI, serial number, brand warranty)
  - 🚛 Transport & Waybills (LR / Bilty, vehicle number, 12-digit E-Way Bill)
  - 🛒 Supermarkets & FMCG (Barcode scanner, weighing scale units g/kg)
* **Real-time Auto-Synchronization**:
  - Offline-first SQLite local caching (`OfflineDatabaseHelper.java` & `tsar_offline_sync_queue`).
  - Android `WorkManager` background worker (`AutoSyncWorker.java`) pushes offline bills & pulls server catalog changes automatically on network reconnect.
* **Native Device Hardware Integrations**:
  - Bluetooth & USB 58mm / 80mm ESC/POS Thermal Receipt Printer bridge.
  - Camera Barcode & QR Code Scanner bridge.
  - WhatsApp 1-Click Invoice & PDF sharing.

---

## 2. Building & Running the Android App

### Option A: Open in Android Studio
1. Launch **Android Studio**.
2. Click **Open Project** and select `d:\All in One Bill\All in One Bill Mobile App\android`.
3. Allow Gradle to sync dependencies (`androidx.appcompat`, `androidx.work`, `okhttp3`, `gson`).
4. Connect an Android phone (via USB with USB Debugging enabled) or start an Android Virtual Device (AVD).
5. Click **Run 'app'** (<kbd>Shift</kbd> + <kbd>F10</kbd>).

### Option B: Build APK from Command Line
```bash
cd "d:\All in One Bill\All in One Bill Mobile App\android"
./gradlew assembleDebug
```
The compiled debug APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 3. Server IP Configuration
In the Mobile App, open the **Sync** tab to configure your computer's local Wi-Fi IP address (e.g. `192.168.1.100`) to connect directly to the running Spring Boot backend on port `8081`. On the Android Emulator, `10.0.2.2:8081` is used automatically.
