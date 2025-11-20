from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import Column, String, Text
from typing import Optional, List
from datetime import datetime

# ---------------------------------------------------
# BASE CLASS FOR CATALOG ENTITIES
# ---------------------------------------------------
class EntityBase(SQLModel):
    item_number: str = Field(
        index=True,
        unique=True,
        max_length=100  # MariaDB requires VARCHAR length
    )
    item_name: str = Field(
        max_length=255    # safe default for names
    )


# ---------------------------------------------------
# USER MODEL
# ---------------------------------------------------
class UserBase(SQLModel):
    employee_number: str = Field(
        index=True,
        unique=True,
        max_length=100  # FIX: MariaDB requires explicit length
    )
    full_name: str = Field(max_length=255)
    role: str = Field(max_length=100)
    hashed_password: str = Field(max_length=255)


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    # Specify which foreign key to use for the relationship
    dmt_records: List["DMTRecord"] = Relationship(
        back_populates="creator",
        sa_relationship_kwargs={"foreign_keys": "[DMTRecord.created_by_id]"}
    )


# ---------------------------------------------------
# CATALOG TABLES
# ---------------------------------------------------
class PartNumber(EntityBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class WorkCenter(EntityBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class Customer(EntityBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class Level(EntityBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class Area(EntityBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class Calibration(EntityBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class InspectionItem(EntityBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class PreparedBy(EntityBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class ProcessCode(EntityBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class Disposition(EntityBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class FailureCode(EntityBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


# ---------------------------------------------------
# DMT RECORD (TRANSACTION)
# ---------------------------------------------------
class DMTRecordBase(SQLModel):

    is_closed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by_id: int = Field(foreign_key="user.id")

    report_number: Optional[str] = Field(default=None, max_length=100)

    # Section 1: Inspector - General Information
    part_number_id: Optional[int] = Field(default=None, foreign_key="partnumber.id")
    work_center_id: Optional[int] = Field(default=None, foreign_key="workcenter.id")
    customer_id: Optional[int] = Field(default=None, foreign_key="customer.id")
    level_id: Optional[int] = Field(default=None, foreign_key="level.id")
    area_id: Optional[int] = Field(default=None, foreign_key="area.id")
    prepared_by_id: Optional[int] = Field(default=None, foreign_key="preparedby.id")
    operation: Optional[str] = Field(default=None, max_length=255)
    quantity: Optional[int] = Field(default=None)
    serial_number: Optional[str] = Field(default=None, max_length=255)
    date: Optional[datetime] = None
    inspection_item_id: Optional[int] = Field(default=None, foreign_key="inspectionitem.id")
    process_code_id: Optional[int] = Field(default=None, foreign_key="processcode.id")

    # Section 2: Inspector - Defect Description
    defect_description_en: Optional[str] = Field(default=None, sa_column=Column(Text))
    defect_description_zh: Optional[str] = Field(default=None, sa_column=Column(Text))
    defect_description_es: Optional[str] = Field(default=None, sa_column=Column(Text))

    # Section 3: Process Analysis
    process_description_en: Optional[str] = Field(default=None, sa_column=Column(Text))
    process_description_zh: Optional[str] = Field(default=None, sa_column=Column(Text))
    process_description_es: Optional[str] = Field(default=None, sa_column=Column(Text))
    analysis_en: Optional[str] = Field(default=None, sa_column=Column(Text))
    analysis_zh: Optional[str] = Field(default=None, sa_column=Column(Text))
    analysis_es: Optional[str] = Field(default=None, sa_column=Column(Text))
    analysis_by_id: Optional[int] = Field(default=None, foreign_key="user.id")

    # Section 4: Engineering
    final_disposition_id: Optional[int] = Field(default=None, foreign_key="disposition.id")
    disposition_date: Optional[datetime] = None
    engineer_id: Optional[int] = Field(default=None, foreign_key="user.id")
    failure_code_id: Optional[int] = Field(default=None, foreign_key="failurecode.id")
    rework_hours: Optional[float] = None
    responsible_department: Optional[str] = Field(default=None, max_length=255)
    material_scrap_cost: Optional[float] = None
    other_cost: Optional[float] = None
    engineering_remarks_en: Optional[str] = Field(default=None, sa_column=Column(Text))
    engineering_remarks_zh: Optional[str] = Field(default=None, sa_column=Column(Text))
    engineering_remarks_es: Optional[str] = Field(default=None, sa_column=Column(Text))
    repair_process_en: Optional[str] = Field(default=None, sa_column=Column(Text))
    repair_process_zh: Optional[str] = Field(default=None, sa_column=Column(Text))
    repair_process_es: Optional[str] = Field(default=None, sa_column=Column(Text))

    # Section 5: Quality
    disposition_approval_date: Optional[datetime] = None
    disposition_approved_by_id: Optional[int] = Field(default=None, foreign_key="user.id")
    sdr_number: Optional[str] = Field(default=None, max_length=255)


class DMTRecord(DMTRecordBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    # Explicitly specify which foreign key to use (created_by_id, not approved_by_id)
    creator: User = Relationship(
        back_populates="dmt_records",
        sa_relationship_kwargs={"foreign_keys": "[DMTRecord.created_by_id]"}
    )

    part_number: Optional[PartNumber] = Relationship()
    work_center: Optional[WorkCenter] = Relationship()
    customer: Optional[Customer] = Relationship()
    level: Optional[Level] = Relationship()
    area: Optional[Area] = Relationship()
    prepared_by: Optional[PreparedBy] = Relationship()
    inspection_item: Optional[InspectionItem] = Relationship()
    process_code: Optional[ProcessCode] = Relationship()

    final_disposition: Optional[Disposition] = Relationship()
    failure_code: Optional[FailureCode] = Relationship()
