import React from 'react';
import {Chunk} from '../lib/timeline';
import {C, FONT, pop, wob} from '../lib/brand';

/** Reels-style captions drop trailing commas and full stops. */
const clean = (t: string) => t.replace(/[.,]+$/, '');

export type ScreenBox = {x0: number; y0: number; x1: number; y1: number};

/**
 * Mixed-media caption on a navy sticker label (white edge, hard red offset).
 *
 * The old burned-in captions blur in and out right over the speaker, so they
 * can't be inpainted cleanly. The label is the cover: it is centred on the old
 * caption and at least as big as the union of its boxes over the whole chunk
 * (`cover`, screen px), full size from the chunk's first frame. Only the words
 * pop. Upcoming words show dimmed, then light up when spoken.
 */
export const LabelCaption: React.FC<{
	chunk: Chunk;
	index: number;
	frame: number;
	cover: ScreenBox | null;
	fallbackY: number;
	hideHero?: boolean;
	showAll?: boolean;
}> = ({chunk, index, frame, cover, fallbackY, hideHero, showAll}) => {
	const rot = (index % 2 ? 0.8 : -0.8) + wob(`cap${index}`, frame, 0.35, 4);
	const words = hideHero ? chunk.words.filter((w) => !w.emph) : chunk.words;
	const heroChars = chunk.words.filter((w) => w.emph).reduce((n, w) => n + w.w.length + 1, 0);
	const heroSize = heroChars > 12 ? 92 : 112;
	const cx = 540;
	const cy = cover ? (cover.y0 + cover.y1) / 2 : fallbackY;
	const minW = cover ? Math.min(1080, cover.x1 - cover.x0) : 0;
	const minH = cover ? cover.y1 - cover.y0 : 0;
	return (
		<div
			style={{
				position: 'absolute',
				left: cx,
				top: cy,
				transform: `translate(-50%, -50%) rotate(${rot}deg)`,
				minWidth: minW,
				minHeight: minH,
				maxWidth: 1080,
				boxSizing: 'border-box',
				padding: '14px 34px 16px',
				background: C.navy,
				border: `5px solid ${C.white}`,
				borderRadius: 18,
				boxShadow: `9px 10px 0 ${C.red}, 0 18px 30px rgba(0,0,0,0.35)`,
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: 'center',
				alignItems: 'center',
				alignContent: 'center',
				columnGap: 16,
				rowGap: 0,
			}}
		>
			{words.length === 0 ? <span style={{fontFamily: FONT.sans, fontWeight: 800, fontSize: 68, color: 'transparent'}}>·</span> : null}
			{words.map((w, i) => {
				const local = frame - w.f;
				const spoken = showAll || local >= -1;
				const s = spoken ? (showAll ? 1 : Math.max(0.85, pop(local + 1))) : 1;
				const common: React.CSSProperties = {
					display: 'inline-block',
					opacity: spoken ? 1 : w.emph ? 0.62 : 0.5,
					transform: `scale(${s})`,
					transformOrigin: '50% 70%',
					whiteSpace: 'nowrap',
				};
				if (w.emph) {
					return (
						<span
							key={i}
							style={{
								...common,
								fontFamily: FONT.serif,
								fontSize: heroSize,
								lineHeight: 1.0,
								color: C.redHi,
								letterSpacing: -1,
								padding: '0 2px',
								marginBottom: 6,
							}}
						>
							{clean(w.w)}
						</span>
					);
				}
				return (
					<span
						key={i}
						style={{
							...common,
							fontFamily: FONT.sans,
							fontWeight: 800,
							fontSize: 68,
							lineHeight: 1.15,
							color: C.white,
						}}
					>
						{clean(w.w).toUpperCase()}
					</span>
				);
			})}
		</div>
	);
};
