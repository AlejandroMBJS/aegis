/**
 * Entities CRUD Logic Module
 * Handles Create, Read, Update, Delete operations for catalog entities
 * Admin only access
 */

// API_BASE_URL is already defined in auth.js

let currentEntityType = '';
let currentEntityData = [];
let itemToDelete = null;
let isEditMode = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Entities CRUD: DOM loaded, setting up event listeners...');
    setupEventListeners();
    console.log('Entities CRUD: Event listeners setup complete');
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Entity selector change
    document.getElementById('entity-selector').addEventListener('change', (e) => {
        currentEntityType = e.target.value;
        if (currentEntityType) {
            loadEntities(currentEntityType);
            document.getElementById('create-new-button').disabled = false;
        } else {
            document.getElementById('entities-container').classList.add('hidden');
            document.getElementById('create-new-button').disabled = true;
        }
    });

    // Create new button
    const createButton = document.getElementById('create-new-button');
    if (createButton) {
        createButton.addEventListener('click', () => {
            console.log('Create button clicked, opening modal...');
            openModal(false);
        });
        console.log('Create button event listener attached');
    } else {
        console.error('Create button not found!');
    }

    // Modal close buttons
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('cancel-button').addEventListener('click', closeModal);

    // Form submission
    document.getElementById('entity-form').addEventListener('submit', handleFormSubmit);

    // Delete modal buttons
    document.getElementById('cancel-delete').addEventListener('click', closeDeleteModal);
    document.getElementById('confirm-delete').addEventListener('click', handleDelete);
}

/**
 * Load entities from API
 */
