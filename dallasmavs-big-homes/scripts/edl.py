"""Edit decision list for the Infinite Roofing (@dallasmavsroofer) "big homes" reel.

Times are SOURCE frames (source.mp4, 30 fps, 52.4 s). Approved plan:
- cold open on "It took us three days to fully protect this 16,000 square foot home"
  (moved from 35.7 s to the front; no wording change),
- cut "Peace and love family. Lamor here." (he introduces himself again at the end),
- cut the 2nd and 3rd "(one of the ways / another way) we go above and beyond is",
- cut "It's going to be beautiful." and the final "Peace and love",
- "...expensive landscaping" now runs into "because here at Infinite, we care...".
"It was falling apart" stays (no clean pause after "hazard").
Cut points sit in real silences of the isolated vocal stem; every piece was
re-transcribed to check for clipped words.
"""

FPS = 30

SEGMENTS = [
    # "It took us three days to fully protect this 16,000 square foot home."
    ('hook', [(1072, 1187)]),
    # "Let me show you how we go above and beyond for our luxury home builds."
    ('intro', [(59, 148)]),
    # "We are elite at finding damage."   (starts after "One of the ways ... is that")
    ('elite', [(223, 271)]),
    # "They had a pergola that was a safety hazard. It was falling apart.
    #  So we tore it all the way down and now we're building a whole new one that's gonna match the stucco."
    ('pergola', [(271, 357), (364, 490)]),
    # "We build sturdy structures like this around the property."  (after "Another way we go above and beyond is")
    ('build', [(583, 650)]),
    # "This one specifically is to protect the pool because if a nail falls in here and goes in the pump it can be catastrophic."
    ('pool', [(650, 841)]),
    # "We also make sure to protect windows, pool equipment, garage doors, stamped concrete, and even expensive landscaping."
    ('protect', [(858, 1050)]),
    # "because here at Infinite, we care about the property more than they do."
    ('care', [(1196, 1287)]),
    # "It's Lamor here, your luxury home specialist, signing off as the official roofer of the Dallas Mavericks."
    ('signoff', [(1292, 1449)]),
]

END_TAIL_FRAMES = 48     # end card holds 1.6 s after the last word
END_CARD_WORD = ('signoff', 'signing')  # end card builds over "signing off as the official roofer..."

# Shot boundaries in the source (scene detection).
SHOTS = [0, 150, 217, 280, 328, 502, 527, 559, 688, 858, 916, 941, 976, 1006, 1050, 1292, 1473]

# Caption chunks per segment ("|" = new chunk, *word* = hero word in italic serif).
CHUNKS = {
    'hook': "It took us | *three days* | to fully protect | this *16,000* | square foot *home.*",
    'intro': "Let me show you | how we go | *above and beyond* | for our *luxury* | home builds.",
    'elite': "We are *elite* | at finding *damage.*",
    'pergola': "They had a *pergola* | that was a | *safety hazard.* | It was | falling apart. | So we *tore* it | all the way *down* | and now we're building | a whole *new one* | that's gonna match | the *stucco.*",
    'build': "We build *sturdy* | structures like this | around the *property.*",
    'pool': "This one | specifically | is to protect | the *pool* | because if a *nail* | falls in here | and goes in | the *pump* | it can be | *catastrophic.*",
    'protect': "We also make sure | to *protect* | *windows,* | pool *equipment,* | garage *doors,* | stamped *concrete,* | and even | expensive | *landscaping.*",
    'care': "because here | at *Infinite,* | we *care* | about the property | more than | *they do.*",
    'signoff': "It's *Lamor* here, | your *luxury* | home specialist, | signing off | as the official | roofer of the | Dallas Mavericks.",
}

DISPLAY = {}

# Word start corrections in source seconds: (word, aligned time) -> time (zipformer was early).
WORD_FIXES = {
    ('We', 28.28): 28.62,
    ('it', 35.6): 35.82,
}

# Punch-in per piece: hides the jump cut inside the pergola shot, adds energy elsewhere.
PIECE_ZOOM = {
    ('hook', 0): 1.0,
    ('intro', 0): 1.08,
    ('elite', 0): 1.0,
    ('pergola', 0): 1.0,
    ('pergola', 1): 1.14,
    ('build', 0): 1.06,
    ('pool', 0): 1.0,
    ('protect', 0): 1.06,
    ('care', 0): 1.12,
    ('signoff', 0): 1.0,
}
