from pydantic import BaseModel, Field, EmailStr, ConfigDict
from datetime import datetime
import uuid


class AdminUserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "admin"
    is_active: bool = True


class AdminUserCreate(AdminUserBase):
    password: str


class AdminUserLogin(BaseModel):
    email: EmailStr
    password: str


class AdminUser(AdminUserBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
