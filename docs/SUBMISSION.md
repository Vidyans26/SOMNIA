# Submission Guide (SOMNIA)

This page helps reviewers evaluate the project quickly, without running anything.

## 🔗 Links
- Demo video: https://youtu.be/20hAvUPZS0k
- API docs: docs/API.md
- Demo guide: docs/DEMO.md
- Architecture: docs/ARCHITECTURE.md
- Model Card: docs/MODEL_CARD.md
- Privacy: docs/PRIVACY.md

## ✅ What’s implemented
- FastAPI backend with health, analysis (mock), demo endpoints, and wearable ingestion.
- Mobile app (Expo/React Native) with audio record flow and services.
- Video pose extraction endpoint (optional module).
- Snoring detection integration code (optional, disabled by default via feature flag).

## 🧪 How to evaluate in 2 minutes
- Watch the demo video.
- Skim docs/API.md for endpoints and sample responses.
- Check docs/DEMO.md for quick curl examples (mock-friendly).
- (Optional) See routers and models in `backend/` for implementation specifics.

## ⚙️ Optional: enable snoring (if you choose to run)
- Set environment: `ENABLE_SNORING=true`
- Provide model files (frozen graph + labels) as documented in docs/API.md.

No external services are required for basic evaluation.
