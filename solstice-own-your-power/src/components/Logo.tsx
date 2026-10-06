import React from 'react';
import {C, FONT} from '../lib/brand';

/** Solstice "S" bolt: two slanted cyan pieces (redrawn from the profile logo). viewBox 0 0 160 150. */
export const LogoMark: React.FC<{size: number; color?: string; style?: React.CSSProperties}> = ({size, color = C.cyan, style}) => (
	<svg width={size} height={size * (150 / 160)} viewBox="0 0 160 150" style={style}>
		<path d="M 84 4 L 156 4 L 106 70 L 4 70 Z" fill={color} />
		<path d="M 54 80 L 156 80 L 106 146 L 4 146 Z" fill={color} />
	</svg>
);

/** SOLSTICE / SOLAR wordmark in a condensed sans, as in their logo. */
export const Wordmark: React.FC<{height: number; color?: string}> = ({height, color = C.cyan}) => (
	<div style={{fontFamily: FONT.cond, fontWeight: 700, color, fontSize: height * 0.5, lineHeight: 1.0, letterSpacing: height * 0.012}}>
		<div>SOLSTICE</div>
		<div>SOLAR</div>
	</div>
);

/** Logo lockup on a white card. */
export const LogoCard: React.FC<{h?: number}> = ({h = 150}) => (
	<div style={{background: C.white, borderRadius: 26, padding: `${h * 0.17}px ${h * 0.27}px`, display: 'flex', alignItems: 'center', gap: h * 0.16}}>
		<LogoMark size={h * 1.05} />
		<Wordmark height={h} />
	</div>
);
