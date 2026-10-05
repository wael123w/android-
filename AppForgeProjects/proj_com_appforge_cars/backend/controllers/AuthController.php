<?php
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
}