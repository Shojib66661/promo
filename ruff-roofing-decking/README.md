# Ruff Roofing: "damaged decking" reel, mixed-media (Remotion)

Re-edit of @ruff_roofing's 53.8 s reel (Dre on a roof with rotted decking) into a 49.4 s,
1080×1920 mixed-media reel. Built from the kit template `remotion-mixed-media`.

**Render:** `../renders/ruff-roofing-decking_TEMP-MUSIC.mp4` (temp music: kit `indie-pop-stomp-105bpm-a`)
· phone preview `../renders/ruff-roofing-decking_TEMP-MUSIC_preview-720p.mp4`

| | Original | This edit |
|---|---|---|
| Length | 53.8 s (51.5 s talk + white logo card) | 49.4 s (47.4 s talk; end card starts over the last line) |
| Opening | "What's up guys, this is Dre…" | Cold open on the rotted-decking B-roll: "We have extensive water damage right here. It's been leaking for a while." with a **Water Damage** title, then the intro (approved re-order) |
| Cuts | — | Only filler: "old decking" (repeat), "Okay,", "right?", "Go ahead," |
| Captions | One-word white captions + red accent words + logo sticker, photo insets, counter, text bubble | Removed (`scripts/clean_captions.py`, fixed caption zones) and covered: new captions on an ink tape strip that always covers the old caption zone; their graphics replaced with our own (logo card, two kraft boards with their decking photos / inspection checklist / $1,000s note, text-bubble sticker) |
| Look | Colour talking head | B&W world + red-outlined colour cutout + red star + giant cyan serif words behind him ("Old", "Inspection", "Call"), doodle stickers (water drops, hourglass, $$$ tag, sheetrock / rafters cards, GOOD TO GO stamp, CTA icons) |
| End card | White logo card | Logo, "Every Homeowner's Best Friend", the 4 cities, ruff-roofing.co/roof, Dre as a sticker (bio only, no offer / phone) |
| Audio | Voice + music | Voice isolated (UVR), temp music bed ducked −19 LU, 15 subtle SFX from the kit, −14.6 LUFS / −1.0 dBTP |

## Rebuild
```
python3 scripts/build_timeline.py && python3 scripts/build_voice.py scripts/analysis/vocals.wav && python3 scripts/cues.py
export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
npx remotion render src/index.ts RuffDecking out/video_muted.mp4 --muted
python3 ~/kit/tools/mix_audio.py --voice public/audio/voice.wav --music <track> --cues scripts/analysis/cues.json --out out/mix.wav --duration 49.367 --sfx-root ~/kit
```
Media (`public/video/*.mp4|webm`, `scripts/analysis/`) is not committed; regenerate with the kit tools
(`separate_vocals.sh`, `transcribe.py`, `segment_person.py`, then `scripts/clean_captions.py`).
