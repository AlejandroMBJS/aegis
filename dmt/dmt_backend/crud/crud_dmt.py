from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlmodel import Session, select
from models import DMTRecord, User
from schemas import DMTRecordCreate, DMTRecordUpdate
from translation_free import translate_field_to_all_languages

# Definición de campos permitidos por rol
# NOTE: Text fields are provided in a single language and auto-translated
ALLOWED_FIELDS_BY_ROLE = {
    "Admin": [
        # Section 1: General Information
        "part_number_id", "work_center_id", "customer_id", "level_id", "area_id",
        "prepared_by_id", "operation", "quantity", "serial_number", "date",
        "inspection_item_id", "process_code_id", "report_number",
        # Section 2: Defect Description
        "defect_description",
        # Section 3
        "process_description", "analysis", "analysis_by_id",
        # Section 4
        "final_disposition_id", "disposition_date", "engineer_id", "failure_code_id",
        "rework_hours", "responsible_department", "material_scrap_cost", "other_cost",
        "engineering_remarks", "repair_process",
        # Section 5
        "disposition_approval_date", "disposition_approved_by_id", "sdr_number", "is_closed"
    ],
    "Tech Engineer": [
        # Section 3
        "process_description", "analysis", "analysis_by_id",
        # Section 4
        "final_disposition_id", "disposition_date", "engineer_id", "failure_code_id",
        "rework_hours", "responsible_department", "material_scrap_cost", "other_cost",
        "engineering_remarks", "repair_process",
    ],
    "Inspector": [
        # Section 1: General Information
        "part_number_id", "work_center_id", "customer_id", "level_id", "area_id",
        "prepared_by_id", "operation", "quantity", "serial_number", "date",
        "inspection_item_id", "process_code_id", "report_number",
        # Section 2: Defect Description
        "defect_description"
    ],
    "Operator": [
        # Section 3
        "process_description", "analysis", "analysis_by_id",
    ],
    "Quality Engineer": [
        # Section 5
        "disposition_approval_date", "disposition_approved_by_id", "sdr_number", "is_closed"
    ]
}


def create_dmt(session: Session, dmt_data: DMTRecordCreate, created_by_id: int, language: str = 'en') -> DMTRecord:
    """
    Crear nuevo DMT Record con traducción automática
    Solo Inspector puede crear

    Args:
        session: Database session
        dmt_data: DMT record data from request
        created_by_id: ID of user creating the record
        language: Language of input text ('en', 'es', 'zh'). Default: 'en'

    Returns:
        Created DMT record with all text fields translated to all languages
    """
    # Translate defect_description to all languages
    defect_translations = translate_field_to_all_languages(
        dmt_data.defect_description, language
    ) if dmt_data.defect_description else {'en': '', 'es': '', 'zh': ''}

    # Generate report number if not provided (1000 + auto-increment)
    report_number = dmt_data.report_number if dmt_data.report_number else None

    db_dmt = DMTRecord(
        created_by_id=created_by_id,
        part_number_id=dmt_data.part_number_id,
        work_center_id=dmt_data.work_center_id,
        customer_id=dmt_data.customer_id,
        level_id=dmt_data.level_id,
        area_id=dmt_data.area_id,
        prepared_by_id=dmt_data.prepared_by_id,
        operation=dmt_data.operation,
        quantity=dmt_data.quantity,
        serial_number=dmt_data.serial_number,
        date=dmt_data.date,
        inspection_item_id=dmt_data.inspection_item_id,
        process_code_id=dmt_data.process_code_id,
        defect_description_en=defect_translations['en'],
        defect_description_es=defect_translations['es'],
        defect_description_zh=defect_translations['zh'],
        report_number=report_number,
        is_closed=False
    )
    session.add(db_dmt)
    session.commit()
    session.refresh(db_dmt)

    # Auto-generate report number after creation if not provided
    if not report_number:
        db_dmt.report_number = str(1000 + db_dmt.id)
        session.add(db_dmt)
        session.commit()
        session.refresh(db_dmt)

    return db_dmt


def get_dmt_by_id(session: Session, dmt_id: int) -> Optional[DMTRecord]:
    """
    Obtener DMT Record por ID
    """
    return session.get(DMTRecord, dmt_id)


