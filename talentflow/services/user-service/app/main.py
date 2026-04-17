from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
import logging

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="TalentFlow User Service — Authentication & User Management",
    docs_url="/docs",
    redoc_url="/redoc",
)


@app.on_event("startup")
def startup():
    # Create tables on startup (skip in test - tests set up their own DB)
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created/verified")
    except Exception as e:
        logger.warning("Could not create tables (may be OK in test): %s", e)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics
Instrumentator().instrument(app).expose(app)

# Routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "user-service", "version": settings.VERSION}
