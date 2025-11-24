# DMT Frontend

Frontend application for the Defect Management & Tracking (DMT) system built with PHP, Vanilla JavaScript, and Tailwind CSS.

## Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control (RBAC)**: Strict field-level permissions
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Dynamic Forms**: Smart forms with role-based field control
- **Real-time Validation**: Client-side validation before API calls
- **Interactive Dashboard**: Filtering, sorting, and search capabilities
- **Catalog Management**: Admin-only CRUD for reference data

## Technology Stack

- **PHP**: Server-side session management and routing
- **Vanilla JavaScript**: Client-side logic and API communication
- **Tailwind CSS**: Utility-first CSS framework
- **Font Awesome**: Icon library

## Project Structure

```
dmt_frontend/
├── index.php               # Login page
├── dashboard.php           # DMT Records feed with filters
├── dmt_form.php           # Create/Edit DMT Record form (4 sections)
├── entities_crud.php      # Catalog management (Admin only)
├── logout.php             # Logout handler
├── config.php             # Configuration and helper functions
├── js/
│   ├── auth.js            # Authentication and API wrapper functions
│   ├── dmt_feed.js        # Dashboard logic and filtering
│   ├── dmt_form_logic.js  # RBAC form logic (critical)
│   └── entities_crud_logic.js  # Catalog CRUD operations
└── includes/
    ├── header.php         # Header with navigation
    └── footer.php         # Footer with utilities
```

## Prerequisites

- **PHP 7.4+**: With session support
- **Web Server**: Apache, Nginx, or PHP built-in server
- **DMT Backend API**: Must be running on http://localhost:8000 (configurable)

## Installation

### 1. Clone or Copy Files

```bash
cd /path/to/web/root
# Copy all dmt_frontend files here
```

### 2. Configure API URL

Edit `config.php` and `js/auth.js` to set your backend API URL:

**config.php:**
```php
define('API_BASE_URL', 'http://localhost:8000');
```

**js/auth.js, js/dmt_feed.js, js/dmt_form_logic.js, js/entities_crud_logic.js:**
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

### 3. Start Web Server

#### Option A: PHP Built-in Server (Development)

```bash
cd dmt_frontend
php -S localhost:3000
```

Access at: `http://localhost:3000`

#### Option B: Apache/Nginx

Configure virtual host to point to `dmt_frontend` directory.

### 4. Ensure Backend is Running

The backend API must be accessible at the configured URL.

```bash
# In dmt_backend directory
docker-compose up
```

## User Roles and Permissions

### Role Overview

| Role | DMT Create | DMT Edit | DMT Close | Catalog CRUD | Access Level |
|------|-----------|----------|-----------|--------------|--------------|
| **Admin** | ✓ | All fields | ✓ | ✓ | Full access |
| **Inspector** | ✓ | Section 1 only | ✗ | ✗ | Create and edit own section |
| **Operator** | ✗ | Section 2 only | ✗ | ✗ | Edit assigned section |
| **Tech Engineer** | ✗ | Sections 1, 2, 3 | ✗ | ✗ | Edit technical fields |
| **Quality Engineer** | ✗ | Section 4 only | ✓ | ✗ | Review and close tickets |

### DMT Form: Section Responsibilities

#### Section 1: Inspector (General Info & Defect)
**Fields:** Part Number, Work Center, Customer, Level, Area, Defect Description
**Required:** All fields (6/6)
**Editable by:** Inspector, Tech Engineer, Admin

#### Section 2: Operator (Process Analysis & Repair/Rework)
**Fields:**
- Process Analysis (Required)
- Repair Process (Optional)
- Rework Hours (Optional)

**Editable by:** Operator, Tech Engineer, Admin

#### Section 3: Technical Engineer (Engineering Findings & Costs)
**Fields:**
- Engineering Findings (Required)
- Material Scrap Cost (Optional)
- Other Cost (Optional)

**Editable by:** Tech Engineer, Admin

#### Section 4: Quality Engineer (Disposition & Closure)
**Fields:** Final Disposition, Failure Code, Approved By, Is Closed Toggle
**Required for closure:** All fields (4/4)
**Editable by:** Quality Engineer, Admin

## Key Business Rules

### Creating DMT Records

1. **Only Inspector** can create new DMT records
2. All **Section 1 fields are required** at creation
3. Record starts in **Open** status (`is_closed = false`)

### Editing DMT Records

1. **If `is_closed = true`**: No one can edit (all fields disabled)
2. **If `is_closed = false`**: Role-based field access applies
3. Users can only edit fields permitted for their role
4. Attempting to edit forbidden fields results in error 400

### Closing DMT Records

1. **Only Quality Engineer** can close records
2. Before closing, **all Section 4 fields must be filled**:
   - Final Disposition
   - Failure Code
   - Approved By
   - Is Closed toggle = true
3. Once closed, record becomes **read-only**

## Demo Credentials

Use these credentials after running `init_data.py` in the backend:

| Role | Employee Number | Password |
|------|----------------|----------|
| Admin | ADM001 | admin123 |
| Inspector | INS001 | inspector123 |
| Operator | OPE001 | operator123 |
| Tech Engineer | ENG001 | engineer123 |
| Quality Engineer | QUA001 | quality123 |

## Usage Guide

### 1. Login

1. Go to `http://localhost:3000`
2. Enter Employee Number and Password
3. Click "Sign In"
4. JWT token is stored in localStorage

### 2. Dashboard

**Features:**
- View all DMT records in a table
- Filter by: Status, Part Number, Work Center, Customer, Date Range
- Click "View/Edit" to open a record

**Columns:**
- ID
- Status (Open/Closed badge)
- Created By
- Created At
- Part Number
- Work Center
- Customer
- Final Disposition
- Failure Code
- Actions

### 3. Create DMT Record (Inspector Only)

1. Click "Create DMT Record" in navigation
2. Fill all required fields in Section 1:
   - Part Number
   - Work Center
   - Customer
   - Level
   - Area
   - Defect Description
3. Click "Create Record"
4. Record appears in dashboard

### 4. Edit DMT Record (Role-Based)

1. Open record from dashboard
2. Fields are enabled/disabled based on your role
3. Disabled fields show a lock icon
4. Edit allowed fields
5. Click "Update Record"

#### Example: Operator Editing

- Can ONLY edit: Process Analysis, Repair Process, Rework Hours
- All other fields are disabled (grayed out)

### 5. Close DMT Record (Quality Engineer)

1. Open record as Quality Engineer
2. Fill Section 4 fields:
   - Final Disposition
   - Failure Code
   - Approved By
3. Toggle "Mark as Closed"
4. Click "Update Record"
5. Record is now closed and read-only

### 6. Manage Catalogs (Admin Only)

1. Click "Manage Catalogs" in navigation
2. Select a catalog from dropdown
3. View entries in table
4. **Create**: Click "Create New Entry", fill form, submit
5. **Edit**: Click "Edit" on a row, modify, submit
6. **Delete**: Click "Delete", confirm

**Available Catalogs:**
- Part Numbers
- Work Centers
- Customers
- Levels
- Areas
- Calibrations
- Inspection Items
- Prepared By
- Dispositions
- Failure Codes

## RBAC Implementation Details

### File: `js/dmt_form_logic.js`

This is the **critical file** implementing Role-Based Access Control at the field level.

#### Key Function: `applyRolePermissions()`

```javascript
// UNIVERSAL RULE: If record is closed, disable ALL fields
if (currentRecord && currentRecord.is_closed) {
    disableAllFields();
    return;
}

// Get allowed fields for current role
const allowedFields = ROLE_PERMISSIONS[currentUserRole] || [];

// Disable fields NOT in allowed list
allFields.forEach(fieldName => {
    const element = document.getElementById(fieldName);
    if (!allowedFields.includes(fieldName)) {
        element.disabled = true;
        element.classList.add('field-disabled');
    }
});
```

