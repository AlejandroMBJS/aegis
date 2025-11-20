from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ===== USER SCHEMAS =====

class UserCreate(BaseModel):
    employee_number: str
    full_name: str
    role: str  # Admin, Inspector, Tech Engineer, Operator, Quality Engineer
    password: str

class UserRead(BaseModel):
    id: int
    employee_number: str
    full_name: str
    role: str

    class Config:
        from_attributes = True

class UserAuth(BaseModel):
    employee_number: str
    password: str

# ===== TOKEN SCHEMAS =====

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    employee_number: Optional[str] = None

# ===== ENTITY SCHEMAS (Generic para todos los catálogos) =====

class EntityCreate(BaseModel):
    item_number: str
    item_name: str

class EntityRead(BaseModel):
    id: int
    item_number: str
    item_name: str

    class Config:
        from_attributes = True

# ===== DMT RECORD SCHEMAS =====

class DMTRecordCreate(BaseModel):
    """
    Schema para crear DMT Record - Solo Inspector puede crear
    Campos REQUERIDOS del Inspector:
    - part_number_id
    - work_center_id
    - customer_id
    - prepared_by_id
    - operation
    - quantity
    - date
    - inspection_item_id
    - process_code_id
    - defect_description (will be auto-translated to all 3 languages)

    NOTE: Text fields are provided in a single language and auto-translated.
    The 'language' parameter should be sent separately (e.g., query param or header).
    """
    part_number_id: int
    work_center_id: int
    customer_id: int
    prepared_by_id: int
    operation: str
    quantity: int
    date: datetime
    inspection_item_id: int
    process_code_id: int
    defect_description: str  # Input in user's language, stored in all 3
    report_number: Optional[str] = None  # Auto-generated if not provided
    # Optional fields from original schema
    level_id: Optional[int] = None
    area_id: Optional[int] = None
    serial_number: Optional[str] = None

class DMTRecordRead(BaseModel):
    """
    Schema for reading DMT Record - Returns all language versions of text fields
    Frontend will display the appropriate language based on user preference
    """
    id: int
    is_closed: bool
    created_at: datetime
    created_by_id: int
    report_number: Optional[str] = None

    # Section 1: Inspector - General Information
    part_number_id: Optional[int] = None
    work_center_id: Optional[int] = None
    customer_id: Optional[int] = None
    level_id: Optional[int] = None
    area_id: Optional[int] = None
    prepared_by_id: Optional[int] = None
    operation: Optional[str] = None
    quantity: Optional[int] = None
    serial_number: Optional[str] = None
    date: Optional[datetime] = None
    inspection_item_id: Optional[int] = None
    process_code_id: Optional[int] = None

    # Section 2: Inspector - Defect Description
    defect_description_en: Optional[str] = None
    defect_description_es: Optional[str] = None
    defect_description_zh: Optional[str] = None

    # Section 3: Process Analysis
    process_description_en: Optional[str] = None
    process_description_es: Optional[str] = None
    process_description_zh: Optional[str] = None
    analysis_en: Optional[str] = None
    analysis_es: Optional[str] = None
    analysis_zh: Optional[str] = None
    analysis_by_id: Optional[int] = None

    # Section 4: Engineering
    final_disposition_id: Optional[int] = None
    disposition_date: Optional[datetime] = None
    engineer_id: Optional[int] = None
    failure_code_id: Optional[int] = None
    rework_hours: Optional[float] = None
    responsible_department: Optional[str] = None
    material_scrap_cost: Optional[float] = None
    other_cost: Optional[float] = None
    engineering_remarks_en: Optional[str] = None
    engineering_remarks_es: Optional[str] = None
    engineering_remarks_zh: Optional[str] = None
    repair_process_en: Optional[str] = None
    repair_process_es: Optional[str] = None
    repair_process_zh: Optional[str] = None

    # Section 5: Quality
    disposition_approval_date: Optional[datetime] = None
    disposition_approved_by_id: Optional[int] = None
    sdr_number: Optional[str] = None

    class Config:
        from_attributes = True

class DMTRecordUpdate(BaseModel):
    """
    Schema para actualizar DMT Record - Permite actualización parcial
    Los campos permitidos dependen del rol del usuario
    La validación de permisos se hace en el router

    NOTE: Text fields are provided in a single language and auto-translated.
    The 'language' parameter should be sent separately (e.g., query param or header).
    """
    # Section 1: Inspector - General Information
    part_number_id: Optional[int] = None
    work_center_id: Optional[int] = None
    customer_id: Optional[int] = None
    level_id: Optional[int] = None
    area_id: Optional[int] = None
    prepared_by_id: Optional[int] = None
    operation: Optional[str] = None
    quantity: Optional[int] = None
    serial_number: Optional[str] = None
    date: Optional[datetime] = None
    inspection_item_id: Optional[int] = None
    process_code_id: Optional[int] = None
    report_number: Optional[str] = None

    # Section 2: Inspector - Defect Description
    defect_description: Optional[str] = None  # Input in user's language

    # Section 3: Process Analysis
    process_description: Optional[str] = None # Input in user's language
    analysis: Optional[str] = None # Input in user's language
    analysis_by_id: Optional[int] = None

    # Section 4: Engineering
    final_disposition_id: Optional[int] = None
    disposition_date: Optional[datetime] = None
    engineer_id: Optional[int] = None
    failure_code_id: Optional[int] = None
    rework_hours: Optional[float] = None
    responsible_department: Optional[str] = None
    material_scrap_cost: Optional[float] = None
    other_cost: Optional[float] = None
    engineering_remarks: Optional[str] = None # Input in user's language
    repair_process: Optional[str] = None  # Input in user's language

    # Section 5: Quality
    is_closed: Optional[bool] = None
    disposition_approval_date: Optional[datetime] = None
    disposition_approved_by_id: Optional[int] = None
    sdr_number: Optional[str] = None

    class Config:
        from_attributes = True
