# Snoring Detection Model Assets

This folder is the drop-in location for the trained model files produced by the
adrianagaler/Snoring-Detection project (TensorFlow Speech Commands pipeline).

Expected files by default (configurable via environment variables):

- snoring_frozen_graph.pb
- labels.txt

You can override the paths with:
- SNORING_GRAPH_PATH (absolute path to .pb)
- SNORING_LABELS_PATH (absolute path to labels.txt)

How to obtain these files:
1. Follow the training notebook/script in Snoring-Detection to train a model.
2. Run the provided `freeze.py` script to export a frozen graph with:
   - input tensor: `wav_data:0`
   - output tensor: `labels_softmax:0`
3. Copy the resulting `.pb` and the labels file (e.g., `*_labels.txt`) here and
   rename the labels file to `labels.txt` if needed.

Once placed, you can verify the backend sees the model:
- GET /api/v1/snoring/status => { configured: true }

Then run inference by uploading a WAV file:
- POST /api/v1/snoring/detect (multipart/form-data, file)
