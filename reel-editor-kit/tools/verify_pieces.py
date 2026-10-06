#!/usr/bin/env python3
"""Whisper each (in,out) frame piece of a wav: python3 verify_pieces.py vocals.wav 59:148 217:357 ..."""
import os, subprocess, sys
import numpy as np, sherpa_onnx
M = os.path.expanduser('~/models'); W = f'{M}/sherpa-onnx-whisper-small.en/'
wr = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=W + 'small.en-encoder.int8.onnx', decoder=W + 'small.en-decoder.int8.onnx', tokens=W + 'small.en-tokens.txt', num_threads=4)
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
a = np.frombuffer(raw, np.float32)
pad = np.zeros(8000, np.float32)
for spec in sys.argv[2:]:
    i, o = [int(x) for x in spec.split(':')]
    seg = np.concatenate([pad, a[int(i / 30 * 16000):int(o / 30 * 16000)], pad])
    s = wr.create_stream(); s.accept_waveform(16000, seg); wr.decode_stream(s)
    print(f'{spec:>10}  {s.result.text.strip()}')
