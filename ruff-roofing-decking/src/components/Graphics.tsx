import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, FONT, outline, pop, popOut, prog2, torn, tornPct, wob} from '../lib/brand';

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
	wobble?: number;
	children: React.ReactNode;
}> = ({x, y, local, out, rot = 0, seed, frame, scale = 1, edge = '#ffffff', wobble = 1.6, children}) => {
	if (local < 0) return null;
	const s = pop(local) * (out !== undefined ? popOut(out) : 1);
	if (s <= 0) return null;
	const r = rot + wob(seed, frame, wobble, 4);
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

/** 10-point star burst behind the subject (the reference's red star, in Ruff red with an ink edge). */
export const StarBurst: React.FC<{x: number; y: number; r: number; local: number; frame: number; color?: string; edge?: string}> = ({
	x,
	y,
	r,
	local,
	frame,
	color = C.red,
	edge = C.inkDeep,
}) => {
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
	color = C.cyanHi,
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
				textShadow: `10px 12px 0 ${C.inkDeep}`,
				letterSpacing: -size * 0.02,
			}}
		>
			{text.split('').map((ch, i) => (
				<span key={i} style={{opacity: i < n ? 1 : 0, display: 'inline-block', transform: `scale(${pop(local - i)})`}}>
					{ch === ' ' ? '\u00a0' : ch}
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
	color = C.red,
	width = 14,
	len = 3000,
}) => {
	if (local < 0) return null;
	const t = prog2(local, dur);
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(0 4px 0 rgba(20,18,22,0.7))'}}>
			<path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - t)} />
		</svg>
	);
};

/** Handwritten note on a small white tag. */
export const HandTag: React.FC<{text: string; size?: number; color?: string; bg?: string}> = ({text, size = 64, color = C.ink, bg = C.white}) => (
	<div style={{position: 'relative', background: bg, padding: '6px 26px 2px', borderRadius: 10, fontFamily: FONT.hand, fontSize: size, color, whiteSpace: 'nowrap'}}>{text}</div>
);

/** A photo print with white border and a strip of tape. */
export const PhotoPrint: React.FC<{src: string; w: number; h: number; bw?: boolean; tapeRot?: number}> = ({src, w, h, bw, tapeRot = -4}) => (
	<div style={{position: 'relative', background: C.white, padding: 12, paddingBottom: 16}}>
		<Img src={staticFile(src)} style={{width: w, height: h, objectFit: 'cover', display: 'block', filter: bw ? 'grayscale(1) contrast(1.2)' : 'saturate(1.1) contrast(1.05)'}} />
		<div style={{position: 'absolute', left: '50%', top: -18, width: 120, height: 38, marginLeft: -60, background: 'rgba(232,226,200,0.88)', transform: `rotate(${tapeRot}deg)`}} />
	</div>
);

/**
 * Opaque torn kraft board. Used where their editor burned big graphics into the
 * video (photo insets, counters): it covers them completely and carries our own version.
 * x/y/w/h in screen px (top-left), slides in over 4 frames and out over 3.
 */
export const Board: React.FC<{x: number; y: number; w: number; h: number; local: number; out: number; seed: string; frame: number; children?: React.ReactNode}> = ({
	x,
	y,
	w,
	h,
	local,
	out,
	seed,
	frame,
	children,
}) => {
	if (local < 0 || out >= 3) return null;
	// it has to cover the old graphics from its first frame, so it never scales below 1: it lands with a small overshoot
	const s = local < 2 ? 1.05 : local < 4 ? 1.02 : 1;
	const o = out >= 0 ? [1, 1, 1][out] : 1;
	const ty = out >= 0 ? [0, 40, 120][out] : 0;
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: w,
				height: h,
				transform: `translateY(${ty}px) rotate(${wob(seed, frame, 0.5, 4)}deg) scale(${s})`,
				opacity: o,
				filter: 'drop-shadow(0 16px 18px rgba(0,0,0,0.45))',
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					clipPath: torn(seed, w, h, 10, 28),
					background: `radial-gradient(ellipse at 30% 20%, #d3ab74 0%, ${C.kraft} 55%, ${C.kraftDark} 100%)`,
				}}
			>
				{/* paper fibre speckle */}
				<svg width={w} height={h} style={{position: 'absolute', inset: 0, opacity: 0.25}}>
					<filter id={`n${seed}`}>
						<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} />
						<feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.24  0 0 0 0 0.12  0 0 0 0.9 0" />
					</filter>
					<rect width={w} height={h} filter={`url(#n${seed})`} />
				</svg>
			</div>
			{children}
		</div>
	);
};

