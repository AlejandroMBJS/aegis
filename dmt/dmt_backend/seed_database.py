#!/usr/bin/env python3
"""
Database Seeding Script for DMT System
Creates initial users and catalog data for testing and development
"""

import sys
from sqlmodel import Session
from database import engine
from models import (
    User, PartNumber, WorkCenter, Customer, Level, Area,
    Calibration, InspectionItem, PreparedBy, ProcessCode, Disposition, FailureCode
)
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def create_users(session: Session):
    """Create default users for all roles"""
    print("Creating users...")

    users = []

    # System admin
    users.append(User(
        employee_number="ADM001",
        full_name="System Administrator",
        role="Admin",
        hashed_password=hash_password("admin123")
    ))

    # Inspectors - default password: employee123
    inspector_names = [
        "Liying Zhou",
        "Leilei Zheng",
        "Yong Chang",
        "Karen Ponce",
        "Lopez Perez, Nataly Raquel",
        "Rodriguez Padron, Diana Isela",
        "Becerra Mendez Elizabeth",
        "Mora Aviles Gloria Esmeralda",
        "Ramirez Elías Vanessa",
        "Perez Orta Javier",
        "Uriel De Jesus Flores Marin"
    ]

    for idx, name in enumerate(inspector_names, start=1):
        users.append(User(
            employee_number=f"INS{idx:03d}",
            full_name=name,
            role="Inspector",
            hashed_password=hash_password("employee123")
        ))

    # Operators - default password: employee123
    operator_names = [
        "Li Yaojie",
        "Zhou Liying",
        "Vega Segura, Emmanuel",
        "Rodriguez Hernandez, Braulio",
        "Hernandez Guerrero, Jose Victor",
        "Gutierrez , Jonathan",
        "Esteva Luis, Jonathan Vicente",
        "Rodriguez Lopez, Leonardo Daniel",
        "Rocha Sanchez, David Emmanuel",
        "Aguilera Salas, Miguel Naim",
        "De La Luz Octaviano, Eric",
        "Covarrubias Gonzalez, Gael Antonio",
        "Martinez Gutierrez, Juan Misael",
        "Colunga Mendez, Tadeo Gael",
        "Rivera Quezada, Erik",
        "Herrera Zuñiga, Cesar Carmelo",
        "Miranda Cuevas, Fernando Enrique",
        "Infante Dimas, Karina Lizbeth",
        "Juarez Uribe, Juan Alan",
        "Jalomo Gone, Cesar Omar",
        "Aviles Segura, Liliana",
        "Fuentes Fuentes, Angelica Maria",
        "Niño Rodriguez, Luis Antonio",
        "Martinez Vazquez, Jonathan Orlando",
        "Jasso Silva, Lesly Alondra",
        "Ornelas Flores, Gerardo",
        "Garcia Ovalle, Juan Gustavo",
        "Marquez Bravo, Adriana",
        "Hernandez Gaspar, Rocio Jhoana",
        "Hernandez Reyes, Amado",
        "Maya Salas, Valeria",
        "Castro Sanchez, Olga Carolina",
        "Oliva Gutierrez, Ma Del Carmen",
        "Torres Silva, Ximena Sarahi",
        "Garcia Ovalle, Victor Manuel",
        "Rodriguez Salazar, Jose Enrique",
        "Alvarado Salazar, Paola Guadalupe",
        "Silva Lopez, Sonia Alejandra",
        "Ramos Hernandez, Angel Josue",
        "Ramirez Campos, Erick Adolfo",
        "Gallegos Ruedas, Patricia Lili",
        "Romero Olaya, Cesar",
        "Bravo Lopez, Victor Javier",
        "Orozco Alvarado, Jesus Alberto",
        "Martinez Martinez, Rosario De Jesus",
        "Cardenas Lopez, Jesus Alberto",
        "Martinez Segura, Sandra",
        "Lopez Moreno, Sergio Eduardo",
        "Jalomo Garcia, Efren",
        "Gonzalez Hernandez, Carlos Eduardo",
        "Morales Argot, Angel Giovanni",
        "Sun Huaqiao",
        "Yang Daquan",
        "Zheng Leilei",
        "Yu Zhu",
        "Hu Kaisong",
        "Yuan Lei",
        "Kong Leifeng",
        "Guan Haobin",
        "Zhang Wei",
        "Xiao Gang",
        "Chang Yong"
    ]

    for idx, name in enumerate(operator_names, start=1):
        users.append(User(
            employee_number=f"OPR{idx:03d}",
            full_name=name,
            role="Operator",
            hashed_password=hash_password("employee123")
        ))

    for user in users:
        # Check if user already exists
        existing = session.query(User).filter(User.employee_number == user.employee_number).first()
        if not existing:
            session.add(user)
            print(f"  ✓ Created user: {user.employee_number} - {user.full_name} ({user.role})")
        else:
            print(f"  ⚠ User already exists: {user.employee_number}")

    session.commit()

