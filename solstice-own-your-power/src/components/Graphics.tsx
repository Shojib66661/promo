import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, FONT, outline, pop, popOut, prog2, wob} from '../lib/brand';
import {LogoMark} from './Logo';

export const STICKER_SCALE = 1.4;

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
	// the reframed shot is a tight close-up, so stickers run 1.4x their design size
	const s = pop(local) * (out !== undefined ? popOut(out) : 1) * STICKER_SCALE;
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

/** 10-point star burst behind the subject (the reference's red star, in brand colours). */
export const StarBurst: React.FC<{x: number; y: number; r: number; local: number; frame: number; color?: string; edge?: string}> = ({x, y, r, local, frame, color = C.cyan, edge = C.white}) => {
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
	color = C.cyanHi,
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

/** Sun doodle (solar), rays turn on threes. */
export const Sun: React.FC<{size?: number; frame: number}> = ({size = 230, frame}) => {
	const rot = Math.floor(frame / 3) * 7;
	return (
		<svg width={size} height={size} viewBox="-100 -100 200 200">
			<g transform={`rotate(${rot})`}>
				{Array.from({length: 12}).map((_, i) => (
					<path key={i} d="M 0 -62 L 9 -92 L -9 -92 Z" transform={`rotate(${i * 30})`} fill="#ffd23f" stroke={C.navy} strokeWidth={4} strokeLinejoin="round" />
				))}
			</g>
			<circle r={52} fill="#ffd23f" stroke={C.navy} strokeWidth={5} />
			<path d="M -20 8 C -10 24, 10 24, 20 8" stroke={C.navy} strokeWidth={6} fill="none" strokeLinecap="round" />
			<circle cx={-18} cy={-10} r={6} fill={C.navy} />
			<circle cx={18} cy={-10} r={6} fill={C.navy} />
		</svg>
	);
};

/** A photo print with white border and a strip of tape. */
export const PhotoPrint: React.FC<{src: string; w: number; h: number; bw?: boolean}> = ({src, w, h, bw}) => (
	<div style={{position: 'relative', background: C.white, padding: 14, paddingBottom: 18}}>
		<Img src={staticFile(src)} style={{width: w, height: h, objectFit: 'cover', display: 'block', filter: bw ? 'grayscale(1) contrast(1.2)' : 'saturate(1.1) contrast(1.05)'}} />
		<div style={{position: 'absolute', left: '50%', top: -20, width: 150, height: 42, marginLeft: -75, background: 'rgba(232,226,200,0.85)', transform: 'rotate(-4deg)'}} />
	</div>
);

// ---------------------------------------------------------------------------
// Solstice Solar stickers (flat doodles, white outline added by <Sticker>)
// ---------------------------------------------------------------------------

/** Utility bill with a "Delivery charges" line and a red up-arrow; more arrows stack on `rise`. */
export const UtilityBill: React.FC<{rise: number; frame: number}> = ({rise, frame}) => {
	const arrows = rise < 0 ? 1 : Math.min(3, 1 + Math.floor(rise / 4));
	return (
		<div style={{position: 'relative', width: 300, height: 360, background: C.white, borderRadius: 14, padding: '22px 24px', boxSizing: 'border-box'}}>
			<div style={{fontFamily: FONT.sansBlack, fontSize: 34, color: C.navy, letterSpacing: 1, lineHeight: 1}}>UTILITY</div>
			<div style={{fontFamily: FONT.sans, fontWeight: 800, fontSize: 24, color: '#7b8794', letterSpacing: 3}}>BILL</div>
			{[0, 1].map((i) => (
				<div key={i} style={{height: 10, background: '#d9dee3', borderRadius: 5, margin: '14px 0', width: `${88 - i * 22}%`}} />
			))}
			<div style={{marginTop: 16, background: '#fde3e0', borderRadius: 8, padding: '8px 10px', fontFamily: FONT.sans, fontWeight: 800, fontSize: 25, color: C.warn, lineHeight: 1.1}}>
				Delivery
				<br />
				charges
			</div>
			<svg width={130} height={150} viewBox="0 0 130 150" style={{position: 'absolute', right: 6, bottom: 8}}>
				{Array.from({length: arrows}).map((_, i) => {
					const dy = i * -26 + (i === arrows - 1 ? wob('arr', frame, 2, 3) : 0);
					return <path key={i} d={`M 92 ${130 + dy} L 92 ${62 + dy} M 66 ${88 + dy} L 92 ${58 + dy} L 118 ${88 + dy}`} stroke={C.warn} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
				})}
				<text x={4} y={132} fontFamily="Montserrat Black" fontSize={74} fill={C.navy}>
					$
				</text>
			</svg>
		</div>
	);
};

/** Power-line tower doodle (the utility company). */
export const PowerTower: React.FC<{size?: number}> = ({size = 230}) => (
	<svg width={size} height={size * 1.2} viewBox="0 0 200 240">
		<path d="M 70 230 L 100 20 L 130 230 M 82 150 L 118 150 M 88 100 L 112 100 M 76 190 L 124 190 M 82 150 L 124 190 M 118 150 L 76 190 M 88 100 L 118 150 M 112 100 L 82 150" stroke={C.navy} strokeWidth={8} fill="none" strokeLinejoin="round" strokeLinecap="round" />
		<path d="M 30 60 L 170 60 M 44 100 L 156 100" stroke={C.navy} strokeWidth={9} strokeLinecap="round" />
		{[30, 170, 44, 156].map((x, i) => (
			<circle key={i} cx={x} cy={i < 2 ? 66 : 106} r={7} fill={C.sun} stroke={C.navy} strokeWidth={4} />
		))}
		<path d="M 0 74 Q 15 92 30 66 M 170 66 Q 185 92 200 74" stroke={C.navy} strokeWidth={4} fill="none" />
	</svg>
);

/** House with a thought bubble ("what are homeowners looking to do?"). */
export const HouseThink: React.FC<{size?: number; frame: number}> = ({size = 240, frame}) => (
	<svg width={size} height={size} viewBox="0 0 200 200">
		<path d="M 26 112 L 88 58 L 150 112 Z" fill={C.navy} />
		<rect x={42} y={108} width={92} height={70} fill={C.white} stroke={C.navy} strokeWidth={6} />
		<rect x={78} y={136} width={22} height={42} fill={C.cyan} />
		<rect x={108} y={122} width={18} height={16} fill={C.sun} />
		<circle cx={152} cy={46} r={32} fill={C.white} stroke={C.navy} strokeWidth={5} />
		<circle cx={130} cy={86} r={7} fill={C.white} stroke={C.navy} strokeWidth={4} />
		<text x={152} y={62} textAnchor="middle" fontFamily="Playfair Italic" fontSize={48} fill={C.navy} transform={`rotate(${wob('q', frame, 6, 4)} 152 46)`}>
			?
		</text>
	</svg>
);

/** Round cyan badge with a white check. */
export const CheckBadge: React.FC<{size?: number; color?: string; local?: number}> = ({size = 200, color = C.cyan, local = 99}) => (
	<svg width={size} height={size} viewBox="0 0 100 100">
		<circle cx={50} cy={50} r={48} fill={color} />
		<path d="M 27 52 L 44 68 L 74 34" stroke="#fff" strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={80} strokeDashoffset={80 * (1 - prog2(local, 6))} />
	</svg>
);

/** Little white checklist card; each line ticks at its own local frame. */
export const Checklist: React.FC<{items: Array<{label: string; t: number}>; width?: number}> = ({items, width = 470}) => (
	<div style={{width, background: C.white, borderRadius: 18, padding: '20px 26px', boxSizing: 'border-box'}}>
		{items.map((it, i) => (
			<div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, margin: '8px 0', opacity: it.t >= -1 ? 1 : 0.35}}>
				<svg width={56} height={56} viewBox="0 0 56 56">
					<rect x={4} y={4} width={48} height={48} rx={10} fill="none" stroke={C.navy} strokeWidth={5} />
					{it.t >= 0 ? (
						<path d="M 13 29 L 24 40 L 46 12" stroke={C.cyan} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={60} strokeDashoffset={60 * (1 - prog2(it.t, 4))} />
					) : null}
				</svg>
				<div style={{fontFamily: FONT.sansBlack, fontSize: 38, color: C.navy, letterSpacing: 0.5, textDecoration: 'none'}}>{it.label}</div>
			</div>
		))}
	</div>
);