/** Ink tape strip with a big italic serif title (slaps on letter by letter unless `full`). */
export const TitleTape: React.FC<{text: string; size: number; local: number; color?: string; bg?: string; pad?: string; full?: boolean; seed: string}> = ({
	text,
	size,
	local,
	color = C.cyanHi,
	bg = C.inkDeep,
	pad = '4px 34px 16px',
	full,
	seed,
}) => {
	const n = full ? text.length : Math.min(text.length, local + 1);
	return (
		<div style={{position: 'relative', display: 'inline-block', background: bg, clipPath: tornPct(seed, 7, 18)}}>
			<div style={{position: 'relative', padding: pad, fontFamily: FONT.serif, fontSize: size, lineHeight: 1, color, whiteSpace: 'nowrap', letterSpacing: -size * 0.015}}>
				{text.split('').map((ch, i) => (
					<span key={i} style={{opacity: i < n ? 1 : 0, display: 'inline-block', transform: `scale(${full ? 1 : pop(local - i)})`}}>
						{ch === ' ' ? '\u00a0' : ch}
					</span>
				))}
			</div>
		</div>
	);
};

/** One checklist row on paper: box gets a marker tick when `tick` >= 0. */
export const CheckRow: React.FC<{text: string; tick: number; size?: number}> = ({text, tick, size = 66}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 22}}>
		<svg width={size} height={size} viewBox="0 0 60 60">
			<rect x={5} y={5} width={50} height={50} rx={6} fill={C.white} stroke={C.ink} strokeWidth={5} />
			{tick >= 0 ? (
				<path d="M 13 32 L 26 45 L 52 10" stroke={C.red} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={80} strokeDashoffset={80 * (1 - prog2(tick, 4))} />
			) : null}
		</svg>
		<div style={{fontFamily: FONT.hand, fontSize: size * 1.05, color: C.ink, whiteSpace: 'nowrap', lineHeight: 1}}>{text}</div>
	</div>
);

/** Drywall panel with a water stain. */
const SheetrockIcon = () => (
	<svg width={150} height={120} viewBox="0 0 150 120">
		<rect x={14} y={10} width={122} height={100} fill="#e9e6df" stroke={C.ink} strokeWidth={5} />
		<path d="M 14 60 L 136 60" stroke="#c8c3b8" strokeWidth={3} />
		<path d="M 50 28 C 74 18, 104 30, 100 52 C 98 72, 74 82, 58 70 C 40 58, 30 38, 50 28 Z" fill="#b99a62" opacity={0.75} />
		<path d="M 58 38 C 72 32, 88 40, 86 52 C 84 62, 70 66, 62 60 C 52 54, 48 44, 58 38 Z" fill="#8c6c3a" opacity={0.6} />
		<path d="M 78 82 C 82 92, 84 96, 84 100 A 6 6 0 0 1 72 100 C 72 96, 74 92, 78 82 Z" fill={C.water} stroke="#fff" strokeWidth={2} />
	</svg>
);

/** Rafters (roof framing). */
const RaftersIcon = () => (
	<svg width={160} height={120} viewBox="0 0 160 120">
		<path d="M 10 104 L 80 18 L 150 104" stroke={C.wood} strokeWidth={12} fill="none" strokeLinejoin="round" />
		<path d="M 10 104 L 150 104" stroke={C.wood} strokeWidth={10} />
		<path d="M 80 18 L 80 104 M 45 62 L 80 104 M 115 62 L 80 104" stroke="#9b6a3c" strokeWidth={7} />
		<path d="M 98 40 L 110 54 L 102 60 L 116 76" stroke={C.red} strokeWidth={6} fill="none" strokeLinejoin="round" />
	</svg>
);

