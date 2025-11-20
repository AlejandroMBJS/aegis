
import logging
from sqlmodel import Session
from database import engine, init_db
from models import (
    User,
    PartNumber,
    WorkCenter,
    Customer,
    Level,
    Area,
    InspectionItem,
    PreparedBy,
    ProcessCode,
    Disposition,
    FailureCode,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_initial_data():
    """
    Create initial data for the database if it's empty.
    """
    with Session(engine) as session:
        # Check if data already exists
        if session.query(User).first():
            logger.info("Database already contains data. Skipping initialization.")
            return

        logger.info("Creating initial data...")

        # Create Users
        users = [
            User(employee_number="EMP001", full_name="John Doe", role="admin", hashed_password="hashed_password_1"),
            User(employee_number="EMP002", full_name="Jane Smith", role="user", hashed_password="hashed_password_2"),
        ]
        session.add_all(users)

        # Create Part Numbers
        part_numbers = [
            PartNumber(item_number="PN001", item_name="Part Number 1"),
            PartNumber(item_number="PN002", item_name="Part Number 2"),
        ]
        session.add_all(part_numbers)

        # Create Work Centers
        work_centers = [
            WorkCenter(item_number="WC001", item_name="Work Center 1"),
            WorkCenter(item_number="WC002", item_name="Work Center 2"),
        ]
        session.add_all(work_centers)

        # Create Customers
        customers = [
            Customer(item_number="CUST001", item_name="Customer 1"),
            Customer(item_number="CUST002", item_name="Customer 2"),
        ]
        session.add_all(customers)

        # Create Levels
        levels = [
            Level(item_number="LVL001", item_name="Level 1"),
            Level(item_number="LVL002", item_name="Level 2"),
        ]
        session.add_all(levels)

        # Create Areas
        areas = [
            Area(item_number="AREA001", item_name="Area 1"),
            Area(item_number="AREA002", item_name="Area 2"),
        ]
        session.add_all(areas)

        # Create Inspection Items
        inspection_items = [
            InspectionItem(item_number="II001", item_name="Inspection Item 1"),
            InspectionItem(item_number="II002", item_name="Inspection Item 2"),
        ]
        session.add_all(inspection_items)

        # Create Prepared By
        prepared_by = [
            PreparedBy(item_number="PB001", item_name="Prepared By 1"),
            PreparedBy(item_number="PB002", item_name="Prepared By 2"),
        ]
        session.add_all(prepared_by)

        # Create Process Codes
        process_codes = [
            ProcessCode(item_number="PC001", item_name="Process Code 1"),
            ProcessCode(item_number="PC002", item_name="Process Code 2"),
        ]
        session.add_all(process_codes)

        # Create Dispositions
        dispositions = [
            Disposition(item_number="DISP001", item_name="Disposition 1"),
            Disposition(item_number="DISP002", item_name="Disposition 2"),
        ]
        session.add_all(dispositions)

        # Create Failure Codes
        failure_codes = [
            FailureCode(item_number="FC001", item_name="Failure Code 1"),
            FailureCode(item_number="FC002", item_name="Failure Code 2"),
        ]
        session.add_all(failure_codes)

        session.commit()
        logger.info("Initial data created successfully.")

if __name__ == "__main__":
    logger.info("Initializing database...")
    init_db()
    create_initial_data()
    logger.info("Database initialization complete.")
