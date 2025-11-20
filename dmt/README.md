# DMT - Defect Management & Tracking System

A comprehensive system for managing manufacturing defects, tracking, and reporting with multi-language support (English, Spanish, Chinese).

## ⚡ Quick Start

### Option 1: Automated Setup (Recommended)

Run the setup script to automatically start everything:

```bash
./setup.sh
```

That's it! The script will:
- ✅ Check Docker installation
- ✅ Build Docker images
- ✅ Start backend and frontend
- ✅ Display access links

### Option 2: Manual Docker Setup

```bash
docker-compose up -d
```

### Option 3: Local Development (Without Docker)

**Backend:**
```bash
cd dmt_backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd dmt_frontend
php -S 0.0.0.0:8080
```

---

## 🌐 Access Points

After running the setup script, access the system at:

### Frontend (Login Page)
- **Main URL**: http://localhost:8080
- **Login Page**: http://localhost:8080/login.php
- **Dashboard**: http://localhost:8080/dashboard.php

### Backend API
- **API Root**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs ← **Try the API here!**
- **ReDoc**: http://localhost:8000/redoc

---

## 📋 Setup Script Usage

The `setup.sh` script supports multiple operations:

### Start the System
```bash
./setup.sh
```

### Rebuild Images and Start
```bash
./setup.sh --rebuild
```

### Stop the System
```bash
./setup.sh --stop
```

### Clean Everything (Removes all data)
```bash
./setup.sh --clean
```

### Show Help
```bash
./setup.sh --help
```

---

## 🗃️ Database

### Default: SQLite
- **Location**: `dmt_backend/dmt.db`
- **No setup required**: Automatically created on first run
- **Perfect for**: Development, testing, small deployments

### Switching to MySQL/PostgreSQL

1. **Edit `.env` file**:
   ```bash
   # dmt_backend/.env
   DATABASE_URL="postgresql://user:password@localhost:5432/dmt_db"
   ```

2. **Run initialization script**:
   ```bash
   psql -U postgres -f dmt_backend/db_scripts/init_postgresql.sql
   ```

3. **Install driver**:
   ```bash
   pip install psycopg2-binary
   ```

4. **Restart application**

See `DATABASE_SETUP.md` for detailed instructions.

---

## 📦 What's Included

### Backend (FastAPI + Python)
- RESTful API for defect management
- Role-based access control (RBAC)
- JWT authentication
- Multi-language support
- Auto-translation (LibreTranslate)
- SQLite/MySQL/PostgreSQL support

### Frontend (PHP)
- Login system with session management
- DMT form with field-level permissions
- Multi-language selector
- Print formats (DMT, CAR, MRB)
- Bilingual printing (Spanish/Chinese)

### Features
- ✅ Multi-language support (EN/ES/ZH)
- ✅ Auto-translation of defect descriptions
- ✅ Role-based field access control
- ✅ Bilingual printing
- ✅ Database-agnostic architecture
- ✅ Docker deployment ready
- ✅ Interactive API documentation

---

## 🔑 Default Users

| Role | Username | Password | Permissions |
|------|----------|----------|-------------|
| Admin | EMP001 | admin123 | Full access |
| Tech Engineer | EMP002 | tech123 | Create & edit DMT records |
| Inspector | EMP003 | inspector123 | Create initial records |
| Quality Engineer | EMP004 | quality123 | Close records |
| Operator | EMP005 | operator123 | Update repair info |

---

## 📁 Project Structure

```
dmt/
├── setup.sh                    # Automated setup script ⭐
├── docker-compose.yml          # Docker orchestration
├── README.md                   # This file
├── DATABASE_SETUP.md           # Database configuration guide
├── DOCKER_README.md            # Docker usage guide
├── IMPLEMENTATION_SUMMARY.md   # Technical implementation details
│
├── dmt_backend/                # FastAPI Backend
│   ├── main.py                 # API entry point
│   ├── database.py             # Database configuration
│   ├── models.py               # SQLModel models
│   ├── routers/                # API endpoints
│   ├── crud/                   # Database operations
│   ├── db_scripts/             # Database initialization scripts
│   ├── .env                    # Environment configuration
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile              # Backend container definition
│
└── dmt_frontend/               # PHP Frontend
    ├── login.php               # Login page
    ├── dashboard.php           # Main dashboard
    ├── dmt_form.php            # DMT form
    ├── js/                     # JavaScript files
    ├── css/                    # Stylesheets
    └── Dockerfile              # Frontend container definition
```

