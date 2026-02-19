from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime
import uuid


class OrderBase(BaseModel):
    stripe_session_id: str
    product_id: str
    customer_email: EmailStr
    amount: int
    currency: str = "USD"
    status: str = "pending"


class OrderCreate(OrderBase):
    pass


class Order(OrderBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
