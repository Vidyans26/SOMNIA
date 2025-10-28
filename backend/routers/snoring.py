from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pathlib import Path
import shutil
import uuid
from typing import Dict

from backend.config import (
    SNORING_GRAPH_PATH,
    SNORING_LABELS_PATH,
)

router = APIRouter(prefix="/api/v1", tags=["Audio", "Snoring"])


@router.get("/snoring/status")
async def snoring_status() -> Dict:
    # Lazy import to avoid heavy deps at startup
    from ..models.snoring_inference import is_configured
    return {
        "configured": is_configured(),
        "graph": SNORING_GRAPH_PATH,
        "labels": SNORING_LABELS_PATH,
    }


@router.post("/snoring/detect")
async def detect_snoring(file: UploadFile = File(...), current_user: dict = Depends(lambda: {"id": "demo_user"})):
    from ..models.snoring_inference import infer_wav, is_configured
    if not is_configured():
        raise HTTPException(
            status_code=501,
            detail=(
                "Snoring model not configured. Place the frozen graph (.pb) and labels.txt "
                "produced by adrianagaler/Snoring-Detection under backend/models/snoring, "
                "or set SNORING_GRAPH_PATH and SNORING_LABELS_PATH environment variables."
            ),
        )

    if not file.filename.lower().endswith('.wav'):
        raise HTTPException(status_code=400, detail="Please upload a WAV file (.wav)")

    # Save uploaded file temporarily
    uploads = Path("uploads") / "audio"
    uploads.mkdir(parents=True, exist_ok=True)
    unique_name = f"{uuid.uuid4().hex}_{file.filename}"
    wav_path = uploads / unique_name

    try:
        with open(wav_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        file.file.close()

    try:
        result = infer_wav(str(wav_path))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {e}")

    return {
        "user_id": current_user.get("id", "demo_user"),
        "filename": file.filename,
        "prediction": result,
    }
