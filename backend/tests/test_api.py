import os
from fastapi.testclient import TestClient

# Ensure feature flags are off for predictable tests
os.environ["ENABLE_SNORING"] = "false"
os.environ["ENABLE_VIDEO_POSE"] = "false"

from backend.main import app  # noqa: E402

client = TestClient(app)

def test_root_health():
    r = client.get("/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "healthy"
    assert data.get("service")


def test_disorders():
    r = client.get("/api/v1/disorders")
    assert r.status_code == 200
    data = r.json()
    assert data.get("total_disorders") == 8
    assert isinstance(data.get("disorders"), list)


def test_demo_analysis():
    r = client.get("/api/v1/demo-analysis")
    assert r.status_code == 200
    data = r.json()
    assert "sleep_efficiency" in data
    assert "sleep_stages" in data


def test_analyze_requires_auth_and_returns_result():
    payload = {
        "duration_hours": 7.5,
        "user_id": "demo_user",
        "recording_date": "2025-10-19T08:00:00Z",
        "audio_file_id": None,
        "video_file_id": None,
        "wearable_data": None,
        "environmental_data": None,
    }
    headers = {"Authorization": "Bearer test-token"}
    r = client.post("/api/v1/analyze", json=payload, headers=headers)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "sleep_efficiency" in data
    assert "total_sleep_time" in data
    assert "sleep_stages" in data
    assert "apnea_events" in data
    assert "recommendations" in data
