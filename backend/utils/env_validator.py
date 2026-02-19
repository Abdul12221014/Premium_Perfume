import os
import logging
import sys

logger = logging.getLogger(__name__)

REQUIRED_ENV_VARS = [
    "ENVIRONMENT",
    "MONGO_URL",
    "DB_NAME",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    # Aliases supported: DATABASE_URL, JWT_SECRET
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
]

def validate_env():
    """
    Validates that all required environment variables are present and secure.
    Aborts startup on any unsafe configuration.
    """
    env_mode = os.environ.get("ENVIRONMENT", "").lower()
    if env_mode not in ["development", "staging", "production"]:
        print(f"\nFATAL: ENVIRONMENT variable must be set to 'development', 'staging', or 'production'. Current: '{env_mode}'")
        sys.exit(1)

    missing = []
    for var in REQUIRED_ENV_VARS:
        if not os.environ.get(var):
            # Check for aliases
            if var == "STRIPE_SECRET_KEY" and os.environ.get("STRIPE_API_KEY"):
                continue
            if var == "MONGO_URL" and os.environ.get("DATABASE_URL"):
                continue
            if var == "JWT_SECRET_KEY" and os.environ.get("JWT_SECRET"):
                continue
            missing.append(var)
    
    # In production, CORS_ORIGIN is mandatory
    cors_origin = os.environ.get("CORS_ORIGIN")
    if env_mode == "production" and not cors_origin:
        missing.append("CORS_ORIGIN")

    if missing:
        print(f"\nFATAL: Missing required environment variables for {env_mode} mode:")
        for var in missing:
            print(f"  - {var}")
        sys.exit(1)

    # Stripe Mode Guard
    stripe_key = os.environ.get("STRIPE_SECRET_KEY", os.environ.get("STRIPE_API_KEY", ""))
    stripe_mode = "Unknown"
    
    if env_mode == "production":
        if not stripe_key.startswith("sk_live_"):
            print(f"\nFATAL: Production mode detected but STRIPE_SECRET_KEY does not start with 'sk_live_'.")
            sys.exit(1)
        stripe_mode = "LIVE"
    else:
        if not stripe_key.startswith("sk_test_"):
            print(f"\nWARNING: {env_mode} mode detected but STRIPE_SECRET_KEY does not start with 'sk_test_'.")
        stripe_mode = "TEST"

    # CORS Guard
    if env_mode == "production" and cors_origin == "*":
        print("\nFATAL: Wildcard CORS_ORIGIN ('*') is forbidden in production.")
        sys.exit(1)

    # Database Validation Placeholder (Connectivity check is in startup_event)
    db_name = os.environ.get("DB_NAME")

    # Final Validation Summary
    print("\n" + "="*40)
    print("🚀 ARAR PERFUME STARTUP VALIDATION")
    print("="*40)
    print(f"Environment:             {env_mode.upper()}")
    print(f"Stripe Mode:             {stripe_mode}")
    print(f"CORS Origin:             {cors_origin or 'Not set'}")
    print(f"Database:                {db_name}")
    print(f"Webhook Validation:      ACTIVE (STRIPE_WEBHOOK_SECRET present)")
    print("="*40 + "\n")

    logger.info(f"Environment validation successful ({env_mode}).")
