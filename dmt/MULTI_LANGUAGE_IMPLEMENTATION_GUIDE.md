# Multi-Language Support Implementation Guide

## Overview

Add English, Chinese (中文), and Spanish (Español) language support to the DMT system while storing all data in English.

**Key Requirements:**
- UI labels and buttons in selected language
- Input placeholders in selected language
- Data stored in English (database)
- User can switch languages on the fly

---

## Recommended Approach: i18next

Use **i18next** - industry-standard JavaScript internationalization library.

**Why i18next:**
- ✅ Simple API
- ✅ Language detection
- ✅ LocalStorage persistence
- ✅ Lightweight (no dependencies)
- ✅ Works with vanilla JS

---

## Implementation Steps

### Step 1: Add i18next Library

**Update `includes/header.php`:**

```php
<!-- Add before closing </head> -->
<script src="https://cdn.jsdelivr.net/npm/i18next@23.7.6/i18next.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/i18next-browser-languagedetector@7.2.0/i18nextBrowserLanguageDetector.min.js"></script>
```

### Step 2: Create Translation Files

**Create `dmt_frontend/js/translations.js`:**

```javascript
/**
 * Translation strings for DMT System
 * Supports: English (en), Chinese (zh), Spanish (es)
 */

const translations = {
    en: {
        // Navigation
        nav: {
            dashboard: "Dashboard",
            createRecord: "Create DMT Record",
            manageCatalogs: "Manage Catalogs",
            logout: "Logout"
        },

        // Login Page
        login: {
            title: "DMT System",
            subtitle: "Defect Management & Tracking",
            employeeNumber: "Employee Number",
            password: "Password",
            signIn: "Sign In",
            signingIn: "Signing in...",
            errorInvalidCredentials: "Invalid credentials. Please try again.",
            errorConnection: "Connection error. Please check if the API is running."
        },

        // Dashboard
        dashboard: {
            title: "DMT Records Dashboard",
            subtitle: "View and manage all defect management records",
            createNew: "Create New Record",
            filters: "Filters",
            status: "Status",
            partNumber: "Part Number",
            workCenter: "Work Center",
            customer: "Customer",
            createdAfter: "Created After",
            createdBefore: "Created Before",
            applyFilters: "Apply Filters",
            clearFilters: "Clear",
            statusAll: "All",
            statusOpen: "Open",
            statusClosed: "Closed",
            noRecordsFound: "No records found",
            tryAdjusting: "Try adjusting your filters or create a new record",
            showingRecords: "Showing {count} records",
            // Table columns
            id: "ID",
            createdBy: "Created By",
            createdAt: "Created At",
            disposition: "Disposition",
            failureCode: "Failure Code",
            actions: "Actions",
            viewEdit: "View/Edit",
            loading: "Loading records..."
        },

        // DMT Form
        form: {
            // Titles
            createTitle: "Create New DMT Record",
            editTitle: "Edit DMT Record #{id}",
            createSubtitle: "Fill in all required fields to create a new record",
            editSubtitle: "Update the fields you have permission to edit",

            // Sections
            section1Title: "Section 1: General Information & Defect Description",
            section1Subtitle: "Inspector's responsibility - Required fields marked with *",
            section2Title: "Section 2: Process Analysis & Repair/Rework",
            section2Subtitle: "Operator's responsibility",
            section3Title: "Section 3: Engineering Analysis & Costs",
            section3Subtitle: "Technical Engineer's responsibility",
            section4Title: "Section 4: Quality Review & Closure",
            section4Subtitle: "Quality Engineer's responsibility - All fields required for closure",

            // Common
            required: "Required",
            optional: "Optional",
            cancel: "Cancel",
            save: "Save",
            create: "Create Record",
            update: "Update Record",
            creating: "Creating...",
            updating: "Updating...",
            backToDashboard: "Back to Dashboard",

            // Fields
            reportNumber: "Report Number",
            defectDescription: "Defect Description",
            defectDescriptionPlaceholder: "Describe the defect in detail...",
            processAnalysis: "Process Analysis",
            processAnalysisPlaceholder: "Describe the process analysis...",
            repairProcess: "Repair Process",
            repairProcessPlaceholder: "Describe the repair process...",
            reworkHours: "Rework Hours",
            engineeringFindings: "Engineering Findings",
            engineeringFindingsPlaceholder: "Describe engineering findings...",
            materialScrapCost: "Material Scrap Cost ($)",
            otherCost: "Other Cost ($)",
            finalDisposition: "Final Disposition",
            selectDisposition: "Select Disposition",
            failureCode: "Failure Code",
            selectFailureCode: "Select Failure Code",
            approvedBy: "Approved By",
            selectUser: "Select User",
            markAsClosed: "Mark as Closed",
            closeRecord: "Close Record",

            // Warnings
            closedWarning: "This record is closed and cannot be edited. No modifications are allowed.",

            // Print
            printOptions: "Print Options",
            printOptionsSubtitle: "Generate and print different report formats",
            printDMT: "Print DMT",
            printDMTDesc: "Defective Material Tag",
            printCAR: "Print CAR",
            printCARDesc: "Corrective Action Request",
            printMRB: "Print MRB",
            printMRBDesc: "Material Review Board",

            // Messages
            recordCreated: "Record created successfully",
            recordUpdated: "Record updated successfully",
            errorLoadingRecord: "Error loading record: {error}",
            errorSavingRecord: "Error saving record: {error}",
            fillRequiredFields: "Please fill in all required fields",
            closureFieldsRequired: "To close a record, you must provide: Final Disposition, Failure Code, and Approved By"
        },

        // Entity Management
        entities: {
            title: "Catalog Management",
            subtitle: "Create, read, update, and delete catalog entries",
            selectCatalog: "Select Catalog",
            selectPlaceholder: "-- Select a Catalog --",
            createNew: "Create New Entry",
            totalEntries: "Total entries: {count}",
            noEntries: "No entries found",
            clickToAdd: "Click \"Create New Entry\" to add one",

            // Modal
            createEntry: "Create Entry",
            editEntry: "Edit Entry",
            itemNumber: "Item Number",
            itemName: "Item Name",
            itemNumberPlaceholder: "Enter item number",
            itemNamePlaceholder: "Enter item name",

            // Delete
            confirmDeletion: "Confirm Deletion",
            cannotBeUndone: "This action cannot be undone",
            sureToDelete: "Are you sure you want to delete {name}?",
            delete: "Delete",

            // Messages
            entryCreated: "Entry created successfully",
            entryUpdated: "Entry updated successfully",
            entryDeleted: "Entry deleted successfully",
            errorLoading: "Error loading entities: {error}",
            errorSaving: "Error saving entry: {error}",
            errorDeleting: "Error deleting entry: {error}",

            // Catalog names
            partnumber: "Part Numbers",
            workcenter: "Work Centers",
            customer: "Customers",
            level: "Levels",
            area: "Areas",
            calibration: "Calibrations",
            inspectionitem: "Inspection Items",
            preparedby: "Prepared By",
            disposition: "Dispositions",
            failurecode: "Failure Codes"
        },

        // Common
        common: {
            loading: "Loading...",
            error: "Error",
            success: "Success",
            warning: "Warning",
            info: "Info",
            yes: "Yes",
            no: "No",
            ok: "OK",
            close: "Close",
            edit: "Edit",
            delete: "Delete",
            create: "Create",
            update: "Update",
            cancel: "Cancel",
            save: "Save",
            search: "Search",
            filter: "Filter",
            clear: "Clear",
            apply: "Apply",
            select: "Select",
            all: "All",
            none: "None",
            date: "Date",
            time: "Time",
            user: "User",
            status: "Status",
            actions: "Actions"
        }
    },

    zh: {
        // Chinese translations
        nav: {
            dashboard: "仪表板",
            createRecord: "创建DMT记录",
            manageCatalogs: "管理目录",
            logout: "登出"
        },

        login: {
            title: "DMT系统",
            subtitle: "缺陷管理与跟踪",
            employeeNumber: "员工编号",
            password: "密码",
            signIn: "登录",
            signingIn: "登录中...",
            errorInvalidCredentials: "凭据无效。请重试。",
            errorConnection: "连接错误。请检查API是否正在运行。"
        },

        dashboard: {
            title: "DMT记录仪表板",
            subtitle: "查看和管理所有缺陷管理记录",
            createNew: "创建新记录",
            filters: "筛选器",
            status: "状态",
            partNumber: "零件编号",
            workCenter: "工作中心",
            customer: "客户",
            createdAfter: "创建日期之后",
            createdBefore: "创建日期之前",
            applyFilters: "应用筛选器",
            clearFilters: "清除",
            statusAll: "全部",
            statusOpen: "开放",
            statusClosed: "已关闭",
            noRecordsFound: "未找到记录",
            tryAdjusting: "尝试调整筛选器或创建新记录",
            showingRecords: "显示 {count} 条记录",
            id: "ID",
            createdBy: "创建者",
            createdAt: "创建时间",
            disposition: "处置",
            failureCode: "故障代码",
            actions: "操作",
            viewEdit: "查看/编辑",
            loading: "加载记录中..."
        },

        form: {
            createTitle: "创建新DMT记录",
            editTitle: "编辑DMT记录 #{id}",
            createSubtitle: "填写所有必填字段以创建新记录",
            editSubtitle: "更新您有权编辑的字段",

            section1Title: "第1部分：基本信息和缺陷描述",
            section1Subtitle: "检查员的责任 - 必填字段标有*",
            section2Title: "第2部分：流程分析和维修/返工",
            section2Subtitle: "操作员的责任",
            section3Title: "第3部分：工程分析和成本",
            section3Subtitle: "技术工程师的责任",
            section4Title: "第4部分：质量审查和关闭",
            section4Subtitle: "质量工程师的责任 - 关闭需要所有字段",

            required: "必填",
            optional: "可选",
            cancel: "取消",
            save: "保存",
            create: "创建记录",
            update: "更新记录",
            creating: "创建中...",
            updating: "更新中...",
            backToDashboard: "返回仪表板",

            reportNumber: "报告编号",
            defectDescription: "缺陷描述",
            defectDescriptionPlaceholder: "详细描述缺陷...",
            processAnalysis: "流程分析",
            processAnalysisPlaceholder: "描述流程分析...",
            repairProcess: "维修流程",
            repairProcessPlaceholder: "描述维修流程...",
            reworkHours: "返工小时",
            engineeringFindings: "工程发现",
            engineeringFindingsPlaceholder: "描述工程发现...",
            materialScrapCost: "材料报废成本 ($)",
            otherCost: "其他成本 ($)",
            finalDisposition: "最终处置",
            selectDisposition: "选择处置",
            failureCode: "故障代码",
            selectFailureCode: "选择故障代码",
            approvedBy: "批准者",
            selectUser: "选择用户",
            markAsClosed: "标记为已关闭",
            closeRecord: "关闭记录",

            closedWarning: "此记录已关闭，无法编辑。不允许任何修改。",

            printOptions: "打印选项",
            printOptionsSubtitle: "生成和打印不同的报告格式",
            printDMT: "打印DMT",
            printDMTDesc: "缺陷材料标签",
            printCAR: "打印CAR",
            printCARDesc: "纠正措施请求",
            printMRB: "打印MRB",
            printMRBDesc: "材料审查委员会",

            recordCreated: "记录创建成功",
            recordUpdated: "记录更新成功",
            errorLoadingRecord: "加载记录时出错：{error}",
            errorSavingRecord: "保存记录时出错：{error}",
            fillRequiredFields: "请填写所有必填字段",
            closureFieldsRequired: "要关闭记录，您必须提供：最终处置、故障代码和批准者"
        },

        entities: {
            title: "目录管理",
            subtitle: "创建、读取、更新和删除目录条目",
            selectCatalog: "选择目录",
            selectPlaceholder: "-- 选择目录 --",
            createNew: "创建新条目",
            totalEntries: "总条目数：{count}",
            noEntries: "未找到条目",
            clickToAdd: "点击\"创建新条目\"以添加",

            createEntry: "创建条目",
            editEntry: "编辑条目",
            itemNumber: "项目编号",
            itemName: "项目名称",
            itemNumberPlaceholder: "输入项目编号",
            itemNamePlaceholder: "输入项目名称",

            confirmDeletion: "确认删除",
            cannotBeUndone: "此操作无法撤消",
            sureToDelete: "您确定要删除 {name} 吗？",
            delete: "删除",

            entryCreated: "条目创建成功",
            entryUpdated: "条目更新成功",
            entryDeleted: "条目删除成功",
            errorLoading: "加载实体时出错：{error}",
            errorSaving: "保存条目时出错：{error}",
            errorDeleting: "删除条目时出错：{error}",

            partnumber: "零件编号",
            workcenter: "工作中心",
            customer: "客户",
            level: "级别",
            area: "区域",
            calibration: "校准",
            inspectionitem: "检查项目",
            preparedby: "准备者",
            disposition: "处置",
            failurecode: "故障代码"
        },

        common: {
            loading: "加载中...",
            error: "错误",
            success: "成功",
            warning: "警告",
            info: "信息",
            yes: "是",
            no: "否",
            ok: "确定",
            close: "关闭",
            edit: "编辑",
            delete: "删除",
            create: "创建",
            update: "更新",
            cancel: "取消",
            save: "保存",
            search: "搜索",
            filter: "筛选",
            clear: "清除",
            apply: "应用",
            select: "选择",
            all: "全部",
            none: "无",
            date: "日期",
            time: "时间",
            user: "用户",
            status: "状态",
            actions: "操作"
        }
    },

    es: {
        // Spanish translations
        nav: {
            dashboard: "Panel",
            createRecord: "Crear Registro DMT",
            manageCatalogs: "Administrar Catálogos",
            logout: "Cerrar Sesión"
        },

        login: {
            title: "Sistema DMT",
            subtitle: "Gestión y Seguimiento de Defectos",
            employeeNumber: "Número de Empleado",
            password: "Contraseña",
            signIn: "Iniciar Sesión",
            signingIn: "Iniciando sesión...",
            errorInvalidCredentials: "Credenciales inválidas. Por favor, inténtelo de nuevo.",
            errorConnection: "Error de conexión. Por favor, verifique si la API está funcionando."
        },

        dashboard: {
            title: "Panel de Registros DMT",
            subtitle: "Ver y administrar todos los registros de gestión de defectos",
            createNew: "Crear Nuevo Registro",
            filters: "Filtros",
            status: "Estado",
            partNumber: "Número de Parte",
            workCenter: "Centro de Trabajo",
            customer: "Cliente",
            createdAfter: "Creado Después",
            createdBefore: "Creado Antes",
            applyFilters: "Aplicar Filtros",
            clearFilters: "Limpiar",
            statusAll: "Todos",
            statusOpen: "Abierto",
            statusClosed: "Cerrado",
            noRecordsFound: "No se encontraron registros",
            tryAdjusting: "Intente ajustar sus filtros o crear un nuevo registro",
            showingRecords: "Mostrando {count} registros",
            id: "ID",
            createdBy: "Creado Por",
            createdAt: "Creado El",
            disposition: "Disposición",
            failureCode: "Código de Falla",
            actions: "Acciones",
            viewEdit: "Ver/Editar",
            loading: "Cargando registros..."
        },

        form: {
            createTitle: "Crear Nuevo Registro DMT",
            editTitle: "Editar Registro DMT #{id}",
            createSubtitle: "Complete todos los campos requeridos para crear un nuevo registro",
            editSubtitle: "Actualice los campos que tiene permiso para editar",

            section1Title: "Sección 1: Información General y Descripción del Defecto",
            section1Subtitle: "Responsabilidad del Inspector - Campos requeridos marcados con *",
            section2Title: "Sección 2: Análisis de Proceso y Reparación/Retrabajo",
            section2Subtitle: "Responsabilidad del Operador",
            section3Title: "Sección 3: Análisis de Ingeniería y Costos",
            section3Subtitle: "Responsabilidad del Ingeniero Técnico",
            section4Title: "Sección 4: Revisión de Calidad y Cierre",
            section4Subtitle: "Responsabilidad del Ingeniero de Calidad - Todos los campos requeridos para el cierre",

            required: "Requerido",
            optional: "Opcional",
            cancel: "Cancelar",
            save: "Guardar",
            create: "Crear Registro",
            update: "Actualizar Registro",
            creating: "Creando...",
            updating: "Actualizando...",
            backToDashboard: "Volver al Panel",

            reportNumber: "Número de Reporte",
            defectDescription: "Descripción del Defecto",
            defectDescriptionPlaceholder: "Describa el defecto en detalle...",
            processAnalysis: "Análisis del Proceso",
            processAnalysisPlaceholder: "Describa el análisis del proceso...",
            repairProcess: "Proceso de Reparación",
            repairProcessPlaceholder: "Describa el proceso de reparación...",
            reworkHours: "Horas de Retrabajo",
            engineeringFindings: "Hallazgos de Ingeniería",
            engineeringFindingsPlaceholder: "Describa los hallazgos de ingeniería...",
            materialScrapCost: "Costo de Desperdicio de Material ($)",
            otherCost: "Otro Costo ($)",
            finalDisposition: "Disposición Final",
            selectDisposition: "Seleccionar Disposición",
            failureCode: "Código de Falla",
            selectFailureCode: "Seleccionar Código de Falla",
            approvedBy: "Aprobado Por",
            selectUser: "Seleccionar Usuario",
            markAsClosed: "Marcar como Cerrado",
            closeRecord: "Cerrar Registro",

            closedWarning: "Este registro está cerrado y no se puede editar. No se permiten modificaciones.",

            printOptions: "Opciones de Impresión",
            printOptionsSubtitle: "Generar e imprimir diferentes formatos de reporte",
            printDMT: "Imprimir DMT",
            printDMTDesc: "Etiqueta de Material Defectuoso",
            printCAR: "Imprimir CAR",
            printCARDesc: "Solicitud de Acción Correctiva",
            printMRB: "Imprimir MRB",
            printMRBDesc: "Junta de Revisión de Materiales",

            recordCreated: "Registro creado exitosamente",
            recordUpdated: "Registro actualizado exitosamente",
            errorLoadingRecord: "Error al cargar el registro: {error}",
            errorSavingRecord: "Error al guardar el registro: {error}",
            fillRequiredFields: "Por favor complete todos los campos requeridos",
            closureFieldsRequired: "Para cerrar un registro, debe proporcionar: Disposición Final, Código de Falla y Aprobado Por"
        },

        entities: {
            title: "Gestión de Catálogos",
            subtitle: "Crear, leer, actualizar y eliminar entradas de catálogo",
            selectCatalog: "Seleccionar Catálogo",
            selectPlaceholder: "-- Seleccione un Catálogo --",
            createNew: "Crear Nueva Entrada",
            totalEntries: "Total de entradas: {count}",
            noEntries: "No se encontraron entradas",
            clickToAdd: "Haga clic en \"Crear Nueva Entrada\" para agregar una",

            createEntry: "Crear Entrada",
            editEntry: "Editar Entrada",
            itemNumber: "Número de Artículo",
            itemName: "Nombre del Artículo",
            itemNumberPlaceholder: "Ingrese el número de artículo",
            itemNamePlaceholder: "Ingrese el nombre del artículo",

            confirmDeletion: "Confirmar Eliminación",
            cannotBeUndone: "Esta acción no se puede deshacer",
            sureToDelete: "¿Está seguro de que desea eliminar {name}?",
            delete: "Eliminar",

            entryCreated: "Entrada creada exitosamente",
            entryUpdated: "Entrada actualizada exitosamente",
            entryDeleted: "Entrada eliminada exitosamente",
            errorLoading: "Error al cargar entidades: {error}",
            errorSaving: "Error al guardar entrada: {error}",
            errorDeleting: "Error al eliminar entrada: {error}",

            partnumber: "Números de Parte",
            workcenter: "Centros de Trabajo",
            customer: "Clientes",
            level: "Niveles",
            area: "Áreas",
            calibration: "Calibraciones",
            inspectionitem: "Artículos de Inspección",
            preparedby: "Preparado Por",
            disposition: "Disposiciones",
            failurecode: "Códigos de Falla"
        },

        common: {
            loading: "Cargando...",
            error: "Error",
            success: "Éxito",
            warning: "Advertencia",
            info: "Información",
            yes: "Sí",
            no: "No",
            ok: "Aceptar",
            close: "Cerrar",
            edit: "Editar",
            delete: "Eliminar",
            create: "Crear",
            update: "Actualizar",
            cancel: "Cancelar",
            save: "Guardar",
            search: "Buscar",
            filter: "Filtrar",
            clear: "Limpiar",
            apply: "Aplicar",
            select: "Seleccionar",
            all: "Todos",
            none: "Ninguno",
            date: "Fecha",
            time: "Hora",
            user: "Usuario",
            status: "Estado",
            actions: "Acciones"
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = translations;
}
```

