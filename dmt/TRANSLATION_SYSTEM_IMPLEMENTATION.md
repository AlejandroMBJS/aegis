# DMT Translation System - Real-time Data Translation

## Overview

Users can input and read data in English, Chinese, or Spanish. Data is automatically translated and stored in all 3 languages. Prints show both Spanish and Chinese simultaneously.

---

## Architecture

### 1. Database Storage (3 columns per text field)

For each text field, store 3 versions:

```sql
-- Example for defect_description
defect_description_en TEXT    -- English
defect_description_zh TEXT    -- Chinese (中文)
defect_description_es TEXT    -- Spanish (Español)

-- Same for:
process_analysis_en, process_analysis_zh, process_analysis_es
repair_process_en, repair_process_zh, repair_process_es
engineering_findings_en, engineering_findings_zh, engineering_findings_es
```

### 2. Translation Service

Use **Google Translate API** or **DeepL API** for automatic translation.

**Recommended: Google Cloud Translation API**
- Free tier: 500,000 characters/month
- Fast and accurate
- Simple REST API

---

## Backend Implementation

### Step 1: Update Database Models

**Update `dmt_backend/models.py`:**

```python
from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List
from datetime import datetime

class DMTRecordBase(SQLModel):
    # Control fields
    is_closed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by_id: int = Field(foreign_key="user.id")

    # Report number
    report_number: Optional[str] = None

    # Section 1: Inspector - IDs remain single values
    part_number_id: Optional[int] = Field(default=None, foreign_key="partnumber.id")
    work_center_id: Optional[int] = Field(default=None, foreign_key="workcenter.id")
    customer_id: Optional[int] = Field(default=None, foreign_key="customer.id")
    level_id: Optional[int] = Field(default=None, foreign_key="level.id")
    area_id: Optional[int] = Field(default=None, foreign_key="area.id")

    # Defect Description - 3 languages
    defect_description_en: Optional[str] = None
    defect_description_zh: Optional[str] = None
    defect_description_es: Optional[str] = None

    # Section 2: Operator - 3 languages each
    process_analysis_en: Optional[str] = None
    process_analysis_zh: Optional[str] = None
    process_analysis_es: Optional[str] = None

    repair_process_en: Optional[str] = None
    repair_process_zh: Optional[str] = None
    repair_process_es: Optional[str] = None

    # Rework hours - single value (number)
    rework_hours: Optional[float] = None

    # Section 3: Technical Engineer - 3 languages
    engineering_findings_en: Optional[str] = None
    engineering_findings_zh: Optional[str] = None
    engineering_findings_es: Optional[str] = None

    # Costs - single values (numbers)
    material_scrap_cost: Optional[float] = None
    other_cost: Optional[float] = None

    # Section 4: Quality Engineer - IDs remain single values
    final_disposition_id: Optional[int] = Field(default=None, foreign_key="disposition.id")
    failure_code_id: Optional[int] = Field(default=None, foreign_key="failurecode.id")
    approved_by_id: Optional[int] = Field(default=None, foreign_key="user.id")

class DMTRecord(DMTRecordBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    creator: User = Relationship(back_populates="dmt_records")
    part_number: Optional[PartNumber] = Relationship()
    work_center: Optional[WorkCenter] = Relationship()
    customer: Optional[Customer] = Relationship()
    level: Optional[Level] = Relationship()
    area: Optional[Area] = Relationship()
    final_disposition: Optional[Disposition] = Relationship()
    failure_code: Optional[FailureCode] = Relationship()
```

### Step 2: Create Translation Service

**Create `dmt_backend/translation.py`:**

