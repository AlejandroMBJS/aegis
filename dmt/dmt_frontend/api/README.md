# DMT Backend API (PHP)

Secure PHP REST API for DMT (Defect Material Tracking) application.

## Features

- ✅ RESTful API design
- ✅ JWT authentication
- ✅ SQLite database
- ✅ OWASP Top 10 security measures
- ✅ Role-based access control (RBAC)
- ✅ Input validation
- ✅ SQL injection protection (PDO prepared statements)
- ✅ XSS protection
- ✅ CORS handling
- ✅ Multilingual support

## Requirements

- PHP 7.4 or higher
- SQLite3 extension
- Composer
- Apache with mod_rewrite OR Nginx

## Installation

### 1. Install Dependencies

```bash
cd /path/to/dmt_frontend/api
composer install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
nano .env
```

### 3. Initialize Database

```bash
php utils/init_db.php
```

### 4. Web Server Configuration

#### Apache

The `.htaccess` file is already configured. Ensure `mod_rewrite` is enabled:

```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

#### Nginx

Add this to your nginx configuration:

```nginx
location /api {
    try_files $uri $uri/ /api/index.php?$query_string;
}
```

## API Endpoints

### Authentication

- `POST /api/auth/token` - Login (OAuth2 format)

### Users

- `GET /api/users/` - List all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/{id}` - Update user (Admin only)
- `DELETE /api/users/{id}` - Delete user (Admin only)

### Entities (Catalogs)

- `GET /api/entities/{entity_name}` - List all items
- `GET /api/entities/{entity_name}/{id}` - Get item by ID
- `POST /api/entities/{entity_name}` - Create item (Admin only)
- `PUT /api/entities/{entity_name}/{id}` - Update item (Admin only)
- `DELETE /api/entities/{entity_name}/{id}` - Delete item (Admin only)

Valid entity names: `partnumber`, `workcenter`, `customer`, `level`, `area`, `calibration`, `inspectionitem`, `preparedby`, `processcode`, `disposition`, `failurecode`

### DMT Records

- `GET /api/dmt/` - List all records (with filters)
- `GET /api/dmt/{id}` - Get record by ID
- `POST /api/dmt/` - Create record (Inspector only)
- `PATCH /api/dmt/{id}` - Update record (role-based)
- `DELETE /api/dmt/{id}` - Delete record (Admin only)
- `GET /api/dmt/export/csv` - Export to CSV

## Security Features (OWASP Top 10)

### A01:2021 - Broken Access Control
- ✅ JWT authentication on all protected endpoints
- ✅ Role-based access control (RBAC)
- ✅ User cannot delete themselves

### A02:2021 - Cryptographic Failures
- ✅ Passwords hashed with bcrypt/pbkdf2
- ✅ JWT tokens with expiration
- ✅ Sensitive data not logged

### A03:2021 - Injection
- ✅ PDO prepared statements (SQL injection protection)
- ✅ Input validation
- ✅ Parameterized queries only

### A04:2021 - Insecure Design
- ✅ Proper error handling
- ✅ Security headers
- ✅ Rate limiting (to be implemented)

### A05:2021 - Security Misconfiguration
- ✅ Error display disabled in production
- ✅ Security headers configured
- ✅ Directory browsing disabled

### A06:2021 - Vulnerable Components
- ✅ Minimal dependencies
- ✅ Composer for dependency management
- ✅ Regular updates recommended

### A07:2021 - Authentication Failures
- ✅ JWT with expiration
- ✅ Secure password hashing
- ✅ Token validation on every request

### A08:2021 - Data Integrity Failures
- ✅ Input validation
- ✅ Foreign key constraints
- ✅ Database transactions

### A09:2021 - Logging Failures
- ✅ Error logging enabled
- ✅ Sensitive data not logged
- ✅ Log rotation recommended

### A10:2021 - Server-Side Request Forgery
- ✅ No external requests from user input
- ✅ Input validation

## Architecture

```
api/
├── index.php              # Main router
├── config/
│   ├── database.php       # Database singleton
│   ├── auth.php          # JWT authentication
│   └── schema.sql        # Database schema
├── controllers/
│   ├── AuthController.php
│   ├── UserController.php
│   ├── EntityController.php
│   └── DMTController.php
├── middleware/
│   ├── CORS.php          # CORS handling
│   └── AuthMiddleware.php # Authentication
├── utils/
│   ├── Response.php      # JSON response helper
│   └── init_db.php       # Database initialization
└── logs/
    └── api_errors.log    # Error log

```

## Testing

Test endpoints with curl:

```bash
# Login
curl -X POST http://localhost/api/auth/token \
  -d "username=admin&password=admin123"

# Get users (with JWT token)
curl -X GET http://localhost/api/users/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Migration from Python Backend

This PHP API is 100% compatible with the Python FastAPI backend. Simply update your nginx configuration to point to this API instead.

## License

Proprietary - DMT Application
