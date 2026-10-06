# Infinite Roofing (@dallasmavsroofer): "Big homes require big protection" — mixed-media re-edit

Outreach re-edit for harun.motion (2026-10-06). Built from the kit template
`templates/remotion-mixed-media` (Shojib66661/reel-editor-kit).

- **Source**: 52.4 s, 720x1280 reel. Speaker Lamor ("luxury home specialist"), one-word
  burned-in captions that pop in and blur out on the strip y ≈ 690-770, over the speaker.
- **Result**: 40.3 s, 1080x1920. Cold open on "It took us three days to fully protect this
  16,000 square foot home" (approved re-order), repeats and filler cut (see `scripts/edl.py`).
- **Captions**: the old ones are covered, not inpainted. Each new caption chunk sits on a navy
  sticker label that is centred on the old caption and at least as big as the union of its
  boxes over the chunk (`scripts/build_timeline.py` → `cover_box`, `src/BigHomes.tsx` → `chunkCover`).
  Inpainting (`scripts/clean_captions.py`, kept for reference) smeared on his body.
- **Music**: "Executive Suite" by harun.motion (123 BPM). The track has a short vocal phrase twice,
  so the instrumental stem is used; its final hit lands at 38.65 s, as he says "Dallas Mavericks".
- **Look**: B&W + white-edged cutout + giant red serif word behind him on "16,000", "Luxury",
  "We care"; Mavs-blue star bursts; stickers keyed to words; end card from the profile only.

## Rebuild
```
npm install
python3 scripts/build_timeline.py && python3 scripts/build_voice.py scripts/analysis/vocals.wav && python3 scripts/cues.py
export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
npx remotion render BigHomes out/bighomes_raw.mp4 --muted
# music: harun.motion "Executive Suite", UVR instrumental stem (public/audio/music.mp3), from the beat at 22.37 s
ffmpeg -ss 22.37 -i public/audio/music.mp3 out/music_cut.wav
python3 ~/kit/tools/mix_audio.py --voice public/audio/voice.wav --music out/music_cut.wav --cues scripts/analysis/cues.json --out out/mix.wav --duration 40.333
python3 scripts/qa_leaks.py out/bighomes_raw.mp4 out/leaks.jpg --until 1079
```
