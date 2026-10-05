<?php
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
</html>