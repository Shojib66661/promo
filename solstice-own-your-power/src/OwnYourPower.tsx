import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {TL, chunkIndexAt, row, segment, wordFrame, zoomAt} from './lib/timeline';
import {C, outline, wob} from './lib/brand';
import {SrcFrame} from './components/Source';
import {Camera, PrintPlane} from './components/Camera';
import {MixedCaption} from './components/Caption';
import {
	Battery,
	BehindWord,
	CheckBadge,
	Checklist,
	GearBox,
	HandTag,
	HouseThink,
	InfoBubble,
	MarkerStroke,
	PhoneDoodle,
	PhoneStrip,
	PhotoPrint,
	PowerTower,
	ShieldBadge,
	StarBurst,
	Stamp,
	Sticker,
	Stopwatch,
	Sun,
	TexasShape,
	UtilityBill,
} from './components/Graphics';
import {LogoCard} from './components/Logo';
import {EndCard} from './components/EndCard';

// ---------------------------------------------------------------------------
// Beat sheet: every graphic is keyed to the word that triggers it.
// One continuous selfie take, reframed 9:16 (face fills the frame), so the
// mixed-media moments shrink the frame into a B&W print on the navy backdrop
// (PrintPlane) with his colour cutout + a giant word behind his head.
// ---------------------------------------------------------------------------
const W = wordFrame;
const BEATS = {
	utility: W('hook', 'utility'),
	rising: W('hook', 'rising'),
	have: W('hook', 'have'),
	homeowners: W('own', 'homeowners'),
	to: W('own', 'to', 1), // "to own" (not "looking to do")
	power: W('own', 'power.'),
	behind: W('behind', 'Behind'),
	eg4: W('behind', 'EG4'),
	bought: W('behind', 'bought'),
	solstice: W('behind', 'Solstice'),
	yes: W('yes', 'yes,'),
	after: W('easy', 'After'),
	full: W('easy', 'full'),
	commissioning: W('easy', 'commissioning'),
	easy: W('easy', 'easy.'),
	phone: W('phone', 'phone'),
	n27: W('phone', '27'),
	operational: W('phone', 'operational'),
	running: W('phone', 'running.'),
	licensed: W('licensed', 'licensed'),
	registered: W('licensed', 'registered'),
	here: W('licensed', 'here'),
	texas: W('licensed', 'Texas'),
	happy: W('happy', 'happy'),
	information: W('happy', 'information'),
	setup: W('setup', 'setup'),
	squared: W('setup', 'squared'),
	call: W('call', 'call'),
	give: W('call', 'Give'),
	number: W('call', '832-721-2339.'),
};
const SEG = {own: segment('own'), phone: segment('phone'), happy: segment('happy')};

const inRange = (f: number, a: number, b: number) => f >= a && f < b;

/** Print-mode moments: B&W print, colour cutout with a cyan outline, word behind his head. */
const BW = [
	{a: 0, b: BEATS.have, word: 'Rising', y: 360, size: 300, local0: -20, star: true},
	{a: BEATS.to, b: SEG.own.end, word: 'Power', y: 360, size: 300, local0: 0, star: false},
	{a: BEATS.n27 - 2, b: BEATS.operational - 6, word: '27 minutes', y: 380, size: 196, local0: 0, star: true},
	{a: BEATS.here, b: SEG.happy.start + 18, word: 'Texas', y: 360, size: 300, local0: 0, star: false},
];

const CAP_Y = 1430;

