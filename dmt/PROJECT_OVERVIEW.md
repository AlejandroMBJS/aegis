# DMT System - Complete Project Overview

## Project Summary

Full-stack Defect Management & Tracking (DMT) system with:
- **Backend**: FastAPI + SQLModel + MariaDB (dmt_backend/)
- **Frontend**: PHP + Vanilla JS + Tailwind CSS (dmt_frontend/)

## Architecture

```
┌─────────────────────┐
│   Frontend (PHP)    │
│   - Login Page      │
│   - Dashboard       │
│   - DMT Form (RBAC) │
│   - Catalog CRUD    │
└──────────┬──────────┘
           │ HTTP + JWT
           ▼
┌─────────────────────┐
│  Backend (FastAPI)  │
│   - Auth (JWT)      │
│   - DMT CRUD        │
│   - Entities CRUD   │
│   - Field-level     │
│     RBAC Control    │
└──────────┬──────────┘
           │ SQLModel ORM
           ▼
┌─────────────────────┐
│  Database (MariaDB) │
│   - Users           │
│   - 10 Catalogs     │
│   - DMT Records     │
└─────────────────────┘
```

## Quick Start

### 1. Start Backend (Terminal 1)

```bash
cd dmt_backend
docker-compose up --build
```

Wait for API to start at `http://localhost:8000`

### 2. Initialize Database

```bash
# In another terminal
docker-compose exec api python init_data.py
```

This creates:
- 5 demo users (one per role)
- Sample data in all catalogs

### 3. Start Frontend (Terminal 2)

```bash
cd dmt_frontend
php -S localhost:3000
```

### 4. Access Application

Open browser: `http://localhost:3000`

**Demo Login Credentials:**

| Role | Employee # | Password | Can Do |
|------|-----------|----------|---------|
| Admin | ADM001 | admin123 | Everything |
| Inspector | INS001 | inspector123 | Create DMT, Edit Section 1 |
| Operator | OPE001 | operator123 | Edit Section 2 |
| Tech Engineer | ENG001 | engineer123 | Edit Sections 1, 2, 3 |
| Quality Engineer | QUA001 | quality123 | Close DMT, Edit Section 4 |

## Key Features

### Backend (FastAPI)

✓ JWT authentication with bcrypt password hashing
✓ Field-level RBAC enforcement
✓ SQLModel ORM with MariaDB
✓ Automatic schema creation
✓ Role-based endpoint access control
✓ Strict validation (closed records cannot be edited)

**API Documentation:** `http://localhost:8000/docs`

### Frontend (PHP + JS)

✓ Responsive design (Tailwind CSS)
✓ JWT token management (localStorage)
✓ Dynamic form with field-level permissions
✓ Interactive dashboard with filters
✓ Real-time client-side validation
✓ Admin-only catalog management

## DMT Record Workflow

### 1. Inspector Creates Record

**Login**: INS001 / inspector123

1. Click "Create DMT Record"
2. Fill Section 1 (all required):
   - Part Number
   - Work Center
   - Customer
   - Level
   - Area
   - Defect Description
3. Click "Create Record"
4. Record appears in dashboard as **Open**

### 2. Operator Adds Process Info

**Login**: OPE001 / operator123

1. Open record from dashboard
2. Edit Section 2:
   - Process Analysis (required)
   - Repair Process (optional)
   - Rework Hours (optional)
3. Click "Update Record"

### 3. Tech Engineer Adds Technical Data

**Login**: ENG001 / engineer123

1. Open record from dashboard
2. Can edit Sections 1, 2, and 3
3. Fill Section 3:
   - Engineering Findings (required)
   - Material Scrap Cost (optional)
   - Other Cost (optional)
4. Click "Update Record"

### 4. Quality Engineer Closes Record

**Login**: QUA001 / quality123

1. Open record from dashboard
2. Fill Section 4 (all required):
   - Final Disposition
   - Failure Code
   - Approved By
3. Toggle "Mark as Closed"
4. Click "Update Record"
5. Record is now **Closed** and read-only

## RBAC Rules

### Universal Rule

**If `is_closed = true`**: NO ONE can edit (all fields disabled)

### Edit Permissions (When Open)

