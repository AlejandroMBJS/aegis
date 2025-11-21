from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlmodel import Session
from database import get_session
from schemas import DMTRecordCreate, DMTRecordRead, DMTRecordUpdate
from crud.crud_dmt import (
    create_dmt, get_dmt_by_id, list_dmt, update_dmt_partial_with_field_control
)
from deps import get_current_user, role_required
from models import User
import csv
import io

router = APIRouter(prefix="/dmt", tags=["DMT Records"])


@router.post("/", response_model=DMTRecordRead, status_code=status.HTTP_201_CREATED)
def create_dmt_record(
    dmt_data: DMTRecordCreate,
    language: str = Query('en', description="Input language code (en, es, zh)"),
    session: Session = Depends(get_session),
    current_user: User = Depends(role_required(["Inspector"]))
):
    """
    Crear nuevo DMT Record con traducción automática
    Solo Inspector puede crear
    Campos REQUERIDOS: part_number_id, work_center_id, customer_id, prepared_by_id,
                       operation, quantity, date, inspection_item_id, process_code_id,
                       defect_description

    Args:
        language: Language of input text (en, es, zh). Text will be auto-translated to all 3 languages.
    """
    dmt = create_dmt(session, dmt_data, current_user.id, language)
    return dmt


@router.get("/", response_model=List[DMTRecordRead])
def list_dmt_records(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_closed: Optional[bool] = Query(None, description="Filter by closed status"),
    created_by_id: Optional[int] = Query(None, description="Filter by creator user ID"),
    part_number_id: Optional[int] = Query(None, description="Filter by part number ID"),
    created_after: Optional[datetime] = Query(None, description="Filter by created after date"),
    created_before: Optional[datetime] = Query(None, description="Filter by created before date"),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Listar DMT Records con filtros opcionales
    Accesible para todos los roles autenticados
    """
    dmts = list_dmt(
        session=session,
        skip=skip,
        limit=limit,
        is_closed=is_closed,
        created_by_id=created_by_id,
        part_number_id=part_number_id,
        created_after=created_after,
        created_before=created_before
    )
    return dmts


@router.get("/{dmt_id}", response_model=DMTRecordRead)
def get_dmt_record(
    dmt_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener un DMT Record específico por ID
    Accesible para todos los roles autenticados
    """
    dmt = get_dmt_by_id(session, dmt_id)
    if not dmt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"DMT Record with id {dmt_id} not found"
        )
    return dmt


