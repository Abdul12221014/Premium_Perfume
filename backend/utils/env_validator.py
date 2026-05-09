import os
import logging
import sys
from typing import Optional

logger = logging.getLogger(__name__)

REQUIRED_ENV_VARS = [
    "ENVIRONMENT",
    "MONGO_URL",
    "DB_NAME",
    "STRIPE_SECRET_KEY",     # alias: STRIPE_API_KEY
    "STRIPE_WEBHOOK_SECRET",
    "JWT_SECRET_KEY",        # alias: JWT_SECRET
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
]

# Maps canonical name → list of accepted aliases
_ALIASES: dict = {
    "STRIPE_SECRET_KEY": ["STRIPE_API_KEY"],
    "MONGO_URL": ["DATABASE_URL"],
    "JWT_SECRET_KEY": ["JWT_SECRET"],
}


def _resolve(var: str) -> Optional[str]:
    """Return the value of var or any of its aliases, or None if none set."""
    val = os.environ.get(var)
    if val:
        return val
    for alias in _ALIASES.get(var, []):
        val = os.environ.get(alias)
        if val:
            return val
    return None


def validate_env():
    """
    Validates that all required environment variables are present and secure.
    Aborts startup on any unsafe configuration.
    """
    env_mode = os.environ.get("ENVIRONMENT", "").lower()
    if env_mode not in ["development", "staging", "production"]:
        print(f"\nFATAL: ENVIRONMENT must be 'development', 'staging', or 'production'. Got: '{env_mode}'")
        sys.exit(1)

    missing = []
    for var in REQUIRED_ENV_VARS:
        if not _resolve(var):
            missing.append(var)

    # CORS_ORIGIN is mandatory in production
    cors_origin = os.environ.get("CORS_ORIGIN")
    if env_mode == "production" and not cors_origin:
        missing.append("CORS_ORIGIN")

    if missing:
        print(f"\nFATAL: Missing required environment variables for {env_mode} mode:")
        for var in missing:
            aliases = _ALIASES.get(var, [])
            note = f" (or {', '.join(aliases)})" if aliases else ""
            print(f"  - {var}{note}")
        sys.exit(1)

    # Stripe Mode Guard
    stripe_key = _resolve("STRIPE_SECRET_KEY") or ""
    stripe_mode = "Unknown"

    if env_mode == "production":
        if not stripe_key.startswith("sk_live_"):
            print("\nFATAL: Production mode but STRIPE_SECRET_KEY does not start with 'sk_live_'.")
            sys.exit(1)
        stripe_mode = "LIVE"
    else:
        if stripe_key and not stripe_key.startswith("sk_test_"):
            print(f"\nWARNING: {env_mode} mode but STRIPE_SECRET_KEY does not start with 'sk_test_'.")
        stripe_mode = "TEST"

    # CORS wildcard guard
    if env_mode == "production" and cors_origin == "*":
        print("\nFATAL: Wildcard CORS_ORIGIN ('*') is forbidden in production.")
        sys.exit(1)

    db_name = os.environ.get("DB_NAME")

    print("\n" + "=" * 40)
    print("ARAR PERFUME STARTUP VALIDATION")
    print("=" * 40)
    print(f"Environment:             {env_mode.upper()}")
    print(f"Stripe Mode:             {stripe_mode}")
    print(f"CORS Origin:             {cors_origin or 'Not set (wildcard in dev)'}")
    print(f"Database:                {db_name}")
    print(f"Webhook Validation:      ACTIVE")
    print("=" * 40 + "\n")

    logger.info("Environment validation successful (%s).", env_mode)
