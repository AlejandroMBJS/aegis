/**
 * RBAC — Field permissions by role
 * Applied only AFTER record + catalogs are loaded
 */

window.RBAC = {
    'Admin': [
        // Section 1: General Information
        'report_number',
        'part_number_id',
        'work_center_id',
        'customer_id',
        'level_id',
        'area_id',
        'prepared_by_id',
        'operation',
        'quantity',
        'serial_number',
        'date',
        'inspection_item_id',
        'process_code_id',
        // Section 2: Defect Description
        'defect_description',
        // Section 3: Process Analysis
        'process_description',
        'analysis',
        'analysis_by_id',
        // Section 4: Engineering
        'final_disposition_id',
        'disposition_date',
        'engineer_id',
        'failure_code_id',
        'rework_hours',
        'responsible_department',
        'material_scrap_cost',
        'other_cost',
        'engineering_remarks',
        'repair_process',
        // Section 5: Quality
        'disposition_approval_date',
        'disposition_approved_by_id',
        'sdr_number',
        'is_closed'
    ],

    'Inspector': [
        // Section 1: General Information
        'report_number',
        'part_number_id',
        'work_center_id',
        'customer_id',
        'level_id',
        'area_id',
        'prepared_by_id',
        'operation',
        'quantity',
        'serial_number',
        'date',
        'inspection_item_id',
        'process_code_id',
        // Section 2: Defect Description
        'defect_description'
    ],

    'Operator': [
        // Section 3: Process Analysis
        'process_description',
        'analysis',
        'analysis_by_id'
    ],

    'Tech Engineer': [
        // Section 3: Process Analysis
        'process_description',
        'analysis',
        'analysis_by_id',
        // Section 4: Engineering
        'final_disposition_id',
        'disposition_date',
        'engineer_id',
        'failure_code_id',
        'rework_hours',
        'responsible_department',
        'material_scrap_cost',
        'other_cost',
        'engineering_remarks',
        'repair_process'
    ],

    'Quality Engineer': [
        // Section 5: Quality
        'disposition_approval_date',
        'disposition_approved_by_id',
        'sdr_number',
        'is_closed'
    ]
};


/**
 * Disable ENTIRE SECTIONS by ROLE
 */
window.applySectionRBAC = function (role) {

    const inspectorSection = document.getElementById("section-inspector");
    const defectDescriptionSection = document.getElementById("section-defect-description");
    const processAnalysisSection = document.getElementById("section-process-analysis");
    const engineerSection = document.getElementById("section-engineer");
    const qualitySection = document.getElementById("section-quality");
    const closeToggle = document.getElementById("is_closed");

    const disableSection = (section) => {
        if (!section) return;
        section.querySelectorAll("input, select, textarea").forEach(el => {
            el.disabled = true;
            el.classList.add("opacity-50", "cursor-not-allowed");
        });
    };

    if (role === "Inspector") {
        disableSection(processAnalysisSection);
        disableSection(engineerSection);
        disableSection(qualitySection);
        if (closeToggle) closeToggle.disabled = true;
    }

    if (role === "Operator") {
        disableSection(inspectorSection);
        disableSection(defectDescriptionSection);
        disableSection(engineerSection);
        disableSection(qualitySection);
        if (closeToggle) closeToggle.disabled = true;
    }

    if (role === "Tech Engineer") {
        disableSection(inspectorSection);
        disableSection(defectDescriptionSection);
        if (closeToggle) closeToggle.disabled = true;
    }

    if (role === "Quality Engineer") {
        disableSection(inspectorSection);
        disableSection(defectDescriptionSection);
        disableSection(processAnalysisSection);
        disableSection(engineerSection);
        if (closeToggle) closeToggle.disabled = false;
    }
};


