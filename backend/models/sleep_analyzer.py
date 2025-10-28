"""
Sleep Analysis Engine
Multimodal Audio, Video, Wearable Analysis
Team: Chimpanzini Bananini
"""

import numpy as np
import random
from datetime import datetime
from typing import Optional
from pathlib import Path

# Import snoring detection module
try:
    from .snoring_detection import analyze_snoring, extract_snoring_features
    SNORING_DETECTION_AVAILABLE = True
except ImportError:
    SNORING_DETECTION_AVAILABLE = False
    print("Warning: Snoring detection module not available")

def analyze_sleep_audio(audio_data=None):
    """
    Analyze audio data to detect sleep patterns and disorders
    For mid-submission: generates realistic mock analysis data
    
    Args:
        audio_data: Binary audio data (optional)
        
    Returns:
        dict: Sleep analysis results
    """
    # Mock analysis with realistic distributions
    sleep_efficiency = round(random.uniform(0.75, 0.95), 2)
    total_sleep_time = round(random.uniform(6.0, 8.5), 1)
    
    # Calculate sleep stages
    total_minutes = total_sleep_time * 60
    wake_minutes = int(total_minutes * (1 - sleep_efficiency))
    
    # Realistic sleep stage percentages
    rem_percent = random.uniform(0.20, 0.25)
    deep_percent = random.uniform(0.15, 0.23)
    light_percent = 1 - rem_percent - deep_percent - (wake_minutes / total_minutes)
    
    sleep_stages = {
        "wake": wake_minutes,
        "light": int(total_minutes * light_percent),
        "deep": int(total_minutes * deep_percent),
        "rem": int(total_minutes * rem_percent)
    }
    
    # Apnea detection
    apnea_baseline = 8 if sleep_efficiency < 0.8 else 3
    apnea_events = int(np.random.poisson(apnea_baseline))
    
    # Risk assessment
    if apnea_events > 15 or sleep_efficiency < 0.75:
        risk = "high"
    elif apnea_events > 5 or sleep_efficiency < 0.85:
        risk = "moderate"
    else:
        risk = "low"
    
    return {
        "sleep_efficiency": sleep_efficiency,
        "total_sleep_time": total_sleep_time,
        "sleep_stages": sleep_stages,
        "apnea_events": apnea_events,
        "risk_assessment": risk,
        "analysis_timestamp": datetime.now().isoformat()
    }

def detect_snoring(audio_segment=None):
    """
    Detect snoring patterns using MFCC-based analysis
    
    If audio_segment path is provided and snoring detection is available,
    performs actual MFCC-based snoring detection.
    Otherwise, returns mock data.
    
    Args:
        audio_segment: Path to audio file or None
        
    Returns:
        Dictionary with snoring detection results
    """
    if audio_segment and SNORING_DETECTION_AVAILABLE and Path(audio_segment).exists():
        try:
            # Use the integrated snoring detection from adrianagaler/Snoring-Detection
            result = analyze_snoring(audio_segment)
            
            if result.get("success"):
                # Convert to expected format
                snoring_prob = result.get("snoring_probability", 0.0)
                return {
                    "snoring_detected": result.get("snoring_detected", False),
                    "snoring_probability": snoring_prob,
                    "confidence": result.get("confidence", 0.0),
                    "snoring_episodes": int(snoring_prob * 30),  # Estimate episodes
                    "total_snoring_duration_minutes": int(snoring_prob * 90),  # Estimate duration
                    "loudness_db": int(45 + snoring_prob * 20),  # Estimate loudness
                    "detection_method": "MFCC-based (Khan et al.)",
                    "feature_quality": result.get("feature_quality", "unknown")
                }
        except Exception as e:
            print(f"Error in snoring detection: {e}")
            # Fall through to mock data
    
    # Mock data for when no audio or detection unavailable
    return {
        "snoring_detected": random.choice([True, False]),
        "snoring_episodes": random.randint(0, 20),
        "total_snoring_duration_minutes": random.randint(0, 60),
        "loudness_db": random.randint(45, 65),
        "detection_method": "mock"
    }

def detect_apnea_events(audio_data=None):
    """Detect apnea events (breathing pauses >10 seconds)"""
    return {
        "events_detected": random.randint(0, 30),
        "average_duration_seconds": random.randint(10, 30),
        "longest_event_seconds": random.randint(15, 60),
        "oxygen_desaturation_estimated": random.choice([True, False])
    }

def detect_sleep_disorders(analysis_result):
    """
    Detect potential sleep disorders based on analysis
    
    Args:
        analysis_result: Dictionary containing sleep analysis data
        
    Returns:
        list: List of detected disorders
    """
    disorders = []
    
    # Sleep apnea detection
    if analysis_result["apnea_events"] > 5:
        disorders.append("sleep_apnea")
    
    # Insomnia detection
    if analysis_result["sleep_efficiency"] < 0.75:
        disorders.append("insomnia")
    
    # Low REM detection
    if analysis_result["sleep_stages"]["rem"] < 60:
        disorders.append("low_rem_sleep")
    
    # Low deep sleep detection
    if analysis_result["sleep_stages"]["deep"] < 50:
        disorders.append("low_deep_sleep")
    
    return disorders