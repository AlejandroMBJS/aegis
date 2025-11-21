/**
 * Global i18n (Internationalization) System
 * Handles UI translations across the entire application
 */

// Current global language
let globalLanguage = 'en';

// All UI translations
const translations = {
    // Login Page
    login: {
        subtitle: { en: 'Defect Management & Tracking', es: 'Gestión y Seguimiento de Defectos', zh: '缺陷管理与跟踪' },
        employeeNumber: { en: 'Employee Number', es: 'Número de Empleado', zh: '员工编号' },
        password: { en: 'Password', es: 'Contraseña', zh: '密码' },
        signIn: { en: 'Sign In', es: 'Iniciar Sesión', zh: '登录' },
        demoCredentials: { en: 'Demo Credentials:', es: 'Credenciales de Demostración:', zh: '演示凭据：' }
    },

    // Language Selector
    languageSelector: {
        title: { en: 'Language Selection', es: 'Selección de Idioma', zh: '语言选择' },
        description: { en: 'Select your preferred language', es: 'Seleccione su idioma preferido', zh: '选择您的首选语言' },
        info: { en: 'UI and data will display in selected language. Print labels show all languages.', es: 'La interfaz y los datos se mostrarán en el idioma seleccionado. Las etiquetas de impresión muestran todos los idiomas.', zh: '界面和数据将以所选语言显示。打印标签显示所有语言。' }
    },

    // Navigation & Common
    nav: {
        dashboard: { en: 'Dashboard', es: 'Panel', zh: '仪表板' },
        createRecord: { en: 'Create DMT Record', es: 'Crear Registro DMT', zh: '创建DMT记录' },
        manageCatalogs: { en: 'Manage Catalogs', es: 'Gestionar Catálogos', zh: '管理目录' },
        manageUsers: { en: 'Manage Users', es: 'Gestionar Usuarios', zh: '管理用户' },
        logout: { en: 'Logout', es: 'Cerrar Sesión', zh: '登出' }
    },

    // User Management Page
    manageUsers: {
        title: { en: 'User Management', es: 'Gestión de Usuarios', zh: '用户管理' },
        addUser: { en: 'Add New User', es: 'Añadir Nuevo Usuario', zh: '添加新用户' },
        table: {
            fullName: { en: 'Full Name', es: 'Nombre Completo', zh: '全名' },
            username: { en: 'Username', es: 'Nombre de Usuario', zh: '用户名' },
            email: { en: 'Email', es: 'Correo Electrónico', zh: '电子邮件' },
            role: { en: 'Role', es: 'Rol', zh: '角色' },
            actions: { en: 'Actions', es: 'Acciones', zh: '操作' }
        },
        modal: {
            addUserTitle: { en: 'Add New User', es: 'Añadir Nuevo Usuario', zh: '添加新用户' },
            editUserTitle: { en: 'Edit User', es: 'Editar Usuario', zh: '编辑用户' }
        },
        form: {
            fullName: { en: 'Full Name', es: 'Nombre Completo', zh: '全名' },
            username: { en: 'Username', es: 'Nombre de Usuario', zh: '用户名' },
            email: { en: 'Email', es: 'Correo Electrónico', zh: '电子邮件' },
            role: { en: 'Role', es: 'Rol', zh: '角色' },
            password: { en: 'Password', es: 'Contraseña', zh: '密码' },
            passwordHint: { en: 'Leave blank to keep current password.', es: 'Dejar en blanco para mantener la contraseña actual.', zh: '留空以保留当前密码。' }
        },
        buttons: {
            save: { en: 'Save', es: 'Guardar', zh: '保存' },
            cancel: { en: 'Cancel', es: 'Cancelar', zh: '取消' },
            edit: { en: 'Edit', es: 'Editar', zh: '编辑' },
            delete: { en: 'Delete', es: 'Eliminar', zh: '删除' }
        }
    },

    // Roles
    roles: {
        inspector: { en: 'Inspector', es: 'Inspector', zh: '检查员' },
        admin: { en: 'Admin', es: 'Administrador', zh: '管理员' },
        viewer: { en: 'Viewer', es: 'Espectador', zh: '查看者' }
    },

    // Form Labels
    form: {
        reportNumber: { en: 'Report Number', es: 'Número de Reporte', zh: '报告编号' },
        partNumber: { en: 'Part Number', es: 'Número de Parte', zh: '零件编号' },
        workCenter: { en: 'Work Center', es: 'Centro de Trabajo', zh: '工作中心' },
        customer: { en: 'Customer', es: 'Cliente', zh: '客户' },
        quantity: { en: 'Quantity', es: 'Cantidad', zh: '数量' },
        defectDescription: { en: 'Defect Description', es: 'Descripción del Defecto', zh: '缺陷描述' },
        processAnalysis: { en: 'Process Analysis', es: 'Análisis del Proceso', zh: '过程分析' },
        repairProcess: { en: 'Repair Process', es: 'Proceso de Reparación', zh: '修复过程' },
        engineeringFindings: { en: 'Engineering Findings', es: 'Hallazgos de Ingeniería', zh: '工程发现' },
        reworkHours: { en: 'Rework Hours', es: 'Horas de Retrabajo', zh: '返工小时' },
        materialCost: { en: 'Material Scrap Cost', es: 'Costo de Material de Desecho', zh: '材料报废成本' },
        otherCost: { en: 'Other Cost', es: 'Otro Costo', zh: '其他成本' },
        disposition: { en: 'Final Disposition', es: 'Disposición Final', zh: '最终处置' },
        failureCode: { en: 'Failure Code', es: 'Código de Falla', zh: '故障代码' },
        preparedBy: { en: 'Prepared By', es: 'Preparado Por', zh: '准备人' },
        inspectionDate: { en: 'Inspection Date', es: 'Fecha de Inspección', zh: '检查日期' },
        level: { en: 'Level', es: 'Nivel', zh: '级别' },
        area: { en: 'Area', es: 'Área', zh: '区域' },
        date: { en: 'Date', es: 'Fecha', zh: '日期' },
        processCode: { en: 'Process Code', es: 'Código de Proceso', zh: '过程代码' },
        operation: { en: 'Operation', es: 'Operación', zh: '操作' },
        serialNumber: { en: 'Serial Number', es: 'Número de Serie', zh: '序列号' },
        batchNumber: { en: 'Batch Number', es: 'Número de Lote', zh: '批号' },
        inspectionItem: { en: 'Inspection Item', es: 'Elemento de Inspección', zh: '检查项目' },
        calibration: { en: 'Calibration', es: 'Calibración', zh: '校准' },
        shopOrder: { en: 'Shop Order', es: 'Orden de Taller', zh: '车间订单' },
        responsible: { en: 'Responsible', es: 'Responsable', zh: '负责人' },
        responsibleDepartment: { en: 'Responsible Department', es: 'Departamento Responsable', zh: '负责部门' }
    },

    // Buttons & Actions
    actions: {
        save: { en: 'Save', es: 'Guardar', zh: '保存' },
        cancel: { en: 'Cancel', es: 'Cancelar', zh: '取消' },
        create: { en: 'Create', es: 'Crear', zh: '创建' },
        update: { en: 'Update', es: 'Actualizar', zh: '更新' },
        delete: { en: 'Delete', es: 'Eliminar', zh: '删除' },
        edit: { en: 'Edit', es: 'Editar', zh: '编辑' },
        print: { en: 'Print', es: 'Imprimir', zh: '打印' },
        close: { en: 'Close', es: 'Cerrar', zh: '关闭' },
        submit: { en: 'Submit', es: 'Enviar', zh: '提交' }
    },

    // Print Formats
    print: {
        printDMT: { en: 'Print DMT', es: 'Imprimir DMT', zh: '打印DMT' },
        printCAR: { en: 'Print CAR', es: 'Imprimir CAR', zh: '打印CAR' },
        printMRB: { en: 'Print MRB', es: 'Imprimir MRB', zh: '打印MRB' }
    },

    // Status & Messages
    status: {
        open: { en: 'Open', es: 'Abierto', zh: '打开' },
        closed: { en: 'Closed', es: 'Cerrado', zh: '关闭' },
        pending: { en: 'Pending', es: 'Pendiente', zh: '待处理' },
        approved: { en: 'Approved', es: 'Aprobado', zh: '已批准' },
        all: { en: 'All', es: 'Todos', zh: '全部' }
    },

    // Dashboard Page
    dashboard: {
        title: { en: 'DMT Records Dashboard', es: 'Panel de Registros DMT', zh: 'DMT记录仪表板' },
        subtitle: { en: 'View and manage all defect management records', es: 'Ver y gestionar todos los registros de gestión de defectos', zh: '查看和管理所有缺陷管理记录' },
        createNewRecord: { en: 'Create New Record', es: 'Crear Nuevo Registro', zh: '创建新记录' },
        filters: { en: 'Filters', es: 'Filtros', zh: '筛选' },
        applyFilters: { en: 'Apply Filters', es: 'Aplicar Filtros', zh: '应用筛选' },
        clear: { en: 'Clear', es: 'Limpiar', zh: '清除' },
        createdAfter: { en: 'Created After', es: 'Creado Después', zh: '创建后' },
        createdBefore: { en: 'Created Before', es: 'Creado Antes', zh: '创建前' },
        loadingRecords: { en: 'Loading records...', es: 'Cargando registros...', zh: '加载记录中...' },
        showing: { en: 'Showing', es: 'Mostrando', zh: '显示' },
        records: { en: 'records', es: 'registros', zh: '记录' },
        createdBy: { en: 'Created By', es: 'Creado Por', zh: '创建人' },
        createdAt: { en: 'Created At', es: 'Creado En', zh: '创建时间' },
        export: { en: 'Export to CSV', es: 'Exportar a CSV', zh: '导出为CSV' },
        exportStartDate: { en: 'Start Date', es: 'Fecha de Inicio', zh: '开始日期' },
        exportEndDate: { en: 'End Date', es: 'Fecha de Fin', zh: '结束日期' },
        quickSelect: { en: 'Quick Select', es: 'Selección Rápida', zh: '快速选择' },
        customRange: { en: 'Custom Range', es: 'Rango Personalizado', zh: '自定义范围' },
        today: { en: 'Today', es: 'Hoy', zh: '今天' },
        thisWeek: { en: 'This Week', es: 'Esta Semana', zh: '本周' },
        thisMonth: { en: 'This Month', es: 'Este Mes', zh: '本月' },
        allRecords: { en: 'All Records', es: 'Todos los Registros', zh: '所有记录' },
        exportLanguage: { en: 'Export Language', es: 'Idioma de Exportación', zh: '导出语言' },
        exportButton: { en: 'Export CSV', es: 'Exportar CSV', zh: '导出CSV' }
    },

    // Entities/Catalogs Page
    catalogs: {
        title: { en: 'Catalog Management', es: 'Gestión de Catálogos', zh: '目录管理' },
        subtitle: { en: 'Create, read, update, and delete catalog entries', es: 'Crear, leer, actualizar y eliminar entradas de catálogo', zh: '创建、读取、更新和删除目录条目' },
        selectCatalogType: { en: 'Select Catalog Type', es: 'Seleccionar Tipo de Catálogo', zh: '选择目录类型' },
        catalog: { en: 'Catalog', es: 'Catálogo', zh: '目录' },
        selectCatalog: { en: '-- Select a Catalog --', es: '-- Seleccionar un Catálogo --', zh: '-- 选择目录 --' },
        partNumbers: { en: 'Part Numbers', es: 'Números de Parte', zh: '零件编号' },
        workCenters: { en: 'Work Centers', es: 'Centros de Trabajo', zh: '工作中心' },
        customers: { en: 'Customers', es: 'Clientes', zh: '客户' },
        levels: { en: 'Levels', es: 'Niveles', zh: '级别' },
        areas: { en: 'Areas', es: 'Áreas', zh: '区域' },
        calibrations: { en: 'Calibrations', es: 'Calibraciones', zh: '校准' },
        inspectionItems: { en: 'Inspection Items', es: 'Elementos de Inspección', zh: '检查项目' },
        preparedBy: { en: 'Prepared By', es: 'Preparado Por', zh: '准备人' },
        dispositions: { en: 'Dispositions', es: 'Disposiciones', zh: '处置' },
        failureCodes: { en: 'Failure Codes', es: 'Códigos de Falla', zh: '故障代码' },
        createNewEntry: { en: 'Create New Entry', es: 'Crear Nueva Entrada', zh: '创建新条目' },
        entries: { en: 'entries', es: 'entradas', zh: '条目' },
        id: { en: 'ID', es: 'ID', zh: 'ID' },
        itemNumber: { en: 'Item Number', es: 'Número de Artículo', zh: '项目编号' },
        itemName: { en: 'Item Name', es: 'Nombre del Artículo', zh: '项目名称' },
        createEntry: { en: 'Create Entry', es: 'Crear Entrada', zh: '创建条目' },
        editEntry: { en: 'Edit Entry', es: 'Editar Entrada', zh: '编辑条目' },
        confirmDeletion: { en: 'Confirm Deletion', es: 'Confirmar Eliminación', zh: '确认删除' },
        cannotUndo: { en: 'This action cannot be undone', es: 'Esta acción no se puede deshacer', zh: '此操作无法撤消' },
        confirmDeleteMessage: { en: 'Are you sure you want to delete', es: '¿Está seguro de que desea eliminar', zh: '您确定要删除吗' },
        required: { en: '*', es: '*', zh: '*' }
    },

    // Common Table Headers
    table: {
        id: { en: 'ID', es: 'ID', zh: 'ID' },
        status: { en: 'Status', es: 'Estado', zh: '状态' },
        actions: { en: 'Actions', es: 'Acciones', zh: '操作' }
    }
};

