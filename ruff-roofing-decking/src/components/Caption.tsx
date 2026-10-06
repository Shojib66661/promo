import React from 'react';
import {Chunk} from '../lib/timeline';
import {C, FONT, pop, tornPct, wob} from '../lib/brand';

/** Reels-style captions drop trailing commas and full stops. */
const clean = (t: string) => t.replace(/[.,]+$/, '');

/**
 * Mixed-media caption on an ink tape strip: white sans words + one hero word in
 * a big cyan italic serif. Words appear as they are spoken (upcoming ones dimmed).
 *
 * Their editor's captions were removed from the source, but on bright decking /
 * sky some letters survive, so the strip is opaque and at least as big as the
 * old caption zone (`cover`, screen px) from the chunk's first frame. Only the text pops.
 */
export const MixedCaption: React.FC<{
	chunk: Chunk;
	index: number;
	frame: number;
	cx: number;
	cy: number;
	cover: {x0: number; y0: number; x1: number; y1: number} | null;
	hideHero?: boolean;
	showAll?: boolean;
	heroColor?: string;
	scale?: number;
}> = ({chunk, index, frame, cx, cy, cover, hideHero, showAll, heroColor = C.cyanHi, scale = 1}) => {
	const rot = wob(`cap${index}`, frame, 0.5, 4);
	const words = hideHero ? chunk.words.filter((w) => !w.emph) : chunk.words;
	const minW = cover ? cover.x1 - cover.x0 + 40 : 0;
	const minH = cover ? cover.y1 - cover.y0 + 30 : 0;
	return (
		<div
			style={{
				position: 'absolute',
				left: cx,
				top: cy,
				transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`,
			}}
		>
			<div style={{position: 'relative', minWidth: minW, minHeight: minH, maxWidth: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background: C.inkDeep,
						clipPath: tornPct(`strip${index}`, 6, 24),
						filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.35))',
					}}
				/>
				<div
					style={{
						position: 'relative',
						padding: '10px 34px 14px',
						display: 'flex',
						flexWrap: 'wrap',
						justifyContent: 'center',
						alignItems: 'baseline',
						columnGap: 18,
						rowGap: 0,
						maxWidth: 1000,
					}}
				>
					{words.map((w, i) => {
						const local = frame - w.f;
						const spoken = showAll || local >= -1;
						const s = spoken ? (showAll ? 1 : Math.max(0.85, pop(local + 1))) : 1;
						const common: React.CSSProperties = {
							display: 'inline-block',
							opacity: spoken ? 1 : 0.38,
							transform: `scale(${s})`,
							transformOrigin: '50% 80%',
						};
						if (w.emph) {
							return (
								<span key={i} style={{...common, fontFamily: FONT.serif, fontSize: 120, lineHeight: 1.0, color: heroColor, letterSpacing: -1, padding: '0 4px'}}>
									{clean(w.w)}
								</span>
							);
						}
						return (
							<span key={i} style={{...common, fontFamily: FONT.sans, fontWeight: 800, fontSize: 70, lineHeight: 1.2, color: C.white}}>
								{clean(w.w)}
							</span>
						);
					})}
				</div>
			</div>
		</div>
	);
};
