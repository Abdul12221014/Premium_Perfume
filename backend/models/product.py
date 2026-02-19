from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
import uuid


class ProductBase(BaseModel):
    name: str
    slug: str
    short_description: str
    long_description: str
    price: str
    price_amount: int
    currency: str = "USD"
    stock_quantity: int = 0
    is_limited: bool = False
    batch_number: Optional[str] = None
    status: str = "published"
    hero_image_url: str
    gallery_images: List[str] = []
    notes_top: List[str] = []
    notes_heart: List[str] = []
    notes_base: List[str] = []
    identity: str = ""
    ritual: str = ""
    craft: str = ""
    collection_id: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    price: Optional[str] = None
    price_amount: Optional[int] = None
    currency: Optional[str] = None
    stock_quantity: Optional[int] = None
    is_limited: Optional[bool] = None
    batch_number: Optional[str] = None
    status: Optional[str] = None
    hero_image_url: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    notes_top: Optional[List[str]] = None
    notes_heart: Optional[List[str]] = None
    notes_base: Optional[List[str]] = None
    identity: Optional[str] = None
    ritual: Optional[str] = None
    craft: Optional[str] = None
    collection_id: Optional[str] = None


class Product(ProductBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
