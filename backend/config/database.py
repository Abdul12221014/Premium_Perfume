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


async def initialize_database():
    """
    Initializes the database by creating necessary indexes.
    """
    # Products indexes
    await products_collection.create_index("id", unique=True)
    await products_collection.create_index("slug", unique=True)
    
    # Orders indexes
    await orders_collection.create_index("id", unique=True)
    await orders_collection.create_index("session_id", unique=True)
    await orders_collection.create_index("created_at")
    
    # Newsletter unique index
    await newsletter_collection.create_index("email", unique=True)
    
    print("Database initialization complete: Indexes created.")


async def get_database():
    return db
