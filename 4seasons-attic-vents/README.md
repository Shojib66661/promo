# 4SEASONS attic / solar vents reel: mixed-media edit (Remotion)

Re-edit of a @4seasonsvents reel ("Your roof could be rotting and you wouldn't even know it")
into a 27 s, 1080x1920 mixed-media reel in the 4SEASONS navy + lime brand.
What changed, the DM and the claim notes: [`DELIVERY.md`](DELIVERY.md).

**Render:** `../renders/4seasons-attic-vents_TEMP-MUSIC.mp4` (temp music bed until the final track is in).

## Pipeline

```bash
# 1. analysis (inputs in scripts/analysis/)
python3 scripts/capscan.py source_orig.mp4 scripts/analysis/capboxes.json        # old caption boxes per frame
python3 scripts/clean_captions.py source_orig.mp4 scripts/analysis/capboxes.json public/video/source.mp4 \
    --shots 0,38,64,105,143,158,262,355,450,487,516,585,662,741 --person masks_s   # temporal fill + inpaint
#    person masks + cutout.webm: reel-editor-kit tools/segment_person.py (rebuild the webm from the CLEAN source)
# 2. edit
python3 scripts/build_timeline.py          # edl.py -> src/data/timeline.json
python3 scripts/build_voice.py scripts/analysis/vocals.wav   # -> public/audio/voice.wav
python3 scripts/cues.py                    # SFX cue sheet keyed to words
# 3. render (silent) + mix + mux
REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell \
  npx remotion render AtticVents out/render.mp4 --muted
python3 ~/kit/tools/mix_audio.py --voice public/audio/voice.wav --music music.mp3 \
  --cues scripts/analysis/cues.json --out out/mix.wav --duration 27.133
```

## Layout
- `src/AtticVents.tsx`: scenes + beat sheet (graphics keyed to words), B&W/cutout moments
- `src/components/`: `Caption` (sans + italic-serif hero word, dimmed upcoming words), `Graphics`
  (stickers, star burst, behind-word, attic diagram, damage cards, sun, heat lines, bill, shield),
  `Logo` (redrawn 4SEASONS mark + wordmark), `EndCard`, `Camera`, `Source`
- `scripts/edl.py`: cuts (source frames), shots, caption chunks, display-only wording fixes
