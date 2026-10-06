"""Snaps aligned word starts that fall inside a real silence (vocal stem < -55 dB for
>= 0.12 s) to where speech resumes. zipformer timings drift 0.2-0.3 s around pauses.
usage: python3 scripts/snap_words.py   (analysis/words_raw.json -> analysis/words.json)
"""
import json, os
import numpy as np, soundfile as sf

A = os.path.join(os.path.dirname(__file__), 'analysis')
W = json.load(open(os.path.join(A, 'words_raw.json')))
a, sr = sf.read(os.path.join(A, 'vocals.wav'))
a = a.mean(1) if a.ndim > 1 else a
hop = sr // 100
db = 20 * np.log10(np.array([np.sqrt(np.mean(a[i:i + hop] ** 2)) for i in range(0, len(a) - hop, hop)]) + 1e-9)
runs, i = [], 0
while i < len(db):
    if db[i] < -55:
        j = i
        while j < len(db) and db[j] < -55:
            j += 1
        if j - i >= 12:
            runs.append((i / 100, j / 100))
        i = j
    else:
        i += 1
n = 0
for w in W:
    for s, e in runs:
        if s - 0.02 <= w['s'] < e:
            print(f"  {w['w']:<14} {w['s']:.2f} -> {e:.2f}")
            w['s'] = round(e, 2); n += 1
            break
# two words snapped to the same pause end: keep them 0.1 s apart so they pop in order
for prev, w in zip(W, W[1:]):
    if w['s'] < prev['s'] + 0.1:
        w['s'] = round(prev['s'] + 0.1, 2)
json.dump(W, open(os.path.join(A, 'words.json'), 'w'), indent=0)
print(f'{len(runs)} silences, {n} words snapped')
