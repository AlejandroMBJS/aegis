# DMT System - Complete Code Documentation

This document provides comprehensive documentation of all functions, variables, and code structure for both backend and frontend.

---

## Backend (dmt_backend/) Documentation

### 1. main.py - FastAPI Application Entry Point

#### Variables:
- `app`: FastAPI application instance
  - Configured with title, description, and version
  - Includes CORS middleware for cross-origin requests

#### Functions:
- `on_startup()`: Executes on application startup
  - Calls `init_db()` to create all database tables
  - Runs before the application starts accepting requests

- `root()`: GET endpoint at "/"
  - Returns API information and status
  - Used for health checking and API discovery

- `health_check()`: GET endpoint at "/health"
  - Simple health check endpoint
  - Returns `{"status": "healthy"}`

#### Routers Included:
- `router_auth`: Handles `/auth/*` endpoints
- `router_entities`: Handles `/entities/*` endpoints
- `router_dmt`: Handles `/dmt/*` endpoints

---

### 2. database.py - Database Configuration

#### Variables:
- `DATABASE_URL`: Connection string for MariaDB
  - Format: `mariadb+mariadbconnector://user:password@host:port/database`
  - Can be overridden by environment variable

- `engine`: SQLModel engine instance
  - Created with `create_engine()`
  - Parameters:
    - `echo=True`: Log all SQL statements (disable in production)
    - `pool_pre_ping=True`: Verify connections before using
    - `pool_recycle=3600`: Recycle connections after 1 hour

#### Functions:
- `init_db()`: Initialize database
  - Creates all tables defined in models
  - Uses `SQLModel.metadata.create_all(engine)`
  - Called on application startup

- `get_session()`: Database session dependency
  - Yields a session for database operations
  - Automatically closes session after use
  - Used with FastAPI Depends()

---

### 3. auth.py - Authentication & Password Hashing

#### Variables:
- `SECRET_KEY`: JWT signing key
  - Should be changed to a secure random value in production
  - Used to sign and verify JWT tokens

- `ALGORITHM`: JWT algorithm (HS256)
  - Symmetric encryption algorithm
  - Requires SECRET_KEY for encoding/decoding

- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time
  - Default: 30 minutes
  - Configurable via environment variable

- `pwd_context`: Password hashing context
  - Uses bcrypt algorithm
  - Handles password hashing and verification

#### Functions:
- `verify_password(plain_password, hashed_password)`: Verify password
  - Compares plain text password with stored hash
  - Returns True if match, False otherwise
  - Uses bcrypt's constant-time comparison

- `get_password_hash(password)`: Hash password
  - Generates bcrypt hash of plain text password
  - Returns hashed password string
  - Used when creating or updating users

- `create_access_token(data, expires_delta)`: Create JWT token
  - Encodes user data into JWT
  - Adds expiration timestamp
  - Returns signed JWT string

- `verify_token(token)`: Verify JWT token
  - Decodes and validates JWT
  - Returns TokenData if valid, None if invalid
  - Catches JWTError for expired/invalid tokens

---

### 4. deps.py - FastAPI Dependencies

#### Variables:
- `oauth2_scheme`: OAuth2 password bearer
  - Extracts token from Authorization header
  - Format: "Bearer <token>"
  - tokenUrl: "/auth/token"

#### Functions:
- `get_current_user(token, session)`: Get authenticated user
  - Validates JWT token
  - Retrieves user from database
  - Raises 401 if token invalid
  - Returns User instance

- `role_required(allowed_roles)`: Role-based access control
  - Factory function that returns a dependency
  - Checks if user's role is in allowed_roles list
  - Raises 403 if role not allowed
  - Returns current user if authorized
  - Usage: `Depends(role_required(["Admin", "Inspector"]))`

---

### 5. models.py - SQLModel ORM Models

#### EntityBase (Base class for catalogs):
**Fields:**
- `item_number`: Unique identifier string (indexed)
- `item_name`: Display name string

