import os
import json
import traceback
from typing import Dict, Any, Optional

USE_MOCK = os.getenv("USE_MOCK", "true").lower() in ("1", "true", "yes")

# Lazy load to avoid heavy import at module import time
_tf_loaded = False
SPO2_MODEL = None
ECG_MODEL = None

def _try_load_keras_model(path: str):
    global _tf_loaded
    try:
        # Import inside function to avoid requiring TF for mock-only runs
        from tensorflow.keras.models import load_model  # type: ignore
        _tf_loaded = True
        model = load_model(path)
        return model
    except Exception:
        # Return None if any load error (missing file, incompatible TF version)
        return None

def init_models(spo2_path: Optional[str] = None, ecg_path: Optional[str] = None):
    """Call once at app startup. If load fails, keep models None -> mock mode used."""
    global SPO2_MODEL, ECG_MODEL
    if not USE_MOCK:
        if spo2_path:
            SPO2_MODEL = _try_load_keras_model(spo2_path)
        if ecg_path:
            ECG_MODEL = _try_load_keras_model(ecg_path)

def _mock_spo2_predict(features: Dict[str, Any]) -> Dict[str, Any]:
    # deterministic-ish mock using simple heuristics, make it look realistic
    import math
    avg_spo2 = features.get("avg_spo2", None)
    if avg_spo2 is None:
        avg_spo2 = float(features.get("min_spo2", 96))
    prob = max(0.01, min(0.99, (100.0 - avg_spo2) / 20.0))
    label = "low" if prob > 0.5 else "normal"
    return {"probability": round(prob, 3), "label": label, "model":"mock_spo2"}

def _mock_ecg_predict(features: Dict[str, Any]) -> Dict[str, Any]:
    # simple HRV heuristic: lower RMSSD => higher prob
    rmssd = features.get("rmssd", None) or features.get("avg_hrv", None) or 30.0
    prob = max(0.01, min(0.99, (40.0 - float(rmssd)) / 60.0 + 0.1))
    label = "abnormal" if prob > 0.5 else "normal"
    return {"probability": round(prob,3), "label": label, "model":"mock_ecg"}

def predict_spo2(features: Dict[str, Any]) -> Dict[str, Any]:
    """
    features: dict containing precomputed features (avg_spo2, min_spo2, etc.)
    Returns: {probability, label, model}
    """
    if USE_MOCK:
        return _mock_spo2_predict(features)
    if SPO2_MODEL is None:
        return _mock_spo2_predict(features)
    try:
        # adapt this if your model expects different shaped input (use the same preprocessing)
        import numpy as np
        X = features.get("X")  # if frontend sends preprocessed array
        if X is None:
            # fallback: build a tiny feature vector from available features
            X = [features.get("avg_spo2", 98.0), features.get("min_spo2", 97.0)]
        arr = np.array([X], dtype=np.float32)
        p = float(SPO2_MODEL.predict(arr).ravel()[0])
        label = "low" if p > 0.5 else "normal"
        return {"probability": round(p,3), "label": label, "model":"spo2_model"}
    except Exception:
        traceback.print_exc()
        return _mock_spo2_predict(features)

def predict_ecg(features: Dict[str, Any]) -> Dict[str, Any]:
    """
    features: dict containing hr, rmssd, hrv features or preprocessed X
    """
    if USE_MOCK:
        return _mock_ecg_predict(features)
    if ECG_MODEL is None:
        return _mock_ecg_predict(features)
    try:
        import numpy as np
        X = features.get("X")
        if X is None:
            X = [features.get("rmssd", 30.0), features.get("avg_hr", 70.0)]
        arr = np.array([X], dtype=np.float32)
        p = float(ECG_MODEL.predict(arr).ravel()[0])
        label = "abnormal" if p > 0.5 else "normal"
        return {"probability": round(p,3), "label": label, "model":"ecg_model"}
    except Exception:
        traceback.print_exc()
        return _mock_ecg_predict(features)

def fuse_modalities(audio_prob: Optional[float], video_score: Optional[float], wearable_risk: Optional[float], weights=None):
    """
    Simple configurable fusion. Weights default: audio=0.5, video=0.2, wearable=0.3
    Returns: {"fusion_score": float, "fusion_level": "low|moderate|high"}
    """
    if weights is None:
        weights = {"audio":0.5, "video":0.2, "wearable":0.3}
    audio = float(audio_prob) if audio_prob is not None else 0.0
    video = float(video_score) if video_score is not None else 0.0
    wearable = float(wearable_risk) if wearable_risk is not None else 0.0
    score = audio*weights["audio"] + video*weights["video"] + wearable*weights["wearable"]
    level = "high" if score > 0.6 else "moderate" if score > 0.35 else "low"
    return {"fusion_score": round(score,3), "fusion_level": level}