```python
"""
Translation Service using Google Cloud Translation API
Requires: pip install google-cloud-translate
"""

import os
from google.cloud import translate_v2 as translate

# Initialize client
translate_client = translate.Client()

# Supported languages
SUPPORTED_LANGUAGES = ['en', 'zh-CN', 'es']

def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    """
    Translate text from source language to target language

    Args:
        text: Text to translate
        source_lang: Source language code (en, zh-CN, es)
        target_lang: Target language code (en, zh-CN, es)

    Returns:
        Translated text
    """
    if not text or text.strip() == '':
        return ''

    if source_lang == target_lang:
        return text

    try:
        result = translate_client.translate(
            text,
            source_language=source_lang,
            target_language=target_lang
        )
        return result['translatedText']
    except Exception as e:
        print(f"Translation error: {e}")
        return text  # Return original if translation fails


def translate_field_to_all_languages(text: str, source_lang: str) -> dict:
    """
    Translate a field to all 3 supported languages

    Args:
        text: Original text
        source_lang: Language of the original text (en, zh-CN, or es)

    Returns:
        Dictionary with all 3 translations:
        {
            'en': 'English text',
            'zh': 'Chinese text',
            'es': 'Spanish text'
        }
    """
    # Map zh-CN to zh for our field names
    lang_mapping = {
        'en': 'en',
        'zh-CN': 'zh',
        'zh': 'zh',
        'es': 'es'
    }

    result = {}

    # Translate to English
    if source_lang == 'en':
        result['en'] = text
    else:
        result['en'] = translate_text(text, source_lang, 'en')

    # Translate to Chinese
    target_zh = 'zh-CN'
    if source_lang == 'zh-CN' or source_lang == 'zh':
        result['zh'] = text
    else:
        result['zh'] = translate_text(text, source_lang, target_zh)

    # Translate to Spanish
    if source_lang == 'es':
        result['es'] = text
    else:
        result['es'] = translate_text(text, source_lang, 'es')

    return result


# Alternative: Use DeepL API (more accurate but paid)
# Requires: pip install deepl

"""
import deepl

# Initialize DeepL
auth_key = os.getenv('DEEPL_AUTH_KEY')
translator = deepl.Translator(auth_key)

def translate_text_deepl(text: str, source_lang: str, target_lang: str) -> str:
    if not text or source_lang == target_lang:
        return text

    try:
        result = translator.translate_text(
            text,
            source_lang=source_lang.upper(),
            target_lang=target_lang.upper()
        )
        return result.text
    except Exception as e:
        print(f"DeepL translation error: {e}")
        return text
"""
```

**Alternative: Use Free Translation API (no authentication needed)**

**Create `dmt_backend/translation_free.py`:**

```python
"""
Free Translation Service using LibreTranslate (self-hosted or public instance)
No API key required
"""

import requests

# Use public LibreTranslate instance (or self-host)
LIBRETRANSLATE_URL = "https://libretranslate.de/translate"

def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    """
    Translate text using LibreTranslate

    Args:
        text: Text to translate
        source_lang: Source language (en, zh, es)
        target_lang: Target language (en, zh, es)

    Returns:
        Translated text
    """
    if not text or text.strip() == '':
        return ''

    if source_lang == target_lang:
        return text

    try:
        response = requests.post(
            LIBRETRANSLATE_URL,
            json={
                "q": text,
                "source": source_lang,
                "target": target_lang,
                "format": "text"
            },
            timeout=10
        )

        if response.status_code == 200:
            return response.json()['translatedText']
        else:
            print(f"Translation API error: {response.status_code}")
            return text
    except Exception as e:
        print(f"Translation error: {e}")
        return text


def translate_field_to_all_languages(text: str, source_lang: str) -> dict:
    """
    Translate a field to all 3 supported languages

    Args:
        text: Original text
        source_lang: Language code (en, zh, es)

    Returns:
        {
            'en': 'English text',
            'zh': '中文文本',
            'es': 'Texto en español'
        }
    """
    result = {}

    # Translate to English
    if source_lang == 'en':
        result['en'] = text
    else:
        result['en'] = translate_text(text, source_lang, 'en')

    # Translate to Chinese
    if source_lang == 'zh':
        result['zh'] = text
    else:
        result['zh'] = translate_text(text, source_lang, 'zh')

    # Translate to Spanish
    if source_lang == 'es':
        result['es'] = text
    else:
        result['es'] = translate_text(text, source_lang, 'es')

    return result
```

### Step 3: Update Schemas

**Update `dmt_backend/schemas.py`:**

