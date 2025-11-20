"""
Script de inicialización para crear usuarios y datos de ejemplo
Ejecutar después de levantar docker-compose para poblar la base de datos
"""
from sqlmodel import Session, select
from database import engine
from models import (
    User, PartNumber, WorkCenter, Customer, Level, Area,
    Calibration, InspectionItem, PreparedBy, Disposition, FailureCode
)
from auth import get_password_hash


def create_sample_users(session: Session):
    """Crear usuarios de ejemplo para cada rol"""
    print("Creando usuarios de ejemplo...")

    users_data = [
        {"employee_number": "ADM001", "full_name": "Admin User", "role": "Admin", "password": "admin123"},
        {"employee_number": "INS001", "full_name": "Inspector User", "role": "Inspector", "password": "inspector123"},
        {"employee_number": "OPE001", "full_name": "Operator User", "role": "Operator", "password": "operator123"},
        {"employee_number": "ENG001", "full_name": "Tech Engineer User", "role": "Tech Engineer", "password": "engineer123"},
        {"employee_number": "QUA001", "full_name": "Quality Engineer User", "role": "Quality Engineer", "password": "quality123"},
    ]

    for user_data in users_data:
        # Verificar si el usuario ya existe
        statement = select(User).where(User.employee_number == user_data["employee_number"])
        existing_user = session.exec(statement).first()

        if not existing_user:
            user = User(
                employee_number=user_data["employee_number"],
                full_name=user_data["full_name"],
                role=user_data["role"],
                hashed_password=get_password_hash(user_data["password"])
            )
            session.add(user)
            print(f"  - Creado: {user_data['employee_number']} ({user_data['role']}) - Password: {user_data['password']}")
        else:
            print(f"  - Ya existe: {user_data['employee_number']}")

    session.commit()
    print("Usuarios creados exitosamente.\n")


def create_sample_entities(session: Session):
    """Crear datos de ejemplo para los catálogos"""
    print("Creando datos de ejemplo para catálogos...")

    # Part Numbers
    part_numbers = [
        {"item_number": "PN001", "item_name": "Part Number 001"},
        {"item_number": "PN002", "item_name": "Part Number 002"},
        {"item_number": "PN003", "item_name": "Part Number 003"},
    ]
    create_entities(session, PartNumber, part_numbers, "Part Numbers")

    # Work Centers
    work_centers = [
        {"item_number": "WC001", "item_name": "Work Center 001"},
        {"item_number": "WC002", "item_name": "Work Center 002"},
    ]
    create_entities(session, WorkCenter, work_centers, "Work Centers")

    # Customers
    customers = [
        {"item_number": "CUS001", "item_name": "Customer A"},
        {"item_number": "CUS002", "item_name": "Customer B"},
    ]
    create_entities(session, Customer, customers, "Customers")

    # Levels
    levels = [
        {"item_number": "L1", "item_name": "Level 1"},
        {"item_number": "L2", "item_name": "Level 2"},
        {"item_number": "L3", "item_name": "Level 3"},
    ]
    create_entities(session, Level, levels, "Levels")

    # Areas
    areas = [
        {"item_number": "A001", "item_name": "Area A"},
        {"item_number": "A002", "item_name": "Area B"},
    ]
    create_entities(session, Area, areas, "Areas")

    # Calibrations
    calibrations = [
        {"item_number": "CAL001", "item_name": "Calibration Type 1"},
        {"item_number": "CAL002", "item_name": "Calibration Type 2"},
    ]
    create_entities(session, Calibration, calibrations, "Calibrations")

    # Inspection Items
    inspection_items = [
        {"item_number": "INS001", "item_name": "Visual Inspection"},
        {"item_number": "INS002", "item_name": "Dimensional Inspection"},
    ]
    create_entities(session, InspectionItem, inspection_items, "Inspection Items")

    # Prepared Bys
    prepared_bys = [
        {"item_number": "PRE001", "item_name": "Prepared By A"},
        {"item_number": "PRE002", "item_name": "Prepared By B"},
    ]
    create_entities(session, PreparedBy, prepared_bys, "Prepared Bys")

    # Dispositions
    dispositions = [
        {"item_number": "DIS001", "item_name": "Accept"},
        {"item_number": "DIS002", "item_name": "Reject"},
        {"item_number": "DIS003", "item_name": "Rework"},
    ]
    create_entities(session, Disposition, dispositions, "Dispositions")

    # Failure Codes
    failure_codes = [
        {"item_number": "FC001", "item_name": "Material Defect"},
        {"item_number": "FC002", "item_name": "Process Error"},
        {"item_number": "FC003", "item_name": "Measurement Error"},
    ]
    create_entities(session, FailureCode, failure_codes, "Failure Codes")

    session.commit()
    print("Catálogos creados exitosamente.\n")


def create_entities(session: Session, model, entities_data, entity_name):
    """Función auxiliar para crear entidades"""
    print(f"  - {entity_name}:")
    for entity_data in entities_data:
        statement = select(model).where(model.item_number == entity_data["item_number"])
        existing = session.exec(statement).first()

        if not existing:
            entity = model(**entity_data)
            session.add(entity)
            print(f"    * Creado: {entity_data['item_number']} - {entity_data['item_name']}")
        else:
            print(f"    * Ya existe: {entity_data['item_number']}")


def main():
    """Función principal de inicialización"""
    print("\n" + "="*60)
    print("SCRIPT DE INICIALIZACIÓN DE DATOS")
    print("="*60 + "\n")

    with Session(engine) as session:
        create_sample_users(session)
        create_sample_entities(session)

    print("="*60)
    print("INICIALIZACIÓN COMPLETADA")
    print("="*60)
    print("\nCredenciales de usuarios:")
    print("  Admin:            ADM001 / admin123")
    print("  Inspector:        INS001 / inspector123")
    print("  Operator:         OPE001 / operator123")
    print("  Tech Engineer:    ENG001 / engineer123")
    print("  Quality Engineer: QUA001 / quality123")
    print("\nPuedes usar estos usuarios para autenticarte en /auth/token")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