/** Phone handset with ringing arcs. */
export const PhoneDoodle: React.FC<{size?: number; frame: number}> = ({size = 210, frame}) => {
	const ring = Math.floor(frame / 4) % 2;
	const shake = Math.floor(frame / 2) % 2 ? 5 : -5;
	return (
		<svg width={size} height={size} viewBox="0 0 200 200">
			<g transform={`rotate(${shake} 100 110)`}>
				<rect x={62} y={30} width={76} height={140} rx={16} fill={C.navy} />
				<rect x={72} y={46} width={56} height={96} rx={6} fill={C.cyan} />
				<circle cx={100} cy={156} r={6} fill={C.white} />
			</g>
			{[0, 1].map((i) => (
				<g key={i} opacity={ring === i ? 1 : 0.45}>
					<path d={`M ${40 - i * 16} ${70 - i * 10} Q ${24 - i * 16} 100 ${40 - i * 16} ${130 + i * 10}`} stroke={C.sun} strokeWidth={9} fill="none" strokeLinecap="round" />
					<path d={`M ${160 + i * 16} ${70 - i * 10} Q ${176 + i * 16} 100 ${160 + i * 16} ${130 + i * 10}`} stroke={C.sun} strokeWidth={9} fill="none" strokeLinecap="round" />
				</g>
			))}
		</svg>
	);
};

