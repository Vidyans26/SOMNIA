"""
Snoring Detection Inference Adapter (adrianagaler/Snoring-Detection)

This module adapts the TensorFlow 'label_wav.py' example to run inference
on a frozen graph (.pb) produced by the Snoring-Detection training pipeline.

Expected assets (configurable in backend.config):
- SNORING_GRAPH_PATH: path to the frozen graph (.pb) with 'wav_data' input and
  'labels_softmax' output created by freeze.py in the repo
- SNORING_LABELS_PATH: path to labels.txt containing the class names, e.g.:
    no_snoring\n
    snoring\n
Both are Apache-2.0 compatible, derived from TensorFlow examples.
"""
from __future__ import annotations

import os
from typing import List, Dict, Any

import numpy as np

from backend.config import (
    SNORING_GRAPH_PATH,
    SNORING_LABELS_PATH,
    SNORING_INPUT_TENSOR,
    SNORING_OUTPUT_TENSOR,
)

# Lazy TensorFlow import to avoid impacting app startup
_TF = None  # type: ignore
_GRAPH: Any = None
_SESSION: Any = None
_LABELS: List[str] = []


def is_configured() -> bool:
    """Return True if both graph and labels exist on disk."""
    return os.path.exists(SNORING_GRAPH_PATH) and os.path.exists(SNORING_LABELS_PATH)


def _load_labels(filename: str) -> List[str]:
    tf = _get_tf()
    with tf.io.gfile.GFile(filename) as f:
        return [line.rstrip() for line in f]

def _get_tf():
    global _TF
    if _TF is None:
        import tensorflow as tf  # type: ignore
        tf.compat.v1.disable_eager_execution()
        _TF = tf
    return _TF


def _load_graph(filename: str):
    """Unpersists a graph from file as the default graph and returns it."""
    tf = _get_tf()
    with tf.io.gfile.GFile(filename, "rb") as f:
        graph_def = tf.compat.v1.GraphDef()
        graph_def.ParseFromString(f.read())

    graph = tf.Graph()
    with graph.as_default():
        tf.import_graph_def(graph_def, name="")
    return graph


def _ensure_session():
    global _GRAPH, _SESSION, _LABELS
    if _GRAPH is None:
        if not is_configured():
            raise FileNotFoundError(
                f"Snoring model not configured. Expected graph at {SNORING_GRAPH_PATH} and labels at {SNORING_LABELS_PATH}."
            )
    _GRAPH = _load_graph(SNORING_GRAPH_PATH)
    _LABELS = _load_labels(SNORING_LABELS_PATH)
    tf = _get_tf()
    _SESSION = tf.compat.v1.Session(graph=_GRAPH)


def infer_wav(
    wav_path: str,
    how_many_labels: int = 2,
    input_tensor_name: str = SNORING_INPUT_TENSOR,
    output_tensor_name: str = SNORING_OUTPUT_TENSOR,
) -> Dict:
    """
    Run snoring detection on a WAV file and return top predictions.

    Returns a dict: {"top": [(label, score), ...], "label": str, "score": float}
    """
    _ensure_session()
    assert _GRAPH is not None and _SESSION is not None
    tf = _get_tf()

    # Read WAV bytes
    if not tf.io.gfile.exists(wav_path):
        raise FileNotFoundError(f"Audio file not found: {wav_path}")
    with open(wav_path, "rb") as wav_file:
        wav_data = wav_file.read()

    input_name = input_tensor_name
    output_name = output_tensor_name

    # Fetch tensors
    output_operation = _GRAPH.get_tensor_by_name(output_name)
    input_operation = _GRAPH.get_tensor_by_name(input_name)

    results = _SESSION.run(output_operation, {input_operation: wav_data})
    results = np.squeeze(results)

    # Top-k
    top_k_indices = results.argsort()[-how_many_labels:][::-1]
    top = [(str(_LABELS[i] if i < len(_LABELS) else i), float(results[i])) for i in top_k_indices]

    label, score = top[0]
    return {"top": top, "label": label, "score": score}


def close():
    global _SESSION
    if _SESSION is not None:
        _SESSION.close()
        _SESSION = None
