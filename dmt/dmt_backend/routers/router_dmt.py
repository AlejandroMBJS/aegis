from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from database import get_session
from schemas import DMTRecordCreate, DMTRecordRead, DMTRecordUpdate
from crud.crud_dmt import (
    create_dmt, get_dmt_by_id, list_dmt, update_dmt_partial_with_field_control
)
from deps import get_current_user, role_required
from models import User

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