### Step 3: Create i18n Initialization

**Create `dmt_frontend/js/i18n.js`:**

```javascript
/**
 * i18n Initialization and Helper Functions
 */

// Initialize i18next
document.addEventListener('DOMContentLoaded', () => {
    i18next
        .use(i18nextBrowserLanguageDetector)
        .init({
            resources: translations,
            fallbackLng: 'en',
            lng: localStorage.getItem('language') || 'en',
            interpolation: {
                escapeValue: false // Not needed for JS
            }
        }, (err, t) => {
            if (err) console.error('i18n initialization error:', err);
            updatePageContent();
        });
});

/**
 * Translate a key
 */
function t(key, options = {}) {
    return i18next.t(key, options);
}

/**
 * Change language
 */
function changeLanguage(lang) {
    i18next.changeLanguage(lang, () => {
        localStorage.setItem('language', lang);
        updatePageContent();
    });
}

/**
 * Get current language
 */
function getCurrentLanguage() {
    return i18next.language || 'en';
}

/**
 * Update all page content with translations
 */
function updatePageContent() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = t(key);

        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            if (element.hasAttribute('placeholder')) {
                element.placeholder = translation;
            } else {
                element.value = translation;
            }
        } else {
            element.textContent = translation;
        }
    });

    // Update elements with data-i18n-html (allows HTML)
    document.querySelectorAll('[data-i18n-html]').forEach(element => {
        const key = element.getAttribute('data-i18n-html');
        element.innerHTML = t(key);
    });

    // Update placeholders separately
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key);
    });
}
```

