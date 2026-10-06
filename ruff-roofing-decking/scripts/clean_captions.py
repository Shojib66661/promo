"""Remove the burned-in one-word captions with TEMPORAL fill (+ spatial inpaint fallback).

The old captions are single words on a thin strip (y ~650-790 in the 720x1280
source) that change every few frames, so most pixels under a word are visible
in a nearby frame of the same shot. For every masked pixel we take the median
of the closest unmasked frames (same shot, within +-MAXD frames); pixels never
uncovered fall back to cv2.inpaint. Beats pure inpainting, which left a smear.

usage: clean_captions.py src.mp4 capboxes.json out.mp4 [--shots 0,38,...] [--png dir --frames a,b]
"""
import cv2, json, subprocess, sys
import numpy as np

src, boxes_p, out = sys.argv[1], sys.argv[2], sys.argv[3]
arg = lambda k: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else None
SHOTS = [int(x) for x in arg('--shots').split(',')] if arg('--shots') else [0]
pngdir = arg('--png')
only = set(int(x) for x in arg('--frames').split(',')) if arg('--frames') else None
Y0, Y1 = 540, 960
MAXD, K = 24, 5
PERSON = arg('--person')  # dir of person masks (%05d.png); body pixels use spatial inpaint

B = json.load(open(boxes_p))
N = len(B)
band = [[b for b in bs if 560 <= (b[1] + b[3]) / 2 <= 950 and 14 <= b[3] - b[1] <= 70] for bs in B]
# Ruff Roofing: coloured accent words / icons the white detector misses (source seconds, box, colours)
EXTRA = [
    (1.30, 1.97, [130, 560, 580, 700], 'wc'),     # cyan "Dre"
    (17.35, 18.40, [140, 590, 610, 690], 'o'),    # PRETTY OLD
    (26.10, 27.97, [90, 590, 640, 690], 'o'),     # SHEETROCK / YOUR RAFTERS
    (45.30, 46.50, [290, 540, 440, 650], 'W'),    # phone icon above "shoot us a call"
]

cap = cv2.VideoCapture(src)
W, H = int(cap.get(3)), int(cap.get(4))
frames = []
while True:
    ok, fr = cap.read()
    if not ok:
        break
    frames.append(fr)
assert len(frames) == N, (len(frames), N)


def region(f):
    """Ruff Roofing: the detector needs a dark halo and misses words on bright decking / sky,
    so use the fixed caption zones of their edit (source seconds)."""
    t = f / 30
    if t < 0.3 or t >= 51.5:
        return None
    if t < 2.0:
        return [120, 560, 610, 705]
    if 29.4 <= t < 34.8:
        return [140, 866, 590, 952]
    if 34.8 <= t < 36.1:
        return [210, 548, 510, 618]
    return [110, 594, 620, 684]


def glyphs(roi, mode):
    mn, mx = roi.min(2), roi.max(2)
    b, g, r = roi[..., 0], roi[..., 1], roi[..., 2]
    m = np.zeros(roi.shape[:2], bool)
    if 'w' in mode:
        w = ((mn > 180) & (mx - mn < 50)).astype(np.uint8)
        n, lab, st, _ = cv2.connectedComponentsWithStats(w, 8)
        ok = np.zeros(n, bool)
        for i in range(1, n):
            x, y, ww, hh, a = st[i]
            ok[i] = hh <= 62 and ww <= 260 and a <= 5200 and a >= 6
        m |= ok[lab]
    if 'W' in mode:  # raw white, no glyph-size filter (icons)
        m |= (mn > 175) & (mx - mn < 60)
    if 'c' in mode:
        m |= (b > 190) & (g > 160) & (r < 140)
    if 'o' in mode:
        m |= (r > 150) & (r - b > 110) & (g < 185) & (b < 110) & (r > g + 40)
    return m.astype(np.uint8)


# per-frame mask of the old caption (glyphs + shadow halo), band rows only
masks = np.zeros((N, Y1 - Y0, W), np.uint8)
for f in range(N):
    regs = []
    r = region(f)
    if r:
        regs.append((r, 'w'))
    regs += [(bx, md) for t0, t1, bx, md in EXTRA if t0 * 30 <= f < t1 * 30]
    for (x0, y0, x1, y1), md in regs:
        roi = frames[f][y0:y1, x0:x1].astype(np.int16)
        g = cv2.dilate(glyphs(roi, md), np.ones((5, 5), np.uint8))
        sh = np.zeros_like(g)
        sh[3:, 3:] = g[:-3, :-3]
        m = cv2.dilate(g | sh, np.ones((15, 15), np.uint8))
        masks[f, y0 - Y0:y1 - Y0, x0:x1] |= m

shot_of = lambda f: max(i for i, s in enumerate(SHOTS) if f >= s)

enc = None
if not only:
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                            '-c:v', 'libx264', '-crf', '12', '-preset', 'medium', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
for f in range(N):
    fr = frames[f].copy()
    m = masks[f]
    if (only is None or f in only) and m.any():
        sh = shot_of(f)
        cand = [g for g in sorted(range(max(0, f - MAXD), min(N, f + MAXD + 1)), key=lambda g: abs(g - f)) if g != f and shot_of(g) == sh]
        ys, xs = np.nonzero(m)
        vals = np.zeros((len(ys), K, 3), np.float32)
        cnt = np.zeros(len(ys), np.int32)
        for g in cand:
            free = masks[g][ys, xs] == 0
            take = free & (cnt < K)
            if take.any():
                idx = np.nonzero(take)[0]
                vals[idx, cnt[idx]] = frames[g][ys[idx] + Y0, xs[idx]]
                cnt[idx] += 1
            if (cnt >= K).all():
                break
        # temporal samples only for static background: off the person, and samples agree
        sd = np.zeros(len(ys), np.float32)
        for i in range(K):
            pass
        vv = vals.copy()
        for k in range(K):
            vv[cnt <= k, k] = np.nan
        with np.errstate(all='ignore'):
            sd = np.nanmax(np.nanstd(vv, axis=1), axis=1)
        filled = (cnt >= 2) & (sd < 14)
        if PERSON:
            pm = cv2.imread(f'{PERSON}/{f:05d}.png', 0)
            pm = cv2.dilate(pm, np.ones((15, 15), np.uint8))
            filled &= pm[ys + Y0, xs] < 60
        out_band = fr[Y0:Y1].copy()
        if filled.any():
            v = vals[filled]
            c = cnt[filled]
            # median over the available samples
            with np.errstate(all='ignore'):
                med = np.nanmedian(vv[filled], axis=1)
            out_band[ys[filled], xs[filled]] = np.clip(med, 0, 255).astype(np.uint8)
        rest = np.zeros_like(m)
        rest[ys[~filled], xs[~filled]] = 1
        if rest.any():
            out_band = cv2.inpaint(out_band, rest, 7, cv2.INPAINT_NS)
        # soften the seam a little
        edge = cv2.dilate(m, np.ones((3, 3), np.uint8)) - cv2.erode(m, np.ones((3, 3), np.uint8))
        if edge.any():
            bl = cv2.GaussianBlur(out_band, (5, 5), 0)
            out_band[edge > 0] = bl[edge > 0]
        fr[Y0:Y1] = out_band
    if pngdir and (only is None or f in only):
        cv2.imwrite(f'{pngdir}/{f:05d}.png', fr)
    if enc:
        enc.stdin.write(fr.tobytes())
if enc:
    enc.stdin.close()
    enc.wait()
print('done', N)
