import { AppSpec } from '../../types';

export class AdminGenerator {
  public static generateAdminFiles(spec: AppSpec): Record<string, string> {
    const files: Record<string, string> = {};

    // 1. Admin Index / Dashboard
    files['admin/index.php'] = `<?php
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
$primaryColor = '${spec.theme.primaryColor}';
$appName = '${spec.appName.replace(/'/g, "\\'")}';

// Fetch dynamic counts
$stats = [];
${spec.tables.slice(0, 4).map(t => `$stats['${t.name}'] = (int)$db->query("SELECT COUNT(*) FROM \`${t.name}\`")->fetchColumn();`).join('\n')}
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
                    ${spec.adminPages.map(page => `
                    <a href="module.php?page=${page.slug}" class="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition group">
                        <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition">
                            <i class="fa-solid fa-${page.icon || 'folder'}"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-800">${page.title}</h4>
                            <p class="text-xs text-slate-400">Manage ${page.table} records</p>
                        </div>
                    </a>
                    `).join('')}
                </div>
            </div>
        </main>
    </div>
</body>
</html>`;

    // 2. Admin Login View
    files['admin/login.php'] = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - ${spec.appName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 flex items-center justify-center min-h-screen p-4 font-sans">
    <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
        <div class="text-center mb-8">
            <div class="inline-flex w-14 h-14 rounded-2xl bg-indigo-600 items-center justify-center text-white text-2xl font-black mb-3">
                ${spec.appName.slice(0, 2).toUpperCase()}
            </div>
            <h2 class="text-2xl font-extrabold text-slate-900">${spec.appName} Admin</h2>
            <p class="text-sm text-slate-500 mt-1">Sign in with system administrator credentials</p>
        </div>

        <?php if (!empty($error)): ?>
            <div class="mb-6 p-4 rounded-xl bg-rose-50 text-rose-700 text-sm font-medium border border-rose-200">
                <?= htmlspecialchars($error) ?>
            </div>
        <?php endif; ?>

        <form method="POST" class="space-y-4">
            <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
                <input type="email" name="email" value="admin@appforge.local" required class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
                <input type="password" name="password" value="Admin@123456" required class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm">
                <span class="text-xs text-slate-400 mt-1 block">Default initial login: admin@appforge.local / Admin@123456</span>
            </div>
            <button type="submit" name="login" class="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                Authenticate & Enter
            </button>
        </form>
    </div>
</body>
</html>`;

    // 3. Admin Sidebar
    files['admin/inc/sidebar.php'] = `<aside class="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
    <div class="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
        <div class="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-black text-sm">
            ${spec.appName.slice(0, 2).toUpperCase()}
        </div>
        <span class="font-bold text-white text-base truncate">${spec.appName}</span>
    </div>

    <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <a href="index.php" class="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800 text-sm font-semibold text-white transition">
            <i class="fa-solid fa-gauge-high w-5"></i> Dashboard
        </a>

        <div class="pt-4 pb-2 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">Modules</div>
        ${spec.adminPages.map(page => `
        <a href="module.php?page=${page.slug}" class="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800 text-sm font-semibold transition">
            <i class="fa-solid fa-${page.icon || 'table'} w-5"></i> ${page.title}
        </a>
        `).join('')}

        <div class="pt-4 pb-2 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">Configuration</div>
        <a href="pages.php" class="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800 text-sm font-semibold transition">
            <i class="fa-solid fa-file-lines w-5"></i> CMS Pages
        </a>
        <a href="settings.php" class="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800 text-sm font-semibold transition">
            <i class="fa-solid fa-sliders w-5"></i> System Settings
        </a>
    </nav>
</aside>`;

    // 4. Module CRUD Page
    files['admin/module.php'] = `<?php
session_start();
require_once __DIR__ . '/../backend/config/database.php';
if (!isset($_SESSION['admin_user'])) { header("Location: index.php"); exit; }

$db = Database::getConnection();
$pageSlug = $_GET['page'] ?? '';

// Find target configuration
$pagesConfig = ${JSON.stringify(spec.adminPages)};
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
        $db->prepare("UPDATE \`{$table}\` SET status = 'approved' WHERE id = ?")->execute([$id]);
    } elseif ($action === 'reject') {
        $db->prepare("UPDATE \`{$table}\` SET status = 'rejected' WHERE id = ?")->execute([$id]);
    } elseif ($action === 'delete') {
        $db->prepare("DELETE FROM \`{$table}\` WHERE id = ?")->execute([$id]);
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

$stmt = $db->prepare("SELECT * FROM \`{$table}\` WHERE {$where} ORDER BY id DESC LIMIT 50");
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
</html>`;

    // 5. Settings Configuration View
    files['admin/settings.php'] = `<?php
session_start();
require_once __DIR__ . '/../backend/config/database.php';
if (!isset($_SESSION['admin_user'])) { header("Location: index.php"); exit; }

$db = Database::getConnection();
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_settings'])) {
    foreach ($_POST['settings'] as $key => $val) {
        $stmt = $db->prepare("UPDATE settings SET setting_value = ? WHERE setting_key = ?");
        $stmt->execute([$val, $key]);
    }
    $success = "Settings saved successfully";
}

$settingsRaw = $db->query("SELECT * FROM settings")->fetchAll();
$settings = [];
foreach ($settingsRaw as $s) {
    $settings[$s['setting_key']] = $s['setting_value'];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Settings - Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-slate-50 flex h-screen overflow-hidden font-sans">
    <?php include __DIR__ . '/inc/sidebar.php'; ?>
    <div class="flex-1 flex flex-col overflow-y-auto">
        <header class="h-16 bg-white border-b border-slate-200 flex items-center px-8 sticky top-0 z-10">
            <h1 class="text-xl font-bold text-slate-800">System & Payment Settings</h1>
        </header>
        <main class="p-8 max-w-4xl">
            <?php if (!empty($success)): ?>
            <div class="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200">
                <?= $success ?>
            </div>
            <?php endif; ?>
            <form method="POST" class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div class="grid grid-cols-2 gap-6">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-2">Application Name</label>
                        <input type="text" name="settings[app_name]" value="<?= htmlspecialchars($settings['app_name'] ?? '') ?>" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-2">Currency Symbol</label>
                        <input type="text" name="settings[currency]" value="<?= htmlspecialchars($settings['currency'] ?? 'USD') ?>" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-2">Primary Brand Color</label>
                        <input type="color" name="settings[primary_color]" value="<?= htmlspecialchars($settings['primary_color'] ?? '#4F46E5') ?>" class="w-full h-10 rounded-xl cursor-pointer">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-700 uppercase mb-2">Support Contact Email</label>
                        <input type="email" name="settings[contact_email]" value="<?= htmlspecialchars($settings['contact_email'] ?? '') ?>" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm">
                    </div>
                </div>

                <div class="border-t border-slate-200 pt-6">
                    <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Payment Gateway Gateways</h3>
                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">Stripe Mode</label>
                            <select name="settings[stripe_mode]" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm">
                                <option value="sandbox" <?= ($settings['stripe_mode'] ?? '') === 'sandbox' ? 'selected' : '' ?>>Sandbox / Test</option>
                                <option value="live" <?= ($settings['stripe_mode'] ?? '') === 'live' ? 'selected' : '' ?>>Production / Live</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">PayPal Mode</label>
                            <select name="settings[paypal_mode]" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm">
                                <option value="sandbox" <?= ($settings['paypal_mode'] ?? '') === 'sandbox' ? 'selected' : '' ?>>Sandbox / Test</option>
                                <option value="live" <?= ($settings['paypal_mode'] ?? '') === 'live' ? 'selected' : '' ?>>Production / Live</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button type="submit" name="save_settings" class="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">Save Changes</button>
            </form>
        </main>
    </div>
</body>
</html>`;

    // 6. Logout
    files['admin/logout.php'] = `<?php
session_start();
unset($_SESSION['admin_user']);
session_destroy();
header("Location: index.php");
exit;`;

    // 7. CMS Pages Editor
    files['admin/pages.php'] = `<?php
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
</html>`;

    return files;
  }
}
