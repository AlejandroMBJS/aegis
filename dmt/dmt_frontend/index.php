<?php
require_once 'config.php';

// Redirect to dashboard if already authenticated
if (isAuthenticated()) {
    header('Location: dashboard.php');
    exit();
}

$pageTitle = 'Login';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DMT System - Login</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="css/output.css">
    <!-- Global i18n System -->
    <script src="js/i18n.js?v=<?= time() ?>"></script>
</head>
<body class="bg-gradient-to-br from-blue-500 to-blue-700 min-h-screen flex items-center justify-center">

    <!-- Language Selector (Top Right) -->
    <div class="fixed top-4 right-4 z-50">
        <select id="global-language-selector"
                class="bg-white bg-opacity-20 backdrop-blur-md border-2 border-white border-opacity-30 text-white px-4 py-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-white cursor-pointer hover:bg-opacity-30 transition">
            <option value="en">🇺🇸 English</option>
            <option value="es">🇪🇸 Español</option>
            <option value="zh">🇨🇳 中文</option>
        </select>
    </div>

    <div class="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <!-- Logo/Title -->
        <div class="text-center mb-8">
            <div class="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-clipboard-check text-3xl"></i>
            </div>
            <h1 class="text-3xl font-bold text-gray-800">DMT System</h1>
            <p class="text-gray-600 mt-2" data-i18n="login.subtitle">Defect Management & Tracking</p>
        </div>

        <!-- Login Form -->
        <form id="loginForm" class="space-y-6">
            <div>
                <label for="employee_number" class="block text-sm font-semibold text-gray-700 mb-2">
                    <i class="fas fa-user mr-2"></i><span data-i18n="login.employeeNumber">Employee Number</span>
                </label>
                <input
                    type="text"
                    id="employee_number"
                    name="employee_number"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your employee number"
                    autocomplete="username"
                >
            </div>

            <div>
                <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
                    <i class="fas fa-lock mr-2"></i><span data-i18n="login.password">Password</span>
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password"
                    autocomplete="current-password"
                >
            </div>

            <!-- Error Message -->
            <div id="error-message" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                <i class="fas fa-exclamation-circle mr-2"></i>
                <span id="error-text"></span>
            </div>

            <!-- Submit Button -->
            <button
                type="submit"
                id="loginButton"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center"
            >
                <i class="fas fa-sign-in-alt mr-2"></i>
                <span id="loginButtonText" data-i18n="login.signIn">Sign In</span>
            </button>
        </form>

        <!-- Demo Credentials Info -->
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <p class="text-xs text-gray-600 font-semibold mb-2" data-i18n="login.demoCredentials">Demo Credentials:</p>
            <div class="text-xs text-gray-500 space-y-1">
                <p><strong>Admin:</strong> ADM001/admin123</p>
                <p><strong>Inspector:</strong> INS001/employee123</p>
                <p><strong>Operator:</strong> OPR001/employee123</p>
                <p><strong>Tech Engineer:</strong> ENG001/engineer123</p>
                <p><strong>Quality Engineer:</strong> QUA001/quality123</p>
            </div>
        </div>
    </div>

    <script src="js/auth.js"></script>
    <script>
        const loginForm = document.getElementById('loginForm');
        const errorMessage = document.getElementById('error-message');
        const errorText = document.getElementById('error-text');
        const loginButton = document.getElementById('loginButton');
        const loginButtonText = document.getElementById('loginButtonText');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const employee_number = document.getElementById('employee_number').value;
            const password = document.getElementById('password').value;

            // Hide previous errors
            errorMessage.classList.add('hidden');

            // Disable button and show loading
            loginButton.disabled = true;
            loginButtonText.textContent = 'Signing in...';

            try {
                const result = await login(employee_number, password);

                if (result.success) {
                    // Redirect to dashboard
                    window.location.href = 'dashboard.php';
                } else {
                    // Show error
                    errorText.textContent = result.error || 'Invalid credentials. Please try again.';
                    errorMessage.classList.remove('hidden');
                }
            } catch (error) {
                errorText.textContent = 'Connection error. Please check if the API is running.';
                errorMessage.classList.remove('hidden');
            } finally {
                // Re-enable button and restore translated text
                loginButton.disabled = false;
                if (window.i18n && window.i18n.t) {
                    loginButtonText.textContent = window.i18n.t('login.signIn');
                } else {
                    loginButtonText.textContent = 'Sign In';
                }
            }
        });
    </script>
</body>
</html>
