# Learnings log (append newest at the top)

## 2026-10-06: Infinite Roofing (@dallasmavsroofer), mixed-media "big homes" (third project)
- **Captions that blur/fade out over the speaker can't be removed cleanly.** `clean_captions.py`
  left smears on his body (inpaint) and blocky patches (temporal fill on a moving camera); the
  detector also misses the fading frames and letters on bright, overexposed walls. Fix: COVER
  them with the caption itself. Each caption chunk sits on a navy sticker label centred on the
  old caption and at least as big as the union of its boxes over the whole chunk (±6 frames per
  frame, mirrored around the centre, widened while bright glyph columns continue). Label full
  size from the chunk's first frame; only the words pop. See `templates/remotion-mixed-media/src/components/LabelCaption.tsx`.
- Leak scan with label captions: drop detector hits that sit on the label colour
  (`tools/qa_leaks_label.py`); the rest were all our own graphics / sky / white walls. The
  detector can't see faded letters, so also eyeball a contact sheet of the caption band every 5 frames.
- Tried in `clean_captions.py` (not merged): camera-motion compensation (ORB + affine per
  neighbour frame) fixed tearing on moving shots; masking whole regions made it worse.
- `setup.sh` model download died mid-stream ("Connection reset", tar EOF). Download to a file
  with `curl -C -` and retries before extracting (fixed in setup.sh).
- No clean pause between "hazard" and "It was falling apart": kept the line rather than force a
  cut. Use `tools/verify_pieces.py` to re-transcribe every piece; it caught "As we build" (start
  moved 6 frames to "We build").
- Moving the strongest stat line ("three days … 16,000 sq ft") to the front also fixed the ending:
  "…expensive landscaping" now runs straight into "because here at Infinite…".
- End card built OVER his own last line ("signing off as the official roofer of the Dallas
  Mavericks"), so it adds only 1.6 s after the last word.
- Client site (infiniteroofing.com) blocked (403): took the real Mavs | Infinite lockup from their
  own end card frame (white background, upscaled 3x) instead of redrawing it.
- Render speed this time: ~1210 frames in ~9 min at concurrency 4 (lighter look than paper-cut).
- The user's track came back 65 s (asked 44 s) with a short vocal phrase twice. Check every track:
  whisper on the separated vocal stem per suspicious second (a full-mix whisper said "music").
  Fix: use the UVR instrumental stem; pick the start on a strong beat so the track's own final
  hit lands where the voice ends (here start 22.37 s → hit at 38.65 s, voice ends 38.7 s).
- **User rejected the caption labels** ("it looks very bad"): navy boxes over the speaker felt
  heavy. Final version keeps the client's own burned-in captions, no new captions. Needed: hold
  the next clean frame (video only, 3-5 frames) where a cut left a word of the removed line
  ("HERE.", "IS THAT WE"), start the thumbnail on a crisp caption frame, and an RGBA layer of
  their caption (alpha = whiteness inside the caption box) drawn over the B&W star so the star
  doesn't eat the off-body letters. Ask about captions in the first interview from now on.
- User preferences learned: OK with re-ordering for a stat hook; "no preference" on cuts = take the
  full proposed plan; keep claims exactly as said even if they could read oddly.

## 2026-10-06: 4SEASONS Solar Powered Vents, mixed-media (second project)
- **Remove burned-in captions instead of covering them** when they are thin (one word per
  frame): `tools/clean_captions.py` = temporal fill (median of nearby frames where that pixel
  wasn't under a word, same shot) for the background + spatial inpaint on the person (person
  masks decide). Pure `cv2.inpaint` left a visible smear; pure temporal fill tore on moving hands.
  Captions no longer need opaque boxes, so styles like the mixed-media reference work.
- Keep the new caption on the old caption strip and show upcoming words dimmed (42%), not
  hidden: hidden-but-reserved words left the leftover blur visible between words.
- A strong dark glow behind captions looked like a dirty patch on the speaker's shirt. Fix the
  source first, then keep the glow light.
- Leak scan: our new captions are also white bold text, so scanning the final render flags
  them. Scan the cleaned source instead (every video layer is built from it); the detector also
  fires on blue shirts and white objects, so look at a contact sheet of the hits.
- Rebuild `cutout.webm` from the CLEANED source (masks are reusable), or old captions come
  back on the sticker layer.
- `setup.sh` was missing `audioread` (audio-separator import error). Added. If `~/kit` already
  exists as a directory, `ln -sfn` puts the link inside it; check before running setup.
- The client's site/linktree were blocked (403) from the sandbox, so the logo was redrawn as
  SVG from the profile picture + the wordmark sticker in their video.
- The original edit was already tight (7 pauses > 0.1 s in 26.7 s), so the 25-35 % cut rule
  didn't apply: cut 2 pauses + an off-brand closing line, and started the CTA over the last line.
- Speaker in a brand's video can be a partner contractor (other company's logo on his shirt):
  ask before keeping his "follow us" line.
- User preferences learned: picks "best and right" badges when unsure (use only his words or
  the bio; skip anything ambiguous like "Made in CA"); no name in DM when unknown.

## 2026-10-06: High Performance Roofing, paper-cut (first project)
- Model hosts (HF, openaipublic, fbaipublicfiles) are blocked → use GitHub-release models (`tools/setup.sh`).
- Remotion `<Freeze>` is clamped to composition length → offset with `startFrom` (template `Source.tsx`).
- Caption covers must use the union of the original caption's boxes over ±6 frames; the
  original editor animates multi-line captions line by line. Cluster caption lines by
  chaining line-to-line (not to the first line) or 3-line captions lose their last line.
- Caption strip must be full size from frame 0 (only the text pops) or the old caption flashes.
- Always run the caption-leak scan on the final render; it caught 6 leaks the eye missed.
- Separating vocals before cutting makes jump cuts invisible and lets you replace the music.
- Re-transcribe each cut piece to catch clipped words (zipformer word times can be off by 0.2-0.5 s).
- 44 MB uploads to chat fail (502); 14 MB preview works. Clients can't open private GitHub links.
- ElevenLabs: 4 variations by default = 4× credits. Use generations_count 1 for SFX. One stamp SFX came back silent.
- User preferences learned: subtle SFX, voice on top, no pumping ducking, ask before
  re-ordering, ask on unclear claims, no editor branding, casual DM as @harun.motion.
