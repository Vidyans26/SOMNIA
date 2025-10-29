# Production-ready SOMNIA Backend with ML Models
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Install system dependencies for ML libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend code and models
COPY backend /app/backend
COPY data /app/data

# Install Python dependencies (including TensorFlow for ML models)
RUN python -m pip install --upgrade pip && \
    pip install \
      fastapi \
      "uvicorn[standard]" \
      python-multipart \
      aiofiles \
      numpy \
      scipy \
      PyJWT \
      python-dotenv \
      pydantic \
      tensorflow \
      keras \
      librosa \
      soundfile \
      h5py

# Set environment variables for ML models
ENV ENABLE_ML_MODELS=true \
    ENABLE_SNORING=true \
    ENABLE_VIDEO_POSE=false \
    USE_MOCK=false

EXPOSE 8000

# Run the application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