```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DMTRecordCreate(BaseModel):
    """
    Create DMT Record
    User provides text in one language, backend translates to all 3
    """
    # IDs
    part_number_id: int
    work_center_id: int
    customer_id: int
    level_id: int
    area_id: int

    # Text field with language indicator
    defect_description: str
    language: str  # 'en', 'zh', or 'es' - tells us which language the user is inputting


class DMTRecordUpdate(BaseModel):
    """
    Update DMT Record
    Include language parameter for any text updates
    """
    language: Optional[str] = None  # Language of the input

    # Section 1
    part_number_id: Optional[int] = None
    work_center_id: Optional[int] = None
    customer_id: Optional[int] = None
    level_id: Optional[int] = None
    area_id: Optional[int] = None
    defect_description: Optional[str] = None

    # Section 2
    process_analysis: Optional[str] = None
    repair_process: Optional[str] = None
    rework_hours: Optional[float] = None

    # Section 3
    engineering_findings: Optional[str] = None
    material_scrap_cost: Optional[float] = None
    other_cost: Optional[float] = None

    # Section 4
    is_closed: Optional[bool] = None
    final_disposition_id: Optional[int] = None
    failure_code_id: Optional[int] = None
    approved_by_id: Optional[int] = None


class DMTRecordRead(BaseModel):
    """
    Read DMT Record
    Include language parameter to return text in requested language
    """
    id: int
    is_closed: bool
    created_at: datetime
    created_by_id: int
    report_number: Optional[str] = None

    # IDs
    part_number_id: Optional[int] = None
    work_center_id: Optional[int] = None
    customer_id: Optional[int] = None
    level_id: Optional[int] = None
    area_id: Optional[int] = None

    # Text fields - return in requested language
    defect_description: Optional[str] = None
    process_analysis: Optional[str] = None
    repair_process: Optional[str] = None
    rework_hours: Optional[float] = None
    engineering_findings: Optional[str] = None
    material_scrap_cost: Optional[float] = None
    other_cost: Optional[float] = None

    # Section 4
    final_disposition_id: Optional[int] = None
    failure_code_id: Optional[int] = None
    approved_by_id: Optional[int] = None

    class Config:
        from_attributes = True
```

### Step 4: Update CRUD with Translation

**Update `dmt_backend/crud/crud_dmt.py`:**

```python
from typing import Optional, List
from datetime import datetime
from sqlmodel import Session, select
from models import DMTRecord
from schemas import DMTRecordCreate, DMTRecordUpdate
from translation_free import translate_field_to_all_languages  # or use translation.py

def create_dmt(session: Session, dmt_data: DMTRecordCreate, created_by_id: int) -> DMTRecord:
    """
    Create DMT Record with automatic translation
    """
    # Translate defect_description to all 3 languages
    translations = translate_field_to_all_languages(
        dmt_data.defect_description,
        dmt_data.language
    )

    db_dmt = DMTRecord(
        created_by_id=created_by_id,
        part_number_id=dmt_data.part_number_id,
        work_center_id=dmt_data.work_center_id,
        customer_id=dmt_data.customer_id,
        level_id=dmt_data.level_id,
        area_id=dmt_data.area_id,
        defect_description_en=translations['en'],
        defect_description_zh=translations['zh'],
        defect_description_es=translations['es'],
        is_closed=False
    )

    session.add(db_dmt)
    session.commit()
    session.refresh(db_dmt)
    return db_dmt


def update_dmt_with_translation(
    session: Session,
    dmt_id: int,
    update_data: DMTRecordUpdate,
    user_role: str
) -> Optional[DMTRecord]:
    """
    Update DMT Record with automatic translation of text fields
    """
    db_dmt = session.get(DMTRecord, dmt_id)
    if not db_dmt:
        return None

    if db_dmt.is_closed:
        raise ValueError("Cannot edit closed DMT Record")

    # Get allowed fields for role (same RBAC logic)
    allowed_fields = ALLOWED_FIELDS_BY_ROLE.get(user_role, [])

    # Get update dict
    update_dict = update_data.model_dump(exclude_unset=True)
    language = update_dict.pop('language', 'en')

    # Text fields that need translation
    text_fields = {
        'defect_description': ['defect_description_en', 'defect_description_zh', 'defect_description_es'],
        'process_analysis': ['process_analysis_en', 'process_analysis_zh', 'process_analysis_es'],
        'repair_process': ['repair_process_en', 'repair_process_zh', 'repair_process_es'],
        'engineering_findings': ['engineering_findings_en', 'engineering_findings_zh', 'engineering_findings_es']
    }

    # Process each field
    for field_name, value in update_dict.items():
        # Check if this is a text field that needs translation
        if field_name in text_fields:
            # Translate to all 3 languages
            translations = translate_field_to_all_languages(value, language)

            # Set all 3 language versions
            setattr(db_dmt, text_fields[field_name][0], translations['en'])
            setattr(db_dmt, text_fields[field_name][1], translations['zh'])
            setattr(db_dmt, text_fields[field_name][2], translations['es'])
        else:
            # Regular field (IDs, numbers, booleans)
            if field_name in allowed_fields:
                setattr(db_dmt, field_name, value)

    # Quality Engineer closure validation
    if user_role == "Quality Engineer" and update_dict.get("is_closed") is True:
        required_fields = ["final_disposition_id", "failure_code_id", "approved_by_id"]
        for field in required_fields:
            if field not in update_dict or update_dict[field] is None:
                raise ValueError(f"Quality Engineer must provide {field} when closing")

    session.add(db_dmt)
    session.commit()
    session.refresh(db_dmt)
    return db_dmt


def get_dmt_in_language(record: DMTRecord, language: str) -> dict:
    """
    Convert DMTRecord to dict with text in specified language

    Args:
        record: DMTRecord instance
        language: 'en', 'zh', or 'es'

    Returns:
        Dictionary with text fields in specified language
    """
    lang_suffix = language if language in ['en', 'zh', 'es'] else 'en'

    return {
        'id': record.id,
        'is_closed': record.is_closed,
        'created_at': record.created_at,
        'created_by_id': record.created_by_id,
        'report_number': record.report_number,

        # IDs
        'part_number_id': record.part_number_id,
        'work_center_id': record.work_center_id,
        'customer_id': record.customer_id,
        'level_id': record.level_id,
        'area_id': record.area_id,

        # Text fields - return in requested language
        'defect_description': getattr(record, f'defect_description_{lang_suffix}'),
        'process_analysis': getattr(record, f'process_analysis_{lang_suffix}'),
        'repair_process': getattr(record, f'repair_process_{lang_suffix}'),
        'engineering_findings': getattr(record, f'engineering_findings_{lang_suffix}'),

        # Numbers (no translation)
        'rework_hours': record.rework_hours,
        'material_scrap_cost': record.material_scrap_cost,
        'other_cost': record.other_cost,

        # Section 4
        'final_disposition_id': record.final_disposition_id,
        'failure_code_id': record.failure_code_id,
        'approved_by_id': record.approved_by_id
    }
```

