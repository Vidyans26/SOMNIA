# SOMNIA Demo Guide

This short guide shows how to evaluate SOMNIA in seconds without running anything, plus optional commands if you want to poke the API.

## 🎥 Video Demo

- YouTube: https://youtu.be/20hAvUPZS0k

## 📌 What to look for

- Multimodal flow: audio + wearable + video pose with a clean backend API
- Risk scoring and recommendations returned by the analysis endpoint
- Optional snoring detection integration code included (feature-flagged off by default)

## 🚦 Zero-run evaluation (screenshots and docs)

- API Overview: docs/API.md
- Architecture: docs/ARCHITECTURE.md

## ▶️ Optional: quick API checks (mock-friendly)

If you decide to run locally, here are two quick requests. Backend returns realistic mock analysis.

1) Health
```bash
curl http://localhost:8000/
```

2) Analyze (mock result)
```bash
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "duration_hours": 7.5,
    "user_id": "demo_user",
    "recording_date": "2025-10-19T08:00:00Z"
  }'
```

Expected response (abbreviated):
```json
{
  "sleep_efficiency": 0.86,
  "total_sleep_time": 7.2,
  "sleep_stages": {"wake":36,"light":224,"deep":98,"rem":74},
  "apnea_events": 8,
  "risk_assessment": "moderate",
  "recommendations": ["Side sleep","18–21°C room temp","No screens 1h before bed"],
  "disorders_detected": ["mild_positional_apnea"]
}
```

## Extras

- Postman collection: [docs/api-collection.postman_collection.json](./api-collection.postman_collection.json)
- Sample requests/responses: [docs/samples/](./samples/)

## 🔈 Optional: snoring detection (code included, toggled off by default)

Snoring detection integration (frozen TensorFlow graph) is present and can be enabled via `ENABLE_SNORING=true`. See docs/API.md (Snoring Detection section) for the status and detect endpoints.
