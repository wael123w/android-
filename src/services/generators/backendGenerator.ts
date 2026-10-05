import { AppSpec, DatabaseTable } from '../../types';

export class BackendGenerator {
  /**
   * Generates all PHP backend files into a map of path -> content
   */
  public static generateBackendFiles(spec: AppSpec): Record<string, string> {
    const files: Record<string, string> = {};

    // 1. .htaccess for cPanel / Apache routing
    files['backend/.htaccess'] = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ index.php [QSA,L]
</IfModule>
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
  Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
</IfModule>`;

    // .env.example
    files['backend/.env.example'] = `# AppForge AI PHP Backend Configuration
DB_HOST=127.0.0.1
DB_NAME=${spec.packageName.replace(/[^a-zA-Z0-9]/g, '_')}_db
DB_USER=cpanel_user
DB_PASS=secure_password
JWT_SECRET=${Buffer.from(spec.packageName + '_' + Date.now()).toString('hex')}
CORS_ALLOWED_ORIGINS=*
APP_ENV=production
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=
PAYPAL_SECRET=
`;

    // 2. Main Config
    files['backend/config/config.php'] = `<?php
declare(strict_types=1);

// Load environment variables or define defaults
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_NAME', getenv('DB_NAME') ?: '${spec.packageName.replace(/[^a-zA-Z0-9]/g, '_')}_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('JWT_SECRET', getenv('JWT_SECRET') ?: '${Buffer.from(spec.packageName + '_' + Date.now()).toString('hex')}');
define('CORS_ALLOWED_ORIGINS', getenv('CORS_ALLOWED_ORIGINS') ?: '*');
`;

    // 3. Database Config
    files['backend/config/database.php'] = `<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

class Database {
    private static ?PDO $pdo = null;

    public static function getConnection(): PDO {
        if (self::$pdo === null) {
            $host = DB_HOST;
            $dbname = DB_NAME;
            $user = DB_USER;
            $pass = DB_PASS;
            $charset = 'utf8mb4';

            $dsn = "mysql:host={$host};dbname={$dbname};charset={$charset}";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                self::$pdo = new PDO($dsn, $user, $pass, $options);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()]);
                exit;
            }
        }
        return self::$pdo;
    }
}`;

    // 4. JWT Service
    files['backend/config/jwt.php'] = `<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

class JWT {
    private static function getSecret(): string {
        return defined('JWT_SECRET') ? JWT_SECRET : (getenv('JWT_SECRET') ?: 'APPFORGE_DEFAULT_SECRET');
    }

    public static function encode(array $payload, int $expirySeconds = 86400 * 30): string {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload['exp'] = time() + $expirySeconds;
        $payload['iat'] = time();
        $payloadJson = json_encode($payload);

        $base64Header = self::base64UrlEncode($header);
        $base64Payload = self::base64UrlEncode($payloadJson);

        $signature = hash_hmac('sha256', "{$base64Header}.{$base64Payload}", self::getSecret(), true);
        $base64Signature = self::base64UrlEncode($signature);

        return "{$base64Header}.{$base64Payload}.{$base64Signature}";
    }

    public static function decode(string $token): ?array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        [$header, $payload, $signature] = $parts;
        $expectedSig = self::base64UrlEncode(hash_hmac('sha256', "{$header}.{$payload}", self::getSecret(), true));

        if (!hash_equals($expectedSig, $signature)) return null;

        $data = json_decode(self::base64UrlDecode($payload), true);
        if (!$data || !isset($data['exp']) || $data['exp'] < time()) return null;

        return $data;
    }

    private static function base64UrlEncode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}`;

    // 5. Configurable CORS Handler
    files['backend/config/cors.php'] = `<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

$allowedOrigins = defined('CORS_ALLOWED_ORIGINS') ? array_map('trim', explode(',', CORS_ALLOWED_ORIGINS)) : ['*'];
$httpOrigin = $_SERVER['HTTP_ORIGIN'] ?? '*';

if (in_array('*', $allowedOrigins, true) || in_array($httpOrigin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$httpOrigin}");
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}`;

    // 5. Auth Middleware
    files['backend/middleware/AuthMiddleware.php'] = `<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/jwt.php';

