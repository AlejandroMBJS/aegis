<?php
require_once 'config.php';
requireAuth();

$pageTitle = 'Dashboard';
include 'includes/header.php';

// Inject PHP variables to JS
echo "<script>
    window.API_BASE_URL = '".API_BASE_URL."';
    window.USER_ROLE = '".$currentUser['role']."';
</script>";
?>

<div class="space-y-6 h-screen p-6 bg-gray-100">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
        <div>
            <h2 class="text-3xl font-bold text-gray-800" data-i18n="dashboard.title">DMT Records Dashboard</h2>
            <p class="text-gray-600 mt-1" data-i18n="dashboard.subtitle">View and manage all defect management records</p>
        </div>

        <?php if ($currentUser['role'] === 'Inspector'): ?>
        <a href="dmt_form.php" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition flex items-center">
            <i class="fas fa-plus mr-2"></i><span data-i18n="dashboard.createNewRecord">Create New Record</span>
        </a>
        <?php endif; ?>
    </div>

    <!-- Filters Section -->
    <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">
            <i class="fas fa-filter mr-2"></i><span data-i18n="dashboard.filters">Filters</span>
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Status Filter -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="table.status">Status</label>
                <select id="filter-status" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="" data-i18n="status.all">All</option>
                    <option value="false" data-i18n="status.open">Open</option>
                    <option value="true" data-i18n="status.closed">Closed</option>
                </select>
            </div>

            <!-- Part Number Filter -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="form.partNumber">Part Number</label>
                <select id="filter-part-number" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="" data-i18n="status.all">All</option>
                </select>
            </div>

            <!-- Work Center Filter -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="form.workCenter">Work Center</label>
                <select id="filter-work-center" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="" data-i18n="status.all">All</option>
                </select>
            </div>

            <!-- Customer Filter -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="form.customer">Customer</label>
                <select id="filter-customer" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="" data-i18n="status.all">All</option>
                </select>
            </div>

            <!-- Date Range Filters -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="dashboard.createdAfter">Created After</label>
                <input type="date" id="filter-date-start" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="dashboard.createdBefore">Created Before</label>
                <input type="date" id="filter-date-end" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <!-- Filter Actions -->
            <div class="lg:col-span-2 flex items-end space-x-2">
                <button id="apply-filters" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition flex-1">
                    <i class="fas fa-search mr-2"></i><span data-i18n="dashboard.applyFilters">Apply Filters</span>
                </button>
                <button id="clear-filters" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition flex-1">
                    <i class="fas fa-undo mr-2"></i><span data-i18n="dashboard.clear">Clear</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Export Section -->
    <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">
            <i class="fas fa-download mr-2"></i><span data-i18n="dashboard.export">Export to CSV</span>
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <!-- Export Date Range -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="dashboard.exportStartDate">Start Date</label>
                <input type="date" id="export-date-start" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="dashboard.exportEndDate">End Date</label>
                <input type="date" id="export-date-end" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
            </div>

            <!-- Quick Date Presets -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="dashboard.quickSelect">Quick Select</label>
                <select id="export-preset" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="" data-i18n="dashboard.customRange">Custom Range</option>
                    <option value="today" data-i18n="dashboard.today">Today</option>
                    <option value="week" data-i18n="dashboard.thisWeek">This Week</option>
                    <option value="month" data-i18n="dashboard.thisMonth">This Month</option>
                    <option value="all" data-i18n="dashboard.allRecords">All Records</option>
                </select>
            </div>

            <!-- Language Selection -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2" data-i18n="dashboard.exportLanguage">Export Language</label>
                <select id="export-language" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="zh">中文</option>
                </select>
            </div>

            <!-- Export Button -->
            <div>
                <button id="export-csv" class="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition">
                    <i class="fas fa-file-csv mr-2"></i><span data-i18n="dashboard.exportButton">Export CSV</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Records Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" data-i18n="table.id">ID</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" data-i18n="table.status">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" data-i18n="dashboard.createdBy">Created By</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" data-i18n="dashboard.createdAt">Created At</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" data-i18n="form.partNumber">Part Number</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" data-i18n="form.workCenter">Work Center</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" data-i18n="form.customer">Customer</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" data-i18n="form.disposition">Disposition</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" data-i18n="form.failureCode">Failure Code</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" data-i18n="table.actions">Actions</th>
                    </tr>
                </thead>
                <tbody id="records-table-body" class="bg-white divide-y divide-gray-200">
                    <tr>
                        <td colspan="10" class="px-6 py-12 text-center text-gray-500">
                            <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                            <p data-i18n="dashboard.loadingRecords">Loading records...</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div id="pagination" class="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div class="text-sm text-gray-700">
                <span data-i18n="dashboard.showing">Showing</span> <span id="records-count">0</span> <span data-i18n="dashboard.records">records</span>
            </div>
            <div class="flex space-x-2"></div>
        </div>
    </div>
</div>

<script src="js/i18n.js"></script>
<script src="js/auth.js"></script>
<script src="js/api.js"></script>
<script src="js/dmt_feed.js"></script>

<?php include 'includes/footer.php'; ?>
