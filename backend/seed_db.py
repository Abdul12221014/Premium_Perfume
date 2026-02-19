import motor.motor_asyncio
import os
import asyncio
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

async def seed():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'arar_parfums')
    print(f"Seeding Database: {db_name}")
    
    client = motor.motor_asyncio.AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    products = [
        {
            "id": "p1",
            "name": "ECLIPSE NOIR",
            "slug": "eclipse-noir",
            "description": "A shadow caught in amber. The scent of dusk in an ancient library. Deep notes of blackened oud and smoked vanilla.",
            "short_description": "A shadow caught in amber.",
            "price": "$380",
            "stock_quantity": 42,
            "status": "published",
            "identity": "The absence of light is not the absence of presence. Eclipse Noir is a composition that existence in the shadows, revealing itself only to those who dwell within them.",
            "notes_top": ["Blackened Oud", "Saffron"],
            "notes_heart": ["Cold Ash", "Incense"],
            "notes_base": ["Smoked Vanilla", "Amber", "Leather"],
            "ritual": "Apply to pulse points in the evening. Allow the warmth of the skin to unlock the hidden depths of the amber.",
            "craft": "Aged for 24 months in charred oak barrels to achieve the signature depth and smoky profile.",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "p2",
            "name": "SILENT VOW",
            "slug": "silent-vow",
            "description": "A promise whispered in a cathedral. Incense and cold stone. A meditative blend of frankincense and white musk.",
            "short_description": "A promise whispered in a cathedral.",
            "price": "$420",
            "stock_quantity": 18,
            "status": "published",
            "identity": "A vow taken in silence is a vow that remains unbroken. Silent Vow captures the sacred atmosphere of a quiet cathedral at dawn.",
            "notes_top": ["Bergamot", "Cold Stone Accord"],
            "notes_heart": ["Frankincense", "Dried Herbs"],
            "notes_base": ["White Musk", "Cedarwood", "Myrrh"],
            "ritual": "Mist into the air and walk through. Let the scent settle as a quiet layer of armor.",
            "craft": "The Frankincense is sourced from the Dhofar region during the final harvest of the season for maximum purity.",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "p3",
            "name": "IRON & SILK",
            "slug": "iron-silk",
            "description": "The contrast of power and grace. Cold metal against warm skin. Saffron and metallic violet leaf over a base of raw silk.",
            "short_description": "The contrast of power and grace.",
            "price": "$450",
            "stock_quantity": 24,
            "status": "published",
            "identity": "Strength is not purely structural. Iron & Silk explores the duality of the modern experience: the rigid architecture of the world against the softness of the soul.",
            "notes_top": ["Metallic Violet Leaf", "Saffron"],
            "notes_heart": ["Raw Silk", "Iris"],
            "notes_base": ["Cold Iron Accord", "Sandalwood", "Ambergris"],
            "ritual": "Apply to the neck and wrists. The fragrance evolves from metallic sharpness to an intimate silk softness.",
            "craft": "The metallic accord is a proprietary distillation process that captures the scent of cold steel without synthetic sharpness.",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    try:
        # Clear existing
        await db.products.delete_many({})
        # Insert new
        result = await db.products.insert_many(products)
        print(f"Successfully seeded {len(result.inserted_ids)} products.")
    except Exception as e:
        print(f"Error seeding: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed())
