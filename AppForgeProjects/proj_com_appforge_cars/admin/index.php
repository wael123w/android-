<?php
session_start();
require_once __DIR__ . '/../backend/config/database.php';

// Auth check
if (!isset($_SESSION['admin_user'])) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
        $email = trim($_POST['email'] ?? '');
        $pass = trim($_POST['password'] ?? '');
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ? AND role_id IN (1, 2) LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        if ($user && password_verify($pass, $user['password'])) {
            $_SESSION['admin_user'] = $user;
            header("Location: index.php");
            exit;
        } else {
            $error = "Invalid administrator credentials";
        }
    }
    include __DIR__ . '/login.php';
    exit;
}

$db = Database::getConnection();
$primaryColor = '#2563EB';
$appName = 'AutoForge Market';

// Fetch dynamic counts
$stats = [];
$stats['roles'] = (int)$db->query("SELECT COUNT(*) FROM `roles`")->fetchColumn();
$stats['users'] = (int)$db->query("SELECT COUNT(*) FROM `users`")->fetchColumn();
$stats['categories'] = (int)$db->query("SELECT COUNT(*) FROM `categories`")->fetchColumn();
$stats['cars'] = (int)$db->query("SELECT COUNT(*) FROM `cars`")->fetchColumn();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($appName) ?> - Admin Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
      :root { --primary: <?= $primaryColor ?>; }
      .bg-primary { background-color: var(--primary); }
      .text-primary { color: var(--primary); }
      .border-primary { border-color: var(--primary); }
    </style>
</head>
<body class="bg-slate-50 text-slate-900 flex h-screen overflow-hidden font-sans">
    <!-- Sidebar -->
    <?php include __DIR__ . '/inc/sidebar.php'; ?>

    <div class="flex-1 flex flex-col overflow-y-auto">
        <!-- Header -->
        <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
            <h1 class="text-xl font-bold text-slate-800">Operational Dashboard</h1>
            <div class="flex items-center gap-4">
                <span class="text-sm text-slate-500">Logged in as <strong class="text-slate-800"><?= htmlspecialchars($_SESSION['admin_user']['name']) ?></strong></span>
                <a href="logout.php" class="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition">Logout</a>
            </div>
        </header>

        <main class="p-8 space-y-8 flex-1">
            <!-- Metric Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <?php foreach ($stats as $entity => $count): ?>
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p class="text-xs uppercase tracking-wider font-semibold text-slate-400"><?= htmlspecialchars(ucwords(str_replace('_', ' ', $entity))) ?></p>
                        <p class="text-3xl font-extrabold text-slate-800 mt-2"><?= number_format($count) ?></p>
                    </div>
                    <div class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                        <i class="fa-solid fa-layer-group text-lg"></i>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>

            <!-- Quick Action Management Sections -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 class="text-lg font-bold text-slate-800 mb-4">Application Management Modules</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    <a href="module.php?page=users" class="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition group">
                        <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition">
                            <i class="fa-solid fa-users"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-800">User Management</h4>
                            <p class="text-xs text-slate-400">Manage users records</p>
                        </div>
                    </a>
                    
                    <a href="module.php?page=cars" class="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition group">
                        <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition">
                            <i class="fa-solid fa-car"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-800">Cars Catalog</h4>
                            <p class="text-xs text-slate-400">Manage cars records</p>
                        </div>
                    </a>
                    
                    <a href="module.php?page=categories" class="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition group">
                        <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition">
                            <i class="fa-solid fa-tags"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-800">Categories</h4>
                            <p class="text-xs text-slate-400">Manage categories records</p>
                        </div>
                    </a>
                    
                    <a href="module.php?page=payments" class="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition group">
                        <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition">
                            <i class="fa-solid fa-credit-card"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-800">Payments & Revenue</h4>
                            <p class="text-xs text-slate-400">Manage payments records</p>
                        </div>
                    </a>
                    
                </div>
            </div>
        </main>
    </div>
</body>
</html>