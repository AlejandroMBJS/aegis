/*
 * DMT FORM — FINAL CLEAN VERSION
 */


let currentUserRole = null;
let currentRecord = null;
let catalogs = {};
let isEditMode = false;
let currentLanguage = "en";



// --------------- LANGUAGE -----------------

function getCurrentLanguage() {
    return localStorage.getItem("dmt_language") || "en";
}

function saveLanguagePreference(lang) {
    localStorage.setItem("dmt_language", lang);
    currentLanguage = lang;
}

function initLanguageSelector() {
    const selector = document.getElementById("language-selector");
    if (!selector) return;

    selector.value = currentLanguage;

    selector.addEventListener("change", () => {
        saveLanguagePreference(selector.value);
        if (isEditMode && currentRecord) populateFormFields(currentRecord);
    });
}



// --------------- DOMContentLoaded -----------------

document.addEventListener("DOMContentLoaded", async () => {

    // 1️⃣ ROLE
    currentUserRole = window.USER_ROLE;

    // 2️⃣ LANGUAGE
    currentLanguage = getCurrentLanguage();
    initLanguageSelector();

    // 3️⃣ EDIT MODE?
    const rid = document.getElementById("record-id").value;
    isEditMode = rid !== "";

    // 4️⃣ LOAD CATALOGS FIRST
    await loadAllCatalogs();

    // 5️⃣ LOAD RECORD IF EDIT
    if (isEditMode) await loadRecord(rid);

    // 6️⃣ APPLY RBAC
    applyFieldRBAC();
    applySectionRBAC(currentUserRole);

    // 7️⃣ FORM SUBMIT
    setupFormSubmission();
});



// --------------- LOAD CATALOGS -----------------

async function loadAllCatalogs() {
    try {
        const [
            partNumbers,
            workCenters,
            customers,
            levels,
            areas,
            preparedBy,
            inspectionItems,
            processCodes,
            dispositions,
            failureCodes,
            users
        ] = await Promise.all([
            apiGet(`${API_BASE_URL}/entities/partnumber`),
            apiGet(`${API_BASE_URL}/entities/workcenter`),
            apiGet(`${API_BASE_URL}/entities/customer`),
            apiGet(`${API_BASE_URL}/entities/level`),
            apiGet(`${API_BASE_URL}/entities/area`),
            apiGet(`${API_BASE_URL}/entities/preparedby`),
            apiGet(`${API_BASE_URL}/entities/inspectionitem`),
            apiGet(`${API_BASE_URL}/entities/processcode`),
            apiGet(`${API_BASE_URL}/entities/disposition`),
            apiGet(`${API_BASE_URL}/entities/failurecode`),
            apiGet(`${API_BASE_URL}/users/`)
        ]);

        catalogs = {
            partNumbers: partNumbers || [],
            workCenters: workCenters || [],
            customers: customers || [],
            levels: levels || [],
            areas: areas || [],
            preparedBy: preparedBy || [],
            inspectionItems: inspectionItems || [],
            processCodes: processCodes || [],
            dispositions: dispositions || [],
            failureCodes: failureCodes || [],
            users: users || []
        };

        populateSelects();

    } catch (err) {
        console.error(err);
        alert("Error loading catalogs");
    }
}



// --------------- POPULATE SELECTS -----------------

function populateSelects() {
    // Catalog dropdowns
    populate("part_number_id", catalogs.partNumbers);
    populate("work_center_id", catalogs.workCenters);
    populate("customer_id", catalogs.customers);
    populate("level_id", catalogs.levels);
    populate("area_id", catalogs.areas);
    populate("prepared_by_id", catalogs.preparedBy);
    populate("inspection_item_id", catalogs.inspectionItems);
    populate("process_code_id", catalogs.processCodes);
    populate("final_disposition_id", catalogs.dispositions);
    populate("failure_code_id", catalogs.failureCodes);

    // Employee dropdowns (role-filtered)
    populateUsers("analysis_by_id", catalogs.users); // All employees
    populateUsers("engineer_id", catalogs.users.filter(u => u.role === "Tech Engineer"));
    populateUsers("disposition_approved_by_id", catalogs.users.filter(u => u.role === "Quality Engineer"));
}

function populate(id, items) {
    const sel = document.getElementById(id);
    if (!sel) return;

    sel.innerHTML = ""; // Clear existing options to prevent duplicates
    items.forEach(item => {
        const opt = document.createElement("option");
        opt.value = item.id;
        opt.textContent = `${item.item_number} - ${item.item_name}`;
        sel.appendChild(opt);
    });
}

