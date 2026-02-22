import os
import time
from fastapi import APIRouter, Depends, HTTPException
import cloudinary
import cloudinary.utils
from middleware.auth_middleware import get_current_admin

router = APIRouter()

# Initialize Cloudinary configuration dynamically
def get_cloudinary_config():
    return {
        "cloud_name": os.environ.get("CLOUDINARY_CLOUD_NAME"),
        "api_key": os.environ.get("CLOUDINARY_API_KEY"),
        "api_secret": os.environ.get("CLOUDINARY_API_SECRET")
    }

@router.get("/upload-signature")
async def get_upload_signature(current_admin: dict = Depends(get_current_admin)):
    """
    Generate a secure signature for direct Cloudinary uploads.
    Only accessible by authenticated admins.
    """
    config = get_cloudinary_config()
    
    if config["api_secret"] == "placeholder" or not config["api_secret"]:
        raise HTTPException(
            status_code=500, 
            detail="Cloudinary credentials are not configured on the server."
        )

    # Configure the global singleton (required by cloudinary.utils)
    cloudinary.config(
        cloud_name=config["cloud_name"],
        api_key=config["api_key"],
        api_secret=config["api_secret"]
    )

    # In Cloudinary, the signature uses a POSIX timestamp
    timestamp = int(time.time())
    
    # We enforce a specific folder structure to maintain an organized media pipeline
    folder_name = "arar_parfums_collection"
    
    params_to_sign = {
        "timestamp": timestamp,
        "folder": folder_name
    }
    
    try:
        # Generate the cryptographic signature using the hidden API secret
        signature = cloudinary.utils.api_sign_request(
            params_to_sign,
            config["api_secret"]
        )
        
        # Return only what the frontend needs to execute a secure upload
        return {
            "signature": signature,
            "timestamp": timestamp,
            "cloud_name": config["cloud_name"],
            "api_key": config["api_key"],
            "folder": folder_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate secure upload signature: {str(e)}")
