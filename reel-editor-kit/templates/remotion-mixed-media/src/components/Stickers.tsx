import React from 'react';
import {C, FONT, pop, prog2} from '../lib/brand';

/** Tear-off calendar page: "3 DAYS". */
export const Calendar: React.FC<{size?: number}> = ({size = 230}) => (
	<div style={{width: size, background: C.white, borderRadius: 18, overflow: 'hidden', textAlign: 'center'}}>
		<div style={{background: C.red, height: size * 0.26, position: 'relative'}}>
			{[0.28, 0.72].map((x) => (
				<div key={x} style={{position: 'absolute', left: `${x * 100}%`, top: -10, width: 16, height: 34, marginLeft: -8, borderRadius: 8, background: C.charcoal}} />
			))}
		</div>
		<div style={{fontFamily: FONT.sansBlack, fontSize: size * 0.52, color: C.navy, lineHeight: 1, marginTop: size * 0.04}}>3</div>
		<div style={{fontFamily: FONT.sansBlack, fontSize: size * 0.14, color: C.red, letterSpacing: 4, paddingBottom: size * 0.08}}>DAYS</div>
	</div>
);

/** Magnifying glass over a cracked shingle ("finding damage"). */
export const Magnifier: React.FC<{size?: number; crack: number}> = ({size = 240, crack}) => (
	<svg width={size} height={size} viewBox="0 0 200 200">
		<circle cx={84} cy={84} r={62} fill="#dfe7ef" stroke={C.navy} strokeWidth={14} />
		<rect x={44} y={58} width={80} height={52} rx={4} fill={C.charcoal} />
		<path d="M 44 76 L 124 76 M 44 94 L 124 94" stroke="#555a60" strokeWidth={3} />
		<path d="M 70 58 L 82 78 L 74 88 L 90 110" stroke={C.redHi} strokeWidth={6} fill="none" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={80} strokeDashoffset={80 * (1 - prog2(crack, 6))} />
		<path d="M 130 130 L 182 182" stroke={C.navy} strokeWidth={26} strokeLinecap="round" />
		<path d="M 134 134 L 178 178" stroke={C.red} strokeWidth={12} strokeLinecap="round" />
	</svg>
);

/** Yellow warning sign with a SAFETY HAZARD plate. */
export const WarningSign: React.FC<{size?: number}> = ({size = 260}) => (
	<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
		<svg width={size} height={size * 0.88} viewBox="0 0 200 176">
			<path d="M 100 10 L 192 166 L 8 166 Z" fill={C.yellow} stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
			<rect x={91} y={58} width={18} height={62} rx={8} fill={C.ink} />
			<circle cx={100} cy={142} r={11} fill={C.ink} />
		</svg>
		<div style={{marginTop: 8, background: C.red, color: C.white, fontFamily: FONT.sansBlack, fontSize: size * 0.15, padding: '6px 20px', borderRadius: 10, letterSpacing: 2, whiteSpace: 'nowrap'}}>SAFETY HAZARD</div>
	</div>
);

/** Round "BRAND NEW" badge. */
export const NewBadge: React.FC<{size?: number}> = ({size = 220}) => (
	<div
		style={{
			width: size,
			height: size,
			borderRadius: '50%',
			background: C.red,
			color: C.white,
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			border: `8px dashed ${C.white}`,
			boxSizing: 'border-box',
		}}
	>
		<div style={{fontFamily: FONT.sans, fontWeight: 800, fontSize: size * 0.13, letterSpacing: 3}}>BRAND</div>
		<div style={{fontFamily: FONT.serif, fontSize: size * 0.36, lineHeight: 0.9}}>New</div>
	</div>
);

/** Shield with Infinite's roof line inside ("sturdy structures"). */
export const RoofShield: React.FC<{size?: number}> = ({size = 240}) => (
	<svg width={size} height={size * 1.15} viewBox="0 0 200 230">
		<path d="M 100 8 L 186 38 C 186 120, 160 188, 100 222 C 40 188, 14 120, 14 38 Z" fill={C.blue} />
		<path d="M 100 24 L 172 49 C 170 118, 148 174, 100 204 C 52 174, 30 118, 28 49 Z" fill={C.navy} />
		<path d="M 46 128 L 100 78 L 154 128" stroke={C.red} strokeWidth={16} fill="none" strokeLinejoin="round" strokeLinecap="round" />
		<rect x={66} y={124} width={68} height={50} fill={C.white} />
		<rect x={92} y={144} width={16} height={30} fill={C.navy} />
	</svg>
);

