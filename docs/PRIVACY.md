# 🔒 Privacy & Data Security - SOMNIA

## Privacy-First Philosophy

SOMNIA is built with **privacy as a core design principle**, not an afterthought. Your sleep data is among the most intimate personal information, and we treat it with the highest level of protection.

---

## 🎯 Key Privacy Features

### 1. **Local Video Processing (MediaPipe)**
- ✅ **Video NEVER leaves your device**
- ✅ MediaPipe pose extraction runs 100% locally on mobile
- ✅ Only 33 anonymized pose landmarks sent to server
- ✅ Raw video immediately discarded after pose extraction
- ✅ Impossible to reconstruct your appearance from landmarks

### 2. **No Cloud Storage of Sensitive Data**
- ✅ Audio processed in-memory, not permanently stored
- ✅ Video never uploaded or saved
- ✅ Wearable data stored only with your consent
- ✅ All analysis results kept locally on your device

### 3. **Minimal Data Transmission**
- ✅ Only anonymized, aggregated data sent to backend
- ✅ No personally identifiable information (PII) transmitted
- ✅ All data encrypted in transit (HTTPS)
- ✅ Server-side processing uses temporary memory only

---

## 📊 Data Types & Privacy Controls

### Audio Data
**Endpoint:** `POST /api/v1/upload/audio`

**Privacy Measures:**
- Audio processed in-memory for snoring detection
- File validated and ID generated for tracking
- **No permanent storage** by default in evaluation mode
- Audio never shared with third parties
- Immediate deletion after analysis

**What We Collect:**
- Audio duration, sample rate
- Snoring event timestamps (not audio itself)
- Breathing pattern statistics

**What We DON'T Collect:**
- ❌ Voice recordings
- ❌ Identifiable sounds
- ❌ Room conversations

---

### Video Data (MediaPipe Pose Extraction)
**Endpoint:** `POST /api/v1/upload/video-pose`

**Privacy Measures:**
- 🔒 **CRITICAL: Video processing happens 100% on your mobile device**
- MediaPipe extracts only body pose landmarks (33 keypoints)
- Raw video **NEVER uploaded** to server
- Pose landmarks are anonymous 3D coordinates
- Cannot reconstruct your face, body, or identity from landmarks

**What We Collect:**
- 33 pose keypoint coordinates (x, y, z, visibility)
- Sleep position classification (side, back, stomach)
- Movement frequency over time

**What We DON'T Collect:**
- ❌ Raw video files
- ❌ Face data
- ❌ Identifiable features
- ❌ Room environment
- ❌ Other people in frame

**Technical Details:**
- MediaPipe runs on-device using React Native
- Pose extraction: ~30 FPS processing
- Only JSON landmarks transmitted (< 10KB)
- Video immediately deleted from device memory after extraction

---

### Wearable Data
**Endpoint:** `POST /api/v1/upload/wearable`

**Privacy Measures:**
- Data stored locally as JSON under `uploads/wearable/`
- User can delete records anytime
- Only aggregated health metrics (no PII)
- Optional feature - can be disabled

**What We Collect:**
- Heart rate statistics (avg, min, max)
- SpO2 levels and drop counts
- Heart rate variability (HRV)
- Movement/activity levels

**What We DON'T Collect:**
- ❌ Device serial numbers
- ❌ Personal health records
- ❌ Medical history
- ❌ Location data

---

### Analysis Results
**Endpoint:** `POST /api/v1/analyze`

**Privacy Measures:**
- Results generated from anonymized input only
- No linkage to previous sessions (unless opted in)
- Results stored locally on mobile device
- User controls retention period

**What We Generate:**
- Sleep efficiency percentage
- Sleep stage distribution (Deep, Light, REM, Wake)
- Disorder probability scores
- Personalized recommendations

---

## 🔐 Technical Security Measures

### Data Transmission
- ✅ **HTTPS/TLS encryption** for all API calls
- ✅ JWT authentication for user sessions
- ✅ Request validation and sanitization
- ✅ CORS protection against unauthorized access

### Data Storage
- ✅ Local-first architecture (mobile app storage)
- ✅ Optional server-side storage with user consent
- ✅ No third-party analytics or tracking
- ✅ No advertising networks

### Code Security
- ✅ Open-source (auditable on GitHub)
- ✅ Dependencies scanned for vulnerabilities
- ✅ No telemetry or data collection libraries
- ✅ Minimal external API calls

