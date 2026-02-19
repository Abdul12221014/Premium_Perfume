"""
Image Storage Service - Abstraction Layer

This module provides a unified interface for image storage.
Currently configured for Cloudinary, but can be swapped for S3 or other providers.

Configuration:
    Set the following environment variables:
    - CLOUDINARY_CLOUD_NAME
    - CLOUDINARY_API_KEY
    - CLOUDINARY_API_SECRET

Usage:
    from services.image_storage import ImageStorageService
    
    storage = ImageStorageService()
    url = await storage.upload(file_bytes, filename="product_hero.jpg")
    await storage.delete(public_id)
"""

import os
import logging
from typing import Optional
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)


class BaseImageStorage(ABC):
    """Abstract base class for image storage providers."""
    
    @abstractmethod
    async def upload(self, file_data: bytes, filename: str, folder: str = "") -> dict:
        """Upload an image and return the URL and metadata."""
        pass
    
    @abstractmethod
    async def delete(self, public_id: str) -> bool:
        """Delete an image by its public ID."""
        pass
    
    @abstractmethod
    def get_optimized_url(self, public_id: str, width: int = 800, quality: str = "auto") -> str:
        """Get an optimized/transformed URL for the image."""
        pass


class CloudinaryStorage(BaseImageStorage):
    """Cloudinary implementation for image storage."""
    
    def __init__(self):
        self.cloud_name = os.environ.get('CLOUDINARY_CLOUD_NAME', '')
        self.api_key = os.environ.get('CLOUDINARY_API_KEY', '')
        self.api_secret = os.environ.get('CLOUDINARY_API_SECRET', '')
        self.configured = bool(self.cloud_name and self.api_key and self.api_secret)
        
        if self.configured:
            try:
                import cloudinary
                cloudinary.config(
                    cloud_name=self.cloud_name,
                    api_key=self.api_key,
                    api_secret=self.api_secret
                )
                logger.info("Cloudinary configured successfully")
            except ImportError:
                logger.warning("Cloudinary package not installed. Install with: pip install cloudinary")
                self.configured = False
    
    async def upload(self, file_data: bytes, filename: str, folder: str = "products") -> dict:
        """
        Upload an image to Cloudinary.
        
        Returns:
            dict with keys: url, public_id, secure_url, format, width, height
        """
        if not self.configured:
            raise RuntimeError("Cloudinary is not configured. Please set environment variables.")
        
        import cloudinary.uploader
        
        # Generate a unique public_id from filename
        base_name = os.path.splitext(filename)[0]
        
        result = cloudinary.uploader.upload(
            file_data,
            folder=f"arar-parfums/{folder}",
            public_id=base_name,
            overwrite=True,
            resource_type="image",
            transformation=[
                {"quality": "auto:best"},
                {"fetch_format": "auto"}
            ]
        )
        
        logger.info(f"Image uploaded to Cloudinary: {result['public_id']}")
        
        return {
            "url": result['url'],
            "secure_url": result['secure_url'],
            "public_id": result['public_id'],
            "format": result['format'],
            "width": result['width'],
            "height": result['height']
        }
    
    async def delete(self, public_id: str) -> bool:
        """Delete an image from Cloudinary."""
        if not self.configured:
            raise RuntimeError("Cloudinary is not configured.")
        
        import cloudinary.uploader
        
        result = cloudinary.uploader.destroy(public_id)
        success = result.get('result') == 'ok'
        
        if success:
            logger.info(f"Image deleted from Cloudinary: {public_id}")
        else:
            logger.warning(f"Failed to delete image: {public_id}")
        
        return success
    
    def get_optimized_url(self, public_id: str, width: int = 800, quality: str = "auto") -> str:
        """
        Get an optimized URL with transformations.
        
        Features:
        - Automatic format selection (WebP, AVIF for supported browsers)
        - Quality optimization
        - Responsive sizing
        - CDN delivery
        """
        if not self.cloud_name:
            return ""
        
        # Build Cloudinary transformation URL
        transformation = f"w_{width},q_{quality},f_auto"
        return f"https://res.cloudinary.com/{self.cloud_name}/image/upload/{transformation}/{public_id}"


class LocalStorage(BaseImageStorage):
    """
    Local file storage implementation (for development/testing).
    
    Note: Not recommended for production. Use Cloudinary or S3.
    """
    
    def __init__(self, base_path: str = "/app/uploads"):
        self.base_path = base_path
        os.makedirs(base_path, exist_ok=True)
    
    async def upload(self, file_data: bytes, filename: str, folder: str = "products") -> dict:
        """Save file locally and return path."""
        folder_path = os.path.join(self.base_path, folder)
        os.makedirs(folder_path, exist_ok=True)
        
        file_path = os.path.join(folder_path, filename)
        
        with open(file_path, 'wb') as f:
            f.write(file_data)
        
        logger.info(f"Image saved locally: {file_path}")
        
        return {
            "url": f"/uploads/{folder}/{filename}",
            "secure_url": f"/uploads/{folder}/{filename}",
            "public_id": f"{folder}/{filename}",
            "format": filename.split('.')[-1],
            "width": 0,
            "height": 0
        }
    
    async def delete(self, public_id: str) -> bool:
        """Delete local file."""
        file_path = os.path.join(self.base_path, public_id)
        try:
            os.remove(file_path)
            logger.info(f"Local file deleted: {file_path}")
            return True
        except FileNotFoundError:
            return False
    
    def get_optimized_url(self, public_id: str, width: int = 800, quality: str = "auto") -> str:
        """Local storage doesn't support optimization."""
        return f"/uploads/{public_id}"


class ImageStorageService:
    """
    Unified image storage service.
    
    Automatically selects the best available provider:
    1. Cloudinary (if configured)
    2. Local storage (fallback for development)
    
    Example:
        storage = ImageStorageService()
        result = await storage.upload(file_bytes, "product_hero.jpg")
        print(result['secure_url'])  # CDN URL
    """
    
    def __init__(self, provider: Optional[str] = None):
        """
        Initialize the storage service.
        
        Args:
            provider: Force a specific provider ('cloudinary' or 'local')
        """
        if provider == 'cloudinary':
            self._storage = CloudinaryStorage()
        elif provider == 'local':
            self._storage = LocalStorage()
        else:
            # Auto-detect based on configuration
            cloudinary_storage = CloudinaryStorage()
            if cloudinary_storage.configured:
                self._storage = cloudinary_storage
                logger.info("Using Cloudinary for image storage")
            else:
                self._storage = LocalStorage()
                logger.info("Using local storage for images (Cloudinary not configured)")
    
    @property
    def provider_name(self) -> str:
        """Get the name of the current storage provider."""
        return self._storage.__class__.__name__
    
    async def upload(self, file_data: bytes, filename: str, folder: str = "products") -> dict:
        """Upload an image using the configured provider."""
        return await self._storage.upload(file_data, filename, folder)
    
    async def delete(self, public_id: str) -> bool:
        """Delete an image using the configured provider."""
        return await self._storage.delete(public_id)
    
    def get_optimized_url(self, public_id: str, width: int = 800, quality: str = "auto") -> str:
        """Get an optimized URL for the image."""
        return self._storage.get_optimized_url(public_id, width, quality)