### Step 5: Update Router

**Update `dmt_backend/routers/router_dmt.py`:**

```python
from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from typing import Optional, List

@router.get("/{dmt_id}", response_model=DMTRecordRead)
def get_dmt_record(
    dmt_id: int,
    language: str = Header(default="en", alias="X-Language"),  # Get language from header
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get DMT Record in specified language
    Send X-Language header: en, zh, or es
    """
    dmt = get_dmt_by_id(session, dmt_id)
    if not dmt:
        raise HTTPException(status_code=404, detail="DMT Record not found")

    # Convert to dict in requested language
    return get_dmt_in_language(dmt, language)


@router.get("/", response_model=List[DMTRecordRead])
def list_dmt_records(
    language: str = Header(default="en", alias="X-Language"),
    skip: int = 0,
    limit: int = 100,
    # ... other filters
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    List DMT Records in specified language
    """
    dmts = list_dmt(session, skip, limit, ...)

    # Convert all to requested language
    return [get_dmt_in_language(dmt, language) for dmt in dmts]
```

---

## Frontend Implementation

### Step 1: Add Language Selector Button

**Update `includes/header.php`:**

```php
<!-- Add language selector next to user info -->
<div class="flex items-center space-x-2 bg-blue-700 px-3 py-2 rounded">
    <i class="fas fa-language"></i>
    <select id="language-selector" class="bg-transparent text-white border-none focus:outline-none cursor-pointer">
        <option value="en">EN</option>
        <option value="zh">中文</option>
        <option value="es">ES</option>
    </select>
</div>

<script>
// Initialize language from localStorage
document.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('language-selector');
    const savedLang = localStorage.getItem('inputLanguage') || 'en';
    selector.value = savedLang;

    selector.addEventListener('change', (e) => {
        localStorage.setItem('inputLanguage', e.target.value);
        // Reload current page to show data in new language
        location.reload();
    });
});
</script>
```

### Step 2: Update API Calls with Language Header

**Update `js/auth.js`:**

```javascript
/**
 * Get current input language
 */
function getCurrentLanguage() {
    return localStorage.getItem('inputLanguage') || 'en';
}

/**
 * Get auth headers with language
 */
function getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'bearer';
    const language = getCurrentLanguage();

    return {
        'Authorization': `${tokenType} ${token}`,
        'Content-Type': 'application/json',
        'X-Language': language  // Tell backend which language we want
    };
}
```

### Step 3: Update Form Submit with Language

**Update `js/dmt_form_logic.js`:**

