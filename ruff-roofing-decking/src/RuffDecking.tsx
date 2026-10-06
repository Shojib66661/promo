import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {TL, chunkIndexAt, row, toScreen, wordFrame, zoomAt} from './lib/timeline';
import {C, FONT, outline, tornPct, wob} from './lib/brand';
import {SrcFrame} from './components/Source';
import {Camera} from './components/Camera';
import {MixedCaption} from './components/Caption';
import {
	ActionIcon,
	BehindWord,
	Board,
	CheckRow,
	DamageCard,
	HandTag,
	Hourglass,
	MoneyNote,
	PhotoPrint,
	PriceTag,
	StarBurst,
	Stamp,
	Sticker,
	TitleTape,
} from './components/Graphics';
import {LogoCard} from './components/Logo';
import {EndCard} from './components/EndCard';

// ---------------------------------------------------------------------------
// Beat sheet: every graphic is keyed to the word that triggers it (scripts/edl.py
// segments: hook, intro, holes, repair, sheet, inspect, save, after, cta).
// ---------------------------------------------------------------------------
const W = wordFrame;
const BEATS = {
	ruff: W('intro', 'Ruff'),
	damaged: W('intro', 'damaged'),
	decking: W('intro', 'decking,'),
	water: W('intro', 'water'),
	its: W('holes', "It's"),
	over: W('holes', 'over'),
	andOver: W('holes', 'and'),
	expensive: W('repair', 'expensive'),
	sheetrock: W('sheet', 'sheetrock,'),
	rafters: W('sheet', 'rafters.'),
	doFull: W('inspect', 'Do'),
	problematic: W('inspect', 'problematic'),
	problems: W('inspect', 'problems'),
	saving: W('save', 'saving'),
	thousands: W('save', 'thousands'),
	good: W('after', 'good'),
	call: W('cta', 'call,'),
	click: W('cta', 'click'),
	link: W('cta', 'link,'),
	text: W('cta', 'text,'),
	office: W('cta', 'office.'),
	leaking: W('hook', 'leaking'),
};
/** The end card starts over the last line ("We'll get you taken care of"). */
export const END = W('cta', "We'll") - 2;

const inRange = (f: number, a: number, b: number) => f >= a && f < b;

/** Output-frame window where the shown SOURCE frame lies in [a, b). */
const srcWindow = (a: number, b: number): [number, number] => {
	let s = -1;
	let e = -1;
	TL.frames.forEach((r, i) => {
		if (r[0] >= a && r[0] < b) {
			if (s < 0) s = i;
			e = i + 1;
		}
	});
	return [s, e];
};

// Their editor's big burned-in graphics (source frames) that we cover with our own.
const LOGO_WIN = srcWindow(38, 112); // animated logo sticker, src x 0-720 y 160-350
const BOARD1_WIN = srcWindow(148, 280); // 3 decking photos + DAMAGED/OLD DECKING / WATER DAMAGE
const BOARD2_WIN = srcWindow(880, 1088); // 2 shingle photos, then "saving you" + counter
const BOARD1_BOX = [32, 578, 708, 908];
const BOARD2_BOX = [22, 498, 700, 874];
const BUBBLE_WIN = srcWindow(1420, 1468); // their "Can someone come check my roof?" text notification


/** Moments where the world goes B&W and he becomes a colour sticker with a word behind him. */
const BW = [
	{a: TL.segments[1].start, b: LOGO_WIN[0], word: '', wordAt: 0, y: 300, size: 330, star: true, starY: 330, x: 540},
	{a: BEATS.its, b: BEATS.andOver, word: 'Old', wordAt: W('holes', 'old') - 1, y: 215, size: 280, star: false, starY: 0, x: 770},
	{a: BEATS.doFull, b: BOARD2_WIN[0], word: 'Inspection', wordAt: W('inspect', 'inspection') - 1, y: 300, size: 135, star: true, starY: 420, x: 540},
	{a: TL.segments[8].start, b: BEATS.click, word: 'Call', wordAt: BEATS.call - 1, y: 330, size: 300, star: true, starY: 380, x: 540},
];

const boxToScreen = (b: number[], zoom: number) => {
	const p = toScreen(b[0], b[1], zoom);
	const q = toScreen(b[2], b[3], zoom);
	return {x: p.x, y: p.y, w: q.x - p.x, h: q.y - p.y};
};

