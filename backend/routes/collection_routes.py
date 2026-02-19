from fastapi import APIRouter, HTTPException, Depends
from models.collection import CollectionCreate, CollectionUpdate
from middleware.auth_middleware import get_current_admin
from config.database import collections_collection
from datetime import datetime
import uuid

router = APIRouter()


@router.get("/")
async def get_all_collections(current_admin: dict = Depends(get_current_admin)):
    """Get all collections"""
    collections = await collections_collection.find({}, {"_id": 0}).to_list(100)
    return collections


@router.post("/")
async def create_collection(
    collection: CollectionCreate,
    current_admin: dict = Depends(get_current_admin)
):
    """Create new collection"""
    collection_dict = collection.model_dump()
    collection_dict["id"] = str(uuid.uuid4())
    collection_dict["created_at"] = datetime.utcnow().isoformat()
    
    await collections_collection.insert_one(collection_dict)
    return {"message": "Collection created successfully", "id": collection_dict["id"]}


@router.put("/{collection_id}")
async def update_collection(
    collection_id: str,
    collection_update: CollectionUpdate,
    current_admin: dict = Depends(get_current_admin)
):
    """Update collection"""
    update_data = {k: v for k, v in collection_update.model_dump().items() if v is not None}
    
    result = await collections_collection.update_one(
        {"id": collection_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    return {"message": "Collection updated successfully"}


@router.delete("/{collection_id}")
async def delete_collection(
    collection_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    """Delete collection"""
    result = await collections_collection.delete_one({"id": collection_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Collection not found")
    return {"message": "Collection deleted successfully"}
