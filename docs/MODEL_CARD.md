# Model Card (High-Level)

This repo contains ML components for sleep analysis, and code for optional snoring detection.

## Intended Use
- Provide nightly sleep quality insights and disorder risk indicators from multimodal signals (audio, video pose, wearable).
- Optional snoring detection via a frozen TensorFlow graph (Speech Commands pipeline adaptation).

## Inputs
- Audio (recommended 16 kHz WAV for model-based processing)
- Wearable samples: `{ ts, hr, spo2, hrv }`
- Video (for pose feature extraction)

## Outputs
- Sleep analysis: efficiency, total sleep time, stage minutes, apnea events, risk assessment, recommendations.
- Wearable summary: min/avg SpO2, drops count, avg HR/HRV, simple risk score/level.
- Optional snoring inference: top label and probability.

## Training Data (snoring module)
- The snoring module references an external repository for training. This repo includes inference integration code only.
- Judges can enable it by supplying frozen graph + labels from the referenced project.

## Limitations
- Analysis endpoint returns mock results by design for quick evaluation.
- Snoring detection requires model artifacts not included here.
- Wearable summary is heuristic and not a medical device output.

## Ethical & Privacy Considerations
- Audio and video are sensitive—default configuration avoids persistent storage for audio.
- Wearable summaries are stored locally for inspection and can be disabled.
- See docs/PRIVACY.md for details.
