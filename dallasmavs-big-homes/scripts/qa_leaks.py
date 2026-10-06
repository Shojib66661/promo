"""Caption-leak scan for label-covered captions.

Runs the kit's caption detector on every rendered frame (scaled to source size) and
drops the hits that sit on our navy caption labels; anything left is a possible
leak of the old burned-in caption. Writes a contact sheet of the leftovers.
usage: python3 scripts/qa_leaks.py out/render.mp4 out/leaks.jpg [--until FRAME]
"""
import os, sys
import cv2, numpy as np
sys.path.insert(0, os.path.expanduser('~/kit/tools'))
from caption_detect import detect

src, sheet = sys.argv[1], sys.argv[2]
START = int(sys.argv[sys.argv.index("--from") + 1]) if "--from" in sys.argv else -1
until = int(sys.argv[sys.argv.index('--until') + 1]) if '--until' in sys.argv else 10 ** 9
NAVY = np.array([0x3f, 0x1f, 0x0b], np.float32)  # BGR
cap = cv2.VideoCapture(src)
f, hits = 0, []
while f < until:
    ok, fr = cap.read()
    if not ok:
        break
    sm = cv2.resize(fr, (720, 1280), interpolation=cv2.INTER_AREA)
    for x0, y0, x1, y1, n in detect(sm):
        pad = 8
        a = sm[max(0, y0 - pad):y1 + pad, max(0, x0 - pad):x1 + pad].reshape(-1, 3).astype(np.float32)
        navy = (np.linalg.norm(a - NAVY, axis=1) < 45).mean()
        if navy < 0.15:
            hits.append((f, (x0, y0, x1, y1), sm.copy()))
    f += 1
print(f'{f} frames scanned, {len(hits)} non-label hits on {len(set(h[0] for h in hits))} frames')
tiles = []
for fi, (x0, y0, x1, y1), im in [h for h in hits if h[0] > START][:120]:
    # zoomed crop around the hit (source-size frame)
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    a, b = max(0, cx - 160), max(0, cy - 60)
    t = im[b:b + 120, a:a + 320].copy()
    cv2.rectangle(t, (x0 - a, y0 - b), (x1 - a, y1 - b), (0, 255, 255), 2)
    t = cv2.resize(cv2.copyMakeBorder(t, 0, 120 - t.shape[0], 0, 320 - t.shape[1], cv2.BORDER_CONSTANT), (320, 120))
    cv2.putText(t, str(fi), (4, 18), 0, 0.6, (0, 255, 255), 2); tiles.append(t)
if tiles:
    while len(tiles) % 6:
        tiles.append(np.zeros_like(tiles[0]))
    cv2.imwrite(sheet, np.vstack([np.hstack(tiles[k:k + 6]) for k in range(0, len(tiles), 6)]))
    print('sheet', sheet)