@router.patch("/{dmt_id}", response_model=DMTRecordRead)
async def update_dmt_record(
    dmt_id: int,
    update_data: DMTRecordUpdate,
    language: str = Query('en', description="Input language code (en, es, zh)"),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar DMT Record con control de campos por rol y traducción automática

    Reglas:
    - Si is_closed == True: No se puede editar (HTTP 400)
    - Admin: puede editar todos los campos
    - Tech Engineer: puede editar todos los campos
    - Inspector: Section 1 (General Information) + Section 2 (Defect Description)
    - Operator: solo process_description, analysis, analysis_by_id
    - Quality Engineer: solo puede cerrar (is_closed=True) y debe proveer final_disposition_id, failure_code_id, approved_by_id

    Args:
        language: Language of input text (en, es, zh). Text will be auto-translated to all 3 languages.

    La validación de permisos por campo se realiza en la función CRUD
    """
    try:
        dmt = update_dmt_partial_with_field_control(
            session=session,
            dmt_id=dmt_id,
            update_data=update_data,
            user_role=current_user.role,
            language=language
        )

        if not dmt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"DMT Record with id {dmt_id} not found"
            )

        return dmt

    except ValueError as e:
        # Errores de validación (campos no permitidos, record cerrado, etc.)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/{dmt_id}", response_model=DMTRecordRead)
async def delete_dmt_record(
    dmt_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(role_required(["Admin"]))
):
    """
    Delete a DMT record by ID.
    Only Admin can delete.
    """

    dmt = get_dmt_by_id(session, dmt_id)
    if not dmt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"DMT Record with id {dmt_id} not found"
        )

    try:
        session.delete(dmt)
        session.commit()
        return dmt

    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/export/csv")
async def export_dmt_csv(
    start_date: Optional[datetime] = Query(None, description="Start date for filtering (YYYY-MM-DD)"),
    end_date: Optional[datetime] = Query(None, description="End date for filtering (YYYY-MM-DD)"),
    language: str = Query('en', description="Language for text fields (en, es, zh)"),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Export DMT records to CSV format with date filtering.

    Args:
        start_date: Filter records created on or after this date
        end_date: Filter records created before or on this date
        language: Language for text fields (en, es, zh)

    Returns:
        CSV file with all DMT records matching the filters
    """
    # Get filtered records
    records = list_dmt(
        session=session,
        skip=0,
        limit=10000,  # Large limit to get all records
        created_after=start_date,
        created_before=end_date
    )

    # Create CSV in memory with utf-8 encoding and BOM
    output = io.StringIO(newline='')
    writer = csv.writer(output)

    # Write header
    header = [
        'ID', 'Report Number', 'Created At', 'Created By', 'Is Closed',
        'Part Number', 'Work Center', 'Customer', 'Level', 'Area',
        'Prepared By', 'Operation', 'Quantity', 'Serial Number', 'Date',
        'Inspection Item', 'Process Code',
        'Defect Description', 'Process Description', 'Analysis', 'Analysis By',
        'Final Disposition', 'Disposition Date', 'Engineer', 'Failure Code',
        'Rework Hours', 'Responsible Department', 'Material Scrap Cost', 'Other Cost',
        'Engineering Remarks', 'Repair Process',
        'Disposition Approval Date', 'Disposition Approved By', 'SDR Number'
    ]
    writer.writerow(header)

    # Write data rows
    for record in records:
        # Get related entity names
        part_number_name = f"{record.part_number.item_number} - {record.part_number.item_name}" if record.part_number else ""
        work_center_name = f"{record.work_center.item_number} - {record.work_center.item_name}" if record.work_center else ""
        customer_name = f"{record.customer.item_number} - {record.customer.item_name}" if record.customer else ""
        level_name = f"{record.level.item_number} - {record.level.item_name}" if record.level else ""
        area_name = f"{record.area.item_number} - {record.area.item_name}" if record.area else ""
        prepared_by_name = f"{record.prepared_by.item_number} - {record.prepared_by.item_name}" if record.prepared_by else ""
        inspection_item_name = f"{record.inspection_item.item_number} - {record.inspection_item.item_name}" if record.inspection_item else ""
        process_code_name = f"{record.process_code.item_number} - {record.process_code.item_name}" if record.process_code else ""
        disposition_name = f"{record.final_disposition.item_number} - {record.final_disposition.item_name}" if record.final_disposition else ""
        failure_code_name = f"{record.failure_code.item_number} - {record.failure_code.item_name}" if record.failure_code else ""

        # Get user names
        created_by = session.get(User, record.created_by_id)
        created_by_name = f"{created_by.username} - {created_by.full_name}" if created_by else ""

        analysis_by = session.get(User, record.analysis_by_id) if record.analysis_by_id else None
        analysis_by_name = f"{analysis_by.username} - {analysis_by.full_name}" if analysis_by else ""

        engineer = session.get(User, record.engineer_id) if record.engineer_id else None
        engineer_name = f"{engineer.username} - {engineer.full_name}" if engineer else ""

        approved_by = session.get(User, record.disposition_approved_by_id) if record.disposition_approved_by_id else None
        approved_by_name = f"{approved_by.username} - {approved_by.full_name}" if approved_by else ""

        # Get text fields in requested language, fall back to English if specific language is empty
        defect_desc = getattr(record, f'defect_description_{language}', '') or getattr(record, 'defect_description_en', '') or ''
        process_desc = getattr(record, f'process_description_{language}', '') or getattr(record, 'process_description_en', '') or ''
        analysis = getattr(record, f'analysis_{language}', '') or getattr(record, 'analysis_en', '') or ''
        eng_remarks = getattr(record, f'engineering_remarks_{language}', '') or getattr(record, 'engineering_remarks_en', '') or ''
        repair_process = getattr(record, f'repair_process_{language}', '') or getattr(record, 'repair_process_en', '') or ''

        row = [
            record.id,
            record.report_number or '',
            record.created_at.strftime('%Y-%m-%d %H:%M:%S') if record.created_at else '',
            created_by_name,
            'Yes' if record.is_closed else 'No',
            part_number_name,
            work_center_name,
            customer_name,
            level_name,
            area_name,
            prepared_by_name,
            record.operation or '',
            record.quantity or '',
            record.serial_number or '',
            record.date.strftime('%Y-%m-%d') if record.date else '',
            inspection_item_name,
            process_code_name,
            defect_desc,
            process_desc,
            analysis,
            analysis_by_name,
            disposition_name,
            record.disposition_date.strftime('%Y-%m-%d') if record.disposition_date else '',
            engineer_name,
            failure_code_name,
            record.rework_hours or '',
            record.responsible_department or '',
            record.material_scrap_cost or '',
            record.other_cost or '',
            eng_remarks,
            repair_process,
            record.disposition_approval_date.strftime('%Y-%m-%d') if record.disposition_approval_date else '',
            approved_by_name,
            record.sdr_number or ''
        ]
        writer.writerow(row)

    # Prepare response
    output.seek(0)

    # Generate filename with date range
    filename = "dmt_records"
    if start_date:
        filename += f"_{start_date.strftime('%Y%m%d')}"
    if end_date:
        filename += f"_to_{end_date.strftime('%Y%m%d')}"
    filename += ".csv"

    return StreamingResponse(
        iter([output.getvalue().encode('utf-8-sig')]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
