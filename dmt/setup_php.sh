#!/bin/bash

#################################################
# DMT Application - PHP Setup Script
# Runs the application with PHP built-in server
# on port 8088
#################################################

set -e  # Exit on error

echo "================================================="
echo "  DMT Application - PHP Setup"
echo "================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${GREEN}Working directory: $SCRIPT_DIR${NC}\n"

#################################################
# 1. Check Requirements
#################################################

echo "Step 1: Checking requirements..."

# Check PHP
if ! command -v php &> /dev/null; then
    echo -e "${RED}✗ PHP is not installed${NC}"
    echo "  Please install PHP 7.4 or higher"
    exit 1
fi

PHP_VERSION=$(php -r 'echo PHP_VERSION;')
echo -e "${GREEN}✓ PHP $PHP_VERSION installed${NC}"

# Check Composer
if ! command -v composer &> /dev/null; then
    echo -e "${YELLOW}⚠ Composer not found. Installing composer...${NC}"
    curl -sS https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer
    echo -e "${GREEN}✓ Composer installed${NC}"
else
    echo -e "${GREEN}✓ Composer installed${NC}"
fi

# Check SQLite extension
if ! php -m | grep -q sqlite3; then
    echo -e "${RED}✗ SQLite3 PHP extension is not installed${NC}"
    echo "  Install with: sudo apt-get install php-sqlite3  (Ubuntu/Debian)"
    echo "            or: sudo yum install php-sqlite3      (CentOS/RHEL)"
    exit 1
fi

echo -e "${GREEN}✓ SQLite3 extension installed${NC}"
echo ""

#################################################
# 2. Install PHP API Dependencies
#################################################

echo "Step 2: Installing PHP API dependencies..."

cd dmt_frontend/api

if [ ! -f "composer.json" ]; then
    echo -e "${RED}✗ composer.json not found${NC}"
    exit 1
fi

composer install --no-dev --optimize-autoloader

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

#################################################
# 3. Setup Environment
#################################################

echo "Step 3: Setting up environment..."

# Copy .env file if not exists
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env file from .env.example${NC}"

        # Generate random secret key
        SECRET_KEY=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
        sed -i "s/your-very-secure-random-secret-key-change-this-in-production/$SECRET_KEY/g" .env
        echo -e "${GREEN}✓ Generated random secret key${NC}"
    else
        echo -e "${YELLOW}⚠ .env.example not found, skipping environment setup${NC}"
    fi
else
    echo -e "${YELLOW}⚠ .env file already exists, skipping${NC}"
fi

echo ""

#################################################
# 4. Setup Database
#################################################

echo "Step 4: Setting up database..."

cd "$SCRIPT_DIR/dmt_frontend"

# Check if database already exists
if [ -f "dmt.db" ]; then
    echo -e "${YELLOW}⚠ Database file already exists${NC}"
    read -p "Do you want to recreate the database? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm dmt.db
        echo -e "${GREEN}✓ Removed existing database${NC}"
    else
        echo -e "${YELLOW}⚠ Keeping existing database${NC}"
    fi
fi

# Initialize database if it doesn't exist
if [ ! -f "dmt.db" ]; then
    echo "Initializing database..."
    php api/utils/init_db.php
    echo -e "${GREEN}✓ Database initialized${NC}"
else
    echo -e "${GREEN}✓ Using existing database${NC}"
fi

echo ""

#################################################
# 5. Setup Permissions
#################################################

echo "Step 5: Setting up permissions..."

cd "$SCRIPT_DIR/dmt_frontend"

# Create logs directory if not exists
mkdir -p logs
mkdir -p api/logs
mkdir -p api/logs/rate_limit

# Set permissions
chmod -R 755 .
chmod -R 777 logs
chmod -R 777 api/logs
chmod 666 dmt.db 2>/dev/null || true

echo -e "${GREEN}✓ Permissions configured${NC}"
echo ""

#################################################
# 6. Configuration Summary
#################################################

echo "================================================="
echo "  Configuration Summary"
echo "================================================="
echo ""
echo "Database:       dmt_frontend/dmt.db"
echo "API Directory:  dmt_frontend/api/"
echo "Logs Directory: dmt_frontend/logs/"
echo "Port:           8088"
echo ""

#################################################
# 7. Start Server
#################################################

echo "================================================="
echo "  Starting Server"
echo "================================================="
echo ""

cd "$SCRIPT_DIR/dmt_frontend"

echo -e "${GREEN}Starting PHP development server on port 8088...${NC}"
echo ""
echo -e "${YELLOW}Access the application at:${NC}"
echo -e "  ${GREEN}http://localhost:8088${NC}"
echo ""
echo -e "${YELLOW}API endpoint:${NC}"
echo -e "  ${GREEN}http://localhost:8088/api${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""
echo "================================================="
echo ""

# Start PHP built-in server
php -S 0.0.0.0:8088 -t . 2>&1 | tee ../server.log
