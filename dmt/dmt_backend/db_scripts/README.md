# Database Initialization Scripts

This directory contains SQL scripts to initialize the DMT database on different database systems.

## Available Scripts

### 1. SQLite (Default)
**No script needed!** SQLite creates the database file automatically when the application starts.

- Database file: `dmt.db` (created in the backend directory)
- No server installation required
- Perfect for development and testing

### 2. MySQL/MariaDB

**Script:** `init_mysql.sql`

**Prerequisites:**
- MySQL or MariaDB server installed and running
- Root access to the database server

**Installation Steps:**

```bash
# Run the initialization script
mysql -u root -p < db_scripts/init_mysql.sql

# Update .env file
nano .env
# Change DATABASE_URL to:
# DATABASE_URL="mysql+pymysql://dmt_user:dmt_user_password@localhost:3306/dmt_db"

# Install required Python package
pip install pymysql

# Restart the application
```

**Using Docker:**
```bash
# Start MariaDB container
docker run -d --name dmt_mariadb \
  -e MYSQL_ROOT_PASSWORD=admin123 \
  -e MYSQL_DATABASE=dmt_db \
  -e MYSQL_USER=dmt_user \
  -e MYSQL_PASSWORD=dmt_user_password \
  -p 3306:3306 \
  mariadb:latest

# Update .env file with the connection string above
```

### 3. PostgreSQL

**Script:** `init_postgresql.sql`

**Prerequisites:**
- PostgreSQL server installed and running
- Postgres superuser access

**Installation Steps:**

```bash
# Run the initialization script
psql -U postgres -f db_scripts/init_postgresql.sql

# Update .env file
nano .env
# Change DATABASE_URL to:
# DATABASE_URL="postgresql://dmt_user:dmt_user_password@localhost:5432/dmt_db"

# Install required Python package
pip install psycopg2-binary

# Restart the application
```

**Using Docker:**
```bash
# Start PostgreSQL container
docker run -d --name dmt_postgres \
  -e POSTGRES_DB=dmt_db \
  -e POSTGRES_USER=dmt_user \
  -e POSTGRES_PASSWORD=dmt_user_password \
  -p 5432:5432 \
  postgres:latest

# Update .env file with the connection string above
```

## Switching Between Databases

### Step 1: Choose Your Database
Edit the `.env` file and uncomment the DATABASE_URL for your chosen database:

```bash
# SQLite (default, no server required)
DATABASE_URL="sqlite:///./dmt.db"

# MySQL/MariaDB
# DATABASE_URL="mysql+pymysql://dmt_user:dmt_user_password@localhost:3306/dmt_db"

# PostgreSQL
# DATABASE_URL="postgresql://dmt_user:dmt_user_password@localhost:5432/dmt_db"
```

### Step 2: Install Required Drivers

```bash
# For SQLite (built-in, no installation needed)
# Nothing required!

# For MySQL/MariaDB
pip install pymysql

# For PostgreSQL
pip install psycopg2-binary
```

### Step 3: Initialize the Database
Run the appropriate SQL script from this directory (not needed for SQLite).

### Step 4: Restart the Application
```bash
# The application will automatically create all tables on startup
uvicorn main:app --reload
```

## Database Migration

If you're switching from one database to another with existing data, you'll need to export and import your data:

### From SQLite to MySQL/PostgreSQL:

```bash
# 1. Export data from SQLite (use a Python script or SQLAlchemy)
# 2. Initialize new database with script
# 3. Update .env to point to new database
# 4. Import data into new database
# 5. Restart application
```

## Security Notes

1. **Change default passwords!** The scripts use `dmt_user_password` as an example
2. For production, use environment variables for sensitive credentials
3. Restrict database user permissions appropriately
4. Use SSL/TLS connections for remote databases

## Troubleshooting

### Connection Errors
- Verify database server is running
- Check firewall settings
- Verify user credentials
- Ensure database exists

### Table Creation Errors
- The application automatically creates tables on startup
- If tables already exist, no error will occur
- Check application logs for SQLAlchemy errors

### Performance Issues
- SQLite: Great for development, may struggle with high concurrent writes
- MySQL/MariaDB: Better for production, supports concurrent access
- PostgreSQL: Excellent for complex queries and high concurrency
