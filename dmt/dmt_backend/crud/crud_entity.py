from typing import Optional, List, Type
from sqlmodel import Session, select
from models import (
    PartNumber, WorkCenter, Customer, Level, Area,
    Calibration, InspectionItem, PreparedBy, ProcessCode, Disposition, FailureCode
)
from schemas import EntityCreate

# Mapeo de nombres de entities a modelos
ENTITY_MODELS = {
    "partnumber": PartNumber,
    "workcenter": WorkCenter,
    "customer": Customer,
    "level": Level,
    "area": Area,
    "calibration": Calibration,
    "inspectionitem": InspectionItem,
    "preparedby": PreparedBy,
    "processcode": ProcessCode,
    "disposition": Disposition,
    "failurecode": FailureCode,
}


def get_entity_model(entity_name: str) -> Optional[Type]:
    """
    Obtener el modelo de SQLModel correspondiente al nombre del entity
    """
    return ENTITY_MODELS.get(entity_name.lower())


def create_entity(session: Session, entity_name: str, entity_data: EntityCreate):
    """
    Crear un nuevo registro en el catálogo especificado
    """
    model = get_entity_model(entity_name)
    if not model:
        raise ValueError(f"Entity '{entity_name}' not found")

    db_entity = model(
        item_number=entity_data.item_number,
        item_name=entity_data.item_name
    )
    session.add(db_entity)
    session.commit()
    session.refresh(db_entity)
    return db_entity


def get_entity(session: Session, entity_name: str, entity_id: int):
    """
    Obtener un registro específico del catálogo por ID
    """
    model = get_entity_model(entity_name)
    if not model:
        raise ValueError(f"Entity '{entity_name}' not found")

    return session.get(model, entity_id)


def list_entities(session: Session, entity_name: str, skip: int = 0, limit: int = 100) -> List:
    """
    Listar todos los registros del catálogo con paginación
    """
    model = get_entity_model(entity_name)
    if not model:
        raise ValueError(f"Entity '{entity_name}' not found")

    statement = select(model).offset(skip).limit(limit)
    results = session.exec(statement).all()
    return results


def update_entity(session: Session, entity_name: str, entity_id: int, entity_data: EntityCreate):
    """
    Actualizar un registro del catálogo
    """
    model = get_entity_model(entity_name)
    if not model:
        raise ValueError(f"Entity '{entity_name}' not found")

    db_entity = session.get(model, entity_id)
    if not db_entity:
        return None

    db_entity.item_number = entity_data.item_number
    db_entity.item_name = entity_data.item_name

    session.add(db_entity)
    session.commit()
    session.refresh(db_entity)
    return db_entity


def delete_entity(session: Session, entity_name: str, entity_id: int) -> bool:
    """
    Eliminar un registro del catálogo
    """
    model = get_entity_model(entity_name)
    if not model:
        raise ValueError(f"Entity '{entity_name}' not found")

    db_entity = session.get(model, entity_id)
    if not db_entity:
        return False

    session.delete(db_entity)
    session.commit()
    return True
