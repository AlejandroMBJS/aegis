/**
 * Print Module for DMT System
 * Handles three print formats: DMT, CAR, and MRB
 * Supports trilingual printing (English, Spanish and Chinese)
 */

// Add global print CSS to hide browser headers/footers and control page breaks
if (!document.getElementById('dmt-print-styles')) {
    const printStyles = document.createElement('style');
    printStyles.id = 'dmt-print-styles';
    printStyles.textContent = `
        @page {
            margin: 0mm;
            size: letter portrait;
        }

        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            html, body {
                margin: 0 !important;
                padding: 0 !important;
            }

            /* Hide everything by default */
            body * {
                visibility: hidden !important;
            }

            /* Show only print content */
            #dmt-print-content,
            #dmt-print-content *,
            #car-print-content,
            #car-print-content *,
            #mrb-print-content,
            #mrb-print-content * {
                visibility: visible !important;
            }

            /* Position print content */
            #dmt-print-content,
            #car-print-content,
            #mrb-print-content {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 5mm !important;
                font-family: Arial, sans-serif !important;
                font-size: 10px !important;
                line-height: 1.3 !important;
                background: white !important;
            }
        }
    `;
    document.head.appendChild(printStyles);
}

/**
 * Get report number (auto-increment starting from 1000)
 * Based on DMT record ID or manual entry
 */
function getReportNumber() {
    const reportNumberInput = document.querySelector('[name="report_number"]');
    if (reportNumberInput && reportNumberInput.value) {
        return reportNumberInput.value;
    }

    // Auto-generate from record ID if available
    const recordId = document.getElementById('record-id')?.value;
    if (recordId) {
        return (1000 + parseInt(recordId)).toString();
    }

    return 'N/A';
}

/**
 * Get currently selected language
 */
function getCurrentLanguage() {
    const selector = document.getElementById('language-selector');
    return selector?.value || 'en';
}

/**
 * Get text value for current language from currentRecord
 * Returns text in the selected language
 */
function getCurrentLanguageText(fieldName) {
    // currentRecord comes from dmt_form_logic.js
    if (!window.currentRecord) {
        return '';
    }

    const lang = getCurrentLanguage();
    return window.currentRecord[`${fieldName}_${lang}`] || '';
}

/**
 * Get bilingual text values from currentRecord
 * Returns Spanish and Chinese versions (for backwards compatibility)
 */
function getBilingualText(fieldName) {
    // currentRecord comes from dmt_form_logic.js
    if (!window.currentRecord) {
        return {
            es: '',
            zh: '',
            en: ''
        };
    }

    return {
        en: window.currentRecord[`${fieldName}_en`] || '',
        es: window.currentRecord[`${fieldName}_es`] || '',
        zh: window.currentRecord[`${fieldName}_zh`] || ''
    };
}

/**
 * Get language display info
 */
function getLanguageInfo(lang) {
    const langInfo = {
        'en': { flag: '🇺🇸', name: 'English' },
        'es': { flag: '🇪🇸', name: 'Español' },
        'zh': { flag: '🇨🇳', name: '中文' }
    };
    return langInfo[lang] || langInfo['en'];
}

/**
 * Translate labels based on selected language
 */
