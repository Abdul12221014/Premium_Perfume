from fastapi import FastAPI, APIRouter, HTTPException, Depends, status as http_status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import os
import logging

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create FastAPI app
app = FastAPI(title="ARAR Parfums API", version="2.0.0")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import routes
from routes import admin_routes, product_routes, collection_routes, order_routes, checkout_routes, public_routes

# Include routers
app.include_router(public_routes.router, prefix="/api", tags=["Public"])
app.include_router(admin_routes.router, prefix="/api/admin", tags=["Admin"])
app.include_router(product_routes.router, prefix="/api/admin/products", tags=["Products"])
app.include_router(collection_routes.router, prefix="/api/admin/collections", tags=["Collections"])
app.include_router(order_routes.router, prefix="/api/admin/orders", tags=["Orders"])
app.include_router(checkout_routes.router, prefix="/api", tags=["Checkout"])


@app.on_event("startup")
async def startup_event():
    logger.info("ARAR Parfums API starting up...")
    # Create default admin user if doesn't exist
    from config.database import admin_users_collection
    from services.auth_service import get_password_hash
    
    existing_admin = await admin_users_collection.find_one({"email": "admin@arar-parfums.com"})
    if not existing_admin:
        default_admin = {
            "id": "default-admin",
            "email": "admin@arar-parfums.com",
            "full_name": "ARAR Admin",
            "role": "admin",
            "is_active": True,
            "hashed_password": get_password_hash("ArarAdmin2024!"),
            "created_at": None
        }
        await admin_users_collection.insert_one(default_admin)
        logger.info("Default admin user created: admin@arar-parfums.com / ArarAdmin2024!")


@app.on_event("shutdown")
async def shutdown_event():
    from config.database import client
    client.close()
    logger.info("ARAR Parfums API shutting down...")


@app.get("/")
async def root():
    return {"message": "ARAR Parfums API v2.0 - Dynamic Platform"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "2.0.0"}
