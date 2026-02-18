from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import stripe


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', 'sk_test_51QY9xTRscTfWlEm8hC9VDhjwFU4aKSHzCl9zpqHNuY8gGzMMloPaD8RxIaB5GQ4FxPm8jREVm2pIE5bBJG3KEDJz00QL3Hxnxi')

app = FastAPI()
api_router = APIRouter(prefix="/api")


class NewsletterSubscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    subscribed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class NewsletterSubscriptionCreate(BaseModel):
    email: EmailStr


class ContactInquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ContactInquiryCreate(BaseModel):
    name: str
    email: EmailStr
    message: str


class Fragrance(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    slug: str
    description: str
    price: str
    price_amount: int
    notes_top: List[str]
    notes_heart: List[str]
    notes_base: List[str]
    identity: str
    ritual: str
    craft: str
    image_url: str
    batch_number: Optional[str] = None


class CheckoutSessionCreate(BaseModel):
    fragrance_slug: str


@api_router.get("/")
async def root():
    return {"message": "ARAR Parfums API"}


@api_router.post("/newsletter", response_model=NewsletterSubscription)
async def subscribe_newsletter(input: NewsletterSubscriptionCreate):
    existing = await db.newsletter.find_one({"email": input.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already subscribed")
    
    subscription = NewsletterSubscription(email=input.email)
    doc = subscription.model_dump()
    doc['subscribed_at'] = doc['subscribed_at'].isoformat()
    
    await db.newsletter.insert_one(doc)
    return subscription


@api_router.post("/contact", response_model=ContactInquiry)
async def create_contact_inquiry(input: ContactInquiryCreate):
    inquiry = ContactInquiry(**input.model_dump())
    doc = inquiry.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.contact_inquiries.insert_one(doc)
    return inquiry


@api_router.get("/fragrances", response_model=List[Fragrance])
async def get_fragrances():
    fragrances = await db.fragrances.find({}, {"_id": 0}).to_list(100)
    if not fragrances:
        return await seed_fragrances()
    return fragrances


@api_router.get("/fragrances/{slug}", response_model=Fragrance)
async def get_fragrance_by_slug(slug: str):
    fragrance = await db.fragrances.find_one({"slug": slug}, {"_id": 0})
    if not fragrance:
        raise HTTPException(status_code=404, detail="Fragrance not found")
    return fragrance


async def seed_fragrances():
    fragrances_data = [
        {
            "id": "eclipse-noir",
            "name": "ECLIPSE NOIR",
            "slug": "eclipse-noir",
            "description": "A shadow caught in amber. The scent of dusk in an ancient library.",
            "price": "$380",
            "notes_top": ["Black Truffle", "Bergamot", "Pink Pepper"],
            "notes_heart": ["Oud", "Leather Accord", "Iris Root"],
            "notes_base": ["Vintage Leather", "Amber", "Sandalwood"],
            "identity": "For those who find power in restraint. Eclipse Noir is the quiet confidence of twilight—neither day nor night, but the liminal space where decisions are made and legacies begin.",
            "ritual": "Apply to pulse points at dusk. Allow the warmth of skin to awaken the truffle and leather. This is not a fragrance for morning meetings—it is for evenings that matter.",
            "craft": "Aged for 18 months in French oak casks. The oud is sustainably sourced from Assam, India, where trees are cultivated for 50 years before harvest. Each batch is numbered and limited to 500 bottles worldwide.",
            "image_url": "https://images.unsplash.com/photo-1701056035604-6a7dd0efa0d7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBkYXJrJTIwcGVyZnVtZSUyMGJvdHRsZSUyMGNpbmVtYXRpYyUyMGxpZ2h0aW5nJTIwbWluaW1hbCUyMGJsYWNrJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3NzE0NTUwMjl8MA&ixlib=rb-4.1.0&q=85",
            "batch_number": "Batch 04/2024"
        },
        {
            "id": "silent-vow",
            "name": "SILENT VOW",
            "slug": "silent-vow",
            "description": "A promise whispered in a cathedral. Incense and cold stone.",
            "price": "$420",
            "notes_top": ["Frankincense", "Cardamom", "Elemi"],
            "notes_heart": ["Myrrh", "White Lily", "Cistus Absolute"],
            "notes_base": ["Stone Accord", "Vetiver", "Cashmere Musk"],
            "identity": "For seekers and believers. Silent Vow is devotion distilled—the sacred made intimate. It speaks to those who understand that the most profound commitments are never announced.",
            "ritual": "Best worn in moments of solitude or significance. Apply to the nape of the neck and inner wrists. Let it settle for ten minutes before entering the world.",
            "craft": "Our frankincense is hand-harvested from Dhofar, Oman, where resin tappers have practiced their craft for generations. The white lily is a rare absolue from Grasse, extracted using traditional enfleurage methods.",
            "image_url": "https://images.unsplash.com/photo-1725139695447-f75e1b482708?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBkYXJrJTIwcGVyZnVtZSUyMGJvdHRsZSUyMGNpbmVtYXRpYyUyMGxpZ2h0aW5nJTIwbWluaW1hbCUyMGJsYWNrJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3NzE0NTUwMjl8MA&ixlib=rb-4.1.0&q=85",
            "batch_number": "Batch 03/2024"
        },
        {
            "id": "iron-silk",
            "name": "IRON & SILK",
            "slug": "iron-silk",
            "description": "The contrast of power and grace. Cold metal against warm skin.",
            "price": "$450",
            "notes_top": ["Metallic Aldehydes", "Blood Orange", "Violet Leaf"],
            "notes_heart": ["Damascus Rose", "Saffron", "Cashmeran"],
            "notes_base": ["Civet", "Patchouli", "Metallic Musk"],
            "identity": "For those who wield influence without force. Iron & Silk is the duality of strength and elegance—a boardroom and a ballroom, a sword and a sonnet.",
            "ritual": "Layer over bare skin after a shower. The aldehydes bloom against warmth. Reapply to clothing for a cooler, more austere presence.",
            "craft": "The rose otto is distilled from Damascus roses grown in the Valley of Roses, Bulgaria. Harvested at dawn, 60,000 petals yield just 30ml of pure essence. Our civet is a modern synthetic accord, ethical and nuanced.",
            "image_url": "https://images.unsplash.com/photo-1698793916137-30f994d15133?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBkYXJrJTIwcGVyZnVtZSUyMGJvdHRsZSUyMGNpbmVtYXRpYyUyMGxpZ2h0aW5nJTIwbWluaW1hbCUyMGJsYWNrJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3NzE0NTUwMjl8MA&ixlib=rb-4.1.0&q=85",
            "batch_number": "Batch 05/2024"
        },
        {
            "id": "velvet-ash",
            "name": "VELVET ASH",
            "slug": "velvet-ash",
            "description": "The memory of a fire long extinguished. Comforting and ghostly.",
            "price": "$390",
            "notes_top": ["Cade Oil", "Clary Sage", "Neroli"],
            "notes_heart": ["Burnt Cedar", "Tobacco Absolute", "Lavender"],
            "notes_base": ["Vanilla Absolute", "Grey Musk", "Tonka Bean"],
            "identity": "For wanderers and homecomers. Velvet Ash is the scent of a library after midnight, a cabin in winter, the embrace of familiarity tinged with melancholy.",
            "ritual": "Spray into the air and walk through the mist. This fragrance is meant to surround, not project. Best worn at home, in transit, or in moments of reflection.",
            "craft": "The cedar is sourced from Atlas Mountain forests in Morocco, charred lightly to release its smoky depth. Our vanilla is from Madagascar, aged in bourbon barrels for 24 months.",
            "image_url": "https://images.pexels.com/photos/11122042/pexels-photo-11122042.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "batch_number": "Batch 02/2024"
        },
        {
            "id": "midnight-sovereign",
            "name": "MIDNIGHT SOVEREIGN",
            "slug": "midnight-sovereign",
            "description": "Rule without speaking. A dark crown of spices.",
            "price": "$480",
            "notes_top": ["Saffron", "Black Pepper", "Juniper Berry"],
            "notes_heart": ["Agarwood", "Turkish Rose", "Clove"],
            "notes_base": ["Royal Amber", "Labdanum", "Frankincense"],
            "identity": "For leaders and iconoclasts. Midnight Sovereign is authority without arrogance—a presence that commands respect simply by existing. It does not announce. It reigns.",
            "ritual": "Apply sparingly to the chest and back of the neck. One spray is sufficient. This is a fragrance of restraint—excess dilutes power.",
            "craft": "The saffron is hand-picked from Kashmir, where each stigma is worth more than gold by weight. Our amber accord is a closely guarded house secret, blending resins aged for five years.",
            "image_url": "https://images.unsplash.com/photo-1701056035604-6a7dd0efa0d7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBkYXJrJTIwcGVyZnVtZSUyMGJvdHRsZSUyMGNpbmVtYXRpYyUyMGxpZ2h0aW5nJTIwbWluaW1hbCUyMGJsYWNrJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3NzE0NTUwMjl8MA&ixlib=rb-4.1.0&q=85",
            "batch_number": "Batch 06/2024"
        }
    ]
    
    await db.fragrances.insert_many(fragrances_data)
    return fragrances_data


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
