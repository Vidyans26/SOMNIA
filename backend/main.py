"""
SOMNIA Backend API
Multimodal Sleep Health Monitoring System
Team: Chimpanzini Bananini
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, APIRouter, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import json
from pathlib import Path
from backend.utils.auth import get_current_user
from backend.utils.wearable import summarize_wearable_samples, save_wearable_record, WEARABLE_DIR
# === begin: wearable endpoints inserted directly into main.py ===
from fastapi import Depends

wearable_router = APIRouter(prefix="/api/v1", tags=["Wearable"])

@wearable_router.post("/upload/wearable")
async def upload_wearable(payload: Dict[str, Any] = Body(...), current_user: Dict = Depends(get_current_user)):
    """
    Accept wearable JSON payload and return computed summary and stored record id.
    Payload example:
    {
      "user_id": "demo_user",
      "device": "simulator",
      "samples": [
        {"ts": 1698000000, "hr": 72, "spo2": 98, "hrv": 45},
        ...
      ],
      "summary": {...}  # optional precomputed summary
    }
    """
    user_id = payload.get("user_id") or current_user.get("id", "demo_user")
    samples = payload.get("samples", [])
    if not isinstance(samples, list) or len(samples) == 0:
        raise HTTPException(status_code=400, detail="No wearable samples provided")

    # compute summary features
    summary = summarize_wearable_samples(samples)
    # persist (simple JSON file)
    saved = save_wearable_record(user_id, summary, payload)

    # Optionally: fuse with audio result if provided in payload (audio_prob)
    audio_prob = payload.get("audio_prob")
    fused = None
    if audio_prob is not None:
        try:
            score = 0.6 * float(audio_prob) + 0.4 * summary.get("risk_score", 0.0)
            level = "high" if score > 0.6 else "moderate" if score > 0.35 else "low"
            fused = {"fusion_score": round(score, 3), "fusion_level": level}
        except Exception:
            fused = None

    response = {"saved": saved, "summary": summary}
    if fused:
        response["fusion"] = fused
    return response

@wearable_router.get("/wearable/logs")
async def wearable_logs(limit: int = 20):
    """
    Return recent wearable summary records (basic file-based storage)
    """
    files = sorted(Path(WEARABLE_DIR).glob("wearable_*.json"), reverse=True)
    out = []
    for f in files[:limit]:
        try:
            with open(f, "r", encoding="utf-8") as fh:
                rec = json.load(fh)
                out.append({"id": rec.get("id"), "timestamp": rec.get("timestamp"), "summary": rec.get("summary")})
        except Exception:
            continue
    return {"count": len(out), "records": out}

# Router registration will happen after app is created below.

# Import local modules
from backend.config import API_TITLE, API_DESCRIPTION, API_VERSION, ALLOWED_ORIGINS
from backend.models.sleep_analyzer import analyze_sleep_audio, detect_sleep_disorders
from backend.models.sleep_report import generate_sleep_report

# Initialize FastAPI
app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include wearable endpoints defined above
app.include_router(wearable_router)

# Initialize ML Models if enabled
from backend.config import ENABLE_SNORING, ENABLE_VIDEO_POSE, ENABLE_ML_MODELS

@app.on_event("startup")
async def startup_event():
    """Initialize ML models on startup if enabled"""
    if ENABLE_ML_MODELS:
        try:
            from backend.models import inference
            from backend.config import SPO2_MODEL_PATH, ECG_MODEL_PATH
            print(f"🤖 Initializing ML models...")
            print(f"  - SpO2 model: {SPO2_MODEL_PATH}")
            print(f"  - ECG model: {ECG_MODEL_PATH}")
            inference.init_models(spo2_path=SPO2_MODEL_PATH, ecg_path=ECG_MODEL_PATH)
            print(f"✅ ML models initialized successfully")
        except Exception as e:
            print(f"⚠️ ML models initialization failed (will use mock mode): {e}")
    else:
        print(f"ℹ️ ML models disabled - using mock mode")
    
    print("==================================================")
    print("SOMNIA Sleep Health Monitoring System")
    print("Team: Chimpanzini Bananini")
    print(f"Starting up at {datetime.now()}")
    print("==================================================")

# Conditionally register optional feature routers so default behavior is unchanged

if ENABLE_VIDEO_POSE:
    try:
        from backend.routers.video_pose import router as video_pose_router  # type: ignore
        app.include_router(video_pose_router)
    except Exception as e:
        print(f"[Optional] Video Pose router not loaded: {e}")

if ENABLE_SNORING:
    try:
        from backend.routers.snoring import router as snoring_router  # type: ignore
        app.include_router(snoring_router)
    except Exception as e:
        print(f"[Optional] Snoring router not loaded: {e}")

# ==================== DATA MODELS ====================

class SleepData(BaseModel):
    """Sleep data for analysis"""
    duration_hours: float
    audio_file_id: Optional[str] = None
    video_file_id: Optional[str] = None
    wearable_data: Optional[dict] = None
    environmental_data: Optional[dict] = None
    user_id: str
    recording_date: datetime

class AnalysisResult(BaseModel):
    """Sleep analysis result"""
    sleep_efficiency: float
    total_sleep_time: float
    sleep_stages: dict
    apnea_events: int
    risk_assessment: str
    recommendations: List[str]
    disorders_detected: List[str]

class DisorderInfo(BaseModel):
    """Sleep disorder information"""
    id: str
    name: str
    description: str
    prevalence: str
    symptoms: List[str]

# ==================== API ENDPOINTS ====================

@app.get("/", tags=["Health"])
def read_root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "SOMNIA API",
        "team": "Chimpanzini Bananini",
        "version": API_VERSION,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v1/health", tags=["Health"])
def health_check():
    """Detailed health check"""
    return {
        "status": "operational",
        "service": "SOMNIA - Sleep Health Monitoring",
        "version": API_VERSION,
        "uptime": "running",
        "multimodal_capabilities": [
            "audio_analysis",
            "sleep_stage_classification",
            "disorder_detection",
            "wearable_integration",
            "environmental_monitoring"
        ]
    }

@app.post("/api/v1/upload/audio", status_code=201, tags=["Upload"])
async def upload_audio_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload audio recording for sleep analysis"""
    try:
        if not file.filename.endswith(('.wav', '.mp3', '.m4a', '.flac')):
            raise HTTPException(status_code=400, detail="Invalid audio format")
        
        file_id = f"audio_{datetime.now().timestamp()}"
        return {
            "file_id": file_id,
            "filename": file.filename,
            "message": "Audio file uploaded successfully",
            "user_id": current_user.get("id", "demo_user")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

@app.post("/api/v1/analyze", response_model=AnalysisResult, tags=["Analysis"])
async def analyze_sleep(
    data: SleepData
):
    """Analyze sleep data from multiple modalities with ML model integration (demo mode - no auth required)"""
    try:
        # Generate base analysis (audio processing)
        analysis_result = analyze_sleep_audio(None)
        
        # Extract wearable data if available
        spo2_data = data.wearable_data.get('spo2_data') if data.wearable_data else None
        heart_rate_data = data.wearable_data.get('heart_rate_data') if data.wearable_data else None
        
        # If ML models are enabled and wearable data is available, use real predictions
        if ENABLE_ML_MODELS and (spo2_data or heart_rate_data):
            try:
                from backend.models import inference
                
                # SpO2 Analysis
                if spo2_data:
                    spo2_features = {
                        "avg_spo2": sum(spo2_data) / len(spo2_data) if spo2_data else 98.0,
                        "min_spo2": min(spo2_data) if spo2_data else 95.0,
                    }
                    spo2_result = inference.predict_spo2(spo2_features)
                    print(f"🩺 SpO2 Analysis: {spo2_result}")
                    
                    # Adjust apnea events based on SpO2 prediction
                    if spo2_result["label"] == "low":
                        analysis_result["apnea_events"] = int(analysis_result["apnea_events"] * 1.5)
                
                # Heart Rate / ECG Analysis
                if heart_rate_data:
                    # Calculate HRV features from heart rate data
                    hr_array = heart_rate_data
                    avg_hr = sum(hr_array) / len(hr_array) if hr_array else 70.0
                    # Simple RMSSD approximation
                    diffs = [abs(hr_array[i+1] - hr_array[i]) for i in range(len(hr_array)-1)]
                    rmssd = (sum([d**2 for d in diffs]) / len(diffs)) ** 0.5 if diffs else 30.0
                    
                    ecg_features = {
                        "avg_hr": avg_hr,
                        "rmssd": rmssd,
                    }
                    ecg_result = inference.predict_ecg(ecg_features)
                    print(f"❤️ ECG Analysis: {ecg_result}")
                    
                    # Adjust risk based on ECG prediction
                    if ecg_result["label"] == "abnormal":
                        if analysis_result["risk_assessment"] == "low":
                            analysis_result["risk_assessment"] = "moderate"
                        elif analysis_result["risk_assessment"] == "moderate":
                            analysis_result["risk_assessment"] = "high"
                
            except Exception as e:
                print(f"⚠️ ML model inference failed, using mock mode: {e}")
        
        # Detect disorders
        disorders = detect_sleep_disorders(analysis_result)
        
        # Generate recommendations
        report = generate_sleep_report(analysis_result, disorders)
        
        return {
            "sleep_efficiency": analysis_result["sleep_efficiency"],
            "total_sleep_time": analysis_result["total_sleep_time"],
            "sleep_stages": analysis_result["sleep_stages"],
            "apnea_events": analysis_result["apnea_events"],
            "risk_assessment": analysis_result["risk_assessment"],
            "recommendations": report["recommendations"],
            "disorders_detected": disorders
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/api/v1/disorders", tags=["Information"])
def get_sleep_disorders() -> dict:
    """Get information about all sleep disorders SOMNIA can detect"""
    return {
        "total_disorders": 8,
        "disorders": [
            {
                "id": "sleep_apnea",
                "name": "Sleep Apnea & Snoring",
                "description": "Repeated breathing interruptions during sleep (>10 seconds)",
                "prevalence": "30-40 million undiagnosed Indians",
                "symptoms": ["Loud snoring", "Gasping for air", "Daytime fatigue", "Morning headaches"],
                "modalities_used": ["Audio", "Video", "Wearable (SpO2)"],
                "risk_level": "HIGH"
            },
            {
                "id": "cardiac_arrhythmia",
                "name": "Cardiac Arrhythmia (Atrial Fibrillation)",
                "description": "Irregular heart rhythm during sleep",
                "prevalence": "5-10 million undiagnosed Indians",
                "symptoms": ["Heart palpitations", "Chest discomfort", "Shortness of breath"],
                "modalities_used": ["Audio (heartbeat)", "Wearable (HRV)"],
                "risk_level": "CRITICAL"
            },
            {
                "id": "rbd",
                "name": "REM Behavior Disorder",
                "description": "Acting out violent dreams during REM sleep",
                "prevalence": "1-2 million cases in India",
                "symptoms": ["Violent movements", "Talking/shouting", "Injury risk"],
                "modalities_used": ["Video", "Audio"],
                "risk_level": "HIGH",
                "note": "80% develop Parkinson's within 10-15 years"
            },
            {
                "id": "insomnia",
                "name": "Insomnia & Mental Health Disorders",
                "description": "Chronic difficulty falling asleep or staying asleep",
                "prevalence": "150 million Indians with mental health issues",
                "symptoms": ["Difficulty falling asleep", "Frequent wake-ups", "Non-restorative sleep"],
                "modalities_used": ["Sleep pattern analysis", "Duration tracking"],
                "risk_level": "MEDIUM"
            },
            {
                "id": "bruxism",
                "name": "Bruxism (Teeth Grinding)",
                "description": "Unconscious grinding/clenching of teeth during sleep",
                "prevalence": "30-40 million Indians",
                "symptoms": ["Teeth grinding sounds", "Jaw pain", "Worn tooth enamel"],
                "modalities_used": ["Audio (400-800 Hz signature)"],
                "risk_level": "MEDIUM"
            },
            {
                "id": "pregnancy_sleep",
                "name": "Pregnancy Sleep Disorders",
                "description": "Sleep issues during pregnancy including position monitoring",
                "prevalence": "15-20 million pregnant women annually",
                "symptoms": ["Frequent wake-ups", "Sleep apnea", "Supine sleeping danger"],
                "modalities_used": ["Video (position)", "Audio", "Wearable"],
                "risk_level": "HIGH"
            },
            {
                "id": "sids",
                "name": "SIDS (Sudden Infant Death Syndrome)",
                "description": "Prevention through breathing and position monitoring",
                "prevalence": "50,000+ infant deaths annually in India",
                "symptoms": ["Breathing cessation", "Positional asphyxiation"],
                "modalities_used": ["Video (breathing)", "Audio"],
                "risk_level": "CRITICAL"
            },
            {
                "id": "circadian",
                "name": "Circadian Rhythm Disorders",
                "description": "Misalignment of biological clock with sleep schedule",
                "prevalence": "50+ million shift workers",
                "symptoms": ["Excessive daytime sleepiness", "Insomnia", "Poor sleep quality"],
                "modalities_used": ["Body temperature", "Light exposure", "Sleep timing"],
                "risk_level": "MEDIUM"
            }
        ]
    }

@app.get("/api/v1/team", tags=["Information"])
def get_team_info():
    """Get team information"""
    return {
        "team_name": "Chimpanzini Bananini",
        "project": "SOMNIA - Comprehensive Sleep Health Monitoring System",
        "hackathon": "IIT Mandi iHub Multimodal AI Hackathon",
        "members": 4,
        "repository": "https://github.com/Vidyans26/SOMNIA",
        "description": "Detecting 8 critical sleep disorders using multimodal AI (audio, video, wearables, environmental sensors)"
    }

@app.get("/api/v1/demo-analysis", tags=["Demo"])
def get_demo_analysis():
    """Get demo sleep analysis (for testing UI)"""
    return {
        "sleep_efficiency": 0.86,
        "total_sleep_time": 7.2,
        "sleep_stages": {
            "wake": 36,
            "light": 224,
            "deep": 98,
            "rem": 74
        },
        "apnea_events": 8,
        "risk_assessment": "moderate",
        "recommendations": [
            "Try sleeping on your side to reduce apnea events",
            "Keep room temperature between 18-21°C for optimal sleep",
            "Reduce screen time 1 hour before bed to improve REM sleep"
        ],
        "disorders_detected": ["mild_positional_apnea"],
        "analysis_timestamp": datetime.now().isoformat()
    }

# ==================== ERROR HANDLERS ====================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "timestamp": datetime.now().isoformat()},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler"""
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "timestamp": datetime.now().isoformat()},
    )

# ==================== STARTUP/SHUTDOWN ====================

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event"""
    print("SOMNIA API shutting down...")

# ==================== MAIN ====================

if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )