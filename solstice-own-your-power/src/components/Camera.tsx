import React from 'react';
import {ORIGIN, SRC_SCALE, TL} from '../lib/timeline';

/** Places the source plane on screen with a punch-in zoom about ORIGIN. */
export const Camera: React.FC<{zoom: number; children: React.ReactNode; style?: React.CSSProperties}> = ({zoom, children, style}) => {
	const s = SRC_SCALE * zoom;
	const tx = TL.width / 2 - ORIGIN.x * s;
	const ty = ORIGIN.y * SRC_SCALE - ORIGIN.y * s;
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				width: TL.srcWidth,
				height: TL.srcHeight,
				transformOrigin: '0 0',
				transform: `translate(${tx}px, ${ty}px) scale(${s})`,
				...style,
			}}
		>
			{children}
		</div>
	);
};

/**
 * Print mode (mixed-media moments): the whole 1080x1920 frame shrinks into a taped
 * photo print on the navy backdrop. Every layer inside uses the same transform, so
 * the colour cutout lines up with the B&W print.
 */
export const PRINT = {scale: 0.8, cx: 540, cy: 900, rot: -2};
export const PrintPlane: React.FC<{children: React.ReactNode; style?: React.CSSProperties; border?: boolean}> = ({children, style, border}) => (
	<div
		style={{
			position: 'absolute',
			left: 0,
			top: 0,
			width: TL.width,
			height: TL.height,
			transformOrigin: `${PRINT.cx}px ${PRINT.cy}px`,
			transform: `rotate(${PRINT.rot}deg) scale(${PRINT.scale})`,
			overflow: 'hidden',
			boxShadow: border ? '0 0 0 20px #fbfbf6, 0 30px 50px 18px rgba(0,0,0,0.55)' : undefined,
			...style,
		}}
	>
		{children}
	</div>
);

/** Screen position of a point given in un-printed screen coords. */
export const toPrint = (x: number, y: number) => {
	const a = (PRINT.rot * Math.PI) / 180;
	const dx = (x - PRINT.cx) * PRINT.scale;
	const dy = (y - PRINT.cy) * PRINT.scale;
	return {x: PRINT.cx + dx * Math.cos(a) - dy * Math.sin(a), y: PRINT.cy + dx * Math.sin(a) + dy * Math.cos(a)};
};