function translateLabel(key, lang = null) {
    if (!lang) lang = getCurrentLanguage();

    const translations = {
        // Main headers
        'DMT_TITLE': {
            en: 'DEFECTIVE MATERIAL TAG (DMT)',
            es: 'ETIQUETA DE MATERIAL DEFECTUOSO (DMT)',
            zh: '缺陷材料标签 (DMT)'
        },
        'CAR_TITLE': {
            en: 'CORRECTIVE ACTION REQUEST (CAR)',
            es: 'SOLICITUD DE ACCIÓN CORRECTIVA (CAR)',
            zh: '纠正措施请求 (CAR)'
        },
        'MRB_TITLE': {
            en: 'MATERIAL REVIEW BOARD (MRB) REPORT',
            es: 'INFORME DE JUNTA DE REVISIÓN DE MATERIALES (MRB)',
            zh: '材料审查委员会 (MRB) 报告'
        },
        'REPORT_NO': {
            en: 'Report No',
            es: 'Informe No',
            zh: '报告编号'
        },
        'FORM_NO': {
            en: 'Form No',
            es: 'Formulario No',
            zh: '表格编号'
        },

        // Field labels
        'DEFECT_DESCRIPTION': {
            en: 'DEFECT DESCRIPTION',
            es: 'DESCRIPCIÓN DEL DEFECTO',
            zh: '缺陷描述'
        },
        'PROCESS_ANALYSIS': {
            en: 'PROCESS ANALYSIS',
            es: 'ANÁLISIS DEL PROCESO',
            zh: '过程分析'
        },
        'REPAIR_PROCESS': {
            en: 'REPAIR PROCESS',
            es: 'PROCESO DE REPARACIÓN',
            zh: '修复过程'
        },
        'ENGINEERING_FINDINGS': {
            en: 'ENGINEERING FINDINGS',
            es: 'HALLAZGOS DE INGENIERÍA',
            zh: '工程发现'
        },
        'ROOT_CAUSE': {
            en: 'ROOT CAUSE',
            es: 'CAUSA RAÍZ',
            zh: '根本原因'
        },
        'IMMEDIATE_CORRECTIVE_ACTION': {
            en: 'IMMEDIATE CORRECTIVE ACTION',
            es: 'ACCIÓN CORRECTIVA INMEDIATA',
            zh: '立即纠正措施'
        },
        'PREVENTIVE_ACTION': {
            en: 'PREVENTIVE ACTION',
            es: 'ACCIÓN PREVENTIVA',
            zh: '预防措施'
        },
        'CAR_NO': {
            en: 'CAR No',
            es: 'CAR No',
            zh: 'CAR 编号'
        },
        'PART_NO': {
            en: 'Part No',
            es: 'Parte No',
            zh: '零件编号'
        },
        'DATE': {
            en: 'Date',
            es: 'Fecha',
            zh: '日期'
        },
        'WORK_CENTER': {
            en: 'Work Center',
            es: 'Centro de Trabajo',
            zh: '工作中心'
        },
        'CUSTOMER': {
            en: 'Customer',
            es: 'Cliente',
            zh: '客户'
        },
        'FACILITATOR': {
            en: 'FACILITATOR',
            es: 'FACILITADOR',
            zh: '协调员'
        },
        'SIGNATURE': {
            en: 'Signature',
            es: 'Firma',
            zh: '签名'
        },
        'REVIEWED_BY': {
            en: 'REVIEWED BY (Issuer/ME)',
            es: 'REVISADO POR (Emisor/ME)',
            zh: '审核人 (发行人/ME)'
        },
        'REVIEW_STATUS': {
            en: 'Review Status',
            es: 'Estado de Revisión',
            zh: '审核状态'
        },
        'SATISFACTORY': {
            en: 'Satisfactory',
            es: 'Satisfactorio',
            zh: '满意'
        },
        'NOT_SATISFACTORY': {
            en: 'Not Satisfactory',
            es: 'No Satisfactorio',
            zh: '不满意'
        },
        'CLOSE_CAR_DATE': {
            en: 'CLOSE CAR DATE',
            es: 'FECHA DE CIERRE CAR',
            zh: '关闭CAR日期'
        },
        'ACCEPTED_BY': {
            en: 'Accepted By (QM/QE)',
            es: 'Aceptado Por (QM/QE)',
            zh: '接受人 (QM/QE)'
        },
        'COST_ACCOUNTING': {
            en: 'COST ACCOUNTING',
            es: 'CONTABILIDAD DE COSTOS',
            zh: '成本核算'
        },
        'MATERIAL': {
            en: 'Material',
            es: 'Material',
            zh: '材料'
        },
        'OTHER': {
            en: 'Other',
            es: 'Otro',
            zh: '其他'
        },
        'TOTAL': {
            en: 'Total',
            es: 'Total',
            zh: '总计'
        },
        'VERDICT': {
            en: 'VERDICT',
            es: 'VEREDICTO',
            zh: '裁决'
        },
        'USE': {
            en: 'Use',
            es: 'Usar',
            zh: '使用'
        },
        'REWORK': {
            en: 'Rework',
            es: 'Retrabajo',
            zh: '返工'
        },
        'SCRAP': {
            en: 'Scrap',
            es: 'Desecho',
            zh: '报废'
        },
        'REWORK_SCRAP_OPTIONS': {
            en: 'REWORK/SCRAP/SDR OPTIONS',
            es: 'OPCIONES DE RETRABAJO/DESECHO/SDR',
            zh: '返工/报废/SDR 选项'
        },
        'ENGINEER_SIGN': {
            en: 'Engineer Sign',
            es: 'Firma del Ingeniero',
            zh: '工程师签名'
        },
        'QUALITY_SIGN': {
            en: 'Quality Sign',
            es: 'Firma de Calidad',
            zh: '质量签名'
        },
        'MECHANICAL_ENGINEER': {
            en: 'Mechanical Engineer (ME)',
            es: 'Ingeniero Mecánico (ME)',
            zh: '机械工程师 (ME)'
        },
        'QUALITY_ENGINEER': {
            en: 'Quality Engineer (QE)',
            es: 'Ingeniero de Calidad (QE)',
            zh: '质量工程师 (QE)'
        },
        'QUALITY_MANAGER': {
            en: 'Quality Manager (QM)',
            es: 'Gerente de Calidad (QM)',
            zh: '质量经理 (QM)'
        },
        'ENGINEERING_MANAGER': {
            en: 'Engineering Manager',
            es: 'Gerente de Ingeniería',
            zh: '工程经理'
        },
        'PRODUCTION_MANAGER': {
            en: 'Production Manager',
            es: 'Gerente de Producción',
            zh: '生产经理'
        }
    };

    return translations[key]?.[lang] || translations[key]?.['en'] || key;
}

/**
 * Create trilingual label (all 3 languages for print)
 */
function createTrilingualLabel(labelKey) {
    const en = translateLabel(labelKey, 'en');
    const es = translateLabel(labelKey, 'es');
    const zh = translateLabel(labelKey, 'zh');
    return `${en} / ${es} / ${zh}`;
}

/**
 * Create single-language container HTML for a text field
 * Shows trilingual label but single-language value
 */
function createLanguageContainer(fieldName, labelText) {
    const lang = getCurrentLanguage();
    const text = getCurrentLanguageText(fieldName);
    const trilingualLabel = createTrilingualLabel(labelText);

    return `
        <div class="language-container">
            <div class="language-field">
                <div class="language-label">${trilingualLabel}</div>
                <div class="language-text">${text || 'N/A'}</div>
            </div>
        </div>
    `;
}

/**
 * Create bilingual container HTML for a text field
 * Shows Spanish on left, Chinese on right (for backwards compatibility)
 */
function createBilingualContainer(fieldName, labelText) {
    // Use single language container instead
    return createLanguageContainer(fieldName, labelText);
}

/**
 * Get form value safely
 */
function getFormValue(selector, attribute = 'value') {
    const element = document.querySelector(selector);
    if (!element) return 'N/A';

    if (attribute === 'text' && element.tagName === 'SELECT') {
        return element.selectedOptions[0]?.text || 'N/A';
    }

    return element[attribute] || 'N/A';
}

