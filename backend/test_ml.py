"""
Quick test script for ML models
Usage: python -m backend.test_ml (from repo root)
Or: python test_ml.py (from backend directory)
"""
import os
import sys

# Add parent directory to path if running from backend dir
if os.path.basename(os.getcwd()) == 'backend':
    sys.path.insert(0, os.path.dirname(os.getcwd()))

os.environ["USE_MOCK"] = "false"  # Force real model loading

from backend.models import inference
from backend.config import SPO2_MODEL_PATH, ECG_MODEL_PATH

print("🧪 Testing ML Models Integration\n")

# Initialize models
print("📦 Loading models...")
print(f"  SpO2: {SPO2_MODEL_PATH}")
print(f"  ECG:  {ECG_MODEL_PATH}")

inference.init_models(spo2_path=SPO2_MODEL_PATH, ecg_path=ECG_MODEL_PATH)

# Test SpO2 prediction
print("\n🩺 Testing SpO2 Model...")
spo2_test_features = {
    "avg_spo2": 94.5,
    "min_spo2": 92.0
}
spo2_result = inference.predict_spo2(spo2_test_features)
print(f"  Input: {spo2_test_features}")
print(f"  Result: {spo2_result}")

# Test ECG prediction
print("\n❤️  Testing ECG Model...")
ecg_test_features = {
    "avg_hr": 75.0,
    "rmssd": 25.0
}
ecg_result = inference.predict_ecg(ecg_test_features)
print(f"  Input: {ecg_test_features}")
print(f"  Result: {ecg_result}")

# Test fusion
print("\n🔀 Testing Multimodal Fusion...")
fusion_result = inference.fuse_modalities(
    audio_prob=0.6,
    video_score=0.3,
    wearable_risk=0.7
)
print(f"  Input: audio=0.6, video=0.3, wearable=0.7")
print(f"  Result: {fusion_result}")

print("\n✅ All tests completed!")
print("\nTo enable in production, add to .env:")
print("  ENABLE_ML_MODELS=true")