| Field | Inspector | Operator | Tech Engineer | Quality Engineer | Admin |
|-------|-----------|----------|---------------|------------------|-------|
| Part Number | ✓ | ✗ | ✓ | ✗ | ✓ |
| Work Center | ✓ | ✗ | ✓ | ✗ | ✓ |
| Customer | ✓ | ✗ | ✓ | ✗ | ✓ |
| Level | ✓ | ✗ | ✓ | ✗ | ✓ |
| Area | ✓ | ✗ | ✓ | ✗ | ✓ |
| Defect Description | ✓ | ✗ | ✓ | ✗ | ✓ |
| Process Analysis | ✗ | ✓ | ✓ | ✗ | ✓ |
| Repair Process | ✗ | ✓ | ✓ | ✗ | ✓ |
| Rework Hours | ✗ | ✓ | ✓ | ✗ | ✓ |
| Engineering Findings | ✗ | ✗ | ✓ | ✗ | ✓ |
| Material Scrap Cost | ✗ | ✗ | ✓ | ✗ | ✓ |
| Other Cost | ✗ | ✗ | ✓ | ✗ | ✓ |
| Final Disposition | ✗ | ✗ | ✓ | ✓ | ✓ |
| Failure Code | ✗ | ✗ | ✓ | ✓ | ✓ |
| Approved By | ✗ | ✗ | ✓ | ✓ | ✓ |
| Is Closed | ✗ | ✗ | ✓ | ✓ | ✓ |

## File Structure

```
dmt/
├── dmt_backend/
│   ├── main.py                    # FastAPI app entry
│   ├── database.py                # DB connection
│   ├── auth.py                    # JWT & password hashing
│   ├── deps.py                    # Auth dependencies
│   ├── models.py                  # SQLModel ORM models
│   ├── schemas.py                 # Pydantic schemas
│   ├── init_data.py               # Database seeding script
│   ├── docker-compose.yml         # MariaDB + API services
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── crud/
│   │   ├── crud_user.py           # User CRUD
│   │   ├── crud_entity.py         # Entity CRUD (generic)
│   │   └── crud_dmt.py            # DMT CRUD (with RBAC)
│   └── routers/
│       ├── router_auth.py         # POST /auth/token
│       ├── router_entities.py     # /entities/{name} CRUD
│       └── router_dmt.py          # /dmt/ CRUD with RBAC
│
└── dmt_frontend/
    ├── index.php                  # Login page
    ├── dashboard.php              # DMT feed with filters
    ├── dmt_form.php               # Create/Edit form (4 sections)
    ├── entities_crud.php          # Admin catalog management
    ├── logout.php                 # Logout handler
    ├── config.php                 # Configuration
    ├── includes/
    │   ├── header.php             # Navigation header
    │   └── footer.php             # Footer with utilities
    └── js/
        ├── auth.js                # JWT management
        ├── dmt_feed.js            # Dashboard logic
        ├── dmt_form_logic.js      # RBAC form logic ⚠️ CRITICAL
        └── entities_crud_logic.js # Catalog CRUD logic
```

## Critical Files

### Backend: `crud/crud_dmt.py`

Contains `update_dmt_partial_with_field_control()` which enforces RBAC:

```python
ALLOWED_FIELDS_BY_ROLE = {
    'Inspector': ['part_number_id', 'work_center_id', ...],
    'Operator': ['process_analysis', 'repair_process', 'rework_hours'],
    # ... etc
}
```

Validates:
1. Record not closed
2. User only edits allowed fields
3. Quality Engineer provides all closure fields

### Frontend: `js/dmt_form_logic.js`

Contains `applyRolePermissions()` which disables fields:

```javascript
const ROLE_PERMISSIONS = {
    'Inspector': ['part_number_id', ...],
    'Operator': ['process_analysis', ...],
    // ... etc
}
```

Applies:
1. Universal closed record rule (disable all)
2. Role-based field enablement
3. Visual lock icons on disabled fields

## Database Schema

### Key Tables

**users**
- id, employee_number, full_name, role, hashed_password

**dmtrecord** (Main transactional table)
- id, is_closed, created_at, created_by_id
- Section 1: part_number_id, work_center_id, customer_id, level_id, area_id, defect_description
- Section 2: process_analysis, repair_process, rework_hours
- Section 3: engineering_findings, material_scrap_cost, other_cost
- Section 4: final_disposition_id, failure_code_id, approved_by_id

**Catalogs (10 entities)**
- partnumber, workcenter, customer, level, area
- calibration, inspectionitem, preparedby, disposition, failurecode

Each with: id, item_number, item_name

## API Endpoints

### Authentication
- `POST /auth/token` - Login (returns JWT)

### DMT Records
- `POST /dmt/` - Create (Inspector only)
- `GET /dmt/` - List with filters
- `GET /dmt/{id}` - Get one
- `PATCH /dmt/{id}` - Update with RBAC

