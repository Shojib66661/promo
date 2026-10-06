import {random} from 'remotion';

/** Ruff Roofing brand (sampled from their end-card logo) + a few accents. */
export const C = {
	red: '#f2434f', // logo roof red (#fe4954 on screen)
	redHi: '#ff5a64',
	cyan: '#2fd3ef', // logo roof cyan (#32e6fe on screen)
	cyanHi: '#5fe7ff', // brighter cyan for text on video
	ink: '#232024', // wordmark
	inkDeep: '#141216',
	white: '#fbfbf6',
	paper: '#f4efe3',
	kraft: '#c49a62',
	kraftDark: '#a87e48',
	maroon: '#7a1f45', // their team polo
	wood: '#b9824f',
	water: '#5fb8ff',
	check: '#2bb673',
};

export const FONT = {
	sans: 'Montserrat',
	sansBlack: 'Montserrat Black',
	serif: 'Playfair Italic',
	serifMid: 'Playfair Italic Mid',
	hand: 'Caveat Brush',
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

/** Torn-paper edge polygon (CSS clip-path) for a w x h panel; jag > 0. */
export const torn = (seed: string, w: number, h: number, jag = 9, step = 26) => {
	const pts: string[] = [];
	const j = (k: string) => (random(`${seed}-${k}`) - 0.5) * 2 * jag;
	for (let x = 0; x <= w; x += step) pts.push(`${x}px ${Math.max(0, jag + j('t' + x))}px`);
	for (let y = 0; y <= h; y += step) pts.push(`${w - Math.max(0, jag + j('r' + y))}px ${y}px`);
	for (let x = w; x >= 0; x -= step) pts.push(`${x}px ${h - Math.max(0, jag + j('b' + x))}px`);
	for (let y = h; y >= 0; y -= step) pts.push(`${Math.max(0, jag + j('l' + y))}px ${y}px`);
	return `polygon(${pts.join(', ')})`;
};

/** Torn edge for an element of unknown size: points in %, jag in px. */
export const tornPct = (seed: string, jag = 7, n = 24) => {
	const pts: string[] = [];
	const j = (k: string) => Math.max(0, jag + (random(`${seed}-${k}`) - 0.5) * 2 * jag);
	for (let i = 0; i <= n; i++) pts.push(`${(i / n) * 100}% ${j('t' + i).toFixed(1)}px`);
	for (let i = 0; i <= n / 3; i++) pts.push(`calc(100% - ${j('r' + i).toFixed(1)}px) ${((i / (n / 3)) * 100).toFixed(1)}%`);
	for (let i = n; i >= 0; i--) pts.push(`${(i / n) * 100}% calc(100% - ${j('b' + i).toFixed(1)}px)`);
	for (let i = n / 3; i >= 0; i--) pts.push(`${j('l' + i).toFixed(1)}px ${((i / (n / 3)) * 100).toFixed(1)}%`);
	return `polygon(${pts.join(', ')})`;
};
