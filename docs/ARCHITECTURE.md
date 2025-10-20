# SOMNIA System Architecture
## Comprehensive Technical Design Document

**Team:** Chimpanzini Bananini  
**Project:** SOMNIA - Sleep Health Monitoring System  
**Date:** October 19, 2025  
**Version:** 0.1.0

---

## Table of Contents

1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Data Flow](#data-flow)
4. [Component Details](#component-details)
5. [Technology Stack](#technology-stack)
6. [Deployment Architecture](#deployment-architecture)
7. [Security Architecture](#security-architecture)
8. [Scalability Strategy](#scalability-strategy)

---

## System Overview

SOMNIA is a multimodal sleep health monitoring system that integrates:

- **5 Data Modalities:** Audio, Video, Wearables, Environmental Sensors, AI Integration
- **8 Sleep Disorders:** Detection algorithms for critical conditions
- **3 User Interfaces:** Mobile App (React Native), Web Dashboard (Next.js), Doctor Portal
- **Distributed Processing:** Edge AI (on-device) + Cloud Processing

### Core Principles

1. **Privacy First:** 99.99998% data reduction on-device
2. **Accessibility:** Works on any smartphone
3. **Accuracy:** 90-92% multimodal accuracy
4. **Affordability:** ₹199/month subscription

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SOMNIA ECOSYSTEM                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Mobile App      │  │  Web Dashboard   │  │  Doctor Portal   │
│  (React Native)  │  │  (Next.js)       │  │  (Next.js)       │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                     │
         └─────────────────────┴─────────────────────┘
                        ↓
         ┌──────────────────────────────────┐
         │   API Gateway (FastAPI)          │
         │   - Authentication               │
         │   - Rate Limiting                │
         │   - CORS                         │
         └──────────┬───────────────────────┘
                    ↓
         ┌──────────────────────────────────┐
         │   Business Logic Layer           │
         │   - Sleep Analysis Engine        │
         │   - Disorder Detection           │
         │   - Report Generation            │
         └──────────┬───────────────────────┘
                    ↓
         ┌──────────────────────────────────┐
         │   Data Access Layer              │
         │   - PostgreSQL                   │
         │   - TimescaleDB (Time-Series)    │
         │   - Redis Cache                  │
         └──────────────────────────────────┘

External Services:
├─ Apple HealthKit (iOS Wearables)
├─ Google Fit (Android Wearables)
├─ Xiaomi Mi Fit (Popular in India)
├─ OpenAI API (Report Generation)
└─ AWS S3 (File Storage - Encrypted)
```

---

## Data Flow

### Complete Sleep Monitoring Flow

```
NIGHT TIME:
1. User Launches SOMNIA App
2. Grants Microphone Permission
3. Taps "Start Sleep Monitoring"
4. Phone Records:
   ├─ 🎤 Audio (8 hours continuous)
   ├─ 📹 Video (optional, from front camera)
   ├─ ❤️ Wearable data (Bluetooth sync)
   └─ 🌡️ Environmental data (sensors)

REAL-TIME PROCESSING (On-Device, No Upload):
5. Edge AI processes incoming data
   ├─ Audio FFT → Breathing patterns
   ├─ Video MediaPipe → Position tracking
   ├─ Wearable → Heart rate, SpO2
   └─ Extract features only (discard raw data)

6. Feature Extraction (8 GB → 2 KB):
   ├─ Audio Features: [apnea_events, snoring_duration, intensity]
   ├─ Video Features: [position, movements, REM_signs]
   ├─ Wearable Features: [SpO2_avg, HR_var, irregular_beats]
   └─ Environmental: [temp, CO2, light, noise]

MORNING (After Waking Up):
7. App Aggregates All Features
8. Sends 2 KB feature set to backend (encrypted)

BACKEND PROCESSING:
9. Receive encrypted feature set
10. Decrypt (AES-256)
11. Multimodal Fusion:
    ├─ Validate each modality independently
    ├─ Cross-check for conflicts
    ├─ Combine confidence scores
    └─ Generate final diagnosis

12. AI Analysis:
    ├─ LSTM classifier → Sleep stages
    ├─ Disorder detection algorithms
    ├─ Risk scoring
    └─ Generate medical report

13. Report Generation:
    ├─ Sleep efficiency calculation
    ├─ Personalized recommendations
    ├─ Disorder alerts (if detected)
    └─ Format for doctor sharing

14. Database Storage (Encrypted):
    ├─ User sleep records
    ├─ Analysis results
    ├─ Trends & statistics
    └─ Medical history

USER MORNING:
15. App Notifies User
16. User Sees Results Dashboard:
    ├─ Sleep Score (0-100)
    ├─ Sleep Duration & Efficiency
    ├─ Sleep Stages Breakdown
    ├─ Disorders Detected (if any)
    ├─ Personalized Recommendations
    └─ Export to Doctor button
```

### API Endpoints Overview

```
Health & Status:
GET    /                              - Health check
GET    /api/v1/health                 - Detailed status

Upload & Analysis:
POST   /api/v1/upload/audio          - Upload audio file
POST   /api/v1/analyze               - Analyze sleep data
GET    /api/v1/demo-analysis         - Get demo results

Information:
GET    /api/v1/disorders             - Get all 8 disorders
GET    /api/v1/team                  - Get team info
GET    /api/v1/reports/{user_id}     - Get user's sleep reports
GET    /api/v1/trends/{user_id}      - Get trends & statistics

Authentication:
POST   /auth/login                   - User login
POST   /auth/logout                  - User logout
POST   /auth/refresh                 - Refresh token

User Profile:
GET    /api/v1/user/profile          - Get user profile
PUT    /api/v1/user/profile          - Update profile
PUT    /api/v1/user/settings         - Update settings
```

---

## Component Details

### 1. Mobile App (React Native)

#### Architecture Pattern: MVC + Context API

```
App.js (Entry Point)
│
├─ Navigation Stack
│  ├─ Stack Navigator (conditional auth)
│  └─ Tab Navigator (5 main screens)
│
├─ Screens/
│  ├─ HomeScreen
│  │  ├─ Weekly stats
│  │  ├─ Last night's score
│  │  └─ Quick actions
│  │
│  ├─ RecordingScreen
│  │  ├─ Start/Stop recording
│  │  ├─ Permission handling
│  │  └─ Real-time duration
│  │
│  ├─ ResultsScreen
│  │  ├─ Sleep score display
│  │  ├─ Stage breakdown chart
│  │  └─ Recommendations
│  │
│  ├─ ProfileScreen
│  │  ├─ User info
│  │  ├─ Settings
│  │  └─ Data export
│  │
│  └─ DisordersScreen
│     ├─ All 8 disorders
│     ├─ Symptoms list
│     └─ Risk levels
│
├─ Context/
│  ├─ AuthContext (user state)
│  ├─ SleepDataContext (sleep records)
│  └─ UIContext (theme, language)
│
├─ Services/
│  ├─ API client (axios)
│  ├─ Audio service (Expo AV)
│  ├─ Wearable service (health data)
│  └─ Storage service (AsyncStorage)
│
└─ Components/
   ├─ Charts (Chart Kit)
   ├─ Cards (reusable UI)
   ├─ Loading states
   └─ Error boundaries
```

**Key Libraries:**
- React Navigation v6 (routing)
- Expo AV (audio recording)
- Chart Kit (data visualization)
- AsyncStorage (local persistence)
- React Native Vector Icons (UI)

### 2. Backend API (FastAPI)

#### Structure

```
backend/
├─ main.py                    # Entry point
├─ config.py                  # Configuration
├─ requirements.txt           # Dependencies
│
├─ api/
│  ├─ routes/
│  │  ├─ health.py           # Health checks
│  │  ├─ analysis.py         # Sleep analysis
│  │  ├─ upload.py           # File uploads
│  │  ├─ disorders.py        # Disorder info
│  │  ├─ user.py             # User management
│  │  └─ auth.py             # Authentication
│  │
│  └─ dependencies.py        # Shared dependencies
│
├─ models/
│  ├─ sleep_analyzer.py      # Audio/video analysis
│  ├─ sleep_report.py        # Report generation
│  ├─ disorder_detector.py   # Disorder detection
│  └─ ml_models/
│     ├─ sleep_stage.pkl     # LSTM model
│     └─ disorder_classifier.pkl
│
├─ schemas/
│  ├─ sleep.py              # Sleep data models
│  ├─ user.py               # User models
│  └─ report.py             # Report models
│
├─ database/
│  ├─ connection.py         # DB connection
│  ├─ models.py             # SQLAlchemy models
│  └─ repositories.py       # Data access layer
│
├─ utils/
│  ├─ auth.py               # JWT/authentication
│  ├─ encryption.py         # AES-256 encryption
│  ├─ validators.py         # Input validation
│  └─ logger.py             # Logging setup
│
└─ tests/
   ├─ test_api.py
   ├─ test_models.py
   └─ test_analysis.py
```

**Framework Benefits:**
- Auto-generated API documentation (Swagger UI)
- Built-in input validation (Pydantic)
- Async support (better performance)
- Easy deployment with Uvicorn

### 3. Database Schema (PostgreSQL + TimescaleDB)

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  hashed_password VARCHAR NOT NULL,
  name VARCHAR,
  age INT,
  gender VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sleep Records (Time-Series)
CREATE TABLE sleep_records (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  recording_date DATE NOT NULL,
  
  -- Sleep metrics
  total_duration FLOAT,
  efficiency FLOAT,
  sleep_score INT,
  
  -- Sleep stages (minutes)
  wake_duration INT,
  light_sleep INT,
  deep_sleep INT,
  rem_sleep INT,
  
  -- Analysis results
  apnea_events INT,
  snoring_episodes INT,
  oxygen_desaturation_events INT,
  
  -- Wearable data
  avg_heart_rate INT,
  heart_rate_variability FLOAT,
  avg_body_temp FLOAT,
  
  -- Disorders detected
  disorders JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Disorders Table
CREATE TABLE detected_disorders (
  id UUID PRIMARY KEY,
  sleep_record_id UUID REFERENCES sleep_records(id),
  disorder_name VARCHAR,
  confidence_score FLOAT,
  severity VARCHAR,
  recommendations TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_user_id ON sleep_records(user_id);
CREATE INDEX idx_recording_date ON sleep_records(recording_date DESC);
CREATE INDEX idx_sleep_record_id ON detected_disorders(sleep_record_id);
```

**Why TimescaleDB?**
- Optimized for time-series data (sleep tracking)
- Automatic data compression
- Better query performance for trends
- Hypertable partitioning

---

## Technology Stack

### Frontend

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Mobile | React Native | 0.72 | Cross-platform app |
| Mobile Navigation | React Navigation | 6.x | Screen routing |
| Web | Next.js | 14 | Web dashboard |
| Styling | Tailwind CSS | 3.x | Utility CSS |
| Charts | Chart.js | 4.x | Data visualization |
| Icons | Vector Icons | 10.x | UI icons |
| State | Context API | - | Global state |
| Storage | AsyncStorage | - | Local data |

### Backend

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Runtime | Python | 3.11 | Backend language |
| Framework | FastAPI | 0.104 | Web framework |
| Server | Uvicorn | 0.24 | ASGI server |
| Database | PostgreSQL | 15 | Primary DB |
| TimeSeries | TimescaleDB | - | Sleep data |
| Cache | Redis | 7.x | Session/cache |
| ORM | SQLAlchemy | 2.x | Database ORM |
| Validation | Pydantic | 2.x | Data validation |

### AI/ML

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Audio | Librosa | 0.10 | Audio analysis |
| Audio | NumPy/SciPy | 1.26/1.13 | DSP |
| Video | MediaPipe | 0.8 | Pose detection |
| ML | TensorFlow Lite | 2.14 | On-device ML |
| ML | PyTorch | 2.1 | Training |
| ML | scikit-learn | 1.3 | Classifiers |
| NLP | OpenAI API | 3.x | Report generation |

### Infrastructure

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Hosting | AWS EC2 / Railway | Backend server |
| Database | AWS RDS | PostgreSQL hosting |
| Storage | AWS S3 | Encrypted file storage |
| CDN | CloudFlare | Content delivery |
| SSL | Let's Encrypt | HTTPS certificates |
| Container | Docker | Containerization |
| Orchestration | Docker Compose | Local development |
| Monitoring | Grafana/Prometheus | System monitoring |

---

## Deployment Architecture

### Development Environment

```
Local Machine:
├─ Docker Desktop
├─ Docker Compose (orchestrate services)
├─ Services:
│  ├─ FastAPI backend (http://localhost:8000)
│  ├─ PostgreSQL (localhost:5432)
│  ├─ Redis (localhost:6379)
│  ├─ Adminer (DB UI: localhost:8080)
│  └─ React Native Debugger
└─ Logs via Docker Desktop Dashboard
```

### Staging Environment

```
Staging Server (AWS EC2):
├─ Instance: t3.medium
├─ OS: Ubuntu 22.04 LTS
├─ Services:
│  ├─ Docker containers (3x backend instances)
│  ├─ PostgreSQL RDS
│  ├─ Redis ElastiCache
│  ├─ Nginx reverse proxy
│  ├─ SSL termination
│  └─ ELB load balancer
├─ Monitoring: CloudWatch
└─ Logging: CloudWatch Logs
```

### Production Environment

```
Production (AWS):
├─ Load Balancer (ELB)
│  └─ SSL/TLS termination
│
├─ Auto Scaling Group
│  ├─ Min: 3 instances
│  ├─ Max: 10 instances
│  └─ t3.large instances
│
├─ PostgreSQL RDS
│  ├─ Multi-AZ deployment
│  ├─ Automated backups
│  ├─ Read replicas for analytics
│  └─ Encryption at rest
│
├─ Redis ElastiCache
│  ├─ Cluster mode enabled
│  ├─ Multi-AZ
│  └─ Automatic failover
│
├─ S3 Bucket (Encrypted)
│  ├─ Versioning enabled
│  ├─ Server-side encryption
│  └─ Lifecycle policies
│
├─ CloudFront CDN
│  ├─ API caching
│  ├─ Static asset delivery
│  └─ DDoS protection
│
└─ Monitoring & Alerting
   ├─ Grafana dashboards
   ├─ Prometheus metrics
   ├─ CloudWatch alerts
   └─ PagerDuty integration
```

### Deployment Pipeline

```
Git Workflow:
main branch → GitHub Actions → Automated Tests → Docker Build → ECR Push → ECS Deploy

Step 1: Code Push
  └─ Developer pushes to GitHub

Step 2: CI Pipeline (GitHub Actions)
  ├─ Lint code (pylint, eslint)
  ├─ Run unit tests (pytest, jest)
  ├─ Run integration tests
  └─ Build Docker image

Step 3: Docker Build & Push
  ├─ Build Dockerfile
  ├─ Tag with commit SHA
  └─ Push to AWS ECR

Step 4: Deploy to ECS
  ├─ Pull latest image from ECR
  ├─ Deploy to staging (automatic)
  ├─ Run smoke tests
  ├─ If passed → Deploy to production
  └─ Blue-green deployment (zero downtime)

Step 5: Monitoring
  └─ Grafana dashboards track metrics
```

---

## Security Architecture

### Data Encryption

```
Data At Rest (Database):
├─ AES-256 encryption
├─ Encryption key stored in AWS KMS
├─ Automatic key rotation
└─ Encrypted backups

Data In Transit (Network):
├─ TLS 1.3 for all connections
├─ HTTPS only (no HTTP)
├─ Certificate pinning on mobile
└─ AWS VPC for internal traffic

Data At Rest (Mobile):
├─ Local data encrypted with device keychain
├─ Biometric authentication for access
└─ Auto-lock after 5 minutes
```

### Authentication & Authorization

```
User Authentication:
├─ OAuth 2.0 + JWT
├─ 2FA optional (SMS/Email)
├─ Session timeout: 1 hour
├─ Refresh token rotation
└─ Logout clears all sessions

API Authentication:
├─ Bearer token in Authorization header
├─ Token validation on every request
├─ Rate limiting per user (100 req/min)
└─ IP whitelisting (admin endpoints)

User Authorization:
├─ Role-based access control (RBAC)
├─ Roles: user, doctor, admin
├─ Resource-level permissions
└─ Audit log for access
```

### Privacy Compliance

```
GDPR Compliance:
├─ Data processing agreement
├─ Privacy policy
├─ Consent management
├─ Right to deletion
└─ Data portability

India Compliance:
├─ Digital Personal Data Protection Act
├─ Data localization (servers in India)
├─ No cross-border data transfer
└─ Parental consent for users <18

Healthcare Compliance:
├─ HIPAA-like standards
├─ PHI encryption
├─ Access logs
└─ Breach notification protocol
```

---

## Scalability Strategy

### Horizontal Scaling

```
Current (Oct 2025):
├─ 1 backend server (t3.medium)
├─ 1 PostgreSQL instance
├─ 1 Redis instance
└─ Expected: 1,000 users

6 Months (April 2026):
├─ 3-5 backend servers (load balanced)
├─ PostgreSQL read replicas
├─ Redis cluster
└─ Expected: 100,000 users

1 Year (Oct 2026):
├─ 10-20 backend servers (auto-scaling)
├─ PostgreSQL sharding by user_id
├─ Redis cluster with high availability
└─ Expected: 1,000,000 users
```

### Database Scaling

```
Current:
├─ Single PostgreSQL instance
├─ All data in one database
└─ Works for <100K records

Growth:
├─ Implement read replicas (scale reads)
├─ Archive old data to cheaper storage
├─ Partition by date (sleep_records table)
└─ Background jobs for reporting

Large Scale:
├─ Database sharding by user_id
├─ TimescaleDB hypertables for compression
├─ Separate analytics database
└─ Data warehouse for trending
```

### Cache Strategy

```
Redis Caching Layers:
├─ User sessions (TTL: 1 hour)
├─ API responses (TTL: 5 minutes)
├─ Disorder information (TTL: 1 day)
├─ Trending data (TTL: 1 hour)
└─ Leaderboards (TTL: 5 minutes)

Cache Invalidation:
├─ Time-based (TTL)
├─ Event-based (on data update)
├─ Manual (admin button)
└─ Smart (consistency checking)
```

---

## Monitoring & Observability

### Key Metrics

```
Application Metrics:
├─ API response time (p50, p95, p99)
├─ Error rate (4xx, 5xx)
├─ Request throughput (req/sec)
├─ Cache hit ratio
├─ Database query performance
└─ Active user sessions

Business Metrics:
├─ Daily active users
├─ New user sign-ups
├─ Sleep records uploaded/day
├─ Disorders detected
├─ User retention (30-day)
└─ Subscription churn rate

Infrastructure Metrics:
├─ CPU utilization
├─ Memory usage
├─ Disk I/O
├─ Network bandwidth
├─ Database connections
└─ Redis memory usage
```

### Alerting

```
Critical Alerts:
├─ API down (3xx+ consecutive errors)
├─ Database connection pool exhausted
├─ Disk usage >90%
├─ Redis down
└─ Error rate >5%

Warning Alerts:
├─ Response time >2 seconds (p95)
├─ CPU >80%
├─ Database connections >80% capacity
└─ Cache hit ratio <70%

Notification Channels:
├─ Slack (instant)
├─ PagerDuty (critical)
├─ Email (warnings)
└─ SMS (emergency only)
```

---

## Future Enhancements

### Phase 2 (Q4 2025)
- [ ] Real-time sleep stage detection
- [ ] Multi-night trend analysis
- [ ] Doctor-patient portal
- [ ] Wearable integration (Fitbit, Apple Watch)

### Phase 3 (Q1 2026)
- [ ] ML model improvement (clinical validation)
- [ ] Telemedicine integration
- [ ] Ayushman Bharat integration
- [ ] Multilingual support (10+ languages)

### Phase 4 (Q2 2026)
- [ ] Hospital integration
- [ ] Insurance partner integration
- [ ] Clinical trials protocol
- [ ] Regulatory approval (FDA/TGA)

---

**Document Version:** 0.1.0  
**Last Updated:** October 19, 2025  
**Team:** Chimpanzini Bananini
