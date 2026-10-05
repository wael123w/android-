<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - AutoForge Market</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 flex items-center justify-center min-h-screen p-4 font-sans">
    <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
        <div class="text-center mb-8">
            <div class="inline-flex w-14 h-14 rounded-2xl bg-indigo-600 items-center justify-center text-white text-2xl font-black mb-3">
                AU
            </div>
            <h2 class="text-2xl font-extrabold text-slate-900">AutoForge Market Admin</h2>
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
</html>