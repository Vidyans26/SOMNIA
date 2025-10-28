# Data Handling & Privacy

This repository includes a backend and a mobile app. For the hackathon submission, the default configuration focuses on easy evaluation without persisting sensitive data unnecessarily.

## Audio
- Endpoint: `POST /api/v1/upload/audio` validates the file type and returns a generated ID.
- In the current submission, audio files are not persisted by default. The endpoint returns an ID for demonstration.

## Analysis
- Endpoint: `POST /api/v1/analyze` returns realistic mock analysis without accessing previous uploads.
- Returned data includes sleep efficiency, stage minutes, apnea event count, and recommendations.

## Wearable
- Endpoint: `POST /api/v1/upload/wearable` accepts a JSON payload of samples.
- A summarized record is stored as JSON under `uploads/wearable/` to allow quick review of ingestion.
- Example fields: `avg_hr`, `min_spo2`, `spo2_drops`, `risk_score`, `risk_level`.

## Video Pose (optional)
- Endpoint: `POST /api/v1/upload/video-pose` saves the uploaded video in `uploads/videos/` and extracts frame features.
- This is an optional module and not required for basic evaluation.

## Snoring Detection (optional)
- The integration code for a frozen TensorFlow graph is present but disabled by default.
- To enable, an environment flag is required (see docs/API.md). Required model artifacts must be provided by the user.

## Credentials & Secrets
- Environment variables are loaded via `.env` if present. Do not commit real secrets in public forks.

## Notes
- This is a hackathon submission intended for offline review. It does not transmit data to external services by default.
- Before production use, review storage, retention, and consent policies.
