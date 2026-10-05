<?php
session_start();
require_once __DIR__ . '/../backend/config/database.php';
if (!isset($_SESSION['admin_user'])) { header("Location: index.php"); exit; }

$db = Database::getConnection();
$pageSlug = $_GET['page'] ?? '';

// Find target configuration
$pagesConfig = [{"slug":"users","title":"User Management","module":"auth","icon":"users","table":"users","supportsCreate":true,"supportsEdit":true,"supportsDelete":true,"supportsExport":true,"searchColumns":["name","email"]},{"slug":"cars","title":"Cars Catalog","module":"cars","icon":"car","table":"cars","supportsCreate":true,"supportsEdit":true,"supportsDelete":true,"supportsExport":true,"supportsApproval":true,"searchColumns":["title"]},{"slug":"categories","title":"Categories","module":"catalog","icon":"tags","table":"categories","supportsCreate":true,"supportsEdit":true,"supportsDelete":true,"supportsExport":false,"searchColumns":["name"]},{"slug":"payments","title":"Payments & Revenue","module":"payments","icon":"credit-card","table":"payments","supportsCreate":false,"supportsEdit":false,"supportsDelete":false,"supportsExport":true,"searchColumns":["transaction_id"]}];
$currentPage = null;
foreach ($pagesConfig as $p) {
    if ($p['slug'] === $pageSlug) {
        $currentPage = $p;
        break;
    }
}

if (!$currentPage) {
    header("Location: index.php");
    exit;
}

$table = $currentPage['table'];
$search = trim($_GET['search'] ?? '');

// Handle status approval / rejection if supported
if (isset($_GET['action'], $_GET['id'])) {
    $action = $_GET['action'];
    $id = (int)$_GET['id'];
    if ($action === 'approve') {
        $db->prepare("UPDATE `{$table}` SET status = 'approved' WHERE id = ?")->execute([$id]);
    } elseif ($action === 'reject') {
        $db->prepare("UPDATE `{$table}` SET status = 'rejected' WHERE id = ?")->execute([$id]);
    } elseif ($action === 'delete') {
        $db->prepare("DELETE FROM `{$table}` WHERE id = ?")->execute([$id]);
    }
    header("Location: module.php?page={$pageSlug}");
    exit;
}

// Fetch records
$where = "1=1";
$params = [];
if ($search !== '') {
    $where .= " AND (title LIKE ? OR name LIKE ?)";
    $params = ["%{$search}%", "%{$search}%"];
}

$stmt = $db->prepare("SELECT * FROM `{$table}` WHERE {$where} ORDER BY id DESC LIMIT 50");
$stmt->execute($params);
$rows = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($currentPage['title']) ?> - Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-slate-50 flex h-screen overflow-hidden font-sans">
    <?php include __DIR__ . '/inc/sidebar.php'; ?>

    <div class="flex-1 flex flex-col overflow-y-auto">
        <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
            <div class="flex items-center gap-3">
                <i class="fa-solid fa-<?= $currentPage['icon'] ?? 'table' ?> text-indigo-600 text-lg"></i>
                <h1 class="text-xl font-bold text-slate-800"><?= htmlspecialchars($currentPage['title']) ?></h1>
            </div>
            <div class="flex items-center gap-4">
                <form class="relative">
                    <input type="hidden" name="page" value="<?= htmlspecialchars($pageSlug) ?>">
                    <input type="text" name="search" value="<?= htmlspecialchars($search) ?>" placeholder="Search records..." class="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    <i class="fa-solid fa-search absolute left-3 top-3 text-slate-400 text-xs"></i>
                </form>
            </div>
        </header>

        <main class="p-8 flex-1">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table class="w-full text-left text-sm text-slate-600">
                    <thead class="bg-slate-50 text-xs uppercase font-bold text-slate-400 border-b border-slate-200">
                        <tr>
                            <th class="p-4">ID</th>
                            <th class="p-4">Primary Title / Name</th>
                            <th class="p-4">Status / Info</th>
                            <th class="p-4">Created Date</th>
                            <th class="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <?php if (empty($rows)): ?>
                        <tr><td colspan="5" class="p-8 text-center text-slate-400">No records found.</td></tr>
                        <?php endif; ?>
                        <?php foreach ($rows as $row): ?>
                        <tr class="hover:bg-slate-50">
                            <td class="p-4 font-mono font-bold text-slate-800">#<?= $row['id'] ?></td>
                            <td class="p-4 font-medium text-slate-900"><?= htmlspecialchars($row['title'] ?? $row['name'] ?? 'Record #' . $row['id']) ?></td>
                            <td class="p-4">
                                <?php if (isset($row['status'])): ?>
                                <span class="px-2.5 py-1 rounded-full text-xs font-semibold <?= $row['status'] === 'active' || $row['status'] === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700' ?>">
                                    <?= htmlspecialchars($row['status']) ?>
                                </span>
                                <?php else: ?>
                                <span class="text-xs text-slate-400">—</span>
                                <?php endif; ?>
                            </td>
                            <td class="p-4 text-xs text-slate-500"><?= $row['created_at'] ?? 'N/A' ?></td>
                            <td class="p-4 text-right space-x-2">
                                <?php if (isset($row['status']) && $row['status'] === 'pending'): ?>
                                <a href="module.php?page=<?= $pageSlug ?>&action=approve&id=<?= $row['id'] ?>" class="text-xs font-semibold text-emerald-600 hover:underline">Approve</a>
                                <a href="module.php?page=<?= $pageSlug ?>&action=reject&id=<?= $row['id'] ?>" class="text-xs font-semibold text-amber-600 hover:underline">Reject</a>
                                <?php endif; ?>
                                <a href="module.php?page=<?= $pageSlug ?>&action=delete&id=<?= $row['id'] ?>" onclick="return confirm('Delete record permanently?')" class="text-xs font-semibold text-rose-600 hover:underline">Delete</a>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
</body>
</html>