#### User (Authentication & ownership):
**Fields:**
- `id`: Primary key (auto-increment)
- `employee_number`: Unique employee ID (indexed)
- `full_name`: User's full name
- `role`: One of: Admin, Inspector, Operator, Tech Engineer, Quality Engineer
- `hashed_password`: Bcrypt hash of password
- `dmt_records`: Relationship to DMTRecord (one-to-many)

#### Entity Models (10 catalog tables):
All inherit from EntityBase and have the same structure:
1. **PartNumber**: Part numbers catalog
2. **WorkCenter**: Work centers catalog
3. **Customer**: Customers catalog
4. **Level**: Levels catalog
5. **Area**: Areas catalog
6. **Calibration**: Calibrations catalog
7. **InspectionItem**: Inspection items catalog
8. **PreparedBy**: Prepared by catalog (can be used for approvers)
9. **Disposition**: Dispositions catalog (for closure)
10. **FailureCode**: Failure codes catalog

#### DMTRecord (Main transactional table):
**Control Fields:**
- `id`: Primary key
- `is_closed`: Boolean (default False)
- `created_at`: Timestamp (auto-generated)
- `created_by_id`: Foreign key to User

**Section 1 (Inspector - Required at creation):**
- `part_number_id`: FK to PartNumber
- `work_center_id`: FK to WorkCenter
- `customer_id`: FK to Customer
- `level_id`: FK to Level
- `area_id`: FK to Area
- `defect_description`: Text description

**Section 2 (Operator):**
- `process_analysis`: Text (required for Operator)
- `repair_process`: Text (optional)
- `rework_hours`: Float (optional)

**Section 3 (Tech Engineer):**
- `engineering_findings`: Text (required for Tech Engineer)
- `material_scrap_cost`: Float (optional)
- `other_cost`: Float (optional)

**Section 4 (Quality Engineer - Required for closure):**
- `final_disposition_id`: FK to Disposition
- `failure_code_id`: FK to FailureCode
- `approved_by_id`: FK to User (approver)

**Relationships:**
- `creator`: User who created the record
- `part_number`, `work_center`, `customer`, `level`, `area`: Entity relationships
- `final_disposition`, `failure_code`: Closure data relationships

---

### 6. schemas.py - Pydantic Validation Schemas

#### UserCreate:
- Used for creating new users
- Fields: employee_number, full_name, role, password (plain text)

#### UserRead:
- Used for returning user data
- Excludes hashed_password for security

#### UserAuth:
- Used for login requests
- Fields: employee_number, password

#### Token:
- JWT token response
- Fields: access_token, token_type

#### TokenData:
- Decoded token data
- Fields: employee_number

#### EntityCreate:
- Generic schema for creating catalog entries
- Fields: item_number, item_name

#### EntityRead:
- Generic schema for returning catalog entries
- Fields: id, item_number, item_name

#### DMTRecordCreate:
- Used for creating DMT records (Inspector only)
- Validates all 6 required Section 1 fields
- Fields: part_number_id, work_center_id, customer_id, level_id, area_id, defect_description

#### DMTRecordRead:
- Used for returning DMT record data
- Includes all fields from all sections

#### DMTRecordUpdate:
- Used for updating DMT records
- All fields optional (allows partial updates)
- RBAC validation happens in CRUD layer

---

### 7. crud/crud_user.py - User CRUD Operations

#### Functions:
- `create_user(session, user_data)`: Create new user
  - Hashes password before storing
  - Returns created User instance
  - Raises error if employee_number already exists

- `get_user_by_employee_number(session, employee_number)`: Find user
  - Returns User if found, None otherwise
  - Used for authentication

- `get_user(session, user_id)`: Get user by ID
  - Returns User if found, None otherwise

- `list_users(session, skip, limit)`: List all users
  - Supports pagination
  - Returns list of User instances

