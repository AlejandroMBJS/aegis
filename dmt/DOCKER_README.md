# DMT System - Docker Setup

## Overview

Run the entire DMT system (backend + frontend) with **one command** using Docker Compose.

- **Backend**: FastAPI (Python) on port 8000
- **Frontend**: PHP built-in server on port 8080
- **Database**: SQLite (file-based, no separate container needed)

---

## Prerequisites

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (included with Docker Desktop)

### Verify Installation

```bash
docker --version
docker-compose --version
```

---

## Quick Start

### 1. Start Everything with One Command

From the project root directory (`/home/amb/eagis/dmt/`):

```bash
docker-compose up
```

That's it! The system will:
- Build backend Docker image (if not already built)
- Build frontend Docker image (if not already built)
- Start both services
- Create SQLite database automatically

### 2. Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### 3. Stop the Application

Press `Ctrl+C` in the terminal, or run:

```bash
docker-compose down
```

---

## Common Docker Commands

### Start in Background (Detached Mode)

```bash
docker-compose up -d
```

### View Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### Stop Services

```bash
docker-compose down
```

### Restart Services

```bash
docker-compose restart
```

### Rebuild Images (after code changes)

```bash
docker-compose build
```

### Rebuild and Start

```bash
docker-compose up --build
```

### Remove Everything (including volumes)

```bash
docker-compose down -v
```

---

## Project Structure

```
dmt/
├── docker-compose.yml          # Main orchestration file
├── dmt_backend/
│   ├── Dockerfile              # Backend container definition
│   ├── .dockerignore           # Files to exclude from image
│   ├── requirements.txt        # Python dependencies
│   ├── main.py                 # FastAPI app
│   └── ...
└── dmt_frontend/
    ├── Dockerfile              # Frontend container definition
    ├── .dockerignore           # Files to exclude from image
    ├── index.php               # Frontend entry point
    └── ...
```

---

## How It Works

### Backend Container

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

- Uses Python 3.11
- Installs dependencies from `requirements.txt`
- Runs FastAPI with auto-reload (development mode)
- Exposes port 8000

### Frontend Container

```dockerfile
FROM php:8.2-cli
WORKDIR /app
COPY . .
EXPOSE 8080
CMD ["php", "-S", "0.0.0.0:8080"]
```

- Uses PHP 8.2 CLI
- Runs PHP's built-in web server
- Exposes port 8080

### Database

- **SQLite** database stored in a Docker volume (`dmt_db_data`)
- No separate database container needed
- Database persists even when containers are stopped
- File location inside container: `/app/dmt.db`

---

## Development Workflow

### Hot Reload

Both services support hot reload - changes to code are reflected immediately:

1. **Backend**: Change Python files in `dmt_backend/` - Uvicorn auto-reloads
2. **Frontend**: Change PHP files in `dmt_frontend/` - Refresh browser to see changes

### Viewing Logs

```bash
# Watch backend logs
docker-compose logs -f backend

# Watch frontend logs
docker-compose logs -f frontend
```

### Accessing Containers

```bash
# Backend shell
docker exec -it dmt_backend bash

# Frontend shell
docker exec -it dmt_frontend bash
```

### Database Access

```bash
# Access SQLite database
docker exec -it dmt_backend sqlite3 /app/dmt.db

# Example: View all tables
docker exec -it dmt_backend sqlite3 /app/dmt.db ".tables"

# Example: Query users
docker exec -it dmt_backend sqlite3 /app/dmt.db "SELECT * FROM user;"
```

---

## Configuration

### Environment Variables

Backend environment variables are set in `docker-compose.yml`:

```yaml
environment:
  DATABASE_URL: "sqlite:///./dmt.db"
  SECRET_KEY: "your-secret-key-change-in-production"
  ACCESS_TOKEN_EXPIRE_MINUTES: "30"
```

To override:

```bash
# Create .env file in project root
echo 'SECRET_KEY=my-super-secret-key' > .env

# Docker Compose automatically loads .env
docker-compose up
```

### Port Customization

To change ports, edit `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "9000:8000"  # Access backend on port 9000
  frontend:
    ports:
      - "9080:8080"  # Access frontend on port 9080
```

---

