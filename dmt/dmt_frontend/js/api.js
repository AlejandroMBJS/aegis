// ---------------- CONFIG ----------------
// Using nginx reverse proxy (relative path)
const API_BASE_URL = '/api';

// ---------------- HELPER FUNCTIONS ----------------
async function apiGet(url) {
    const response = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json"
        }
    });
    if (!response.ok) throw new Error(`API GET error: ${response.status}`);
    return response.json();
}

async function apiPost(url, data) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API POST error: ${response.status}`);
    return response.json();
}

async function apiPut(url, data) {
    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API PUT error: ${response.status}`);
    return response.json();
}

async function apiPatch(url, data) {
    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API PATCH error: ${response.status}`);
    return response.json();
}

// ---------------- LANGUAGE ----------------

function getCurrentLanguage() {
    // Use same key as i18n system
    return localStorage.getItem("app_language") || "en";
}

function setCurrentLanguage(lang) {
    // Sync with i18n system
    localStorage.setItem("app_language", lang);
    currentLanguage = lang;
    console.log('API language updated to:', lang);
}

function saveLanguagePreference(lang) {
    setCurrentLanguage(lang);
}

// Export for i18n system
window.setCurrentLanguage = setCurrentLanguage;

function initLanguageSelector() {
    const selector = document.getElementById("language-selector");
    if (!selector) return;
    selector.value = currentLanguage;
    selector.addEventListener("change", () => {
        saveLanguagePreference(selector.value);
        if (isEditMode && currentRecord) populateFormFields(currentRecord);
    });
}



// ---------------- DOMContentLoaded ----------------
document.addEventListener("DOMContentLoaded", async () => {
    currentUserRole = window.USER_ROLE;
    currentLanguage = getCurrentLanguage();
    initLanguageSelector();

    const rid = document.getElementById("record-id").value;
    isEditMode = rid !== "";

    await loadAllCatalogs();

    if (isEditMode) await loadRecord(rid);

    applyFieldRBAC();
    applySectionRBAC(currentUserRole);

    setupFormSubmission();
});

// ---------------- LOAD CATALOGS ----------------
async function loadAllCatalogs() {
    try {
        const [
            partNumbers,
            workCenters,
            customers,
            levels,
            areas,
            dispositions,
            failureCodes,
            preparedBys
        ] = await Promise.all([
            apiGet(`${API_BASE_URL}/entities/partnumber`),
            apiGet(`${API_BASE_URL}/entities/workcenter`),
            apiGet(`${API_BASE_URL}/entities/customer`),
            apiGet(`${API_BASE_URL}/entities/level`),
            apiGet(`${API_BASE_URL}/entities/area`),
            apiGet(`${API_BASE_URL}/entities/disposition`),
            apiGet(`${API_BASE_URL}/entities/failurecode`),
            apiGet(`${API_BASE_URL}/entities/preparedby`)
        ]);

        catalogs = {
            partNumbers: partNumbers || [],
            workCenters: workCenters || [],
            customers: customers || [],
            levels: levels || [],
            areas: areas || [],
            dispositions: dispositions || [],
            failureCodes: failureCodes || [],
            users: preparedBys || []
        };

        populateSelects();
    } catch (err) {
        console.error(err);
        alert("Error loading catalogs");
    }
}

// ---------------- POPULATE SELECTS ----------------
function populateSelects() {
    populate("part_number_id", catalogs.partNumbers);
    populate("work_center_id", catalogs.workCenters);
    populate("customer_id", catalogs.customers);
    populate("level_id", catalogs.levels);
    populate("area_id", catalogs.areas);
    populate("final_disposition_id", catalogs.dispositions);
    populate("failure_code_id", catalogs.failureCodes);
    populate("approved_by_id", catalogs.users);
}

function populate(id, items) {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = ""; // clear old options
    items.forEach(item => {
        const opt = document.createElement("option");
        opt.value = item.id;
        opt.textContent = `${item.item_number} - ${item.item_name}`;
        sel.appendChild(opt);
    });
}

// ---------------- LOAD RECORD ----------------
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

// ---------------- FILL FORM ----------------
function populateFormFields(rec) {
    const textFields = ["defect_description","process_analysis","repair_process","engineering_findings"];
    textFields.forEach(f => {
        const el = document.getElementById(f);
        if (!el) return;
        el.value = rec[`${f}_${currentLanguage}`] || "";
    });

    const otherFields = [
        "report_number","part_number_id","work_center_id","customer_id","level_id",
        "area_id","rework_hours","material_scrap_cost","other_cost",
        "final_disposition_id","failure_code_id","approved_by_id","is_closed"
    ];

    otherFields.forEach(f => {
        const el = document.getElementById(f);
        if (!el) return;
        if (el.type === "checkbox") el.checked = rec[f];
        else el.value = rec[f] ?? "";
    });
}

// ---------------- RBAC ----------------
function applyFieldRBAC() {
    if (currentRecord?.is_closed) { lockEverything(); return; }

    const allowed = RBAC[currentUserRole] || [];
    const allFields = [
        'report_number','part_number_id','work_center_id','customer_id','level_id',
        'area_id','defect_description','process_analysis','repair_process','rework_hours',
        'engineering_findings','material_scrap_cost','other_cost','final_disposition_id',
        'failure_code_id','approved_by_id','is_closed'
    ];

    allFields.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.disabled = !allowed.includes(id);
    });
}

function lockEverything() {
    document.querySelectorAll("#dmt-form input,#dmt-form select,#dmt-form textarea")
        .forEach(el => el.disabled = true);
}

// ---------------- FORM SUBMISSION ----------------
function setupFormSubmission() {
    const form = document.getElementById("dmt-form");
    form.addEventListener("submit", async e => {
        e.preventDefault();
        const payload = buildPayload();
        try {
            if (isEditMode) {
                // DMT endpoint uses PATCH
                await apiPatch(`${API_BASE_URL}/dmt/${currentRecord.id}?language=${currentLanguage}`, payload);
            } else {
                await apiPost(`${API_BASE_URL}/dmt/?language=${currentLanguage}`, payload);
            }
            alert("Saved");
            window.location.href = "dashboard.php";
        } catch (err) {
            console.error("Error saving:", err);
            alert("Error saving record: " + err.message);
        }
    });
}

// ---------------- BUILD PAYLOAD ----------------
function buildPayload() {
    const p = {};
    const allowed = RBAC[currentUserRole] || [];
    allowed.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.type === "checkbox") p[id] = el.checked;
        else if (el.type === "number") p[id] = Number(el.value);
        else p[id] = el.value;
    });
    return p;
}
