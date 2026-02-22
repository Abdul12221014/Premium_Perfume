from fastapi import FastAPI, APIRouter, HTTPException, Depends, status as http_status
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from dotenv import load_dotenv
from pathlib import Path
import os
import logging

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Validate environment variables immediately
from utils.env_validator import validate_env
validate_env()

# Determine if we are in production
ENV_MODE = os.environ.get("ENVIRONMENT", "development").lower()
IS_PRODUCTION = ENV_MODE == "production"

# Create FastAPI app with hardened settings
app = FastAPI(
    title="ARAR Perfume API",
    version="2.0.0",
    redirect_slashes=False,
    debug=not IS_PRODUCTION
)

# CORS Middleware - Strict Origin Enforcement
cors_origin = os.environ.get('CORS_ORIGIN', os.environ.get('CORS_ORIGINS', ''))
if IS_PRODUCTION and not cors_origin:
    # This should be caught by validator, but as a secondary guard:
    raise RuntimeError("CORS_ORIGIN must be set in production mode.")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[o.strip() for o in cors_origin.split(',')] if cors_origin else ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
log_level = logging.INFO if IS_PRODUCTION else logging.DEBUG
logging.basicConfig(
    level=log_level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global Exception Handler to prevent exposing stack traces in production
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=not IS_PRODUCTION)
    if IS_PRODUCTION:
        return Response(
            content='{"detail": "Internal Server Error"}',
            status_code=500,
            media_type="application/json"
        )
    # In development, let FastAPI handle it with a traceback
    from fastapi.exception_handlers import http_exception_handler
    if isinstance(exc, HTTPException):
        return await http_exception_handler(request, exc)
    raise exc

# Import routes
from routes import admin_routes, product_routes, collection_routes, order_routes, public_routes, checkout_routes, media_routes

# Include routers
app.include_router(public_routes.router, prefix="/api", tags=["Public"])
app.include_router(checkout_routes.router, prefix="/api", tags=["Checkout"])
app.include_router(admin_routes.router, prefix="/api/admin", tags=["Admin"])
app.include_router(product_routes.router, prefix="/api/admin/products", tags=["Products"])
app.include_router(collection_routes.router, prefix="/api/admin/collections", tags=["Collections"])
app.include_router(order_routes.router, prefix="/api/admin/orders", tags=["Orders"])
app.include_router(media_routes.router, prefix="/api/media", tags=["Media"])


@app.on_event("startup")
async def startup_event():
    logger.info("ARAR Perfume API starting up...")
    # Database initialization
    from config.database import initialize_database
    await initialize_database()
    
    # Create default admin user if doesn't exist (only in non-production)
    if not IS_PRODUCTION:
        from config.database import admin_users_collection
        from services.auth_service import get_password_hash
        
        existing_admin = await admin_users_collection.find_one({"email": "admin@arar-perfume.com"})
        if not existing_admin:
            default_admin = {
                "id": "default-admin",
                "email": "admin@arar-perfume.com",
                "full_name": "ARAR Admin",
                "role": "admin",
                "is_active": True,
                "hashed_password": get_password_hash("ArarAdmin2024!"),
                "created_at": None
            }
            await admin_users_collection.insert_one(default_admin)
            logger.info("Default admin user created: admin@arar-perfume.com / ArarAdmin2024!")
    else:
        logger.info("Production mode: Default admin seeding disabled.")


@app.on_event("shutdown")
async def shutdown_event():
    from config.database import client
    client.close()
    logger.info("ARAR Parfums API shutting down...")


@app.get("/")
async def root():
    return {"message": "ARAR Perfume API v2.0 - Dynamic Platform"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "2.0.0"}


@app.get("/api/health")
async def api_health_check():
    """Health check endpoint under /api prefix for Kubernetes routing."""
    return {"status": "healthy", "version": "2.0.0", "service": "arar-perfume"}
