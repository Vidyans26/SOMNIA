# 🔗 SOMNIA Complete Integration Guide

This guide explains how all components of SOMNIA work together - from mobile app to backend API to ML models to user interface.

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Complete Architecture](#complete-architecture)
3. [ML Model Integration](#ml-model-integration)
4. [Data Flow](#data-flow)
5. [API Integration](#api-integration)
6. [Mobile App Integration](#mobile-app-integration)
7. [Docker Deployment](#docker-deployment)
8. [Environment Configuration](#environment-configuration)
9. [Troubleshooting](#troubleshooting)

---

## System Overview

SOMNIA is a **multimodal sleep health monitoring system** with complete ML integration:

```
Mobile App (React Native + Expo)
          ↓
    HTTP/REST API
          ↓
Backend (FastAPI + Python)
          ↓
ML Models (TensorFlow + Keras)
          ↓
Enhanced Sleep Analysis
          ↓
Mobile UI (Charts + Recommendations)
```

### Key Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Mobile App** | React Native, Expo SDK 51, TypeScript | Data collection, UI display |
| **Backend API** | FastAPI 0.104, Python 3.11+ | Request handling, preprocessing |
| **ML Models** | TensorFlow 2.20, Keras 3.12 | Sleep analysis, disorder detection |
| **Docker** | Docker Compose | Production deployment |
| **Environment** | .env configuration | Feature flags, model paths |

---

## Complete Architecture

### Full System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SOMNIA Architecture v1.0                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   Mobile App     │  React Native + Expo SDK 51
│  (Somnia.app)    │  
│                  │  Features:
│  Components:     │  • Audio Recording (Expo AV)
│  - CameraPreview │  • Video Capture (Expo Camera)
│  - HeartRateChart│  • Wearable Data Simulation
│  - PositionChart │  • Real-time Charts (Victory Native)
│  - MetricCard    │  • AsyncStorage for offline
│  - SettingsPanel │  • 3-tier API fallback
└────────┬─────────┘
         │
         │ Data Collected:
         │ • Audio: .wav files (sleep sounds)
         │ • Video: .mp4 files (movement)
         │ • SpO2: Array of readings (95-100%)
         │ • Heart Rate: Array of bpm (60-100)
         │
         │ HTTP POST Request
         │ Endpoint: /api/v1/analyze
         │ Content-Type: multipart/form-data + JSON
         ↓

┌──────────────────────────────────────────────────────────────────┐
│                         API LAYER                                │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  Backend API     │  FastAPI + Uvicorn
│   (main.py)      │  
│                  │  Endpoints:
│  Routers:        │  • POST /api/v1/analyze
│  - inference.py  │  • POST /api/v1/demo-analysis
│  - snoring.py    │  • POST /api/v1/snoring/detect
│  - video_pose.py │  • GET  /api/v1/disorders
│                  │  • GET  /api/v1/health
└────────┬─────────┘  • GET  /docs (Swagger UI)
         │
         │ Request Processing:
         │ 1. Validate request (Pydantic)
         │ 2. Save uploaded files
         │ 3. Extract wearable data arrays
         │ 4. Preprocess features
         │
         ↓

┌──────────────────────────────────────────────────────────────────┐
│                         ML LAYER                                 │
└──────────────────────────────────────────────────────────────────┘

         ┌──────────────────┬──────────────────┐
         │                  │                  │
         ↓                  ↓                  ↓
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
│  SpO2 Model      │ │  ECG Model   │ │ Snoring Model│
│  (TensorFlow)    │ │  (Keras)     │ │  (Optional)  │
│                  │ │              │ │              │
│ Input:           │ │ Input:       │ │ Input:       │
│ • SpO2 array     │ │ • HR array   │ │ • Audio      │
│   [98,97,96...]  │ │   [72,74...] │ │   features   │
│                  │ │              │ │              │
│ Output:          │ │ Output:      │ │ Output:      │
│ • Apnea risk     │ │ • Cardiac    │ │ • Snoring    │
│ • Confidence     │ │   abnormality│ │   events     │
└────────┬─────────┘ └──────┬───────┘ └──────┬───────┘
         │                  │                 │
         └──────────────────┼─────────────────┘
                            │
                            ↓
                  ┌──────────────────┐
                  │ Multimodal Fusion│
                  │  (inference.py)  │
                  │                  │
                  │ • Combine results│
                  │ • Calculate risk │
                  │ • Detect disorders│
                  │ • Generate recs  │
                  └────────┬─────────┘
                           │
                           ↓

┌──────────────────────────────────────────────────────────────────┐
│                      ANALYSIS LAYER                              │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│ Sleep Analyzer   │
│                  │
│ Calculations:    │
│ • Sleep efficiency (time asleep / time in bed)
│ • Sleep stages (REM/NREM/Deep/Wake)
│ • Disorder detection (Apnea/Insomnia/Narcolepsy)
│ • Risk scoring (0.0 - 1.0 scale)
│ • Recommendations (personalized advice)
│
│ Output Format:   │
│ {                │
│   sleep_efficiency: 87.5,
│   sleep_stages: {
│     wake_minutes: 15,
│     light_sleep_minutes: 210,
│     deep_sleep_minutes: 90,
│     rem_sleep_minutes: 75
│   },
│   risk_assessment: {
│     level: "low",    // low | moderate | high
│     score: 0.23
│   },
│   disorders_detected: [
│     "Mild Sleep Apnea"
│   ],
│   recommendations: [
│     "Maintain regular sleep schedule",
│     "Monitor oxygen saturation levels"
│   ]
│ }                │
└────────┬─────────┘
         │
         │ JSON Response
         │ Status: 200 OK
         │ Content-Type: application/json
         ↓

┌──────────────────────────────────────────────────────────────────┐
│                         UI LAYER                                 │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   Mobile UI      │
│   (index.tsx)    │
│                  │
│ Display Cards:   │
│                  │
│ 1. Sleep Efficiency Card
│    ┌──────────────────┐
│    │ Sleep Efficiency │
│    │     87.5%        │
│    └──────────────────┘
│
│ 2. Sleep Stages Card
│    ┌──────────────────┐
│    │ Sleep Stages     │
│    │ Wake: 15 min     │
│    │ Light: 210 min   │
│    │ Deep: 90 min     │
│    │ REM: 75 min      │
│    └──────────────────┘
│
│ 3. ML Risk Assessment
│    ┌──────────────────┐
│    │ Risk: LOW ✅     │
│    │ Score: 0.23      │
│    └──────────────────┘
│    Color: green (#4CAF50)
│
│ 4. Disorders Detected
│    ┌──────────────────┐
│    │ ⚠️ Mild Sleep    │
│    │    Apnea         │
│    └──────────────────┘
│
│ 5. Recommendations
│    ┌──────────────────┐
│    │ 💡 Maintain      │
│    │    regular sleep │
│    │    schedule      │
│    │ 💡 Monitor SpO2  │
│    └──────────────────┘
└──────────────────┘
```

---

## ML Model Integration

### Available Models

| Model | File | Size | Purpose | Status |
|-------|------|------|---------|--------|
| **SpO2** | `SpO2_weights.hdf5` | ~5MB | Sleep apnea detection | ✅ Active |
| **ECG** | `ecg_weights.hdf5` | ~8MB | Cardiac abnormality | ✅ Active |
| **Snoring** | `snoring_model.h5` | ~12MB | Snoring detection | 🔄 Optional |
| **Pose** | `pose_model.h5` | ~20MB | Position tracking | 🔄 Experimental |

### Model Loading Process

```python
# backend/models/inference.py

from tensorflow import keras
import numpy as np

# Global model variables
SPO2_MODEL = None
ECG_MODEL = None

def init_models():
    """Initialize ML models on startup"""
    global SPO2_MODEL, ECG_MODEL
    
    if config.ENABLE_ML_MODELS:
        print("🤖 Initializing ML models...")
        
        # Load SpO2 model
        SPO2_MODEL = keras.models.load_model(
            config.SPO2_MODEL_PATH
        )
        
        # Load ECG model
        ECG_MODEL = keras.models.load_model(
            config.ECG_MODEL_PATH
        )
        
        print("✅ ML models initialized successfully")

def predict_spo2(features: np.ndarray):
    """Predict sleep apnea risk from SpO2 data"""
    if SPO2_MODEL and not config.USE_MOCK:
        prediction = SPO2_MODEL.predict(features)
        return prediction
    else:
        # Return mock data
        return np.array([[0.15, 0.70, 0.15]])  # [low, normal, high]

def predict_ecg(features: np.ndarray):
    """Predict cardiac abnormality from heart rate"""
    if ECG_MODEL and not config.USE_MOCK:
        prediction = ECG_MODEL.predict(features)
        return prediction
    else:
        # Return mock data
        return np.array([[0.10, 0.85, 0.05]])  # [abnormal, normal, arrhythmia]
```

### Feature Preprocessing

```python
def preprocess_spo2(spo2_data: list) -> np.ndarray:
    """
    Preprocess SpO2 data for model input
    
    Input: [98, 97, 96, 95, 97, 98, ...]
    Output: (1, sequence_length, 1) numpy array
    """
    # Convert to numpy array
    data = np.array(spo2_data, dtype=np.float32)
    
    # Normalize to 0-1 range
    data = (data - 85) / 15  # Assume SpO2 range 85-100
    
    # Reshape for model (batch, sequence, features)
    data = data.reshape(1, -1, 1)
    
    return data

def preprocess_heart_rate(hr_data: list) -> np.ndarray:
    """
    Preprocess heart rate data for model input
    
    Input: [72, 74, 71, 73, 75, ...]
    Output: (1, sequence_length, 1) numpy array
    """
    # Convert to numpy array
    data = np.array(hr_data, dtype=np.float32)
    
    # Normalize to 0-1 range
    data = (data - 40) / 60  # Assume HR range 40-100
    
    # Reshape for model (batch, sequence, features)
    data = data.reshape(1, -1, 1)
    
    return data
```

---

## Data Flow

### Complete Request-Response Cycle

#### 1. Mobile App Sends Data

```typescript
// services/apiService.ts

export const analyze = async (
  audioPath: string,
  wearableData?: WearableData
): Promise<AnalysisResult> => {
  const formData = new FormData();
  
  // Add audio file
  formData.append('audio_file', {
    uri: audioPath,
    name: 'sleep_audio.wav',
    type: 'audio/wav',
  });
  
  // Add wearable data
  if (wearableData) {
    formData.append('wearable_data', JSON.stringify(wearableData));
  }
  
  // Send to backend
  const response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  const data = await response.json();
  return mapAnalyzeToResult(data);
};
```

#### 2. Backend Processes Request

```python
# backend/main.py

@app.post("/api/v1/analyze")
async def analyze_sleep(
    audio_file: UploadFile = File(...),
    wearable_data: Optional[str] = Form(None)
):
    # Save audio file
    audio_path = f"uploads/{audio_file.filename}"
    with open(audio_path, "wb") as f:
        f.write(await audio_file.read())
    
    # Parse wearable data
    wearable = None
    if wearable_data:
        wearable = json.loads(wearable_data)
    
    # Process with ML models
    if config.ENABLE_ML_MODELS and wearable:
        # Preprocess features
        spo2_features = preprocess_spo2(wearable['spo2_data'])
        hr_features = preprocess_heart_rate(wearable['heart_rate_data'])
        
        # Get predictions
        spo2_pred = predict_spo2(spo2_features)
        ecg_pred = predict_ecg(hr_features)
        
        # Fuse results
        risk_score = calculate_risk(spo2_pred, ecg_pred)
        disorders = detect_disorders(spo2_pred, ecg_pred)
        recommendations = generate_recommendations(disorders, risk_score)
    
    # Build response
    response = {
        "sleep_efficiency": calculate_efficiency(),
        "sleep_stages": calculate_stages(),
        "risk_assessment": {
            "level": risk_level(risk_score),
            "score": risk_score
        },
        "disorders_detected": disorders,
        "recommendations": recommendations
    }
    
    return response
```

#### 3. Mobile App Displays Results

```typescript
// app/(tabs)/index.tsx

const handleAnalyze = async () => {
  setAnalyzing(true);
  
  // Generate wearable data
  const wearableData = {
    spo2_data: generateSpO2Data(390),      // 6.5 hours of data
    heart_rate_data: generateHeartRateData(390)
  };
  
  // Call API
  const result = await apiService.analyze(audioPath, wearableData);
  
  setAnalysisResult(result);
  setAnalyzing(false);
};

// Render UI
{analysisResult && (
  <>
    {/* Sleep Efficiency Card */}
    {analysisResult.sleepEfficiency && (
      <Card>
        <Text>Sleep Efficiency</Text>
        <Text>{analysisResult.sleepEfficiency}%</Text>
      </Card>
    )}
    
    {/* Sleep Stages Card */}
    <Card>
      <Text>Sleep Stages</Text>
      <Text>Wake: {analysisResult.wakeMinutes} min</Text>
      <Text>Light: {analysisResult.lightSleepMinutes} min</Text>
      <Text>Deep: {analysisResult.deepSleepMinutes} min</Text>
      <Text>REM: {analysisResult.remSleepMinutes} min</Text>
    </Card>
    
    {/* ML Risk Assessment */}
    {analysisResult.riskLevel && (
      <Card style={getRiskColor(analysisResult.riskLevel)}>
        <Text>Risk: {analysisResult.riskLevel.toUpperCase()}</Text>
      </Card>
    )}
    
    {/* Disorders Detected */}
    {analysisResult.disorders && analysisResult.disorders.length > 0 && (
      <Card>
        <Text>Disorders Detected</Text>
        {analysisResult.disorders.map((disorder, idx) => (
          <Text key={idx}>⚠️ {disorder}</Text>
        ))}
      </Card>
    )}
    
    {/* ML Recommendations */}
    {analysisResult.recommendations && (
      <Card>
        <Text>Recommendations</Text>
        {analysisResult.recommendations.map((rec, idx) => (
          <Text key={idx}>💡 {rec}</Text>
        ))}
      </Card>
    )}
  </>
)}
```

---

## API Integration

### Endpoint: POST /api/v1/analyze

**Request:**

```http
POST /api/v1/analyze HTTP/1.1
Host: localhost:8000
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="audio_file"; filename="sleep.wav"
Content-Type: audio/wav

[Binary audio data]
------WebKitFormBoundary
Content-Disposition: form-data; name="wearable_data"

{
  "spo2_data": [98, 97, 96, 95, 97, 98, 97, 96, ...],
  "heart_rate_data": [72, 74, 71, 73, 75, 72, 71, ...]
}
------WebKitFormBoundary--
```

**Response:**

```json
{
  "analysis_id": "abc123",
  "timestamp": "2024-01-15T14:30:00Z",
  "sleep_efficiency": 87.5,
  "total_sleep_minutes": 390,
  "sleep_stages": {
    "wake_minutes": 15,
    "light_sleep_minutes": 210,
    "deep_sleep_minutes": 90,
    "rem_sleep_minutes": 75
  },
  "apnea_events": 3,
  "snoring_events": 12,
  "risk_assessment": {
    "level": "low",
    "score": 0.23
  },
  "disorders_detected": [
    "Mild Sleep Apnea"
  ],
  "recommendations": [
    "Maintain regular sleep schedule",
    "Monitor oxygen saturation levels",
    "Consider sleeping on your side"
  ]
}
```

### Other Endpoints

```bash
# Get demo analysis (mock data)
GET /api/v1/demo-analysis

# Detect snoring in audio
POST /api/v1/snoring/detect
Content-Type: multipart/form-data
audio_file: [Binary WAV file]

# Get disorder information
GET /api/v1/disorders

# Health check
GET /api/v1/health

# API documentation
GET /docs
```

---

## Mobile App Integration

### Project Structure

```
somnia-app/SOMNIA app/Somnia/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Main recording screen
│   │   └── explore.tsx        # Sleep data explorer
│   ├── _layout.tsx            # Root layout
│   └── modal.tsx              # Settings modal
├── services/
│   ├── apiService.ts          # Backend API client
│   ├── audioService.ts        # Audio recording
│   ├── videoService.ts        # Video capture
│   ├── wearableService.ts     # Wearable data simulation
│   └── storageService.ts      # Local storage
├── types/
│   └── index.ts               # TypeScript definitions
├── components/
│   ├── HeartRateChart.tsx     # Heart rate visualization
│   ├── PositionChart.tsx      # Sleep position chart
│   ├── MetricCard.tsx         # Metric display card
│   └── SettingsPanel.tsx      # Settings UI
└── package.json
```

### Key Services

#### API Service (apiService.ts)

```typescript
export const apiService = {
  // Analyze sleep with ML models
  analyze: async (audioPath: string, wearableData?: WearableData) => {
    // Try real API
    try {
      return await callRealAPI(audioPath, wearableData);
    } catch (error) {
      // Fallback to demo API
      try {
        return await callDemoAPI();
      } catch (demoError) {
        // Fallback to mock data
        return getMockData();
      }
    }
  },
  
  // Get disorder information
  getDisorders: async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/disorders`);
    return await response.json();
  },
  
  // Health check
  healthCheck: async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/health`);
    return await response.json();
  }
};
```

#### Wearable Service (wearableService.ts)

```typescript
export const wearableService = {
  // Generate realistic SpO2 data
  generateSpO2Data: (duration: number): number[] => {
    const data: number[] = [];
    for (let i = 0; i < duration; i++) {
      // Normal range: 95-100%
      const value = 95 + Math.random() * 5;
      data.push(Math.round(value * 10) / 10);
    }
    return data;
  },
  
  // Generate realistic heart rate data
  generateHeartRateData: (duration: number): number[] => {
    const data: number[] = [];
    for (let i = 0; i < duration; i++) {
      // Normal sleeping range: 60-80 bpm
      const value = 60 + Math.random() * 20;
      data.push(Math.round(value));
    }
    return data;
  }
};
```

---

## Docker Deployment

### Docker Compose Configuration

```yaml
# docker-compose.yml

version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    container_name: somnia-backend
    environment:
      # Application settings
      - DEBUG=true
      - ENVIRONMENT=production
      - HOST=0.0.0.0
      - PORT=8000
      
      # ML Model flags
      - ENABLE_ML_MODELS=true
      - USE_MOCK=false
      - ENABLE_SNORING=true
      - ENABLE_VIDEO_POSE=false
      
      # Model paths
      - SPO2_MODEL_PATH=backend/models/SpO2_weights.hdf5
      - ECG_MODEL_PATH=backend/models/ecg_weights.hdf5
    
    ports:
      - "8000:8000"
    
    volumes:
      - ./uploads:/app/uploads
      - ./backend/models:/app/backend/models
    
    restart: unless-stopped
    
    healthcheck:
      test: ["CMD", "python", "-c", "import requests; requests.get('http://localhost:8000/api/v1/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  default:
    name: somnia-network
```

### Dockerfile

```dockerfile
# backend/Dockerfile

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for ML
RUN apt-get update && apt-get install -y \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY backend/requirements.txt .

# Install Python dependencies (includes TensorFlow)
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set environment variables for ML models
ENV ENABLE_ML_MODELS=true \
    ENABLE_SNORING=true \
    ENABLE_VIDEO_POSE=false \
    USE_MOCK=false

EXPOSE 8000

# Run the application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Deployment Scripts

#### Windows (run.ps1)

```powershell
# Start SOMNIA
.\run.ps1

# Production mode
.\run.ps1 -Mode prod

# Stop services
.\run.ps1 -Stop

# Clean all containers
.\run.ps1 -Clean
```

#### Unix/Mac (run.sh)

```bash
# Start SOMNIA
./run.sh

# Production mode
./run.sh prod

# Stop services
./run.sh --stop

# Clean all containers
./run.sh --clean
```

---

## Environment Configuration

### .env File Structure

```bash
# ════════════════════════════════════════════
# SOMNIA Environment Configuration
# ════════════════════════════════════════════

# ────────────────────────────────────────────
# Application Settings
# ────────────────────────────────────────────
DEBUG=true
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000

# ────────────────────────────────────────────
# ML Models Configuration
# ────────────────────────────────────────────
# Enable/disable ML model inference
ENABLE_ML_MODELS=true

# Use mock data (overrides ML models)
USE_MOCK=false

# Feature toggles
ENABLE_SNORING=true
ENABLE_VIDEO_POSE=false

# ────────────────────────────────────────────
# Model File Paths
# ────────────────────────────────────────────
SPO2_MODEL_PATH=backend/models/SpO2_weights.hdf5
ECG_MODEL_PATH=backend/models/ecg_weights.hdf5
```

### Configuration Profiles

**Development Profile:**
```bash
DEBUG=true
ENVIRONMENT=development
ENABLE_ML_MODELS=true
USE_MOCK=false
```

**Production Profile:**
```bash
DEBUG=false
ENVIRONMENT=production
ENABLE_ML_MODELS=true
USE_MOCK=false
LOG_LEVEL=INFO
```

**Testing Profile (Fast, No ML):**
```bash
DEBUG=true
ENVIRONMENT=testing
ENABLE_ML_MODELS=false
USE_MOCK=true
```

---

## Troubleshooting

### ML Models Not Loading

**Symptom:** Backend starts but models not initialized

**Solutions:**
1. Check `.env` file exists in project root
2. Verify `ENABLE_ML_MODELS=true` in `.env`
3. Confirm model files exist:
   ```bash
   ls -lh backend/models/SpO2_weights.hdf5
   ls -lh backend/models/ecg_weights.hdf5
   ```
4. Check Docker logs:
   ```bash
   docker compose logs backend
   # Look for: "🤖 Initializing ML models..."
   # Should see: "✅ ML models initialized successfully"
   ```

### Mock Data Instead of Real Predictions

**Symptom:** Analysis returns but data looks generic

**Solutions:**
1. Check `USE_MOCK=false` in `.env`
2. Restart backend after changing `.env`:
   ```bash
   docker compose restart backend
   ```
3. Verify models loaded in logs
4. Test with curl:
   ```bash
   curl -X POST http://localhost:8000/api/v1/analyze \
     -F "audio_file=@test.wav" \
     -F 'wearable_data={"spo2_data":[98,97,96],"heart_rate_data":[72,74,71]}'
   ```

### Mobile App Can't Connect to Backend

**Symptom:** Network errors in mobile app

**Solutions:**
1. Check backend is running:
   ```bash
   curl http://localhost:8000/api/v1/health
   ```
2. Update API URL in mobile app:
   ```typescript
   // services/apiService.ts
   const API_BASE_URL = 'http://YOUR_COMPUTER_IP:8000';
   // Don't use localhost on mobile device
   ```
3. Ensure mobile device and computer on same network
4. Check firewall allows port 8000

### Slow ML Inference

**Symptom:** Analysis takes >30 seconds

**Solutions:**
1. First inference is always slow (model loading)
2. Subsequent calls should be faster
3. Consider GPU-enabled Docker image:
   ```dockerfile
   FROM tensorflow/tensorflow:latest-gpu
   ```
4. Reduce data size:
   ```typescript
   // Send 1-minute samples instead of full night
   const spo2_data = wearableData.spo2_data.slice(0, 60);
   ```

### Docker Build Failures

**Symptom:** `docker compose up` fails

**Solutions:**
1. Clean Docker cache:
   ```bash
   docker compose down
   docker system prune -a
   docker compose up --build
   ```
2. Check disk space: `df -h`
3. Increase Docker memory (Docker Desktop settings)
4. Try without cache:
   ```bash
   docker compose build --no-cache
   ```

### TensorFlow Warnings

**Symptom:** Warnings about oneDNN, AVX, etc.

**Solution:** These are normal optimization warnings. Suppress with:
```bash
export TF_CPP_MIN_LOG_LEVEL=2  # Unix/Mac
$env:TF_CPP_MIN_LOG_LEVEL="2"  # Windows PowerShell
```

---

## Complete Integration Checklist

### Backend Setup
- [ ] Python 3.11+ installed
- [ ] TensorFlow 2.20+ installed
- [ ] `.env` file configured
- [ ] Model files in `backend/models/`
- [ ] Backend running on port 8000
- [ ] ML models initialized successfully

### Mobile App Setup
- [ ] Node.js 18+ installed
- [ ] Expo CLI installed
- [ ] Dependencies installed (`npm install`)
- [ ] API URL configured correctly
- [ ] Expo Go app on mobile device
- [ ] Mobile app running and connected

### Docker Deployment
- [ ] Docker Desktop installed
- [ ] `.env` file in project root
- [ ] Model files accessible to container
- [ ] `docker-compose.yml` configured
- [ ] Backend container running
- [ ] Health check passing

### End-to-End Testing
- [ ] Mobile app can record audio
- [ ] Wearable data generated correctly
- [ ] API request succeeds
- [ ] ML models perform inference
- [ ] Response includes all ML fields
- [ ] UI displays all components
- [ ] Recommendations shown

---

## Next Steps

1. **Production Deployment:**
   - Deploy to cloud (AWS, GCP, Azure)
   - Use managed Kubernetes (EKS, GKE, AKS)
   - Set up CI/CD pipeline (GitHub Actions)
   - Configure HTTPS with SSL certificates

2. **Performance Optimization:**
   - Enable GPU acceleration for ML models
   - Implement model caching
   - Add Redis for session management
   - Use CDN for static assets

3. **Feature Enhancements:**
   - Add user authentication (JWT)
   - Implement database (PostgreSQL)
   - Add historical data tracking
   - Enable real wearable device integration

4. **Monitoring & Logging:**
   - Set up Prometheus + Grafana
   - Add error tracking (Sentry)
   - Implement structured logging
   - Create alerting rules

---

**For more information, see:**
- [API Documentation](./API.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Setup Guide](./SETUP.md)
- [Model Card](./MODEL_CARD.md)

---

*Last Updated: January 2025*
*SOMNIA v1.0*