### Entities (Catalogs)
- `POST /entities/{name}` - Create (Admin only)
- `GET /entities/{name}` - List
- `GET /entities/{name}/{id}` - Get one
- `PATCH /entities/{name}/{id}` - Update (Admin only)
- `DELETE /entities/{name}/{id}` - Delete (Admin only)

## Testing Scenarios

### Scenario 1: Inspector Creates and Edits

1. Login: INS001 / inspector123
2. Create new DMT record (fill Section 1)
3. ✓ Can edit Section 1 fields
4. ✗ Cannot edit Sections 2, 3, 4 (disabled)

### Scenario 2: Operator Cannot Create

1. Login: OPE001 / operator123
2. ✗ No "Create DMT Record" button visible
3. Open existing record
4. ✓ Can edit Section 2 fields
5. ✗ Cannot edit Sections 1, 3, 4 (disabled)

### Scenario 3: Quality Engineer Closes Record

1. Login: QUA001 / quality123
2. Open existing record
3. Fill Section 4: Disposition, Failure Code, Approved By
4. Toggle "Mark as Closed"
5. Click "Update Record"
6. ✓ Record closes successfully
7. Try to edit → ✗ All fields disabled

### Scenario 4: Admin Has Full Access

1. Login: ADM001 / admin123
2. ✓ Can create DMT records
3. ✓ Can edit all sections
4. ✓ Can close records
5. ✓ Can access "Manage Catalogs"
6. ✓ Can CRUD all catalog entries

### Scenario 5: Closed Record is Read-Only

1. Open a closed record
2. ✗ All fields disabled (gray background)
3. ✗ Submit button disabled
4. Warning message: "This record is closed and cannot be edited"

## Configuration

### Backend Configuration

**docker-compose.yml:**
```yaml
DATABASE_URL: "mariadb+mariadbconnector://dmt_user:dmt_user_password@db:3306/dmt_db"
SECRET_KEY: "your-secret-key-change-in-production"
ACCESS_TOKEN_EXPIRE_MINUTES: "30"
```

### Frontend Configuration

**config.php:**
```php
define('API_BASE_URL', 'http://localhost:8000');
```

**All JS files:**
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

## Production Deployment

### Backend

1. Change SECRET_KEY to secure random value
2. Change MariaDB passwords
3. Set `echo=False` in database.py
4. Configure CORS properly
5. Use production WSGI server (Gunicorn/Uvicorn)
6. Enable HTTPS
7. Set up backups for MariaDB volume

### Frontend

1. Use Apache/Nginx instead of PHP built-in server
2. Enable HTTPS
3. Set secure session cookies
4. Implement rate limiting
5. Add logging and monitoring
6. Minify JavaScript files
7. Use production API URL

## Troubleshooting

### Backend Not Starting

```bash
# Check if MariaDB is ready
docker-compose logs db

# Restart services
docker-compose restart

# Recreate from scratch
docker-compose down -v
docker-compose up --build
```

### Frontend Cannot Connect

1. Check API_BASE_URL in config.php and JS files
2. Verify backend is running: `curl http://localhost:8000/health`
3. Check browser console for errors
4. Verify CORS is configured on backend

### Login Fails

1. Ensure `init_data.py` was run
2. Check credentials match demo users
3. Verify backend /auth/token endpoint works
4. Check browser localStorage for token

### Fields Not Disabling Properly

1. Check browser console for JavaScript errors
2. Verify USER_ROLE is passed from PHP to JS
3. Check ROLE_PERMISSIONS map in dmt_form_logic.js
4. Ensure user has correct role in database

## Security Notes

### Implemented Security Features

✓ JWT-based authentication
✓ Password hashing with bcrypt
✓ Role-based access control (RBAC)
✓ Field-level permissions
✓ Server-side validation
✓ Client-side validation
✓ CSRF protection (session-based)
✓ SQL injection prevention (ORM)
✓ XSS prevention (HTML escaping)

### Security Checklist for Production

- [ ] Use HTTPS everywhere
- [ ] Rotate SECRET_KEY regularly
- [ ] Implement rate limiting on auth endpoints
- [ ] Add request logging
- [ ] Set up intrusion detection
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Implement backup strategy
- [ ] Add monitoring and alerting
- [ ] Review and restrict CORS origins

## Documentation

- **Backend API**: `http://localhost:8000/docs` (Swagger UI)
- **Backend README**: `dmt_backend/README.md`
- **Frontend README**: `dmt_frontend/README.md`

## License

Internal use only.

## Support

For issues, questions, or feature requests, contact the development team.

---

**Version**: 1.0.0
**Last Updated**: 2025
