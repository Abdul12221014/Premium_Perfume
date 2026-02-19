from fastapi import APIRouter, HTTPException, Depends, status
from models.admin import AdminUserCreate, AdminUserLogin, Token, AdminUser
from services.auth_service import verify_password, create_access_token, get_password_hash
from middleware.auth_middleware import get_current_admin
from config.database import admin_users_collection
from datetime import timedelta
import uuid

router = APIRouter()


@router.post("/register", response_model=dict)
async def register_admin(user: AdminUserCreate, current_admin: dict = Depends(get_current_admin)):
    """Register new admin (protected - only existing admins can create new ones)"""
    existing = await admin_users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    admin_dict = user.model_dump()
    admin_dict["id"] = str(uuid.uuid4())
    admin_dict["hashed_password"] = get_password_hash(admin_dict.pop("password"))
    admin_dict["created_at"] = None
    
    await admin_users_collection.insert_one(admin_dict)
    return {"message": "Admin user created successfully", "email": user.email}


@router.post("/login", response_model=Token)
async def login_admin(credentials: AdminUserLogin):
    """Admin login"""
    admin = await admin_users_collection.find_one({"email": credentials.email}, {"_id": 0})
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not verify_password(credentials.password, admin["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not admin.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    access_token = create_access_token(
        data={"sub": admin["email"]},
        expires_delta=timedelta(hours=24)
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
async def get_current_admin_info(current_admin: dict = Depends(get_current_admin)):
    """Get current admin user info"""
    return {
        "email": current_admin["email"],
        "full_name": current_admin["full_name"],
        "role": current_admin["role"]
    }