def create_part_numbers(session: Session):
    """Create part numbers"""
    print("\nCreating part numbers...")

    part_numbers = [
        "9151355", "5073135-101", "10101B-518", "10101C-744", "10101B-514", "5153060-101",
        "5073134-101", "5203024-101", "5133103-101", "10101C-732", "1-01-050(09)", "5203118-101",
        "5093208-102", "336-0035-01", "10101B-572", "2823488-101", "5193156-101", "436-890",
        "488-133", "A1-379-1", "230-1056-01", "5113269-101", "5113267-101", "5203258-101",
        "5043158-101", "5103200-101", "5073180-101", "5153042-101", "5133061-101", "5043152-101",
        "5043103-101", "5133052-102", "2793957-101", "5203312-101", "3171539-113", "2305449-1",
        "5093782-102", "5093913-102", "3171539-2", "3171539-2-1", "5193467-101", "5203028-101",
        "5203023-101", "5203083-101", "2093123-101", "26538", "A3-766-1", "A3-769-1",
        "5193468-101", "5023008-1", "5023008-101", "5143020-101", "5203054-101", "5203062-101",
        "5193418-101", "2103120-101", "5203086-101", "5193357-101", "5193215-101", "5193082-102",
        "5193082-101", "5073121-101", "5203288-101", "5203263-101", "5193354-101", "5093243-102",
        "880420-103", "7203012-101", "5093831-102", "7203013-101", "5193032-101", "5113117-101",
        "24828-02", "24827-02", "27044", "476181-101", "617553-101", "617552-101", "26480",
        "617562-101", "617563-101", "27145", "617151-101", "27440", "27441", "616539-1",
        "24823-02", "24824-02", "624420-1", "624432-1", "A1-1352-2", "A1-1473-1", "A1-1474-1",
        "A1-1602-1", "A1-1600-1", "A1-1601-1", "2200007-101", "A1-1060-1", "A9-374-2",
        "A9-384-2", "6122145", "5163010-101", "5153068-101", "10101-1", "5173063-101",
        "10101C-749", "5203025-101", "10101C-724", "5133104-101", "5203112-101", "5153043-101",
        "5093207-101", "5133062-101", "5203119-101", "5093621-101", "10101C-731", "5153053-101",
        "5113270-101", "5043104-101", "331-0013-01", "336-0038-01", "5113268-101", "5073126-101",
        "2083314-101", "1-01-09", "436-889", "10101B-571", "332-0019-01", "2793956-101",
        "332-0008-01", "10101B-511", "332-0100-01", "10101C-712", "488-120", "A1-380-1",
        "5043159-104", "5153129-101", "5073181-101", "5133053-102", "5203260-101", "5203313-101",
        "5203314-101", "2306540-1", "FONN-863668", "14-0005", "7A008900", "A066L687",
        "67731651000", "HXE102048", "5639729", "5639761"
    ]

    for pn in part_numbers:
        existing = session.query(PartNumber).filter(PartNumber.item_number == pn).first()
        if not existing:
            part = PartNumber(item_number=pn, item_name=pn)
            session.add(part)
            print(f"  ✓ Created part: {pn}")

    session.commit()

def create_work_centers(session: Session):
    """Create work centers"""
    print("\nCreating work centers...")

    work_center_names = [
        "Wax Pattern",
        "Shell Making",
        "Cast",
        "Cutting",
        "Grinding",
        "Sandblasting",
        "Manual Operation_Casting",
        "Welding",
        "Milling",
        "Turning",
        "Manual Operation_Machining",
        "Assembly",
        "Surface treatment",
        "Incoming Inspection",
        "other"
    ]

    for idx, name in enumerate(work_center_names, start=1):
        existing = session.query(WorkCenter).filter(WorkCenter.item_number == f"WC-{idx:03d}").first()
        if not existing:
            center = WorkCenter(item_number=f"WC-{idx:03d}", item_name=name)
            session.add(center)
            print(f"  ✓ Created work center: WC-{idx:03d} - {name}")

    session.commit()

def create_customers(session: Session):
    """Create customers"""
    print("\nCreating customers...")

    customer_names = ["A108", "A109", "A135", "A146", "A261", "IMMX"]

    for name in customer_names:
        existing = session.query(Customer).filter(Customer.item_number == name).first()
        if not existing:
            customer = Customer(item_number=name, item_name=name)
            session.add(customer)
            print(f"  ✓ Created customer: {name}")

    session.commit()

def create_levels(session: Session):
    """Create defect levels"""
    print("\nCreating defect levels...")

    levels = [
        Level(item_number="L1", item_name="Critical"),
        Level(item_number="L2", item_name="Major"),
        Level(item_number="L3", item_name="Minor"),
        Level(item_number="L4", item_name="Cosmetic"),
    ]

    for level in levels:
        existing = session.query(Level).filter(Level.item_number == level.item_number).first()
        if not existing:
            session.add(level)
            print(f"  ✓ Created level: {level.item_number} - {level.item_name}")

    session.commit()

def create_areas(session: Session):
    """Create production areas"""
    print("\nCreating areas...")

    areas = [
        Area(item_number="AREA-01", item_name="Production Floor"),
        Area(item_number="AREA-02", item_name="Quality Control"),
        Area(item_number="AREA-03", item_name="Warehouse"),
        Area(item_number="AREA-04", item_name="Finishing"),
    ]

    for area in areas:
        existing = session.query(Area).filter(Area.item_number == area.item_number).first()
        if not existing:
            session.add(area)
            print(f"  ✓ Created area: {area.item_number} - {area.item_name}")

    session.commit()

