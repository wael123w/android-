# AutoForge Market
> Built with **AppForge AI — AI Android App Factory**

**Package Name:** `com.appforge.cars`  
**Version:** `1.0.0` (Code: `1`)  
**Backend:** PHP 8.2+ REST API  
**Database:** MySQL 8.0+ / MariaDB 10.5+  
**Mobile:** Flutter 3.2+ (Dart)  
**Administration:** Standalone PHP + Tailwind CSS Admin Panel  

---

## 🚀 Quick Deployment Guide

### 1. Database Setup
1. Open cPanel / phpMyAdmin or your MySQL CLI.
2. Create a new database (e.g. `com_appforge_cars_db`).
3. Import `database/database.sql`.
4. Initial administrator login:
   - **Email:** `admin@appforge.local`
   - **Password:** `Admin@123456`

### 2. Backend API Setup
1. Upload the contents of `backend/` to your web server (e.g. `/public_html/api` or subdomain).
2. Configure credentials in `backend/config/database.php` or set environment variables:
   - `DB_HOST` (default: `127.0.0.1`)
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASS`
3. Verify by visiting `https://yourdomain.com/api` in your browser.

### 3. Admin Panel Setup
1. Upload `admin/` folder to your server.
2. Visit `https://yourdomain.com/admin` and login with the admin credentials.
3. Configure your app settings, branding colors, and payment gateway keys in **Settings**.

### 4. Android App (Flutter)
1. Ensure Flutter SDK 3.22+ and Android SDK 34 are installed.
2. Navigate to `android/`:
   ```bash
   cd android
   flutter pub get
   ```
3. Update `lib/core/config/app_config.dart` with your live backend API URL.
4. Run in debug mode:
   ```bash
   flutter run
   ```
5. Build production Release APK or App Bundle:
   ```bash
   flutter build apk --release
   flutter build appbundle --release
   ```
