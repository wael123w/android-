# PHP 8.2+ Backend Documentation

### Directory Structure
```
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
```

### Key Security Features
- **Prepared Statements:** 100% of queries use PDO parameterized executions.
- **JWT Cryptography:** HMAC-SHA256 tokens with configurable expiration and base64url encoding.
- **Bcrypt Hashing:** `password_hash()` with automatic computational cost calibration.
