"""SFX cue sheet keyed to words (same beats as OwnYourPower.tsx) -> scripts/analysis/cues.json.

Kept subtle per the audio rules: key moments only, ~1 every 3-4 s. SFX are kit
library ids (resolved by tools/mix_audio.py under --sfx-root, i.e. ~/kit).
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


end = TL['endCardStart']
CUES = [
    (0, 'transition/impact-low', -3),                 # hook: B&W print + star + "Rising"
    (W('hook', 'utility'), 'paper/swish-card', 0),     # utility tower
    (W('own', 'to', 1) - 2, 'transition/whoosh-short', 0),  # print mode "Power"
    (W('behind', 'Behind'), 'paper/swish-card', 0),    # photo print of the system
    (W('behind', 'Solstice'), 'ui/ding', -4),          # logo card
    (W('yes', 'yes,'), 'ui/pop', 0),                   # check badge
    (W('easy', 'easy.'), 'paper/marker-scribble', -2), # last tick
    (W('phone', '27') - 2, 'transition/impact-low', -3),  # "27 minutes" + star
    (W('phone', 'running.'), 'paper/stamp-thud', 0),   # UP & RUNNING
    (W('licensed', 'licensed'), 'paper/swish-card', 0),  # shield
    (W('licensed', 'here'), 'transition/whoosh-short', 0),  # print mode "Texas"
    (W('setup', 'setup'), 'paper/swish-card', 0),      # system print
    (W('call', '832-721-2339.') - 2, 'ui/ding', -4),   # phone pill
    (end, 'transition/impact-low', 0),                 # end card
]
out = [{'t': round(f / FPS, 3), 'sfx': name, 'gain_db': g} for f, name, g in CUES]
json.dump(out, open(os.path.join(HERE, 'analysis', 'cues.json'), 'w'), indent=1)
for c, (f, name, g) in zip(out, CUES):
    print(f"{c['t']:6.2f}s  f{f:4d}  {name} {g:+d} dB")
