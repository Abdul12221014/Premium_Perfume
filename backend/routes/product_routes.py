from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from models.product import ProductCreate, ProductUpdate, Product
from middleware.auth_middleware import get_current_admin
from config.database import products_collection
from datetime import datetime
import uuid

router = APIRouter()

class StockUpdatePayload(BaseModel):
    stock_quantity: int

class StatusUpdatePayload(BaseModel):
    status: str


@router.get("")
async def get_all_products(current_admin: dict = Depends(get_current_admin)):
    """Get all products (including drafts) for admin"""
    products = await products_collection.find({}, {"_id": 0}).to_list(1000)
    return products


@router.post("", response_model=dict)
async def create_product(product: ProductCreate, current_admin: dict = Depends(get_current_admin)):
    """Create new product"""
    # Check if slug exists
    existing = await products_collection.find_one({"slug": product.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Product with this slug already exists")
    
    product_dict = product.model_dump()
    product_dict["id"] = str(uuid.uuid4())
    product_dict["created_at"] = datetime.utcnow().isoformat()
    product_dict["updated_at"] = datetime.utcnow().isoformat()
    
    await products_collection.insert_one(product_dict)
    return {"message": "Product created successfully", "id": product_dict["id"], "slug": product.slug}


@router.get("/{product_id}")
async def get_product(product_id: str, current_admin: dict = Depends(get_current_admin)):
    """Get single product by ID"""
    product = await products_collection.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}")
async def update_product(
    product_id: str,
    product_update: ProductUpdate,
    current_admin: dict = Depends(get_current_admin)
):
    """Update product"""
    existing_product = await products_collection.find_one({"id": product_id})
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # If slug is being updated, check it doesn't conflict
    if product_update.slug and product_update.slug != existing_product.get("slug"):
        slug_exists = await products_collection.find_one({"slug": product_update.slug})
        if slug_exists:
            raise HTTPException(status_code=400, detail="Slug already in use")
    
    update_data = {k: v for k, v in product_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    await products_collection.update_one(
        {"id": product_id},
        {"$set": update_data}
    )
    
    return {"message": "Product updated successfully", "id": product_id}


@router.delete("/{product_id}")
async def delete_product(product_id: str, current_admin: dict = Depends(get_current_admin)):
    """Delete product"""
    result = await products_collection.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}


@router.patch("/{product_id}/stock")
async def update_stock(
    product_id: str,
    payload: StockUpdatePayload,
    current_admin: dict = Depends(get_current_admin)
):
    """Update product stock"""
    result = await products_collection.update_one(
        {"id": product_id},
        {"$set": {"stock_quantity": payload.stock_quantity, "updated_at": datetime.utcnow().isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Stock updated successfully", "stock_quantity": payload.stock_quantity}


@router.patch("/{product_id}/status")
async def update_status(
    product_id: str,
    payload: StatusUpdatePayload,
    current_admin: dict = Depends(get_current_admin)
):
    """Update product status (published/draft/archived)"""
    if payload.status not in ["published", "draft", "archived"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await products_collection.update_one(
        {"id": product_id},
        {"$set": {"status": payload.status, "updated_at": datetime.utcnow().isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Status updated successfully", "status": payload.status}
