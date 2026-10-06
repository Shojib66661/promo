import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {TL, row, toScreen, wordFrame, zoomAt} from './lib/timeline';
import {C, outline, wob} from './lib/brand';
import {SrcFrame} from './components/Source';
import {Camera} from './components/Camera';
import {BehindWord, HandTag, Sticker, StarBurst} from './components/Graphics';
import {Calendar, Checklist, Magnifier, NailIcon, NameTag, NewBadge, PoolIcon, RoofShield, WarningSign} from './components/Stickers';
import {EndCard} from './components/EndCard';

// ---------------------------------------------------------------------------
// Beat sheet: every graphic is keyed to the word that triggers it.
// Their own burned-in captions stay on the video (no new captions).
// Segments (see scripts/edl.py): hook (field, cold open) -> intro (front yard) ->
// elite (pool steps) -> pergola -> build (tarp push-up) -> pool -> protect (windows,
// garage, concrete, landscaping) -> care (field) -> signoff (field) -> end card.
// ---------------------------------------------------------------------------
const W = wordFrame;
const BEATS = {
	three: W('hook', 'three'),
	square: W('hook', 'square'),
	above: W('intro', 'above'),
	luxury: W('intro', 'luxury'),
	finding: W('elite', 'finding'),
	damage: W('elite', 'damage.'),
	safety: W('pergola', 'safety'),
	soWe: W('pergola', 'So'),
	newOne: W('pergola', 'new'),
	stucco: W('pergola', 'stucco.'),
	sturdy: W('build', 'sturdy'),
	pool: W('pool', 'pool'),
	nail: W('pool', 'nail'),
	cat: W('pool', 'catastrophic.'),
	protect: W('protect', 'protect'),
	windows: W('protect', 'windows,'),
	poolEq: W('protect', 'pool'),
	garage: W('protect', 'garage'),
	stamped: W('protect', 'stamped'),
	landscaping: W('protect', 'landscaping.'),
	care: W('care', 'care'),
	lamor: W('signoff', 'Lamor'),
};

const seg = (id: string) => TL.segments.find((s) => s.id === id)!;
const inRange = (f: number, a: number, b: number) => f >= a && f < b;

/** B&W world, he becomes a colour sticker (white edge) with a giant red word behind him. */
type BWMoment = {a: number; b: number; word: string; wordAt: number; y: number; size: number; star: boolean};
const BW: BWMoment[] = [
	// cold open: the word is already up on frame 0 (thumbnail)
	{a: 0, b: seg('hook').end, word: '16,000', wordAt: -12, y: 800, size: 250, star: true},
	{a: BEATS.above, b: seg('intro').end, word: 'Luxury', wordAt: BEATS.luxury - 3, y: 700, size: 250, star: false},
	{a: BEATS.care - 6, b: seg('care').end, word: 'We care', wordAt: BEATS.care - 6, y: 790, size: 220, star: true},
];

