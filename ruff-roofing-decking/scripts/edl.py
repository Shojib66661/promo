"""Edit decision list for the Ruff Roofing "damaged decking" reel (Dre).

Times are SOURCE frames (orig.mp4, 30 fps, 53.75 s; end card from 51.53 s).
Approved plan (2026-10-06):
- cold open on the damage B-roll: "We have extensive water damage right here.
  It's been leaking for a while," then the intro and the rest in order
- cut only filler: "old decking" (repeat), "Okay,", "right?", "Go ahead,"
- keep "to make sure that you don't have any problems in the future"
Cut points sit in real silences / dips of the isolated vocal stem.
"""

FPS = 30

SEGMENTS = [
    # "We have extensive water damage right here. It's been leaking for a while,"
    ('hook', [(313, 429)]),
    # "What's up guys? This is Dre with Ruff Roofing. I want to give you a quick example of what it looks
    #  like when you have very damaged decking, [old decking] and water damages."
    ('intro', [(0, 200), (240, 274)]),
    # "We have a couple holes. It's a roof that's pretty old and over time you start to have these complications."
    ('holes', [(448, 620)]),
    # "You want to get these things repaired. If not, you start having very expensive internal damages,"
    ('repair', [(620, 763)]),
    # "considering your sheetrock, your rafters."
    ('sheet', [(763, 836)]),
    # "Do a full inspection while we're here. Make sure that we take care of all the problematic areas
    #  to make sure that you don't have any problems in the future,"
    ('inspect', [(836, 1037)]),
    # "saving you thousands of dollars."
    ('save', [(1037, 1088)]),
    # "After we do our inspection we start repairing all the necessary damages to make sure that you guys
    #  can be good to go for years on end."
    ('after', [(1088, 1338)]),
    # "Shoot us a call, click the link, send us a text, show up to the office. We'll get you taken care of."
    ('cta', [(1356, 1537)]),
]

END_CARD_FRAMES = 60  # end card starts over the last line ("We'll get you taken care of", see RuffDecking.tsx) and holds 2 s after it

# Shot boundaries in the source (scene detection), used for temporal fill + looks.
SHOTS = [0, 303, 377, 408, 483, 808, 838, 1044, 1082, 1144, 1251, 1343, 1546]

# Caption chunks per segment ("|" = new chunk, *word* = hero word in big serif italic).
CHUNKS = {
    'hook': "We have | *extensive* | water damage | right here. | It's been *leaking* | for a while,",
    'intro': "What's up guys? | This is *Dre* | with Ruff Roofing. | I want to give you | a quick *example* | of what it looks like | when you have | very *damaged* decking, | and *water* damages.",
    'holes': "We have a couple *holes.* | It's a roof | that's *pretty old* | and over time | you start to have | these *complications.*",
    'repair': "You want to get | these things *repaired.* | If not, | you start having | very *expensive* | internal damages,",
    'sheet': "considering | your *sheetrock,* | your *rafters.*",
    'inspect': "Do a full *inspection* | while we're here. | Make sure that we | take care of all | the *problematic* areas | to make sure that | you don't have | any *problems* | in the future,",
    'save': "saving you | *thousands* | of dollars.",
    'after': "After we do | our *inspection* | we start *repairing* | all the necessary | damages | to make sure that | you guys could be | good to go | for *years* on end.",
    'cta': "Shoot us a *call,* | click the *link,* | send us a *text,* | show up | to the *office.* | We'll get you | taken care of.",
}

# Display-only wording fixes: their editor's caption reads "you guys can be".
DISPLAY = {'could': 'can'}

# Word start corrections in source seconds: (word, approx aligned time) -> time.
WORD_FIXES = {
    ('see', 10.32): 10.20,
    ('right?', 14.48): 14.66,
    ('We', 14.80): 14.94,
}
