import { AppSpec } from '../../types';

export class DocGenerator {
  public static generateDocs(spec: AppSpec): Record<string, string> {
    const docs: Record<string, string> = {};
    const app = spec.appName;
    const pkg = spec.packageName;

    // 1. README.md
    docs['README.md'] = `# ${app}
> Built with **AppForge AI — AI Android App Factory**

**Package Name:** \`${pkg}\`  
**Version:** \`${spec.version}\` (Code: \`${spec.versionCode}\`)  
**Backend:** PHP 8.2+ REST API  
**Database:** MySQL 8.0+ / MariaDB 10.5+  
**Mobile:** Flutter 3.2+ (Dart)  
**Administration:** Standalone PHP + Tailwind CSS Admin Panel  

---

## 🚀 Quick Deployment Guide

### 1. Database Setup
1. Open cPanel / phpMyAdmin or your MySQL CLI.
2. Create a new database (e.g. \`${pkg.replace(/[^a-zA-Z0-9]/g, '_')}_db\`).
3. Import \`database/database.sql\`.
4. Initial administrator login:
   - **Email:** \`admin@appforge.local\`
   - **Password:** \`Admin@123456\`

### 2. Backend API Setup
1. Upload the contents of \`backend/\` to your web server (e.g. \`/public_html/api\` or subdomain).
2. Configure credentials in \`backend/config/database.php\` or set environment variables:
   - \`DB_HOST\` (default: \`127.0.0.1\`)
   - \`DB_NAME\`
   - \`DB_USER\`
   - \`DB_PASS\`
3. Verify by visiting \`https://yourdomain.com/api\` in your browser.

### 3. Admin Panel Setup
1. Upload \`admin/\` folder to your server.
2. Visit \`https://yourdomain.com/admin\` and login with the admin credentials.
3. Configure your app settings, branding colors, and payment gateway keys in **Settings**.

### 4. Android App (Flutter)
1. Ensure Flutter SDK 3.22+ and Android SDK 34 are installed.
2. Navigate to \`android/\`:
   \`\`\`bash
   cd android
   flutter pub get
   \`\`\`
3. Update \`lib/core/config/app_config.dart\` with your live backend API URL.
4. Run in debug mode:
   \`\`\`bash
   flutter run
   \`\`\`
5. Build production Release APK or App Bundle:
   \`\`\`bash
   flutter build apk --release
   flutter build appbundle --release
   \`\`\`
`;

    // 2. Architecture.md
    docs['docs/Architecture.md'] = `# Architecture Overview: ${app}

\`\`\`
┌────────────────────────────────────────────────────────┐
│                     Client Tier                        │
│          Flutter Mobile App (Android / iOS)            │
│       - Material 3 Design & Dynamic Custom Theme       │
│       - Secure SharedPreferences Token Vault           │
│       - REST HTTP Client with Auto-Auth Interceptors   │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS JSON / Multipart
┌───────────────────────────▼────────────────────────────┐
│                    API Gateway                         │
│           PHP 8.2+ Standalone Front Router             │
│       - CORS Origin & Preflight Validation             │
│       - JWT Authentication & Role-Based Middleware     │
│       - MIME & Payload Validation Guards               │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
┌─────────────▼──────────────┐  ┌──────────▼─────────────┐
│    Admin Dashboard Panel   │  │   MySQL Database Core  │
│  - PHP + Tailwind CSS      │  │  - InnoDB UTF8MB4      │
│  - Modular CRUD Pages      │  │  - Normalized Tables   │
│  - Content CMS & Payments  │  │  - Foreign Key Cascades│
└────────────────────────────┘  └────────────────────────┘
\`\`\`

### Architectural Principles:
1. **Zero Vendor Lock-in:** Completely self-hosted PHP + MySQL. Works flawlessly on any budget cPanel, shared host, or VPS.
2. **Strict Separation of Concerns:** Secret API keys (Stripe, PayPal, DB passwords) are strictly retained on the backend and NEVER packaged into the mobile APK.
3. **Modular Scalability:** Each business domain is encapsulated in its own tables, endpoints, and Flutter features.
`;

    // 3. AI-System.md
    docs['docs/AI-System.md'] = `# AI Pipeline & Requirement Analyzer

AppForge AI employs a deterministic multi-stage synthesis pipeline:

1. **Requirement Analysis:** Natural language input is parsed by Gemini 3.8 Flash into a normalized \`app-spec.json\`.
2. **Schema Synthesis:** Automatic entity relational derivation generates third normal form (3NF) relational tables with appropriate data types and index keys.
3. **API Contract Generation:** REST endpoints are aligned with user permission tiers (Admin, Moderator, Customer).
4. **Dart / Flutter Generation:** Native widgets, state controllers, and network models are produced matching the spec.
5. **Auto Error Repair:** Build output logs are fed into the AI error analyzer. Identified faults are repaired in-place and re-compiled up to 5 attempts automatically.
`;

    // 4. Android.md
    docs['docs/Android.md'] = `# Android Application (Flutter) Specification

- **Framework:** Flutter 3.2+
- **Minimum SDK:** API Level 24 (Android 7.0 Nougat)
- **Target SDK:** API Level 34 (Android 14)
- **Architecture:** Clean Feature-First Architecture
  - \`lib/core/\`: Network client, config constants, theme engine
  - \`lib/features/\`: Modular presentation screens and viewmodels
  - \`lib/features/auth/\`: JWT login and registration flows
  - \`lib/features/home/\`: Dynamic banners, search trigger, and item grids
  - \`lib/features/details/\`: Rich product cards and action CTA
  - \`lib/features/checkout/\`: Multi-gateway payment selector
`;

    // 5. Backend.md
    docs['docs/Backend.md'] = `# PHP 8.2+ Backend Documentation

### Directory Structure
\`\`\`
backend/
├── config/
│   ├── cors.php
│   ├── database.php
│   └── jwt.php
├── controllers/
│   ├── AuthController.php
│   ├── BaseController.php
│   └── EntityController.php
├── middleware/
│   └── AuthMiddleware.php
├── services/
│   ├── FileUploadService.php
│   └── PaymentService.php
└── index.php
\`\`\`

### Key Security Features
- **Prepared Statements:** 100% of queries use PDO parameterized executions.
- **JWT Cryptography:** HMAC-SHA256 tokens with configurable expiration and base64url encoding.
- **Bcrypt Hashing:** \`password_hash()\` with automatic computational cost calibration.
`;

    // 6. Admin.md
    docs['docs/Admin.md'] = `# Admin Panel Documentation

The administration system is located at \`/admin\` and does not require complex build steps or node modules on the hosting server.

### Features
- **Authentication Guard:** Protected by session tokens and database role checks (\`role_id = 1\`).
- **Dynamic Entity CRUD:** Browse, search, filter, approve, reject, and delete records.
- **CMS Manager:** Instant editing of Privacy Policy, Terms of Service, and About Us pages.
- **Payment Keys Manager:** Safely store Stripe and PayPal production or sandbox keys in the database.
`;

    // 7. Database.md
    docs['docs/Database.md'] = `# Database Schema Reference

### Generated Tables
${spec.tables.map(t => `- **\`${t.name}\`**: ${t.description} (${t.columns.length} columns)`).join('\n')}

