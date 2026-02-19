from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid


class OrderBase(BaseModel):
    stripe_session_id: str
    stripe_payment_intent: Optional[str] = None
    product_id: str
    product_slug: Optional[str] = None
    customer_email: str = ""
    amount: int
    currency: str = "USD"
    status: str = "pending"


class OrderCreate(OrderBase):
    pass


class Order(OrderBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: Optional[str] = None
