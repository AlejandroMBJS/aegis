<?php
require_once __DIR__ . '/../config.php';
$currentUser = getCurrentUser();
$currentPage = basename($_SERVER['PHP_SELF']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DMT System - <?php echo $pageTitle ?? 'Dashboard'; ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="css/output.css">
    <!-- Global i18n System -->
    <script src="js/i18n.js?v=<?= time() ?>"></script>
    <style>
        .status-open {
            @apply bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold;
        }
        .status-closed {
            @apply bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold;
        }
        .field-disabled {
            @apply bg-gray-100 cursor-not-allowed opacity-60;
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">

    <?php if (isAuthenticated()): ?>
    <!-- Navigation Bar -->
    <nav class="bg-blue-600 text-white shadow-lg">
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center space-x-8">
                    <h1 class="text-2xl font-bold">DMT System</h1>
                    <div class="flex space-x-4">
                        <a href="dashboard.php"
                           class="<?php echo $currentPage === 'dashboard.php' ? 'bg-blue-700' : 'hover:bg-blue-700'; ?> px-4 py-2 rounded transition">
                            <i class="fas fa-home mr-2"></i><span data-i18n="nav.dashboard">Dashboard</span>
                        </a>

                        <?php if ($currentUser['role'] === 'Inspector'): ?>
                        <a href="dmt_form.php"
                           class="<?php echo $currentPage === 'dmt_form.php' ? 'bg-blue-700' : 'hover:bg-blue-700'; ?> px-4 py-2 rounded transition">
                            <i class="fas fa-plus mr-2"></i><span data-i18n="nav.createRecord">Create DMT Record</span>
                        </a>
                        <?php endif; ?>

                        <?php if ($currentUser['role'] === 'Admin'): ?>
                        <a href="entities_crud.php"
                           class="<?php echo $currentPage === 'entities_crud.php' ? 'bg-blue-700' : 'hover:bg-blue-700'; ?> px-4 py-2 rounded transition">
                            <i class="fas fa-cog mr-2"></i><span data-i18n="nav.manageCatalogs">Manage Catalogs</span>
                        </a>
                        <a href="manage_users.php"
                           class="<?php echo $currentPage === 'manage_users.php' ? 'bg-blue-700' : 'hover:bg-blue-700'; ?> px-4 py-2 rounded transition">
                            <i class="fas fa-users mr-2"></i><span data-i18n="nav.manageUsers">Manage Users</span>
                        </a>
                        <?php endif; ?>
                    </div>
                </div>

                <div class="flex items-center space-x-4">
                    <!-- Language Selector -->
                    <select id="global-language-selector"
                            class="bg-blue-700 border-2 border-blue-500 text-white px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white cursor-pointer hover:bg-blue-800 transition">
                        <option value="en">🇺🇸 EN</option>
                        <option value="es">🇪🇸 ES</option>
                        <option value="zh">🇨🇳 ZH</option>
                    </select>

                    <div class="text-right">
                        <p class="text-sm font-semibold"><?php echo htmlspecialchars($currentUser['full_name']); ?></p>
                        <p class="text-xs text-blue-200"><?php echo htmlspecialchars($currentUser['role']); ?></p>
                    </div>
                    <a href="logout.php" class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition">
                        <i class="fas fa-sign-out-alt mr-2"></i><span data-i18n="nav.logout">Logout</span>
                    </a>
                </div>
            </div>
        </div>
    </nav>
    <?php endif; ?>

    <!-- Main Content Container -->
    <main class="container mx-auto px-4 py-8">
