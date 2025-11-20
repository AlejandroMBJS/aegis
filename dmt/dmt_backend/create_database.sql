-- Create database and user for DMT system
CREATE DATABASE IF NOT EXISTS dmt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (if it doesn't exist)
CREATE USER IF NOT EXISTS 'dmt_user'@'localhost' IDENTIFIED BY 'dmt_user_password';

-- Grant all privileges on dmt_db to dmt_user
GRANT ALL PRIVILEGES ON dmt_db.* TO 'dmt_user'@'localhost';

FLUSH PRIVILEGES;

-- Show databases to confirm
SHOW DATABASES;
