"""
Main FastAPI application.
Initializes the API, configures middleware, and registers routes.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .routes import router

# Create database tables
# Note: In production, use Alembic for migrations instead
Base.metadata.create_all(bind=engine)

# Initialize FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc",  # ReDoc
)

# Configure CORS (Cross-Origin Resource Sharing)
# Adjust origins in production to only allow your frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production: ["https://yourdomain.com"]
    allow_credentials=True,
    allow_methods=["*"],  # In production: ["GET", "POST", "PUT", "DELETE"]
    allow_headers=["*"],
)

# Register routes
app.include_router(router)


@app.on_event("startup")
async def startup_event():
    """
    Runs when the application starts.
    Good place for initialization tasks.
    """
    print(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"📊 Database: {settings.DATABASE_HOST}:{settings.DATABASE_PORT}/{settings.DATABASE_NAME}")
    print(f"📚 API Documentation: http://{settings.API_HOST}:{settings.API_PORT}/docs")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Runs when the application shuts down.
    Good place for cleanup tasks.
    """
    print(f"👋 Shutting down {settings.APP_NAME}")


@app.get("/")
async def root():
    """
    Root endpoint.
    Returns basic API information.
    """
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": settings.APP_DESCRIPTION,
        "docs": "/docs",
        "redoc": "/redoc"
    }