/** Damage card: icon + label on white. */
export const DamageCard: React.FC<{kind: 'sheetrock' | 'rafters'; label: string}> = ({kind, label}) => (
	<div style={{background: C.white, borderRadius: 18, padding: '14px 22px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 250}}>
		{kind === 'sheetrock' ? <SheetrockIcon /> : <RaftersIcon />}
		<div style={{fontFamily: FONT.sansBlack, fontSize: 36, color: C.ink, marginTop: 4, letterSpacing: 1, textAlign: 'center', lineHeight: 1.05}}>{label}</div>
	</div>
);

/** Red price tag with $$$ ("very expensive"). */
export const PriceTag: React.FC<{size?: number}> = ({size = 230}) => (
	<svg width={size} height={size * 0.62} viewBox="0 0 230 142">
		<path d="M 10 71 L 52 14 L 220 14 L 220 128 L 52 128 Z" fill={C.red} stroke={C.white} strokeWidth={0} />
		<circle cx={52} cy={71} r={11} fill={C.white} />
		<text x={138} y={96} textAnchor="middle" fontFamily="Montserrat Black" fontSize={66} fill={C.white} letterSpacing={2}>
			$$$
		</text>
	</svg>
);

/** Hourglass doodle ("over time"); sand drains on twos. */
export const Hourglass: React.FC<{size?: number; local: number}> = ({size = 170, local}) => {
	const t = prog2(local, 30);
	return (
		<svg width={size * 0.72} height={size} viewBox="0 0 120 166">
			<rect x={10} y={4} width={100} height={14} rx={5} fill={C.wood} />
			<rect x={10} y={148} width={100} height={14} rx={5} fill={C.wood} />
			<path d="M 22 18 C 22 60, 58 70, 58 83 C 58 96, 22 106, 22 148 L 98 148 C 98 106, 62 96, 62 83 C 62 70, 98 60, 98 18 Z" fill="#eef8fb" stroke={C.ink} strokeWidth={5} />
			<path d={`M ${30 + 24 * t} ${30 + 40 * t} L ${90 - 24 * t} ${30 + 40 * t} L 60 80 Z`} fill={C.cyan} />
			<path d={`M 26 144 L 94 144 L ${60 + 30 * (1 - t) * 0.2} ${144 - 46 * t} Z`} fill={C.cyan} />
		</svg>
	);
};

/** Round red rubber stamp. */
export const Stamp: React.FC<{text: string; sub?: string; size?: number; color?: string}> = ({text, sub, size = 300, color = C.red}) => (
	<div
		style={{
			width: size,
			height: size,
			borderRadius: '50%',
			border: `${size * 0.04}px solid ${color}`,
			boxShadow: `inset 0 0 0 ${size * 0.025}px rgba(0,0,0,0), inset 0 0 0 ${size * 0.05}px ${color}00`,
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			background: 'rgba(251,251,246,0.92)',
			color,
		}}
	>
		<div style={{width: size * 0.84, height: size * 0.84, borderRadius: '50%', border: `${size * 0.015}px solid ${color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
			{sub ? <div style={{fontFamily: FONT.sans, fontWeight: 800, fontSize: size * 0.085, letterSpacing: size * 0.012}}>{sub}</div> : null}
			<div style={{fontFamily: FONT.sansBlack, fontSize: size * 0.17, lineHeight: 1, textAlign: 'center', letterSpacing: 1, whiteSpace: 'pre'}}>{text}</div>
		</div>
	</div>
);

/** CTA action icons (phone / link / text bubble / office pin) on a white tile. */
export const ActionIcon: React.FC<{kind: 'call' | 'link' | 'text' | 'office'; size?: number}> = ({kind, size = 150}) => (
	<div style={{width: size, height: size, borderRadius: size * 0.24, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
		<svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24">
			{kind === 'call' ? (
				<path
					d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
					fill={C.red}
				/>
			) : kind === 'link' ? (
				<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" stroke={C.ink} strokeWidth={2.6} fill="none" strokeLinecap="round" />
			) : kind === 'text' ? (
				<>
					<path d="M4 4h16a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 20 17H9l-5 4v-4H4a1.5 1.5 0 0 1-1.5-1.5v-10A1.5 1.5 0 0 1 4 4z" fill={C.cyan} />
					<circle cx={8} cy={10.5} r={1.3} fill="#fff" />
					<circle cx={12} cy={10.5} r={1.3} fill="#fff" />
					<circle cx={16} cy={10.5} r={1.3} fill="#fff" />
				</>
			) : (
				<>
					<path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z" fill={C.red} />
					<circle cx={12} cy={9} r={2.6} fill="#fff" />
				</>
			)}
		</svg>
	</div>
);

/** "$1,000s" banknote sticker ("saving you thousands of dollars"). */
export const MoneyNote: React.FC<{w?: number}> = ({w = 560}) => (
	<div style={{position: 'relative', width: w, height: w * 0.48, background: '#d8ecd2', borderRadius: 14, border: `8px solid #2f7d4a`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
		<div style={{position: 'absolute', inset: 14, border: '3px dashed #2f7d4a', borderRadius: 8}} />
		<div style={{fontFamily: FONT.sansBlack, fontSize: w * 0.2, color: '#1f5c35', letterSpacing: 1}}>$1,000s</div>
	</div>
);
