import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT, outline, pop, wob} from '../lib/brand';
import {PhoneStrip, PhotoPrint, SealBadge, StarBurst, Sticker} from './Graphics';
import {LogoCard} from './Logo';

/** 3 s CTA built only from his words + their IG bio: logo, OWN YOUR Power (their post caption),
 *  Houston Chronicle's Best Solar Company 2026, phone, site, TECL license, Houston. */
export const EndCard: React.FC<{local: number; frame: number}> = ({local, frame}) => {
	const f = local;
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 35%, #0f3a63 0%, ${C.navyDeep} 75%)`}}>
			<StarBurst x={540} y={1840} r={640} local={f + 10} frame={frame} color="#0d3358" edge={C.cyan} />

			{/* logo card (continues from the last line) */}
			<Sticker x={540} y={340} local={f + 20} rot={-2} seed="ec-logo" frame={frame} scale={1 / 1.4}>
				<LogoCard h={150} />
			</Sticker>

			{/* OWN YOUR Power */}
			<div style={{position: 'absolute', left: 540, top: 650, transform: `translate(-50%, -50%) rotate(${-4 + wob('oyp', frame, 0.5, 4)}deg) scale(${pop(f - 3)})`, textAlign: 'center'}}>
				<div style={{fontFamily: FONT.sansBlack, fontSize: 92, color: C.white, letterSpacing: 8, lineHeight: 1, whiteSpace: 'nowrap'}}>OWN YOUR</div>
				<div style={{fontFamily: FONT.serif, fontSize: 210, color: C.cyanHi, lineHeight: 0.95, textShadow: `8px 10px 0 #000a`}}>Power</div>
			</div>

			<Sticker x={660} y={1035} local={f - 12} rot={5} seed="ec-photo" frame={frame} edge={C.cyan} scale={1 / 1.4}>
				<PhotoPrint src="img/system.jpg" w={520} h={310} bw />
			</Sticker>
			<Sticker x={250} y={1010} local={f - 8} rot={-9} seed="ec-seal" frame={frame} edge={false} scale={1 / 1.4}>
				<SealBadge top="Houston Chronicle's" mid="Best" bottom="Solar Company 2026" size={330} frame={frame} />
			</Sticker>

			<div style={{position: 'absolute', left: 540, top: 1270, transform: `translate(-50%, -50%) rotate(-1.5deg) scale(${pop(f - 18)})`, filter: outline('#fff', 5)}}>
				<PhoneStrip number="832-721-2339" size={88} />
			</div>
			<div
				style={{
					position: 'absolute',
					left: 540,
					top: 1385,
					transform: `translate(-50%, -50%) scale(${pop(f - 24)})`,
					fontFamily: FONT.sans,
					fontWeight: 800,
					fontSize: 52,
					color: C.white,
					textShadow: '0 4px 0 rgba(0,0,0,0.5)',
					whiteSpace: 'nowrap',
				}}
			>
				solsticesolar.com
			</div>
			<div
				style={{
					position: 'absolute',
					left: 540,
					top: 1465,
					transform: `translate(-50%, -50%) scale(${pop(f - 30)})`,
					fontFamily: FONT.sans,
					fontWeight: 800,
					fontSize: 32,
					letterSpacing: 2,
					color: C.cyanHi,
					whiteSpace: 'nowrap',
				}}
			>
				LICENSED IN TEXAS · TECL #35546 · HOUSTON, TX
			</div>
		</AbsoluteFill>
	);
};
