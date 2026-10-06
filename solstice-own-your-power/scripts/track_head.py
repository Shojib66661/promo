"""Tracks the speaker's head x in the LANDSCAPE source (1216x718) for the 9:16 reframe.

u2net_human_seg on every 5th frame; head x = centroid of the mask's top 45 %
(cap + face). Writes scripts/analysis/headx.json (per source frame, interpolated).
usage: python3 scripts/track_head.py orig/source_raw.mp4
"""
import json, os, sys
import cv2, numpy as np, onnxruntime as ort

M = os.environ.get('MODELS_DIR', os.path.expanduser('~/models'))
HERE = os.path.dirname(__file__)
sess = ort.InferenceSession(f'{M}/u2net_human_seg.onnx', providers=['CPUExecutionProvider'])
inp = sess.get_inputs()[0].name
mean, std = np.array([0.485, 0.456, 0.406]), np.array([0.229, 0.224, 0.225])
cap = cv2.VideoCapture(sys.argv[1])
N = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
xs, ts, tops = [], [], []
i = 0
while True:
    ok, fr = cap.read()
    if not ok:
        break
    if i % 5 == 0:
        H, W = fr.shape[:2]
        x = cv2.resize(cv2.cvtColor(fr, cv2.COLOR_BGR2RGB), (320, 320)).astype(np.float32) / 255
        x = ((x - mean) / std).transpose(2, 0, 1)[None].astype(np.float32)
        m = sess.run(None, {inp: x})[0][0, 0]
        m = (m - m.min()) / (m.max() - m.min() + 1e-6)
        m = cv2.resize(m, (W, H)) > 0.5
        rows = np.where(m.any(1))[0]
        top = rows.min() if len(rows) else 0
        band = m[top:top + int(0.45 * H)]
        cols = np.where(band)[1]
        xs.append(float(np.median(cols)) if len(cols) else W / 2)
        ts.append(i); tops.append(int(top))
    i += 1
hx = np.interp(np.arange(i), ts, xs)
json.dump({'n': i, 'x': [round(v, 1) for v in hx], 'top': tops, 'sampled': ts}, open(os.path.join(HERE, 'analysis', 'headx.json'), 'w'))
print(f'{i} frames; head x min {min(xs):.0f} max {max(xs):.0f} median {np.median(xs):.0f}; top y min {min(tops)} max {max(tops)}')
