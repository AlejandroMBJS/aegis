# DMT System - Database Agnostic Architecture

## Overview

The DMT (Defect Management & Tracking) system now uses a **database-agnostic architecture** that supports multiple database backends:

- **SQLite** (default) - File-based, no server required
- **MySQL/MariaDB** - Full-featured relational database
- **PostgreSQL** - Advanced open-source database
- **Oracle** - Enterprise database (driver configuration required)

You can easily switch between databases by simply changing a configuration file and running an initialization script.

---

## Current Configuration: SQLite

The system is currently configured to use **SQLite** as the default database.

### Why SQLite?

✅ **Zero configuration** - No database server installation required
✅ **Portable** - Database is a single file (`dmt.db`)
✅ **Fast setup** - Automatic database creation on first run
✅ **Perfect for development** - Easy to test and reset
✅ **Built-in to Python** - No additional packages needed

### Limitations of SQLite

⚠️ **Single writer** - Not ideal for high-concurrency production environments
⚠️ **File-based** - Cannot be accessed remotely over network
⚠️ **Limited features** - No advanced features like stored procedures

For production deployments with multiple users, consider **MySQL/MariaDB** or **PostgreSQL**.

---

## Quick Start (SQLite)

The system is already running with SQLite! No additional setup needed.

```bash
cd dmt_backend

# Install dependencies
pip install -r requirements.txt

# Start the server (database auto-created)
uvicorn main:app --reload

# Database file created: dmt_backend/dmt.db
```

---

## Switching to MySQL/MariaDB

### Step 1: Install and Start MySQL/MariaDB

**Option A: Using Docker (Recommended)**

```bash
docker run -d --name dmt_mariadb \
  -e MYSQL_ROOT_PASSWORD=admin123 \
  -e MYSQL_DATABASE=dmt_db \
  -e MYSQL_USER=dmt_user \
  -e MYSQL_PASSWORD=dmt_user_password \
  -p 3306:3306 \
  mariadb:latest
```

**Option B: Local Installation**

```bash
# Ubuntu/Debian
sudo apt install mariadb-server
sudo systemctl start mariadb

# macOS
brew install mariadb
brew services start mariadb

# Initialize database
mysql -u root -p < dmt_backend/db_scripts/init_mysql.sql
```

### Step 2: Install Python Driver

```bash
cd dmt_backend
pip install pymysql
```

### Step 3: Update Configuration

Edit `dmt_backend/.env`:

```bash
# Comment out SQLite
# DATABASE_URL="sqlite:///./dmt.db"

# Uncomment MySQL
DATABASE_URL="mysql+pymysql://dmt_user:dmt_user_password@localhost:3306/dmt_db"
```

### Step 4: Restart Application

```bash
# Stop current server (Ctrl+C)
# Restart
uvicorn main:app --reload
```

The application will automatically create all tables in the MySQL database on startup.

---

## Switching to PostgreSQL

### Step 1: Install and Start PostgreSQL

**Option A: Using Docker (Recommended)**

```bash
docker run -d --name dmt_postgres \
  -e POSTGRES_DB=dmt_db \
  -e POSTGRES_USER=dmt_user \
  -e POSTGRES_PASSWORD=dmt_user_password \
  -p 5432:5432 \
  postgres:latest
```

**Option B: Local Installation**

```bash
# Ubuntu/Debian
sudo apt install postgresql
sudo systemctl start postgresql

# macOS
brew install postgresql
brew services start postgresql

# Initialize database
psql -U postgres -f dmt_backend/db_scripts/init_postgresql.sql
```

### Step 2: Install Python Driver

```bash
cd dmt_backend
pip install psycopg2-binary
```

### Step 3: Update Configuration

Edit `dmt_backend/.env`:

```bash
# Comment out SQLite
# DATABASE_URL="sqlite:///./dmt.db"

# Uncomment PostgreSQL
DATABASE_URL="postgresql://dmt_user:dmt_user_password@localhost:5432/dmt_db"
```

### Step 4: Restart Application

```bash
# Stop current server (Ctrl+C)
# Restart
uvicorn main:app --reload
```

---

## Configuration File Reference

### Location

`dmt_backend/.env`

### Example Configuration

```bash
# Database Configuration
# Uncomment the database you want to use:

# SQLite (default, no server required)
DATABASE_URL="sqlite:///./dmt.db"

# MariaDB/MySQL (requires MariaDB server running)
# DATABASE_URL="mariadb+mariadbconnector://root:admin123@127.0.0.1:3306/dmt_db"

# MySQL with PyMySQL (alternative driver)
# DATABASE_URL="mysql+pymysql://dmt_user:dmt_user_password@localhost:3306/dmt_db"

# PostgreSQL
# DATABASE_URL="postgresql://dmt_user:dmt_user_password@localhost:5432/dmt_db"
```

### Connection String Format

```
<dialect>+<driver>://<username>:<password>@<host>:<port>/<database>
```

**Examples:**

- SQLite: `sqlite:///./dmt.db`
- MySQL: `mysql+pymysql://user:pass@localhost:3306/dbname`
- PostgreSQL: `postgresql://user:pass@localhost:5432/dbname`
- MariaDB: `mariadb+mariadbconnector://user:pass@localhost:3306/dbname`