/**
 * Clean up print classes
 */
function cleanupPrintClasses() {
    document.body.classList.remove('print-dmt', 'print-car', 'print-mrb');
}

/**
 * Set report number attribute for CSS content
 */
function setReportNumberAttr() {
    const form = document.getElementById('dmt-form');
    const reportNumber = getReportNumber();
    form.setAttribute('data-report-number', reportNumber);
}

/**
 * Print DMT (Defective Material Tag)
 * Shows bilingual Spanish/Chinese for all text fields
 */
function printDMT() {
    cleanupPrintClasses();
    setReportNumberAttr();

    const form = document.getElementById('dmt-form');

    // Get form values
    const partNumber = getFormValue('[name="part_number_id"]', 'text');
    const workCenter = getFormValue('[name="work_center_id"]', 'text');
    const preparedBy = getFormValue('[name="approved_by_id"]', 'text');
    const finalDisposition = getFormValue('[name="final_disposition_id"]', 'text');

    // Get multilingual text fields
    const defectDesc = getCurrentLanguageText('defect_description');
    const engineeringFindings = getCurrentLanguageText('engineering_findings');

    // Create trilingual label helper (English / Spanish / Chinese)
    const triLabel = (en, es, zh) => `${en} / ${es} / ${zh}`;

    // Create print content
    const printContent = document.createElement('div');
    printContent.id = 'dmt-print-content';
    printContent.style.cssText = 'font-family: Arial, sans-serif; padding: 8px; max-width: 750px; margin: 0 auto;';

    printContent.innerHTML = `
        <!-- Header -->
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px;">
            <h1 style="margin: 0; font-size: 18px; font-style: italic;">DEFECTIVE MATERIAL TAG (DMT) / ETIQUETA DE MATERIAL DEFECTUOSO / 缺陷材料标签</h1>
            <p style="margin: 6px 0; font-size: 14px; font-style: italic;">${triLabel('Report No', 'Reporte No', '报告编号')}: ${getReportNumber()}</p>
        </div>

        <!-- Top Section: Batch No, Work Center, SN, Quantity -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; border: 2px solid #000; padding: 8px;">
            <div style="border: 1px solid #666; padding: 6px;">
                <em style="font-size: 11px;">${triLabel('Batch No', 'No. de Lote', '批号')}:</em><br>
                <div style="border-bottom: 1px solid #000; height: 22px; margin-top: 3px;"></div>
            </div>
            <div style="border: 1px solid #666; padding: 6px;">
                <em style="font-size: 11px;">${triLabel('Work Center', 'Centro de Trabajo', '工作中心')}:</em><br>
                <div style="margin-top: 3px; font-style: italic; font-size: 11px;">${workCenter || '_________________________'}</div>
            </div>
            <div style="border: 1px solid #666; padding: 6px;">
                <em style="font-size: 11px;">${triLabel('Serial No', 'NS', '序列号')}:</em><br>
                <div style="border-bottom: 1px solid #000; height: 22px; margin-top: 3px;"></div>
            </div>
            <div style="border: 1px solid #666; padding: 6px;">
                <em style="font-size: 11px;">${triLabel('Quantity', 'Cantidad', '数量')}:</em><br>
                <div style="border-bottom: 1px solid #000; height: 22px; margin-top: 3px;"></div>
            </div>
        </div>

        <!-- Part Number and Prepared By -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
            <div style="border: 2px solid #000; padding: 8px;">
                <em style="font-size: 11px;">${triLabel('Part Number', 'Número de Parte', '零件编号')}:</em><br>
                <div style="margin-top: 3px; font-style: italic; font-size: 12px;">${partNumber || 'N/A'}</div>
            </div>
            <div style="border: 2px solid #000; padding: 8px;">
                <em style="font-size: 11px;">${triLabel('Prepared By', 'Preparado Por', '准备人')}:</em><br>
                <div style="margin-top: 3px; font-style: italic; font-size: 11px;">${preparedBy || 'N/A'}</div>
            </div>
        </div>

        <!-- DMT Date -->
        <div style="border: 2px solid #000; padding: 8px; margin-bottom: 12px;">
            <em style="font-size: 11px;">${triLabel('DMT Date', 'Fecha DMT', 'DMT日期')}:</em>
            <span style="border-bottom: 1px solid #000; display: inline-block; width: 150px; margin-left: 5px;"></span>
        </div>

        <!-- Defect Description -->
        <div style="border: 2px solid #000; padding: 8px; margin-bottom: 12px;">
            <em style="font-size: 12px;">${triLabel('DEFECT DESCRIPTION', 'DESCRIPCIÓN DEL DEFECTO', '缺陷描述')}:</em><br>
            <div style="margin-top: 6px; min-height: 60px; white-space: pre-wrap; line-height: 1.5; font-size: 11px;">${defectDesc || 'N/A'}</div>
        </div>

        <!-- Engineering Disposition -->
        <div style="border: 2px solid #000; padding: 8px; margin-bottom: 12px;">
            <em style="font-size: 12px;">${triLabel('ENGINEERING DISPOSITION', 'DISPOSICIÓN DE INGENIERÍA', '工程处置')}:</em><br>
            <div style="margin-top: 6px; font-style: italic; font-size: 11px;">${finalDisposition || 'N/A'}</div>
        </div>

        <!-- Engineering Findings -->
        <div style="border: 2px solid #000; padding: 8px; margin-bottom: 12px;">
            <em style="font-size: 12px;">${triLabel('ENGINEERING FINDINGS', 'HALLAZGOS DE INGENIERÍA', '工程发现')}:</em><br>
            <div style="margin-top: 6px; min-height: 60px; white-space: pre-wrap; line-height: 1.5; font-size: 11px;">${engineeringFindings || 'N/A'}</div>
        </div>

        <!-- Rework Plan -->
        <div style="border: 2px solid #000; padding: 8px; margin-bottom: 12px;">
            <em style="font-size: 12px;">${triLabel('REWORK PLAN', 'PLAN DE RETRABAJO', '返工计划')}:</em><br>
            <div style="margin-top: 6px; min-height: 70px; border: 1px dashed #666; padding: 8px; background-color: #f9f9f9;">
                <!-- To be filled manually -->
            </div>
        </div>

        <!-- Signatures -->
        <div style="border: 2px solid #000; padding: 8px; margin-top: 12px;">
            <div style="margin-bottom: 10px;">
                <em style="font-size: 10px;">${triLabel('Engineer Sign', 'Firma del Ingeniero', '工程师签名')}:</em>
                <span style="border-bottom: 1px solid #000; display: inline-block; width: 200px; margin-left: 5px; margin-right: 15px;"></span>
                <em style="font-size: 10px;">${triLabel('Date', 'Fecha', '日期')}:</em>
                <span style="border-bottom: 1px solid #000; display: inline-block; width: 100px; margin-left: 5px;"></span>
            </div>
            <div>
                <em style="font-size: 10px;">${triLabel('Quality Sign', 'Firma de Calidad', '质量签名')}:</em>
                <span style="border-bottom: 1px solid #000; display: inline-block; width: 200px; margin-left: 5px; margin-right: 15px;"></span>
                <em style="font-size: 10px;">${triLabel('Date', 'Fecha', '日期')}:</em>
                <span style="border-bottom: 1px solid #000; display: inline-block; width: 100px; margin-left: 5px;"></span>
            </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 18px; text-align: center; font-size: 9px; color: #666; border-top: 1px solid #ccc; padding-top: 6px;">
            Form No: DMT-001 | Generated: ${new Date().toLocaleString()}
        </div>
    `;

    // Add print content to body
    document.body.appendChild(printContent);

    // Print after short delay to ensure rendering
    document.body.classList.add('print-dmt');
    setTimeout(() => {
        window.print();

        // Clean up after print dialog closes
        setTimeout(() => {
            cleanupPrintClasses();
            printContent.remove();
        }, 100);
    }, 300);
}

