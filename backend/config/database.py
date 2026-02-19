from motor.motor_asyncio import AsyncIOMotorClient
import os

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'test_database')

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Collections
products_collection = db.products
collections_collection = db.collections
orders_collection = db.orders
admin_users_collection = db.admin_users
newsletter_collection = db.newsletter
contact_inquiries_collection = db.contact_inquiries


async def get_database():
    return db