def create_dispositions(session: Session):
    """Create final dispositions"""
    print("\nCreating dispositions...")

    dispositions = [
        Disposition(item_number="DISP-001", item_name="Use As Is"),
        Disposition(item_number="DISP-002", item_name="Rework"),
        Disposition(item_number="DISP-003", item_name="Scrap"),
        Disposition(item_number="DISP-004", item_name="Return to Supplier"),
    ]

    for disp in dispositions:
        existing = session.query(Disposition).filter(Disposition.item_number == disp.item_number).first()
        if not existing:
            session.add(disp)
            print(f"  ✓ Created disposition: {disp.item_number} - {disp.item_name}")

    session.commit()

def create_failure_codes(session: Session):
    """Create failure codes"""
    print("\nCreating failure codes...")

    codes = [
        FailureCode(item_number="FC-001", item_name="Material Defect"),
        FailureCode(item_number="FC-002", item_name="Process Error"),
        FailureCode(item_number="FC-003", item_name="Equipment Malfunction"),
        FailureCode(item_number="FC-004", item_name="Human Error"),
        FailureCode(item_number="FC-005", item_name="Design Issue"),
    ]

    for code in codes:
        existing = session.query(FailureCode).filter(FailureCode.item_number == code.item_number).first()
        if not existing:
            session.add(code)
            print(f"  ✓ Created failure code: {code.item_number} - {code.item_name}")

    session.commit()

def create_prepared_by(session: Session):
    """Create prepared by entries"""
    print("\nCreating prepared by entries...")

    prepared_by_names = [
        "Liying Zhou",
        "Leilei Zheng",
        "Yong Chang",
        "Karen Ponce",
        "Lopez Perez, Nataly Raquel",
        "Rodriguez Padron, Diana Isela",
        "Becerra Mendez Elizabeth",
        "Mora Aviles Gloria Esmeralda",
        "Ramirez Elías Vanessa",
        "Perez Orta Javier",
        "Uriel De Jesus Flores Marin"
    ]

    for idx, name in enumerate(prepared_by_names, start=1):
        item_number = f"PB-{idx:03d}"
        existing = session.query(PreparedBy).filter(PreparedBy.item_number == item_number).first()
        if not existing:
            prepared_by = PreparedBy(item_number=item_number, item_name=name)
            session.add(prepared_by)
            print(f"  ✓ Created prepared by: {item_number} - {name}")

    session.commit()

def create_inspection_items(session: Session):
    """Create inspection items"""
    print("\nCreating inspection items...")

    items = [
        InspectionItem(item_number="II-001", item_name="Visual Inspection"),
        InspectionItem(item_number="II-002", item_name="Dimensional Check"),
        InspectionItem(item_number="II-003", item_name="Functional Test"),
        InspectionItem(item_number="II-004", item_name="Surface Finish"),
        InspectionItem(item_number="II-005", item_name="Material Verification"),
    ]

    for item in items:
        existing = session.query(InspectionItem).filter(InspectionItem.item_number == item.item_number).first()
        if not existing:
            session.add(item)
            print(f"  ✓ Created inspection item: {item.item_number} - {item.item_name}")

    session.commit()

def create_process_codes(session: Session):
    """Create process codes"""
    print("\nCreating process codes...")

    codes = [
        ProcessCode(item_number="PC-001", item_name="Receiving Inspection"),
        ProcessCode(item_number="PC-002", item_name="In-Process Inspection"),
        ProcessCode(item_number="PC-003", item_name="Final Inspection"),
        ProcessCode(item_number="PC-004", item_name="First Article Inspection"),
        ProcessCode(item_number="PC-005", item_name="Supplier Quality"),
    ]

    for code in codes:
        existing = session.query(ProcessCode).filter(ProcessCode.item_number == code.item_number).first()
        if not existing:
            session.add(code)
            print(f"  ✓ Created process code: {code.item_number} - {code.item_name}")

    session.commit()

def seed_database():
    """Main seeding function"""
    print("="  * 60)
    print("DMT Database Seeding")
    print("=" * 60)

    try:
        with Session(engine) as session:
            create_users(session)
            create_part_numbers(session)
            create_work_centers(session)
            create_customers(session)
            create_levels(session)
            create_areas(session)
            create_dispositions(session)
            create_failure_codes(session)
            create_prepared_by(session)
            create_inspection_items(session)
            create_process_codes(session)

        print("\n" + "=" * 60)
        print("✓ Database seeded successfully!")
        print("=" * 60)

        print("\nDefault Login Credentials:")
        print("-" * 60)
        print("Admin:           ADM001 / admin123")
        print("Inspectors:      INS001-INS011 / employee123")
        print("Operators:       OPR001-OPR062 / employee123")
        print("-" * 60)
        print("\nNote: All employees use password: employee123")

    except Exception as e:
        print(f"\n✗ Error seeding database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    seed_database()
