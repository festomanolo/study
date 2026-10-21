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

_ONES = (
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
    "seventeen", "eighteen", "nineteen",
)
_TENS = ("", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety")


def _num_to_words(n: int) -> str:
    if n < 0:
        return "minus " + _num_to_words(-n)
    if n < 20:
        return _ONES[n]
    if n < 100:
        return _TENS[n // 10] + ("" if n % 10 == 0 else " " + _ONES[n % 10])
    if n < 1000:
        rem = n % 100
        return _ONES[n // 100] + " hundred" + ("" if rem == 0 else " and " + _num_to_words(rem))
    if n < 1_000_000:
        rem = n % 1000
        return _num_to_words(n // 1000) + " thousand" + ("" if rem == 0 else " " + _num_to_words(rem))
    return " ".join(_ONES[int(d)] for d in str(n))


def ensure_model() -> tuple[ort.InferenceSession, dict[str, int]]:
    global _SESSION, _VOCAB
    with _LOCK:
        if _SESSION is not None and _VOCAB is not None:
            return _SESSION, _VOCAB
        if not ONNX_PATH.exists() or not VOCAB_PATH.exists():
            from huggingface_hub import hf_hub_download
            MODEL_DIR.mkdir(parents=True, exist_ok=True)
            for fn in ("config.json", "vocab.json", "tokenizer.json", "tokenizer_config.json", "onnx/model_quantized.onnx"):
                hf_hub_download("Xenova/mms-tts-eng", fn, local_dir=str(MODEL_DIR))
        _VOCAB = json.loads(VOCAB_PATH.read_text(encoding="utf-8"))
        opts = ort.SessionOptions()
        opts.intra_op_num_threads = 4
        _SESSION = ort.InferenceSession(str(ONNX_PATH), sess_options=opts, providers=["CPUExecutionProvider"])
