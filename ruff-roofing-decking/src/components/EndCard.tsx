import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, FONT, outline, pop, wob} from '../lib/brand';
import {StarBurst, Sticker} from './Graphics';
import {LogoCard} from './Logo';

/**
 * ~3.2 s CTA built only from their profile: logo, "Every Homeowner's Best Friend",
 * the four cities, ruff-roofing.co/roof. Starts over his last line; Dre as a sticker.
 * No offer / phone until the client confirms the exact wording.
 */
export const EndCard: React.FC<{local: number; frame: number}> = ({local, frame}) => {
	const f = local;
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 38%, #2c272d 0%, ${C.inkDeep} 75%)`}}>
			<StarBurst x={540} y={1130} r={560} local={f + 6} frame={frame} color={C.red} edge={C.cyan} />

			{/* Dre as a colour sticker with a red edge */}
			<div style={{position: 'absolute', left: 540, top: 1150, transform: `translate(-50%, -50%) rotate(${wob('ec-dre', frame, 1, 4)}deg) scale(${pop(f - 2)})`, filter: outline(C.white, 7)}}>
				<Img src={staticFile('img/dre.png')} style={{height: 640, display: 'block'}} />
			</div>

			{/* logo card */}
			<Sticker x={540} y={330} local={f} rot={-2} seed="ec-logo" frame={frame} edge={false}>
				<div style={{filter: 'drop-shadow(0 14px 16px rgba(0,0,0,0.45))'}}>
					<LogoCard w={720} h={340} logoH={290} seed="logo-end" />
				</div>
			</Sticker>

			{/* Every Homeowner's Best Friend (their bio) */}
			<div style={{position: 'absolute', left: 540, top: 745, transform: `translate(-50%, -50%) rotate(${-3 + wob('ec-t', frame, 0.5, 4)}deg) scale(${pop(f - 6)})`, textAlign: 'center', whiteSpace: 'nowrap'}}>
				<div style={{fontFamily: FONT.sansBlack, fontSize: 60, color: C.white, letterSpacing: 4, lineHeight: 1}}>EVERY HOMEOWNER&apos;S</div>
				<div style={{fontFamily: FONT.serif, fontSize: 170, color: C.cyanHi, lineHeight: 1.0, textShadow: `8px 10px 0 ${C.red}`}}>Best Friend</div>
			</div>

			{/* cities */}
			<div
				style={{
					position: 'absolute',
					left: 540,
					top: 1400,
					transform: `translate(-50%, -50%) rotate(-1deg) scale(${pop(f - 36)})`,
					fontFamily: FONT.sans,
					fontWeight: 800,
					fontSize: 42,
					color: C.white,
					whiteSpace: 'nowrap',
					background: C.inkDeep,
					padding: '10px 28px',
					borderRadius: 12,
				}}
			>
				Houston · Austin · San Antonio · Dallas
			</div>

			{/* link */}
			<div style={{position: 'absolute', left: 540, top: 1490, transform: `translate(-50%, -50%) rotate(-1.5deg) scale(${pop(f - 40)})`, filter: outline('#fff', 5)}}>
				<div style={{background: C.red, borderRadius: 999, padding: '12px 42px', fontFamily: FONT.sansBlack, fontSize: 50, color: C.white, display: 'flex', alignItems: 'center', gap: 16, whiteSpace: 'nowrap'}}>
					<svg width={44} height={44} viewBox="0 0 24 24">
						<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" stroke={C.white} strokeWidth={2.6} fill="none" strokeLinecap="round" />
					</svg>
					ruff-roofing.co/roof
				</div>
			</div>
		</AbsoluteFill>
	);
};
