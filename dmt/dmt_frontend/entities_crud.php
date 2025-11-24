<?php
require_once 'config.php';
requireRole(['Admin']); // Only Admin can access this page

$pageTitle = 'Manage Catalogs';
include 'includes/header.php';
?>

<div class="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex items-center mb-2">
            <div class="bg-blue-600 text-white w-12 h-12 rounded-lg flex items-center justify-center mr-4 shadow-md">
                <i class="fas fa-database text-xl"></i>
            </div>
            <div>
                <h2 class="text-3xl font-bold text-gray-800" data-i18n="catalogs.title">Catalog Management</h2>
                <p class="text-gray-600 mt-1 text-sm" data-i18n="catalogs.subtitle">Create, read, update, and delete catalog entries</p>
            </div>
        </div>
    </div>

    <!-- Entity Selector Card -->
    <div class="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
        <div class="flex items-center mb-4">
            <i class="fas fa-filter text-blue-600 mr-2"></i>
            <h3 class="text-lg font-semibold text-gray-700" data-i18n="catalogs.selectCatalogType">Select Catalog Type</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                    <i class="fas fa-list-ul text-gray-400 mr-1"></i><span data-i18n="catalogs.catalog">Catalog</span>
                </label>
                <select id="entity-selector" class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400 cursor-pointer">
                    <option value="" data-i18n="catalogs.selectCatalog">-- Select a Catalog --</option>
                    <option value="partnumber" data-i18n="catalogs.partNumbers">📦 Part Numbers</option>
                    <option value="workcenter" data-i18n="catalogs.workCenters">🏭 Work Centers</option>
                    <option value="customer" data-i18n="catalogs.customers">👥 Customers</option>
                    <option value="level" data-i18n="catalogs.levels">📊 Levels</option>
                    <option value="area" data-i18n="catalogs.areas">📍 Areas</option>
                    <option value="calibration" data-i18n="catalogs.calibrations">⚙️ Calibrations</option>
                    <option value="inspectionitem" data-i18n="catalogs.inspectionItems">🔍 Inspection Items</option>
                    <option value="preparedby" data-i18n="catalogs.preparedBy">✍️ Prepared By</option>
                    <option value="disposition" data-i18n="catalogs.dispositions">📋 Dispositions</option>
                    <option value="failurecode" data-i18n="catalogs.failureCodes">⚠️ Failure Codes</option>
                </select>
            </div>
            <div class="flex items-end">
                <button id="create-new-button" disabled
                        class="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none">
                    <i class="fas fa-plus-circle mr-2"></i><span data-i18n="catalogs.createNewEntry">Create New Entry</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Entities Table -->
    <div id="entities-container" class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hidden transition-all duration-300">
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 p-6 border-b border-blue-800">
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <i class="fas fa-table text-white text-2xl mr-3"></i>
                    <h3 id="entity-title" class="text-2xl font-bold text-white"></h3>
                </div>
                <div class="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <p class="text-sm text-white font-semibold">
                        <i class="fas fa-layer-group mr-2"></i>
                        <span id="entities-count">0</span> <span data-i18n="catalogs.entries">entries</span>
                    </p>
                </div>
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full ">
                <thead class="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300 ">
                    <tr>
                        <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <i class="fas fa-hashtag text-gray-500 mr-2"></i><span data-i18n="catalogs.id">ID</span>
                        </th>
                        <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <i class="fas fa-barcode text-gray-500 mr-2"></i><span data-i18n="catalogs.itemNumber">Item Number</span>
                        </th>
                        <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <i class="fas fa-tag text-gray-500 mr-2"></i><span data-i18n="catalogs.itemName">Item Name</span>
                        </th>
                        <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <i class="fas fa-tools text-gray-500 mr-2"></i><span data-i18n="table.actions">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody id="entities-table-body" class="bg-white divide-y divide-gray-200">
                    <!-- Populated by JS -->
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Create/Edit Modal -->
<div id="entity-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-95 opacity-0" id="modal-content">
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <div class="bg-white bg-opacity-20 backdrop-blur-sm w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                        <i class="fas fa-edit text-white"></i>
                    </div>
                    <h3 id="modal-title" class="text-xl font-bold text-white" data-i18n="catalogs.createEntry">Create Entry</h3>
                </div>
                <button id="close-modal" class="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
        </div>

        <!-- Modal Form -->
        <form id="entity-form" class="p-6 space-y-5">
            <input type="hidden" id="entity-id">
            <input type="hidden" id="entity-name">

            <div>
                <label for="item_number" class="block text-sm font-bold text-gray-700 mb-2">
                    <i class="fas fa-barcode text-blue-600 mr-2"></i><span data-i18n="catalogs.itemNumber">Item Number</span> <span class="text-red-500" data-i18n="catalogs.required">*</span>
                </label>
                <input type="text" id="item_number" name="item_number" required
                       class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                       placeholder="Enter item number">
            </div>

            <div>
                <label for="item_name" class="block text-sm font-bold text-gray-700 mb-2">
                    <i class="fas fa-tag text-blue-600 mr-2"></i><span data-i18n="catalogs.itemName">Item Name</span> <span class="text-red-500" data-i18n="catalogs.required">*</span>
                </label>
                <input type="text" id="item_name" name="item_name" required
                       class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                       placeholder="Enter item name">
            </div>

            <div class="flex space-x-3 pt-4">
                <button type="button" id="cancel-button"
                        class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    <i class="fas fa-times mr-2"></i><span data-i18n="actions.cancel">Cancel</span>
                </button>
                <button type="submit"
                        class="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    <i class="fas fa-save mr-2"></i><span id="submit-button-text" data-i18n="actions.save">Save</span>
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Delete Confirmation Modal -->
<div id="delete-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300">
        <div class="p-6">
            <div class="flex items-start mb-6">
                <div class="bg-red-100 rounded-xl p-3 mr-4">
                    <i class="fas fa-exclamation-triangle text-red-600 text-3xl"></i>
                </div>
                <div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-1" data-i18n="catalogs.confirmDeletion">Confirm Deletion</h3>
                    <p class="text-sm text-gray-600" data-i18n="catalogs.cannotUndo">This action cannot be undone</p>
                </div>
            </div>

            <div class="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg mb-6">
                <p class="text-gray-700">
                    <span data-i18n="catalogs.confirmDeleteMessage">Are you sure you want to delete</span> <strong class="text-red-700" id="delete-item-name"></strong>?
                </p>
            </div>

            <div class="flex space-x-3">
                <button id="cancel-delete"
                        class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    <i class="fas fa-times mr-2"></i><span data-i18n="actions.cancel">Cancel</span>
                </button>
                <button id="confirm-delete"
                        class="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    <i class="fas fa-trash-alt mr-2"></i><span data-i18n="actions.delete">Delete</span>
                </button>
            </div>
        </div>
    </div>
</div>

<script src="js/auth.js"></script>
<script src="js/entities_crud_logic.js"></script>

<?php include 'includes/footer.php'; ?>
