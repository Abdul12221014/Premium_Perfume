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
            "name": "Santal Identity",
            "slug": "santal-identity",
            "description": "A deep, meditative sandalwood with whispers of iris and aged leather. The scent of a quiet, composed library at dusk.",
            "short_description": "Quiet, composed sandalwood.",
            "price_amount": 28500,
            "currency": "USD",
            "stock_quantity": 42,
            "status": "published",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "p2",
            "name": "Oud Monolith",
            "slug": "oud-monolith",
            "description": "Pure Assam oud paired with black pepper and cold ash. A rigid, architectural fragrance that commands absolute attention through silence.",
            "short_description": "Architectural, rigid oud.",
            "price_amount": 34500,
            "currency": "USD",
            "stock_quantity": 18,
            "status": "published",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "p3",
            "name": "Rose Sombre",
            "slug": "rose-sombre",
            "description": "A velvet rose caught in a frost. Notes of cold metallic dew over a base of honeyed shadows.",
            "short_description": "Velvet rose and shadows.",
            "price_amount": 26000,
            "currency": "USD",
            "stock_quantity": 24,
            "status": "published",
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
