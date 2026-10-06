"""Edit decision list for the Solstice Solar "own your power" reel.

Times are SOURCE frames (public/video/source.mp4 = the 9:16 reframe of the
1216x718 landscape take, 30 fps, 57 s, one continuous shot).
Approved plan: open on "Delivery charges..." (drop "Here's something I'll bet
you didn't know. Solar is getting more and more popular because"), keep every
other line in order, only tighten the pauses. Cut points sit in real silences
of the isolated vocal stem (< -60 dB), ~0.1 s kept on each side.
"""

FPS = 30

SEGMENTS = [
    # "Delivery charges from the utility companies are rising and we all have no control over that."
    ('hook', [(134, 282)]),
    # "So what are homeowners looking to do? They're looking to own their power."
    ('own', [(294, 392)]),
    # "Behind me is an EG4 system where this homeowner bought all of the equipment and then
    #  reached out to us here at Solstice Solar to install it for them."
    ('behind', [(405, 616)]),
    # "Of course we said yes, no problem."
    ('yes', [(624, 682)]),
    # "After the full installation was done, | the commissioning was very, very easy."  (1.1 s pause cut)
    ('easy', [(701, 767), (794, 864)]),
    # "We showed up, got on the phone with EG4 support, | and in 27 minutes, this system was
    #  operational up and running."
    ('phone', [(879, 962), (972, 1102)]),
    # "If you're looking for solutions and want to talk to a reputable company. We are licensed
    #  and registered with the state here in Texas"
    ('licensed', [(1112, 1330)]),
    # "and I'd be more than happy to help make sure you get the information you need"
    ('happy', [(1337, 1442)]),
    # "and if this is the type of setup you're looking for, we can get you squared away."
    ('setup', [(1447, 1546)]),
    # "Give us a call 832-721-2339."
    ('call', [(1554, 1683)]),
]

END_CARD_FRAMES = 90  # 3 s; the phone CTA already builds over the last line

# One continuous take: no scene cuts.
SHOTS = [0]

# Caption chunks per segment ("|" = new chunk, *word* = hero word in big serif italic).
CHUNKS = {
    'hook': "*Delivery* *charges* | from the | *utility* companies | are *rising* | and we all | have *no control* | over that.",
    'own': "So what are | *homeowners* | looking to do? | They're looking | to *own* | their *power.*",
    'behind': "Behind me | is an *EG4* system | where this | homeowner | *bought* all | of the *equipment* | and then | reached out to us | here at | *Solstice Solar* | to install it | for them.",
    'yes': "Of course | we said *yes,* | no problem.",
    'easy': "After the | *fully* installation | was done, | the *commissioning* | was very, | very *easy.*",
    'phone': "We showed up, | got on the *phone* | with EG4 support, | and in | *27 minutes,* | this system | was *operational* | up and *running.*",
    'licensed': "If you're looking | for *solutions* | and want to talk | to a *reputable* | company. | We are *licensed* | and *registered* | with the state | here in *Texas*",
    'happy': "and I'd be | more than *happy* | to help | make sure | you get the | *information* | you need",
    'setup': "and if this is | the type of *setup* | you're looking for, | we can get you | *squared away.*",
    'call': "Give us a *call* | *832-721-2339.*",
}

# Display-only wording fixes (approved): audio says "fully installation".
DISPLAY = {'fully': 'full'}

# Word start corrections in source seconds: (word, approx aligned time) -> time.
WORD_FIXES = {}
