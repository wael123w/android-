<?php
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
}