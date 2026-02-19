from fastapi import APIRouter, HTTPException, Depends
from middleware.auth_middleware import get_current_admin
from config.database import orders_collection
from typing import Optional

router = APIRouter()


@router.get("")
async def get_all_orders(
    status: Optional[str] = None,
    current_admin: dict = Depends(get_current_admin)
):
    """Get all orders with optional status filter"""
    query = {}
    if status:
        query["status"] = status
    
    orders = await orders_collection.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders


@router.get("/{order_id}")
async def get_order(order_id: str, current_admin: dict = Depends(get_current_admin)):
    """Get single order"""
    order = await orders_collection.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: str,
    status: str,
    current_admin: dict = Depends(get_current_admin)
):
    """Update order status"""
    valid_statuses = ["pending", "paid", "shipped", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    result = await orders_collection.update_one(
        {"id": order_id},
        {"$set": {"status": status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order status updated successfully", "status": status}
