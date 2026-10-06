"""SFX cue sheet keyed to words (same beats as RuffDecking.tsx) -> scripts/analysis/cues.json.

Kept subtle per the audio rules: key moments only, ~1 every 3-4 s. Library ids from the kit's sfx/index.json.
usage: python3 scripts/cues.py
"""
import json, os, re

HERE = os.path.dirname(__file__)
TL = json.load(open(os.path.join(HERE, '..', 'src', 'data', 'timeline.json')))
FPS = TL['fps']
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


def src_first(a):
    """First output frame showing source frame >= a."""
    return next(i for i, r in enumerate(TL["frames"]) if a <= r[0] < a + 60)


seg = {s['id']: s for s in TL['segments']}
end = W('cta', "We'll") - 2
CUES = [
    (0, 'transition/impact-low', -3),                 # hook title
    (W('hook', 'leaking'), 'ui/pop', -2),             # water drops
    (seg['intro']['start'], 'transition/whoosh-short', 0),  # B&W intro + star
    (src_first(38) - 1, 'paper/swish-card', 0),       # logo card
    (src_first(148), 'paper/swish-card-long', -3),    # decking photo board
    (W('holes', "It's"), 'transition/whoosh-short', -2),  # B&W "pretty old"
    (W('repair', 'expensive'), 'ui/pop', 0),          # $$$ tag
    (W('sheet', 'sheetrock,'), 'ui/pop', 0),          # damage cards
    (W('inspect', 'Do'), 'transition/whoosh-short', 0),  # B&W "inspection"
    (W('inspect', 'problematic'), 'paper/marker-scribble', -2),  # tick
    (W('save', 'thousands') - 1, 'ui/ding', -4),      # $1,000s
    (W('after', 'good'), 'paper/stamp-thud', 0),      # GOOD TO GO
    (seg['cta']['start'], 'transition/whoosh-short', -2),  # B&W "call"
    (end, 'transition/impact-low', 0),                # end card
    (end + 6, 'paper/swish-card', 0),
]
SFX = os.path.expanduser('~/kit/sfx/')
out = [{'t': round(f / FPS, 3), 'sfx': SFX + name + '.wav', 'gain_db': g} for f, name, g in CUES]
json.dump(out, open(os.path.join(HERE, 'analysis', 'cues.json'), 'w'), indent=1)
for c, (f, name, g) in zip(out, CUES):
    print(f"{c['t']:6.2f}s  f{f:4d}  {name} {g:+d} dB")
