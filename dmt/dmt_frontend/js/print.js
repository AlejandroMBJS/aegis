/**
 * Print Module for DMT System
 * Handles three print formats: DMT, CAR, and MRB
 * Supports bilingual printing (Spanish and Chinese side-by-side)
 */

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

    // Create bilingual label helper (Chinese / Spanish)
    const biLabel = (zh, es) => `${zh} / ${es}`;

    // Create print content
    const printContent = document.createElement('div');
    printContent.id = 'dmt-print-content';
    printContent.style.cssText = 'font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;';

    printContent.innerHTML = `
        <!-- Header -->
        <div style="text-align: center; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">缺陷材料标签 (DMT)</h1>
            <h2 style="margin: 5px 0; font-size: 20px; font-weight: bold;">ETIQUETA DE MATERIAL DEFECTUOSO</h2>
            <p style="margin: 10px 0; font-size: 16px; font-weight: bold;">${biLabel('报告编号', 'Reporte No')}: ${getReportNumber()}</p>
        </div>

        <!-- Top Section: Batch No, Work Center, SN, Quantity -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; border: 2px solid #000; padding: 10px;">
            <div style="border: 1px solid #666; padding: 8px;">
                <strong>${biLabel('批号', 'No. de Lote')}:</strong><br>
                <div style="border-bottom: 1px solid #000; height: 25px; margin-top: 5px;"></div>
            </div>
            <div style="border: 1px solid #666; padding: 8px;">
                <strong>${biLabel('工作中心', 'Centro de Trabajo')}:</strong><br>
                <div style="margin-top: 5px; font-weight: bold;">${workCenter || '_________________________'}</div>
            </div>
            <div style="border: 1px solid #666; padding: 8px;">
                <strong>${biLabel('序列号', 'NS')}:</strong><br>
                <div style="border-bottom: 1px solid #000; height: 25px; margin-top: 5px;"></div>
            </div>
            <div style="border: 1px solid #666; padding: 8px;">
                <strong>${biLabel('数量', 'Cantidad')}:</strong><br>
                <div style="border-bottom: 1px solid #000; height: 25px; margin-top: 5px;"></div>
            </div>
        </div>

        <!-- Part Number and Prepared By -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
            <div style="border: 2px solid #000; padding: 10px;">
                <strong>${biLabel('零件编号', 'Número de Parte')}:</strong><br>
                <div style="margin-top: 5px; font-weight: bold; font-size: 16px;">${partNumber || 'N/A'}</div>
            </div>
            <div style="border: 2px solid #000; padding: 10px;">
                <strong>${biLabel('准备人', 'Preparado Por')}:</strong><br>
                <div style="margin-top: 5px; font-weight: bold;">${preparedBy || 'N/A'}</div>
            </div>
        </div>

        <!-- DMT Date -->
        <div style="border: 2px solid #000; padding: 10px; margin-bottom: 15px;">
            <strong>${biLabel('DMT日期', 'Fecha DMT')}:</strong>
            <span style="border-bottom: 1px solid #000; display: inline-block; width: 200px; margin-left: 10px;"></span>
        </div>

        <!-- Defect Description -->
        <div style="border: 2px solid #000; padding: 10px; margin-bottom: 15px;">
            <strong style="font-size: 14px;">${biLabel('缺陷描述', 'DESCRIPCIÓN DEL DEFECTO')}:</strong><br>
            <div style="margin-top: 10px; min-height: 80px; white-space: pre-wrap; line-height: 1.5;">${defectDesc || 'N/A'}</div>
        </div>

        <!-- Engineering Disposition -->
        <div style="border: 2px solid #000; padding: 10px; margin-bottom: 15px;">
            <strong style="font-size: 14px;">${biLabel('工程处置', 'DISPOSICIÓN DE INGENIERÍA')}:</strong><br>
            <div style="margin-top: 10px; font-weight: bold;">${finalDisposition || 'N/A'}</div>
        </div>

        <!-- Engineering Findings -->
        <div style="border: 2px solid #000; padding: 10px; margin-bottom: 15px;">
            <strong style="font-size: 14px;">${biLabel('工程发现', 'HALLAZGOS DE INGENIERÍA')}:</strong><br>
            <div style="margin-top: 10px; min-height: 80px; white-space: pre-wrap; line-height: 1.5;">${engineeringFindings || 'N/A'}</div>
        </div>

        <!-- Rework Plan -->
        <div style="border: 2px solid #000; padding: 10px; margin-bottom: 15px;">
            <strong style="font-size: 14px;">${biLabel('返工计划', 'PLAN DE RETRABAJO')}:</strong><br>
            <div style="margin-top: 10px; min-height: 100px; border: 1px dashed #666; padding: 10px; background-color: #f9f9f9;">
                <!-- To be filled manually -->
            </div>
        </div>

        <!-- Signatures -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px;">
            <div style="border: 2px solid #000; padding: 15px;">
                <strong>${biLabel('工程师签名', 'Firma del Ingeniero')}:</strong><br>
                <div style="margin-top: 40px; border-bottom: 2px solid #000;"></div>
                <div style="text-align: center; margin-top: 5px; font-size: 12px;">
                    ${biLabel('签名/日期', 'Firma / Fecha')}
                </div>
            </div>
            <div style="border: 2px solid #000; padding: 15px;">
                <strong>${biLabel('质量签名', 'Firma de Calidad')}:</strong><br>
                <div style="margin-top: 40px; border-bottom: 2px solid #000;"></div>
                <div style="text-align: center; margin-top: 5px; font-size: 12px;">
                    ${biLabel('签名/日期', 'Firma / Fecha')}
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 10px;">
            Form No: DMT-001 | Generated: ${new Date().toLocaleString()}
        </div>
    `;

    // Hide the form and show print content
    form.style.display = 'none';
    document.body.appendChild(printContent);

    // Print
    document.body.classList.add('print-dmt');
    window.print();
    cleanupPrintClasses();

    // Clean up
    printContent.remove();
    form.style.display = '';
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

    // Create bilingual label helper (Chinese / Spanish)
    const biLabel = (zh, es) => `${zh} / ${es}`;

    // Create print content
    const printContent = document.createElement('div');
    printContent.id = 'car-print-content';
    printContent.style.cssText = 'font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;';

    printContent.innerHTML = `
        <!-- Header -->
        <div style="text-align: center; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">纠正措施请求 (CAR)</h1>
            <h2 style="margin: 5px 0; font-size: 20px; font-weight: bold;">SOLICITUD DE ACCIÓN CORRECTIVA</h2>
            <p style="margin: 10px 0; font-size: 16px; font-weight: bold;">${biLabel('报告编号', 'Reporte No')}: ${getReportNumber()}</p>
        </div>

        <!-- Top Section: Assigned to, Issued by, Dates, MO+SN -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; border: 2px solid #000; padding: 10px;">
            <div style="border: 1px solid #666; padding: 8px;">
                <strong>${biLabel('分配给', 'Asignado a')}:</strong><br>
                <div style="border-bottom: 1px solid #000; height: 25px; margin-top: 5px;"></div>
            </div>
            <div style="border: 1px solid #666; padding: 8px;">
                <strong>${biLabel('发行人', 'Emitido por')}:</strong><br>
                <div style="margin-top: 5px; font-weight: bold;">${preparedBy || '___________________________'}</div>
            </div>
            <div style="border: 1px solid #666; padding: 8px;">
                <strong>${biLabel('发行日期', 'Fecha de emisión')}:</strong><br>
                <div style="border-bottom: 1px solid #000; height: 25px; margin-top: 5px;"></div>
            </div>
            <div style="border: 1px solid #666; padding: 8px;">
                <strong>${biLabel('退回日期', 'Fecha de devolución')}:</strong><br>
                <div style="border-bottom: 1px solid #000; height: 25px; margin-top: 5px;"></div>
            </div>
            <div style="border: 1px solid #666; padding: 8px; grid-column: span 2;">
                <strong>${biLabel('工单+序列号', 'MO+SN')}:</strong><br>
                <div style="border-bottom: 1px solid #000; height: 25px; margin-top: 5px;"></div>
            </div>
        </div>

        <!-- Defect Description -->
        <div style="border: 2px solid #000; padding: 10px; margin-bottom: 15px;">
            <strong style="font-size: 14px;">${biLabel('缺陷描述', 'DESCRIPCIÓN DEL DEFECTO')}:</strong><br>
            <div style="margin-top: 10px; min-height: 60px; white-space: pre-wrap; line-height: 1.5;">${defectDesc || 'N/A'}</div>
        </div>

        <!-- Immediate Corrective Action -->
        <div style="border: 2px solid #000; padding: 10px; margin-bottom: 15px;">
            <strong style="font-size: 14px;">${biLabel('立即纠正措施', 'ACCIÓN CORRECTIVA INMEDIATA')}:</strong><br>
            <div style="margin-top: 10px; min-height: 60px; white-space: pre-wrap; line-height: 1.5;">${repairProcess || 'N/A'}</div>
        </div>

        <!-- Root Cause -->
        <div style="border: 2px solid #000; padding: 10px; margin-bottom: 15px;">
            <strong style="font-size: 14px;">${biLabel('根本原因', 'CAUSA RAÍZ')}:</strong><br>
            <div style="margin-top: 10px; min-height: 60px; white-space: pre-wrap; line-height: 1.5;">${processAnalysis || 'N/A'}</div>
        </div>

        <!-- Preventive Action -->
        <div style="border: 2px solid #000; padding: 10px; margin-bottom: 15px;">
            <strong style="font-size: 14px;">${biLabel('预防措施', 'ACCIÓN PREVENTIVA')}:</strong><br>
            <div style="margin-top: 10px; min-height: 60px; white-space: pre-wrap; line-height: 1.5;">${engineeringFindings || 'N/A'}</div>
        </div>

        <!-- Quality Follow Up -->
        <div style="border: 2px solid #000; padding: 10px; margin-bottom: 15px;">
            <strong style="font-size: 14px;">${biLabel('质量跟进', 'SEGUIMIENTO DE CALIDAD')}:</strong><br>
            <div style="margin-top: 10px; min-height: 60px; border: 1px dashed #666; padding: 10px; background-color: #f9f9f9;">
                <!-- To be filled manually -->
            </div>
        </div>

        <!-- Facilitator Section -->
        <div style="border: 2px solid #000; padding: 10px; margin-bottom: 15px;">
            <strong style="font-size: 14px;">${biLabel('协调员', 'FACILITADOR')}:</strong>
            <div style="border-bottom: 1px solid #000; height: 25px; margin-top: 5px; width: 300px;"></div>
        </div>

        <!-- Date and Signature Table (8 rows) -->
        <div style="border: 2px solid #000; margin-bottom: 15px;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f0f0f0;">
                        <th style="border: 1px solid #000; padding: 10px; text-align: center; width: 50%;">
                            <strong>${biLabel('日期', 'FECHA')}</strong>
                        </th>
                        <th style="border: 1px solid #000; padding: 10px; text-align: center; width: 50%;">
                            <strong>${biLabel('签名', 'FIRMA')}</strong>
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
                    <strong>${biLabel('审核人发行人/ME', 'Revisado por Emisor/ME')}:</strong>
                    <span style="border-bottom: 1px solid #000; display: inline-block; width: 200px; margin-left: 10px;"></span>
                </div>
                <div>
                    <strong>${biLabel('日期', 'Fecha')}:</strong>
                    <span style="border-bottom: 1px solid #000; display: inline-block; width: 120px; margin-left: 10px;"></span>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 15px;">
                <div>
                    <strong>${biLabel('质量经理/工程师接受', 'Aceptado por QM/QE')}:</strong>
                    <span style="border-bottom: 1px solid #000; display: inline-block; width: 200px; margin-left: 10px;"></span>
                </div>
                <div>
                    <strong>${biLabel('日期', 'Fecha')}:</strong>
                    <span style="border-bottom: 1px solid #000; display: inline-block; width: 120px; margin-left: 10px;"></span>
                </div>
            </div>

            <!-- Checkboxes -->
            <div style="margin: 15px 0; padding: 10px; background-color: #f9f9f9; border: 1px solid #ccc;">
                <label style="margin-right: 30px; font-weight: bold;">
                    <input type="checkbox" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 8px;">
                    ${biLabel('满意', 'Satisfactorio')}
                </label>
                <label style="font-weight: bold;">
                    <input type="checkbox" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 8px;">
                    ${biLabel('不满意', 'No satisfactorio')}
                </label>
            </div>

            <!-- Close CAR Date -->
            <div style="margin-top: 15px;">
                <strong>${biLabel('关闭CAR日期', 'Fecha de cierre CAR')}:</strong>
                <span style="border-bottom: 1px solid #000; display: inline-block; width: 200px; margin-left: 10px;"></span>
            </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 10px;">
            Form No: F19.00-09 | Generated: ${new Date().toLocaleString()}
        </div>
    `;

    // Hide the form and show print content
    form.style.display = 'none';
    document.body.appendChild(printContent);

    // Print
    document.body.classList.add('print-car');
    window.print();
    cleanupPrintClasses();

    // Clean up
    printContent.remove();
    form.style.display = '';
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

    // Create bilingual label helper (Chinese / Spanish)
    const biLabel = (zh, es) => `${zh} / ${es}`;

    // Create print content
    const printContent = document.createElement('div');
    printContent.id = 'mrb-print-content';
    printContent.style.cssText = 'font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;';

    printContent.innerHTML = `
        <!-- Header -->
        <div style="text-align: center; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">材料审查委员会报告 (MRB)</h1>
            <h2 style="margin: 5px 0; font-size: 20px; font-weight: bold;">INFORME DE JUNTA DE REVISIÓN DE MATERIALES</h2>
            <p style="margin: 10px 0; font-size: 16px; font-weight: bold;">${biLabel('报告编号', 'Reporte No')}: ${getReportNumber()}</p>
        </div>

        <!-- Top Section: Responsible, Dept, Shop Order, SN, Quantity, Part Number -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; border: 2px solid #000; padding: 10px;">
            <div style="border: 1px solid #666; padding: 8px;">
                <strong>${biLabel('负责人', 'Responsable')}:</strong><br>
                <div style="border-bottom: 1px solid #000; height: 25px; margin-top: 5px;"></div>
            </div>
            <div style="border: 1px solid #666; padding: 8px;">
                <strong>${biLabel('负责部门', 'Departamento Responsable')}:</strong><br>
                <div style="border-bottom: 1px solid #000; height: 25px; margin-top: 5px;"></div>
            </div>
            <div style="border: 1px solid #666; padding: 8px;">
                <strong>${biLabel('车间订单', 'Orden de taller')}:</strong><br>
                <div style="border-bottom: 1px solid #000; height: 25px; margin-top: 5px;"></div>
            </div>
            <div style="border: 1px solid #666; padding: 8px;">
                <strong>${biLabel('序列号', 'NS')}:</strong><br>
                <div style="border-bottom: 1px solid #000; height: 25px; margin-top: 5px;"></div>
            </div>
            <div style="border: 1px solid #666; padding: 8px;">
                <strong>${biLabel('数量', 'Cantidad')}:</strong><br>
                <div style="border-bottom: 1px solid #000; height: 25px; margin-top: 5px;"></div>
            </div>
            <div style="border: 1px solid #666; padding: 8px;">
                <strong>${biLabel('零件编号', 'Número de Parte')}:</strong><br>
                <div style="margin-top: 5px; font-weight: bold;">${partNumber || 'N/A'}</div>
            </div>
        </div>

        <!-- DMT Date and Failure Code -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
            <div style="border: 2px solid #000; padding: 10px;">
                <strong>${biLabel('DMT日期', 'Fecha DMT')}:</strong>
                <span style="border-bottom: 1px solid #000; display: inline-block; width: 200px; margin-left: 10px;"></span>
            </div>
            <div style="border: 2px solid #000; padding: 10px;">
                <strong>${biLabel('故障代码', 'Código de falla')}:</strong>
                <span style="margin-left: 10px; font-weight: bold;">${failureCode || 'N/A'}</span>
            </div>
        </div>

        <!-- Defect Description -->
        <div style="border: 2px solid #000; padding: 10px; margin-bottom: 15px;">
            <strong style="font-size: 14px;">${biLabel('缺陷描述', 'DESCRIPCIÓN DEL DEFECTO')}:</strong><br>
            <div style="margin-top: 10px; min-height: 60px; white-space: pre-wrap; line-height: 1.5;">${defectDesc || 'N/A'}</div>
        </div>

        <!-- Engineering Comment -->
        <div style="border: 2px solid #000; padding: 10px; margin-bottom: 15px;">
            <strong style="font-size: 14px;">${biLabel('工程评论', 'COMENTARIO DE INGENIERÍA')}:</strong><br>
            <div style="margin-top: 10px; min-height: 60px; white-space: pre-wrap; line-height: 1.5;">${engineeringComment || 'N/A'}</div>
        </div>

        <!-- Cost Accounting -->
        <div style="border: 2px solid #000; padding: 10px; margin-bottom: 15px;">
            <strong style="font-size: 14px;">${biLabel('成本核算', 'CONTABILIDAD DE COSTOS')}:</strong><br>
            <div style="margin-top: 10px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                <div>
                    <strong>${biLabel('材料', 'Material')}:</strong>
                    <span style="border-bottom: 1px solid #000; display: inline-block; width: 100px; margin-left: 5px;">$${materialCost.toFixed(2)}</span>
                </div>
                <div>
                    <strong>${biLabel('其他', 'Otro')}:</strong>
                    <span style="border-bottom: 1px solid #000; display: inline-block; width: 100px; margin-left: 5px;">$${otherCost.toFixed(2)}</span>
                </div>
                <div>
                    <strong>${biLabel('总计', 'Total')}:</strong>
                    <span style="border-bottom: 2px solid #000; display: inline-block; width: 100px; margin-left: 5px; font-weight: bold;">$${totalCost.toFixed(2)}</span>
                </div>
            </div>
        </div>

        <!-- Department Assess & Engineering Assess -->
        <div style="border: 2px solid #000; padding: 15px; margin-bottom: 15px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
                <div style="text-align: center; font-weight: bold; font-size: 14px; padding: 10px; background-color: #f0f0f0; border: 1px solid #000;">
                    ${biLabel('部门评估', 'EVALUACIÓN DEL DEPARTAMENTO')}
                </div>
                <div style="text-align: center; font-weight: bold; font-size: 14px; padding: 10px; background-color: #f0f0f0; border: 1px solid #000;">
                    ${biLabel('工程评估', 'EVALUACIÓN DE INGENIERÍA')}
                </div>
            </div>

            <!-- Row 1: ME -->
            <div style="display: grid; grid-template-columns: 80px 1fr 2fr; gap: 10px; margin-bottom: 10px; align-items: center; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
                <div style="font-weight: bold;">ME:</div>
                <div>
                    <label style="margin-right: 10px;"><input type="checkbox" style="width: 16px; height: 16px; margin-right: 3px;"> ${biLabel('使用', 'Usar')}</label>
                    <label style="margin-right: 10px;"><input type="checkbox" style="width: 16px; height: 16px; margin-right: 3px;"> ${biLabel('返工', 'Retrabajo')}</label>
                    <label style="margin-right: 10px;"><input type="checkbox" style="width: 16px; height: 16px; margin-right: 3px;"> ${biLabel('报废', 'Desecho')}</label>
                    <label><input type="checkbox" style="width: 16px; height: 16px; margin-right: 3px;"> SDR</label>
                </div>
                <div style="border-bottom: 1px solid #000; height: 25px;"></div>
            </div>

            <!-- Row 2: QE -->
            <div style="display: grid; grid-template-columns: 80px 1fr 2fr; gap: 10px; margin-bottom: 10px; align-items: center; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
                <div style="font-weight: bold;">QE:</div>
                <div>
                    <label style="margin-right: 10px;"><input type="checkbox" style="width: 16px; height: 16px; margin-right: 3px;"> ${biLabel('返工', 'Retrabajo')}</label>
                    <label style="margin-right: 10px;"><input type="checkbox" style="width: 16px; height: 16px; margin-right: 3px;"> ${biLabel('报废', 'Desecho')}</label>
                    <label><input type="checkbox" style="width: 16px; height: 16px; margin-right: 3px;"> SDR</label>
                </div>
                <div style="border-bottom: 1px solid #000; height: 25px;"></div>
            </div>

            <!-- Row 3: MFG -->
            <div style="display: grid; grid-template-columns: 80px 1fr 2fr; gap: 10px; margin-bottom: 10px; align-items: center; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
                <div style="font-weight: bold;">MFG:</div>
                <div>
                    <label style="margin-right: 10px;"><input type="checkbox" style="width: 16px; height: 16px; margin-right: 3px;"> ${biLabel('返工', 'Retrabajo')}</label>
                    <label style="margin-right: 10px;"><input type="checkbox" style="width: 16px; height: 16px; margin-right: 3px;"> ${biLabel('报废', 'Desecho')}</label>
                    <label><input type="checkbox" style="width: 16px; height: 16px; margin-right: 3px;"> SDR</label>
                </div>
                <div style="border-bottom: 1px solid #000; height: 25px;"></div>
            </div>

            <!-- Row 4: EM -->
            <div style="display: grid; grid-template-columns: 80px 1fr 2fr; gap: 10px; margin-bottom: 10px; align-items: center; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
                <div style="font-weight: bold;">EM:</div>
                <div>
                    <label style="margin-right: 10px;"><input type="checkbox" style="width: 16px; height: 16px; margin-right: 3px;"> ${biLabel('返工', 'Retrabajo')}</label>
                    <label style="margin-right: 10px;"><input type="checkbox" style="width: 16px; height: 16px; margin-right: 3px;"> ${biLabel('报废', 'Desecho')}</label>
                    <label><input type="checkbox" style="width: 16px; height: 16px; margin-right: 3px;"> SDR</label>
                </div>
                <div style="border-bottom: 1px solid #000; height: 25px;"></div>
            </div>

            <!-- Row 5: QM -->
            <div style="display: grid; grid-template-columns: 80px 1fr 2fr; gap: 10px; margin-bottom: 15px; align-items: center; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
                <div style="font-weight: bold;">QM:</div>
                <div>
                    <label style="margin-right: 10px;"><input type="checkbox" style="width: 16px; height: 16px; margin-right: 3px;"> ${biLabel('返工', 'Retrabajo')}</label>
                    <label style="margin-right: 10px;"><input type="checkbox" style="width: 16px; height: 16px; margin-right: 3px;"> ${biLabel('报废', 'Desecho')}</label>
                    <label><input type="checkbox" style="width: 16px; height: 16px; margin-right: 3px;"> SDR</label>
                </div>
                <div style="border-bottom: 1px solid #000; height: 25px;"></div>
            </div>

            <!-- Verdict Box -->
            <div style="margin-top: 20px;">
                <strong style="font-size: 14px;">${biLabel('判定', 'VEREDICTO')}:</strong>
                <div style="margin-top: 10px; min-height: 100px; border: 2px solid #000; padding: 10px; background-color: #f9f9f9;">
                    <!-- To be filled manually -->
                </div>
            </div>

            <!-- Signature -->
            <div style="margin-top: 30px; border-top: 2px solid #000; padding-top: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="text-align: center;">
                        <div style="border-bottom: 2px solid #000; margin-bottom: 5px; height: 40px;"></div>
                        <strong>${biLabel('签名', 'Firma')}</strong>
                    </div>
                    <div style="text-align: center;">
                        <div style="border-bottom: 2px solid #000; margin-bottom: 5px; height: 40px;"></div>
                        <strong>${biLabel('日期', 'Fecha')}</strong>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 10px;">
            Form No: MRB-001 | Generated: ${new Date().toLocaleString()}
        </div>
    `;

    // Hide the form and show print content
    form.style.display = 'none';
    document.body.appendChild(printContent);

    // Print
    document.body.classList.add('print-mrb');
    window.print();
    cleanupPrintClasses();

    // Clean up
    printContent.remove();
    form.style.display = '';
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
