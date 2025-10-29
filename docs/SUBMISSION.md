# Submission Guide (SOMNIA)

This page helps reviewers evaluate the project quickly.

## 🔗 Links
- GitHub: https://github.com/Vidyans26/SOMNIA
- API docs: docs/API.md
- Demo guide: docs/DEMO.md
- Architecture: docs/ARCHITECTURE.md
- Model Card: docs/MODEL_CARD.md
- Privacy: docs/PRIVACY.md
- Complete Documentation: docs/INDEX.md

## ✅ What's implemented
- FastAPI backend with health, analysis (ML-powered), demo endpoints, and wearable ingestion.
- Mobile app (Expo SDK 51/React Native) with audio record flow and services.
- Video pose extraction endpoint (optional module).
- Snoring detection integration code (optional, disabled by default via feature flag).

## 🧪 How to evaluate quickly
- Read README.md for project overview
- Check FINAL_SUMMARY.md for completion status  
- Skim docs/API.md for endpoints and sample responses
- Check docs/DEMO.md for quick curl examples
- (Optional) See routers and models in `backend/` for implementation specifics
- (Optional) Try QUICKSTART.md to run it yourself (5 minutes)

## ⚙️ Optional: enable snoring (if you choose to run)
- Set environment: `ENABLE_SNORING=true`
- Provide model files (frozen graph + labels) as documented in docs/API.md.

No external services are required for basic evaluation.
