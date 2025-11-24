<?php
require_once 'config.php';
requireAuth();

$currentUser = getCurrentUser();   // <-- REQUIRED FIX

$pageTitle = isset($_GET['id']) ? 'Edit DMT Record' : 'Create DMT Record';
$recordId = $_GET['id'] ?? null;
$isEditMode = $recordId !== null;

// If creating, only Inspector can access
if (!$isEditMode && $currentUser['role'] !== 'Inspector') {
    header('HTTP/1.1 403 Forbidden');
    die('Only Inspectors can create new DMT Records');
}

include 'includes/header.php';
?>
<script src="js/rbac.js"></script>

<div class="max-w-6xl mx-auto">
    <!-- Page Header -->
    <div class="mb-6">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-3xl font-bold text-gray-800">
                    <?php echo $isEditMode ? 'Edit DMT Record #' . htmlspecialchars($recordId) : 'Create New DMT Record'; ?>
                </h2>
                <p class="text-gray-600 mt-1">
                    <?php echo $isEditMode ? 'Update the fields you have permission to edit' : 'Fill in all required fields to create a new record'; ?>
                </p>
            </div>
            <a href="dashboard.php" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition flex items-center">
                <i class="fas fa-arrow-left mr-2"></i>Back to Dashboard
            </a>
        </div>
    </div>

    <!-- DMT Form -->
    <form id="dmt-form" class="space-y-6">
        <!-- Hidden field for record ID -->
        <input type="hidden" id="record-id" value="<?php echo htmlspecialchars($recordId ?? ''); ?>">

        <!-- SECTION 1: Inspector - General Information -->
        <div class="bg-white rounded-lg shadow-md p-6" id="section-inspector">
            <div class="border-l-4 border-blue-600 pl-4 mb-6">
                <h3 class="text-xl font-bold text-gray-800">
                    <i class="fas fa-clipboard-list mr-2 text-blue-600"></i>Section 1: General Information
                </h3>
                <p class="text-sm text-gray-600 mt-1">Inspector's responsibility - Required fields marked with *</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Report Number (Auto-generated or manual) -->
                <div>
                    <label for="report_number" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.reportNumber">Report Number</span>
                    </label>
                    <input type="text" id="report_number" name="report_number"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Auto-generated or manual">
                </div>

                <!-- Part Number -->
                <div>
                    <label for="part_number_id" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.partNumber">Part Number</span> <span class="text-red-500">*</span>
                    </label>
                    <select id="part_number_id" name="part_number_id" required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Part Number</option>
                        <!-- Populated by JS -->
                    </select>
                </div>

                <!-- Work Center -->
                <div>
                    <label for="work_center_id" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.workCenter">Work Center</span> <span class="text-red-500">*</span>
                    </label>
                    <select id="work_center_id" name="work_center_id" required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Work Center</option>
                        <!-- Populated by JS -->
                    </select>
                </div>

                <!-- Customer -->
                <div>
                    <label for="customer_id" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.customer">Customer</span> <span class="text-red-500">*</span>
                    </label>
                    <select id="customer_id" name="customer_id" required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Customer</option>
                        <!-- Populated by JS -->
                    </select>
                </div>

                <!-- Prepared By -->
                <div>
                    <label for="prepared_by_id" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.preparedBy">Prepared By</span> <span class="text-red-500">*</span>
                    </label>
                    <select id="prepared_by_id" name="prepared_by_id" required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Prepared By</option>
                        <!-- Populated by JS -->
                    </select>
                </div>

                <!-- Operation -->
                <div>
                    <label for="operation" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.operation">Operation</span> <span class="text-red-500">*</span>
                    </label>
                    <input type="text" id="operation" name="operation" required
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Enter Operation">
                </div>

                <!-- Quantity -->
                <div>
                    <label for="quantity" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.quantity">Quantity</span> <span class="text-red-500">*</span>
                    </label>
                    <input type="number" id="quantity" name="quantity" required min="1"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Enter Quantity">
                </div>

                <!-- Serial Number -->
                <div>
                    <label for="serial_number" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.serialNumber">Serial Number</span>
                    </label>
                    <input type="text" id="serial_number" name="serial_number"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Enter Serial Number">
                </div>

                <!-- Date -->
                <div>
                    <label for="date" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.date">Date</span> <span class="text-red-500">*</span>
                    </label>
                    <input type="date" id="date" name="date" required
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>

                <!-- Inspection Item -->
                <div>
                    <label for="inspection_item_id" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.inspectionItem">Inspection Item</span> <span class="text-red-500">*</span>
                    </label>
                    <select id="inspection_item_id" name="inspection_item_id" required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Inspection Item</option>
                        <!-- Populated by JS -->
                    </select>
                </div>

                <!-- Process Code -->
                <div>
                    <label for="process_code_id" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.processCode">Process Code</span> <span class="text-red-500">*</span>
                    </label>
                    <select id="process_code_id" name="process_code_id" required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Process Code</option>
                        <!-- Populated by JS -->
                    </select>
                </div>

                <!-- Level (Optional now) -->
                <div>
                    <label for="level_id" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.level">Level</span>
                    </label>
                    <select id="level_id" name="level_id"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Level</option>
                        <!-- Populated by JS -->
                    </select>
                </div>

                <!-- Area (Optional now) -->
                <div>
                    <label for="area_id" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.area">Area</span>
                    </label>
                    <select id="area_id" name="area_id"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select Area</option>
                        <!-- Populated by JS -->
                    </select>
                </div>
            </div>
        </div>

        <!-- SECTION 2: Defect Description -->
        <div class="bg-white rounded-lg shadow-md p-6" id="section-defect-description">
            <div class="border-l-4 border-yellow-600 pl-4 mb-6">
                <h3 class="text-xl font-bold text-gray-800">
                    <i class="fas fa-pencil-alt mr-2 text-yellow-600"></i>Section 2: Defect Description
                </h3>
                <p class="text-sm text-gray-600 mt-1">Inspector's responsibility - Required field marked with *</p>
            </div>

            <!-- Defect Description -->
            <div>
                <label for="defect_description" class="block text-sm font-semibold text-gray-700 mb-2">
                    <span data-i18n="form.defectDescription">Defect Description</span> <span class="text-red-500">*</span>
                </label>
                <textarea id="defect_description" name="defect_description" required rows="4"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="Describe the defect in detail..."></textarea>
            </div>
        </div>

        <!-- SECTION 3: Process Analysis (Operators or Technical Engineer) -->
        <div class="bg-white rounded-lg shadow-md p-6" id="section-process-analysis">
            <div class="border-l-4 border-green-600 pl-4 mb-6">
                <h3 class="text-xl font-bold text-gray-800">
                    <i class="fas fa-tools mr-2 text-green-600"></i><span data-i18n="sections.processAnalysis">Section 3: Process Analysis</span>
                </h3>
                <p class="text-sm text-gray-600 mt-1" data-i18n="sections.processAnalysisDesc">Operators or Technical Engineer only</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Process Description -->
                <div class="md:col-span-2">
                    <label for="process_description" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.processDescription">Process Description</span>
                    </label>
                    <textarea id="process_description" name="process_description" rows="4"
                              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="Enter Process Description..."></textarea>
                </div>

                <!-- Analysis -->
                <div class="md:col-span-2">
                    <label for="analysis" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.analysis">Analysis</span>
                    </label>
                    <textarea id="analysis" name="analysis" rows="4"
                              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="Enter Analysis..."></textarea>
                </div>

                <!-- Analysis By -->
                <div>
                    <label for="analysis_by_id" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.analysisBy">Analysis By</span>
                    </label>
                    <select id="analysis_by_id" name="analysis_by_id"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="">Select Employee</option>
                        <!-- Populated by JS with employee list -->
                    </select>
                </div>
            </div>
        </div>

        <!-- SECTION 4: Engineering (Technical Engineer) -->
        <div class="bg-white rounded-lg shadow-md p-6" id="section-engineer">
            <div class="border-l-4 border-purple-600 pl-4 mb-6">
                <h3 class="text-xl font-bold text-gray-800">
                    <i class="fas fa-cogs mr-2 text-purple-600"></i><span data-i18n="sections.engineering">Section 4: Engineering</span>
                </h3>
                <p class="text-sm text-gray-600 mt-1" data-i18n="sections.engineeringDesc">Technical Engineer only</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Disposition -->
                <div>
                    <label for="final_disposition_id" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.disposition">Disposition</span>
                    </label>
                    <select id="final_disposition_id" name="final_disposition_id"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="">Select Disposition</option>
                        <!-- Populated by JS -->
                    </select>
                </div>

                <!-- DispositionDate -->
                <div>
                    <label for="disposition_date" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.dispositionDate">Disposition Date</span>
                    </label>
                    <input type="date" id="disposition_date" name="disposition_date"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                </div>

                <!-- Engineer -->
                <div>
                    <label for="engineer_id" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.engineer">Engineer</span>
                    </label>
                    <select id="engineer_id" name="engineer_id"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="">Select Technical Engineer</option>
                        <!-- Populated by JS with technical engineers -->
                    </select>
                </div>

                <!-- Failure Code -->
                <div>
                    <label for="failure_code_id" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.failureCode">Failure Code</span>
                    </label>
                    <select id="failure_code_id" name="failure_code_id"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="">Select Failure Code</option>
                        <!-- Populated by JS -->
                    </select>
                </div>

                <!-- Repair/Rework Hours -->
                <div>
                    <label for="rework_hours" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.reworkHours">Repair/Rework Hours</span>
                    </label>
                    <input type="number" id="rework_hours" name="rework_hours" step="0.1" min="0"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                           placeholder="0.0">
                </div>

                <!-- Responsible Department -->
                <div>
                    <label for="responsible_department" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.responsibleDepartment">Responsible Department</span>
                    </label>
                    <input type="text" id="responsible_department" name="responsible_department"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                           placeholder="Enter Department">
                </div>

                <!-- Material Scrap Cost -->
                <div>
                    <label for="material_scrap_cost" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.materialScrapCost">Material Scrap Cost ($)</span>
                    </label>
                    <input type="number" id="material_scrap_cost" name="material_scrap_cost" step="0.01" min="0"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                           placeholder="0.00">
                </div>

                <!-- Other Costs -->
                <div>
                    <label for="other_cost" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.otherCost">Other Costs ($)</span>
                    </label>
                    <input type="number" id="other_cost" name="other_cost" step="0.01" min="0"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                           placeholder="0.00">
                </div>

                <!-- Engineering Remarks -->
                <div class="md:col-span-2">
                    <label for="engineering_remarks" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.engineeringRemarks">Engineering Remarks</span>
                    </label>
                    <textarea id="engineering_remarks" name="engineering_remarks" rows="4"
                              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Describe engineering remarks..."></textarea>
                </div>

                <!-- Repair Process -->
                <div class="md:col-span-2">
                    <label for="repair_process" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.repairProcess">Repair Process</span>
                    </label>
                    <textarea id="repair_process" name="repair_process" rows="3"
                              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Describe the repair process..."></textarea>
                </div>
            </div>
        </div>

        <!-- SECTION 5: Quality (Quality Engineer) -->
        <div class="bg-white rounded-lg shadow-md p-6" id="section-quality">
            <div class="border-l-4 border-red-600 pl-4 mb-6">
                <h3 class="text-xl font-bold text-gray-800">
                    <i class="fas fa-check-circle mr-2 text-red-600"></i><span data-i18n="sections.quality">Section 5: Quality</span>
                </h3>
                <p class="text-sm text-gray-600 mt-1" data-i18n="sections.qualityDesc">Quality Engineer only</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Disposition Approval Date -->
                <div>
                    <label for="disposition_approval_date" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.dispositionApprovalDate">Disposition Approval Date</span>
                    </label>
                    <input type="date" id="disposition_approval_date" name="disposition_approval_date"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                </div>

                <!-- Disposition Approved By -->
                <div>
                    <label for="disposition_approved_by_id" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.dispositionApprovedBy">Disposition Approved By</span>
                    </label>
                    <select id="disposition_approved_by_id" name="disposition_approved_by_id"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="">Select Quality Engineer</option>
                        <!-- Populated by JS with quality engineers -->
                    </select>
                </div>

                <!-- SDR Number -->
                <div class="md:col-span-2">
                    <label for="sdr_number" class="block text-sm font-semibold text-gray-700 mb-2">
                        <span data-i18n="form.sdrNumber">SDR Number</span>
                    </label>
                    <input type="text" id="sdr_number" name="sdr_number"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                           placeholder="Enter SDR Number">
                </div>

                <!-- Close Record Toggle -->
                <div class="flex items-center" >
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            <span data-i18n="form.closeRecord">Close Record</span>
                        </label>
                        <label class="inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="is_closed" name="is_closed" class="sr-only peer">
                            <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            <span class="ms-3 text-sm font-medium text-gray-700" data-i18n="form.markAsClosed">Mark as Closed</span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Warning when record is closed -->
            <div id="closed-warning" class="hidden mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex items-center">
                    <i class="fas fa-exclamation-triangle text-red-600 mr-3"></i>
                    <p class="text-sm text-red-700 font-semibold" data-i18n="form.closedWarning">
                        This record is closed and cannot be edited. No modifications are allowed.
                    </p>
                </div>
            </div>
        </div>

        <!-- Print Buttons (Only visible when record is closed) -->
        <div id="print-buttons-section" class="hidden bg-white rounded-lg shadow-md p-6">
            <div class="border-l-4 border-green-600 pl-4 mb-4">
                <h3 class="text-lg font-bold text-gray-800">
                    <i class="fas fa-print mr-2 text-green-600"></i><span data-i18n="print.options">Print Options</span>
                </h3>
                <p class="text-sm text-gray-600 mt-1" data-i18n="print.optionsDesc">Generate and print different report formats</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- DMT Print Button -->
                <button type="button" onclick="printDMT()"
                        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg transition flex flex-col items-center justify-center space-y-2">
                    <i class="fas fa-file-alt text-3xl"></i>
                    <span class="font-semibold" data-i18n="print.printDMT">Print DMT</span>
                    <span class="text-xs opacity-90" data-i18n="print.dmtDesc">Defective Material Tag</span>
                </button>

                <!-- CAR Print Button -->
                <button type="button" onclick="printCAR()"
                        class="bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 rounded-lg transition flex flex-col items-center justify-center space-y-2">
                    <i class="fas fa-exclamation-triangle text-3xl"></i>
                    <span class="font-semibold" data-i18n="print.printCAR">Print CAR</span>
                    <span class="text-xs opacity-90" data-i18n="print.carDesc">Corrective Action Request</span>
                </button>

                <!-- MRB Print Button -->
                <button type="button" onclick="printMRB()"
                        class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg transition flex flex-col items-center justify-center space-y-2">
                    <i class="fas fa-clipboard-check text-3xl"></i>
                    <span class="font-semibold" data-i18n="print.printMRB">Print MRB</span>
                    <span class="text-xs opacity-90" data-i18n="print.mrbDesc">Material Review Board</span>
                </button>
            </div>
        </div>

        <!-- Form Actions -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
                <div class="text-sm text-gray-600">
                    <i class="fas fa-info-circle mr-2"></i>
                    Fields marked with <span class="text-red-500">*</span> are required
                </div>

                <div class="flex space-x-4">
                    <a href="dashboard.php" class="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg transition">
                        Cancel
                    </a>
                    <button type="submit" id="submit-button"
                            class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition flex items-center">
                        <i class="fas fa-save mr-2"></i>
                        <span id="submit-text"><?php echo $isEditMode ? 'Update Record' : 'Create Record'; ?></span>
                    </button>
                </div>
            </div>
        </div>
    </form>
</div>

<link rel="stylesheet" href="css/print.css">

<script>
    window.USER_ROLE = "<?= $_SESSION['user']['role'] ?>";
    window.API_TOKEN = "<?php echo $_SESSION['token'] ?? ''; ?>";
</script>

<script src="js/i18n.js?v=<?= time() ?>"></script>
<script src="js/api.js?v=<?= time() ?>"></script>

<script src="js/dmt_form_logic.js?v=<?= time() ?>"></script>
<script src="js/print.js?v=<?= time() ?>"></script>


<?php include 'includes/footer.php'; ?>
