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

// Inject JWT token from PHP session to localStorage
if (isset($_SESSION['token'])) {
    echo "<script>
        console.log('Injecting token from PHP session');
        localStorage.setItem('access_token', '".$_SESSION['token']."');
        localStorage.setItem('token_type', 'Bearer');
        console.log('Token injected:', localStorage.getItem('access_token') ? 'SUCCESS' : 'FAILED');
    </script>";
} else {
    echo "<script>
        console.error('NO TOKEN IN PHP SESSION! Redirecting to login...');
        window.location.href = 'index.php';
    </script>";
}
?>

<div class="space-y-6 p-6 bg-gray-100">
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
         
           <!-- Date Range Filter -->
            <div class="lg:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                    <i class="fas fa-calendar-alt mr-1"></i><span data-i18n="dashboard.dateRange">Date Range</span>
                </label>
                <input type="text" id="filter-date-range"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                       placeholder="Select date range..."
                       readonly>
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

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <!-- Export Date Range -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                    <i class="fas fa-calendar-alt mr-1"></i><span data-i18n="dashboard.exportDateRange">Export Date Range</span>
                </label>
                <input type="text" id="export-date-range"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white cursor-pointer"
                       placeholder="Select date range..."
                       readonly>
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

<!-- Flatpickr Date Picker -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/themes/material_blue.css">
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>

<script src="js/i18n.js"></script>
<script src="js/auth.js"></script>
<script src="js/api.js"></script>
<script src="js/dmt_feed.js"></script>
<script src="js/ux_improvements.js"></script>

<script>
// Initialize Date Range Pickers
document.addEventListener('DOMContentLoaded', function() {
    // Filter Date Range Picker
    window.filterDateRangePicker = flatpickr("#filter-date-range", {
        mode: "range",
        dateFormat: "Y-m-d",
        conjunction: " to ",
        showMonths: 2,
        theme: "material_blue",
        onChange: function(selectedDates, dateStr, instance) {
            if (selectedDates.length === 2) {
                window.filterStartDate = selectedDates[0];
                window.filterEndDate = selectedDates[1];
            }
        },
        onClear: function() {
            window.filterStartDate = null;
            window.filterEndDate = null;
        }
    });

    // Export Date Range Picker
    const exportDateRange = flatpickr("#export-date-range", {
        mode: "range",
        dateFormat: "Y-m-d",
        conjunction: " to ",
        showMonths: 2,
        theme: "material_blue",
        defaultDate: [new Date(new Date().setDate(new Date().getDate() - 30)), new Date()],
        onChange: function(selectedDates, dateStr, instance) {
            if (selectedDates.length === 2) {
                window.exportStartDate = selectedDates[0];
                window.exportEndDate = selectedDates[1];
            }
        }
    });

    // Quick preset handler for export
    document.getElementById('export-preset')?.addEventListener('change', function(e) {
        const value = e.target.value;
        const today = new Date();
        let startDate, endDate;

        switch(value) {
            case 'today':
                startDate = endDate = today;
                break;
            case 'week':
                startDate = new Date(today.setDate(today.getDate() - 7));
                endDate = new Date();
                break;
            case 'month':
                startDate = new Date(today.setMonth(today.getMonth() - 1));
                endDate = new Date();
                break;
            case 'all':
                exportDateRange.clear();
                return;
            default:
                return;
        }

        exportDateRange.setDate([startDate, endDate]);
    });
});
</script>

<?php include 'includes/footer.php'; ?>