### Step 4: Add Language Selector

**Update `includes/header.php` to add language dropdown:**

```php
<!-- Add to navigation bar, before user info -->
<div class="relative">
    <select id="language-selector"
            class="bg-blue-700 text-white px-3 py-2 rounded border-none focus:outline-none focus:ring-2 focus:ring-blue-300">
        <option value="en">English</option>
        <option value="zh">中文</option>
        <option value="es">Español</option>
    </select>
</div>

<script>
// Language selector handler
document.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('language-selector');
    if (selector) {
        // Set current language
        selector.value = localStorage.getItem('language') || 'en';

        // Handle change
        selector.addEventListener('change', (e) => {
            changeLanguage(e.target.value);
        });
    }
});
</script>
```

### Step 5: Update HTML with Translation Keys

**Example for `dashboard.php`:**

```html
<!-- Before -->
<h2 class="text-3xl font-bold text-gray-800">DMT Records Dashboard</h2>
<p class="text-gray-600 mt-1">View and manage all defect management records</p>

<!-- After -->
<h2 class="text-3xl font-bold text-gray-800" data-i18n="dashboard.title">DMT Records Dashboard</h2>
<p class="text-gray-600 mt-1" data-i18n="dashboard.subtitle">View and manage all defect management records</p>
```

**Example for `dmt_form.php`:**

