-- PostgreSQL Database Initialization Script
-- This script creates the database and user for the DMT system
-- Usage: psql -U postgres -f init_postgresql.sql

-- Create user (change password as needed)
CREATE USER dmt_user WITH PASSWORD 'dmt_user_password';

-- Create database
CREATE DATABASE dmt_db
    WITH OWNER = dmt_user
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE dmt_db TO dmt_user;

-- Connect to the new database
\c dmt_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO dmt_user;

-- Instructions
\echo 'Database dmt_db created successfully!'
\echo 'User dmt_user created with full privileges'
\echo 'Next step: Update .env file with:'
\echo 'DATABASE_URL="postgresql://dmt_user:dmt_user_password@localhost:5432/dmt_db"'
