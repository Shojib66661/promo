import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, torn} from '../lib/brand';

/** Ruff Roofing logo, cropped from their own end card (white background, 1174x670). */
export const Logo: React.FC<{height: number; style?: React.CSSProperties}> = ({height, style}) => (
	<Img src={staticFile('img/logo.png')} style={{height, width: (height * 1174) / 670, display: 'block', ...style}} />
);

/** Torn white paper banner with the logo (used to cover their animated logo sticker, and on the end card). */
export const LogoCard: React.FC<{w: number; h: number; logoH: number; seed?: string; left?: number; children?: React.ReactNode}> = ({w, h, logoH, seed = 'logocard', left, children}) => (
	<div
		style={{
			width: w,
			height: h,
			background: C.white,
			clipPath: torn(seed, w, h, 8, 30),
			display: 'flex',
			flexDirection: 'column',
			alignItems: left !== undefined ? 'flex-start' : 'center',
			justifyContent: 'center',
			paddingLeft: left ?? 0,
			boxSizing: 'border-box',
			gap: 6,
		}}
	>
		<Logo height={logoH} />
		{children}
	</div>
);