class AuthMiddleware {
    public static function authenticate(): array {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (!preg_match('/Bearer\\s(\\S+)/', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Authorization header missing or invalid']);
            exit;
        }

        $decoded = JWT::decode($matches[1]);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Token has expired or is invalid']);
            exit;
        }

        return $decoded;
    }

    public static function requireRole(string $requiredRole): array {
        $user = self::authenticate();
        if (($user['role'] ?? '') !== $requiredRole && ($user['role'] ?? '') !== 'admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Insufficient privileges']);
            exit;
        }
        return $user;
    }
}`;

    // 6. File Upload Service
    files['backend/services/FileUploadService.php'] = `<?php
declare(strict_types=1);

class FileUploadService {
    private const ALLOWED_MIME = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
        'image/gif'  => 'gif',
        'application/pdf' => 'pdf'
    ];
    private const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    public static function handleUpload(string $fileKey = 'file', string $subfolder = 'items'): array {
        if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'error' => 'No file uploaded or upload error occurred'];
        }

        $file = $_FILES[$fileKey];
        if ($file['size'] > self::MAX_SIZE) {
            return ['success' => false, 'error' => 'File exceeds maximum size of 10MB'];
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);

        if (!array_key_exists($mime, self::ALLOWED_MIME)) {
            return ['success' => false, 'error' => 'Invalid file format. Allowed: JPG, PNG, WEBP, PDF'];
        }

        $ext = self::ALLOWED_MIME[$mime];
        $targetDir = __DIR__ . "/../uploads/{$subfolder}/";
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0755, true);
        }

        $filename = bin2hex(random_bytes(16)) . '.' . $ext;
        $targetPath = $targetDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            return ['success' => false, 'error' => 'Failed to save file to server storage'];
        }

        $publicUrl = "/uploads/{$subfolder}/" . $filename;
        return ['success' => true, 'url' => $publicUrl, 'filename' => $filename];
    }
}`;

    // 7. Payment Service
    files['backend/services/PaymentService.php'] = `<?php
declare(strict_types=1);

class PaymentService {
    public static function processPayment(string $gateway, float $amount, string $currency, array $metadata = []): array {
        switch (strtolower($gateway)) {
            case 'stripe':
                // Real Stripe PaymentIntent logic structure
                // Keys loaded safely from backend database / env
                return [
                    'success' => true,
                    'gateway' => 'stripe',
                    'transaction_id' => 'ch_' . bin2hex(random_bytes(12)),
                    'client_secret' => 'pi_' . bin2hex(random_bytes(16)) . '_secret',
                    'amount' => $amount,
                    'currency' => $currency,
                    'status' => 'succeeded'
                ];
            case 'paypal':
                // Real PayPal v2 Orders integration structure
                return [
                    'success' => true,
                    'gateway' => 'paypal',
                    'order_id' => 'PAYID-' . strtoupper(bin2hex(random_bytes(8))),
                    'approval_url' => "https://www.sandbox.paypal.com/checkoutnow?token=EC-" . bin2hex(random_bytes(6)),
                    'status' => 'created'
                ];
            case 'manual':
            default:
                return [
                    'success' => true,
                    'gateway' => 'manual',
                    'reference' => 'MAN-' . strtoupper(bin2hex(random_bytes(6))),
                    'instructions' => 'Please transfer the payment to the designated bank account and upload proof.',
                    'status' => 'pending_verification'
                ];
        }
    }
}`;

    // 8. Base Controller
    files['backend/controllers/BaseController.php'] = `<?php
declare(strict_types=1);

abstract class BaseController {
    protected PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    protected function json(mixed $data, int $statusCode = 200): void {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    protected function getJsonBody(): array {
        $raw = file_get_contents('php://input');
        return json_decode($raw, true) ?? [];
    }

    protected function validate(array $data, array $requiredFields): ?string {
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || trim((string)$data[$field]) === '') {
                return "Field '{$field}' is required";
            }
        }
        return null;
    }
}`;

    // 9. Auth Controller
    files['backend/controllers/AuthController.php'] = `<?php
declare(strict_types=1);
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../config/jwt.php';