---

## 🛠️ Useful Docker Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### Restart Services
```bash
docker-compose restart
```

### Access Container Shell
```bash
# Backend
docker exec -it dmt_backend bash

# Frontend
docker exec -it dmt_frontend bash
```

### Rebuild Images
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Stop and Remove Everything
```bash
docker-compose down -v
```

---

## 🧪 Testing the API

### Using Swagger UI
1. Open http://localhost:8000/docs
2. Click "Authorize" button
3. Use default credentials:
   - Username: `EMP001`
   - Password: `admin123`
4. Try the endpoints!

### Using curl
```bash
# Login to get token
curl -X POST "http://localhost:8000/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=EMP001&password=admin123"

# Use token in requests
curl "http://localhost:8000/dmt/" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🌍 Multi-Language Features

### How It Works
1. User selects language (EN/ES/ZH) in the form
2. User types defect description in their language
3. System automatically translates to all 3 languages
4. Data stored in database in all languages
5. Print outputs show Spanish and Chinese side-by-side

### Language Selector
Located at the top of the DMT form:
- 🇺🇸 English (EN)
- 🇪🇸 Español (ES)
- 🇨🇳 中文 (ZH)

See `MULTILANGUAGE_IMPLEMENTATION_SUMMARY.md` for details.

---

## 📄 Print Formats

Three print formats available:

1. **DMT (Defect Material Tag)**
   - Shows defect description bilingually
   - Engineering findings
   - Signature fields

2. **CAR (Corrective Action Request)**
   - Bilingual defect description
   - Root cause analysis
   - Corrective actions
   - Facilitator information

3. **MRB (Material Review Board)**
   - All text fields shown bilingually
   - Cost accounting
   - Verdict checkboxes
   - Multiple signature fields

---

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use the setup script to stop everything
./setup.sh --stop
```

### Docker Build Fails

```bash
# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Database Issues

```bash
# Check database file exists
ls -lh dmt_backend/dmt.db

# View database tables
sqlite3 dmt_backend/dmt.db ".tables"

# Reset database (deletes all data!)
rm dmt_backend/dmt.db
./setup.sh --rebuild
```

### Translation Not Working

1. Check LibreTranslate service is accessible
2. Verify network connectivity
3. See troubleshooting in `MULTILANGUAGE_IMPLEMENTATION_SUMMARY.md`

---

## 📚 Documentation

- **README.md** (this file) - Quick start and overview
- **DATABASE_SETUP.md** - Database configuration guide
- **DOCKER_README.md** - Docker usage guide
- **MULTILANGUAGE_IMPLEMENTATION_SUMMARY.md** - Translation features
- **IMPLEMENTATION_SUMMARY.md** - Technical implementation details
- **db_scripts/README.md** - Database initialization scripts

---

## 🚀 Production Deployment

For production deployment:

1. **Change secrets in `.env`**
   ```bash
   SECRET_KEY="your-production-secret-key-here"
   ```

2. **Switch to PostgreSQL/MySQL**
   - See `DATABASE_SETUP.md`

3. **Disable auto-reload**
   - Edit `dmt_backend/Dockerfile`
   - Remove `--reload` flag

4. **Add reverse proxy**
   - Use Nginx or similar
   - Enable HTTPS
   - Configure SSL certificates

5. **Set up backups**
   ```bash
   # SQLite backup
   cp dmt_backend/dmt.db backups/dmt_$(date +%Y%m%d).db

   # PostgreSQL backup
   pg_dump dmt_db > backups/dmt_$(date +%Y%m%d).sql
   ```

---

## 📞 Support

If you encounter any issues:

1. Check the relevant documentation file
2. View Docker logs: `docker-compose logs -f`
3. Check the troubleshooting section above
4. Review `IMPLEMENTATION_SUMMARY.md` for technical details

---

## ✅ Quick Checklist

- [ ] Docker and Docker Compose installed
- [ ] Run `./setup.sh`
- [ ] Access frontend at http://localhost:8080
- [ ] Access API docs at http://localhost:8000/docs
- [ ] Login with default credentials (EMP001 / admin123)
- [ ] Test creating a DMT record
- [ ] Test multi-language features
- [ ] Test printing formats

---

**System Status:** ✅ Production Ready

**Last Updated:** November 14, 2025

**Technologies:** Python, FastAPI, PHP, SQLite, Docker, SQLModel, LibreTranslate
