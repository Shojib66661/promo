"""SFX cue sheet keyed to words (same beats as BigHomes.tsx) -> scripts/analysis/cues.json.

Kept subtle per the audio rules: key moments only (~1 every 3 s), never per caption.
usage: python3 scripts/cues.py
"""
import json, os, re, shutil

HERE = os.path.dirname(__file__)
TL = json.load(open(os.path.join(HERE, '..', 'src', 'data', 'timeline.json')))
FPS = TL['fps']
KIT = os.path.expanduser('~/kit/sfx')
norm = lambda t: re.sub(r"[^a-z0-9']", '', t.lower())


def W(seg, word, nth=0):
    n = 0
    for c in TL['chunks']:
        if c['seg'] != seg:
            continue
        for w in c['words']:
            if norm(w['w']) == norm(word):
                if n == nth:
                    return w['f']
                n += 1
    raise SystemExit(f'no {word} in {seg}')


end = TL['endCardStart']
CUES = [
    (0, 'transition/impact-low', -3),                  # hook: B&W world + star + 16,000
    (W('hook', 'three') - 2, 'ui/pop', 0),             # 3 DAYS calendar
    (W('intro', 'above') - 2, 'transition/whoosh-short', 0),  # B&W "Luxury"
    (W('elite', 'finding'), 'paper/swish-card', 0),    # magnifier
    (W('pergola', 'safety'), 'paper/stamp-thud', 0),   # warning sign
    (W('pergola', 'new'), 'ui/pop', 0),                # brand new badge
    (W('pool', 'pool'), 'ui/pop', 0),                  # pool sticker
    (W('pool', 'catastrophic.'), 'paper/marker-scribble', 0),  # red X
    (W('protect', 'protect'), 'paper/swish-card', 0),  # checklist
    (W('protect', 'landscaping.'), 'ui/ding', -4),     # last tick
    (W('care', 'care') - 6, 'transition/whoosh-short', 0),  # B&W "We care"
    (W('signoff', 'Lamor'), 'paper/swish-card', 0),    # name tag
    (end, 'transition/impact-low', 0),                 # end card
    (end + 30, 'paper/swish-card', 0),                 # photo print
]
os.makedirs(os.path.join(HERE, '..', 'public', 'sfx'), exist_ok=True)
out = []
for f, sid, g in CUES:
    dst = os.path.join(HERE, '..', 'public', 'sfx', sid.replace('/', '_') + '.wav')
    shutil.copy(os.path.join(KIT, sid + '.wav'), dst)
    out.append({'t': round(f / FPS, 3), 'sfx': os.path.abspath(dst), 'gain_db': g})
json.dump(out, open(os.path.join(HERE, 'analysis', 'cues.json'), 'w'), indent=1)
for c, (f, name, g) in zip(out, CUES):
    print(f"{c['t']:6.2f}s  f{f:4d}  {name} {g:+d} dB")