export const RuffDecking: React.FC = () => {
	const f = useCurrentFrame();
	const isEnd = f >= END;
	const r = row(f);
	const zoom = zoomAt(f);
	const bw = !isEnd ? BW.find((m) => inRange(f, m.a, m.b)) ?? null : null;

	// ---- scene -------------------------------------------------------------
	let scene: React.ReactNode = null;
	if (r && !isEnd) {
		const [src] = r;
		scene = (
			<AbsoluteFill>
				<Camera zoom={zoom}>
					<SrcFrame frame={src} style={bw ? {filter: 'grayscale(1) contrast(1.3) brightness(1.05)'} : {filter: 'saturate(1.06) contrast(1.04)'}} />
				</Camera>
				{bw ? (
					<>
						{bw.star ? <StarBurst x={540} y={toScreen(360, bw.starY, zoom).y} r={430} local={f - bw.a} frame={f} /> : null}
						{bw.word ? <BehindWord text={bw.word} x={bw.x} y={toScreen(360, bw.y, zoom).y} size={bw.size} local={f - bw.wordAt} frame={f} /> : null}
						<Camera zoom={zoom} style={{filter: outline(C.red, 5)}}>
							<SrcFrame frame={src} cutout />
						</Camera>
					</>
				) : null}
			</AbsoluteFill>
		);
	}

	// ---- graphics (in front of the video, behind the caption) ---------------
	const fx: React.ReactNode[] = [];

	// HOOK: water drops on "leaking" (the title tape is drawn with the caption, below)
	if (inRange(f, BEATS.leaking, TL.segments[0].end)) {
		[0, 1, 2].forEach((i) =>
			fx.push(
				<Sticker key={`drop${i}`} x={790 + i * 70} y={380 + (i % 2) * 70 + (((f - BEATS.leaking) * 3) % 40)} local={f - BEATS.leaking - i * 3} rot={0} seed={`drop${i}`} frame={f} edge={C.white}>
					<svg width={60} height={80} viewBox="-30 -40 60 80">
						<path d="M 0 -34 C 14 -10, 22 4, 22 14 A 22 22 0 0 1 -22 14 C -22 4, -14 -10, 0 -34 Z" fill={C.water} />
					</svg>
				</Sticker>,
			),
		);
	}

	// INTRO: logo card over their animated logo sticker
	if (inRange(f, LOGO_WIN[0] - 1, LOGO_WIN[1] + 3)) {
		// their logo drops in from the top (src y 0-345 until src frame ~60) and settles at y 150-362
		const src = r ? r[0] : 0;
		const t = Math.max(0, Math.min(1, (src - 56) / 8));
		const y0 = 150 * t;
		const y1 = 350 + 12 * t;
		const b = boxToScreen([0, y0 - 4, 720, y1], zoom);
		fx.push(
			<Sticker key="logo" x={540} y={b.y + b.h / 2} local={f - LOGO_WIN[0] + 4} out={f - LOGO_WIN[1]} rot={-1.5} seed="logo" frame={f} edge={false} wobble={0.6}>
				<div style={{filter: 'drop-shadow(0 14px 16px rgba(0,0,0,0.4))'}}>
					<LogoCard w={1150} h={b.h + 30} logoH={Math.min(220, b.h - 50)} seed="logo-intro" left={100} />
				</div>
			</Sticker>,
		);
		// he stays in front of the card (the logo sits behind him, like the words-behind moments)
		if (r && r[0] < 64) {
			fx.push(
				<Camera key="logo-cut" zoom={zoom}>
					<SrcFrame frame={r[0]} cutout />
				</Camera>,
			);
		}
	}

	// BOARD 1: very damaged decking / water damage (their own photos, re-taped)
	if (inRange(f, BOARD1_WIN[0], TL.segments[1].end + 3)) {
		const b = boxToScreen(BOARD1_BOX, zoom);
		const local = f - BOARD1_WIN[0];
		const title = f >= BEATS.water ? 'Water Damage' : 'Damaged Decking';
		const titleAt = f >= BEATS.water ? BEATS.water : BEATS.damaged;
		fx.push(
			<Board key="b1" x={b.x} y={b.y} w={b.w} h={b.h} local={local} out={f - TL.segments[1].end} seed="board1" frame={f}>
				{[
					{src: 'img/deck1.jpg', at: BOARD1_WIN[0], x: 0.19, rot: -5},
					{src: 'img/deck2.jpg', at: BEATS.decking, x: 0.5, rot: 3},
					{src: 'img/deck3.jpg', at: BEATS.water, x: 0.81, rot: -2},
				].map((p, i) => (
					<Sticker key={i} x={b.w * p.x} y={b.h * 0.6} local={f - p.at} rot={p.rot} seed={`deck${i}`} frame={f} edge={false}>
						<div style={{filter: 'drop-shadow(0 8px 8px rgba(0,0,0,0.35))'}}>
							<PhotoPrint src={p.src} w={b.w * 0.25} h={b.w * 0.24} tapeRot={p.rot * -1.5} />
						</div>
					</Sticker>
				))}
				{f >= BEATS.damaged - 1 ? (
					<div style={{position: 'absolute', left: b.w / 2, top: b.h * 0.14, transform: `translate(-50%, -50%) rotate(${-2 + wob('t1', f, 0.4, 4)}deg)`}}>
						<TitleTape key={title} text={title} size={110} local={f - titleAt} seed={`tt${title}`} />
					</div>
				) : null}
			</Board>,
		);
	}

	// HOLES: hourglass on "over time"
	if (inRange(f, BEATS.over, TL.segments[2].end + 3)) {
		fx.push(
			<Sticker key="hour" x={890} y={430} local={f - BEATS.over} out={f - TL.segments[2].end} rot={8} seed="hour" frame={f}>
				<Hourglass size={190} local={f - BEATS.over} />
			</Sticker>,
		);
	}

	// REPAIR: $$$ tag on "expensive"
	if (inRange(f, BEATS.expensive, TL.segments[3].end + 3)) {
		fx.push(
			<Sticker key="price" x={820} y={430} local={f - BEATS.expensive} out={f - TL.segments[3].end} rot={-10} seed="price" frame={f}>
				<PriceTag size={260} />
			</Sticker>,
		);
	}

	// SHEET: sheetrock + rafters cards
	if (inRange(f, BEATS.sheetrock, TL.segments[4].end + 3)) {
		const out = f - TL.segments[4].end;
		fx.push(
			<Sticker key="sr" x={275} y={430} local={f - BEATS.sheetrock} out={out} rot={-6} seed="sr" frame={f}>
				<DamageCard kind="sheetrock" label="SHEETROCK" />
			</Sticker>,
		);
		if (f >= BEATS.rafters) {
			fx.push(
				<Sticker key="rf" x={805} y={445} local={f - BEATS.rafters} out={out} rot={6} seed="rf" frame={f}>
					<DamageCard kind="rafters" label="RAFTERS" />
				</Sticker>,
			);
		}
	}

	// BOARD 2: inspection checklist, then "saving you thousands" (covers their photos + counter)
	if (inRange(f, BOARD2_WIN[0], BOARD2_WIN[1] + 3)) {
		const b = boxToScreen(BOARD2_BOX, zoom);
		const money = f >= BEATS.saving;
		fx.push(
			<Board key="b2" x={b.x} y={b.y} w={b.w} h={b.h} local={f - BOARD2_WIN[0]} out={f - BOARD2_WIN[1]} seed="board2" frame={f}>
				{!money ? (
					<>
						<div style={{position: 'absolute', left: b.w / 2, top: b.h * 0.2, transform: `translate(-50%, -50%) rotate(${-2 + wob('t2', f, 0.4, 4)}deg)`}}>
							<TitleTape text="Full Inspection" size={104} local={f - BOARD2_WIN[0]} seed="tt-insp" full />
						</div>
						<div style={{position: 'absolute', left: b.w * 0.12, top: b.h * 0.4, display: 'flex', flexDirection: 'column', gap: 26, background: C.paper, padding: '26px 40px', transform: `rotate(${1.5 + wob('cl', f, 0.4, 4)}deg)`, boxShadow: '0 10px 14px rgba(0,0,0,0.3)'}}>
							<CheckRow text="problem areas" tick={f - BEATS.problematic} />
							<CheckRow text="no future problems" tick={f - BEATS.problems} />
						</div>
					</>
				) : (
					<>
						<Sticker x={b.w / 2} y={b.h * 0.55} local={f - BEATS.thousands + 1} rot={-4} seed="money" frame={f} edge={C.white}>
							<MoneyNote w={b.w * 0.7} />
						</Sticker>
						<Sticker x={b.w * 0.3} y={b.h * 0.17} local={f - BEATS.saving} rot={-7} seed="savtag" frame={f} edge={false}>
							<HandTag text="saving you" size={84} />
						</Sticker>
					</>
				)}
			</Board>,
		);
	}

	// AFTER: GOOD TO GO stamp over the new framing
	if (inRange(f, BEATS.good, TL.segments[7].end + 3)) {
		fx.push(
			<Sticker key="stamp" x={790} y={500} local={f - BEATS.good} out={f - TL.segments[7].end} rot={-12} seed="stamp" frame={f} edge={false}>
				<Stamp text={'GOOD\nTO GO'} size={330} />
			</Sticker>,
		);
	}

	// CTA: one icon per way to reach them
	if (inRange(f, BEATS.call, END)) {
		(
			[
				['call', BEATS.call, 195],
				['link', BEATS.link, 425],
				['text', BEATS.text, 655],
				['office', BEATS.office, 885],
			] as const
		).forEach(([k, at, x], i) =>
			fx.push(
				<Sticker key={k} x={x} y={330 + (i % 2) * 24} local={f - at} rot={i % 2 ? 6 : -6} seed={`ic${k}`} frame={f}>
					<ActionIcon kind={k} size={170} />
				</Sticker>,
			),
		);
	}

	// CTA: their text-message notification, rebuilt as our own sticker on top of it
	if (inRange(f, BUBBLE_WIN[0], BUBBLE_WIN[1] + 3)) {
		const b = boxToScreen([118, 648, 652, 800], zoom);
		fx.push(
			<Sticker key="bubble" x={b.x + b.w / 2} y={b.y + b.h / 2} local={f - BUBBLE_WIN[0] + 3} out={f - BUBBLE_WIN[1]} rot={-2} seed="bubble" frame={f} wobble={0.5}>
				<div style={{width: b.w + 20, height: b.h + 16, background: C.white, borderRadius: 34, display: 'flex', alignItems: 'flex-end', gap: 24, padding: '0 34px 22px', boxSizing: 'border-box'}}>
					<ActionIcon kind="text" size={96} />
					<div style={{fontFamily: FONT.sans, fontWeight: 800, fontSize: 44, color: C.ink, lineHeight: 1.15}}>Can someone come check my roof?</div>
				</div>
			</Sticker>,
		);
	}

	// ---- caption: ink tape strip over the old caption zone ------------------
	let caption: React.ReactNode = null;
	let hookTape: React.ReactNode = null;
	const ci = chunkIndexAt(f);
	if (r && ci >= 0) {
		const chunk = TL.chunks[ci];
		const inHook = f < TL.segments[0].end;
		const inBoard2 = inRange(f, BOARD2_WIN[0], BOARD2_WIN[1]);
		const box = inBoard2 ? [140, 866, 590, 952] : r[2];
		let cx = 540;
		let cy = toScreen(360, 640, zoom).y;
		let cover = null;
		let capScale = 1;
		if (inHook) {
			cy = 1170;
		} else if (isEnd) {
			cy = 1290;
		} else if (inRange(f, BOARD1_WIN[0], TL.segments[1].end)) {
			cy = toScreen(360, BOARD1_BOX[3], zoom).y + 100;
			capScale = 0.85;
		} else if (box) {
			const a = toScreen(box[0], box[1], zoom);
			const q = toScreen(box[2], box[3], zoom);
			cx = (a.x + q.x) / 2;
			cy = (a.y + q.y) / 2;
			cover = {x0: a.x, y0: a.y, x1: q.x, y1: q.y};
		}
		const hideHero = !!bw && !!bw.word && chunk.words.some((w) => w.emph && bw.word.toLowerCase().replace(/[^a-z]/g, '').startsWith(w.w.toLowerCase().replace(/[^a-z]/g, '')));
		caption = <MixedCaption chunk={chunk} index={ci} frame={f} cx={cx} cy={cy} cover={cover} hideHero={hideHero} showAll={ci === 0} scale={capScale} />;
		if (inHook) {
			// covers their caption zone AND their orange "WATER DAMAGE" (src y 552-690)
			const a = toScreen(90, 548, zoom);
			const q = toScreen(650, 694, zoom);
			hookTape = (
				<div style={{position: 'absolute', left: 540, top: (a.y + q.y) / 2, transform: `translate(-50%, -50%) rotate(${-2 + wob('hook', f, 0.4, 4)}deg)`}}>
					<div style={{minWidth: q.x - a.x + 60, minHeight: q.y - a.y + 30, display: 'flex', justifyContent: 'center', alignItems: 'center', background: C.inkDeep, clipPath: tornPct('hooktape', 8, 20)}}>
						<TitleTape text="Water Damage" size={140} local={f} seed="tt-hook" full pad="0px 30px 18px" />
					</div>
				</div>
			);
		}
	}

	// ---- finish: grain + vignette -------------------------------------------
	const finish = (
		<>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.3) 100%)'}} />
			<AbsoluteFill style={{mixBlendMode: 'overlay', opacity: 0.2}}>
				<Img src={staticFile('img/grain.png')} style={{width: 1080, height: 1920, transform: `translate(${wob('gx', f, 30, 2)}px, ${wob('gy', f, 30, 2)}px) scale(1.06)`}} />
			</AbsoluteFill>
		</>
	);

	// red flash frame into the end card
	const flash = f >= END && f < END + 2 ? <AbsoluteFill style={{background: C.red, opacity: f === END ? 0.9 : 0.4}} /> : null;

	return (
		<AbsoluteFill style={{background: C.inkDeep}}>
			{scene}
			{isEnd ? <EndCard local={f - END} frame={f} /> : null}
			{fx}
			{hookTape}
			{caption}
			{finish}
			{flash}
		</AbsoluteFill>
	);
};
