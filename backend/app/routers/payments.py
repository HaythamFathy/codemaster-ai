from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..auth import get_current_user
import stripe
import os

router = APIRouter(
    prefix="/payments",
    tags=["payments"]
)

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@router.post("/create-checkout-session")
async def create_checkout_session(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe API key not configured")

    try:
        # Create or get customer
        if current_user.stripe_customer_id:
            customer_id = current_user.stripe_customer_id
        else:
            customer = stripe.Customer.create(email=current_user.email, metadata={"user_id": current_user.id})
            customer_id = customer.id
            current_user.stripe_customer_id = customer_id
            db.commit()

        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
            line_items=[
                {
                    # Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                    # For now we use a placeholder or hardcoded sample price
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': 'CodeMaster Pro',
                        },
                        'unit_amount': 2000, # $20.00
                        'recurring': {
                            'interval': 'month',
                        },
                    },
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=os.getenv("FRONTEND_URL", "http://localhost:3000") + '/dashboard?success=true',
            cancel_url=os.getenv("FRONTEND_URL", "http://localhost:3000") + '/pricing?canceled=true',
            metadata={
                "user_id": str(current_user.id)
            }
        )
        return {"url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def webhook_received(request: Request, db: Session = Depends(get_db)):
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        # Fulfill the purchase...
        user_id = session.get("metadata", {}).get("user_id")
        if user_id:
            user = db.query(User).filter(User.id == int(user_id)).first()
            if user:
                user.is_pro = True
                db.commit()
                print(f"User {user_id} upgraded to PRO")

    return {"status": "success"}