/**
 * Print CAR (Corrective Action Request)
 * Shows bilingual Chinese/Spanish labels with form data
 */
function printCAR() {
    cleanupPrintClasses();
    setReportNumberAttr();

    const form = document.getElementById('dmt-form');

    // Get form values
    const preparedBy = getFormValue('[name="approved_by_id"]', 'text');

    // Get multilingual text fields
    const defectDesc = getCurrentLanguageText('defect_description');
    const processAnalysis = getCurrentLanguageText('process_analysis'); // Root cause
    const repairProcess = getCurrentLanguageText('repair_process'); // Immediate corrective action
    const engineeringFindings = getCurrentLanguageText('engineering_findings'); // Preventive action

    // Create trilingual label helper (English / Spanish / Chinese)
    const triLabel = (en, es, zh) => `${en} / ${es} / ${zh}`;

    // Create print content
    const printContent = document.createElement('div');
    printContent.id = 'car-print-content';
    printContent.style.cssText = 'font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;';

    printContent.innerHTML = `
        <!-- Header -->
        <div style="text-align: center; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px; font-style: italic;">CORRECTIVE ACTION REQUEST (CAR) / SOLICITUD DE ACCIÓN CORRECTIVA / 纠正措施请求</h1>
            <p style="margin: 10px 0; font-size: 16px; font-style: italic;">${triLabel('Report No', 'Reporte No', '报告编号')}: ${getReportNumber()}</p>
        </div>

        <!-- Top Section: Assigned to, Issued by, Dates, MO+SN -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; border: 2px solid #000; padding: 10px;">
            <div style="border: 1px solid #666; padding: 8px;">
                <em>${triLabel('Assigned to', 'Asignado a', '分配给')}:</em><br>
                <div style="border-bottom: 1px solid #000; height: 25px; margin-top: 5px;"></div>
            </div>
            <div style="border: 1px solid #666; padding: 8px;">
                <em>${triLabel('Issued by', 'Emitido por', '发行人')}:</em><br>
                <div style="margin-top: 5px; font-style: italic;">${preparedBy || '___________________________'}</div>
            </div>
            <div style="border: 1px solid #666; padding: 8px;">
                <em>${triLabel('Issue Date', 'Fecha de emisión', '发行日期')}:</em><br>
                <div style="border-bottom: 1px solid #000; height: 25px; margin-top: 5px;"></div>
            </div>
            <div style="border: 1px solid #666; padding: 8px;">
                <em>${triLabel('Return Date', 'Fecha de devolución', '退回日期')}:</em><br>
                <div style="border-bottom: 1px solid #000; height: 25px; margin-top: 5px;"></div>
            </div>
            <div style="border: 1px solid #666; padding: 8px; grid-column: span 2;">
                <em>${triLabel('Work Order + Serial No', 'MO+SN', '工单+序列号')}:</em><br>
                <div style="border-bottom: 1px solid #000; height: 25px; margin-top: 5px;"></div>
            </div>
        </div>

        <!-- Defect Description -->
        <div style="border: 2px solid #000; padding: 10px; margin-bottom: 15px;">
            <em style="font-size: 14px;">${triLabel('DEFECT DESCRIPTION', 'DESCRIPCIÓN DEL DEFECTO', '缺陷描述')}:</em><br>
            <div style="margin-top: 10px; min-height: 60px; white-space: pre-wrap; line-height: 1.5;">${defectDesc || 'N/A'}</div>
        </div>

        <!-- Immediate Corrective Action -->
        <div style="border: 2px solid #000; padding: 10px; margin-bottom: 15px;">
            <em style="font-size: 14px;">${triLabel('IMMEDIATE CORRECTIVE ACTION', 'ACCIÓN CORRECTIVA INMEDIATA', '立即纠正措施')}:</em><br>
            <div style="margin-top: 10px; min-height: 60px; white-space: pre-wrap; line-height: 1.5;">${repairProcess || 'N/A'}</div>
        </div>

        <!-- Root Cause -->
        <div style="border: 2px solid #000; padding: 10px; margin-bottom: 15px;">
            <em style="font-size: 14px;">${triLabel('ROOT CAUSE', 'CAUSA RAÍZ', '根本原因')}:</em><br>
            <div style="margin-top: 10px; min-height: 60px; white-space: pre-wrap; line-height: 1.5;">${processAnalysis || 'N/A'}</div>
        </div>

        <!-- Preventive Action -->
        <div style="border: 2px solid #000; padding: 10px; margin-bottom: 15px;">
            <em style="font-size: 14px;">${triLabel('PREVENTIVE ACTION', 'ACCIÓN PREVENTIVA', '预防措施')}:</em><br>
            <div style="margin-top: 10px; min-height: 60px; white-space: pre-wrap; line-height: 1.5;">${engineeringFindings || 'N/A'}</div>
        </div>

        <!-- Quality Follow Up -->
        <div style="border: 2px solid #000; padding: 10px; margin-bottom: 15px; margin-top: 80px;">
            <em style="font-size: 14px;">${triLabel('QUALITY FOLLOW UP', 'SEGUIMIENTO DE CALIDAD', '质量跟进')}:</em><br>
            <div style="margin-top: 10px; min-height: 60px; border: 1px dashed #666; padding: 10px; background-color: #f9f9f9;">
                <!-- To be filled manually -->
            </div>
        </div>

        <!-- Facilitator Section -->
        <div style="border: 2px solid #000; padding: 10px; margin-bottom: 15px;">
            <em style="font-size: 14px;">${triLabel('FACILITATOR', 'FACILITADOR', '协调员')}:</em>
            <div style="border-bottom: 1px solid #000; height: 25px; margin-top: 5px; width: 300px;"></div>
        </div>

        <!-- Date and Signature Table (8 rows) -->
        <div style="border: 2px solid #000; margin-bottom: 15px;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f0f0f0;">
                        <th style="border: 1px solid #000; padding: 10px; text-align: center; width: 50%;">
                            <em>${triLabel('DATE', 'FECHA', '日期')}</em>
                        </th>
                        <th style="border: 1px solid #000; padding: 10px; text-align: center; width: 50%;">
                            <em>${triLabel('SIGNATURE', 'FIRMA', '签名')}</em>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    ${Array(8).fill(0).map(() => `
                        <tr>
                            <td style="border: 1px solid #000; padding: 15px; height: 40px;"></td>
                            <td style="border: 1px solid #000; padding: 15px; height: 40px;"></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Review and Acceptance Section -->
        <div style="border: 2px solid #000; padding: 15px; margin-bottom: 15px;">
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 10px;">
                <div>
                    <em>${triLabel('Reviewed by Issuer/ME', 'Revisado por Emisor/ME', '审核人发行人/ME')}:</em>
                    <span style="border-bottom: 1px solid #000; display: inline-block; width: 200px; margin-left: 10px;"></span>
                </div>
                <div>
                    <em>${triLabel('Date', 'Fecha', '日期')}:</em>
                    <span style="border-bottom: 1px solid #000; display: inline-block; width: 120px; margin-left: 10px;"></span>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 15px;">
                <div>
                    <em>${triLabel('Accepted by QM/QE', 'Aceptado por QM/QE', '质量经理/工程师接受')}:</em>
                    <span style="border-bottom: 1px solid #000; display: inline-block; width: 200px; margin-left: 10px;"></span>
                </div>
                <div>
                    <em>${triLabel('Date', 'Fecha', '日期')}:</em>
                    <span style="border-bottom: 1px solid #000; display: inline-block; width: 120px; margin-left: 10px;"></span>
                </div>
            </div>

            <!-- Checkboxes -->
            <div style="margin: 15px 0; padding: 10px; background-color: #f9f9f9; border: 1px solid #ccc;">
                <label style="margin-right: 30px; font-style: italic;">
                    <input type="checkbox" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 8px;">
                    ${triLabel('Satisfactory', 'Satisfactorio', '满意')}
                </label>
                <label style="font-style: italic;">
                    <input type="checkbox" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 8px;">
                    ${triLabel('Not Satisfactory', 'No satisfactorio', '不满意')}
                </label>
            </div>

            <!-- Close CAR Date -->
            <div style="margin-top: 15px;">
                <em>${triLabel('Close CAR Date', 'Fecha de cierre CAR', '关闭CAR日期')}:</em>
                <span style="border-bottom: 1px solid #000; display: inline-block; width: 200px; margin-left: 10px;"></span>
            </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 10px;">
            Form No: F19.00-09 | Generated: ${new Date().toLocaleString()}
        </div>
    `;

    // Add print content to body
    document.body.appendChild(printContent);

    // Print after short delay to ensure rendering
    document.body.classList.add('print-car');
    setTimeout(() => {
        window.print();

        // Clean up after print dialog closes
        setTimeout(() => {
            cleanupPrintClasses();
            printContent.remove();
        }, 100);
    }, 300);
}

/**
 * Print MRB (Material Review Board)
 * Shows bilingual Chinese/Spanish labels with form data
 */
function printMRB() {
    cleanupPrintClasses();
    setReportNumberAttr();

    const form = document.getElementById('dmt-form');

    // Get form values
    const partNumber = getFormValue('[name="part_number_id"]', 'text');
    const failureCode = getFormValue('[name="failure_code_id"]', 'text');
    const materialCost = parseFloat(getFormValue('[name="material_scrap_cost"]')) || 0;
    const otherCost = parseFloat(getFormValue('[name="other_cost"]')) || 0;
    const totalCost = materialCost + otherCost;

    // Get multilingual text fields
    const defectDesc = getCurrentLanguageText('defect_description');
    const engineeringComment = getCurrentLanguageText('engineering_findings');

    // Create trilingual label helper (English / Spanish / Chinese)
    const triLabel = (en, es, zh) => `${en} / ${es} / ${zh}`;

    // Create print content
    const printContent = document.createElement('div');
    printContent.id = 'mrb-print-content';
    printContent.style.cssText = 'font-family: Arial, sans-serif; padding: 8px; max-width: 750px; margin: 0 auto;';

    printContent.innerHTML = `
        <!-- Header -->
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 3px; margin-bottom: 4px;">
            <h1 style="margin: 0; font-size: 12px; font-style: italic; line-height: 1.1;">MRB REPORT / INFORME MRB / 材料审查委员会报告</h1>
            <p style="margin: 2px 0; font-size: 10px; font-style: italic;">${triLabel('Report No', 'Reporte No', '报告编号')}: ${getReportNumber()}</p>
        </div>

        <!-- Top Section: Responsible, Dept, Shop Order, SN, Quantity, Part Number -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3px; margin-bottom: 4px; border: 2px solid #000; padding: 3px;">
            <div style="border: 1px solid #666; padding: 2px;">
                <em style="font-size: 8px;">${triLabel('Responsible', 'Responsable', '负责人')}:</em><br>
                <div style="border-bottom: 1px solid #000; height: 12px; margin-top: 1px;"></div>
            </div>
            <div style="border: 1px solid #666; padding: 2px;">
                <em style="font-size: 8px;">${triLabel('Resp Dept', 'Depto Resp', '负责部门')}:</em><br>
                <div style="border-bottom: 1px solid #000; height: 12px; margin-top: 1px;"></div>
            </div>
            <div style="border: 1px solid #666; padding: 2px;">
                <em style="font-size: 8px;">${triLabel('Shop Order', 'Orden', '车间订单')}:</em><br>
                <div style="border-bottom: 1px solid #000; height: 12px; margin-top: 1px;"></div>
            </div>
            <div style="border: 1px solid #666; padding: 2px;">
                <em style="font-size: 8px;">${triLabel('Serial No', 'NS', '序列号')}:</em><br>
                <div style="border-bottom: 1px solid #000; height: 12px; margin-top: 1px;"></div>
            </div>
            <div style="border: 1px solid #666; padding: 2px;">
                <em style="font-size: 8px;">${triLabel('Quantity', 'Cantidad', '数量')}:</em><br>
                <div style="border-bottom: 1px solid #000; height: 12px; margin-top: 1px;"></div>
            </div>
            <div style="border: 1px solid #666; padding: 2px;">
                <em style="font-size: 8px;">${triLabel('Part Number', 'No. Parte', '零件编号')}:</em><br>
                <div style="margin-top: 1px; font-style: italic; font-size: 8px;">${partNumber || 'N/A'}</div>
            </div>
        </div>

        <!-- DMT Date and Failure Code -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3px; margin-bottom: 4px;">
            <div style="border: 2px solid #000; padding: 3px;">
                <em style="font-size: 8px;">${triLabel('DMT Date', 'Fecha DMT', 'DMT日期')}:</em>
                <span style="border-bottom: 1px solid #000; display: inline-block; width: 100px; margin-left: 3px;"></span>
            </div>
            <div style="border: 2px solid #000; padding: 3px;">
                <em style="font-size: 8px;">${triLabel('Failure Code', 'Código', '故障代码')}:</em>
                <span style="margin-left: 3px; font-style: italic; font-size: 8px;">${failureCode || 'N/A'}</span>
            </div>
        </div>

        <!-- Defect Description -->
        <div style="border: 2px solid #000; padding: 3px; margin-bottom: 4px;">
            <em style="font-size: 9px;">${triLabel('DEFECT DESC', 'DESC DEFECTO', '缺陷描述')}:</em><br>
            <div style="margin-top: 2px; min-height: 28px; white-space: pre-wrap; line-height: 1.2; font-size: 8px;">${defectDesc || 'N/A'}</div>
        </div>

        <!-- Engineering Comment -->
        <div style="border: 2px solid #000; padding: 3px; margin-bottom: 4px;">
            <em style="font-size: 9px;">${triLabel('ENG COMMENT', 'COMENT ING', '工程评论')}:</em><br>
            <div style="margin-top: 2px; min-height: 28px; white-space: pre-wrap; line-height: 1.2; font-size: 8px;">${engineeringComment || 'N/A'}</div>
        </div>

        <!-- Cost Accounting -->
        <div id="mrb-cost-accounting" style="border: 2px solid #000; padding: 3px; margin-bottom: 4px;">
            <em style="font-size: 9px;">${triLabel('COST ACCOUNTING', 'CONTABILIDAD', '成本核算')}:</em><br>
            <div style="margin-top: 3px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px;">
                <div>
                    <em style="font-size: 8px;">${triLabel('Material', 'Material', '材料')}:</em>
                    <span style="border-bottom: 1px solid #000; display: inline-block; width: 60px; margin-left: 2px; font-size: 8px;">$${materialCost.toFixed(2)}</span>
                </div>
                <div>
                    <em style="font-size: 8px;">${triLabel('Other', 'Otro', '其他')}:</em>
                    <span style="border-bottom: 1px solid #000; display: inline-block; width: 60px; margin-left: 2px; font-size: 8px;">$${otherCost.toFixed(2)}</span>
                </div>
                <div>
                    <em style="font-size: 8px;">${triLabel('Total', 'Total', '总计')}:</em>
                    <span style="border-bottom: 2px solid #000; display: inline-block; width: 60px; margin-left: 2px; font-style: italic; font-size: 8px;">$${totalCost.toFixed(2)}</span>
                </div>
            </div>
        </div>

        <!-- Department Assess & Engineering Assess -->
        <div style="border: 2px solid #000; padding: 4px; margin-bottom: 4px; margin-top: 4px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 4px;">
                <div style="text-align: center; font-style: italic; font-size: 8px; padding: 2px; background-color: #f0f0f0; border: 1px solid #000;">
                    ${triLabel('DEPT ASSESS', 'EVAL DEPTO', '部门评估')}
                </div>
                <div style="text-align: center; font-style: italic; font-size: 8px; padding: 2px; background-color: #f0f0f0; border: 1px solid #000;">
                    ${triLabel('ENG ASSESS', 'EVAL ING', '工程评估')}
                </div>
            </div>

            <!-- Row 1: ME -->
            <div style="display: grid; grid-template-columns: 30px 2fr 3fr; gap: 3px; margin-bottom: 3px; align-items: center; border-bottom: 1px solid #ccc; padding-bottom: 2px;">
                <div style="font-style: italic; font-size: 8px;">ME:</div>
                <div style="font-size: 7px;">
                    <label style="margin-right: 3px;"><input type="checkbox" style="width: 10px; height: 10px; margin-right: 1px;"> ${triLabel('Use', 'Usar', '使用')}</label>
                    <label style="margin-right: 3px;"><input type="checkbox" style="width: 10px; height: 10px; margin-right: 1px;"> ${triLabel('Rework', 'Retrab', '返工')}</label>
                    <label style="margin-right: 3px;"><input type="checkbox" style="width: 10px; height: 10px; margin-right: 1px;"> ${triLabel('Scrap', 'Desecho', '报废')}</label>
                    <label><input type="checkbox" style="width: 10px; height: 10px; margin-right: 1px;"> SDR</label>
                </div>
                <div style="border-bottom: 1px solid #000; height: 12px;"></div>
            </div>

            <!-- Row 2: QE -->
            <div style="display: grid; grid-template-columns: 30px 2fr 3fr; gap: 3px; margin-bottom: 3px; align-items: center; border-bottom: 1px solid #ccc; padding-bottom: 2px;">
                <div style="font-style: italic; font-size: 8px;">QE:</div>
                <div style="font-size: 7px;">
                    <label style="margin-right: 3px;"><input type="checkbox" style="width: 10px; height: 10px; margin-right: 1px;"> ${triLabel('Rework', 'Retrab', '返工')}</label>
                    <label style="margin-right: 3px;"><input type="checkbox" style="width: 10px; height: 10px; margin-right: 1px;"> ${triLabel('Scrap', 'Desecho', '报废')}</label>
                    <label><input type="checkbox" style="width: 10px; height: 10px; margin-right: 1px;"> SDR</label>
                </div>
                <div style="border-bottom: 1px solid #000; height: 12px;"></div>
            </div>

            <!-- Row 3: MFG -->
            <div style="display: grid; grid-template-columns: 30px 2fr 3fr; gap: 3px; margin-bottom: 3px; align-items: center; border-bottom: 1px solid #ccc; padding-bottom: 2px;">
                <div style="font-style: italic; font-size: 8px;">MFG:</div>
                <div style="font-size: 7px;">
                    <label style="margin-right: 3px;"><input type="checkbox" style="width: 10px; height: 10px; margin-right: 1px;"> ${triLabel('Rework', 'Retrab', '返工')}</label>
                    <label style="margin-right: 3px;"><input type="checkbox" style="width: 10px; height: 10px; margin-right: 1px;"> ${triLabel('Scrap', 'Desecho', '报废')}</label>
                    <label><input type="checkbox" style="width: 10px; height: 10px; margin-right: 1px;"> SDR</label>
                </div>
                <div style="border-bottom: 1px solid #000; height: 12px;"></div>
            </div>

            <!-- Row 4: EM -->
            <div style="display: grid; grid-template-columns: 30px 2fr 3fr; gap: 3px; margin-bottom: 3px; align-items: center; border-bottom: 1px solid #ccc; padding-bottom: 2px;">
                <div style="font-style: italic; font-size: 8px;">EM:</div>
                <div style="font-size: 7px;">
                    <label style="margin-right: 3px;"><input type="checkbox" style="width: 10px; height: 10px; margin-right: 1px;"> ${triLabel('Rework', 'Retrab', '返工')}</label>
                    <label style="margin-right: 3px;"><input type="checkbox" style="width: 10px; height: 10px; margin-right: 1px;"> ${triLabel('Scrap', 'Desecho', '报废')}</label>
                    <label><input type="checkbox" style="width: 10px; height: 10px; margin-right: 1px;"> SDR</label>
                </div>
                <div style="border-bottom: 1px solid #000; height: 12px;"></div>
            </div>

            <!-- Row 5: QM -->
            <div style="display: grid; grid-template-columns: 30px 2fr 3fr; gap: 3px; margin-bottom: 4px; align-items: center; border-bottom: 1px solid #ccc; padding-bottom: 2px;">
                <div style="font-style: italic; font-size: 8px;">QM:</div>
                <div style="font-size: 7px;">
                    <label style="margin-right: 3px;"><input type="checkbox" style="width: 10px; height: 10px; margin-right: 1px;"> ${triLabel('Rework', 'Retrab', '返工')}</label>
                    <label style="margin-right: 3px;"><input type="checkbox" style="width: 10px; height: 10px; margin-right: 1px;"> ${triLabel('Scrap', 'Desecho', '报废')}</label>
                    <label><input type="checkbox" style="width: 10px; height: 10px; margin-right: 1px;"> SDR</label>
                </div>
                <div style="border-bottom: 1px solid #000; height: 12px;"></div>
            </div>

            <!-- Verdict Box -->
            <div style="margin-top: 5px;">
                <em style="font-size: 9px;">${triLabel('VERDICT', 'VEREDICTO', '判定')}:</em>
                <div style="margin-top: 3px; min-height: 40px; border: 2px solid #000; padding: 4px; background-color: #f9f9f9;">
                    <!-- To be filled manually -->
                </div>
            </div>

        </div>

        <!-- Management Signatures -->
        <div style="border: 2px solid #000; padding: 3px; margin-top: 4px; margin-bottom: 4px;">
            <div style="text-align: center; font-style: italic; font-size: 8px; padding: 2px; background-color: #f0f0f0; border-bottom: 1px solid #000; margin-bottom: 3px;">
                ${triLabel('MANAGEMENT SIGNATURES', 'FIRMAS DE GESTIÓN', '管理层签名')}
            </div>

            <!-- ME -->
            <div style="margin-bottom: 2px; font-size: 7px;">
                <em>${triLabel('Mechanical Engineer (ME)', 'Ingeniero Mecánico (ME)', '机械工程师 (ME)')}:</em>
                <span style="border-bottom: 1px solid #000; display: inline-block; width: 140px; margin-left: 3px; margin-right: 10px;"></span>
                <em>${triLabel('Date', 'Fecha', '日期')}:</em>
                <span style="border-bottom: 1px solid #000; display: inline-block; width: 70px; margin-left: 3px;"></span>
            </div>

            <!-- QE -->
            <div style="margin-bottom: 2px; font-size: 7px;">
                <em>${triLabel('Quality Engineer (QE)', 'Ingeniero de Calidad (QE)', '质量工程师 (QE)')}:</em>
                <span style="border-bottom: 1px solid #000; display: inline-block; width: 140px; margin-left: 3px; margin-right: 10px;"></span>
                <em>${triLabel('Date', 'Fecha', '日期')}:</em>
                <span style="border-bottom: 1px solid #000; display: inline-block; width: 70px; margin-left: 3px;"></span>
            </div>

            <!-- QM -->
            <div style="margin-bottom: 2px; font-size: 7px;">
                <em>${triLabel('Quality Manager (QM)', 'Gerente de Calidad (QM)', '质量经理 (QM)')}:</em>
                <span style="border-bottom: 1px solid #000; display: inline-block; width: 140px; margin-left: 3px; margin-right: 10px;"></span>
                <em>${triLabel('Date', 'Fecha', '日期')}:</em>
                <span style="border-bottom: 1px solid #000; display: inline-block; width: 70px; margin-left: 3px;"></span>
            </div>

            <!-- EM -->
            <div style="margin-bottom: 2px; font-size: 7px;">
                <em>${triLabel('Engineering Manager', 'Gerente de Ingeniería', '工程经理')}:</em>
                <span style="border-bottom: 1px solid #000; display: inline-block; width: 140px; margin-left: 3px; margin-right: 10px;"></span>
                <em>${triLabel('Date', 'Fecha', '日期')}:</em>
                <span style="border-bottom: 1px solid #000; display: inline-block; width: 70px; margin-left: 3px;"></span>
            </div>

            <!-- PM -->
            <div style="margin-bottom: 0; font-size: 7px;">
                <em>${triLabel('Production Manager', 'Gerente de Producción', '生产经理')}:</em>
                <span style="border-bottom: 1px solid #000; display: inline-block; width: 140px; margin-left: 3px; margin-right: 10px;"></span>
                <em>${triLabel('Date', 'Fecha', '日期')}:</em>
                <span style="border-bottom: 1px solid #000; display: inline-block; width: 70px; margin-left: 3px;"></span>
            </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 6px; text-align: center; font-size: 7px; color: #666; border-top: 1px solid #ccc; padding-top: 3px;">
            Form No: MRB-001 | Generated: ${new Date().toLocaleString()}
        </div>
    `;

    // Add print content to body
    document.body.appendChild(printContent);

    // Print after short delay to ensure rendering
    document.body.classList.add('print-mrb');
    setTimeout(() => {
        window.print();

        // Clean up after print dialog closes
        setTimeout(() => {
            cleanupPrintClasses();
            printContent.remove();
        }, 100);
    }, 300);
}

/**
 * Initialize print functionality
 * Auto-generate report number if not present
 */
document.addEventListener('DOMContentLoaded', () => {
    const reportNumberInput = document.querySelector('[name="report_number"]');
    if (reportNumberInput && !reportNumberInput.value) {
        const recordId = document.getElementById('record-id')?.value;
        if (recordId) {
            reportNumberInput.value = (1000 + parseInt(recordId)).toString();
        }
    }
});
