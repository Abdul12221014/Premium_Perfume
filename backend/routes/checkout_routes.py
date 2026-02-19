from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel
from config.database import products_collection, orders_collection
import stripe
import os
from datetime import datetime, timezone
import uuid
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', '')
webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET', '')


class CheckoutSessionCreate(BaseModel):
    fragrance_slug: str


@router.post("/create-checkout-session")
async def create_checkout_session(data: CheckoutSessionCreate):
    """
    Create Stripe checkout session.
    
    Security:
    - Price comes from database, NOT frontend (prevents price manipulation)
    - Stock is validated before session creation
    - Product must be published status
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
        
        frontend_url = os.environ.get('FRONTEND_URL', 'https://arar-atelier-admin.preview.emergentagent.com')
        
        # Build product images list, filter out invalid URLs
        images = []
        hero_url = product.get('hero_image_url', '')
        if hero_url and hero_url.startswith('http'):
            images.append(hero_url)
        
        # Create Stripe session with server-side validated price
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': product.get('currency', 'usd').lower(),
                    'unit_amount': price_amount,  # Price from database only
                    'product_data': {
                        'name': product['name'],
                        'description': product.get('short_description', ''),
                        'images': images if images else None,
                    },
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f"{frontend_url}/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_url}/fragrance/{product['slug']}",
            metadata={
                'product_id': product['id'],
                'product_slug': product['slug'],
                'batch_number': product.get('batch_number', ''),
                'price_at_checkout': str(price_amount)  # Record price for audit
            }
        )
        
        logger.info(f"Checkout session created: {checkout_session.id} for product {product['id']}")
        return {"sessionId": checkout_session.id, "url": checkout_session.url}
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating checkout: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in checkout: {str(e)}")
        raise HTTPException(status_code=500, detail="Unable to create checkout session")


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhooks - Production-grade implementation.
    
    Features:
    - Signature verification
    - Idempotency (prevents double-processing)
    - Atomic stock reduction with negative check
    - Comprehensive error logging
    - Proper HTTP responses to Stripe
    """
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    # If no webhook secret configured, log warning but allow for testing
    if not webhook_secret:
        logger.warning("STRIPE_WEBHOOK_SECRET not configured - skipping signature verification")
        try:
            event = stripe.Event.construct_from(
                stripe.util.convert_to_stripe_object(payload.decode('utf-8'), api_key=None, params=None),
                stripe.api_key
            )
        except Exception as e:
            logger.error(f"Failed to parse webhook payload: {str(e)}")
            return Response(status_code=400, content="Invalid payload")
    else:
        # Production: Verify webhook signature
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        except ValueError as e:
            logger.error(f"Webhook payload error: {str(e)}")
            return Response(status_code=400, content="Invalid payload")
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Webhook signature verification failed: {str(e)}")
            return Response(status_code=400, content="Invalid signature")
    
    event_type = event.get('type', '')
    logger.info(f"Webhook received: {event_type}")
    
    # Handle checkout.session.completed event
    if event_type == 'checkout.session.completed':
        session = event['data']['object']
        session_id = session.get('id')
        
        # IDEMPOTENCY CHECK: Prevent double-processing
        existing_order = await orders_collection.find_one({"stripe_session_id": session_id})
        if existing_order:
            logger.info(f"Order already exists for session {session_id} - skipping")
            return {"status": "success", "message": "Already processed"}
        
        # Extract order details
        product_id = session.get('metadata', {}).get('product_id')
        product_slug = session.get('metadata', {}).get('product_slug', '')
        customer_email = session.get('customer_details', {}).get('email', '') or ''
        amount_total = session.get('amount_total', 0)
        currency = session.get('currency', 'usd').upper()
        
        if not product_id:
            logger.error(f"No product_id in session metadata: {session_id}")
            return {"status": "error", "message": "Missing product metadata"}
        
        # Create order record
        order_id = str(uuid.uuid4())
        order = {
            "id": order_id,
            "stripe_session_id": session_id,
            "stripe_payment_intent": session.get('payment_intent', ''),
            "product_id": product_id,
            "product_slug": product_slug,
            "customer_email": customer_email,
            "amount": amount_total,
            "currency": currency,
            "status": "paid",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        try:
            # Insert order first
            await orders_collection.insert_one(order)
            logger.info(f"Order created: {order_id} for session {session_id}")
            
            # ATOMIC STOCK REDUCTION with negative check
            # Only decrease stock if current stock > 0
            stock_result = await products_collection.update_one(
                {
                    "id": product_id,
                    "stock_quantity": {"$gt": 0}  # Prevent negative stock
                },
                {
                    "$inc": {"stock_quantity": -1},
                    "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
                }
            )
            
            if stock_result.modified_count == 0:
                # Stock wasn't reduced - either product not found or already at 0
                product = await products_collection.find_one({"id": product_id})
                if product:
                    current_stock = product.get('stock_quantity', 0)
                    logger.critical(
                        f"STOCK WARNING: Failed to reduce stock for product {product_id}. "
                        f"Current stock: {current_stock}. Order {order_id} was still created."
                    )
                else:
                    logger.critical(f"Product {product_id} not found when reducing stock for order {order_id}")
            else:
                logger.info(f"Stock reduced for product {product_id}")
                
        except Exception as e:
            logger.critical(f"Database error processing order for session {session_id}: {str(e)}")
            # Don't raise - Stripe already charged the customer
            # The order might need manual intervention
            return {"status": "error", "message": "Database error - manual review required"}
    
    # Handle other event types as needed
    elif event_type == 'checkout.session.expired':
        session_id = event['data']['object'].get('id')
        logger.info(f"Checkout session expired: {session_id}")
    
    elif event_type == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        logger.warning(f"Payment failed: {payment_intent.get('id')}")
    
    # Always return 200 to Stripe to acknowledge receipt
    return {"status": "success"}