function populateUsers(id, users) {
    const sel = document.getElementById(id);
    if (!sel) return;

    sel.innerHTML = ""; // Clear existing options to prevent duplicates
    users.forEach(user => {
        const opt = document.createElement("option");
        opt.value = user.id;
        opt.textContent = `${user.username} - ${user.full_name}`;
        sel.appendChild(opt);
    });
}



// --------------- LOAD RECORD -----------------

async function loadRecord(id) {
    try {
        currentRecord = await apiGet(`${API_BASE_URL}/dmt/${id}`);
        window.currentRecord = currentRecord;

        populateFormFields(currentRecord);

        if (currentRecord.is_closed) {
            document.getElementById("closed-warning").classList.remove("hidden");
            document.getElementById("print-buttons-section").classList.remove("hidden");
        }

    } catch (err) {
        alert("Record not found");
        window.location.href = "dashboard.php";
    }
}



// --------------- FILL FORM -----------------

function populateFormFields(rec) {

    const text = [
        "defect_description",
        "process_description",
        "analysis",
        "repair_process",
        "engineering_remarks"
    ];

    text.forEach(f => {
        const el = document.getElementById(f);
        if (!el) return;

        const v = rec[`${f}_${currentLanguage}`];
        el.value = v || "";
    });

    const others = [
        "report_number", "part_number_id", "work_center_id",
        "customer_id", "level_id", "area_id",
        "prepared_by_id", "operation", "quantity", "serial_number",
        "inspection_item_id", "process_code_id",
        "analysis_by_id", "engineer_id", "failure_code_id",
        "rework_hours", "responsible_department",
        "material_scrap_cost", "other_cost",
        "final_disposition_id", "disposition_approved_by_id",
        "sdr_number", "is_closed"
    ];

    others.forEach(f => {
        const el = document.getElementById(f);
        if (!el) return;

        if (el.type === "checkbox") el.checked = rec[f];
        else el.value = rec[f] ?? "";
    });

    // Handle date fields separately
    const dateFields = ["date", "disposition_date", "disposition_approval_date"];
    dateFields.forEach(f => {
        const el = document.getElementById(f);
        if (!el || !rec[f]) return;

        // Convert datetime to date format (YYYY-MM-DD)
        const date = new Date(rec[f]);
        el.value = date.toISOString().split('T')[0];
    });
}



// --------------- RBAC FOR FIELDS -----------------

function applyFieldRBAC() {

    // If closed → lock
    if (currentRecord?.is_closed) {
        lockEverything();
        return;
    }

    const allowed = RBAC[currentUserRole] || [];

    const allFields = [
        'report_number',
        'part_number_id',
        'work_center_id',
        'customer_id',
        'level_id',
        'area_id',
        'defect_description',
        'process_analysis',
        'repair_process',
        'rework_hours',
        'engineering_findings',
        'material_scrap_cost',
        'other_cost',
        'final_disposition_id',
        'failure_code_id',
        'approved_by_id',
        'is_closed'
    ];

    allFields.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.disabled = !allowed.includes(id);
    });
}

function lockEverything() {
    document.querySelectorAll("#dmt-form input, #dmt-form select, #dmt-form textarea")
        .forEach(el => el.disabled = true);
}



// --------------- SUBMIT -----------------

function setupFormSubmission() {
    const form = document.getElementById("dmt-form");

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const payload = buildPayload();
        console.log("Submitting payload:", payload);

        try {
            if (isEditMode) {
                // DMT endpoint uses PATCH, not PUT
                await apiPatch(`${API_BASE_URL}/dmt/${currentRecord.id}?language=${currentLanguage}`, payload);
            } else {
                await apiPost(`${API_BASE_URL}/dmt/?language=${currentLanguage}`, payload);
            }

            alert("Saved");
            window.location.href = "dashboard.php";

        } catch (err) {
            console.error("Error saving record:", err);
            console.error("Error details:", err.message);
            alert("Error saving record: " + (err.message || err));
        }
    });
}



// --------------- PAYLOAD -----------------

function buildPayload() {
    const p = {};
    const allowed = RBAC[currentUserRole] || [];

    allowed.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        if (el.type === "checkbox") {
            p[id] = el.checked;
        } else if (el.type === "number") {
            // Only include number if it has a value
            if (el.value !== "") {
                p[id] = Number(el.value);
            }
        } else if (el.type === "date") {
            // Convert date to datetime format (YYYY-MM-DDTHH:MM:SS)
            if (el.value) {
                p[id] = el.value + "T00:00:00";
            }
        } else {
            // For text fields, only include if not empty
            if (el.value && el.value.trim() !== "") {
                p[id] = el.value;
            }
        }
    });

    return p;
}