/** Stopwatch; the hand sweeps once per second (on twos). */
export const Stopwatch: React.FC<{size?: number; frame: number}> = ({size = 220, frame}) => {
	const a = ((Math.floor(frame / 2) * 2) % 30) * 12;
	return (
		<svg width={size} height={size * 1.12} viewBox="0 0 200 224">
			<rect x={86} y={6} width={28} height={22} rx={5} fill={C.navy} />
			<rect x={150} y={36} width={20} height={14} rx={4} fill={C.navy} transform="rotate(40 160 43)" />
			<circle cx={100} cy={124} r={88} fill={C.white} stroke={C.navy} strokeWidth={12} />
			{Array.from({length: 12}).map((_, i) => (
				<path key={i} d="M 100 48 L 100 60" stroke={C.navy} strokeWidth={6} strokeLinecap="round" transform={`rotate(${i * 30} 100 124)`} />
			))}
			<path d="M 100 124 L 100 56" stroke={C.warn} strokeWidth={8} strokeLinecap="round" transform={`rotate(${a} 100 124)`} />
			<circle cx={100} cy={124} r={10} fill={C.navy} />
		</svg>
	);
};

/** Battery that fills bar by bar from `local`, with a bolt (system up and running). */
export const Battery: React.FC<{local: number; size?: number}> = ({local, size = 220}) => {
	const bars = local < 0 ? 0 : Math.min(4, 1 + Math.floor(local / 3));
	return (
		<svg width={size} height={size * 0.62} viewBox="0 0 200 124">
			<rect x={6} y={10} width={168} height={104} rx={16} fill={C.white} stroke={C.navy} strokeWidth={10} />
			<rect x={176} y={42} width={18} height={40} rx={5} fill={C.navy} />
			{Array.from({length: 4}).map((_, i) => (
				<rect key={i} x={20 + i * 38} y={24} width={30} height={76} rx={6} fill={i < bars ? C.go : '#e3e8ec'} />
			))}
			{bars >= 4 ? <path d="M 98 18 L 70 66 L 92 66 L 80 108 L 118 54 L 96 54 L 108 18 Z" fill={C.sun} stroke={C.navy} strokeWidth={5} strokeLinejoin="round" /> : null}
		</svg>
	);
};

/** Rubber-stamp text (rough double border). */
export const Stamp: React.FC<{text: string; color?: string; size?: number}> = ({text, color = C.go, size = 70}) => (
	<div
		style={{
			fontFamily: FONT.sansBlack,
			fontSize: size,
			letterSpacing: size * 0.06,
			color,
			border: `${size * 0.09}px solid ${color}`,
			outline: `${size * 0.04}px solid ${color}`,
			outlineOffset: size * 0.08,
			borderRadius: size * 0.16,
			padding: `${size * 0.08}px ${size * 0.3}px`,
			background: 'rgba(251,251,246,0.92)',
			whiteSpace: 'nowrap',
			lineHeight: 1.05,
		}}
	>
		{text}
	</div>
);

