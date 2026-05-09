from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from dotenv import load_dotenv
from pathlib import Path
import os
import logging

from config.limiter import limiter

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from utils.env_validator import validate_env
validate_env()

ENV_MODE = os.environ.get("ENVIRONMENT", "development").lower()
IS_PRODUCTION = ENV_MODE == "production"

log_level = logging.INFO if IS_PRODUCTION else logging.DEBUG
logging.basicConfig(
    level=log_level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("ARAR Perfume API starting up...")

    from config.database import initialize_database
    await initialize_database()

    from config.database import admin_users_collection
    from services.auth_service import get_password_hash

    seed_email = os.environ.get("ADMIN_EMAIL", "admin@arar-perfume.com")
    seed_password = os.environ.get("ADMIN_PASSWORD", "ArarAdmin2024!")
    seed_name = os.environ.get("ADMIN_NAME", "ARAR Admin")

    existing_admin = await admin_users_collection.find_one({"email": seed_email})
    if not existing_admin:
        default_admin = {
            "id": "default-admin",
            "email": seed_email,
            "full_name": seed_name,
            "role": "admin",
            "is_active": True,
            "hashed_password": get_password_hash(seed_password),
            "created_at": None
        }
        await admin_users_collection.insert_one(default_admin)
        logger.info("Admin user seeded: %s", seed_email)

    yield

    from config.database import client
    client.close()
    logger.info("ARAR Parfums API shutting down...")


app = FastAPI(
    # slowapi state attached here — must be before middleware registration
    title="ARAR Perfume API",
    version="2.0.0",
    redirect_slashes=False,
    debug=not IS_PRODUCTION,
    # Disable interactive API docs in production — prevents endpoint enumeration
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
cors_origin = os.environ.get('CORS_ORIGIN', os.environ.get('CORS_ORIGINS', ''))
if IS_PRODUCTION and not cors_origin:
    raise RuntimeError("CORS_ORIGIN must be set in production mode.")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[o.strip() for o in cors_origin.split(',')] if cors_origin else ["*"],
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds OWASP-recommended security headers to every response."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "0"  # Modern browsers use CSP instead
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        if IS_PRODUCTION:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        # Remove server fingerprint
        try:
            del response.headers["server"]
        except KeyError:
            pass
        return response


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(SlowAPIMiddleware)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception: %s", type(exc).__name__, exc_info=not IS_PRODUCTION)
    if IS_PRODUCTION:
        return Response(
            content='{"detail": "Internal Server Error"}',
            status_code=500,
            media_type="application/json"
        )
    from fastapi.exception_handlers import http_exception_handler
    if isinstance(exc, HTTPException):
        return await http_exception_handler(request, exc)
    raise exc


from routes import admin_routes, product_routes, collection_routes, order_routes, public_routes, checkout_routes, media_routes

app.include_router(public_routes.router, prefix="/api", tags=["Public"])
app.include_router(checkout_routes.router, prefix="/api", tags=["Checkout"])
app.include_router(admin_routes.router, prefix="/api/admin", tags=["Admin"])
app.include_router(product_routes.router, prefix="/api/admin/products", tags=["Products"])
app.include_router(collection_routes.router, prefix="/api/admin/collections", tags=["Collections"])
app.include_router(order_routes.router, prefix="/api/admin/orders", tags=["Orders"])
app.include_router(media_routes.router, prefix="/api/media", tags=["Media"])


@app.get("/")
async def root():
    return {"message": "ARAR Perfume API v2.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "2.0.0"}


@app.get("/api/health")
async def api_health_check():
    return {"status": "healthy", "version": "2.0.0", "service": "arar-perfume"}
