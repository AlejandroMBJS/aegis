# DMT Backend API

Backend completo para gestión de DMT Records utilizando FastAPI + SQLModel + MariaDB con autenticación JWT y control de acceso basado en roles (RBAC).

## Características

- **Autenticación JWT**: Sistema de autenticación basado en tokens JWT
- **Control de acceso por roles (RBAC)**: 5 roles diferentes con permisos específicos
- **Control de edición por campo**: Cada rol puede editar solo campos específicos
- **Catálogos (Entities)**: Tablas de referencia estáticas
- **DMT Records**: Tabla transaccional principal con control de estado
- **MariaDB**: Base de datos relacional con SQLModel ORM
- **Docker**: Despliegue completo con docker-compose

## Roles y Permisos

### Roles disponibles

1. **Admin**: Control total sobre entities y DMT records
2. **Inspector**: Crea DMT records, edita información general y descripción de defectos
3. **Operator**: Edita análisis de proceso, proceso de reparación y horas de retrabajo
4. **Tech Engineer**: Edita todos los campos de ingeniería y costos
5. **Quality Engineer**: Cierra DMT records y asigna disposición final

### Permisos por rol en DMT Records

| Campo | Admin | Tech Engineer | Inspector | Operator | Quality Engineer |
|-------|-------|---------------|-----------|----------|------------------|
| part_number_id | ✓ | ✓ | ✓ | ✗ | ✗ |
| work_center_id | ✓ | ✓ | ✓ | ✗ | ✗ |
| customer_id | ✓ | ✓ | ✓ | ✗ | ✗ |
| level_id | ✓ | ✓ | ✓ | ✗ | ✗ |
| area_id | ✓ | ✓ | ✓ | ✗ | ✗ |
| defect_description | ✓ | ✓ | ✓ | ✗ | ✗ |
| process_analysis | ✓ | ✓ | ✗ | ✓ | ✗ |
| repair_process | ✓ | ✓ | ✗ | ✓ | ✗ |
| rework_hours | ✓ | ✓ | ✗ | ✓ | ✗ |
| engineering_findings | ✓ | ✓ | ✗ | ✗ | ✗ |
| material_scrap_cost | ✓ | ✓ | ✗ | ✗ | ✗ |
| other_cost | ✓ | ✓ | ✗ | ✗ | ✗ |
| is_closed | ✓ | ✓ | ✗ | ✗ | ✓ |
| final_disposition_id | ✓ | ✓ | ✗ | ✗ | ✓ |
| failure_code_id | ✓ | ✓ | ✗ | ✗ | ✓ |
| approved_by_id | ✓ | ✓ | ✗ | ✗ | ✓ |

## Estructura del Proyecto

```
dmt_backend/
├── main.py                    # Aplicación FastAPI principal
├── database.py                # Configuración de base de datos
├── auth.py                    # JWT y hashing de passwords
├── deps.py                    # Dependencies de FastAPI
├── models.py                  # Modelos SQLModel (ORM)
├── schemas.py                 # Schemas Pydantic
├── docker-compose.yml         # Configuración Docker
├── Dockerfile                 # Dockerfile para API
├── requirements.txt           # Dependencias Python
├── crud/
│   ├── crud_user.py          # CRUD para usuarios
│   ├── crud_entity.py        # CRUD genérico para entities
│   └── crud_dmt.py           # CRUD para DMT records
└── routers/
    ├── router_auth.py        # Endpoints de autenticación
    ├── router_entities.py    # Endpoints de catálogos
    └── router_dmt.py         # Endpoints de DMT records
```

## Requisitos

- Docker
- Docker Compose

## Instalación y Ejecución

### 1. Clonar o crear el proyecto

```bash
cd dmt_backend
```

### 2. Levantar los servicios con Docker Compose

```bash
docker-compose up --build
```

Este comando:
- Crea el contenedor de MariaDB (dmt_db)
- Crea el contenedor de la API (dmt_api)
- Inicializa la base de datos automáticamente
- La API estará disponible en `http://localhost:8000`

### 3. Verificar que la API está funcionando

```bash
curl http://localhost:8000/health
```

## Endpoints de la API

### Autenticación

- `POST /auth/token` - Login y obtención de JWT token

### DMT Records

- `POST /dmt/` - Crear DMT record (solo Inspector)
- `GET /dmt/` - Listar DMT records con filtros
- `GET /dmt/{id}` - Obtener DMT record específico
- `PATCH /dmt/{id}` - Actualizar DMT record (con control de campos por rol)

### Entities (Catálogos)

- `POST /entities/{name}` - Crear entry en catálogo (solo Admin)
- `GET /entities/{name}` - Listar entries del catálogo
- `GET /entities/{name}/{id}` - Obtener entry específico
- `PATCH /entities/{name}/{id}` - Actualizar entry (solo Admin)
- `DELETE /entities/{name}/{id}` - Eliminar entry (solo Admin)

