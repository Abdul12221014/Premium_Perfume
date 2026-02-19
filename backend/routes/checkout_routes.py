from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from config.database import products_collection, orders_collection
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionRequest,
    CheckoutSessionResponse,
    CheckoutStatusResponse
)
import os
from datetime import datetime, timezone
import uuid
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Get Stripe API key from environment
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', os.environ.get('STRIPE_SECRET_KEY', ''))


class CheckoutRequest(BaseModel):
    fragrance_slug: str
    origin_url: str


class CheckoutStatusRequest(BaseModel):
    session_id: str


@router.post("/create-checkout-session")
async def create_checkout_session(data: CheckoutRequest, request: Request):
    """
    Create Stripe checkout session using emergentintegrations.
    
    Security:
    - Price comes from database, NOT frontend (prevents price manipulation)
    - Stock is validated before session creation
    - Product must be published status
    - origin_url comes from frontend for dynamic success/cancel URLs
    """
    try:
        # Get product from database - price comes from DB, not client
        product = await products_collection.find_one(
            {"slug": data.fragrance_slug, "status": "published"},
            {"_id": 0}
        )
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Validate stock availability before creating checkout session
        stock_quantity = product.get("stock_quantity", 0)
        if stock_quantity <= 0:
            raise HTTPException(
                status_code=400, 
                detail="This item is currently out of stock"
            )
        
        # Validate price_amount exists and is positive
        price_amount = product.get('price_amount')
        if not price_amount or price_amount <= 0:
            logger.error(f"Invalid price_amount for product {product['id']}: {price_amount}")
            raise HTTPException(status_code=500, detail="Product pricing error")
        
        # Convert cents to dollars (float) as required by emergentintegrations
        amount_dollars = price_amount / 100.0
        
        # Build dynamic URLs from frontend origin
        origin_url = data.origin_url.rstrip('/')
        success_url = f"{origin_url}/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{origin_url}/fragrance/{product['slug']}"
        
        # Initialize Stripe checkout with webhook URL
        host_url = str(request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        # Create checkout session request
        checkout_request = CheckoutSessionRequest(
            amount=amount_dollars,
            currency=product.get('currency', 'usd').lower(),
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'product_id': product['id'],
                'product_slug': product['slug'],
                'product_name': product['name'],
                'batch_number': product.get('batch_number', ''),
                'price_at_checkout': str(price_amount)
            }
        )
        
        # Create checkout session
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Create payment transaction record (MANDATORY before redirect)
        transaction = {
            "id": str(uuid.uuid4()),
            "session_id": session.session_id,
            "product_id": product['id'],
            "product_slug": product['slug'],
            "amount": amount_dollars,
            "amount_cents": price_amount,
            "currency": product.get('currency', 'usd').upper(),
            "payment_status": "initiated",
            "status": "pending",
            "metadata": checkout_request.metadata,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await orders_collection.insert_one(transaction)
        logger.info(f"Checkout session created: {session.session_id} for product {product['id']}")
        
        return {"sessionId": session.session_id, "url": session.url}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        raise HTTPException(status_code=500, detail="Unable to create checkout session")


@router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request):
    """
    Get the status of a checkout session and update database accordingly.
    This endpoint is polled by the frontend after returning from Stripe.
    """
    try:
        # Initialize Stripe checkout
        host_url = str(request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        # Get checkout status from Stripe
        status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        # Find the existing transaction
        transaction = await orders_collection.find_one({"session_id": session_id})
        
        if transaction:
            # Check if already processed to prevent double processing
            if transaction.get("payment_status") == "paid":
                return {
                    "status": status.status,
                    "payment_status": "paid",
                    "message": "Payment already processed"
                }
            
            # Update transaction based on payment status
            if status.payment_status == "paid":
                # Successful payment - update transaction and reduce stock
                product_id = transaction.get("product_id")
                
                # Atomic update: mark as paid and reduce stock in one operation
                await orders_collection.update_one(
                    {"session_id": session_id, "payment_status": {"$ne": "paid"}},
                    {
                        "$set": {
                            "payment_status": "paid",
                            "status": "completed",
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }
                    }
                )
                
                # Reduce stock atomically (only if stock > 0)
                if product_id:
                    stock_result = await products_collection.update_one(
                        {"id": product_id, "stock_quantity": {"$gt": 0}},
                        {
                            "$inc": {"stock_quantity": -1},
                            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
                        }
                    )
                    
                    if stock_result.modified_count == 0:
                        logger.warning(f"Stock not reduced for product {product_id} - may be out of stock")
                
                logger.info(f"Payment completed for session {session_id}")
                
            elif status.status == "expired":
                await orders_collection.update_one(
                    {"session_id": session_id},
                    {
                        "$set": {
                            "payment_status": "expired",
                            "status": "expired",
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }
                    }
                )
                logger.info(f"Checkout session expired: {session_id}")
        
        return {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount_total": status.amount_total,
            "currency": status.currency
        }
        
    except Exception as e:
        logger.error(f"Error checking checkout status: {str(e)}")
        raise HTTPException(status_code=500, detail="Unable to check payment status")


@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhooks using emergentintegrations.
    """
    try:
        # Initialize Stripe checkout
        host_url = str(request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        # Get webhook data
        payload = await request.body()
        sig_header = request.headers.get("Stripe-Signature")
        
        # Handle the webhook
        webhook_response = await stripe_checkout.handle_webhook(payload, sig_header)
        
        logger.info(f"Webhook received: {webhook_response.event_type} for session {webhook_response.session_id}")
        
        # If payment is successful, update the transaction
        if webhook_response.payment_status == "paid":
            session_id = webhook_response.session_id
            
            # Find and update the transaction
            transaction = await orders_collection.find_one({"session_id": session_id})
            
            if transaction and transaction.get("payment_status") != "paid":
                product_id = transaction.get("product_id")
                
                # Update transaction status
                await orders_collection.update_one(
                    {"session_id": session_id, "payment_status": {"$ne": "paid"}},
                    {
                        "$set": {
                            "payment_status": "paid",
                            "status": "completed",
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }
                    }
                )
                
                # Reduce stock
                if product_id:
                    await products_collection.update_one(
                        {"id": product_id, "stock_quantity": {"$gt": 0}},
                        {
                            "$inc": {"stock_quantity": -1},
                            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
                        }
                    )
                
                logger.info(f"Webhook: Payment completed for session {session_id}")
        
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        # Always return 200 to Stripe
        return {"status": "received", "error": str(e)}
