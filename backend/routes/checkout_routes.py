from fastapi import APIRouter, HTTPException, Request, Response, status as http_status
import stripe
from pydantic import BaseModel, field_validator
from config.database import products_collection, orders_collection
import os
from datetime import datetime, timezone
from urllib.parse import urlparse
import uuid
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


def _get_limiter():
    from server import limiter
    return limiter

STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', os.environ.get('STRIPE_SECRET_KEY'))
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET')

# Allowed origins for checkout redirects — prevents open redirect attacks
def _get_allowed_origins() -> list[str]:
    raw = os.environ.get('CORS_ORIGIN', '')
    return [o.strip().rstrip('/') for o in raw.split(',') if o.strip()]


def _validate_origin_url(origin_url: str) -> str:
    """
    Reject origin_url values that don't match CORS_ORIGIN allowlist.
    Falls back to permissive check (scheme + host only) in development.
    """
    cleaned = origin_url.rstrip('/')
    allowed = _get_allowed_origins()

    if not allowed:
        # Development: only allow http/https schemes, no path traversal
        parsed = urlparse(cleaned)
        if parsed.scheme not in ('http', 'https'):
            raise HTTPException(status_code=400, detail="Invalid origin URL")
        return cleaned

    if cleaned not in allowed:
        raise HTTPException(status_code=400, detail="Invalid origin URL")
    return cleaned


class CheckoutRequest(BaseModel):
    fragrance_slug: str
    origin_url: str

    @field_validator('fragrance_slug')
    @classmethod
    def slug_safe(cls, v: str) -> str:
        if not v or len(v) > 200:
            raise ValueError("Invalid slug")
        return v


class CheckoutStatusRequest(BaseModel):
    session_id: str


@router.post("/create-checkout-session")
@_get_limiter().limit("10/minute")
async def create_checkout_session(request: Request, data: CheckoutRequest):
    # Validate origin before any Stripe calls
    origin_url = _validate_origin_url(data.origin_url)

    try:
        stripe.api_key = STRIPE_API_KEY

        product = await products_collection.find_one(
            {"slug": data.fragrance_slug, "status": "published"},
            {"_id": 0}
        )

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        stock_quantity = product.get("stock_quantity", 0)
        if stock_quantity <= 0:
            raise HTTPException(status_code=400, detail="This item is currently out of stock")

        price_amount = product.get('price_amount')
        if not price_amount:
            price_str = product.get('price', '$0')
            try:
                price_amount = int(float(price_str.replace('$', '').replace(',', '')) * 100)
            except ValueError:
                price_amount = 0

        if not price_amount or price_amount <= 0:
            logger.error("Invalid price_amount for product %s: %s", product['id'], price_amount)
            raise HTTPException(status_code=500, detail="Product pricing error")

        success_url = f"{origin_url}/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{origin_url}/fragrance/{product['slug']}"

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
        logger.info("Checkout session created: %s for product %s", session.id, product['id'])

        return {"sessionId": session.id, "url": session.url}

    except HTTPException:
        raise
    except stripe.error.StripeError as e:
        logger.error("Stripe error creating checkout session: %s", type(e).__name__)
        raise HTTPException(status_code=502, detail="Payment provider error. Please try again.")
    except Exception as e:
        logger.error("Unexpected error creating checkout session: %s", type(e).__name__)
        raise HTTPException(status_code=500, detail="Unable to create checkout session.")


@router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request):
    if not session_id or len(session_id) > 200:
        raise HTTPException(status_code=400, detail="Invalid session ID")

    try:
        stripe.api_key = STRIPE_API_KEY
        session = stripe.checkout.Session.retrieve(session_id)

        transaction = await orders_collection.find_one({"session_id": session_id})

        if transaction:
            if transaction.get("payment_status") == "paid":
                return {
                    "status": session.status,
                    "payment_status": "paid",
                    "message": "Payment already processed"
                }

            if session.payment_status == "paid":
                # Atomic: only update if still not paid, then decrement stock
                result = await orders_collection.update_one(
                    {"session_id": session_id, "payment_status": {"$ne": "paid"}},
                    {
                        "$set": {
                            "payment_status": "paid",
                            "status": "completed",
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }
                    }
                )

                # Only decrement stock if we actually performed the update (prevents double-deduct)
                if result.modified_count == 1:
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

    except HTTPException:
        raise
    except stripe.error.StripeError as e:
        logger.error("Stripe error checking status: %s", type(e).__name__)
        raise HTTPException(status_code=502, detail="Unable to check payment status.")
    except Exception as e:
        logger.error("Unexpected error checking checkout status: %s", type(e).__name__)
        raise HTTPException(status_code=500, detail="Unable to check payment status.")


@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return Response(status_code=400)
    except stripe.error.SignatureVerificationError:
        return Response(status_code=400)

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        session_id = session.get('id')

        transaction = await orders_collection.find_one({"session_id": session_id})

        if transaction and transaction.get("payment_status") != "paid":
            # Atomic update — only proceed if we win the race
            result = await orders_collection.update_one(
                {"session_id": session_id, "payment_status": {"$ne": "paid"}},
                {
                    "$set": {
                        "payment_status": "paid",
                        "status": "completed",
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )

            # Only decrement stock if we actually performed the update
            if result.modified_count == 1:
                product_id = transaction.get("product_id")
                if product_id:
                    await products_collection.update_one(
                        {"id": product_id, "stock_quantity": {"$gt": 0}},
                        {
                            "$inc": {"stock_quantity": -1},
                            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
                        }
                    )

                logger.info("Webhook: Payment completed for session %s", session_id)

    return {"status": "success"}
