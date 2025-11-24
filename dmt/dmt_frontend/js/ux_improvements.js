/**
 * UX Improvements Module
 * Enhances user experience without changing the UI design
 *
 * Features:
 * - Real-time search
 * - Better date selection
 * - Loading states
 * - Keyboard shortcuts
 * - Quick preview
 * - Better feedback
 */

(function() {
    'use strict';

    // ======================================
    // 1. REAL-TIME SEARCH IMPROVEMENTS
    // ======================================

    /**
     * Add real-time search box to dashboard
     */
    function enhanceSearch() {
        const filterSection = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
        if (!filterSection) return;

        // Check if search already exists
        if (document.getElementById('realtime-search')) return;

        // Create search input container
        const searchContainer = document.createElement('div');
        searchContainer.className = 'lg:col-span-4 mb-4';
        searchContainer.innerHTML = `
            <div class="relative">
                <input
                    type="text"
                    id="realtime-search"
                    placeholder="Quick search by ID, Part Number, Work Center, Customer..."
                    class="w-full px-4 py-3 pl-12 pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                <i class="fas fa-search absolute left-4 top-4 text-gray-400"></i>
                <span id="search-clear" class="absolute right-4 top-3 text-gray-400 cursor-pointer hover:text-gray-600 hidden">
                    <i class="fas fa-times-circle"></i>
                </span>
                <div id="search-results-count" class="absolute right-4 top-4 text-xs text-gray-500 hidden"></div>
            </div>
        `;

        // Insert at the beginning of filter section
        filterSection.parentNode.insertBefore(searchContainer, filterSection);

        // Add real-time search functionality
        const searchInput = document.getElementById('realtime-search');
        const clearBtn = document.getElementById('search-clear');
        const resultsCount = document.getElementById('search-results-count');

        let searchTimeout;

        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);

            // Show/hide clear button
            if (this.value) {
                clearBtn.classList.remove('hidden');
                resultsCount.classList.add('hidden');
            } else {
                clearBtn.classList.add('hidden');
            }

            // Debounce search
            searchTimeout = setTimeout(() => {
                performRealtimeSearch(this.value);
            }, 300);
        });

        clearBtn.addEventListener('click', function() {
            searchInput.value = '';
            clearBtn.classList.add('hidden');
            resultsCount.classList.add('hidden');
            performRealtimeSearch('');
        });

        // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }

    /**
     * Perform real-time search
     */
    function performRealtimeSearch(query) {
        const tbody = document.getElementById('records-table-body');
        if (!tbody) return;

        const rows = tbody.querySelectorAll('tr');
        let visibleCount = 0;

        query = query.toLowerCase().trim();

        rows.forEach(row => {
            if (!query) {
                row.style.display = '';
                visibleCount++;
                return;
            }

            const text = row.textContent.toLowerCase();
            if (text.includes(query)) {
                row.style.display = '';
                row.style.backgroundColor = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        // Update results count
        const resultsCount = document.getElementById('search-results-count');
        if (resultsCount && query) {
            resultsCount.textContent = `${visibleCount} result${visibleCount !== 1 ? 's' : ''}`;
            resultsCount.classList.remove('hidden');
        }
    }

    // ======================================
    // 2. ENHANCED DATE SELECTION
    // ======================================

    /**
     * Improve date inputs with better UX
     */
    function enhanceDateInputs() {
        const dateInputs = document.querySelectorAll('input[type="date"]');

        dateInputs.forEach(input => {
            // Add calendar icon if not present
            if (!input.previousElementSibling || !input.previousElementSibling.classList.contains('date-icon')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'relative';
                input.parentNode.insertBefore(wrapper, input);
                wrapper.appendChild(input);

                // Add quick date buttons for filter inputs
                if (input.id.startsWith('filter-') || input.id.startsWith('export-')) {
                    addQuickDateButtons(input);
                }
            }

            // Add validation feedback
            input.addEventListener('change', function() {
                validateDateRange(this);
            });

            // Add clear button
            addDateClearButton(input);
        });
    }

    /**
     * Add quick date selection buttons
     */
    function addQuickDateButtons(input) {
        const container = input.parentElement;

        const quickButtons = document.createElement('div');
        quickButtons.className = 'flex gap-1 mt-2';
        quickButtons.innerHTML = `
            <button type="button" class="quick-date-btn text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded" data-days="0">Today</button>
            <button type="button" class="quick-date-btn text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded" data-days="7">Week</button>
            <button type="button" class="quick-date-btn text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded" data-days="30">Month</button>
        `;

        container.appendChild(quickButtons);

        // Add event listeners
        quickButtons.querySelectorAll('.quick-date-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const days = parseInt(this.dataset.days);
                const date = new Date();

                if (days === 0) {
                    input.value = date.toISOString().split('T')[0];
                } else if (input.id.includes('start') || input.id.includes('after')) {
                    date.setDate(date.getDate() - days);
                    input.value = date.toISOString().split('T')[0];
                } else {
                    input.value = new Date().toISOString().split('T')[0];
                }

                // Trigger change event
                input.dispatchEvent(new Event('change'));
            });
        });
    }

    /**
     * Add clear button to date input
     */
    function addDateClearButton(input) {
        if (input.nextElementSibling?.classList.contains('date-clear')) return;

        input.addEventListener('input', function() {
            if (this.value && !this.nextElementSibling?.classList.contains('date-clear')) {
                const clearBtn = document.createElement('button');
                clearBtn.type = 'button';
                clearBtn.className = 'date-clear absolute right-2 top-2 text-gray-400 hover:text-gray-600';
                clearBtn.innerHTML = '<i class="fas fa-times-circle text-sm"></i>';
                clearBtn.addEventListener('click', () => {
                    this.value = '';
                    this.dispatchEvent(new Event('change'));
                    clearBtn.remove();
                });

                if (this.parentElement.classList.contains('relative')) {
                    this.parentElement.appendChild(clearBtn);
                }
            }
        });
    }

    /**
     * Validate date range
     */
    function validateDateRange(input) {
        const isStart = input.id.includes('start') || input.id.includes('after');
        const isEnd = input.id.includes('end') || input.id.includes('before');

        if (isStart) {
            const endInput = document.querySelector(`#${input.id.replace('start', 'end').replace('after', 'before')}`);
            if (endInput && endInput.value && input.value > endInput.value) {
                showToastNotification('Start date cannot be after end date', 'warning');
                input.value = '';
            }
        } else if (isEnd) {
            const startInput = document.querySelector(`#${input.id.replace('end', 'start').replace('before', 'after')}`);
            if (startInput && startInput.value && input.value < startInput.value) {
                showToastNotification('End date cannot be before start date', 'warning');
                input.value = '';
            }
        }
    }

    // ======================================
    // 3. LOADING STATES & FEEDBACK
    // ======================================

    /**
     * Enhanced loading states
     */
    function enhanceLoadingStates() {
        // Intercept fetch calls to show loading indicators
        const originalFetch = window.fetch;

        window.fetch = function(...args) {
            const url = args[0];

            // Show loading for API calls
            if (typeof url === 'string' && url.includes('/api/')) {
                showLoadingIndicator();
            }

            return originalFetch.apply(this, args)
                .then(response => {
                    hideLoadingIndicator();
                    return response;
                })
                .catch(error => {
                    hideLoadingIndicator();
                    throw error;
                });
        };
    }

    /**
     * Show loading indicator
     */
    function showLoadingIndicator() {
        if (document.getElementById('global-loading')) return;

        const loader = document.createElement('div');
        loader.id = 'global-loading';
        loader.className = 'fixed top-0 left-0 right-0 h-1 bg-blue-500 z-50';
        loader.style.animation = 'loading-bar 1s ease-in-out infinite';

        document.body.appendChild(loader);

        // Add animation if not exists
        if (!document.getElementById('loading-animation-style')) {
            const style = document.createElement('style');
            style.id = 'loading-animation-style';
            style.textContent = `
                @keyframes loading-bar {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0%); }
                    100% { transform: translateX(100%); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Hide loading indicator
     */
    function hideLoadingIndicator() {
        const loader = document.getElementById('global-loading');
        if (loader) {
            loader.remove();
        }
    }

    /**
     * Show toast notification
     */
    function showToastNotification(message, type = 'info') {
        // Use existing showToast if available
        if (typeof showToast === 'function') {
            showToast(message, type);
            return;
        }

        // Create toast
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg text-white z-50 transition-all transform translate-x-0 ${
            type === 'success' ? 'bg-green-600' :
            type === 'error' ? 'bg-red-600' :
            type === 'warning' ? 'bg-yellow-600' :
            'bg-blue-600'
        }`;
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${
                    type === 'success' ? 'check-circle' :
                    type === 'error' ? 'exclamation-circle' :
                    type === 'warning' ? 'exclamation-triangle' :
                    'info-circle'
                } mr-3"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ======================================
    // 4. TABLE IMPROVEMENTS
    // ======================================

    /**
     * Enhance table interactions
     */
    function enhanceTable() {
        const table = document.querySelector('table');
        if (!table) return;

        // Add row hover effects
        const tbody = table.querySelector('tbody');
        if (tbody) {
            tbody.addEventListener('mouseover', function(e) {
                const row = e.target.closest('tr');
                if (row && !row.querySelector('[colspan]')) {
                    row.style.backgroundColor = '#f9fafb';
                    row.style.transition = 'background-color 0.2s';
                }
            });

            tbody.addEventListener('mouseout', function(e) {
                const row = e.target.closest('tr');
                if (row) {
                    row.style.backgroundColor = '';
                }
            });

            // Add double-click to open record
            tbody.addEventListener('dblclick', function(e) {
                const row = e.target.closest('tr');
                if (row) {
                    const viewBtn = row.querySelector('[href*="dmt_form.php"]');
                    if (viewBtn) {
                        window.location.href = viewBtn.href;
                    }
                }
            });
        }

        // Add sortable headers
        addSortableHeaders(table);
    }

    /**
     * Add sortable headers
     */
    function addSortableHeaders(table) {
        const headers = table.querySelectorAll('thead th');

        headers.forEach((header, index) => {
            // Skip actions column
            if (header.textContent.toLowerCase().includes('action')) return;

            header.style.cursor = 'pointer';
            header.style.userSelect = 'none';

            // Add sort icon
            const icon = document.createElement('i');
            icon.className = 'fas fa-sort ml-2 text-gray-400 text-xs';
            header.appendChild(icon);

            header.addEventListener('click', function() {
                sortTable(table, index, icon);
            });
        });
    }

    /**
     * Sort table by column
     */
    function sortTable(table, columnIndex, icon) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => !row.querySelector('[colspan]'));

        // Determine sort direction
        const currentDirection = icon.dataset.direction || 'asc';
        const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';

        // Update icon
        table.querySelectorAll('thead i').forEach(i => {
            i.className = 'fas fa-sort ml-2 text-gray-400 text-xs';
            delete i.dataset.direction;
        });

        icon.className = `fas fa-sort-${newDirection === 'asc' ? 'up' : 'down'} ml-2 text-blue-600 text-xs`;
        icon.dataset.direction = newDirection;

        // Sort rows
        rows.sort((a, b) => {
            const aValue = a.cells[columnIndex]?.textContent.trim() || '';
            const bValue = b.cells[columnIndex]?.textContent.trim() || '';

            // Try numeric comparison first
            const aNum = parseFloat(aValue);
            const bNum = parseFloat(bValue);

            if (!isNaN(aNum) && !isNaN(bNum)) {
                return newDirection === 'asc' ? aNum - bNum : bNum - aNum;
            }

            // String comparison
            return newDirection === 'asc' ?
                aValue.localeCompare(bValue) :
                bValue.localeCompare(aValue);
        });

        // Reorder rows
        rows.forEach(row => tbody.appendChild(row));
    }

    // ======================================
    // 5. KEYBOARD SHORTCUTS
    // ======================================

    /**
     * Add keyboard shortcuts
     */
    function addKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + N: New record (only for inspectors)
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                const newBtn = document.querySelector('a[href="dmt_form.php"]');
                if (newBtn) {
                    e.preventDefault();
                    window.location.href = newBtn.href;
                }
            }

            // Escape: Clear search
            if (e.key === 'Escape') {
                const searchInput = document.getElementById('realtime-search');
                if (searchInput && searchInput.value) {
                    searchInput.value = '';
                    searchInput.dispatchEvent(new Event('input'));
                }
            }
        });

        // Add keyboard shortcuts help
        addKeyboardShortcutsHelp();
    }

    /**
     * Add keyboard shortcuts help button
     */
    function addKeyboardShortcutsHelp() {
        const header = document.querySelector('h2.text-3xl');
        if (!header || document.getElementById('shortcuts-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'shortcuts-btn';
        btn.className = 'ml-4 text-gray-500 hover:text-gray-700';
        btn.title = 'Keyboard Shortcuts';
        btn.innerHTML = '<i class="fas fa-keyboard"></i>';

        btn.addEventListener('click', showShortcutsModal);

        header.parentElement.insertBefore(btn, header.nextSibling);
    }

    /**
     * Show shortcuts modal
     */
    function showShortcutsModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md">
                <h3 class="text-lg font-bold mb-4">Keyboard Shortcuts</h3>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="font-mono bg-gray-100 px-2 py-1 rounded">Ctrl + K</span>
                        <span>Focus search</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-mono bg-gray-100 px-2 py-1 rounded">Ctrl + N</span>
                        <span>New record</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-mono bg-gray-100 px-2 py-1 rounded">Esc</span>
                        <span>Clear search</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-mono bg-gray-100 px-2 py-1 rounded">Double-click</span>
                        <span>Open record</span>
                    </div>
                </div>
                <button class="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Close</button>
            </div>
        `;

        modal.querySelector('button').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        document.body.appendChild(modal);
    }

    // ======================================
    // 6. RECORD VIEW IMPROVEMENTS
    // ======================================

    /**
     * Add quick preview to dashboard
     */
    function addQuickPreview() {
        const tbody = document.getElementById('records-table-body');
        if (!tbody) return;

        tbody.addEventListener('click', function(e) {
            const quickViewBtn = e.target.closest('.quick-view-btn');
            if (!quickViewBtn) return;

            e.preventDefault();
            const recordId = quickViewBtn.dataset.id;
            showQuickPreview(recordId);
        });
    }

    /**
     * Show quick preview modal
     */
    async function showQuickPreview(recordId) {
        showLoadingIndicator();

        try {
            const record = await apiGet(`${API_BASE_URL}/dmt/${recordId}`);

            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
            modal.innerHTML = `
                <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                        <h3 class="text-xl font-bold">Record #${record.id} - Quick View</h3>
                        <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div><strong>Status:</strong> ${record.is_closed ? 'Closed' : 'Open'}</div>
                            <div><strong>Created:</strong> ${new Date(record.created_at).toLocaleString()}</div>
                            <div class="col-span-2"><strong>Part Number:</strong> ${record.part_number_id || 'N/A'}</div>
                            <div class="col-span-2"><strong>Defect Description:</strong> ${record.defect_description_en || 'N/A'}</div>
                        </div>
                        <div class="mt-6 flex gap-2">
                            <a href="dmt_form.php?id=${record.id}" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Full View</a>
                            <button onclick="this.closest('.fixed').remove()" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Close</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
        } catch (error) {
            showToastNotification('Error loading record', 'error');
        } finally {
            hideLoadingIndicator();
        }
    }

    // ======================================
    // INITIALIZATION
    // ======================================

    /**
     * Initialize all UX improvements
     */
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        console.log('Initializing UX improvements...');

        enhanceSearch();
        enhanceDateInputs();
        enhanceLoadingStates();
        enhanceTable();
        addKeyboardShortcuts();
        addQuickPreview();

        console.log('UX improvements initialized!');
    }

    // Auto-initialize
    init();

})();