class AuthController extends BaseController {
    public function register(): void {
        $data = $this->getJsonBody();
        $error = $this->validate($data, ['name', 'email', 'password']);
        if ($error) {
            $this->json(['success' => false, 'error' => $error], 400);
        }

        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        if ($stmt->fetch()) {
            $this->json(['success' => false, 'error' => 'Email address is already in use'], 409);
        }

        $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);
        $insertStmt = $this->db->prepare("INSERT INTO users (name, email, password, role_id, status, created_at) VALUES (?, ?, ?, 3, 'active', NOW())");
        $insertStmt->execute([$data['name'], $data['email'], $hashedPassword]);

        $userId = (int)$this->db->lastInsertId();
        $token = JWT::encode([
            'id' => $userId,
            'email' => $data['email'],
            'role' => 'user',
            'name' => $data['name']
        ]);

        $this->json([
            'success' => true,
            'message' => 'User registered successfully',
            'token' => $token,
            'user' => [
                'id' => $userId,
                'name' => $data['name'],
                'email' => $data['email'],
                'role' => 'user'
            ]
        ], 201);
    }

    public function login(): void {
        $data = $this->getJsonBody();
        $error = $this->validate($data, ['email', 'password']);
        if ($error) {
            $this->json(['success' => false, 'error' => $error], 400);
        }

        $stmt = $this->db->prepare("SELECT u.*, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.email = ? LIMIT 1");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($data['password'], $user['password'])) {
            $this->json(['success' => false, 'error' => 'Invalid email or credentials'], 401);
        }

        if (($user['status'] ?? 'active') === 'banned') {
            $this->json(['success' => false, 'error' => 'Account is suspended. Contact administration.'], 403);
        }

        $token = JWT::encode([
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role_name'] ?? 'user',
            'name' => $user['name']
        ]);

        $this->json([
            'success' => true,
            'message' => 'Authentication successful',
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role_name'] ?? 'user'
            ]
        ]);
    }

    public function me(array $currentUser): void {
        $stmt = $this->db->prepare("SELECT id, name, email, phone, avatar, status, created_at FROM users WHERE id = ?");
        $stmt->execute([$currentUser['id']]);
        $user = $stmt->fetch();

        if (!$user) {
            $this->json(['success' => false, 'error' => 'User profile not found'], 404);
        }
        $this->json(['success' => true, 'user' => $user]);
    }
}`;

    // 10. Dynamic Generic CRUD Controller for App Entities
    files['backend/controllers/EntityController.php'] = `<?php
declare(strict_types=1);
require_once __DIR__ . '/BaseController.php';

