import {random} from 'remotion';

/** Solstice Solar brand (sampled from their profile logo: cyan #01a3e7) + a few accents. */
export const C = {
	cyan: '#01a3e7',
	cyanHi: '#3cc8ff', // brighter cyan for text on video
	navy: '#0a2540',
	navyDeep: '#061a2e',
	white: '#fbfbf6',
	ink: '#101418',
	sun: '#ffc93c',
	warn: '#e2483d',
	go: '#35d07f', // "up and running" green (the EG4 status LEDs)
	grey: '#c9d1d8',
	kraft: '#c9a774',
};

export const FONT = {
	sans: 'Montserrat',
	sansBlack: 'Montserrat Black',
	serif: 'Playfair Italic',
	serifMid: 'Playfair Italic Mid',
	hand: 'Caveat Brush',
	cond: 'Oswald',
};

/** Thick sticker outline around a transparent element (stacked hard drop-shadows). */
export const outline = (color: string, px = 6, shadow = true) =>
	[
		`drop-shadow(${px}px 0 0 ${color})`,
		`drop-shadow(-${px}px 0 0 ${color})`,
		`drop-shadow(0 ${px}px 0 ${color})`,
		`drop-shadow(0 -${px}px 0 ${color})`,
		shadow ? 'drop-shadow(0 12px 14px rgba(0,0,0,0.35))' : '',
	].join(' ');

/** Stop-motion wobble: value changes only every `hold` frames. */
export const wob = (seed: string, frame: number, amp: number, hold = 3) =>
	(random(`${seed}-${Math.floor(frame / hold)}`) - 0.5) * 2 * amp;

/** Stepped pop-in (sticker slapped on): 0 -> overshoot -> settle. */
export const pop = (local: number) => {
	if (local < 0) return 0;
	const steps = [0.4, 0.85, 1.12, 1.04, 1];
	return steps[Math.min(local, steps.length - 1)];
};

/** Stepped pop-out over 3 frames. */
export const popOut = (local: number) => {
	if (local < 0) return 1;
	const steps = [1.06, 0.7, 0.3, 0];
	return steps[Math.min(local, steps.length - 1)];
};

/** 0..1 progress on twos (hand-animated feel). */
export const prog2 = (local: number, dur: number) => Math.max(0, Math.min(1, (Math.floor(local / 2) * 2) / dur));
