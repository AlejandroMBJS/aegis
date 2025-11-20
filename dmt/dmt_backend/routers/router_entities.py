from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from database import get_session
from schemas import EntityCreate, EntityRead
from crud.crud_entity import (
    create_entity, get_entity, list_entities, update_entity, delete_entity
)
from deps import get_current_user, role_required
from models import User

router = APIRouter(prefix="/entities", tags=["Entities (Catalogs)"])


@router.post("/{entity_name}", response_model=EntityRead, status_code=status.HTTP_201_CREATED)
def create_entity_endpoint(
    entity_name: str,
    entity_data: EntityCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(role_required(["Admin"]))
):
    """
    Crear nuevo registro en catálogo
    Solo Admin puede crear
    """
    try:
        entity = create_entity(session, entity_name, entity_data)
        return entity
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{entity_name}", response_model=List[EntityRead])
def list_entities_endpoint(
    entity_name: str,
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Listar todos los registros de un catálogo
    Todos los roles autenticados pueden leer
    """
    try:
        entities = list_entities(session, entity_name, skip, limit)
        return entities
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{entity_name}/{entity_id}", response_model=EntityRead)
def get_entity_endpoint(
    entity_name: str,
    entity_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener un registro específico del catálogo
    Todos los roles autenticados pueden leer
    """
    try:
        entity = get_entity(session, entity_name, entity_id)
        if not entity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Entity '{entity_name}' with id {entity_id} not found"
            )
        return entity
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{entity_name}/{entity_id}", response_model=EntityRead)
def update_entity_endpoint(
    entity_name: str,
    entity_id: int,
    entity_data: EntityCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(role_required(["Admin"]))
):
    """
    Actualizar registro del catálogo
    Solo Admin puede actualizar
    """
    try:
        entity = update_entity(session, entity_name, entity_id, entity_data)
        if not entity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Entity '{entity_name}' with id {entity_id} not found"
            )
        return entity
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{entity_name}/{entity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entity_endpoint(
    entity_name: str,
    entity_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(role_required(["Admin"]))
):
    """
    Eliminar registro del catálogo
    Solo Admin puede eliminar
    """
    try:
        deleted = delete_entity(session, entity_name, entity_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Entity '{entity_name}' with id {entity_id} not found"
            )
        return None
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