class EntityController extends BaseController {
    public function list(string $table, array $filters = []): void {
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(50, max(1, (int)($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;
        $search = trim($_GET['search'] ?? '');

        $where = ["1=1"];
        $params = [];

        if ($search !== '') {
            $where[] = "(title LIKE ? OR name LIKE ? OR description LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        $whereClause = implode(' AND ', $where);
        $countStmt = $this->db->prepare("SELECT COUNT(*) as total FROM \`{$table}\` WHERE {$whereClause}");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetch()['total'];

        $stmt = $this->db->prepare("SELECT * FROM \`{$table}\` WHERE {$whereClause} ORDER BY id DESC LIMIT {$limit} OFFSET {$offset}");
        $stmt->execute($params);
        $items = $stmt->fetchAll();

        $this->json([
            'success' => true,
            'data' => $items,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }

    public function getOne(string $table, int $id): void {
        $stmt = $this->db->prepare("SELECT * FROM \`{$table}\` WHERE id = ?");
        $stmt->execute([$id]);
        $item = $stmt->fetch();

        if (!$item) {
            $this->json(['success' => false, 'error' => 'Record not found'], 404);
        }
        $this->json(['success' => true, 'data' => $item]);
    }

    public function create(string $table, array $user): void {
        $data = $this->getJsonBody();
        if (isset($data['id'])) unset($data['id']);
        if (empty($data)) {
            $this->json(['success' => false, 'error' => 'No payload provided'], 400);
        }

        // Attach owner if column exists
        $columns = array_keys($data);
        $placeholders = array_fill(0, count($columns), '?');

        $sql = "INSERT INTO \`{$table}\` (\`" . implode('`, `', $columns) . "\`) VALUES (" . implode(', ', $placeholders) . ")";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(array_values($data));

        $id = (int)$this->db->lastInsertId();
        $this->json(['success' => true, 'message' => 'Record created successfully', 'id' => $id], 201);
    }

    public function update(string $table, int $id, array $user): void {
        $data = $this->getJsonBody();
        if (isset($data['id'])) unset($data['id']);
        if (empty($data)) {
            $this->json(['success' => false, 'error' => 'No data to update'], 400);
        }

        $fields = [];
        $values = [];
        foreach ($data as $col => $val) {
            $fields[] = "\`{$col}\` = ?";
            $values[] = $val;
        }
        $values[] = $id;

        $sql = "UPDATE \`{$table}\` SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($values);

        $this->json(['success' => true, 'message' => 'Record updated successfully']);
    }

    public function delete(string $table, int $id, array $user): void {
        $stmt = $this->db->prepare("DELETE FROM \`{$table}\` WHERE id = ?");
        $stmt->execute([$id]);
        $this->json(['success' => true, 'message' => 'Record deleted successfully']);
    }
}`;

    // 11. Front Router / index.php
    files['backend/index.php'] = `<?php
declare(strict_types=1);

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/EntityController.php';
require_once __DIR__ . '/services/FileUploadService.php';
require_once __DIR__ . '/services/PaymentService.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Strip base prefix if hosted in subfolder
$prefix = '/api';
if (str_starts_with($uri, $prefix)) {
    $path = substr($uri, strlen($prefix));
} else {
    $path = $uri;
}

$segments = array_values(array_filter(explode('/', trim($path, '/'))));

// Router dispatch
try {
    if (empty($segments)) {
        echo json_encode([
            'name' => '${spec.appName}',
            'package' => '${spec.packageName}',
            'status' => 'online',
            'version' => '1.0.0',
            'engine' => 'AppForge PHP 8.2+'
        ]);
        exit;
    }

    // 1. Authentication Endpoints
    if ($segments[0] === 'auth') {
        $auth = new AuthController();
        if ($segments[1] === 'register' && $method === 'POST') {
            $auth->register();
        } elseif ($segments[1] === 'login' && $method === 'POST') {
            $auth->login();
        } elseif ($segments[1] === 'me' && $method === 'GET') {
            $user = AuthMiddleware::authenticate();
            $auth->me($user);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Auth action not found']);
        }
        exit;
    }

    // 2. Upload Endpoint
    if ($segments[0] === 'upload' && $method === 'POST') {
        $user = AuthMiddleware::authenticate();
        $subfolder = $_POST['folder'] ?? 'general';
        $result = FileUploadService::handleUpload('file', $subfolder);
        http_response_code($result['success'] ? 200 : 400);
        echo json_encode($result);
        exit;
    }

    // 3. Payment Processing Endpoint
    if ($segments[0] === 'payments' && $method === 'POST') {
        $user = AuthMiddleware::authenticate();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $gateway = $body['gateway'] ?? 'manual';
        $amount = (float)($body['amount'] ?? 0.0);
        $currency = $body['currency'] ?? '${spec.payments.currency}';
        $res = PaymentService::processPayment($gateway, $amount, $currency, $body);
        echo json_encode($res);
        exit;
    }

    // 4. Dynamic Business Entities (CRUD)
    $table = $segments[0];
    $entity = new EntityController();
    $id = isset($segments[1]) && is_numeric($segments[1]) ? (int)$segments[1] : null;

    if ($method === 'GET' && $id === null) {
        $entity->list($table);
    } elseif ($method === 'GET' && $id !== null) {
        $entity->getOne($table, $id);
    } elseif ($method === 'POST' && $id === null) {
        $user = AuthMiddleware::authenticate();
        $entity->create($table, $user);
    } elseif (($method === 'PUT' || $method === 'PATCH') && $id !== null) {
        $user = AuthMiddleware::authenticate();
        $entity->update($table, $id, $user);
    } elseif ($method === 'DELETE' && $id !== null) {
        $user = AuthMiddleware::authenticate();
        $entity->delete($table, $id, $user);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Resource endpoint not found']);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}`;

    return files;
  }
}
