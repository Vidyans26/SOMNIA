# SOMNIA API Documentation

**Team:** Chimpanzini Bananini  
**Project:** SOMNIA - Sleep Health Monitoring System  
**Base URL:** `http://localhost:8000` (development)  
**Version:** 0.1.0  

> Implementation note: This mid-submission backend returns realistic mock analysis. File uploads are validated by extension but not persisted/processed yet; the analysis endpoint ignores uploaded file IDs and generates mock results.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Health Endpoints](#health-endpoints)
3. [Analysis Endpoints](#analysis-endpoints)
4. [Information Endpoints](#information-endpoints)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Response Examples](#response-examples)

---

## Authentication

### Overview

All API endpoints (except health checks) require authentication using **Bearer Token** (JWT).

### Authentication Flow

```
1. User logs in with email/password
2. Backend returns JWT access token
3. Client includes token in Authorization header
4. Backend validates token
5. Request is processed
```

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### JWT Token Structure

```json
{
  "sub": "user@example.com",
  "user_id": "uuid-here",
  "exp": 1697814000,
  "iat": 1697810400
}
```

### Token Expiration

- **Access Token TTL:** 1 hour
- **Refresh Token TTL:** 7 days
- **Automatic Refresh:** Client should refresh before expiration

### Getting Started (Mock Auth)

For development/testing, authorization is mocked and any non-empty bearer token string will pass dependency checks. In production (planned):

```bash
# Login endpoint (planned; not implemented in this repo)
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

## Health Endpoints

### Health Check

**Endpoint:** `GET /`

**Description:** Basic health check to verify API is running

**Authentication:** ❌ Not required

**Request:**
```bash
curl http://localhost:8000/
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "SOMNIA API",
  "team": "Chimpanzini Bananini",
  "version": "0.1.0",
  "timestamp": "2025-10-19T12:59:31.123456"
}
```

---

### Detailed Health Check

**Endpoint:** `GET /api/v1/health`

**Description:** Detailed system status and capabilities

**Authentication:** ❌ Not required

**Request:**
```bash
curl http://localhost:8000/api/v1/health
```

**Response (200 OK):**
```json
{
  "status": "operational",
  "service": "SOMNIA - Sleep Health Monitoring",
  "version": "0.1.0",
  "uptime": "running",
  "multimodal_capabilities": [
    "audio_analysis",
    "sleep_stage_classification",
    "disorder_detection",
    "wearable_integration",
    "environmental_monitoring"
  ]
}
```

---

## Analysis Endpoints

### Upload Audio File

**Endpoint:** `POST /api/v1/upload/audio`

**Description:** Upload audio recording for sleep analysis

**Authentication:** ✅ Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/upload/audio \
  -H "Authorization: Bearer <token>" \
  -F "file=@sleep_recording.wav"
```

**Request Body:**
```
file: (binary) Audio file
  - Supported formats: .wav, .mp3, .m4a, .flac
  - Max size: 100 MB
  - Recommended: 16-bit, 16kHz, mono
```

**Response (201 Created):**
```json
{
  "file_id": "audio_1697814000.123456",
  "filename": "sleep_recording.wav",
  "message": "Audio file uploaded successfully",
  "user_id": "demo_user"
}
```

**Response (400 Bad Request):**
```json
{
  "detail": "Invalid audio format"
}
```

**Response (500 Internal Server Error):**
```json
{
  "detail": "Error uploading file: <error_message>"
}
```

---

### Analyze Sleep Data

**Endpoint:** `POST /api/v1/analyze`

**Description:** Analyze multimodal sleep data and detect disorders (currently returns mock analysis; audio_file_id is ignored)

**Authentication:** ✅ Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "duration_hours": 7.5,
  "audio_file_id": "audio_1697814000.123456",
  "video_file_id": null,
  "wearable_data": {
    "avg_heart_rate": 64,
    "heart_rate_variability": 45.2,
    "avg_body_temp": 36.7,
    "oxygen_saturation_avg": 96.5
  },
  "environmental_data": {
    "room_temperature": 19.5,
    "co2_level": 800,
    "light_exposure": "low",
    "noise_level": 30
  },
  "user_id": "user_uuid_here",
  "recording_date": "2025-10-19T08:00:00Z"
}
```

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "duration_hours": 7.5,
    "user_id": "demo_user",
    "recording_date": "2025-10-19T08:00:00Z"
  }'
```

**Response (200 OK):**
```json
{
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
  "disorders_detected": [
    "mild_positional_apnea"
  ]
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `sleep_efficiency` | float | Sleep efficiency (0-1, where 1 = 100% efficient) |
| `total_sleep_time` | float | Total sleep duration in hours |
| `sleep_stages` | object | Minutes spent in each sleep stage |
| `apnea_events` | int | Number of breathing pause events detected |
| `risk_assessment` | string | Risk level: "low", "moderate", "high" |
| `recommendations` | array | Personalized sleep improvement recommendations |
| `disorders_detected` | array | List of detected sleep disorders |

---

### Demo Analysis

**Endpoint:** `GET /api/v1/demo-analysis`

**Description:** Get demo sleep analysis (for testing UI without real recording)

**Authentication:** ❌ Not required

**Request:**
```bash
curl http://localhost:8000/api/v1/demo-analysis
```

**Response (200 OK):**
```json
{
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
  "disorders_detected": [
    "mild_positional_apnea"
  ],
  "analysis_timestamp": "2025-10-19T12:59:31.123456"
}
```

---

## Information Endpoints

### Get All Sleep Disorders

**Endpoint:** `GET /api/v1/disorders`

**Description:** Get comprehensive information about all 8 sleep disorders SOMNIA detects

**Authentication:** ❌ Not required

**Request:**
```bash
curl http://localhost:8000/api/v1/disorders
```

**Response (200 OK):**
```json
{
  "total_disorders": 8,
  "disorders": [
    {
      "id": "sleep_apnea",
      "name": "Sleep Apnea & Snoring",
      "description": "Repeated breathing interruptions during sleep (>10 seconds)",
      "prevalence": "30-40 million undiagnosed Indians",
      "symptoms": [
        "Loud snoring",
        "Gasping for air",
        "Daytime fatigue",
        "Morning headaches"
      ],
      "modalities_used": [
        "Audio",
        "Video",
        "Wearable (SpO2)"
      ],
      "risk_level": "HIGH"
    },
    {
      "id": "cardiac_arrhythmia",
      "name": "Cardiac Arrhythmia (Atrial Fibrillation)",
      "description": "Irregular heart rhythm during sleep",
      "prevalence": "5-10 million undiagnosed Indians",
      "symptoms": [
        "Heart palpitations",
        "Chest discomfort",
        "Shortness of breath"
      ],
      "modalities_used": [
        "Audio (heartbeat)",
        "Wearable (HRV)"
      ],
      "risk_level": "CRITICAL"
    },
    {
      "id": "rbd",
      "name": "REM Behavior Disorder",
      "description": "Acting out violent dreams during REM sleep",
      "prevalence": "1-2 million cases in India",
      "symptoms": [
        "Violent movements",
        "Talking/shouting",
        "Injury risk"
      ],
      "modalities_used": [
        "Video",
        "Audio"
      ],
      "risk_level": "HIGH",
      "note": "80% develop Parkinson's within 10-15 years"
    },
    {
      "id": "insomnia",
      "name": "Insomnia & Mental Health Disorders",
      "description": "Chronic difficulty falling asleep or staying asleep",
      "prevalence": "150 million Indians with mental health issues",
      "symptoms": [
        "Difficulty falling asleep",
        "Frequent wake-ups",
        "Non-restorative sleep"
      ],
      "modalities_used": [
        "Sleep pattern analysis",
        "Duration tracking"
      ],
      "risk_level": "MEDIUM"
    },
    {
      "id": "bruxism",
      "name": "Bruxism (Teeth Grinding)",
      "description": "Unconscious grinding/clenching of teeth during sleep",
      "prevalence": "30-40 million Indians",
      "symptoms": [
        "Teeth grinding sounds",
        "Jaw pain",
        "Worn tooth enamel"
      ],
      "modalities_used": [
        "Audio (400-800 Hz signature)"
      ],
      "risk_level": "MEDIUM"
    },
    {
      "id": "pregnancy_sleep",
      "name": "Pregnancy Sleep Disorders",
      "description": "Sleep issues during pregnancy including position monitoring",
      "prevalence": "15-20 million pregnant women annually",
      "symptoms": [
        "Frequent wake-ups",
        "Sleep apnea",
        "Supine sleeping danger"
      ],
      "modalities_used": [
        "Video (position)",
        "Audio",
        "Wearable"
      ],
      "risk_level": "HIGH"
    },
    {
      "id": "sids",
      "name": "SIDS (Sudden Infant Death Syndrome)",
      "description": "Prevention through breathing and position monitoring",
      "prevalence": "50,000+ infant deaths annually in India",
      "symptoms": [
        "Breathing cessation",
        "Positional asphyxiation"
      ],
      "modalities_used": [
        "Video (breathing)",
        "Audio"
      ],
      "risk_level": "CRITICAL"
    },
    {
      "id": "circadian",
      "name": "Circadian Rhythm Disorders",
      "description": "Misalignment of biological clock with sleep schedule",
      "prevalence": "50+ million shift workers",
      "symptoms": [
        "Excessive daytime sleepiness",
        "Insomnia",
        "Poor sleep quality"
      ],
      "modalities_used": [
        "Body temperature",
        "Light exposure",
        "Sleep timing"
      ],
      "risk_level": "MEDIUM"
    }
  ]
}
```

---

### Get Team Information

**Endpoint:** `GET /api/v1/team`

**Description:** Get SOMNIA team information

**Authentication:** ❌ Not required

**Request:**
```bash
curl http://localhost:8000/api/v1/team
```

**Response (200 OK):**
```json
{
  "team_name": "Chimpanzini Bananini",
  "project": "SOMNIA - Comprehensive Sleep Health Monitoring System",
  "hackathon": "IIT Mandi iHub Multimodal AI Hackathon",
  "members": 4,
  "repository": "https://github.com/Vidyans26/SOMNIA",
  "description": "Detecting 8 critical sleep disorders using multimodal AI (audio, video, wearables, environmental sensors)"
}
```

---

## Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "detail": "Error message describing what went wrong",
  "timestamp": "2025-10-19T12:59:31.123456"
}
```

### Error Status Codes

| Status Code | Meaning | Example |
|-------------|---------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input parameters |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User doesn't have permission |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Server temporarily unavailable |

### Common Error Examples

**Invalid Audio Format (400):**
```json
{
  "detail": "Invalid audio format",
  "timestamp": "2025-10-19T12:59:31.123456"
}
```

**Authentication Failed (401):**
```json
{
  "detail": "Could not validate credentials",
  "timestamp": "2025-10-19T12:59:31.123456"
}
```

**Rate Limited (429):**
```json
{
  "detail": "Too many requests. Please try again later.",
  "timestamp": "2025-10-19T12:59:31.123456"
}
```

---

## Rate Limiting (Planned)

Rate limiting is described here for future implementation but is not active in this codebase yet.

### Limits by Endpoint Type (proposed)

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Public endpoints | 100 requests | 1 hour |
| Authenticated endpoints | 500 requests | 1 hour |
| Analysis endpoint | 50 requests | 1 hour |
| File upload | 20 requests | 1 hour |

### Rate Limit Headers (proposed)

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1697814000
```

### When Rate Limited (proposed)

If you exceed the limit, you'll receive a **429** response:

```json
{
  "detail": "Too many requests. Please try again later.",
  "retry_after": 3600
}
```

---

## Response Examples

### Complete Sleep Analysis Response

```json
{
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
    "Reduce screen time 1 hour before bed to improve REM sleep",
    "Maintain room temperature between 18-21°C for optimal sleep.",
    "Limit caffeine intake 6 hours before bedtime."
  ],
  "disorders_detected": [
    "mild_positional_apnea"
  ]
}
```

### Sleep Quality Classification

| Sleep Score | Classification | Action |
|------------|-----------------|--------|
| 90-100 | Excellent | Continue current sleep habits |
| 80-89 | Good | Minor improvements possible |
| 70-79 | Fair | Implement recommendations |
| 60-69 | Poor | Consult sleep specialist |
| <60 | Concerning | Urgent medical consultation |

---

## Testing the API

### Using Thunder Client (VS Code)

```
1. Install Thunder Client extension
2. New Request
3. Method: GET
4. URL: http://localhost:8000/api/v1/disorders
5. Click Send
6. View response in right panel
```

### Using Postman

```
1. Download Postman
2. Import collection (if available)
3. Set Base URL to http://localhost:8000
4. Make requests
5. View responses
```

### Using cURL

```bash
# Basic request
curl http://localhost:8000/api/v1/team

