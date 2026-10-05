<?php
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
            'name' => 'AutoForge Market',
            'package' => 'com.appforge.cars',
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
        $currency = $body['currency'] ?? 'USD';
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
}