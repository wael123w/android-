<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/jwt.php';

class AuthMiddleware {
    public static function authenticate(): array {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
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
}