import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, FONT, outline, pop, popOut, prog2, wob} from '../lib/brand';

/** Positions a sticker: pop-in, optional pop-out, stop-motion wobble, white outline. */
export const Sticker: React.FC<{
	x: number;
	y: number;
	local: number;
	out?: number;
	rot?: number;
	seed: string;
	frame: number;
	scale?: number;
	edge?: string | false;
	children: React.ReactNode;
}> = ({x, y, local, out, rot = 0, seed, frame, scale = 1, edge = '#ffffff', children}) => {
	if (local < 0) return null;
	const s = pop(local) * (out !== undefined ? popOut(out) : 1);
	if (s <= 0) return null;
	const r = rot + wob(seed, frame, 1.6, 4);
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				transform: `translate(-50%, -50%) rotate(${r}deg) scale(${s * scale})`,
				filter: edge ? outline(edge, 6) : undefined,
			}}
		>
			{children}
		</div>
	);
};

/** 10-point star burst behind the subject (the reference's red star, here in Mavs blue). */
export const StarBurst: React.FC<{x: number; y: number; r: number; local: number; frame: number; color?: string; edge?: string}> = ({x, y, r, local, frame, color = C.blue, edge = C.white}) => {
	if (local < 0) return null;
	const pts: string[] = [];
	const n = 10;
	for (let i = 0; i < n * 2; i++) {
		const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
		const rr = i % 2 ? r * 0.56 : r;
		pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`);
	}
	const spin = Math.floor(frame / 3) * 0.6;
	return (
		<div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, transform: `scale(${pop(local)}) rotate(${spin}deg)`, filter: outline(edge, 7, false)}}>
			<svg width={r * 2} height={r * 2} viewBox={`${-r} ${-r} ${r * 2} ${r * 2}`}>
				<polygon points={pts.join(' ')} fill={color} />
			</svg>
		</div>
	);
};

/** Giant italic serif word placed BEHIND the person (cutout drawn on top). */
export const BehindWord: React.FC<{text: string; x: number; y: number; size: number; local: number; frame: number; rot?: number; color?: string}> = ({
	text,
	x,
	y,
	size,
	local,
	frame,
	rot = -4,
	color = C.limeHi,
}) => {
	if (local < 0) return null;
	// letters slap on one by one (on ones), whole word drifts slowly
	const n = Math.min(text.length, local + 1);
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				transform: `translate(-50%, -50%) rotate(${rot + wob('bw' + text, frame, 0.5, 4)}deg) scale(${1 + local * 0.0015})`,
				fontFamily: FONT.serif,
				fontSize: size,
				lineHeight: 0.9,
				color,
				whiteSpace: 'nowrap',
				textShadow: `10px 12px 0 ${C.navy}`,
				letterSpacing: -size * 0.02,
			}}
		>
			{text.split('').map((ch, i) => (
				<span key={i} style={{opacity: i < n ? 1 : 0, display: 'inline-block', transform: `scale(${pop(local - i)})`}}>
					{ch === ' ' ? ' ' : ch}
				</span>
			))}
		</div>
	);
};

/** Hand-drawn marker path that draws itself on twos. */
export const MarkerStroke: React.FC<{d: string; local: number; dur?: number; color?: string; width?: number; len?: number}> = ({
	d,
	local,
	dur = 8,
	color = C.limeHi,
	width = 14,
	len = 3000,
}) => {
	if (local < 0) return null;
	const t = prog2(local, dur);
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(0 4px 0 rgba(6,24,43,0.7))'}}>
			<path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - t)} />
		</svg>
	);
};

/** Handwritten note on a small white tag. */
export const HandTag: React.FC<{text: string; size?: number; color?: string; bg?: string; strike?: number}> = ({text, size = 64, color = C.navy, bg = C.white, strike}) => (
	<div style={{position: 'relative', background: bg, padding: '6px 26px 2px', borderRadius: 10, fontFamily: FONT.hand, fontSize: size, color, whiteSpace: 'nowrap'}}>
		{text}
		{strike !== undefined && strike >= 0 ? (
			<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{position: 'absolute', left: 0, top: 0}}>
				<path d="M 6 72 L 94 30" stroke={C.warn} strokeWidth={9} strokeLinecap="round" vectorEffect="non-scaling-stroke" strokeDasharray={140} strokeDashoffset={140 * (1 - prog2(strike, 4))} pathLength={140} />
				<path d="M 8 28 L 92 74" stroke={C.warn} strokeWidth={9} strokeLinecap="round" vectorEffect="non-scaling-stroke" strokeDasharray={140} strokeDashoffset={140 * (1 - prog2(strike - 3, 4))} pathLength={140} />
			</svg>
		) : null}
	</div>
);

/** A photo print with white border and a strip of tape. */
export const PhotoPrint: React.FC<{src: string; w: number; h: number; bw?: boolean}> = ({src, w, h, bw}) => (
	<div style={{position: 'relative', background: C.white, padding: 14, paddingBottom: 18}}>
		<Img src={staticFile(src)} style={{width: w, height: h, objectFit: 'cover', display: 'block', filter: bw ? 'grayscale(1) contrast(1.2)' : 'saturate(1.1) contrast(1.05)'}} />
		<div style={{position: 'absolute', left: '50%', top: -20, width: 150, height: 42, marginLeft: -75, background: 'rgba(232,226,200,0.85)', transform: 'rotate(-4deg)'}} />
	</div>
);