---

## Database Initialization Scripts

All initialization scripts are located in `dmt_backend/db_scripts/`:

| Database | Script | Usage |
|----------|--------|-------|
| MySQL/MariaDB | `init_mysql.sql` | `mysql -u root -p < db_scripts/init_mysql.sql` |
| PostgreSQL | `init_postgresql.sql` | `psql -U postgres -f db_scripts/init_postgresql.sql` |
| SQLite | N/A | Automatic on startup |

See `dmt_backend/db_scripts/README.md` for detailed instructions.

---

## How It Works

### 1. Database Detection

The system automatically detects the database type from the connection string:

```python
# From database.py
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dmt.db")
db_type = DATABASE_URL.split(':')[0].split('+')[0]  # Extract: 'sqlite', 'mysql', 'postgresql'
```

### 2. Engine Configuration

Different database engines require different settings:

```python
if db_type == 'sqlite':
    # SQLite-specific: Allow threading
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    # MySQL/PostgreSQL: Connection pooling
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=3600
    )
```

### 3. Automatic Table Creation

SQLModel/SQLAlchemy creates all tables automatically on first run:

```python
def init_db():
    """Initialize database - creates all tables"""
    SQLModel.metadata.create_all(engine)
```

No manual SQL schema creation required!

---

## Migrating Data Between Databases

If you need to move data from one database to another:

### Option 1: Export/Import via Application

Use the built-in API endpoints to export data as JSON, then re-import into the new database.

### Option 2: Database Dump Tools

```bash
# SQLite to SQL file
sqlite3 dmt.db .dump > dmt_dump.sql

# Import to MySQL
mysql -u dmt_user -p dmt_db < dmt_dump.sql

# PostgreSQL dump
pg_dump dmt_db > dmt_dump.sql
```

### Option 3: Use Migration Script

A migration script can be created if needed for bulk data transfer between different database systems.

---

## Troubleshooting

### Error: "Unknown database 'dmt_db'"

**Solution:** Run the initialization script for your database:

```bash
# MySQL
mysql -u root -p < dmt_backend/db_scripts/init_mysql.sql

# PostgreSQL
psql -U postgres -f dmt_backend/db_scripts/init_postgresql.sql
```

### Error: "No module named 'pymysql'" or similar

**Solution:** Install the required database driver:

```bash
# For MySQL
pip install pymysql

# For PostgreSQL
pip install psycopg2-binary

# For MariaDB connector
pip install mariadb
```

### Error: "Can't connect to database server"

**Solutions:**
1. Verify the database server is running
2. Check connection credentials in `.env`
3. Verify firewall/network settings
4. Test connection manually:

```bash
# MySQL
mysql -u dmt_user -p -h localhost

# PostgreSQL
psql -U dmt_user -h localhost dmt_db
```

### Tables Not Created

**Solution:** The application creates tables automatically on startup. Check:

1. Application logs for SQLAlchemy errors
2. Database user has CREATE TABLE privileges
3. Connection string is correct in `.env`

---

## Production Recommendations

### For Small Teams (< 10 users)

✅ **MySQL/MariaDB** - Reliable, easy to administer, good performance

```bash
DATABASE_URL="mysql+pymysql://dmt_user:password@localhost:3306/dmt_db"
```

### For Large Organizations

✅ **PostgreSQL** - Advanced features, excellent concurrency, robust

```bash
DATABASE_URL="postgresql://dmt_user:password@localhost:5432/dmt_db"
```

### For Development/Testing

✅ **SQLite** - Zero setup, fast iterations, easy to reset

```bash
DATABASE_URL="sqlite:///./dmt.db"
```

---

## Security Best Practices

1. **Change default passwords** in initialization scripts
2. **Use environment variables** for production credentials
3. **Enable SSL/TLS** for remote database connections
4. **Restrict database user privileges** to only what's needed
5. **Regular backups** - Automate database backups
6. **Keep credentials out of git** - `.env` is in `.gitignore`

---

## Architecture Benefits

✅ **Flexibility** - Switch databases without code changes
✅ **Development to Production** - Use SQLite for dev, MySQL/PostgreSQL for prod
✅ **Easy Testing** - Reset SQLite database by deleting the file
✅ **Cloud Ready** - Connect to managed databases (AWS RDS, Azure Database, etc.)
✅ **Vendor Independence** - Not locked into one database vendor

---

## Summary

The DMT system is now **database agnostic** and defaults to **SQLite** for simplicity. To switch databases:

1. Choose your database (MySQL, PostgreSQL, Oracle, etc.)
2. Run the initialization script (see `db_scripts/`)
3. Update `.env` file with new `DATABASE_URL`
4. Install the Python driver for that database
5. Restart the application

**That's it!** The application handles everything else automatically.

---

## Support Files

- **Database configuration**: `dmt_backend/database.py`
- **Environment config**: `dmt_backend/.env`
- **Initialization scripts**: `dmt_backend/db_scripts/`
- **Dependencies**: `dmt_backend/requirements.txt`
- **Script documentation**: `dmt_backend/db_scripts/README.md`

For questions or issues, refer to the troubleshooting section above or check the application logs.
