import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT, outline, pop, wob} from '../lib/brand';
import {PhotoPrint, StarBurst, Sticker} from './Graphics';
import {Lockup} from './Logo';

/**
 * CTA built over "signing off as the official roofer of the Dallas Mavericks".
 * Only facts from their profile: the Mavs | Infinite lockup, "Official Roofer of the
 * Dallas Mavericks", the states they serve and infiniteroofing.com. No offer, no phone.
 */
export const EndCard: React.FC<{local: number; frame: number}> = ({local, frame}) => {
	const f = local;
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 38%, #163262 0%, ${C.navyDeep} 78%)`}}>
			<StarBurst x={540} y={1870} r={640} local={f + 10} frame={frame} color="#0f2a55" edge={C.blue} />

			{/* lockup card */}
			<Sticker x={540} y={360} local={f} rot={-2} seed="ec-logo" frame={frame}>
				<div style={{background: C.white, borderRadius: 28, padding: '22px 34px'}}>
					<Lockup width={760} />
				</div>
			</Sticker>

			{/* OFFICIAL ROOFER OF THE Dallas Mavericks (said in the voice-over right now) */}
			<div style={{position: 'absolute', left: 540, top: 700, transform: `translate(-50%, -50%) rotate(${-3 + wob('or', frame, 0.4, 4)}deg) scale(${pop(f - 20)})`, textAlign: 'center', whiteSpace: 'nowrap'}}>
				<div style={{fontFamily: FONT.sansBlack, fontSize: 58, color: C.white, letterSpacing: 6, lineHeight: 1}}>OFFICIAL ROOFER OF THE</div>
				<div style={{fontFamily: FONT.serif, fontSize: 118, color: C.redHi, lineHeight: 1.1, textShadow: `7px 9px 0 ${C.navyDeep}`}}>Dallas Mavericks</div>
			</div>

			<Sticker x={560} y={1090} local={f - 30} rot={4} seed="ec-photo" frame={frame} edge={C.white}>
				<PhotoPrint src="img/mansion.jpg" w={560} h={330} />
			</Sticker>

			{/* states served */}
			<div style={{position: 'absolute', left: 540, top: 1350, transform: `translate(-50%, -50%) scale(${pop(f - 40)})`, textAlign: 'center', whiteSpace: 'nowrap'}}>
				<div style={{fontFamily: FONT.sans, fontWeight: 800, fontSize: 34, color: C.silver, letterSpacing: 6}}>PROUDLY SERVING</div>
				<div style={{fontFamily: FONT.sansBlack, fontSize: 64, color: C.white, letterSpacing: 4, marginTop: 4}}>TX · OK · KS · MO · CO</div>
			</div>

			{/* site */}
			<div style={{position: 'absolute', left: 540, top: 1480, transform: `translate(-50%, -50%) rotate(-1.5deg) scale(${pop(f - 48)})`, filter: outline('#fff', 5)}}>
				<div style={{background: C.red, borderRadius: 999, padding: '14px 44px', fontFamily: FONT.sansBlack, fontSize: 48, color: C.white, display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap'}}>
					<svg width={44} height={44} viewBox="0 0 24 24">
						<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" stroke={C.white} strokeWidth={2.6} fill="none" strokeLinecap="round" />
					</svg>
					infiniteroofing.com
				</div>
			</div>
		</AbsoluteFill>
	);
};
