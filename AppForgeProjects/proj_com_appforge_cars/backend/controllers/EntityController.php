<?php
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
        $countStmt = $this->db->prepare("SELECT COUNT(*) as total FROM `{$table}` WHERE {$whereClause}");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetch()['total'];

        $stmt = $this->db->prepare("SELECT * FROM `{$table}` WHERE {$whereClause} ORDER BY id DESC LIMIT {$limit} OFFSET {$offset}");
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
        $stmt = $this->db->prepare("SELECT * FROM `{$table}` WHERE id = ?");
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

        $sql = "INSERT INTO `{$table}` (`" . implode('