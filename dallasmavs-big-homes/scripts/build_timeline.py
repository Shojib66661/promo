"""Builds src/data/timeline.json from the EDL + analysis data.

Per OUTPUT frame: source frame, source shot index, the box of the ORIGINAL
burned-in caption (it was inpainted away; our caption + glow sits over the
leftover smear), and camera zoom. Plus caption chunks with word timings.
"""
import json, os, re
from edl import FPS, SEGMENTS, END_TAIL_FRAMES, END_CARD_WORD, CHUNKS, WORD_FIXES, SHOTS, DISPLAY, PIECE_ZOOM, VIDEO_HOLDS

HERE = os.path.dirname(__file__)
A = os.path.join(HERE, 'analysis')
OUT = os.path.join(HERE, '..', 'src', 'data', 'timeline.json')

words = json.load(open(os.path.join(A, 'words.json')))
for w in words:
    for (txt, t0), t in WORD_FIXES.items():
        if w['w'] == txt and abs(w['s'] - t0) < 0.015:
            w['s'] = t
            break
words.sort(key=lambda w: w['s'])

raw = json.load(open(os.path.join(A, 'capboxes.json')))
NSRC = len(raw)
band = [[b for b in bs if 600 <= (b[1] + b[3]) / 2 <= 800 and 14 <= b[3] - b[1] <= 75] for bs in raw]


import cv2
import numpy as np
_cap = cv2.VideoCapture(os.path.join(HERE, '..', 'public', 'video', 'source.mp4'))
SRCF = []
while True:
    ok, _fr = _cap.read()
    if not ok:
        break
    SRCF.append(_fr[590:870])  # caption band rows only


def grow(f, x0, x1, y0, y1):
    """Widen [x0, x1] while columns of near-white glyph pixels continue (letters on bright
    backgrounds that the detector dropped). Stops after a 28 px gap."""
    roi = SRCF[f][max(0, y0 - 590):max(1, y1 - 590)].astype(np.int16)
    col = (((roi.min(2) > 243) & (roi.max(2) - roi.min(2) < 20)).sum(0) >= 3)
    for d in (-1, 1):
        x, gap = (x0 if d < 0 else x1), 0
        while 40 < x < 680 and gap < 28:
            x += d
            gap = 0 if col[x] else gap + 1
        if d < 0:
            x0 = min(x0, x + gap)
        else:
            x1 = max(x1, x - gap)
    return x0, x1


def cover_box(f):
    """Box the caption label must cover: union of the old caption's boxes over +-6 frames
    (words pop in and blur out where the detector can't see them), mirrored around the
    centre (centred text; letters on bright backgrounds are often missed)."""
    c = [b for g in range(max(0, f - 6), min(NSRC, f + 7)) for b in band[g]]
    if not c:
        return None
    y0, y1 = min(b[1] for b in c) - 14, max(b[3] for b in c) + 16
    x0, x1 = min(b[0] for b in c), max(b[2] for b in c)
    for g in range(max(0, f - 6), min(NSRC, f + 7)):
        if band[g]:
            x0, x1 = grow(g, x0, x1, y0, y1)
    half = max(360 - x0, x1 - 360) + 16
    return [int(360 - half), y0, int(360 + half), y1]


def shot_of(f):
    k = 0
    for i, s in enumerate(SHOTS):
        if f >= s:
            k = i
    return k


def norm(t):
    return re.sub(r"[^a-z0-9']", '', t.lower())


segments, frames, chunks_out = [], [], []
out = 0
for sid, pieces in SEGMENTS:
    seg = {'id': sid, 'start': out, 'pieces': []}
    kept = []
    for (fi, fo) in pieces:
        i, o = fi / FPS, fo / FPS
        p = {'srcIn': fi, 'srcOut': fo, 'start': out, 'end': out + (fo - fi)}
        seg['pieces'].append(p)
        for w in words:
            if i - 0.12 <= w['s'] < o - 0.1 and w not in kept:
                kept.append({**w, 'out': max(p['start'], p['start'] + round(w['s'] * FPS) - fi)})
        for f in range(fi, fo):
            show = f
            for k, (n, to) in VIDEO_HOLDS.items():
                if k <= f < k + n:
                    show = to
            frames.append({'src': show, 'seg': sid, 'piece': len(seg['pieces']) - 1})
        out = p['end']
    seg['end'] = out
    segments.append(seg)

    toks = [c.strip() for c in CHUNKS[sid].split('|')]
    wi = 0
    seg_chunks = []
    for c in toks:
        cw = []
        # *hot air* style multi-word heroes: track open/close stars
        hero = False
        for rawt in c.split():
            starts = rawt.startswith('*')
            if starts:
                hero = True
            txt = rawt.replace('*', '')
            emph = hero
            if rawt.rstrip('.,!?').endswith('*'):
                hero = False
            if wi >= len(kept) or norm(kept[wi]['w']) != norm(txt):
                got = kept[wi]['w'] if wi < len(kept) else None
                raise SystemExit(f'[{sid}] chunk word mismatch: want {txt!r} got {got!r}')
            punct = re.sub(r"^.*?([.,!?]*)$", r"\1", txt)
            shown = DISPLAY.get(norm(txt), None)
            cw.append({'w': (shown + punct) if shown else txt, 'f': kept[wi]['out'], 'emph': emph})
            wi += 1
        seg_chunks.append({'seg': sid, 'words': cw, 'start': max(seg['start'], cw[0]['f'] - 2)})
    if wi != len(kept):
        raise SystemExit(f'[{sid}] unused words: {[k["w"] for k in kept[wi:]]}')
    seg_chunks[0]['start'] = seg['start']
    chunks_out += seg_chunks

# chunks run back to back (no caption gaps: the old caption's smear must stay covered)
for a, b in zip(chunks_out, chunks_out[1:]):
    a['end'] = b['start']
chunks_out[-1]['end'] = out

total_speech = out
total = out + END_TAIL_FRAMES
ec_seg, ec_word = END_CARD_WORD
end_card_start = next(w['f'] for c in chunks_out if c['seg'] == ec_seg for w in c['words'] if norm(w['w']) == norm(ec_word)) - 2
frame_rows = []
for k, fr in enumerate(frames):
    z = PIECE_ZOOM.get((fr['seg'], fr['piece']), 1.0)
    frame_rows.append([fr['src'], shot_of(fr['src']), cover_box(fr['src']), z])

data = {
    'fps': FPS,
    'width': 1080,
    'height': 1920,
    'srcWidth': 720,
    'srcHeight': 1280,
    'totalFrames': total,
    'speechFrames': total_speech,
    'endCardStart': end_card_start,
    'segments': segments,
    'chunks': chunks_out,
    # per output frame: [srcFrame, shotIndex, origCaptionBox|null, zoom]
    'frames': frame_rows,
}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump(data, open(OUT, 'w'), separators=(',', ':'))
print(f'total {total} frames ({total / FPS:.2f}s), speech {total_speech}, chunks {len(chunks_out)}')
for s in segments:
    print(f"  {s['id']:<8} {s['start']:4d}-{s['end']:4d}  ({(s['end'] - s['start']) / FPS:.2f}s)")
for c in chunks_out:
    print(f"    {c['start']:4d}-{c['end']:4d} " + ' '.join(('*' if w['emph'] else '') + w['w'] + f"@{w['f']}" for w in c['words']))