```html
<!-- Before -->
<label for="defect_description" class="block text-sm font-semibold text-gray-700 mb-2">
    Defect Description <span class="text-red-500">*</span>
</label>
<textarea id="defect_description" name="defect_description" required
          placeholder="Describe the defect in detail..."></textarea>

<!-- After -->
<label for="defect_description" class="block text-sm font-semibold text-gray-700 mb-2">
    <span data-i18n="form.defectDescription">Defect Description</span>
    <span class="text-red-500">*</span>
</label>
<textarea id="defect_description" name="defect_description" required
          data-i18n-placeholder="form.defectDescriptionPlaceholder"></textarea>
```

### Step 6: Update JavaScript Messages

**Example for `dmt_feed.js`:**

```javascript
// Before
showToast('Error loading records: ' + error.message, 'error');

// After
showToast(t('dashboard.errorLoading', { error: error.message }), 'error');
```

**Example for `dmt_form_logic.js`:**

```javascript
// Before
showToast('Record created successfully', 'success');

// After
showToast(t('form.recordCreated'), 'success');
```

---

## Data Storage (Important!)

**All user input is stored in English in the database.**

### How it works:

1. **Display Layer (UI):**
   - Labels, buttons, placeholders → Translated
   - Shown in user's selected language

2. **Data Layer (Database):**
   - User input → Stored as-is (English)
   - No translation applied to data