### Migrations
Migration scripts reside in \`database/migrations/\` and allow painless non-destructive database updates when you expand your application with new modules.
`;

    // 8. Payments.md
    docs['docs/Payments.md'] = `# Payment System Architecture

### Supported Gateways
1. **Stripe:** Direct PaymentIntents API execution on the backend server.
2. **PayPal:** PayPal v2 Orders API.
3. **Manual Bank Wire:** Generates payment reference codes and allows admin approval in the panel.

> 🔒 **Security Notice:** The mobile application receives only temporary client tokens or approval URLs. Your Stripe Secret Key and PayPal Secret are never bundled into the APK.
`;

    // 9. Deployment.md
    docs['docs/Deployment.md'] = `# Deployment Guide

### Shared Hosting / cPanel
1. Compress \`backend/\` and \`admin/\` into a ZIP archive.
2. Upload via cPanel File Manager into \`public_html\`.
3. Create a MySQL database and user in cPanel MySQL Database Wizard.
4. Import \`database/database.sql\` via phpMyAdmin.
5. Edit \`backend/config/database.php\` with your database name, user, and password.

### VPS / Nginx or Apache
Ensure PHP 8.2 and \`php8.2-pdo-mysql\`, \`php8.2-fileinfo\` are installed and active.
`;

    // 10. GooglePlay.md
    docs['docs/GooglePlay.md'] = `# Google Play Store Publishing Preparation

### Checklist for Google Play Console:
1. **Target SDK:** Ensure targetSdkVersion is 34 (configured in \`android/app/build.gradle\`).
2. **Android App Bundle (.aab):** Run \`flutter build appbundle --release\`.
3. **Privacy Policy:** Published at \`https://yourdomain.com/api/pages/privacy-policy\` (generated automatically by AppForge).
4. **Feature Graphic & Icon:** 512x512 PNG app icon, 1024x500 PNG banner.
5. **App Access:** Provide credentials for reviewer testing:
   - Account: \`reviewer@${pkg.split('.')[1] || 'app'}.com\`
   - Password: \`TestReviewer123!\`
`;

    // 11. Security.md
    docs['docs/Security.md'] = `# Security Architecture & Hardening

1. **SQL Injection Defense:** All queries without exception use PDO prepared statements.
2. **XSS Protection:** Admin outputs and page content undergo strict \`htmlspecialchars()\` escaping.
3. **MIME Type Sniffing Prevention:** \`finfo(FILEINFO_MIME_TYPE)\` verifies actual file byte headers on upload.
4. **CORS Governance:** Strict Origin and Header enforcement.
5. **Secrets Storage:** Zero hardcoded API secrets in frontend or mobile source code.
`;

    return docs;
  }
}
