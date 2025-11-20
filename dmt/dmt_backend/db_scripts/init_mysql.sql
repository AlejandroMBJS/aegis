-- MySQL/MariaDB Database Initialization Script
-- This script creates the database and user for the DMT system
-- Usage: mysql -u root -p < init_mysql.sql

-- Create database
CREATE DATABASE IF NOT EXISTS dmt_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Create user (change password as needed)
CREATE USER IF NOT EXISTS 'dmt_user'@'localhost' IDENTIFIED BY 'dmt_user_password';
CREATE USER IF NOT EXISTS 'dmt_user'@'%' IDENTIFIED BY 'dmt_user_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON dmt_db.* TO 'dmt_user'@'localhost';
GRANT ALL PRIVILEGES ON dmt_db.* TO 'dmt_user'@'%';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Show created database
SHOW DATABASES LIKE 'dmt_db';

-- Instructions
SELECT 'Database dmt_db created successfully!' AS Status;
SELECT 'User dmt_user created with full privileges' AS Status;
SELECT 'Next step: Update .env file with:' AS 'Next Steps';
SELECT 'DATABASE_URL="mysql+pymysql://dmt_user:dmt_user_password@localhost:3306/dmt_db"' AS 'Connection String';
