from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from config.database import products_collection, newsletter_collection, contact_inquiries_collection
from typing import List
import uuid
from datetime import datetime, timezone

router = APIRouter()


class NewsletterSubscribe(BaseModel):
    email: EmailStr


class ContactInquiry(BaseModel):
    name: str
    email: EmailStr
    message: str


@router.get("/")
async def root():
    return {"message": "ARAR Parfums API"}


@router.get("/fragrances")
async def get_published_fragrances():
    """Get all published fragrances for public view"""
    fragrances = await products_collection.find(
        {"status": "published"},
        {"_id": 0}
    ).to_list(100)
    return fragrances


@router.get("/fragrances/{slug}")
async def get_fragrance_by_slug(slug: str):
    """Get single fragrance by slug"""
    fragrance = await products_collection.find_one(
        {"slug": slug, "status": "published"},
        {"_id": 0}
    )
    if not fragrance:
        raise HTTPException(status_code=404, detail="Fragrance not found")
    return fragrance


@router.post("/newsletter")
async def subscribe_newsletter(data: NewsletterSubscribe):
    """Newsletter subscription"""
    existing = await newsletter_collection.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already subscribed")
    
    subscription = {
        "id": str(uuid.uuid4()),
        "email": data.email,
        "subscribed_at": datetime.now(timezone.utc).isoformat()
    }
    await newsletter_collection.insert_one(subscription)
    return {"message": "Successfully subscribed", "email": data.email}


@router.post("/contact")
async def create_contact_inquiry(data: ContactInquiry):
    """Contact form submission"""
    inquiry = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "email": data.email,
        "message": data.message,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await contact_inquiries_collection.insert_one(inquiry)
    return {"message": "Inquiry received", "id": inquiry["id"]}
