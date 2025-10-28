from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pathlib import Path
import shutil
import uuid
from ..models.extract_pose_features import run_on_video

router = APIRouter(prefix="/api/v1", tags=["Video"])

@router.post("/upload/video-pose")
async def upload_video_pose(file: UploadFile = File(...), current_user: dict = Depends(lambda: {"id":"demo_user"})):
    # Save uploaded file temporarily
    uploads = Path("uploads") / "videos"
    uploads.mkdir(parents=True, exist_ok=True)
    unique_name = f"{uuid.uuid4().hex}_{file.filename}"
    out_path = uploads / unique_name

    with open(out_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # run extraction (sync call) - consider background task for large files
    try:
        csv_path, json_path = run_on_video(str(out_path), str(Path("data/video_features")))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"video_path": str(out_path), "frames_csv": str(csv_path), "summary_json": str(json_path)}