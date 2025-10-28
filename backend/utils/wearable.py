# Backend: wearable ingestion utilities and simple persistence.
# Add this file to backend/utils/wearable.py

import os
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict

STORAGE_DIR = Path(os.getenv("UPLOAD_DIR", os.path.join(os.getcwd(), "uploads")))
WEARABLE_DIR = STORAGE_DIR / "wearable"
WEARABLE_DIR.mkdir(parents=True, exist_ok=True)

def summarize_wearable_samples(samples: List[Dict]) -> Dict:
    """
    Expect samples: list of { "ts": 1698000000, "hr": 72, "spo2": 98, "hrv": 45 }
    Returns summary dict with min_spo2, avg_hr, spo2_drops (count < 90), hr_std (simple), sample_count
    """
    if not samples:
        return {"sample_count": 0}

    hrs = [s.get("hr") for s in samples if s.get("hr") is not None]
    spos = [s.get("spo2") for s in samples if s.get("spo2") is not None]
    hrvs = [s.get("hrv") for s in samples if s.get("hrv") is not None]

    import numpy as np

    summary = {}
    summary["sample_count"] = len(samples)
    summary["min_spo2"] = float(min(spos)) if spos else None
    summary["avg_spo2"] = float(np.mean(spos)) if spos else None
    summary["min_hr"] = float(min(hrs)) if hrs else None
    summary["avg_hr"] = float(np.mean(hrs)) if hrs else None
    summary["hr_std"] = float(np.std(hrs)) if len(hrs) > 1 else None
    summary["avg_hrv"] = float(np.mean(hrvs)) if hrvs else None
    # count clinically relevant SpO2 drops (below 90)
    summary["spo2_drops"] = int(sum(1 for x in spos if x < 90)) if spos else 0

    # simple risk heuristic
    risk_score = 0.0
    if summary["min_spo2"] is not None:
        if summary["min_spo2"] < 85:
            risk_score += 0.6
        elif summary["min_spo2"] < 90:
            risk_score += 0.3
    if summary.get("spo2_drops", 0) > 3:
        risk_score += 0.3
    if summary.get("avg_hr", 0) > 100:
        risk_score += 0.1

    summary["risk_score"] = round(min(1.0, risk_score), 2)
    if summary["risk_score"] >= 0.6:
        summary["risk_level"] = "high"
    elif summary["risk_score"] >= 0.3:
        summary["risk_level"] = "moderate"
    else:
        summary["risk_level"] = "low"

    return summary

def save_wearable_record(user_id: str, summary: Dict, raw_payload: Dict) -> Dict:
    """
    Save a JSON record to uploads/wearable/<timestamp>_<user>.json
    Returns a record dict with id/path/timestamp
    """
    now = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    filename = f"wearable_{user_id}_{now}.json"
    out_path = WEARABLE_DIR / filename
    record = {
        "id": filename,
        "user_id": user_id,
        "timestamp": now,
        "summary": summary,
        "raw": raw_payload  # caution: you may want to omit raw before production
    }
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(record, f, ensure_ascii=False, indent=2)
    return {"id": filename, "path": str(out_path), "timestamp": now}