#### Field Permissions Map

```javascript
const ROLE_PERMISSIONS = {
    'Admin': [/* all fields */],
    'Tech Engineer': [/* sections 1, 2, 3, 4 */],
    'Inspector': ['part_number_id', 'work_center_id', 'customer_id', 'level_id', 'area_id', 'defect_description'],
    'Operator': ['process_analysis', 'repair_process', 'rework_hours'],
    'Quality Engineer': ['is_closed', 'final_disposition_id', 'failure_code_id', 'approved_by_id']
};
```

### Validation Before Submit

1. **Create (Inspector)**: Validates all 6 Section 1 required fields
2. **Edit**: Validates only fields user has permission to edit
3. **Close (Quality Engineer)**: Validates all 4 Section 4 required fields

## API Integration

All API calls use JWT authentication via `Authorization: Bearer <token>` header.

### Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /auth/token | Login and get JWT |
| GET | /dmt/ | List DMT records with filters |
| GET | /dmt/{id} | Get single DMT record |
| POST | /dmt/ | Create DMT record (Inspector only) |
| PATCH | /dmt/{id} | Update DMT record (role-based) |
| GET | /entities/{name} | List catalog entries |
| POST | /entities/{name} | Create catalog entry (Admin) |
| PATCH | /entities/{name}/{id} | Update catalog entry (Admin) |
| DELETE | /entities/{name}/{id} | Delete catalog entry (Admin) |

## Troubleshooting

### Cannot Login

- **Error**: "Connection error"
  - **Solution**: Ensure backend API is running on configured URL
  - Check `config.php` and JS files for correct API_BASE_URL

- **Error**: "Invalid credentials"
  - **Solution**: Verify employee number and password
  - Run `init_data.py` in backend to create demo users

### Fields Are Disabled

- **Cause**: Role-based access control is working
- **Solution**: Login with a role that has permission for those fields
- **Note**: If record is closed, ALL fields are disabled

### Cannot Create DMT Record

- **Cause**: Only Inspector role can create
- **Solution**: Login as Inspector (INS001 / inspector123)

### Cannot Close DMT Record

- **Cause**: Only Quality Engineer can close
- **Solution**: Login as Quality Engineer (QUA001 / quality123)
- **Also**: All Section 4 fields must be filled before closing

### 401 Unauthorized Errors

- **Cause**: JWT token expired or invalid
- **Solution**: Logout and login again
- **Note**: Token expiration is set in backend (default 30 minutes)

### Catalog Management Not Visible

- **Cause**: Only Admin role can access
- **Solution**: Login as Admin (ADM001 / admin123)

## Development Notes

### Adding New Entity/Catalog

1. Add to backend models.py
2. Add to backend ENTITY_MODELS in crud_entity.py
3. Add to frontend config.php $ENTITY_NAMES
4. Add option in entities_crud.php select dropdown
5. Add to entities_crud_logic.js entityNames map

### Modifying Field Permissions

Edit `ROLE_PERMISSIONS` in `js/dmt_form_logic.js`:

```javascript
'Your Role': [
    'field1', 'field2', 'field3'
]
```

### Customizing UI

All styling uses Tailwind CSS utility classes. Modify classes directly in PHP files or add custom CSS.

## Security Considerations

### Implemented

✓ JWT-based authentication
✓ Role-based access control
✓ Field-level permissions
✓ CSRF protection via session
✓ Input validation (client and server)
✓ XSS prevention (HTML escaping)

### Production Recommendations

- Use HTTPS for all communication
- Implement rate limiting on login
- Set secure session cookies (httponly, secure, samesite)
- Implement CORS properly on backend
- Add logging and monitoring
- Use environment variables for sensitive config

## License

Internal use only.

## Support

For issues or questions, contact the development team.