3. **Print Layer:**
   - Report text → Can be translated
   - User data → Remains in English

**Example:**

```javascript
// User sees (in Chinese):
// 标签: "缺陷描述"
// 输入: "Part is scratched"

// Stored in database:
// defect_description: "Part is scratched"  (English)

// User sees in Spanish later:
// Etiqueta: "Descripción del Defecto"
// Dato: "Part is scratched"  (English - unchanged)
```

---

## Implementation Checklist

### Phase 1: Setup (1-2 hours)
- [ ] Add i18next libraries to header
- [ ] Create translations.js with all strings
- [ ] Create i18n.js with init code
- [ ] Add language selector to header
- [ ] Test language switching

### Phase 2: Update Pages (4-6 hours)
- [ ] Update index.php with data-i18n attributes
- [ ] Update dashboard.php with data-i18n attributes
- [ ] Update dmt_form.php with data-i18n attributes
- [ ] Update entities_crud.php with data-i18n attributes
- [ ] Test all pages in 3 languages

### Phase 3: Update JavaScript (2-3 hours)
- [ ] Update auth.js messages
- [ ] Update dmt_feed.js messages
- [ ] Update dmt_form_logic.js messages
- [ ] Update entities_crud_logic.js messages
- [ ] Test all JS messages in 3 languages