## Switching to MySQL/PostgreSQL (Optional)

If you want to use MySQL/PostgreSQL instead of SQLite:

### Option 1: Add MySQL to docker-compose.yml

```yaml
services:
  db:
    image: mariadb:10.6
    container_name: dmt_mariadb
    environment:
      MYSQL_ROOT_PASSWORD: admin123
      MYSQL_DATABASE: dmt_db
      MYSQL_USER: dmt_user
      MYSQL_PASSWORD: dmt_user_password
    ports:
      - "3306:3306"
    volumes:
      - dmt_mysql_data:/var/lib/mysql
    networks:
      - dmt_network

  backend:
    depends_on:
      - db
    environment:
      DATABASE_URL: "mysql+pymysql://dmt_user:dmt_user_password@db:3306/dmt_db"

volumes:
  dmt_mysql_data:
```

### Option 2: Add PostgreSQL to docker-compose.yml

```yaml
services:
  db:
    image: postgres:15
    container_name: dmt_postgres
    environment:
      POSTGRES_DB: dmt_db
      POSTGRES_USER: dmt_user
      POSTGRES_PASSWORD: dmt_user_password
    ports:
      - "5432:5432"
    volumes:
      - dmt_postgres_data:/var/lib/postgresql/data
    networks:
      - dmt_network

  backend:
    depends_on:
      - db
    environment:
      DATABASE_URL: "postgresql://dmt_user:dmt_user_password@db:5432/dmt_db"

volumes:
  dmt_postgres_data:
```

---

## Troubleshooting

### Port Already in Use

```
Error: Bind for 0.0.0.0:8000 failed: port is already allocated
```

**Solution**: Stop the service using the port or change the port in `docker-compose.yml`

```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "8001:8000"
```

### Container Won't Start

```bash
# Check container logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Database Not Persisting

```bash
# Check if volume exists
docker volume ls | grep dmt

# Inspect volume
docker volume inspect dmt_dmt_db_data

# If needed, create backup
docker run --rm -v dmt_dmt_db_data:/data -v $(pwd):/backup ubuntu tar czf /backup/dmt_backup.tar.gz /data
```

### Permission Errors

```bash
# Fix file permissions (Linux/Mac)
sudo chown -R $USER:$USER .

# Or run containers with your user ID
docker-compose run --user $(id -u):$(id -g) backend bash
```

---

## Production Deployment

For production use:

### 1. Update Secret Keys

```yaml
environment:
  SECRET_KEY: "generate-a-long-random-secure-key-here"
```

### 2. Remove --reload Flag

Edit `dmt_backend/Dockerfile`:

```dockerfile
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 3. Add Nginx Reverse Proxy

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
      - frontend
```

### 4. Enable HTTPS

Use Let's Encrypt with Nginx or a reverse proxy.

### 5. Database Backups

```bash
# Automated backup script
docker exec dmt_backend sqlite3 /app/dmt.db ".backup /app/backup.db"
docker cp dmt_backend:/app/backup.db ./backups/dmt_$(date +%Y%m%d).db
```

---

## Useful Tips

### Clean Up Docker System

```bash
# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything (careful!)
docker system prune -a --volumes
```

### Monitor Resource Usage

```bash
# Container stats
docker stats

# Specific service
docker stats dmt_backend dmt_frontend
```

### Export/Import Images

```bash
# Save image
docker save -o dmt_backend.tar dmt-backend

# Load image
docker load -i dmt_backend.tar
```

---

## Summary

**Start the entire system:**
```bash
docker-compose up
```

**Access the application:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:8000/docs

**Stop the system:**
```bash
docker-compose down
```

That's all you need! The Docker setup handles everything else automatically.

---

## Support

- Backend logs: `docker-compose logs -f backend`
- Frontend logs: `docker-compose logs -f frontend`
- Container shell: `docker exec -it dmt_backend bash`
- Database access: `docker exec -it dmt_backend sqlite3 /app/dmt.db`

For more details, see:
- `DATABASE_SETUP.md` - Database configuration
- `MULTILANGUAGE_IMPLEMENTATION_SUMMARY.md` - Multi-language features
- FastAPI docs: http://localhost:8000/docs