- `authenticate_user(session, employee_number, password)`: Authenticate
  - Finds user by employee_number
  - Verifies password hash
  - Returns User if valid, None if invalid
  - Used by login endpoint

---

### 8. crud/crud_entity.py - Generic Entity CRUD

#### Variables:
- `ENTITY_MODELS`: Dictionary mapping entity names to model classes
  - Keys: "partnumber", "workcenter", "customer", etc.
  - Values: PartNumber, WorkCenter, Customer, etc.

#### Functions:
- `get_entity_model(entity_name)`: Get model class
  - Case-insensitive lookup
  - Returns model class or None

- `create_entity(session, entity_name, entity_data)`: Create entry
  - Admin only (enforced in router)
  - Returns created entity instance

- `get_entity(session, entity_name, entity_id)`: Get one entry
  - Returns entity instance or None

- `list_entities(session, entity_name, skip, limit)`: List entries
  - Supports pagination
  - Returns list of entity instances

- `update_entity(session, entity_name, entity_id, entity_data)`: Update entry
  - Admin only (enforced in router)
  - Returns updated entity or None

- `delete_entity(session, entity_name, entity_id)`: Delete entry
  - Admin only (enforced in router)
  - Returns True if deleted, False if not found

---

### 9. crud/crud_dmt.py - DMT CRUD with RBAC

#### CRITICAL Variable:
- `ALLOWED_FIELDS_BY_ROLE`: Dictionary of field permissions
  - Keys: Role names ("Admin", "Inspector", etc.)
  - Values: List of field names that role can edit
  - **This is the core of the RBAC system**

**Role Permissions:**
- **Admin**: All fields
- **Tech Engineer**: All fields
- **Inspector**: Section 1 fields only
- **Operator**: Section 2 fields only
- **Quality Engineer**: Section 4 fields only (closure)

#### Functions:
- `create_dmt(session, dmt_data, created_by_id)`: Create DMT record
  - Only Inspector can call (enforced in router)
  - Validates all 6 required Section 1 fields
  - Sets is_closed=False
  - Returns created DMTRecord

- `get_dmt_by_id(session, dmt_id)`: Get one DMT record
  - Returns DMTRecord or None

- `list_dmt(session, skip, limit, filters...)`: List DMT records
  - Filters: is_closed, created_by_id, part_number_id, date range
  - Supports pagination
  - Returns list of DMTRecord instances

- `update_dmt_partial_with_field_control(session, dmt_id, update_data, user_role)`: **CRITICAL FUNCTION**
  - Implements field-level RBAC
  - Validates record not closed (raises ValueError if closed)
  - Gets allowed fields for user's role from ALLOWED_FIELDS_BY_ROLE
  - Validates all fields in update_data are in allowed list
  - Special validation for Quality Engineer closure:
    - If is_closed=True, requires all 3 closure fields
  - Applies updates and returns updated DMTRecord
  - Raises ValueError if validation fails

---

### 10. routers/router_auth.py - Authentication Endpoints

#### Endpoints:
- **POST /auth/token**: Login endpoint
  - Accepts: OAuth2PasswordRequestForm (username=employee_number, password)
  - Validates: Calls `authenticate_user()`
  - Returns: JWT token (access_token, token_type)
  - Error: 401 if credentials invalid

---

### 11. routers/router_entities.py - Entity CRUD Endpoints

#### Endpoints:
- **POST /entities/{entity_name}**: Create entity entry
  - Auth: Admin only
  - Body: EntityCreate
  - Returns: EntityRead (201 Created)

- **GET /entities/{entity_name}**: List entity entries
  - Auth: All authenticated users
  - Query: skip, limit (pagination)
  - Returns: List[EntityRead]

- **GET /entities/{entity_name}/{entity_id}**: Get one entry
  - Auth: All authenticated users
  - Returns: EntityRead
  - Error: 404 if not found