### Phase 4: Print (1-2 hours)
- [ ] Decide if print should be translated
- [ ] If yes, update print.js with translations
- [ ] Test print in 3 languages

### Phase 5: Testing (2-3 hours)
- [ ] Test all features in English
- [ ] Test all features in Chinese
- [ ] Test all features in Spanish
- [ ] Test language switching mid-session
- [ ] Test data storage (verify English in DB)

**Total Estimated Time: 10-16 hours**

---

## Testing Guide

### Test 1: Language Switching

1. Open login page in English
2. Switch to Chinese
3. Verify all labels change
4. Switch to Spanish
5. Verify all labels change
6. Reload page
7. Verify Spanish persists (localStorage)

### Test 2: Data Storage

1. Login as Inspector
2. Switch language to Chinese
3. Create DMT record
4. Enter description in English: "Scratched surface"
5. Save record
6. Check database: verify "Scratched surface" stored
7. Switch to Spanish
8. View record: verify description still shows "Scratched surface"
9. Edit record: add more text
10. Check database: verify text stored in English

### Test 3: All Roles

1. Test each role's workflow in each language
2. Verify RBAC still works correctly
3. Verify field disabling works
4. Verify validation messages appear in correct language

---

## File Structure After Implementation

```
dmt_frontend/
├── js/
│   ├── translations.js  ⭐ NEW (1500 lines)
│   ├── i18n.js          ⭐ NEW (100 lines)
│   ├── auth.js          (updated with t() calls)
│   ├── dmt_feed.js      (updated with t() calls)
│   ├── dmt_form_logic.js(updated with t() calls)
│   └── entities_crud_logic.js (updated with t() calls)
├── includes/
│   └── header.php       (updated with language selector)
├── index.php            (updated with data-i18n attributes)
├── dashboard.php        (updated with data-i18n attributes)
├── dmt_form.php         (updated with data-i18n attributes)
└── entities_crud.php    (updated with data-i18n attributes)
```

