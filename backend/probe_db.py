import motor.motor_asyncio
import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

async def check():
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    print(f"Connecting to: {mongo_url}, Database: {db_name}")
    
    client = motor.motor_asyncio.AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        count = await db.products.count_documents({})
        print(f'Product count: {count}')
        
        fragrances = await db.products.find({}).to_list(10)
        print(f'Fragrances found: {len(fragrances)}')
        for f in fragrances:
            print(f" - {f.get('name')} (Status: {f.get('status')}, Slug: {f.get('slug')})")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(check())
