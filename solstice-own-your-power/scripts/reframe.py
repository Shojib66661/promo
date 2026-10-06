"""Reframes the landscape source (1216x718) to 1080x1920: a 9:16 crop that slowly
follows the head (headx.json, Gaussian-smoothed), Lanczos upscale + light unsharp.
The TikTok watermark sits at x < 240 or x > 1100, always outside the crop.
usage: python3 scripts/reframe.py orig/source_raw.mp4 public/video/source.mp4
"""
import json, os, subprocess, sys
import cv2, numpy as np

HERE = os.path.dirname(__file__)
src, dst = sys.argv[1], sys.argv[2]
hx = np.array(json.load(open(os.path.join(HERE, 'analysis', 'headx.json')))['x'])
# heavy smoothing (sigma 1 s) so the crop drifts, never jitters
k = np.exp(-0.5 * (np.arange(-90, 91) / 30) ** 2); k /= k.sum()
sm = np.convolve(np.pad(hx, 90, mode='edge'), k, mode='valid')
cap = cv2.VideoCapture(src)
W, H = int(cap.get(3)), int(cap.get(4))
CW = round(H * 9 / 16)  # 404
OW, OH = 1080, 1920
lefts = np.clip(np.round(sm - CW / 2), 0, W - CW).astype(int)
json.dump({'cropW': CW, 'srcH': H, 'left': lefts.tolist()}, open(os.path.join(HERE, 'analysis', 'crop.json'), 'w'))
ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{OW}x{OH}', '-r', '30',
                       '-i', '-', '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', '-pix_fmt', 'yuv420p', dst], stdin=subprocess.PIPE)
i = 0
while True:
    ok, fr = cap.read()
    if not ok:
        break
    x0 = lefts[min(i, len(lefts) - 1)]
    c = cv2.resize(fr[:, x0:x0 + CW], (OW, OH), interpolation=cv2.INTER_LANCZOS4)
    blur = cv2.GaussianBlur(c, (0, 0), 2.2)
    c = cv2.addWeighted(c, 1.35, blur, -0.35, 0)
    ff.stdin.write(c.tobytes())
    i += 1
ff.stdin.close(); ff.wait()
print(f'{i} frames, crop left {lefts.min()}-{lefts.max()} (width {CW})')