```javascript
/**
 * Build payload with language indicator
 */
function buildPayload() {
    const payload = {
        language: getCurrentLanguage()  // Add language to payload
    };

    const allowedFields = ROLE_PERMISSIONS[currentUserRole] || [];

    allowedFields.forEach(fieldName => {
        const element = document.getElementById(fieldName);
        if (element && element.value) {
            if (element.type === 'checkbox') {
                payload[fieldName] = element.checked;
            } else if (element.type === 'number') {
                payload[fieldName] = fieldName.includes('_id') ? parseInt(element.value) : parseFloat(element.value);
            } else {
                payload[fieldName] = element.value;
            }
        }
    });

    return payload;
}
```

---

## Print Implementation - Bilingual (Spanish + Chinese)

### Update Print CSS

**Update `css/print.css` for bilingual format:**

```css
/* Bilingual Print - Show Spanish and Chinese side by side */

@media print {
    /* DMT Print - Bilingual */
    body.print-dmt #dmt-form::before {
        content: "DEFECTIVE MATERIAL TAG (DMT) / 缺陷材料标签 (DMT)\A ETIQUETA DE MATERIAL DEFECTUOSO (DMT)\A Report No: " attr(data-report-number);
        white-space: pre-wrap !important;
        display: block !important;
        text-align: center !important;
        font-size: 14px !important;
        font-weight: bold !important;
        border-bottom: 3px solid #000 !important;
        padding-bottom: 8px !important;
        margin-bottom: 15px !important;
    }

    /* Show text in two columns: Spanish | Chinese */
    body.print-dmt .bilingual-field {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 10px !important;
    }

    body.print-dmt .lang-es {
        border-right: 1px solid #ccc;
        padding-right: 10px;
    }

    body.print-dmt .lang-zh {
        padding-left: 10px;
    }
}
```

### Update Print JavaScript

**Update `js/print.js`:**

```javascript
/**
 * Print DMT with bilingual format (Spanish + Chinese)
 */
function printDMT() {
    cleanupPrintClasses();
    setReportNumberAttr();

    // Get current record data
    const defectDesc = {
        es: document.getElementById('defect_description').dataset.es || '',
        zh: document.getElementById('defect_description').dataset.zh || ''
    };

    // Create bilingual display elements
    createBilingualDisplay();

    document.body.classList.add('print-dmt');
    window.print();
    cleanupPrintClasses();

    // Remove bilingual elements
    removeBilingualDisplay();
}

/**
 * Create bilingual display for print
 */
function createBilingualDisplay() {
    // Get all text fields
    const textFields = [
        'defect_description',
        'process_analysis',
        'repair_process',
        'engineering_findings'
    ];

    textFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (!element) return;

        // Get Spanish and Chinese versions from data attributes
        const esText = element.dataset.es || element.value;
        const zhText = element.dataset.zh || element.value;

        // Create bilingual container
        const container = document.createElement('div');
        container.className = 'bilingual-field print-only';
        container.innerHTML = `
            <div class="lang-es">
                <strong>ES:</strong> ${esText}
            </div>
            <div class="lang-zh">
                <strong>中文:</strong> ${zhText}
            </div>
        `;

        // Insert after original element
        element.parentNode.insertBefore(container, element.nextSibling);

        // Hide original in print
        element.classList.add('hide-in-print');
    });
}

/**
 * Remove bilingual display elements
 */
function removeBilingualDisplay() {
    document.querySelectorAll('.bilingual-field').forEach(el => el.remove());
    document.querySelectorAll('.hide-in-print').forEach(el => {
        el.classList.remove('hide-in-print');
    });
}
```

### Store All Language Versions in Form

**Update `js/dmt_form_logic.js` to load all languages:**

```javascript
/**
 * Load record with all language versions
 */
async function loadRecord(recordId) {
    try {
        showLoading();

        // Get record in all 3 languages
        const [recordEN, recordZH, recordES] = await Promise.all([
            apiGetWithLanguage(`${API_BASE_URL}/dmt/${recordId}`, 'en'),
            apiGetWithLanguage(`${API_BASE_URL}/dmt/${recordId}`, 'zh'),
            apiGetWithLanguage(`${API_BASE_URL}/dmt/${recordId}`, 'es')
        ]);

        currentRecord = recordEN; // Use English as base

        // Store all language versions as data attributes
        storeLanguageVersions(recordEN, recordZH, recordES);

        // Populate form with selected language
        const selectedLang = getCurrentLanguage();
        const selectedRecord = selectedLang === 'zh' ? recordZH : selectedLang === 'es' ? recordES : recordEN;
        populateFormFields(selectedRecord);

    } catch (error) {
        console.error('Error loading record:', error);
        showToast('Error loading record: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Store all language versions in data attributes for print
 */
function storeLanguageVersions(recordEN, recordZH, recordES) {
    const textFields = ['defect_description', 'process_analysis', 'repair_process', 'engineering_findings'];

    textFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.dataset.en = recordEN[field] || '';
            element.dataset.zh = recordZH[field] || '';
            element.dataset.es = recordES[field] || '';
        }
    });
}

/**
 * API GET with specific language
 */
async function apiGetWithLanguage(url, language) {
    const response = await apiRequest(url, {
        method: 'GET',
        headers: {
            ...getAuthHeaders(),
            'X-Language': language
        }
    });

    if (!response) return null;
    if (!response.ok) throw new Error('Request failed');

    return await response.json();
}
```

