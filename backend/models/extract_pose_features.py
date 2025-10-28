"""
Extract pose keypoints using MediaPipe Pose and compute chest-motion features.
Saves per-frame CSV and a summary JSON for each video.

Usage:
  # from repo root
  python backend/models/extract_pose_features.py --video data/video/normal/example1.mp4 --out_dir data/video_features --sample_rate 2

Dependencies:
  mediapipe, opencv-python-headless, numpy, pandas, scipy
"""
import argparse
from pathlib import Path
import cv2
import numpy as np
import mediapipe as mp
import pandas as pd
import json
from scipy.signal import find_peaks
from scipy.ndimage import gaussian_filter1d

mp_pose = mp.solutions.pose

# MediaPipe Pose landmark indices of interest
LEFT_SHOULDER = 11
RIGHT_SHOULDER = 12
LEFT_HIP = 23
RIGHT_HIP = 24

def extract_pose_chest_motion(video_path: str, sample_rate: int = 1):
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    frame_idx = 0
    prev_chest = None
    motion_list = []
    frames_info = []

    pose = mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5, model_complexity=1)

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame_idx += 1
        if (frame_idx - 1) % sample_rate != 0:
            continue

        # convert to RGB for mediapipe
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(rgb)

        if results.pose_landmarks:
            lm = results.pose_landmarks.landmark
            try:
                chest_x = float((lm[LEFT_SHOULDER].x + lm[RIGHT_SHOULDER].x + lm[LEFT_HIP].x + lm[RIGHT_HIP].x) / 4.0)
                chest_y = float((lm[LEFT_SHOULDER].y + lm[RIGHT_SHOULDER].y + lm[LEFT_HIP].y + lm[RIGHT_HIP].y) / 4.0)
                visibility = float((lm[LEFT_SHOULDER].visibility + lm[RIGHT_SHOULDER].visibility + lm[LEFT_HIP].visibility + lm[RIGHT_HIP].visibility)/4.0)
            except Exception:
                chest_x, chest_y, visibility = np.nan, np.nan, 0.0
        else:
            chest_x, chest_y, visibility = np.nan, np.nan, 0.0

        # compute motion magnitude vs previous valid point
        if prev_chest is not None and not np.isnan(chest_x) and not np.isnan(chest_y):
            motion = float(np.linalg.norm(np.array([chest_x, chest_y]) - np.array(prev_chest)))
        else:
            motion = 0.0

        if not np.isnan(chest_x) and not np.isnan(chest_y):
            prev_chest = (chest_x, chest_y)

        ts = (frame_idx - 1) / fps
        frames_info.append({
            "frame": frame_idx,
            "timestamp": ts,
            "chest_x": chest_x,
            "chest_y": chest_y,
            "visibility": visibility,
            "motion": motion
        })
        motion_list.append(motion)

    pose.close()
    cap.release()
    return frames_info, motion_list, fps

def summarize_motion(motion_list, fps, sample_rate=1):
    if len(motion_list) == 0:
        return {"mean_motion": 0.0, "std_motion": 0.0, "peak_rate_bpm": 0.0, "num_peaks": 0, "duration_seconds": 0.0}

    motion_arr = np.array(motion_list)
    mean_motion = float(np.nanmean(motion_arr))
    std_motion = float(np.nanstd(motion_arr))

    # smooth and find peaks (breathing proxies)
    smooth = gaussian_filter1d(motion_arr.astype(np.float32), sigma=1)
    min_distance = max(1, int(fps * 0.5 / sample_rate))  # at least 0.5s between peaks
    peaks, _ = find_peaks(smooth, distance=min_distance, prominence=0.0005)

    num_peaks = len(peaks)
    duration_seconds = max(1.0, len(motion_arr) * (1.0 / fps) * sample_rate)
    peak_rate_bpm = float((num_peaks / duration_seconds) * 60.0) if duration_seconds > 0 else 0.0

    return {
        "mean_motion": mean_motion,
        "std_motion": std_motion,
        "num_peaks": int(num_peaks),
        "peak_rate_bpm": peak_rate_bpm,
        "duration_seconds": duration_seconds
    }

def run_on_video(video_path: str, out_dir: str, sample_rate: int = 1):
    video_path = Path(video_path)
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    frames_info, motion_list, fps = extract_pose_chest_motion(str(video_path), sample_rate=sample_rate)
    df = pd.DataFrame(frames_info)
    csv_path = out_dir / f"{video_path.stem}_frames.csv"
    df.to_csv(csv_path, index=False)

    summary = summarize_motion(motion_list, fps, sample_rate)
    json_path = out_dir / f"{video_path.stem}_summary.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(f"Saved frames CSV to: {csv_path}")
    print(f"Saved summary JSON to: {json_path}")
    return csv_path, json_path

def main():
    parser = argparse.ArgumentParser(description="Extract chest-motion features from a video using MediaPipe.")
    parser.add_argument("--video", required=True, help="Path to input video (mp4)")
    parser.add_argument("--out_dir", required=True, help="Output directory to save CSV/JSON")
    parser.add_argument("--sample_rate", type=int, default=2, help="Process every n-th frame (default=2)")
    args = parser.parse_args()
    run_on_video(args.video, args.out_dir, sample_rate=args.sample_rate)

if __name__ == "__main__":
    main()