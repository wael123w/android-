<?php
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
}