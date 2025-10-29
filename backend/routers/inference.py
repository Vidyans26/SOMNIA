from fastapi import APIRouter, Body, HTTPException, Depends
from typing import Optional, Dict, Any
from ..utils.auth import get_current_user
from ..models.inference import init_models, predict_spo2, predict_ecg, fuse_modalities
import os

router = APIRouter(prefix="/api/v1", tags=["Inference"])

# initialize models at import (fastest for demo)
SPO2_PATH = os.path.join(os.getcwd(), "backend", "models", "SpO2_weights.hdf5")
ECG_PATH = os.path.join(os.getcwd(), "backend", "models", "ecg_weights.hdf5")
init_models(spo2_path=SPO2_PATH if os.path.exists(SPO2_PATH) else None,
            ecg_path=ECG_PATH if os.path.exists(ECG_PATH) else None)

@router.post("/infer/spo2")
async def infer_spo2(payload: Dict[str, Any] = Body(...), current_user: Dict = Depends(get_current_user)):
    """
    payload example:
    { "avg_spo2": 95.1, "min_spo2": 92, "X": [ ... optional preprocessed array ... ] }
    """
    try:
        res = predict_spo2(payload)
        return {"ok": True, "result": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/infer/ecg")
async def infer_ecg(payload: Dict[str, Any] = Body(...), current_user: Dict = Depends(get_current_user)):
    """
    payload example:
    { "rmssd": 25.0, "avg_hr": 78, "X": [ ... ] }
    """
    try:
        res = predict_ecg(payload)
        return {"ok": True, "result": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class FusionRequest:
    # accepted fields: audio_prob, video_score, wearable_risk
    pass

@router.post("/infer/multimodal")
async def infer_multimodal(body: Dict[str, Any] = Body(...), current_user: Dict = Depends(get_current_user)):
    audio_prob = body.get("audio_prob")
    video_score = body.get("video_score")
    wearable_risk = body.get("wearable_risk")
    fusion = fuse_modalities(audio_prob, video_score, wearable_risk)
    return {"ok": True, "fusion": fusion}