/** Shield with the Solstice bolt and a ribbon line (licensed in Texas). */
export const ShieldBadge: React.FC<{size?: number; label: string; sub?: string; subLocal?: number}> = ({size = 280, label, sub, subLocal = -1}) => (
	<div style={{position: 'relative', width: size, height: size * 1.15 + 40}}>
		<svg width={size} height={size * 1.15} viewBox="0 0 200 230" style={{position: 'absolute', left: 0, top: 0}}>
			<path d="M 100 8 L 186 38 C 186 120, 160 188, 100 222 C 40 188, 14 120, 14 38 Z" fill={C.cyan} />
			<path d="M 100 24 L 172 49 C 170 118, 148 174, 100 204 C 52 174, 30 118, 28 49 Z" fill={C.navy} />
		</svg>
		<LogoMark size={size * 0.5} color={C.white} style={{position: 'absolute', left: size * 0.25, top: size * 0.27}} />
		<div
			style={{
				position: 'absolute',
				left: '50%',
				top: size * 0.86,
				transform: 'translateX(-50%) rotate(-3deg)',
				background: C.sun,
				color: C.navy,
				fontFamily: FONT.sansBlack,
				fontSize: size * 0.135,
				letterSpacing: 2,
				padding: '8px 22px',
				borderRadius: 8,
				whiteSpace: 'nowrap',
				textAlign: 'center',
				lineHeight: 1.05,
			}}
		>
			{label}
			{sub && subLocal >= 0 ? (
				<div style={{fontFamily: FONT.sans, fontWeight: 800, fontSize: size * 0.085, letterSpacing: 1, transform: `scale(${pop(subLocal)})`}}>{sub}</div>
			) : null}
		</div>
	</div>
);

/** Approximate Texas outline (from the paper-cut template), flat cyan. */
const TX: Array<[number, number]> = [
	[-106.64, 31.99], [-103.06, 32.0], [-103.04, 36.5], [-100.0, 36.5], [-100.0, 34.56], [-99.2, 34.33],
	[-98.1, 34.13], [-97.0, 33.77], [-96.3, 33.75], [-95.3, 33.88], [-94.48, 33.64], [-94.04, 33.55],
	[-94.04, 32.0], [-93.75, 31.2], [-93.53, 30.4], [-93.85, 29.7], [-94.7, 29.35], [-95.6, 28.75],
	[-96.6, 28.3], [-97.2, 27.7], [-97.4, 26.9], [-97.15, 25.95], [-97.6, 26.0], [-98.3, 26.2],
	[-99.1, 26.5], [-99.5, 27.5], [-100.3, 28.3], [-100.8, 29.3], [-101.4, 29.77], [-102.4, 29.78],
	[-103.0, 29.0], [-103.6, 29.15], [-104.4, 29.6], [-104.9, 30.4], [-105.6, 31.1], [-106.2, 31.45],
];
export const TexasShape: React.FC<{w?: number; color?: string; pin?: number}> = ({w = 300, color = C.cyan, pin = -1}) => {
	const k = w / 13.2;
	const P = (lo: number, la: number) => [(lo + 106.8) * k, (36.7 - la) * k * 1.12] as const;
	const d = TX.map(([lo, la], i) => `${i ? 'L' : 'M'} ${P(lo, la)[0].toFixed(1)} ${P(lo, la)[1].toFixed(1)}`).join(' ') + ' Z';
	const h = w * 0.96;
	const [hx, hy] = P(-95.37, 29.76); // Houston
	const drop = pin < 0 ? null : pin < 4 ? [-70, -26, 6, 0][pin] : 0;
	return (
		<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible'}}>
			<path d={d} fill={color} />
			{drop !== null ? (
				<g transform={`translate(${hx} ${hy + drop}) scale(${w / 400})`}>
					<path d="M 0 0 C -18 -26 -26 -40 -26 -52 A 26 26 0 1 1 26 -52 C 26 -40 18 -26 0 0 Z" fill={C.sun} stroke={C.navy} strokeWidth={5} />
					<circle cx={0} cy={-52} r={9} fill={C.navy} />
				</g>
			) : null}
		</svg>
	);
};

