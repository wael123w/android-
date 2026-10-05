# Architecture Overview: AutoForge Market

```
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
```

### Architectural Principles:
1. **Zero Vendor Lock-in:** Completely self-hosted PHP + MySQL. Works flawlessly on any budget cPanel, shared host, or VPS.
2. **Strict Separation of Concerns:** Secret API keys (Stripe, PayPal, DB passwords) are strictly retained on the backend and NEVER packaged into the mobile APK.
3. **Modular Scalability:** Each business domain is encapsulated in its own tables, endpoints, and Flutter features.