/** Pool tile with ripples; `cross` draws a red X over it. */
export const PoolIcon: React.FC<{size?: number; cross?: number}> = ({size = 230, cross = -1}) => (
	<div style={{position: 'relative', width: size, height: size * 0.72}}>
		<svg width={size} height={size * 0.72} viewBox="0 0 200 144">
			<rect x={4} y={4} width={192} height={136} rx={22} fill={C.white} />
			<rect x={18} y={18} width={164} height={108} rx={14} fill={C.water} />
			{[44, 72, 100].map((y) => (
				<path key={y} d={`M 30 ${y} c 14 -10, 26 10, 40 0 s 26 10, 40 0 s 26 10, 40 0 s 26 10, 40 0`} stroke="#ffffff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.85} />
			))}
			<path d="M 160 8 L 160 60 M 176 8 L 176 60 M 160 26 L 176 26 M 160 44 L 176 44" stroke={C.silver} strokeWidth={6} strokeLinecap="round" />
		</svg>
		{cross >= 0 ? (
			<svg width={size} height={size * 0.72} viewBox="0 0 200 144" style={{position: 'absolute', left: 0, top: 0}}>
				<path d="M 20 14 L 180 130" stroke={C.red} strokeWidth={20} strokeLinecap="round" strokeDasharray={220} strokeDashoffset={220 * (1 - prog2(cross, 4))} />
				<path d="M 180 14 L 20 130" stroke={C.red} strokeWidth={20} strokeLinecap="round" strokeDasharray={220} strokeDashoffset={220 * (1 - prog2(cross - 3, 4))} />
			</svg>
		) : null}
	</div>
);

/** A single roofing nail. */
export const NailIcon: React.FC<{size?: number}> = ({size = 200}) => (
	<svg width={size} height={size} viewBox="0 0 200 200">
		<ellipse cx={100} cy={40} rx={58} ry={16} fill="#9aa4ae" stroke={C.ink} strokeWidth={6} />
		<path d="M 90 52 L 110 52 L 106 160 L 100 188 L 94 160 Z" fill="#b8c1ca" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
		<path d="M 92 80 L 108 72 M 92 100 L 108 92 M 92 120 L 108 112" stroke={C.ink} strokeWidth={4} />
	</svg>
);

/** White checklist card: each item gets ticked on its word. */
export const Checklist: React.FC<{items: Array<{label: string; at: number}>; frame: number; width?: number}> = ({items, frame, width = 470}) => (
	<div style={{width, background: C.white, borderRadius: 22, padding: '20px 26px 16px', boxSizing: 'border-box'}}>
		<div style={{fontFamily: FONT.sansBlack, fontSize: 30, letterSpacing: 3, color: C.red, marginBottom: 6}}>WE PROTECT</div>
		{items.map((it, i) => {
			const local = frame - it.at;
			const on = local >= 0;
			return (
				<div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '7px 0', borderTop: i ? '2px solid #e4e8ec' : undefined}}>
					<div style={{width: 46, height: 46, borderRadius: 10, border: `5px solid ${C.navy}`, boxSizing: 'border-box', position: 'relative', flexShrink: 0, background: on ? C.navy : 'transparent'}}>
						{on ? (
							<svg width={60} height={60} viewBox="0 0 60 60" style={{position: 'absolute', left: -2, top: -14, transform: `scale(${pop(local)})`}}>
								<path d="M 10 30 L 24 44 L 54 8" stroke={C.redHi} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={80} strokeDashoffset={80 * (1 - prog2(local, 4))} />
							</svg>
						) : null}
					</div>
					<div style={{fontFamily: FONT.sans, fontWeight: 800, fontSize: 38, color: on ? C.navy : '#9aa4ae', whiteSpace: 'nowrap', transform: `scale(${on ? Math.max(1, pop(local)) : 1})`, transformOrigin: '0 50%'}}>{it.label}</div>
				</div>
			);
		})}
	</div>
);

/** Lower-third name tag. */
export const NameTag: React.FC<{name: string; title: string}> = ({name, title}) => (
	<div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
		<div style={{background: C.red, color: C.white, fontFamily: FONT.sans, fontWeight: 800, fontSize: 30, letterSpacing: 4, padding: '6px 18px', borderRadius: '10px 10px 0 0'}}>HELLO, I'M</div>
		<div style={{background: C.white, padding: '4px 30px 10px', borderRadius: '0 16px 16px 16px'}}>
			<div style={{fontFamily: FONT.serif, fontSize: 96, color: C.navy, lineHeight: 1}}>{name}</div>
			<div style={{fontFamily: FONT.sans, fontWeight: 800, fontSize: 30, color: C.red, letterSpacing: 2, marginTop: 2}}>{title}</div>
		</div>
	</div>
);
