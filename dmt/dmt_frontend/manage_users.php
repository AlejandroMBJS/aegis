<?php
require_once 'config.php';
requireRole(['Admin']); // Only Admin can access this page

$pageTitle = 'Manage Users';
include 'includes/header.php';

// Inject PHP variables to JS
echo "<script>
    window.API_TOKEN = '".$_SESSION['token']."';
    window.USER_ROLE = '".$currentUser['role']."';
</script>";
?>

<div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold" data-i18n="manageUsers.title">User Management</h1>
        <button id="add-user-btn" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition">
            <i class="fas fa-plus mr-2"></i><span data-i18n="manageUsers.addUser">Add New User</span>
        </button>
    </div>

    <!-- User Table -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-i18n="manageUsers.table.fullName">Full Name</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-i18n="manageUsers.table.username">Username</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-i18n="manageUsers.table.email">Email</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-i18n="manageUsers.table.role">Role</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" data-i18n="manageUsers.table.actions">Actions</th>
                </tr>
            </thead>
            <tbody id="users-table-body" class="bg-white divide-y divide-gray-200">
                <!-- User rows will be inserted here by JavaScript -->
            </tbody>
        </table>
    </div>
</div>

<!-- User Modal (for Add/Edit) -->
<div id="user-modal" class="fixed z-10 inset-0 overflow-y-auto hidden" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <form id="user-form">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title-text" data-i18n="manageUsers.modal.addUserTitle">Add New User</h3>
                    <input type="hidden" id="user-id" name="id">
                    <div class="mt-4 space-y-4">
                        <div>
                            <label for="full_name" class="block text-sm font-medium text-gray-700" data-i18n="manageUsers.form.fullName">Full Name</label>
                            <input type="text" name="full_name" id="full_name" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" required>
                        </div>
                        <div>
                            <label for="username" class="block text-sm font-medium text-gray-700" data-i18n="manageUsers.form.username">Username</label>
                            <input type="text" name="username" id="username" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" required>
                        </div>
                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-700" data-i18n="manageUsers.form.email">Email</label>
                            <input type="email" name="email" id="email" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" required>
                        </div>
                        <div>
                            <label for="role" class="block text-sm font-medium text-gray-700" data-i18n="manageUsers.form.role">Role</label>
                            <select id="role" name="role" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
                                <option value="Inspector" data-i18n="roles.inspector">Inspector</option>
                                <option value="Admin" data-i18n="roles.admin">Admin</option>
                                <option value="Viewer" data-i18n="roles.viewer">Viewer</option>
                            </select>
                        </div>
                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-700" data-i18n="manageUsers.form.password">Password</label>
                            <input type="password" name="password" id="password" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                            <p class="text-xs text-gray-500 mt-1" data-i18n="manageUsers.form.passwordHint">Leave blank to keep current password.</p>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button type="submit" id="save-user-btn" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm" data-i18n="buttons.save">
                        Save
                    </button>
                    <button type="button" id="cancel-btn" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" data-i18n="buttons.cancel">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>


<script src="js/api.js"></script>
<script src="js/manage_users.js?v=<?= time() ?>"></script>

<?php
require_once 'includes/footer.php';
?>