export const OwnYourPower: React.FC = () => {
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
		scene = bw ? (
			<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #0f3a63 0%, ${C.navyDeep} 80%)`}}>
				<PrintPlane border>
					<Camera zoom={zoom}>
						<SrcFrame frame={src} style={{filter: 'grayscale(1) contrast(1.3) brightness(1.05)'}} />
					</Camera>
				</PrintPlane>
				{bw.star ? <StarBurst x={540} y={980} r={470} local={f - bw.a - bw.local0} frame={f} color={C.cyan} edge={C.white} /> : null}
				<BehindWord text={bw.word} x={540} y={bw.y} size={bw.size} local={f - bw.a - bw.local0} frame={f} />
				<PrintPlane style={{filter: outline(C.cyan, 6)}}>
					<Camera zoom={zoom}>
						<SrcFrame frame={src} cutout />
					</Camera>
				</PrintPlane>
				{/* masking tape on the print */}
				<div style={{position: 'absolute', left: 120, top: 150, width: 190, height: 52, background: 'rgba(232,226,200,0.85)', transform: 'rotate(-38deg)'}} />
				<div style={{position: 'absolute', left: 790, top: 1600, width: 190, height: 52, background: 'rgba(232,226,200,0.85)', transform: 'rotate(-30deg)'}} />
			</AbsoluteFill>
		) : (
			<AbsoluteFill>
				<Camera zoom={zoom}>
					<SrcFrame frame={src} style={{filter: 'saturate(1.06) contrast(1.05)'}} />
				</Camera>
			</AbsoluteFill>
		);
	}

	// ---- graphics (in front of the video, behind the caption) ---------------
	const fx: React.ReactNode[] = [];
	const seg = (id: string) => segment(id);
	// hook: bill (on screen from frame 0 for the thumbnail) + utility tower
	if (inRange(f, 0, seg('hook').end)) {
		fx.push(
			<Sticker key="bill" x={250} y={1060} local={f + 10} rot={-8} seed="bill" frame={f}>
				<UtilityBill rise={f - BEATS.rising} frame={f} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.utility, seg('hook').end)) {
		fx.push(
			<Sticker key="tower" x={880} y={1010} local={f - BEATS.utility} rot={6} seed="tower" frame={f}>
				<PowerTower size={210} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.have, seg('hook').end)) {
		fx.push(
			<Sticker key="noctl" x={790} y={560} local={f - BEATS.have} rot={7} seed="noctl" frame={f}>
				<HandTag text="no control" size={76} color={C.warn} />
			</Sticker>,
		);
	}
	// own: homeowners -> house; power -> sun
	if (inRange(f, BEATS.homeowners, BEATS.to)) {
		fx.push(
			<Sticker key="house" x={820} y={560} local={f - BEATS.homeowners} rot={6} seed="house" frame={f}>
				<HouseThink size={250} frame={f} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.power - 4, SEG.own.end)) {
		fx.push(
			<Sticker key="sun" x={860} y={1060} local={f - BEATS.power + 4} rot={8} seed="sun" frame={f}>
				<Sun size={230} frame={f} />
			</Sticker>,
		);
	}
	// behind: the full landscape shot of the system as a taped print + label
	if (inRange(f, BEATS.behind, BEATS.bought)) {
		fx.push(
			<Sticker key="sys" x={540} y={640} scale={0.86} local={f - BEATS.behind} rot={-3} seed="sys" frame={f} edge={C.cyan} out={f - BEATS.bought + 3}>
				<PhotoPrint src="img/system.jpg" w={820} h={489} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.eg4, BEATS.bought)) {
		fx.push(
			<Sticker key="eg4" x={300} y={300} local={f - BEATS.eg4} rot={-6} seed="eg4" frame={f} out={f - BEATS.bought + 3}>
				<HandTag text="EG4 system" size={74} />
			</Sticker>,
			<MarkerStroke key="eg4arrow" d="M 450 330 C 560 330, 640 380, 700 470 M 660 452 L 702 474 L 712 426" local={f - BEATS.eg4 - 4} dur={8} width={12} color={C.sun} />,
		);
	}
	if (inRange(f, BEATS.bought, BEATS.solstice)) {
		fx.push(
			<Sticker key="box" x={820} y={560} local={f - BEATS.bought} rot={7} seed="box" frame={f}>
				<GearBox size={240} />
			</Sticker>,
			<Sticker key="boxtag" x={330} y={520} local={f - BEATS.bought - 6} rot={-5} seed="boxtag" frame={f}>
				<HandTag text="homeowner bought it" size={60} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.solstice - 2, seg('behind').end)) {
		fx.push(
			<Sticker key="logo1" x={540} y={470} local={f - BEATS.solstice + 2} rot={-2} seed="logo1" frame={f}>
				<LogoCard h={130} />
			</Sticker>,
		);
	}
	// yes
	if (inRange(f, BEATS.yes, seg('yes').end)) {
		fx.push(
			<Sticker key="yes" x={820} y={560} local={f - BEATS.yes} rot={8} seed="yes" frame={f}>
				<CheckBadge size={220} local={f - BEATS.yes} />
			</Sticker>,
		);
	}
	// easy: checklist ticks on full install / commissioning / easy
	if (inRange(f, BEATS.after, seg('easy').end)) {
		fx.push(
			<Sticker key="list" x={540} y={520} local={f - BEATS.after} rot={-3} seed="list" frame={f}>
				<Checklist
					items={[
						{label: 'Full install', t: f - BEATS.full - 6},
						{label: 'Commissioning', t: f - BEATS.commissioning - 6},
						{label: 'Very, very easy', t: f - BEATS.easy},
					]}
				/>
			</Sticker>,
		);
	}
	// phone -> 27 minutes (print mode) -> battery + stamp
	if (inRange(f, BEATS.phone, BEATS.n27 - 2)) {
		fx.push(
			<Sticker key="phone" x={830} y={560} local={f - BEATS.phone} rot={8} seed="phone" frame={f}>
				<PhoneDoodle size={230} frame={f} />
			</Sticker>,
			<Sticker key="sup" x={300} y={560} local={f - BEATS.phone - 6} rot={-6} seed="sup" frame={f}>
				<HandTag text="EG4 support" size={66} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.n27 + 4, BEATS.operational - 6)) {
		fx.push(
			<Sticker key="watch" x={190} y={1060} local={f - BEATS.n27 - 4} rot={-8} seed="watch" frame={f}>
				<Stopwatch size={220} frame={f} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.operational, SEG.phone.end)) {
		fx.push(
			<Sticker key="batt" x={820} y={540} local={f - BEATS.operational} rot={6} seed="batt" frame={f}>
				<Battery size={240} local={f - BEATS.operational - 2} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.running, SEG.phone.end)) {
		fx.push(
			<Sticker key="run" x={330} y={700} local={f - BEATS.running} rot={-8} seed="run" frame={f} edge={false}>
				<Stamp text="UP & RUNNING" size={62} />
			</Sticker>,
		);
	}
	// licensed: shield + license number from their bio; Texas (print mode) with Houston pin
	if (inRange(f, BEATS.licensed, BEATS.here)) {
		fx.push(
			<Sticker key="shield" x={810} y={600} local={f - BEATS.licensed} rot={5} seed="shield" frame={f}>
				<ShieldBadge size={250} label="LICENSED" sub="TECL #35546" subLocal={f - BEATS.registered} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.texas, SEG.happy.start + 18)) {
		fx.push(
			<Sticker key="tx" x={850} y={1080} local={f - BEATS.texas} rot={-6} seed="tx" frame={f}>
				<TexasShape w={260} pin={f - BEATS.texas - 5} />
			</Sticker>,
		);
	}
	// happy -> sun; information -> info bubble
	if (inRange(f, BEATS.happy, BEATS.information)) {
		fx.push(
			<Sticker key="sun2" x={830} y={560} local={f - BEATS.happy} rot={-6} seed="sun2" frame={f}>
				<Sun size={230} frame={f} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.information, seg('happy').end)) {
		fx.push(
			<Sticker key="info" x={250} y={560} local={f - BEATS.information} rot={-8} seed="info" frame={f}>
				<InfoBubble size={190} />
			</Sticker>,
		);
	}
	// setup -> small print of the system; squared away -> check
	if (inRange(f, BEATS.setup, BEATS.squared)) {
		fx.push(
			<Sticker key="sys2" x={560} y={560} local={f - BEATS.setup} rot={4} seed="sys2" frame={f} edge={C.cyan}>
				<PhotoPrint src="img/system.jpg" w={600} h={358} />
			</Sticker>,
		);
	}
	if (inRange(f, BEATS.squared, seg('setup').end)) {
		fx.push(
			<Sticker key="sq" x={820} y={560} local={f - BEATS.squared} rot={-6} seed="sq" frame={f}>
				<CheckBadge size={210} local={f - BEATS.squared} />
			</Sticker>,
		);
	}
	// call: logo card + phone pill (replaces the number caption)
	if (inRange(f, BEATS.call - 2, TL.endCardStart)) {
		fx.push(
			<Sticker key="logo2" x={540} y={430} local={f - BEATS.call + 2} rot={-2} seed="logo2" frame={f}>
				<LogoCard h={140} />
			</Sticker>,
		);
	}
	const numberUp = inRange(f, BEATS.number - 2, TL.endCardStart);
	if (numberUp) {
		fx.push(
			<Sticker key="num" x={540} y={CAP_Y} scale={1 / 1.4} local={f - BEATS.number + 2} rot={-2} seed="num" frame={f}>
				<PhoneStrip number="832-721-2339" size={92} />
			</Sticker>,
		);
	}

	// ---- caption ------------------------------------------------------------
	let caption: React.ReactNode = null;
	const ci = chunkIndexAt(f);
	if (!isEnd && r && ci >= 0 && !numberUp) {
		const chunk = TL.chunks[ci];
		const hideHero = !!bw && chunk.words.some((w) => w.emph && bw.word.toLowerCase().startsWith(w.w.toLowerCase().replace(/[^a-z0-9]/g, '')));
		const glow = {x0: 200, y0: CAP_Y - 60, x1: 880, y1: CAP_Y + 60};
		caption = <MixedCaption chunk={chunk} index={ci} frame={f} cx={540} cy={CAP_Y} glow={glow} hideHero={hideHero} showAll={ci === 0} />;
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

	// cyan flash frame into the end card
	const flash = f >= TL.endCardStart && f < TL.endCardStart + 2 ? <AbsoluteFill style={{background: C.cyan, opacity: f === TL.endCardStart ? 0.9 : 0.4}} /> : null;

	return (
		<AbsoluteFill style={{background: C.navyDeep}}>
			{scene}
			{fx}
			{caption}
			{finish}
			{flash}
		</AbsoluteFill>
	);
};