export const BigHomes: React.FC = () => {
	const f = useCurrentFrame();
	const isEnd = f >= TL.endCardStart;
	const r = row(f);

	const zoom = zoomAt(f);
	const bw = BW.find((m) => inRange(f, m.a, m.b)) ?? null;

	// ---- scene -------------------------------------------------------------
	let scene: React.ReactNode = null;
	if (isEnd) {
		scene = <EndCard local={f - TL.endCardStart} frame={f} />;
	} else if (r) {
		const [src] = r;
		scene = (
			<AbsoluteFill>
				<Camera zoom={zoom}>
					<SrcFrame frame={src} style={bw ? {filter: 'grayscale(1) contrast(1.3) brightness(1.02)'} : {filter: 'saturate(1.08) contrast(1.05)'}} />
				</Camera>
				{bw ? (
					<>
						{bw.star ? <StarBurst x={540} y={toScreen(360, 690, zoom).y} r={430} local={f - bw.a + 6} frame={f} /> : null}
						<BehindWord text={bw.word} x={540} y={bw.y} size={bw.size} local={f - bw.wordAt} frame={f} color={C.redHi} />
						<Camera zoom={zoom} style={{filter: outline(C.white, 5)}}>
							<SrcFrame frame={src} cutout />
						</Camera>
						{/* their own caption back on top of the star + cutout */}
						<Camera zoom={zoom}>
							<SrcFrame frame={src} captions style={{filter: 'grayscale(1)'}} />
						</Camera>
					</>
				) : null}
			</AbsoluteFill>
		);
	}

	// ---- graphics (in front of the video) ------------------------------------
	const fx: React.ReactNode[] = [];
	const hook = seg('hook');
	if (inRange(f, BEATS.three - 2, hook.end)) {
		fx.push(
			<Sticker key="cal" x={225} y={470} local={f - BEATS.three + 2} rot={-8} seed="cal" frame={f} out={f - hook.end + 3}>
				<Calendar size={220} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.square, hook.end)) {
		fx.push(
			<Sticker key="sqft" x={810} y={520} local={f - BEATS.square} rot={7} seed="sqft" frame={f} out={f - hook.end + 3}>
				<HandTag text="sq ft home!" size={64} color={C.navy} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.finding, seg('elite').end)) {
		fx.push(
			<Sticker key="mag" x={290} y={560} local={f - BEATS.finding} rot={-6} seed="mag" frame={f}>
				<Magnifier size={250} crack={f - BEATS.damage} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.safety, BEATS.soWe)) {
		fx.push(
			<Sticker key="warn" x={790} y={540} local={f - BEATS.safety} rot={7} seed="warn" frame={f} out={f - BEATS.soWe + 3}>
				<WarningSign size={250} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.newOne, seg('pergola').end)) {
		fx.push(
			<Sticker key="new" x={810} y={560} local={f - BEATS.newOne} rot={10} seed="new" frame={f}>
				<NewBadge size={220} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.sturdy, seg('build').end)) {
		fx.push(
			<Sticker key="shield" x={830} y={520} local={f - BEATS.sturdy} rot={6} seed="shield" frame={f}>
				<RoofShield size={220} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.pool, seg('pool').end)) {
		fx.push(
			<Sticker key="pool" x={245} y={560} local={f - BEATS.pool} rot={-7} seed="pool" frame={f}>
				<PoolIcon size={240} cross={f - BEATS.cat} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.nail, seg('pool').end)) {
		fx.push(
			<Sticker key="nail" x={835} y={540} local={f - BEATS.nail} rot={24} seed="nail" frame={f}>
				<NailIcon size={210} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.protect, seg('protect').end)) {
		fx.push(
			<Sticker key="check" x={300} y={500} local={f - BEATS.protect} rot={-3} seed="check" frame={f} out={f - seg('protect').end + 3}>
				<Checklist
					frame={f}
					width={490}
					items={[
						{label: 'Windows', at: BEATS.windows},
						{label: 'Pool equipment', at: BEATS.poolEq},
						{label: 'Garage doors', at: BEATS.garage},
						{label: 'Stamped concrete', at: BEATS.stamped},
						{label: 'Landscaping', at: BEATS.landscaping},
					]}
				/>
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.lamor, TL.endCardStart)) {
		fx.push(
			<Sticker key="name" x={330} y={1430} local={f - BEATS.lamor} rot={-3} seed="name" frame={f}>
				<NameTag name="Lamor" title="LUXURY HOME SPECIALIST" />
			</Sticker>,
		);
	}

	// ---- finish: grain + vignette -------------------------------------------
	const finish = (
		<>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.28) 100%)'}} />
			<AbsoluteFill style={{mixBlendMode: 'overlay', opacity: 0.18}}>
				<Img src={staticFile('img/grain.png')} style={{width: 1080, height: 1920, transform: `translate(${wob('gx', f, 30, 2)}px, ${wob('gy', f, 30, 2)}px) scale(1.06)`}} />
			</AbsoluteFill>
		</>
	);

	// red flash frame into the end card
	const flash = f >= TL.endCardStart && f < TL.endCardStart + 2 ? <AbsoluteFill style={{background: C.red, opacity: f === TL.endCardStart ? 0.9 : 0.4}} /> : null;

	return (
		<AbsoluteFill style={{background: C.navyDeep}}>
			{scene}
			{fx}
			{finish}
			{flash}
		</AbsoluteFill>
	);
};
