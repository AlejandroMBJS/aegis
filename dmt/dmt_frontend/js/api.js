// ---------------- CONFIG ----------------
// Using nginx reverse proxy (relative path)
const API_BASE_URL = '/api';

class API {
    constructor(apiToken) {
        this.apiToken = apiToken;
    }

    _getHeaders() {
        // Always get fresh token from localStorage
        const token = localStorage.getItem('access_token') || this.apiToken;
        return {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        };
    }

    async _fetch(url, options) {
        const token = localStorage.getItem('access_token');

        // Debug logging
        if (!token) {
            console.error('No access token found in localStorage');
        }

        const response = await fetch(url, { ...options, headers: this._getHeaders() });

        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
            console.error('API returned 401 Unauthorized for:', url);
            console.error('Token in localStorage:', token ? 'exists' : 'missing');

            // Prevent redirect loop - only redirect once per page load
            if (!window.redirectingToLogin) {
                window.redirectingToLogin = true;

                console.log('Token expired or invalid. Logging out...');

                if (typeof logout === 'function') {
                    await logout();
                } else {
                    // Fallback: clear everything and redirect
                    console.error('logout() function not found. Clearing manually.');
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('token_type');

                    try {
                        await fetch('session_logout.php', {
                            method: 'POST',
                            credentials: 'include'
                        });
                    } catch (e) {
                        console.error('Error destroying session:', e);
                    }

                    window.location.href = 'index.php';
                }
            }
            throw new Error('Authentication expired. Please login again.');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `API error: ${response.status}` }));
            console.error('API Error:', errorData);

            // Handle validation errors better
            if (response.status === 422 && errorData.detail) {
                if (Array.isArray(errorData.detail)) {
                    const errors = errorData.detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join('\n');
                    throw new Error(`Validation Error:\n${errors}`);
                }
            }
            throw new Error(errorData.detail || errorData.message || `API error: ${response.status}`);
        }
        return response.json();
    }

    async get(endpoint) {
        return this._fetch(`${API_BASE_URL}${endpoint}`);
    }

    async post(endpoint, data) {
        return this._fetch(`${API_BASE_URL}${endpoint}`, {
            method: "POST",
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this._fetch(`${API_BASE_URL}${endpoint}`, {
            method: "PUT",
            body: JSON.stringify(data)
        });
    }

    async patch(endpoint, data) {
        return this._fetch(`${API_BASE_URL}${endpoint}`, {
            method: "PATCH",
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "DELETE",
            headers: this.headers
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `API error: ${response.status}` }));
            throw new Error(errorData.detail || `API error: ${response.status}`);
        }
        // DELETE might not return a body, so we don't try to parse JSON if it's empty
        if (response.status === 204) {
            return null;
        }
        return response.json();
    }

    // User Management Methods
    async getUsers() {
        return this.get('/users/');
    }

    async getUser(userId) {
        return this.get(`/users/${userId}`);
    }

    async createUser(userData) {
        return this.post('/users', userData);
    }

    async updateUser(userId, userData) {
        return this.put(`/users/${userId}`, userData);
    }

    async deleteUser(userId) {
        return this.delete(`/users/${userId}`);
    }
    
    // Catalog methods
    async getCatalog(entityName) {
        return this.get(`/entities/${entityName}`);
    }
    
    // DMT methods
    async getDmtRecord(recordId) {
        return this.get(`/dmt/${recordId}`);
    }

    async createDmtRecord(payload, language) {
        return this.post(`/dmt/?language=${language}`, payload);
    }

    async updateDmtRecord(recordId, payload, language) {
        return this.patch(`/dmt/${recordId}?language=${language}`, payload);
    }
}

// This should be initialized in a script tag in the PHP file
// const api = new API(API_TOKEN);

// ---------------- HELPER FUNCTIONS ----------------
// The old helper functions are now part of the API class.
// Keeping old function signatures for compatibility with existing code if needed,
// but ideally, refactor other files to use the API class instance.

const legacyApi = new API(window.API_TOKEN);

async function apiGet(url) {
    // Assuming url is the full path for simplicity
    const endpoint = url.replace(API_BASE_URL, '');
    return legacyApi.get(endpoint);
}

async function apiPost(url, data) {
    const endpoint = url.replace(API_BASE_URL, '');
    return legacyApi.post(endpoint, data);
}

async function apiPut(url, data) {
    const endpoint = url.replace(API_BASE_URL, '');
    return legacyApi.put(endpoint, data);
}

async function apiPatch(url, data) {
    const endpoint = url.replace(API_BASE_URL, '');
    return legacyApi.patch(endpoint, data);
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



// Note: DOMContentLoaded initialization has been moved to dmt_form_logic.js
// to prevent duplicate catalog loading. This file now only provides the API class
// and helper functions.

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