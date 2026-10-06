"""Their burned-in caption as its own RGBA layer -> public/video/captions.webm.

In the B&W star moments the star and the cutout are drawn over the video, which
would hide the parts of their caption that aren't on his body. This layer puts
the caption letters back on top: alpha = how white a pixel is (near-white, low
saturation) inside the caption's box (union of detector boxes over +-6 frames,
mirrored around the centre). Fading words come out partly transparent, as in the source.
usage: python3 scripts/caption_layer.py
"""
import json, os, subprocess
import cv2, numpy as np

HERE = os.path.dirname(__file__)
SRC = os.path.join(HERE, '..', 'public', 'video', 'source.mp4')
OUT = os.path.join(HERE, '..', 'public', 'video', 'captions.webm')
B = json.load(open(os.path.join(HERE, 'analysis', 'capboxes.json')))
N = len(B)
band = [[b for b in bs if 600 <= (b[1] + b[3]) / 2 <= 800 and 14 <= b[3] - b[1] <= 75] for bs in B]


def region(f):
    c = [b for g in range(max(0, f - 6), min(N, f + 7)) for b in band[g]]
    if not c:
        return None
    half = max(360 - min(b[0] for b in c), max(b[2] for b in c) - 360) + 24
    return int(360 - half), min(b[1] for b in c) - 14, int(360 + half), max(b[3] for b in c) + 16


cap = cv2.VideoCapture(SRC)
W, H = int(cap.get(3)), int(cap.get(4))
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgra', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                        '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '30', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '5', OUT],
                       stdin=subprocess.PIPE)
f = 0
while True:
    ok, fr = cap.read()
    if not ok:
        break
    a = np.zeros((H, W), np.float32)
    r = region(f) if f < 1473 else None
    if r:
        x0, y0, x1, y1 = max(0, r[0]), max(0, r[1]), min(W, r[2]), min(H, r[3])
        roi = fr[y0:y1, x0:x1].astype(np.float32)
        mn, mx = roi.min(2), roi.max(2)
        a[y0:y1, x0:x1] = np.clip((mn - 150) / 60, 0, 1) * np.clip((60 - (mx - mn)) / 25, 0, 1)
        a = cv2.GaussianBlur(a, (0, 0), 0.6)
    fr[a < 0.01] = 0  # nothing to encode under transparent pixels (keeps the file small)
    rgba = np.dstack([fr, (a * 255).astype(np.uint8)])
    enc.stdin.write(rgba.tobytes())
    f += 1
enc.stdin.close(); enc.wait()
print('wrote', OUT, f, 'frames')