---

## 🎬 MediaPipe: The Privacy Game-Changer

### Why MediaPipe?

Traditional sleep monitoring apps upload raw video to servers, creating massive privacy risks:
- ❌ Your bedroom environment visible to servers
- ❌ Faces, bodies identifiable
- ❌ Risk of data breaches exposing intimate footage
- ❌ Requires trust in third-party cloud storage

**SOMNIA's MediaPipe Approach:**
- ✅ **On-device processing** - video never leaves phone
- ✅ Only skeletal pose data extracted (anonymous)
- ✅ Same sleep position accuracy, zero privacy risk
- ✅ 1000x smaller data footprint (10KB vs 100MB)

### How It Works

```
┌─────────────────────────────────────────────────────────┐
│                  Privacy-Preserving Video Processing     │
└─────────────────────────────────────────────────────────┘

1. User Records Sleep Video on Phone
   └─> Video stored in temporary memory

2. MediaPipe Processes Locally (On-Device)
   └─> Extracts 33 pose landmarks per frame
   └─> Discards all pixel data immediately

3. Only Landmarks Sent to Server
   └─> JSON payload: [{x: 0.5, y: 0.3, z: 0.1}, ...]
   └─> Total size: ~10KB for entire night

4. Server Analyzes Sleep Position
   └─> Classifies: Side, Back, Stomach sleeping
   └─> No access to video, face, or environment

5. Results Returned to Phone
   └─> User sees sleep position timeline
   └─> Original video already deleted
```

---

## ⚠️ Important Disclaimers

### Not a Medical Device
SOMNIA is a **research prototype and wellness tool**, not FDA-approved medical equipment:
- ❌ Do not use for medical diagnosis
- ❌ Do not replace professional medical advice
- ❌ Consult healthcare provider for sleep disorders

### Hackathon/Evaluation Mode
For easy testing and evaluation:
- Minimal data persistence by default
- Mock data generation available for demos
- Optional modules can be disabled (snoring, video)

### Before Production Use
If deploying SOMNIA in production:
- ✅ Implement proper user consent flows
- ✅ Add data retention policies
- ✅ Enable audit logging
- ✅ Obtain legal review of privacy practices
- ✅ Comply with GDPR, HIPAA, or local regulations

---

## 🛡️ User Rights & Control

### You Always Have Control
- ✅ **Delete data anytime** - both local and server
- ✅ **Opt-out of features** - disable video, audio, or wearable
- ✅ **Export your data** - JSON format available
- ✅ **No account required** - use demo mode anonymously

### Transparency
- ✅ Full source code available on GitHub
- ✅ No hidden data collection
- ✅ Privacy policy in plain language
- ✅ Contact team for questions: [GitHub Issues](https://github.com/Vidyans26/SOMNIA/issues)

---

## 📋 Data Retention Summary

| Data Type | Storage Location | Retention | User Control |
|-----------|-----------------|-----------|--------------|
| **Video** | Never stored | Immediate deletion | N/A - never leaves device |
| **Pose Landmarks** | Server memory | Deleted after analysis | Opt-out available |
| **Audio** | Server memory | Deleted after analysis | Opt-out available |
| **Wearable** | Local JSON files | User-controlled | Manual deletion anytime |
| **Analysis Results** | Mobile app | User-controlled | Clear data in settings |

---

## 📞 Contact & Questions

**Privacy Concerns?**
- Open an issue: [GitHub Issues](https://github.com/Vidyans26/SOMNIA/issues)
- Review code: [Source Code](https://github.com/Vidyans26/SOMNIA)
- Read docs: [Documentation Index](./INDEX.md)

**Team:** Chimpanzini Bananini  
**Project:** SOMNIA Sleep Monitoring System  
**License:** MIT (see [LICENSE](../LICENSE))

---

## 🌟 Summary: Why SOMNIA is Privacy-First

1. **MediaPipe local processing** = No video upload ever
2. **Anonymized data only** = No PII transmission
3. **Local-first architecture** = You own your data
4. **Open source** = Fully auditable and transparent
5. **Minimal retention** = Data deleted after use
6. **User control** = Opt-in/opt-out for all features

**Your sleep data deserves the highest protection. SOMNIA delivers it.** 🔒

---

*Last Updated: October 29, 2025*  
*SOMNIA v1.0 - Privacy & Data Security*  
*Team: Chimpanzini Bananini*
