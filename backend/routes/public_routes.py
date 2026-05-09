from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from config.database import products_collection, newsletter_collection, contact_inquiries_collection
from config.limiter import limiter
from typing import List
import uuid
from datetime import datetime, timezone

router = APIRouter()


class NewsletterSubscribe(BaseModel):
    email: EmailStr


class ContactInquiry(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=1, max_length=4000)


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
    if not slug or len(slug) > 200:
        raise HTTPException(status_code=400, detail="Invalid slug")

    fragrance = await products_collection.find_one(
        {"slug": slug, "status": "published"},
        {"_id": 0}
    )
    if not fragrance:
        raise HTTPException(status_code=404, detail="Fragrance not found")
    return fragrance


@router.post("/newsletter")
@limiter.limit("3/minute")
async def subscribe_newsletter(request: Request, data: NewsletterSubscribe):
    """Newsletter subscription — rate limited to 3 per minute per IP"""
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
@limiter.limit("5/minute")
async def create_contact_inquiry(request: Request, data: ContactInquiry):
    """Contact form submission — rate limited to 5 per minute per IP"""
    inquiry = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "email": data.email,
        "message": data.message,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await contact_inquiries_collection.insert_one(inquiry)
    return {"message": "Inquiry received", "id": inquiry["id"]}
