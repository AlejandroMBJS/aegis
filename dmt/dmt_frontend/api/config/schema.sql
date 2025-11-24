-- DMT Database Schema for SQLite
-- Compatible with Python SQLModel schema

-- Users table
CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_username ON user(username);
CREATE INDEX IF NOT EXISTS idx_user_email ON user(email);

-- Catalog tables (all share same structure)
CREATE TABLE IF NOT EXISTS partnumber (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_number VARCHAR(100) NOT NULL UNIQUE,
    item_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS workcenter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_number VARCHAR(100) NOT NULL UNIQUE,
    item_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS customer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_number VARCHAR(100) NOT NULL UNIQUE,
    item_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS level (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_number VARCHAR(100) NOT NULL UNIQUE,
    item_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS area (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_number VARCHAR(100) NOT NULL UNIQUE,
    item_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS calibration (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_number VARCHAR(100) NOT NULL UNIQUE,
    item_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS inspectionitem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_number VARCHAR(100) NOT NULL UNIQUE,
    item_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS preparedby (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_number VARCHAR(100) NOT NULL UNIQUE,
    item_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS processcode (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_number VARCHAR(100) NOT NULL UNIQUE,
    item_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS disposition (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_number VARCHAR(100) NOT NULL UNIQUE,
    item_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS failurecode (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_number VARCHAR(100) NOT NULL UNIQUE,
    item_name VARCHAR(255) NOT NULL
);

-- DMT Record table
CREATE TABLE IF NOT EXISTS dmtrecord (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    is_closed BOOLEAN DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by_id INTEGER NOT NULL,
    report_number VARCHAR(100),

    -- Section 1: Inspector - General Information
    part_number_id INTEGER,
    work_center_id INTEGER,
    customer_id INTEGER,
    level_id INTEGER,
    area_id INTEGER,
    prepared_by_id INTEGER,
    operation VARCHAR(255),
    quantity INTEGER,
    serial_number VARCHAR(255),
    date TIMESTAMP,
    inspection_item_id INTEGER,
    process_code_id INTEGER,

    -- Section 2: Inspector - Defect Description (multilingual)
    defect_description_en TEXT,
    defect_description_zh TEXT,
    defect_description_es TEXT,

    -- Section 3: Process Analysis (multilingual)
    process_description_en TEXT,
    process_description_zh TEXT,
    process_description_es TEXT,
    analysis_en TEXT,
    analysis_zh TEXT,
    analysis_es TEXT,
    analysis_by_id INTEGER,

    -- Section 4: Engineering
    final_disposition_id INTEGER,
    disposition_date TIMESTAMP,
    engineer_id INTEGER,
    failure_code_id INTEGER,
    rework_hours REAL,
    responsible_department VARCHAR(255),
    material_scrap_cost REAL,
    other_cost REAL,
    engineering_remarks_en TEXT,
    engineering_remarks_zh TEXT,
    engineering_remarks_es TEXT,
    repair_process_en TEXT,
    repair_process_zh TEXT,
    repair_process_es TEXT,

    -- Section 5: Quality
    disposition_approval_date TIMESTAMP,
    disposition_approved_by_id INTEGER,
    sdr_number VARCHAR(255),

    -- Foreign keys
    FOREIGN KEY (created_by_id) REFERENCES user(id),
    FOREIGN KEY (part_number_id) REFERENCES partnumber(id),
    FOREIGN KEY (work_center_id) REFERENCES workcenter(id),
    FOREIGN KEY (customer_id) REFERENCES customer(id),
    FOREIGN KEY (level_id) REFERENCES level(id),
    FOREIGN KEY (area_id) REFERENCES area(id),
    FOREIGN KEY (prepared_by_id) REFERENCES preparedby(id),
    FOREIGN KEY (inspection_item_id) REFERENCES inspectionitem(id),
    FOREIGN KEY (process_code_id) REFERENCES processcode(id),
    FOREIGN KEY (analysis_by_id) REFERENCES user(id),
    FOREIGN KEY (final_disposition_id) REFERENCES disposition(id),
    FOREIGN KEY (engineer_id) REFERENCES user(id),
    FOREIGN KEY (failure_code_id) REFERENCES failurecode(id),
    FOREIGN KEY (disposition_approved_by_id) REFERENCES user(id)
);

CREATE INDEX IF NOT EXISTS idx_dmtrecord_created_by ON dmtrecord(created_by_id);
CREATE INDEX IF NOT EXISTS idx_dmtrecord_is_closed ON dmtrecord(is_closed);
CREATE INDEX IF NOT EXISTS idx_dmtrecord_part_number ON dmtrecord(part_number_id);
CREATE INDEX IF NOT EXISTS idx_dmtrecord_created_at ON dmtrecord(created_at);