---

## Migration Script for Existing Data

**Create `dmt_backend/migrate_to_multilang.py`:**

```python
"""
Migration script to convert existing single-language data to multi-language
Run once after updating database schema
"""

from sqlmodel import Session, select
from database import engine
from models import DMTRecord
from translation_free import translate_field_to_all_languages

def migrate_existing_records():
    """
    Migrate existing records to multi-language format
    Assumes existing data is in English
    """
    with Session(engine) as session:
        # Get all records
        statement = select(DMTRecord)
        records = session.exec(statement).all()

        print(f"Migrating {len(records)} records...")

        for record in records:
            # Defect description
            if record.defect_description_en:
                trans = translate_field_to_all_languages(record.defect_description_en, 'en')
                record.defect_description_zh = trans['zh']
                record.defect_description_es = trans['es']

            # Process analysis
            if record.process_analysis_en:
                trans = translate_field_to_all_languages(record.process_analysis_en, 'en')
                record.process_analysis_zh = trans['zh']
                record.process_analysis_es = trans['es']

            # Repair process
            if record.repair_process_en:
                trans = translate_field_to_all_languages(record.repair_process_en, 'en')
                record.repair_process_zh = trans['zh']
                record.repair_process_es = trans['es']

            # Engineering findings
            if record.engineering_findings_en:
                trans = translate_field_to_all_languages(record.engineering_findings_en, 'en')
                record.engineering_findings_zh = trans['zh']
                record.engineering_findings_es = trans['es']

            session.add(record)
            print(f"Migrated record #{record.id}")

        session.commit()
        print("Migration complete!")

if __name__ == "__main__":
    migrate_existing_records()
```

---

## Setup Instructions

### 1. Install Translation Library

```bash
# Option A: Use LibreTranslate (Free, no API key)
pip install requests

# Option B: Use Google Translate (Free tier, requires API key)
pip install google-cloud-translate

# Option C: Use DeepL (Paid, more accurate)
pip install deepl
```

### 2. Update Database

```bash
# Backup existing database
docker-compose exec db mysqldump -u dmt_user -p dmt_db > backup.sql

# Update models and run migration
cd dmt_backend
docker-compose down
docker-compose up --build

# Inside container, create tables
docker-compose exec api python -c "from database import init_db; init_db()"

# Migrate existing data
docker-compose exec api python migrate_to_multilang.py
```

### 3. Update Frontend Files

- Update `includes/header.php` - Add language selector
- Update `js/auth.js` - Add X-Language header
- Update `js/dmt_form_logic.js` - Add language to payload
- Update `js/print.js` - Add bilingual print
- Update `css/print.css` - Add bilingual styles

### 4. Test

1. Login as Inspector
2. Select Chinese language
3. Create DMT record in Chinese
4. Verify: Data saved in all 3 languages
5. Switch to Spanish
6. View same record in Spanish
7. Close record
8. Print DMT
9. Verify: Print shows both Spanish AND Chinese

---

## Summary

**What happens:**

1. **User selects language** (EN/ZH/ES) in dropdown
2. **User types in selected language** (e.g., Chinese)
3. **On save**, backend translates to all 3 languages automatically
4. **Database stores** all 3 versions
5. **When viewing**, user sees data in their selected language
6. **When printing**, shows BOTH Spanish and Chinese side by side

**Example:**

```
User inputs (Chinese): "零件表面有划痕"

Stored in DB:
- defect_description_en: "The part surface is scratched"
- defect_description_zh: "零件表面有划痕"
- defect_description_es: "La superficie de la pieza está rayada"

Print shows:
┌────────────────────────┬────────────────────────┐
│ ES: La superficie de   │ 中文: 零件表面有划痕    │
│ la pieza está rayada   │                        │
└────────────────────────┴────────────────────────┘
```

This implementation provides true multi-language support with automatic translation and bilingual printing!
