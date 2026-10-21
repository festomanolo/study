#!/usr/bin/env python3
"""Local development & neural TTS server for MANOLO Backpack.

Serves static files on port 8080 (like `python3 -m http.server 8080`) and provides:
  - GET /api/tts/status -> JSON model readiness
  - GET /api/tts?text=... -> 16 kHz 16-bit PCM WAV synthesized via local ONNX VITS
    model (`models/mms-tts-eng/onnx/model_quantized.onnx`, ~36.6 MB).

If the model files are not yet present in `models/mms-tts-eng/`, they are
downloaded automatically from `Xenova/mms-tts-eng` on Hugging Face.
"""
from __future__ import annotations

import io
import json
import re
import sys
import threading
import urllib.parse
import wave
from collections import OrderedDict
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import numpy as np
import onnxruntime as ort

ROOT = Path(__file__).resolve().parent.parent
MODEL_DIR = ROOT / "models" / "mms-tts-eng"
ONNX_PATH = MODEL_DIR / "onnx" / "model_quantized.onnx"
VOCAB_PATH = MODEL_DIR / "vocab.json"
SAMPLE_RATE = 16000

_LOCK = threading.Lock()
_SESSION: ort.InferenceSession | None = None
_VOCAB: dict[str, int] | None = None
_CACHE: OrderedDict[str, bytes] = OrderedDict()
_CACHE_MAX = 128