def list_dmt(
    session: Session,
    skip: int = 0,
    limit: int = 100,
    is_closed: Optional[bool] = None,
    created_by_id: Optional[int] = None,
    part_number_id: Optional[int] = None,
    created_after: Optional[datetime] = None,
    created_before: Optional[datetime] = None
) -> List[DMTRecord]:
    """
    Listar DMT Records con filtros opcionales
    """
    statement = select(DMTRecord)

    # Aplicar filtros
    if is_closed is not None:
        statement = statement.where(DMTRecord.is_closed == is_closed)
    if created_by_id is not None:
        statement = statement.where(DMTRecord.created_by_id == created_by_id)
    if part_number_id is not None:
        statement = statement.where(DMTRecord.part_number_id == part_number_id)
    if created_after is not None:
        statement = statement.where(DMTRecord.created_at >= created_after)
    if created_before is not None:
        statement = statement.where(DMTRecord.created_at <= created_before)

    statement = statement.offset(skip).limit(limit)
    results = session.exec(statement).all()
    return results


def update_dmt_partial_with_field_control(
    session: Session,
    dmt_id: int,
    update_data: DMTRecordUpdate,
    user_role: str,
    language: str = 'en'
) -> Optional[DMTRecord]:
    """
    Actualizar DMT Record con control de campos por rol y traducción automática

    Args:
        session: Sesión de base de datos
        dmt_id: ID del DMT Record
        update_data: Datos a actualizar
        user_role: Rol del usuario que hace la actualización
        language: Language of input text ('en', 'es', 'zh'). Default: 'en'

    Returns:
        DMTRecord actualizado o None si no existe

    Raises:
        ValueError: Si el usuario intenta editar campos no permitidos para su rol
    """
    # Obtener el record
    db_dmt = session.get(DMTRecord, dmt_id)
    if not db_dmt:
        return None

    # Si está cerrado, no se puede editar
    if db_dmt.is_closed:
        raise ValueError("Cannot edit closed DMT Record")

    # Obtener campos permitidos para el rol
    allowed_fields = ALLOWED_FIELDS_BY_ROLE.get(user_role, [])

    # Convertir update_data a dict, excluyendo valores None
    update_dict = update_data.model_dump(exclude_unset=True)

    # Verificar que todos los campos en update_dict están permitidos para el rol
    for field_name in update_dict.keys():
        if field_name not in allowed_fields:
            raise ValueError(
                f"Field '{field_name}' cannot be edited by role '{user_role}'. "
                f"Allowed fields: {allowed_fields}"
            )

    # If Quality Engineer tries to close, validate required fields
    if user_role == "Quality Engineer" and update_dict.get("is_closed") is True:
        # Engineering fields must be filled before closing
        eng_required_fields = ["final_disposition_id", "failure_code_id", "engineer_id"]
        for field in eng_required_fields:
            if getattr(db_dmt, field) is None:
                raise ValueError(
                    f"Cannot close record. Engineering field '{field}' must be filled by a Technical Engineer first."
                )
        
        # Quality fields are required for closing
        quality_required_fields = ["disposition_approval_date", "disposition_approved_by_id"]
        for field in quality_required_fields:
            if field not in update_dict or update_dict[field] is None:
                raise ValueError(
                    f"Quality Engineer must provide '{field}' to close the record."
                )

    # Handle text field translation
    # Define text fields that need translation
    text_fields = {
        'defect_description': ['defect_description_en', 'defect_description_es', 'defect_description_zh'],
        'process_description': ['process_description_en', 'process_description_es', 'process_description_zh'],
        'analysis': ['analysis_en', 'analysis_es', 'analysis_zh'],
        'repair_process': ['repair_process_en', 'repair_process_es', 'repair_process_zh'],
        'engineering_remarks': ['engineering_remarks_en', 'engineering_remarks_es', 'engineering_remarks_zh']
    }

    # Aplicar las actualizaciones
    for field_name, value in update_dict.items():
        # Check if this is a text field that needs translation
        if field_name in text_fields and value:
            # Translate to all languages
            translations = translate_field_to_all_languages(value, language)

            # Set all language versions
            setattr(db_dmt, f'{field_name}_en', translations['en'])
            setattr(db_dmt, f'{field_name}_es', translations['es'])
            setattr(db_dmt, f'{field_name}_zh', translations['zh'])
        else:
            # Non-text fields or numeric fields - set directly
            setattr(db_dmt, field_name, value)

    session.add(db_dmt)
    session.commit()
    session.refresh(db_dmt)
    return db_dmt