/** Info bubble (their story highlights use an "i" icon). */
export const InfoBubble: React.FC<{size?: number}> = ({size = 180}) => (
	<svg width={size} height={size} viewBox="0 0 100 100">
		<path d="M 50 4 A 44 44 0 1 1 22 84 L 8 96 L 12 74 A 44 44 0 0 1 50 4 Z" fill={C.cyan} />
		<circle cx={50} cy={28} r={7} fill="#fff" />
		<rect x={43} y={42} width={14} height={36} rx={5} fill="#fff" />
	</svg>
);

/** Cardboard box of gear (the homeowner bought the equipment). */
export const GearBox: React.FC<{size?: number}> = ({size = 220}) => (
	<svg width={size} height={size * 0.9} viewBox="0 0 200 180">
		<path d="M 20 60 L 100 30 L 180 60 L 100 90 Z" fill="#dcbc87" stroke={C.navy} strokeWidth={6} strokeLinejoin="round" />
		<path d="M 20 60 L 20 140 L 100 172 L 100 90 Z" fill={C.kraft} stroke={C.navy} strokeWidth={6} strokeLinejoin="round" />
		<path d="M 180 60 L 180 140 L 100 172 L 100 90 Z" fill="#b48f58" stroke={C.navy} strokeWidth={6} strokeLinejoin="round" />
		<text x={58} y={130} textAnchor="middle" fontFamily="Montserrat Black" fontSize={30} fill={C.navy} transform="skewY(22) translate(0 -24)">
			EG4
		</text>
		<path d="M 128 112 L 148 104 M 128 126 L 160 114" stroke={C.navy} strokeWidth={5} strokeLinecap="round" />
	</svg>
);

/** Big phone-number pill (CTA). */
export const PhoneStrip: React.FC<{number: string; size?: number}> = ({number, size = 84}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: size * 0.25, background: C.cyan, borderRadius: 999, padding: `${size * 0.16}px ${size * 0.5}px ${size * 0.16}px ${size * 0.32}px`}}>
		<svg width={size * 0.9} height={size * 0.9} viewBox="0 0 24 24">
			<circle cx={12} cy={12} r={12} fill={C.white} />
			<path d="M8.6 6.4l1.5 2.6c.2.4.1.9-.2 1.2l-.9.8c.6 1.3 1.7 2.4 3 3l.8-.9c.3-.3.8-.4 1.2-.2l2.6 1.5c.4.2.6.7.4 1.1-.5 1.3-1.7 2.1-3 1.9-3.6-.6-6.4-3.4-7-7-.2-1.3.6-2.5 1.9-3 .4-.2.9 0 1.1.4z" fill={C.navy} />
		</svg>
		<div style={{fontFamily: FONT.cond, fontWeight: 700, fontSize: size, color: C.white, letterSpacing: size * 0.03, lineHeight: 1, textShadow: `0 4px 0 ${C.navy}`, whiteSpace: 'nowrap'}}>{number}</div>
	</div>
);

/** Round seal (end card): sun rays + two text lines. */
export const SealBadge: React.FC<{top: string; mid: string; bottom: string; size?: number; frame: number}> = ({top, mid, bottom, size = 300, frame}) => {
	const rot = Math.floor(frame / 3) * 1.5;
	return (
		<div style={{position: 'relative', width: size, height: size}}>
			<svg width={size} height={size} viewBox="-100 -100 200 200" style={{position: 'absolute', left: 0, top: 0}}>
				<g transform={`rotate(${rot})`}>
					{Array.from({length: 24}).map((_, i) => (
						<path key={i} d="M 0 -98 L 9 -80 L -9 -80 Z" transform={`rotate(${i * 15})`} fill={C.sun} />
					))}
				</g>
				<circle r={82} fill={C.sun} />
				<circle r={72} fill={C.navy} />
				<circle r={66} fill="none" stroke={C.sun} strokeWidth={2} strokeDasharray="4 4" />
			</svg>
			<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: C.white}}>
				<div style={{fontFamily: FONT.sans, fontWeight: 800, fontSize: size * 0.07, letterSpacing: 1, lineHeight: 1.1, width: size * 0.62}}>{top}</div>
				<div style={{fontFamily: FONT.serif, fontSize: size * 0.2, color: C.sun, lineHeight: 1, margin: '2px 0'}}>{mid}</div>
				<div style={{fontFamily: FONT.sans, fontWeight: 800, fontSize: size * 0.065, letterSpacing: 1, lineHeight: 1.1, width: size * 0.6}}>{bottom}</div>
			</div>
		</div>
	);
};
