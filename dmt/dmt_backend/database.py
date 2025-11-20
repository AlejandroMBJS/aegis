import os
from sqlmodel import SQLModel, create_engine, Session

# Database configuration - Database agnostic with SQLite as default
#
# Supported databases:
# - SQLite (default): sqlite:///./dmt.db
# - MySQL/MariaDB: mysql+pymysql://user:password@host:port/database
# - PostgreSQL: postgresql://user:password@host:port/database
# - Oracle: oracle+cx_oracle://user:password@host:port/database
#
# To switch databases, set the DATABASE_URL environment variable:
# export DATABASE_URL="mysql+pymysql://root:admin123@localhost:3306/dmt_db"

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./dmt.db"  # SQLite default - file-based, no server needed
)

# Detect database type from URL
db_type = DATABASE_URL.split(':')[0].split('+')[0]

# Database-specific engine configuration
if db_type == 'sqlite':
    # SQLite-specific configuration
    engine = create_engine(
        DATABASE_URL,
        echo=True,  # Set to False in production
        connect_args={"check_same_thread": False}  # Required for SQLite with FastAPI
    )
else:
    # MySQL, PostgreSQL, Oracle configuration
    engine = create_engine(
        DATABASE_URL,
        echo=True,  # Set to False in production
        pool_pre_ping=True,
        pool_recycle=3600
    )

def init_db():
    """
    Inicializar la base de datos creando todas las tablas
    Usar SQLModel.metadata.create_all(engine)
    """
    SQLModel.metadata.create_all(engine)

def get_session():
    """
    Dependency para obtener sesión de base de datos
    """
    with Session(engine) as session:
        yield session