# With authentication
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/v1/analyze

# POST with data
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"duration_hours": 7.5, "user_id": "demo"}'
```

### Using JavaScript Fetch

```javascript
// Get demo analysis
fetch('http://localhost:8000/api/v1/demo-analysis')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// Authenticated request
const token = 'your-jwt-token';
fetch('http://localhost:8000/api/v1/analyze', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    duration_hours: 7.5,
    user_id: 'demo_user',
    recording_date: '2025-10-19T08:00:00Z'
  })
})
  .then(response => response.json())
  .then(data => console.log(data));
```

---

## Best Practices

### Security

- ✅ Always use HTTPS in production
- ✅ Never expose JWT tokens in logs
- ✅ Validate all user input
- ✅ Use rate limiting
- ✅ Implement CORS properly

### Performance

- ✅ Cache responses when appropriate
- ✅ Use pagination for large datasets
- ✅ Compress responses (gzip)
- ✅ Monitor API response times
- ✅ Use CDN for static files

### Error Handling

- ✅ Provide clear error messages
- ✅ Include error codes
- ✅ Log errors for debugging
- ✅ Handle gracefully on client
- ✅ Retry failed requests intelligently

---

## Support

For API issues:
- Check this documentation
- Review error response details
- Check GitHub Issues: https://github.com/Vidyans26/SOMNIA/issues
- Contact team: chimpanzini.bananini@hackathon.com

---

**Version:** 0.1.0  
**Team:** Chimpanzini Bananini
