<?php
session_start();
require_once __DIR__ . '/../backend/config/database.php';
if (!isset($_SESSION['admin_user'])) { header("Location: index.php"); exit; }
$db = Database::getConnection();
$pages = $db->query("SELECT * FROM pages")->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CMS Pages - Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-slate-50 flex h-screen overflow-hidden font-sans">
    <?php include __DIR__ . '/inc/sidebar.php'; ?>
    <div class="flex-1 flex flex-col overflow-y-auto">
        <header class="h-16 bg-white border-b border-slate-200 flex items-center px-8 sticky top-0 z-10">
            <h1 class="text-xl font-bold text-slate-800">Content Management (CMS Pages)</h1>
        </header>
        <main class="p-8 space-y-6">
            <?php foreach ($pages as $p): ?>
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <h3 class="font-bold text-slate-800 text-base"><?= htmlspecialchars($p['title']) ?></h3>
                    <p class="text-xs text-slate-400 mt-0.5">Slug: /api/pages/<?= htmlspecialchars($p['slug']) ?></p>
                </div>
                <div class="flex items-center gap-3">
                    <span class="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg">Published</span>
                    <button class="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700">Edit HTML</button>
                </div>
            </div>
            <?php endforeach; ?>
        </main>
    </div>
</body>
</html>