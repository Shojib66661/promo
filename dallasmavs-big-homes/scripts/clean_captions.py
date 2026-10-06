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
Y0, Y1 = 590, 870
MAXD, K = 24, 5
LASTF = int(arg('--last')) if arg('--last') else 10 ** 9  # frames from here on (end card) are left alone
PERSON = arg('--person')  # dir of person masks (%05d.png); body pixels use spatial inpaint

B = json.load(open(boxes_p))
N = len(B)
band = [[b for b in bs if 600 <= (b[1] + b[3]) / 2 <= 800 and 14 <= b[3] - b[1] <= 75] if f < LASTF else [] for f, bs in enumerate(B)]

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
    c = [b for g in range(max(0, f - 3), min(N, f + 4)) for b in band[g]]
    if not c:
        return None
    # captions are centred: mirror the box around the centre so letters the detector
    # dropped on bright backgrounds are still covered, then grow while bright glyph columns continue
    half = max(W / 2 - min(b[0] for b in c), max(b[2] for b in c) - W / 2) + 14
    y0, y1 = max(Y0, min(b[1] for b in c) - 10), min(Y1, max(b[3] for b in c) + 12)
    roi = frames[f][y0:y1].astype(np.int16)
    col = (((roi.min(2) > 243) & (roi.max(2) - roi.min(2) < 20)).sum(0) >= 3)
    x0, x1 = int(W / 2 - half), int(W / 2 + half)
    for d in (-1, 1):
        x, gap = (x0 if d < 0 else x1), 0
        while 40 < x < W - 40 and gap < 28:
            x += d
            gap = 0 if col[x] else gap + 1
        if d < 0: x0 = min(x0, x + gap)
        else: x1 = max(x1, x - gap)
    return [max(0, x0 - 14), y0, min(W, x1 + 14), y1]


# per-frame mask of the old caption (glyphs + shadow halo), band rows only
glyph = np.zeros((N, Y1 - Y0, W), np.uint8)
for f in range(N):
    r = region(f)
    if not r:
        continue
    x0, y0, x1, y1 = r
    roi = frames[f][y0:y1, x0:x1].astype(np.int16)
    mn, mx = roi.min(2), roi.max(2)
    lum = roi.mean(2).astype(np.float32)
    bg = cv2.medianBlur(np.clip(lum, 0, 255).astype(np.uint8), 31).astype(np.float32)
    # solid white glyphs, plus half-faded ones (brighter than the local background, low saturation)
    white = (((mn > 175) & (mx - mn < 45)) | ((lum - bg > 28) & (mx - mn < 60) & (mn > 120))).astype(np.uint8)
    g = cv2.dilate(white, np.ones((5, 5), np.uint8))
    sh = np.zeros_like(g)
    sh[3:, 3:] = g[:-3, :-3]
    glyph[f, y0 - Y0:y1 - Y0, x0:x1] = g | sh
# words exit with a blur + fade the detector can't see: add the glyphs of the nearest
# frame where the word was crisp (same shot, previous frames first)
shot_of = lambda f: max(i for i, s in enumerate(SHOTS) if f >= s)
crisp = [bool(band[f]) for f in range(N)]
masks = np.zeros_like(glyph)
for f in range(min(N, LASTF)):
    u = glyph[f].copy()
    if not crisp[f]:
        for d in (-1, -2, -3, -4, -5, 1, 2, 3):
            g = f + d
            if 0 <= g < LASTF and crisp[g] and shot_of(g) == shot_of(f):
                u |= glyph[g]
                break
    if u.any():
        masks[f] = cv2.dilate(u, np.ones((15, 15), np.uint8))

# camera motion: affine g->f from ORB features outside the caption band
orb = cv2.ORB_create(1500)
fmask = np.full((H, W), 255, np.uint8); fmask[Y0:Y1] = 0
_kp = {}
def kp(f):
    if f not in _kp:
        _kp[f] = orb.detectAndCompute(cv2.cvtColor(frames[f], cv2.COLOR_BGR2GRAY), fmask)
    return _kp[f]
bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
def affine(g, f):
    (k1, d1), (k2, d2) = kp(g), kp(f)
    if d1 is None or d2 is None or len(k1) < 20 or len(k2) < 20:
        return None
    m = bf.match(d1, d2)
    if len(m) < 20:
        return None
    a = np.float32([k1[x.queryIdx].pt for x in m]); b = np.float32([k2[x.trainIdx].pt for x in m])
    A, inl = cv2.estimateAffinePartial2D(a, b, method=cv2.RANSAC, ransacReprojThreshold=2.0)
    if A is None or inl.sum() < 15:
        return None
    return A
def aligned(g, f):
    """frame g and its caption mask warped onto frame f (band rows only), or None"""
    A = affine(g, f)
    if A is None:
        return None
    full = np.zeros((H, W), np.uint8); full[Y0:Y1] = masks[g]
    fr = cv2.warpAffine(frames[g], A, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
    mk = cv2.warpAffine(full, A, (W, H), flags=cv2.INTER_NEAREST, borderValue=255)
    return fr, mk[Y0:Y1]

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
            al = aligned(g, f)
            if al is None:
                continue
            gf, gm = al
            free = gm[ys, xs] == 0
            take = free & (cnt < K)
            if take.any():
                idx = np.nonzero(take)[0]
                vals[idx, cnt[idx]] = gf[ys[idx] + Y0, xs[idx]]
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
