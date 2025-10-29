# SOMNIA ML Models Configuration
# Copy this to .env to enable ML models

# Enable ML model inference (SpO2 and ECG)
ENABLE_ML_MODELS=true

# Enable snoring detection
ENABLE_SNORING=true

# Enable video pose analysis
ENABLE_VIDEO_POSE=true

# Model paths (defaults to backend/models/*.hdf5)
# SPO2_MODEL_PATH=backend/models/SpO2_weights.hdf5
# ECG_MODEL_PATH=backend/models/ecg_weights.hdf5

# Use mock mode instead of real models (for testing without TensorFlow)
# USE_MOCK=false

# Server configuration
DEBUG=true
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000
