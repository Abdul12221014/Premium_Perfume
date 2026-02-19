from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from config.database import products_collection, orders_collection
import stripe
import os
from datetime import datetime
import uuid

router = APIRouter()

stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', '')
webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET', '')


class CheckoutSessionCreate(BaseModel):
    fragrance_slug: str


@router.post("/create-checkout-session")
async def create_checkout_session(data: CheckoutSessionCreate):
    """Create Stripe checkout session"""
    try:
        # Get product from database
        product = await products_collection.find_one(
            {"slug": data.fragrance_slug, "status": "published"},
            {"_id": 0}
        )
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Check stock
        if product.get("stock_quantity", 0) <= 0:
            raise HTTPException(status_code=400, detail="Product out of stock")
        
        frontend_url = os.environ.get('FRONTEND_URL', 'https://arar-atelier-admin.preview.emergentagent.com')
        
        # Create Stripe session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': product.get('currency', 'usd').lower(),
                    'unit_amount': product['price_amount'],
                    'product_data': {
                        'name': product['name'],
                        'description': product['short_description'],
                        'images': [product['hero_image_url']],
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
                'batch_number': product.get('batch_number', '')
            }
        )
        
        return {"sessionId": checkout_session.id, "url": checkout_session.url}
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle checkout.session.completed event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        
        # Create order record
        order = {
            "id": str(uuid.uuid4()),
            "stripe_session_id": session['id'],
            "product_id": session['metadata'].get('product_id'),
            "customer_email": session.get('customer_details', {}).get('email', ''),
            "amount": session['amount_total'],
            "currency": session['currency'],
            "status": "paid",
            "created_at": datetime.utcnow().isoformat()
        }
        
        await orders_collection.insert_one(order)
        
        # Reduce stock
        product_id = session['metadata'].get('product_id')
        if product_id:
            await products_collection.update_one(
                {"id": product_id},
                {"$inc": {"stock_quantity": -1}}
            )
    
    return {"status": "success"}
