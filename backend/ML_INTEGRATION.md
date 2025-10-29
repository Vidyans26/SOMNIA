# 🤖 ML Models Integration Guide

## Overview
SOMNIA supports real-time ML inference for:
- **SpO2 Analysis** - Oxygen saturation pattern classification
- **ECG/Heart Rate** - Cardiac rhythm abnormality detection  
- **Audio Analysis** - Snoring and apnea event detection
- **Video Pose** - Sleep position and movement tracking

## Quick Start

### 1. Enable ML Models

Copy the ML configuration template:
```bash
cd backend
copy .env.ml .env
```

Or manually add to your `.env`:
```bash
ENABLE_ML_MODELS=true
```

### 2. Install ML Dependencies

The models require TensorFlow:
```bash
pip install tensorflow keras
```

For video pose analysis:
```bash
pip install mediapipe opencv-python-headless
```

For snoring detection:
```bash
pip install librosa soundfile
```

### 3. Verify Model Files

Check that model weights exist:
```
backend/models/
├── SpO2_weights.hdf5   ✅ SpO2 classification model
├── ecg_weights.hdf5    ✅ ECG abnormality detection
└── snoring/            ✅ Snoring detection models
```

### 4. Restart Backend

```bash
uvicorn backend.main:app --reload
```

You should see:
```
🤖 Initializing ML models...
  - SpO2 model: backend/models/SpO2_weights.hdf5
  - ECG model: backend/models/ecg_weights.hdf5
✅ ML models initialized successfully
```

## Features

### SpO2 Analysis
- **Input**: Array of SpO2 readings from wearable device
- **Output**: Classification (normal/low) + probability
- **Integration**: Automatically adjusts apnea event count based on oxygen desaturation

### Heart Rate / ECG Analysis
- **Input**: Array of heart rate readings or ECG signal
- **Output**: Classification (normal/abnormal) + probability
- **Integration**: Automatically adjusts risk assessment based on cardiac patterns

### Audio Analysis (Optional)
Enable with: `ENABLE_SNORING=true`
- **Input**: Audio recording of sleep session
- **Output**: Snoring detection, breathing pause events
- **Endpoint**: `POST /api/v1/snoring/detect`

### Video Pose Analysis (Optional)
Enable with: `ENABLE_VIDEO_POSE=true`
- **Input**: Video of sleeping person
- **Output**: Sleep position tracking, movement analysis
- **Endpoint**: `POST /api/v1/video-pose/analyze`

## API Usage

### Send Wearable Data with Analysis Request

```json
POST /api/v1/analyze
{
  "audio_uri": "file://...",
  "video_uri": "file://...",
  "duration": 28800,
  "spo2_data": [98, 97, 96, 95, 96, 97],
  "heart_rate_data": [65, 68, 70, 72, 68, 66]
}
```

### Response with ML Predictions

```json
{
  "sleep_efficiency": 0.87,
  "total_sleep_time": 7.5,
  "apnea_events": 12,  // Adjusted based on SpO2 ML prediction
  "risk_assessment": "moderate",  // Adjusted based on ECG ML prediction
  "disorders_detected": ["sleep_apnea"],
  "recommendations": [...]
}
```

## Mobile App Integration

The mobile app is already configured to send `spo2_data` and `heart_rate_data` if available from wearable sensors.

### No Code Changes Needed!

Just enable ML models in backend and the app will automatically:
1. Send wearable data if available
2. Receive ML-enhanced analysis results
3. Fall back to mock data if ML fails

## Performance

### With ML Models (ENABLE_ML_MODELS=true)
- Startup time: +5-10 seconds (TensorFlow loading)
- Analysis time: +200-500ms per request
- Memory: +500MB (TensorFlow runtime)

### Mock Mode (ENABLE_ML_MODELS=false)
- Startup time: Instant
- Analysis time: <50ms per request
- Memory: Minimal

## Troubleshooting

### "ModuleNotFoundError: No module named 'tensorflow'"
Install: `pip install tensorflow`

### "Model file not found"
Check paths in `.env`:
```bash
SPO2_MODEL_PATH=backend/models/SpO2_weights.hdf5
ECG_MODEL_PATH=backend/models/ecg_weights.hdf5
```

### "⚠️ ML models initialization failed (will use mock mode)"
- This is OK! The system falls back to mock mode automatically
- Check console for specific error
- Verify TensorFlow installation: `python -c "import tensorflow; print(tensorflow.__version__)"`

### Models load but predictions fail
- The system will catch errors and log them
- Analysis will continue using mock mode for failed modalities
- Check console for: `⚠️ ML model inference failed, using mock mode:`

## Architecture

```
┌─────────────────────────────────────┐
│     Mobile App (React Native)       │
│  Sends: spo2_data, heart_rate_data  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    Backend API (/api/v1/analyze)    │
│  ┌──────────────────────────────┐   │
│  │ IF ENABLE_ML_MODELS:         │   │
│  │  - Load SpO2 model           │   │
│  │  - Load ECG model            │   │
│  │  - Run inference             │   │
│  │  - Adjust analysis results   │   │
│  │ ELSE:                        │   │
│  │  - Use mock predictions      │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     ML Models (TensorFlow/Keras)    │
│  - SpO2_weights.hdf5                │
│  - ecg_weights.hdf5                 │
└─────────────────────────────────────┘
```

## Feature Flags Summary

| Flag | Default | What it does |
|------|---------|--------------|
| `ENABLE_ML_MODELS` | `false` | Enables SpO2 & ECG model inference |
| `ENABLE_SNORING` | `false` | Enables `/api/v1/snoring/*` endpoints |
| `ENABLE_VIDEO_POSE` | `false` | Enables `/api/v1/video-pose/*` endpoints |
| `USE_MOCK` | `true` | Forces mock mode even if models loaded |

## Next Steps

1. ✅ Enable ML models: `ENABLE_ML_MODELS=true`
2. ✅ Install TensorFlow: `pip install tensorflow`
3. ✅ Restart backend
4. ✅ Test with mobile app - send wearable data
5. 🔜 Enable snoring: `ENABLE_SNORING=true`
6. 🔜 Enable video pose: `ENABLE_VIDEO_POSE=true`

**Your ML models are now integrated! 🎉**
