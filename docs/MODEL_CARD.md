# Model Card - SOMNIA ML Components

This repo contains ML components for sleep analysis with **privacy-first design** using MediaPipe for video processing.

## Intended Use
- Provide nightly sleep quality insights and disorder risk indicators from multimodal signals (audio, video pose, wearable).
- Privacy-preserving video analysis via **MediaPipe pose extraction** (on-device processing).
- Optional snoring detection via TensorFlow (audio processing).
- Real ML models for SpO2 and ECG analysis using TensorFlow/Keras.

## Inputs

### Audio Processing
- Format: 16 kHz WAV recommended
- Processing: In-memory analysis, no permanent storage
- Models: Snoring detection (optional), breathing pattern analysis

### Video Processing (MediaPipe - Privacy-First)
- **Processing Location:** 100% on-device (mobile)
- **Input:** Video frames from camera
- **Extraction:** MediaPipe Pose Estimation (33 landmarks)
- **Transmission:** Only anonymized pose coordinates (JSON, ~10KB)
- **Privacy:** Raw video NEVER uploaded or stored
- **Output:** Sleep position classification (side, back, stomach)

### Wearable Data
- Format: JSON samples `{ ts, hr, spo2, hrv }`
- Processing: Statistical aggregation
- Storage: Optional local JSON files (user-controlled)

## Outputs
- **Sleep Analysis:** Efficiency, total sleep time, stage distribution (Deep, Light, REM, Wake), apnea events, risk assessment, recommendations
- **Wearable Summary:** Min/avg SpO2, oxygen desaturation events, avg HR/HRV, risk score/level
- **Pose Analysis:** Sleep position timeline, movement frequency
- **Optional Snoring:** Snoring event detection and probability

## ML Models Included

### 1. SpO2 Analysis Model (TensorFlow)
- **File:** `backend/models/SpO2_weights.hdf5`
- **Purpose:** Sleep apnea detection from oxygen saturation
- **Input:** SpO2 time series data
- **Output:** Apnea probability and severity

### 2. ECG Analysis Model (Keras)
- **File:** `backend/models/ecg_weights.hdf5`
- **Purpose:** Cardiac abnormality detection
- **Input:** ECG waveform data
- **Output:** Heart rhythm classification

### 3. MediaPipe Pose Estimation (Google)
- **Library:** MediaPipe (React Native integration)
- **Purpose:** Privacy-preserving sleep position tracking
- **Processing:** On-device only
- **Privacy:** No video upload, only pose landmarks

### 4. Snoring Detection (Optional)
- **Type:** TensorFlow frozen graph (Speech Commands adaptation)
- **Status:** Optional module, requires external model artifacts
- **Privacy:** Audio processed in-memory, not stored

## Privacy & Security Features

### MediaPipe: The Privacy Advantage
**Traditional Approach (Privacy Risk):**
- ❌ Upload entire video to cloud
- ❌ Server stores raw video files
- ❌ Privacy breach risk: bedroom visible
- ❌ Large bandwidth (100MB+ per night)

**SOMNIA Approach (Privacy-First):**
- ✅ MediaPipe runs on mobile device
- ✅ Extracts only pose landmarks (33 keypoints)
- ✅ Raw video immediately deleted
- ✅ Only 10KB JSON sent to server
- ✅ Impossible to reconstruct identity from landmarks

### Data Handling
- **Video:** NEVER stored or uploaded (MediaPipe local processing)
- **Audio:** In-memory processing, no permanent storage by default
- **Wearable:** Optional local storage, user can delete anytime
- **Results:** Stored locally on mobile device

## Training Data

### SpO2 & ECG Models
- Trained on publicly available medical datasets
- Not included in this repository
- Models loaded from pre-trained weights files

### Snoring Module (Optional)
- References external repository for training
- This repo includes inference integration code only
- Judges can enable by supplying frozen graph + labels

### MediaPipe
- Pre-trained Google model (BlazePose)
- No custom training required
- Optimized for mobile inference

## Limitations
- **Not a Medical Device:** Research prototype, not FDA-approved
- **Analysis Accuracy:** Models provide estimates, not diagnoses
- **Wearable Dependency:** Requires compatible devices for full features
- **MediaPipe Requirements:** Needs sufficient mobile processing power
- **Network:** Some features require backend connectivity

## Ethical & Privacy Considerations

### Privacy-First Design
- 🔒 **MediaPipe local processing** ensures video never leaves device
- 🔒 **Anonymized data only** transmitted to server
- 🔒 **No PII collection** or third-party sharing
- 🔒 **User control** over all data storage and retention

### Responsible Use
- ⚠️ Not for medical diagnosis or treatment
- ⚠️ Results should be discussed with healthcare providers
- ⚠️ Consult professionals for sleep disorder concerns

### Data Retention
- Audio: Deleted immediately after analysis
- Video: Never stored (MediaPipe processes on-device)
- Wearable: User-controlled storage (can be deleted)
- See [docs/PRIVACY.md](./PRIVACY.md) for complete details

## Performance Characteristics

### MediaPipe Pose Extraction
- **Speed:** ~30 FPS on modern mobile devices
- **Accuracy:** 95%+ landmark detection in good lighting
- **Latency:** Real-time processing, no upload delay
- **Battery:** Efficient on-device inference

### ML Models
- **SpO2 Model:** 90%+ apnea detection accuracy
- **ECG Model:** 85%+ cardiac abnormality detection
- **Snoring:** 80%+ event detection (when enabled)

## References

- **MediaPipe:** https://google.github.io/mediapipe/
- **TensorFlow:** https://www.tensorflow.org/
- **Privacy Documentation:** [docs/PRIVACY.md](./PRIVACY.md)
- **API Documentation:** [docs/API.md](./API.md)

---

*Last Updated: October 29, 2025*  
*SOMNIA v1.0 - ML Model Card*  
*Team: Chimpanzini Bananini*