Entities disponibles:
- `partnumber` - Part Numbers
- `workcenter` - Work Centers
- `customer` - Customers
- `level` - Levels
- `area` - Areas
- `calibration` - Calibrations
- `inspectionitem` - Inspection Items
- `preparedby` - Prepared Bys
- `disposition` - Dispositions
- `failurecode` - Failure Codes

## Documentación Interactiva

Una vez que la API está corriendo, puedes acceder a:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Uso Básico

### 1. Crear un usuario Admin (requiere acceso directo a la DB o script de inicialización)

Puedes crear usuarios iniciales conectándote a la API y usando las funciones CRUD directamente, o mediante un script de inicialización.

### 2. Autenticarse

```bash
curl -X POST "http://localhost:8000/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=EMP001&password=mypassword"
```

Respuesta:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### 3. Crear un Entity (como Admin)

```bash
curl -X POST "http://localhost:8000/entities/partnumber" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item_number": "PN001",
    "item_name": "Part Number 001"
  }'
```

### 4. Crear un DMT Record (como Inspector)

```bash
curl -X POST "http://localhost:8000/dmt/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "part_number_id": 1,
    "work_center_id": 1,
    "customer_id": 1,
    "level_id": 1,
    "area_id": 1,
    "defect_description": "Defecto encontrado en inspección"
  }'
```

### 5. Actualizar un DMT Record (según rol)

Como Operator (solo puede editar process_analysis, repair_process, rework_hours):

```bash
curl -X PATCH "http://localhost:8000/dmt/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "process_analysis": "Análisis del proceso completado",
    "rework_hours": 5.5
  }'
```

### 6. Cerrar un DMT Record (como Quality Engineer)

```bash
curl -X PATCH "http://localhost:8000/dmt/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "is_closed": true,
    "final_disposition_id": 1,
    "failure_code_id": 1,
    "approved_by_id": 2
  }'
```

## Reglas de Negocio

### Creación de DMT Records
- Solo el rol **Inspector** puede crear DMT records
- Campos obligatorios: part_number_id, work_center_id, customer_id, level_id, area_id, defect_description

### Edición de DMT Records
- Si `is_closed = True`, el record no puede ser editado (devuelve error 400)
- Cada rol solo puede editar sus campos permitidos
- Intentar editar campos no permitidos devuelve error 400

### Cierre de DMT Records
- Solo **Quality Engineer** puede cerrar records
- Para cerrar, debe enviar: is_closed=true, final_disposition_id, failure_code_id, approved_by_id
- Una vez cerrado, el record no puede ser editado

## Configuración

### Variables de Entorno

Puedes modificar estas variables en `docker-compose.yml`:

```yaml
DATABASE_URL: "mariadb+mariadbconnector://dmt_user:dmt_user_password@db:3306/dmt_db"
SECRET_KEY: "your-secret-key-change-in-production"
ACCESS_TOKEN_EXPIRE_MINUTES: "30"
```

### Base de Datos

Credenciales de MariaDB (definidas en docker-compose.yml):
- Host: `localhost` (desde fuera) o `db` (desde contenedor)
- Puerto: `3306`
- Database: `dmt_db`
- Usuario: `dmt_user`
- Password: `dmt_user_password`
- Root Password: `root_secret_password`

## Desarrollo

### Instalar dependencias localmente (opcional)

```bash
pip install -r requirements.txt
```

### Ejecutar la API sin Docker (requiere MariaDB corriendo)

```bash
# Configurar DATABASE_URL
export DATABASE_URL="mariadb+mariadbconnector://dmt_user:dmt_user_password@localhost:3306/dmt_db"
export SECRET_KEY="your-secret-key"
export ACCESS_TOKEN_EXPIRE_MINUTES="30"

# Ejecutar
uvicorn main:app --reload
```

## Inicialización de Base de Datos

La base de datos se inicializa automáticamente al arrancar la aplicación gracias a:

```python
@app.on_event("startup")
def on_startup():
    init_db()  # Llama a SQLModel.metadata.create_all(engine)
```

Esto crea todas las tablas definidas en `models.py`.

## Troubleshooting

### Error de conexión a la base de datos

Si la API no puede conectarse a MariaDB, espera unos segundos más para que MariaDB termine de inicializarse, o reinicia el contenedor:

```bash
docker-compose restart api
```

### Ver logs

```bash
# Logs de todos los servicios
docker-compose logs -f

# Logs solo de la API
docker-compose logs -f api

# Logs solo de la DB
docker-compose logs -f db
```

### Reiniciar la base de datos

```bash
# Detener servicios
docker-compose down

# Eliminar volúmenes (CUIDADO: elimina todos los datos)
docker-compose down -v

# Volver a levantar
docker-compose up --build
```

## Seguridad

En producción, asegúrate de:

1. Cambiar `SECRET_KEY` por una clave segura y aleatoria
2. Cambiar las contraseñas de MariaDB
3. Configurar CORS adecuadamente en `main.py`
4. Usar HTTPS
5. Implementar rate limiting
6. Implementar logging y monitoreo

## Licencia

Este proyecto es de uso interno.