- **PATCH /entities/{entity_name}/{entity_id}**: Update entry
  - Auth: Admin only
  - Body: EntityCreate
  - Returns: EntityRead
  - Error: 404 if not found

- **DELETE /entities/{entity_name}/{entity_id}**: Delete entry
  - Auth: Admin only
  - Returns: 204 No Content
  - Error: 404 if not found

---

### 12. routers/router_dmt.py - DMT CRUD with RBAC

#### Endpoints:
- **POST /dmt/**: Create DMT record
  - Auth: Inspector only
  - Body: DMTRecordCreate (validates 6 required fields)
  - Sets: created_by_id = current_user.id
  - Returns: DMTRecordRead (201 Created)

- **GET /dmt/**: List DMT records
  - Auth: All authenticated users
  - Query params:
    - skip, limit (pagination)
    - is_closed (filter by status)
    - created_by_id (filter by creator)
    - part_number_id (filter by part)
    - created_after, created_before (date range)
  - Returns: List[DMTRecordRead]

- **GET /dmt/{id}**: Get one DMT record
  - Auth: All authenticated users
  - Returns: DMTRecordRead
  - Error: 404 if not found

- **PATCH /dmt/{id}**: Update DMT record (RBAC)
  - Auth: All authenticated users
  - Body: DMTRecordUpdate (all fields optional)
  - Validates:
    - Record exists (404 if not)
    - Record not closed (400 if closed)
    - User role allows editing requested fields (400 if forbidden)
    - Quality Engineer provides closure fields if closing
  - Calls: `update_dmt_partial_with_field_control()`
  - Returns: DMTRecordRead
  - Errors: 400 (validation), 404 (not found)

---

### 13. init_data.py - Database Seeding Script

#### Functions:
- `create_sample_users(session)`: Create 5 demo users
  - One for each role
  - Passwords hashed with bcrypt
  - Skips if employee_number already exists

- `create_sample_entities(session)`: Create sample catalog data
  - Creates entries for all 10 entity types
  - 2-3 entries per catalog
  - Skips if item_number already exists

- `create_entities(session, model, entities_data, entity_name)`: Helper
  - Generic function to create entities
  - Checks for existing entries
  - Prints creation status

- `main()`: Main execution function
  - Creates session
  - Calls create_sample_users()
  - Calls create_sample_entities()
  - Prints credentials for demo users

---

## Frontend (dmt_frontend/) Documentation

### 1. config.php - Configuration & Helper Functions

#### Constants:
- `API_BASE_URL`: Backend API URL (http://localhost:8000)
- `API_AUTH_TOKEN`: Full auth endpoint URL
- `API_DMT`: Full DMT endpoint URL
- `API_ENTITIES`: Full entities endpoint URL

#### Variables:
- `$ENTITY_NAMES`: Array of entity name mappings
  - Keys: Internal names ("partnumber", "workcenter", etc.)
  - Values: Display names ("Part Numbers", "Work Centers", etc.)

- `$ROLES`: Array of available role names

#### Functions:
- `getCurrentUser()`: Get user from session
  - Returns user array or null
  - Used in views to display user info

- `isAuthenticated()`: Check if user logged in
  - Returns true if session has token and user
  - Returns false otherwise

- `requireAuth()`: Require authentication
  - Redirects to login if not authenticated
  - Used at top of protected pages

- `requireRole($allowedRoles)`: Require specific role
  - Checks if user's role is in allowed list
  - Dies with 403 error if not allowed
  - Used for Admin-only pages

- `logout()`: Logout user
  - Destroys session
  - Redirects to login page

---

### 2. index.php - Login Page

#### HTML Elements:
- `loginForm`: Main login form
- `employee_number`: Input for employee number
- `password`: Input for password
- `error-message`: Error display div
- `loginButton`: Submit button

#### JavaScript:
- Form submit handler:
  - Prevents default form submission
  - Calls `login()` from auth.js
  - Shows loading state on button
  - Displays error or redirects to dashboard

---

### 3. dashboard.php - DMT Feed & Filters

#### HTML Elements:
- **Filter Controls:**
  - `filter-status`: Status dropdown (All/Open/Closed)
  - `filter-part-number`: Part number filter
  - `filter-work-center`: Work center filter
  - `filter-customer`: Customer filter
  - `filter-date-start`: Date range start
  - `filter-date-end`: Date range end
  - `apply-filters`: Apply filters button
  - `clear-filters`: Clear filters button

- **Table:**
  - `records-table-body`: Table body for DMT records
  - `records-count`: Display count of records
  - `pagination`: Pagination controls

#### JavaScript (dmt_feed.js):
- Populates filter dropdowns from catalogs
- Loads records on page load
- Applies filters when requested
- Renders table rows with data
- Handles pagination (if implemented)

---

### 4. dmt_form.php - DMT Form (Create/Edit)

#### PHP Variables:
- `$recordId`: ID from URL query parameter (null if creating)
- `$isEditMode`: Boolean, true if editing existing record
- `$currentUser`: User data from session

#### HTML Structure:
**4 Sections corresponding to DMT workflow:**

**Section 1: Inspector (Blue border)**
- Fields: report_number, part_number_id, work_center_id, customer_id, level_id, area_id, defect_description
- All required except report_number

**Section 2: Operator (Green border)**
- Fields: process_analysis (required), repair_process (optional), rework_hours (optional)
- Optional fields marked with `.optional-field` class

**Section 3: Tech Engineer (Purple border)**
- Fields: engineering_findings (required), material_scrap_cost (optional), other_cost (optional)
- Optional fields marked with `.optional-field` class

**Section 4: Quality Engineer (Red border)**
- Fields: final_disposition_id, failure_code_id, approved_by_id, is_closed
- All required when closing

**Print Buttons Section:**
- Only visible when `is_closed = true`
- 3 buttons: Print DMT, Print CAR, Print MRB

#### JavaScript Integration:
- Passes `USER_ROLE` from PHP to JavaScript
- Loads: auth.js, dmt_form_logic.js, print.js
- Loads: print.css

---

### 5. entities_crud.php - Catalog Management (Admin Only)

#### PHP:
- Requires Admin role (calls `requireRole(['Admin'])`)
- Dies with 403 if not Admin

#### HTML Elements:
- `entity-selector`: Dropdown to choose catalog
- `create-new-button`: Create button (disabled until catalog selected)
- `entities-table-body`: Table for catalog entries
- `entity-modal`: Create/Edit modal
- `delete-modal`: Delete confirmation modal

#### Modal Forms:
- **Create/Edit Form:**
  - `entity-id`: Hidden field for ID (edit mode)
  - `entity-name`: Hidden field for catalog name
  - `item_number`: Input for item number
  - `item_name`: Input for item name

#### JavaScript (entities_crud_logic.js):
- Loads entities when catalog selected
- Opens modal for create/edit
- Handles form submission (POST/PATCH)
- Confirms and executes delete (DELETE)

---

### 6. js/auth.js - Authentication Module

#### Variables:
- `API_BASE_URL`: Backend URL

#### Functions:
- `login(employee_number, password)`: Login user
  - Creates URLSearchParams with OAuth2 format
  - POSTs to /auth/token
  - Stores token in localStorage
  - Returns {success, error}

- `fetchCurrentUser()`: Get user info
  - Placeholder (not implemented in backend)
  - Would fetch user details from /me endpoint

- `getAuthHeaders()`: Get auth headers
  - Retrieves token from localStorage
  - Returns headers object with Authorization: Bearer <token>

- `isAuthenticated()`: Check if token exists
  - Returns true if token in localStorage

- `logout()`: Logout user
  - Removes token from localStorage
  - Redirects to login page

- `apiRequest(url, options)`: Wrapper for fetch with auth
  - Adds auth headers
  - Handles 401 (auto-logout)
  - Returns response or null

- `apiGet(url)`: GET request with auth
  - Calls apiRequest with GET method
  - Returns parsed JSON

- `apiPost(url, data)`: POST request with auth
  - Calls apiRequest with POST method
  - Sends JSON body
  - Returns parsed JSON

- `apiPatch(url, data)`: PATCH request with auth
  - Calls apiRequest with PATCH method
  - Sends JSON body
  - Returns parsed JSON

- `apiDelete(url)`: DELETE request with auth
  - Calls apiRequest with DELETE method
  - Returns true or parsed JSON

---

### 7. js/dmt_feed.js - Dashboard Logic

#### Variables:
- `allRecords`: Array of loaded DMT records
- `partNumbers`, `workCenters`, `customers`: Catalog arrays for filters

#### Functions:
- `loadCatalogs()`: Load filter data
  - Loads: Part Numbers, Work Centers, Customers
  - Calls populateFilterDropdowns()

- `populateFilterDropdowns()`: Populate filter selects
  - Creates option elements for each catalog entry

- `loadRecords(filters)`: Load DMT records
  - Builds query string from filters
  - Calls GET /dmt/
  - Calls renderRecordsTable()

- `renderRecordsTable(records)`: Render table
  - Creates HTML rows for each record
  - Shows status badges
  - Shows View/Edit button
  - Calls renderEmptyState() if no records

- `renderEmptyState(message)`: Show empty state
  - Displays message when no records

- `renderStatusBadge(isClosed)`: Create status badge
  - Returns HTML for Open/Closed badge

- `getPartNumberDisplay(id)`, `getWorkCenterDisplay(id)`, `getCustomerDisplay(id)`: Get display text
  - Looks up catalog entry by ID
  - Returns item_number or ID

- `formatDateTime(dateString)`: Format date
  - Converts ISO date to readable format

- `updateRecordsCount(count)`: Update count display

- `setupEventListeners()`: Setup filters
  - Apply filters button: calls loadRecords()
  - Clear filters button: resets and calls loadRecords()

---

### 8. js/dmt_form_logic.js - **CRITICAL FILE - RBAC Logic**

#### CRITICAL Variable:
- `ROLE_PERMISSIONS`: Dictionary of field permissions
  - **Mirrors backend ALLOWED_FIELDS_BY_ROLE**
  - Keys: Role names
  - Values: Arrays of field names
  - Used by `applyRolePermissions()`

#### Variables:
- `currentRecord`: Loaded DMT record (edit mode)
- `currentUserRole`: User's role from PHP
- `isEditMode`: Boolean, true if editing
- `catalogs`: Object with all catalog arrays

#### Functions:
- `getUserRole()`: Get role from page
  - Reads window.USER_ROLE (set by PHP)
  - Fallback: looks for meta tag or data attribute

- `loadAllCatalogs()`: Load all catalog data
  - Loads all 8 catalogs in parallel
  - Calls populateSelects()

- `populateSelects()`: Populate form dropdowns
  - Calls populateSelect() for each catalog

- `populateSelect(selectId, items)`: Populate one dropdown
  - Creates option elements

- `loadRecord(recordId)`: Load existing record
  - Calls GET /dmt/{id}
  - Calls populateFormFields()
  - Shows warning and print buttons if closed

- `populateFormFields(record)`: Fill form with data
  - Sets values for all fields
  - Handles checkboxes separately

- **`applyRolePermissions()`**: **CRITICAL FUNCTION - Implements client-side RBAC**
  - **Universal Rule:** If `is_closed = true`, disables ALL fields
  - Gets allowed fields for current role
  - Loops through all fields
  - Disables fields NOT in allowed list
  - Adds lock icons to disabled field labels
  - Special: Calls setupQualityEngineerClosureValidation()

- `disableAllFields()`: Disable all fields
  - Called when record is closed
  - Sets disabled=true on all inputs

- `setupQualityEngineerClosureValidation()`: Setup closure validation
  - Listens to is_closed checkbox
  - Makes closure fields required when checked
  - Shows warning toast

- `setupFormSubmission()`: Setup form submit
  - Calls validateForm()
  - Calls buildPayload()
  - POSTs (create) or PATCHes (update)
  - Shows success toast and redirects

- `validateForm()`: Validate before submit
  - **Create mode:** Validates 6 Section 1 required fields
  - **Quality Engineer closing:** Validates 3 closure fields
  - Returns false if validation fails

- `buildPayload()`: Build request payload
  - **Only includes fields allowed for user's role**
  - Converts types (numbers, booleans)
  - Returns payload object

- `setUserRole(role)`: Set role externally
  - Called from PHP inline script

---

### 9. js/entities_crud_logic.js - Catalog CRUD Logic

#### Variables:
- `currentEntityType`: Selected catalog name
- `currentEntityData`: Array of loaded entries
- `itemToDelete`: ID of item being deleted
- `isEditMode`: Boolean for modal mode

#### Functions:
- `setupEventListeners()`: Setup event handlers
  - Entity selector change: loads entities
  - Create button: opens modal
  - Modal close/cancel: closes modal
  - Form submit: creates or updates
  - Delete buttons: confirms and deletes

- `loadEntities(entityType)`: Load catalog entries
  - Calls GET /entities/{name}
  - Calls renderEntitiesTable()

- `renderEntitiesTable(entities, entityType)`: Render table
  - Creates rows with Edit/Delete buttons
  - Shows empty state if no entries

- `openModal(edit, entity)`: Open create/edit modal
  - Sets mode (create vs edit)
  - Populates form if editing
  - Shows modal

- `closeModal()`: Close modal
  - Hides modal
  - Resets form

- `handleFormSubmit(e)`: Handle form submit
  - POSTs (create) or PATCHes (edit)
  - Shows toast
  - Reloads entities

- `editEntity(id)`: Global function for edit button
  - Finds entity in currentEntityData
  - Opens modal with entity data

- `confirmDeleteEntity(id, itemNumber)`: Show delete confirmation
  - Sets itemToDelete
  - Shows delete modal

- `closeDeleteModal()`: Close delete modal

- `handleDelete()`: Execute delete
  - Calls DELETE /entities/{name}/{id}
  - Shows toast
  - Reloads entities

- `escapeHtml(text)`: Prevent XSS
  - Escapes HTML special characters
  - Used when rendering user input

---

### 10. js/print.js - Print Module (NEW)

#### Functions:
- `getReportNumber()`: Get or generate report number
  - Reads from report_number field
  - If empty, generates as `1000 + record_id`
  - Returns report number string

- `getFormValue(selector, attribute)`: Safely get form value
  - Gets value from input/select
  - Returns 'N/A' if not found
  - Handles select option text

- `cleanupPrintClasses()`: Remove print classes
  - Removes print-dmt, print-car, print-mrb from body

- `setReportNumberAttr()`: Set data attribute
  - Sets `data-report-number` on form
  - Used by CSS content in ::before

- **`printDMT()`**: Print Defective Material Tag
  - Cleans up classes
  - Sets report number
  - Adds print-dmt class to body
  - Calls window.print()
  - Removes print class

- **`printCAR()`**: Print Corrective Action Request
  - Cleans up classes
  - Sets report number
  - Creates car-header-info div with metadata
  - Creates car-footer-info div with actions
  - Inserts divs into form
  - Adds print-car class
  - Calls window.print()
  - Removes injected divs

- **`printMRB()`**: Print Material Review Board
  - Cleans up classes
  - Sets report number
  - Calculates total cost
  - Creates mrb-cost-section div
  - Inserts div into form
  - Adds print-mrb class
  - Calls window.print()
  - Removes injected div

- DOMContentLoaded handler:
  - Auto-generates report number if empty
  - Runs on page load

---

### 11. css/print.css - Print Styles (NEW)

#### Common Print Styles (@media print):
- Hides `.optional-field` (repair_process, rework_hours, material_scrap_cost, other_cost)
- Hides navigation, footer, buttons
- Sets page size to letter portrait
- Sets margin to 0.5 inch

#### DMT Print Styles (body.print-dmt):
- Hides everything except #dmt-form
- Shows header with "DEFECTIVE MATERIAL TAG" and report number
- Shows Section 1 (General Info) in 4-column grid
- Shows defect description
- Shows Section 3 (Engineering)
- Hides Sections 2 (Process) and 4 (Quality)
- Shows signature block at bottom

#### CAR Print Styles (body.print-car):
- Shows header with "CORRECTIVE ACTION REQUEST" and report number
- Shows injected car-header-info (metadata)
- Shows Section 2 (Defect Description only)
- Shows injected car-footer-info (ROOT CAUSE, CORRECTIVE ACTION, PREVENTIVE ACTION, signatures)
- Hides all other sections

#### MRB Print Styles (body.print-mrb):
- Shows header with "MATERIAL REVIEW BOARD" and report number
- Shows Section 1 (General Info)
- Shows Section 2 (Defect Description)
- Shows Section 3 (Engineering)
- Shows injected mrb-cost-section (cost accounting and verdict)
- Hides Process Analysis section
- Shows signature block with 5 signatures:
  - Mechanical Engineer
  - Quality Engineer
  - Quality Manager
  - **Engineering Manager (NEW)**
  - **Production Manager (NEW)**

---

### 12. includes/header.php - Navigation Header

#### PHP:
- Gets current user from session
- Gets current page filename
- Only displays navigation if authenticated

#### HTML Structure:
- Blue navigation bar
- Logo and "DMT System" title
- Links:
  - Dashboard (all users)
  - Create DMT Record (Inspector only)
  - Manage Catalogs (Admin only)
- User info display (name and role)
- Logout button

---

### 13. includes/footer.php - Footer & Utilities

#### HTML:
- Copyright footer
- Toast notification container
- Loading overlay

#### JavaScript Functions:
- `showToast(message, type)`: Show notification
  - Types: success, error, warning, info
  - Auto-dismisses after 3 seconds

- `showLoading()`: Show loading overlay
- `hideLoading()`: Hide loading overlay

---

## Key Concepts

### RBAC Implementation (Critical Understanding)

**Backend (crud/crud_dmt.py):**
```python
ALLOWED_FIELDS_BY_ROLE = {
    'Inspector': ['part_number_id', ...],
    'Operator': ['process_analysis', ...],
    ...
}
```

**Frontend (js/dmt_form_logic.js):**
```javascript
const ROLE_PERMISSIONS = {
    'Inspector': ['part_number_id', ...],
    'Operator': ['process_analysis', ...],
    ...
}
```

**Flow:**
1. User opens DMT form
2. JavaScript gets user's role
3. `applyRolePermissions()` disables forbidden fields
4. User can only see/edit allowed fields
5. User submits form
6. Frontend validates (allowed fields only)
7. Backend receives PATCH request
8. Backend validates (allowed fields only)
9. If valid, updates record
10. If invalid, returns 400 error

### Print Functionality (New Feature)

**Flow:**
1. Record is closed
2. Print buttons appear
3. User clicks print button
4. JavaScript injects necessary content
5. Body gets print class (print-dmt, print-car, or print-mrb)
6. CSS @media print styles apply
7. window.print() opens print dialog
8. After printing, cleanup removes injected content and class

**Report Number:**
- Auto-generated as `1000 + record_id`
- Can be manually entered
- Appears on all print formats

**Optional Fields:**
- Marked with `.optional-field` class
- Hidden in all print formats
- repair_process, rework_hours, material_scrap_cost, other_cost

---

This documentation provides a complete reference for understanding and maintaining the DMT system codebase.