async function loadEntities(entityType) {
    try {
        showLoading();

        const data = await apiGet(`${API_BASE_URL}/entities/${entityType}`);
        currentEntityData = data || [];

        renderEntitiesTable(currentEntityData, entityType);
        document.getElementById('entities-container').classList.remove('hidden');

    } catch (error) {
        console.error('Error loading entities:', error);
        showToast('Error loading entities: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Render entities table
 */
function renderEntitiesTable(entities, entityType) {
    const tbody = document.getElementById('entities-table-body');
    const titleElement = document.getElementById('entity-title');
    const countElement = document.getElementById('entities-count');

    // Set title
    const entityNames = {
        'partnumber': 'Part Numbers',
        'workcenter': 'Work Centers',
        'customer': 'Customers',
        'level': 'Levels',
        'area': 'Areas',
        'calibration': 'Calibrations',
        'inspectionitem': 'Inspection Items',
        'preparedby': 'Prepared By',
        'disposition': 'Dispositions',
        'failurecode': 'Failure Codes'
    };
    titleElement.textContent = entityNames[entityType] || entityType;

    // Set count
    countElement.textContent = entities.length;

    // Render rows
    if (entities.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-16 text-center">
                    <div class="flex flex-col items-center justify-center">
                        <div class="bg-gray-100 rounded-full p-6 mb-4">
                            <i class="fas fa-inbox text-5xl text-gray-400"></i>
                        </div>
                        <p class="text-xl font-bold text-gray-700 mb-2">No entries found</p>
                        <p class="text-sm text-gray-500">Click "Create New Entry" to add your first entry</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = entities.map(entity => `
        <tr class="hover:bg-blue-50 transition-all duration-200 group">
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center justify-center w-8 h-8 bg-gray-100 group-hover:bg-blue-100 text-gray-700 group-hover:text-blue-700 rounded-full font-bold text-sm transition-all duration-200">
                    ${entity.id}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <span class="inline-flex items-center px-3 py-1 rounded-md bg-blue-100 text-blue-800 font-mono font-semibold text-sm">
                        ${escapeHtml(entity.item_number)}
                    </span>
                </div>
            </td>
            <td class="px-6 py-4">
                <span class="text-sm text-gray-700 font-medium">${escapeHtml(entity.item_name)}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex items-center space-x-2">
                    <button onclick="editEntity(${entity.id})"
                            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 inline-flex items-center shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                        <i class="fas fa-edit mr-1.5"></i>Edit
                    </button>
                    <button onclick="confirmDeleteEntity(${entity.id}, '${escapeHtml(entity.item_number)}')"
                            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 inline-flex items-center shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                        <i class="fas fa-trash-alt mr-1.5"></i>Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Open modal for create/edit
 */
function openModal(edit = false, entity = null) {
    console.log('openModal called, edit mode:', edit, 'entity:', entity);
    isEditMode = edit;
    const modal = document.getElementById('entity-modal');
    const modalTitle = document.getElementById('modal-title');
    const submitButtonText = document.getElementById('submit-button-text');

    if (!modal) {
        console.error('Modal element not found!');
        return;
    }

    if (edit && entity) {
        modalTitle.textContent = 'Edit Entry';
        submitButtonText.textContent = 'Update';
        document.getElementById('entity-id').value = entity.id;
        document.getElementById('item_number').value = entity.item_number;
        document.getElementById('item_name').value = entity.item_name;
    } else {
        modalTitle.textContent = 'Create New Entry';
        submitButtonText.textContent = 'Create';
        document.getElementById('entity-form').reset();
        document.getElementById('entity-id').value = '';
    }

    document.getElementById('entity-name').value = currentEntityType;
    console.log('Removing hidden class from modal...');
    modal.classList.remove('hidden');

    // Trigger animation
    const modalContent = document.getElementById('modal-content');
    if (modalContent) {
        setTimeout(() => {
            modalContent.classList.remove('scale-95', 'opacity-0');
            modalContent.classList.add('scale-100', 'opacity-100');
        }, 10);
    }

    console.log('Modal should now be visible');
}

/**
 * Close modal
 */
function closeModal() {
    const modal = document.getElementById('entity-modal');
    const modalContent = document.getElementById('modal-content');

    // Animate out
    if (modalContent) {
        modalContent.classList.remove('scale-100', 'opacity-100');
        modalContent.classList.add('scale-95', 'opacity-0');
    }

    // Hide after animation
    setTimeout(() => {
        modal.classList.add('hidden');
        document.getElementById('entity-form').reset();
    }, 200);
}

/**
 * Handle form submission (create or update)
 */
async function handleFormSubmit(e) {
    e.preventDefault();

    const entityId = document.getElementById('entity-id').value;
    const entityName = document.getElementById('entity-name').value;
    const itemNumber = document.getElementById('item_number').value;
    const itemName = document.getElementById('item_name').value;

    const payload = {
        item_number: itemNumber,
        item_name: itemName
    };

    try {
        showLoading();

        if (isEditMode && entityId) {
            // Update (PUT)
            await apiPut(`${API_BASE_URL}/entities/${entityName}/${entityId}`, payload);
            showToast('Entry updated successfully', 'success');
        } else {
            // Create (POST)
            await apiPost(`${API_BASE_URL}/entities/${entityName}`, payload);
            showToast('Entry created successfully', 'success');
        }

        closeModal();
        loadEntities(entityName);

    } catch (error) {
        console.error('Error saving entity:', error);
        showToast('Error saving entry: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Edit entity (global function for onclick)
 */
window.editEntity = function(id) {
    const entity = currentEntityData.find(e => e.id === id);
    if (entity) {
        openModal(true, entity);
    }
};

/**
 * Confirm delete entity
 */
window.confirmDeleteEntity = function(id, itemNumber) {
    itemToDelete = id;
    document.getElementById('delete-item-name').textContent = itemNumber;
    document.getElementById('delete-modal').classList.remove('hidden');
};

/**
 * Close delete modal
 */
function closeDeleteModal() {
    document.getElementById('delete-modal').classList.add('hidden');
    itemToDelete = null;
}

/**
 * Handle delete
 */
async function handleDelete() {
    if (!itemToDelete) return;

    try {
        showLoading();

        await apiDelete(`${API_BASE_URL}/entities/${currentEntityType}/${itemToDelete}`);
        showToast('Entry deleted successfully', 'success');

        closeDeleteModal();
        loadEntities(currentEntityType);

    } catch (error) {
        console.error('Error deleting entity:', error);
        showToast('Error deleting entry: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}