/**
 * Set global language
 */
function setGlobalLanguage(lang) {
    if (!['en', 'es', 'zh'].includes(lang)) {
        console.error('Unsupported language:', lang);
        return;
    }
    globalLanguage = lang;
    localStorage.setItem('app_language', lang);

    // Update api.js currentLanguage if it exists
    if (window.setCurrentLanguage) {
        window.setCurrentLanguage(lang);
    }

    // Update UI
    updateUI();

    console.log('Global language changed to:', lang);
}

/**
 * Get global language
 */
function getGlobalLanguage() {
    return globalLanguage;
}

/**
 * Translate a key path (e.g., 'form.partNumber')
 */
function t(keyPath) {
    const keys = keyPath.split('.');
    let value = translations;

    // Navigate through nested object
    for (const key of keys) {
        value = value[key];
        if (value === undefined) {
            console.warn('Translation not found:', keyPath, '- returning key');
            return keyPath;
        }
    }

    // value should now be an object with language keys
    const translated = value[globalLanguage] || value['en'];
    if (!translated) {
        console.warn('No translation for language:', globalLanguage, 'key:', keyPath);
        return keyPath;
    }

    return translated;
}

/**
 * Update all UI elements with data-i18n attribute
 */
function updateUI() {
    const elements = document.querySelectorAll('[data-i18n]');
    console.log('Updating', elements.length, 'elements with i18n');

    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translated = t(key);

        // For option elements with emoji prefix, preserve the emoji
        if (element.tagName === 'OPTION') {
            const currentText = element.textContent;
            const emojiMatch = currentText.match(/^([\u{1F000}-\u{1F9FF}]+\s*)/u);
            if (emojiMatch) {
                element.textContent = emojiMatch[0] + translated;
            } else {
                element.textContent = translated;
            }
        } else {
            element.textContent = translated;
        }

        console.log('Translated', key, '→', translated);
    });
}

/**
 * Initialize i18n system
 */
function initI18n() {
    // Load saved language or default to English
    const savedLang = localStorage.getItem('app_language') || 'en';
    setGlobalLanguage(savedLang);

    // Sync with ALL language selectors
    const selectors = [
        document.getElementById('language-selector'),
        document.getElementById('global-language-selector')
    ];

    selectors.forEach(selector => {
        if (selector) {
            selector.value = savedLang;
            selector.addEventListener('change', (e) => {
                setGlobalLanguage(e.target.value);
                // Update all other selectors
                selectors.forEach(s => {
                    if (s && s !== selector) s.value = e.target.value;
                });
            });
        }
    });

    console.log('i18n initialized with language:', savedLang);
}

// Auto-initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
} else {
    initI18n();
}

// Export for use in other files
window.i18n = {
    t,
    setGlobalLanguage,
    getGlobalLanguage
};
