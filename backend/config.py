"""
SOMNIA Configuration File
Team: Chimpanzini Bananini
"""

import os
from dotenv import load_dotenv

load_dotenv()

# API Configuration
API_VERSION = "0.1.0"
API_TITLE = "SOMNIA API"
API_DESCRIPTION = "Comprehensive Sleep Health Monitoring System - Multimodal AI"

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./somnia.db")

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Environment
DEBUG = os.getenv("DEBUG", "True").lower() == "true"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# CORS
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost:19000",
    "http://localhost:19002",
]

# File Upload
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
MAX_UPLOAD_SIZE = 100 * 1024 * 1024  # 100MB

# AI/ML Configuration
MODEL_PATH = os.path.join(os.getcwd(), "models")
AUDIO_SAMPLE_RATE = 16000
AUDIO_DURATION = 480  # 8 hours in seconds equivalent

print(f"SOMNIA Configuration Loaded - Environment: {ENVIRONMENT}")