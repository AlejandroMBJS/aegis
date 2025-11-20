/**
 * DMT Feed Module
 * Handles loading, filtering, and rendering of DMT records in the dashboard
 */


let allRecords = [];
let partNumbers = [];
let workCenters = [];
let customers = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        loadCatalogs(),
        loadRecords()
    ]);

    setupEventListeners();
});

/**
 * Load catalog data for filters
 */
async function loadCatalogs() {
    try {
        const [pnData, wcData, custData] = await Promise.all([
            apiGet(`${API_BASE_URL}/entities/partnumber`),
            apiGet(`${API_BASE_URL}/entities/workcenter`),
            apiGet(`${API_BASE_URL}/entities/customer`)
        ]);

        partNumbers = pnData || [];
        workCenters = wcData || [];
        customers = custData || [];

        populateFilterDropdowns();
    } catch (error) {
        console.error('Error loading catalogs:', error);
        showToast('Error loading filter options', 'error');
    }
}

/**
 * Populate filter dropdown menus
 */
function populateFilterDropdowns() {
    const partNumberSelect = document.getElementById('filter-part-number');
    const workCenterSelect = document.getElementById('filter-work-center');
    const customerSelect = document.getElementById('filter-customer');

    // Part Numbers
    partNumbers.forEach(pn => {
        const option = document.createElement('option');
        option.value = pn.id;
        option.textContent = `${pn.item_number} - ${pn.item_name}`;
        partNumberSelect.appendChild(option);
    });

    // Work Centers
    workCenters.forEach(wc => {
        const option = document.createElement('option');
        option.value = wc.id;
        option.textContent = `${wc.item_number} - ${wc.item_name}`;
        workCenterSelect.appendChild(option);
    });

    // Customers
    customers.forEach(cust => {
        const option = document.createElement('option');
        option.value = cust.id;
        option.textContent = `${cust.item_number} - ${cust.item_name}`;
        customerSelect.appendChild(option);
    });
}

/**
 * Load DMT records from API
 */
async function loadRecords(filters = {}) {
    try {
        showLoading();

        // Build query string from filters
        const params = new URLSearchParams();
        if (filters.is_closed !== undefined && filters.is_closed !== '') {
            params.append('is_closed', filters.is_closed);
        }
        if (filters.part_number_id) {
            params.append('part_number_id', filters.part_number_id);
        }
        if (filters.created_after) {
            params.append('created_after', filters.created_after);
        }
        if (filters.created_before) {
            params.append('created_before', filters.created_before);
        }

        const queryString = params.toString();
        const url = `${API_BASE_URL}/dmt/${queryString ? '?' + queryString : ''}`;
        console.log("Fetching:", url);

        allRecords = await apiGet(url);
        console.log("Response:", allRecords);
        if (!allRecords) {
            allRecords = [];
        }

        renderRecordsTable(allRecords);
        updateRecordsCount(allRecords.length);

    } catch (error) {
        console.error('Error loading records:', error);
        showToast('Error loading records: ' + error.message, 'error');
        renderEmptyState('Error loading records');
    } finally {
        hideLoading();
    }
}

/**
 * Render records table
 */
function renderRecordsTable(records) {
    const tbody = document.getElementById('records-table-body');

    if (!records || records.length === 0) {
        renderEmptyState('No records found');
        return;
    }

    // Check if current user is Admin (from PHP session)
    const isAdmin = window.USER_ROLE === 'Admin';

    tbody.innerHTML = records.map(record => `
        <tr class="hover:bg-gray-50 transition">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #${record.id}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${renderStatusBadge(record.is_closed)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${record.created_by_id || 'N/A'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${formatDateTime(record.created_at)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${getPartNumberDisplay(record.part_number_id)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${getWorkCenterDisplay(record.work_center_id)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${getCustomerDisplay(record.customer_id)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${record.final_disposition_id || '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${record.failure_code_id || '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex gap-2">
                    <a href="dmt_form.php?id=${record.id}"
                       class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition inline-flex items-center">
                        <i class="fas fa-edit mr-2"></i>View/Edit
                    </a>
                    ${isAdmin ? `
                        <button onclick="confirmDeleteRecord(${record.id})"
                                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition inline-flex items-center">
                            <i class="fas fa-trash mr-2"></i>Delete
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Render empty state
 */
function renderEmptyState(message) {
    const tbody = document.getElementById('records-table-body');
    tbody.innerHTML = `
        <tr>
            <td colspan="10" class="px-6 py-12 text-center text-gray-500">
                <i class="fas fa-inbox text-4xl mb-3 text-gray-400"></i>
                <p class="text-lg font-semibold">${message}</p>
                <p class="text-sm mt-2">Try adjusting your filters or create a new record</p>
            </td>
        </tr>
    `;
}

/**
 * Render status badge
 */
function renderStatusBadge(isClosed) {
    if (isClosed) {
        return '<span class="status-closed"><i class="fas fa-check-circle mr-1"></i>Closed</span>';
    } else {
        return '<span class="status-open"><i class="fas fa-clock mr-1"></i>Open</span>';
    }
}

/**
 * Get Part Number display text
 */
function getPartNumberDisplay(id) {
    if (!id) return '-';
    const pn = partNumbers.find(p => p.id === id);
    return pn ? `${pn.item_number}` : id;
}

/**
 * Get Work Center display text
 */
function getWorkCenterDisplay(id) {
    if (!id) return '-';
    const wc = workCenters.find(w => w.id === id);
    return wc ? `${wc.item_number}` : id;
}

/**
 * Get Customer display text
 */
function getCustomerDisplay(id) {
    if (!id) return '-';
    const cust = customers.find(c => c.id === id);
    return cust ? `${cust.item_number}` : id;
}

/**
 * Format datetime string
 */
function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Update records count display
 */
function updateRecordsCount(count) {
    document.getElementById('records-count').textContent = count;
}

//Delete record confirmation
function confirmDeleteRecord(recordId) {
    if (!recordId) return;

    if (!confirm("Are you sure you want to delete this record? This action cannot be undone.")) {
        return;
    }

    // Create form dynamically to submit with POST (for PHP)
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'delete_dmt.php';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'id';
    input.value = recordId;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
}
/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Apply filters button
    document.getElementById('apply-filters').addEventListener('click', () => {
        const filters = {
            is_closed: document.getElementById('filter-status').value,
            part_number_id: document.getElementById('filter-part-number').value,
            work_center_id: document.getElementById('filter-work-center').value,
            customer_id: document.getElementById('filter-customer').value,
            created_after: document.getElementById('filter-date-start').value,
            created_before: document.getElementById('filter-date-end').value
        };

        // Remove empty values
        Object.keys(filters).forEach(key => {
            if (filters[key] === '' || filters[key] === undefined) {
                delete filters[key];
            }
        });

        loadRecords(filters);
    });
    

    // Clear filters button
    document.getElementById('clear-filters').addEventListener('click', () => {
        document.getElementById('filter-status').value = '';
        document.getElementById('filter-part-number').value = '';
        document.getElementById('filter-work-center').value = '';
        document.getElementById('filter-customer').value = '';
        document.getElementById('filter-date-start').value = '';
        document.getElementById('filter-date-end').value = '';

        loadRecords();
    });
}