---

## Alternative: Server-Side Translation (PHP)

If you prefer PHP-based translation instead of JavaScript:

### Use gettext

1. Install gettext extension
2. Create .po files for each language
3. Use `_("String")` in PHP
4. Compile to .mo files

**Example:**

```php
// In PHP
echo _("Dashboard");  // Returns "仪表板" in Chinese

// In JavaScript
alert(<?php echo json_encode(_("Error message")); ?>);
```

This approach is more complex but provides better SEO and works without JavaScript.

---

## Recommended Approach

**Use i18next (JavaScript-based)** because:
- ✅ Easier to implement
- ✅ Faster language switching (no page reload)
- ✅ Better UX
- ✅ Simpler maintenance
- ✅ LocalStorage persistence
- ✅ Works well with API-driven apps

The DMT system is primarily a data entry application, not a public website, so SEO is not a concern.

---

## Summary

1. **Add i18next library** → Simple script tag
2. **Create translations.js** → 1500 lines (all strings in 3 languages)
3. **Create i18n.js** → 100 lines (initialization)
4. **Add language selector** → Dropdown in header
5. **Update HTML** → Add data-i18n attributes (~200 places)
6. **Update JS** → Replace hardcoded strings with t() (~50 places)
7. **Test** → All features in 3 languages

**Data remains in English in database** - only UI is translated.

This implementation provides professional multi-language support while maintaining data integrity.
