from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.auth_service import verify_token
from config.database import admin_users_collection

security = HTTPBearer()


async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    token_data = verify_token(token)
    
    admin = await admin_users_collection.find_one(
        {"email": token_data["email"]},
        {"_id": 0}
    )
    
    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin not found"
        )
    
    if not admin.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive admin account"
        )
    
    return admin
