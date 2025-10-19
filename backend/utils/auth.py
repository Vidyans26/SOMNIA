"""
Authentication Utilities
Team: Chimpanzini Bananini
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from datetime import datetime, timedelta
import os

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Validate JWT token and return user
    For mid-submission: returns demo user
    """
    # In production: validate JWT properly
    # For now, return demo user for testing
    return {
        "id": "demo_user",
        "username": "Demo User",
        "email": "demo@somnia.com"
    }