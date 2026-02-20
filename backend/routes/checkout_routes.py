from fastapi import APIRouter, HTTPException, Request, Response, status as http_status
import stripe
from pydantic import BaseModel
from config.database import products_collection, orders_collection
import os
from datetime import datetime, timezone
import uuid
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Get Stripe API key from environment
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', os.environ.get('STRIPE_SECRET_KEY'))
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET')


class CheckoutRequest(BaseModel):
    fragrance_slug: str
    origin_url: str


class CheckoutStatusRequest(BaseModel):
    session_id: str


@router.post("/create-checkout-session")
async def create_checkout_session(data: CheckoutRequest, request: Request):
    """
    Create Stripe checkout session using standard stripe library.
    """
    try:
        # Configure stripe
        stripe.api_key = STRIPE_API_KEY
        
        # Get product from database - price comes from DB, not client
        product = await products_collection.find_one(
            {"slug": data.fragrance_slug, "status": "published"},
            {"_id": 0}
        )
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Validate stock availability
        stock_quantity = product.get("stock_quantity", 0)
        if stock_quantity <= 0:
            raise HTTPException(
                status_code=400, 
                detail="This item is currently out of stock"
            )
        
        # Get price_amount in cents
        price_amount = product.get('price_amount')
        # Fallback if price_amount is not present (e.g. from seed_db price string)
        if not price_amount:
            price_str = product.get('price', '$0')
            try:
                price_amount = int(float(price_str.replace('$', '').replace(',', '')) * 100)
            except:
                price_amount = 0

        if not price_amount or price_amount <= 0:
            logger.error(f"Invalid price_amount for product {product['id']}: {price_amount}")
            raise HTTPException(status_code=500, detail="Product pricing error")
        
        # Build dynamic URLs
        origin_url = data.origin_url.rstrip('/')
        success_url = f"{origin_url}/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{origin_url}/fragrance/{product['slug']}"
        
        # Create Stripe Checkout Session
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': product.get('currency', 'usd').lower(),
                    'product_data': {
                        'name': product['name'],
                        'description': product.get('short_description', ''),
                    },
                    'unit_amount': price_amount,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'product_id': product['id'],
                'product_slug': product['slug'],
                'product_name': product['name']
            }
        )
        
        # Create payment transaction record
        transaction = {
            "id": str(uuid.uuid4()),
            "session_id": session.id,
            "product_id": product['id'],
            "product_slug": product['slug'],
            "amount": price_amount / 100.0,
            "amount_cents": price_amount,
            "currency": product.get('currency', 'usd').upper(),
            "payment_status": "initiated",
            "status": "pending",
            "metadata": session.metadata,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await orders_collection.insert_one(transaction)
        logger.info(f"Checkout session created: {session.id} for product {product['id']}")
        
        return {"sessionId": session.id, "url": session.url}
        
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unable to create checkout session: {str(e)}")


@router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request):
    """
    Get the status of a checkout session and update database accordingly.
    """
    try:
        stripe.api_key = STRIPE_API_KEY
        session = stripe.checkout.Session.retrieve(session_id)
        
        # Find the existing transaction
        transaction = await orders_collection.find_one({"session_id": session_id})
        
        if transaction:
            if transaction.get("payment_status") == "paid":
                return {
                    "status": session.status,
                    "payment_status": "paid",
                    "message": "Payment already processed"
                }
            
            if session.payment_status == "paid":
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
                product_id = transaction.get("product_id")
                if product_id:
                    await products_collection.update_one(
                        {"id": product_id, "stock_quantity": {"$gt": 0}},
                        {
                            "$inc": {"stock_quantity": -1},
                            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
                        }
                    )
                
            elif session.status == "expired":
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
        
        return {
            "status": session.status,
            "payment_status": session.payment_status,
            "amount_total": session.amount_total,
            "currency": session.currency
        }
        
    except Exception as e:
        logger.error(f"Error checking checkout status: {str(e)}")
        raise HTTPException(status_code=500, detail="Unable to check payment status")


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhooks.
    """
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        # Invalid payload
        return Response(status_code=400)
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return Response(status_code=400)
        
    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        session_id = session.get('id')
        
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
