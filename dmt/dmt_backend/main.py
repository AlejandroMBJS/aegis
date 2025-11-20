from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import router_auth, router_entities, router_dmt, router_users

# Define the lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handle application startup and shutdown events.
    
    Code before 'yield' runs on startup.
    Code after 'yield' runs on shutdown.
    """
    # Startup logic
    print("Initializing database...")
    init_db()
    
    yield # Application starts serving requests

    # Shutdown logic (if any)
    print("Application shutting down...")


app = FastAPI(
    title="DMT Backend API",
    description="Backend para gestión de DMT Records con FastAPI + SQLModel + MariaDB",
    version="1.0.0",
    lifespan=lifespan # Pass the lifespan function here
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(router_auth.router)
app.include_router(router_entities.router)
app.include_router(router_dmt.router)
app.include_router(router_users.router)


@app.get("/")
def root():
    """
    Endpoint raíz de la API
    """
    return {
        "message": "DMT Backend API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }


@app.get("/health")
def health_check():
    """
    Endpoint de health check
    """
    return {"status": "healthy"}