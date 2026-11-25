// Mascot motion guide comp. Run: node apps/preview/.impeccable/mocks/mascot-motion/mascot-motion.mjs
import { readFileSync, writeFileSync } from "node:fs";

const R = new URL("../../../../../", import.meta.url).pathname.replace(/\/$/, "");
const tokens = readFileSync(`${R}/packages/ui/src/tokens/tokens.css`, "utf8");
const font = (f) => `${R}/packages/ui/src/fonts/inter/${f}`;
const b64 = (f) => readFileSync(font(f)).toString("base64");

// The library markup has no part hooks yet. This comp loads the library drawing source,
// wraps each part in a pivot group (feet, arms, torso, face, badge) and renders it.
// The same hooks would be added to the design-system source (scripts/squadmates).
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
const SRC = `${R}/packages/ui/src/squadmates`;
const tmp = mkdtempSync(`${tmpdir()}/mm-`);
const P = (x, y, cls, inner) => `<g transform="translate(${x} ${y})"><g class="${cls}"><g transform="translate(${-x} ${-y})">${inner}</g></g></g>`;
globalThis.__mmP = P;
let mascots = readFileSync(`${SRC}/mascots.ts`, "utf8");
const ret = "return boots + leftArm + rightArm + body + overlay + leftHand + face + prop + hand(rightX, rightY + 7);";
if (!mascots.includes(ret)) throw new Error("mascots.ts changed; update the hook patch");
mascots = mascots.replace(
	ret,
	`const P = globalThis.__mmP; const cut = boots.indexOf('<g transform="translate(181 302)');
		const torso = P(108, 192, raisedLeft ? "mm-arm-l mm-raised" : "mm-arm-l", leftArm) + P(207, 186, "mm-arm-r", rightArm) + body + overlay + P(108, 192, raisedLeft ? "mm-arm-l mm-raised" : "mm-arm-l", leftHand) + P(faceX, faceY, "mm-face", face) + P(207, 186, "mm-arm-r", prop + hand(rightX, rightY + 7));
		return P(150, 345, "mm-all", P(119, 320, "mm-foot-l", boots.slice(0, cut)) + P(181, 320, "mm-foot-r", boots.slice(cut)) + P(150, 300, "mm-torso", torso));`,
);
writeFileSync(`${tmp}/mascots.ts`, mascots);
writeFileSync(`${tmp}/roster.ts`, readFileSync(`${SRC}/roster.ts`, "utf8"));
writeFileSync(`${tmp}/draw.ts`, readFileSync(`${SRC}/draw.ts`, "utf8").replaceAll('.js"', '.ts"'));
const { squadmateMarkup } = await import(`${tmp}/draw.ts`);
const { SQUADMATES } = await import(`${tmp}/roster.ts`);
const ROLE = Object.fromEntries(SQUADMATES.map((m) => [m.name.toLowerCase(), m.id]));

let uid = 0;
function mascot(slug, state, size) {
	const n = ++uid;
	const raw = squadmateMarkup(ROLE[slug], state, size).replaceAll(`sm-${slug}-`, `sm-${slug}${n}-`);
	const lines = raw.split("\n");
	const badge = lines.slice(2, -1).join("");
	return [lines[0].replace("<svg ", `<svg class="mm" data-state="${state}" `), lines[1].replace(/<ellipse([^>]*floor\)")/, '<ellipse class="mm-shadow"$1'), badge ? `<g class="mm-badge">${badge}</g>` : "", "</svg>"].join("\n");
}

const STATES = [
	{ id: "idle", kind: "Loop", motion: "Breathe, look around, wave", spec: "Body squash 2.5%, 3 s. Face glances left and right, 7 s. Right arm waves twice every 5 s. Blink every 4.8 s.", why: "Friendly and present." },
	{ id: "waiting", kind: "Loop", motion: "Sway and tap a foot", spec: "Body sways ±3°, 3.2 s. Right foot taps every 1.1 s. Face glances, 6 s.", why: "Ready for the next job." },
	{ id: "planning", kind: "Loop", motion: "Think, hand to chin", spec: "Face tilts up 7°, 2.4 s. Left arm lifts 14°. Thought dots pop up one by one, 1.8 s, 300 ms stagger.", why: "Working it out." },
	{ id: "running", kind: "Loop", motion: "March in place", spec: "Body bobs 12 units, 0.5 s. Feet step in turn, arms swing ±16°, 1 s. Shadow pulses with the bob.", why: "Busy and moving." },
	{ id: "checking", kind: "Loop", motion: "Lean in and scan", spec: "Body leans 3–5°. Face scans side to side, 1.6 s. Right arm holds its tool up.", why: "Looking hard at the work." },
	{ id: "done", kind: "Once", motion: "Jump and cheer", spec: "Squash, jump 70 units, stretch, land, settle, 1.1 s. Both arms go up 60–72°. Badge spins in with an overshoot.", why: "A real win." },
	{ id: "sentback", kind: "Once + loop", motion: "Deflate, then sigh", spec: "Small rise then droop 10 units, arms drop 12°, face hangs 6°, 600 ms. Then a sigh every 4 s.", why: "Disappointed, will try again." },
	{ id: "blocked", kind: "Loop", motion: "Tap impatiently", spec: "Right foot double-taps, 0.9 s. Badge beats twice every 2 s.", why: "Waiting on a person." },
	{ id: "escalated", kind: "Loop", motion: "Wave for help", spec: "Shake ±9 units then hop 22, 1.4 s. Arms flail ±50°, 0.35 s. Badge ring expands, 1.4 s.", why: "Needs you now." },
	{ id: "dropped", kind: "Loop", motion: "Snore and nod off", spec: "Deep breath 3.5%, 4 s. Head nods down and jerks back once per breath. Each z drifts up and grows, 3 s.", why: "Fast asleep." },
];

const css = `
@font-face{font-family:Inter;src:url(data:font/woff2;base64,${b64("Inter-Regular.woff2")}) format("woff2");font-weight:400}
@font-face{font-family:Inter;src:url(data:font/woff2;base64,${b64("Inter-Medium.woff2")}) format("woff2");font-weight:500}
@font-face{font-family:Inter;src:url(data:font/woff2;base64,${b64("Inter-SemiBold.woff2")}) format("woff2");font-weight:600}
${tokens}
*{box-sizing:border-box}html,body{margin:0}
body{background:var(--ts-canvas);color:var(--ts-text);font-family:Inter,system-ui,sans-serif;font-size:14px;line-height:1.55;-webkit-font-smoothing:antialiased}
main{max-width:1180px;margin-inline:auto;padding:48px 32px 96px}
h1{font-size:40px;line-height:1.1;letter-spacing:-.02em;margin:0 0 12px;color:var(--ts-text-emphasis);font-weight:600}
h2{font-size:22px;margin:56px 0 6px;color:var(--ts-text-emphasis);font-weight:600;letter-spacing:-.01em}
h3{font-size:14px;margin:0;color:var(--ts-text-emphasis);font-weight:600}
.lede{font-size:17px;color:var(--ts-text-secondary);max-width:62ch;margin:0}
.sub{color:var(--ts-text-secondary);margin:0 0 20px;max-width:70ch}
.eyebrow{font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--ts-text-secondary);margin-bottom:10px}
.bar{display:flex;gap:8px;margin-top:24px;flex-wrap:wrap}
button{font:inherit;font-weight:500;border:1px solid var(--ts-border);background:var(--ts-surface);color:var(--ts-text-emphasis);border-radius:999px;padding:7px 14px;cursor:pointer}
button[aria-pressed="true"]{background:var(--ts-text-emphasis);color:var(--ts-surface);border-color:transparent}
.rules{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.rule{background:var(--ts-surface);border:1px solid var(--ts-border-subtle);border-radius:16px;padding:18px}
.rule p{margin:6px 0 0;color:var(--ts-text-secondary)}
.rule b.n{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:999px;background:var(--ts-surface-tertiary);font-size:12px;margin-bottom:10px}
.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.card{background:var(--ts-surface);border:1px solid var(--ts-border-subtle);border-radius:16px;padding:14px 14px 16px;display:flex;flex-direction:column;gap:8px}
.stage{display:grid;place-items:center;height:150px;border-radius:12px;background:var(--ts-surface-secondary)}
.card .k{font-size:11px;font-weight:600;color:var(--ts-text-secondary);border:1px solid var(--ts-border-subtle);border-radius:999px;padding:1px 8px;align-self:flex-start}
.card p{margin:0;font-size:12.5px;color:var(--ts-text-secondary);line-height:1.5}
.card .why{color:var(--ts-text);font-weight:500}
table{width:100%;border-collapse:collapse;background:var(--ts-surface);border-radius:16px;overflow:hidden;border:1px solid var(--ts-border-subtle)}
th,td{text-align:start;padding:11px 14px;border-block-end:1px solid var(--ts-border-subtle);vertical-align:top;font-size:13px}
th{font-size:12px;color:var(--ts-text-secondary);font-weight:600;background:var(--ts-surface-secondary)}
tr:last-child td{border:0}
code{font-family:var(--ts-font-mono);font-size:12px;background:var(--ts-surface-tertiary);padding:1px 5px;border-radius:5px}
.sizes{display:flex;align-items:flex-end;gap:28px;background:var(--ts-surface);border:1px solid var(--ts-border-subtle);border-radius:16px;padding:24px}
.sizes figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:8px;font-size:12px;color:var(--ts-text-secondary)}
.flow{display:grid;grid-template-columns:220px 1fr;gap:24px;align-items:center;background:var(--ts-surface);border:1px solid var(--ts-border-subtle);border-radius:16px;padding:24px}
.flow .stage{height:200px}
.steps{display:flex;gap:6px;flex-wrap:wrap}
.steps span{font-size:12px;padding:4px 10px;border-radius:999px;background:var(--ts-surface-secondary);color:var(--ts-text-secondary);transition:background var(--ts-duration-enter) var(--ts-ease-enter),color var(--ts-duration-enter)}
.steps span.on{background:var(--ts-text-emphasis);color:var(--ts-surface)}
.swap{position:relative;width:160px;height:160px}
.swap svg{position:absolute;inset:0;transition:opacity var(--ts-duration-enter) var(--ts-ease-enter)}
.dd{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.dd div{background:var(--ts-surface);border:1px solid var(--ts-border-subtle);border-radius:16px;padding:18px}
.dd ul{margin:8px 0 0;padding-inline-start:18px;color:var(--ts-text-secondary)}
.dd li{margin-block:4px}
.dd h3.do{color:var(--ts-success-surface-text, #00a240)}.dd h3.dont{color:var(--ts-danger-surface-text, #e5484d)}

/* ---- Motion. Part hooks: .mm-all (pivot at the feet), .mm-torso, .mm-foot-l/r, .mm-arm-l/r (pivot at the shoulder), .mm-face, .mm-badge, .mm-shadow, .sm-blink. Units are drawing units (about 6 per px at 64 px). ---- */
.mm{overflow:visible}
.mm .mm-all,.mm .mm-torso,.mm [class^="mm-foot"],.mm [class^="mm-arm"],.mm .mm-face{transform-origin:0 0}
.mm .mm-badge,.mm .mm-shadow{transform-box:fill-box;transform-origin:center}
.sm-blink{transform-box:fill-box;transform-origin:center;animation:sm-blink 4.8s infinite}
@keyframes sm-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}

/* shared */
@keyframes mm-breathe{50%{transform:scale(1.025,.975)}}
@keyframes mm-look{0%,30%{transform:none}40%,60%{transform:translateX(-7px)}70%,85%{transform:translateX(6px)}100%{transform:none}}
@keyframes mm-wave{0%,48%,100%{transform:none}54%,66%,78%{transform:rotate(-34deg)}60%,72%{transform:rotate(-14deg)}}
@keyframes mm-tap{0%,40%,100%{transform:none}20%{transform:rotate(-16deg)}}
@keyframes mm-sway{50%{transform:rotate(3deg)}0%,100%{transform:rotate(-3deg)}}
@keyframes mm-shadow-pulse{50%{transform:scaleX(.8);opacity:.55}}
/* planning */
@keyframes mm-think{0%,100%{transform:none}50%{transform:translateY(-8px) rotate(-7deg)}}
@keyframes mm-chin{0%,100%{transform:none}50%{transform:rotate(14deg)}}
@keyframes mm-dot{0%,10%{opacity:0;transform:translateY(6px) scale(.4)}30%{opacity:1;transform:translateY(-1px) scale(1.15)}40%,80%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-3px)}}
/* running */
@keyframes mm-bob{0%,100%{transform:none}50%{transform:translateY(-12px) scale(.98,1.02)}}
@keyframes mm-step{0%,50%,100%{transform:none}25%{transform:translateY(-24px) rotate(-8deg)}}
@keyframes mm-swing{0%,100%{transform:rotate(-16deg)}50%{transform:rotate(16deg)}}
/* checking */
@keyframes mm-scan{0%,100%{transform:translateX(-10px)}50%{transform:translateX(10px)}}
@keyframes mm-lean{0%,100%{transform:rotate(3deg)}50%{transform:rotate(5deg) translateY(2px)}}
@keyframes mm-hold{0%,100%{transform:rotate(-18deg)}50%{transform:rotate(-24deg)}}
/* done */
@keyframes mm-jump{0%{transform:none}14%{transform:scale(1.08,.9)}36%{transform:translateY(-70px) scale(.94,1.08)}52%{transform:translateY(-74px) scale(1)}68%{transform:scale(1.1,.88)}80%{transform:scale(.97,1.03)}100%{transform:none}}
@keyframes mm-cheer-l{0%,14%,100%{transform:none}36%,60%{transform:rotate(60deg)}}
@keyframes mm-cheer-r{0%,14%,100%{transform:none}36%,60%{transform:rotate(-72deg)}}
@keyframes mm-pop{0%,40%{transform:scale(0) rotate(-90deg)}62%{transform:scale(1.3) rotate(8deg)}78%{transform:scale(.92)}100%{transform:scale(1)}}
@keyframes mm-shadow-jump{36%,52%{transform:scaleX(.55);opacity:.35}68%{transform:scaleX(1.1)}}
/* sent back */
@keyframes mm-droop{0%{transform:none}30%{transform:translateY(-6px)}100%{transform:translateY(10px) scale(1.04,.94)}}
@keyframes mm-hang{to{transform:translateY(10px) rotate(6deg)}}
@keyframes mm-slump-l{to{transform:rotate(-12deg)}}
@keyframes mm-slump-r{to{transform:rotate(12deg)}}
@keyframes mm-sigh{0%,70%,100%{transform:translateY(10px) scale(1.04,.94)}82%{transform:translateY(4px) scale(1.01,.99)}}
/* blocked */
@keyframes mm-impatient{0%,100%{transform:none}25%{transform:rotate(-14deg)}50%{transform:none}75%{transform:rotate(-14deg)}}
@keyframes mm-badge-beat{0%,60%,100%{transform:scale(1)}70%{transform:scale(1.25)}80%{transform:scale(.95)}90%{transform:scale(1.12)}}
/* escalated */
@keyframes mm-alarm{0%,100%{transform:none}10%{transform:translateX(-9px) rotate(-3deg)}20%{transform:translateX(9px) rotate(3deg)}30%{transform:translateX(-7px)}40%{transform:translateX(5px)}50%{transform:none}65%{transform:translateY(-22px)}80%{transform:none}}
@keyframes mm-flail-l{0%,100%{transform:rotate(10deg)}50%{transform:rotate(50deg)}}
@keyframes mm-flail-r{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(-50deg)}}
@keyframes mm-ring{0%{opacity:.7;transform:scale(1)}100%{opacity:0;transform:scale(2.2)}}
/* dropped */
@keyframes mm-snore{50%{transform:scale(1.035,.965)}}
@keyframes mm-nod{0%,55%{transform:none}85%{transform:translateY(12px) rotate(5deg)}90%{transform:translateY(-3px)}100%{transform:none}}
@keyframes mm-z{0%{opacity:0;transform:translate(0,4px) scale(.6)}25%{opacity:1}100%{opacity:0;transform:translate(5px,-10px) scale(1.2)}}

.mm[data-state="idle"] .mm-all{animation:mm-breathe 3s var(--ts-ease-move) infinite}
.mm[data-state="idle"] .mm-arm-r{animation:mm-wave 5s var(--ts-ease-move) infinite}
.mm[data-state="idle"] .mm-face{animation:mm-look 7s var(--ts-ease-move) infinite}

.mm[data-state="waiting"] .mm-all{animation:mm-sway 3.2s var(--ts-ease-move) infinite}
.mm[data-state="waiting"] .mm-foot-r{animation:mm-tap 1.1s var(--ts-ease-move) infinite}
.mm[data-state="waiting"] .mm-face{animation:mm-look 6s var(--ts-ease-move) infinite}

.mm[data-state="planning"] .mm-all{animation:mm-breathe 2.4s var(--ts-ease-move) infinite}
.mm[data-state="planning"] .mm-face{animation:mm-think 2.4s var(--ts-ease-move) infinite}
.mm[data-state="planning"] .mm-arm-l{animation:mm-chin 2.4s var(--ts-ease-move) infinite}
.mm[data-state="planning"] .mm-badge circle{transform-box:fill-box;transform-origin:center;animation:mm-dot 1.8s var(--ts-ease-move) infinite both}
.mm[data-state="planning"] .mm-badge circle:nth-child(2){animation-delay:.3s}

.mm[data-state="running"] .mm-all{animation:mm-bob .5s var(--ts-ease-move) infinite}
.mm[data-state="running"] .mm-foot-l{animation:mm-step 1s var(--ts-ease-move) infinite}
.mm[data-state="running"] .mm-foot-r{animation:mm-step 1s var(--ts-ease-move) -.5s infinite}
.mm[data-state="running"] .mm-arm-l{animation:mm-swing 1s var(--ts-ease-move) infinite}
.mm[data-state="running"] .mm-arm-r{animation:mm-swing 1s var(--ts-ease-move) -.5s infinite}
.mm[data-state="running"] .mm-shadow{animation:mm-shadow-pulse .5s var(--ts-ease-move) infinite}

.mm[data-state="checking"] .mm-all{animation:mm-lean 1.6s var(--ts-ease-move) infinite}
.mm[data-state="checking"] .mm-face{animation:mm-scan 1.6s var(--ts-ease-move) infinite}
.mm[data-state="checking"] .mm-arm-r{animation:mm-hold 1.6s var(--ts-ease-move) infinite}

.mm[data-state="done"] .mm-all{animation:mm-jump 1.1s var(--ts-ease-move) both}
.mm[data-state="done"] .mm-arm-l{animation:mm-cheer-l 1.1s var(--ts-ease-move) both}
.mm[data-state="done"] .mm-arm-r{animation:mm-cheer-r 1.1s var(--ts-ease-move) both}
.mm[data-state="done"] .mm-shadow{animation:mm-shadow-jump 1.1s var(--ts-ease-move) both}
.mm[data-state="done"] .mm-badge{animation:mm-pop .9s var(--ts-ease-enter) both}

.mm[data-state="sentback"] .mm-all{animation:mm-droop .6s var(--ts-ease-exit) both,mm-sigh 4s var(--ts-ease-move) .6s infinite}
.mm[data-state="sentback"] .mm-face{animation:mm-hang .6s var(--ts-ease-exit) both}
.mm[data-state="sentback"] .mm-arm-l{animation:mm-slump-l .6s var(--ts-ease-exit) both}
.mm[data-state="sentback"] .mm-arm-r{animation:mm-slump-r .6s var(--ts-ease-exit) both}

.mm[data-state="blocked"] .mm-foot-r{animation:mm-impatient .9s var(--ts-ease-move) infinite}
.mm[data-state="blocked"] .mm-all{animation:mm-breathe 2.6s var(--ts-ease-move) infinite}
.mm[data-state="blocked"] .mm-badge{animation:mm-badge-beat 2s var(--ts-ease-move) infinite}

.mm[data-state="escalated"] .mm-all{animation:mm-alarm 1.4s var(--ts-ease-move) infinite}
.mm[data-state="escalated"] .mm-arm-l{animation:mm-flail-l .35s var(--ts-ease-move) infinite}
.mm[data-state="escalated"] .mm-arm-r{animation:mm-flail-r .35s var(--ts-ease-move) -.17s infinite}
.mm[data-state="escalated"] .mm-ring{transform-box:fill-box;transform-origin:center;animation:mm-ring 1.4s var(--ts-ease-exit) infinite both}

.mm[data-state="dropped"] .mm-all{animation:mm-snore 4s var(--ts-ease-move) infinite}
.mm[data-state="dropped"] .mm-face{animation:mm-nod 4s var(--ts-ease-move) infinite}
.mm[data-state="dropped"] .mm-badge text{transform-box:fill-box;animation:mm-z 3s var(--ts-ease-move) infinite both}
.mm[data-state="dropped"] .mm-badge text:nth-child(2){animation-delay:1.2s}

/* A raised arm (Petra, Machu) would sweep over the face; it waves from the shoulder instead. */
@keyframes mm-raised-wave{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(6deg)}}
.mm .mm-raised{animation:none!important}
.mm:is([data-state="idle"],[data-state="running"],[data-state="done"],[data-state="escalated"]) .mm-raised{animation:mm-raised-wave .5s var(--ts-ease-move) infinite!important}
/* Below 32 px: face and badge only. */
.mm[width="24"] :is(.mm-all,.mm-torso,[class^="mm-foot"],[class^="mm-arm"]),.mm[width="16"] :is(.mm-all,.mm-torso,[class^="mm-foot"],[class^="mm-arm"]){animation:none!important}
@media (prefers-reduced-motion:reduce){.mm *{animation:none!important}}
.reduce .mm *{animation:none!important}
.paused .mm *{animation-play-state:paused!important}
`;

const ring = '<circle class="mm-ring" cx="53" cy="53" r="8" fill="none" stroke="#e5484d" stroke-width="2"/>';
const withRing = (svg) => svg.replace('<g class="mm-badge">', `<g class="mm-badge">${ring}`);
const card = (s) => {
	let svg = mascot("petra", s.id, 128);
	if (s.id === "escalated") svg = withRing(svg);
	return `<article class="card"><div class="stage">${svg}</div><h3>${s.id === "sentback" ? "Sent back" : s.id[0].toUpperCase() + s.id.slice(1)}</h3><span class="k">${s.kind}</span><p class="why">${s.motion}. ${s.why}</p><p>${s.spec}</p></article>`;
};

const flowStates = ["waiting", "planning", "running", "checking", "sentback", "running", "checking", "done"];
const flowSvgs = [...new Set(flowStates)].map((s) => mascot("pisa", s, 160).replace('class="mm"', `class="mm" data-flow="${s}" style="opacity:0"`)).join("");

const page = `<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mascot motion guide</title><style>${css}</style></head><body><main>
<div class="eyebrow">Design system · Foundations · Motion</div>
<h1>Mascot motion</h1>
<p class="lede">Squadmates act out what they are doing. Each state is a small performance: the whole body, both arms, the feet and the face take part. The timing comes from the motion tokens, and every move stops when the person asks for less motion.</p>
<div class="bar"><button id="replay">Replay one-shots</button><button id="reduce" aria-pressed="false">Reduce motion</button><button id="pause" aria-pressed="false">Pause</button></div>

<h2>Principles</h2>
<p class="sub">Six rules keep the motion lively without making screens noisy.</p>
<div class="rules">
<div class="rule"><b class="n">1</b><h3>Motion means state</h3><p>One signature motion per state. If a person cannot tell the state with the motion off, the drawing is wrong, not the motion.</p></div>
<div class="rule"><b class="n">2</b><h3>Act with the whole body</h3><p>Feet, arms, face and body each have a part. Squash before a jump and stretch in the air. Arms swing from the shoulder, feet step from the heel.</p></div>
<div class="rule"><b class="n">3</b><h3>Energy follows the state</h3><p>Calm states (idle, waiting, dropped) loop slowly over 3–7 s. Busy states (running, checking) move every 0.5–1.6 s. Only Escalated is loud.</p></div>
<div class="rule"><b class="n">4</b><h3>Tokens only</h3><p>State changes use <code>duration-enter</code> 240 ms with <code>ease-enter</code>. Loops use <code>ease-move</code>. Exits use <code>duration-exit</code> 120 ms.</p></div>
<div class="rule"><b class="n">5</b><h3>One performer at a time</h3><p>In a list, only the active or focused squadmate moves. The rest hold their still drawing. Pause off-screen and in hidden tabs.</p></div>
<div class="rule"><b class="n">6</b><h3>Respect reduced motion</h3><p>Under <code>prefers-reduced-motion</code> nothing moves; the drawing and badge carry the state. Below 32 px only the face and badge move.</p></div>
</div>

<h2>The ten states</h2>
<p class="sub">Petra in every state. "Loop" runs while the state lasts. "Once" plays on entry and then holds. Press "Replay one-shots" to see Done again.</p>
<div class="grid">${STATES.map(card).join("")}</div>

<h2>Changing state</h2>
<p class="sub">Pisa runs a task loop. The old drawing fades out over 120 ms while the new one fades in over 240 ms, and the new state's motion starts once the fade ends. The motion never morphs one pose into another.</p>
<div class="flow"><div class="stage"><div class="swap">${flowSvgs}</div></div><div><div class="steps">${flowStates.map((s, i) => `<span data-i="${i}">${s === "sentback" ? "sent back" : s}</span>`).join("")}</div><p class="sub" style="margin-top:14px">Waiting → Planning → Running → Checking → Sent back → Running → Checking → Done. Each step holds for 2.2 s in this demo.</p></div></div>

<h2>Size</h2>
<p class="sub">At 64 px and up the whole body performs. At 32 px the bust crop does the same. At 24 px and below only the face and badge move, so avatars in tables and chat stay calm.</p>
<div class="sizes">${[160, 64, 32, 24, 16].map((s) => `<figure>${mascot("delphi", "running", s)}<figcaption>${s} px</figcaption></figure>`).join("")}${[64, 24].map((s) => `<figure>${withRing(mascot("zurich", "escalated", s))}<figcaption>Escalated ${s} px</figcaption></figure>`).join("")}</div>

<h2>Spec</h2>
<p class="sub">Units are drawing units (about 6 per pixel at 64 px). Each part turns around its own joint: the body around the feet, arms around the shoulder, feet around the heel.</p>
<table><thead><tr><th>State</th><th>Type</th><th>Motion</th><th>Spec</th></tr></thead><tbody>
${STATES.map((s) => `<tr><td><b>${s.id}</b></td><td>${s.kind}</td><td>${s.motion}</td><td>${s.spec}</td></tr>`).join("")}
</tbody></table>

<h2>Do and don't</h2>
<div class="dd"><div><h3 class="do">Do</h3><ul>
<li>Start the new state's motion after the crossfade ends.</li>
<li>Mirror sideways motion in right-to-left layouts.</li>
<li>Keep the badge in place; only scale or fade it.</li>
<li>Pause loops when the mascot leaves the screen.</li>
</ul></div><div><h3 class="dont">Don't</h3><ul>
<li>Flash colours or change the drawing itself during a move.</li>
<li>Animate more than one squadmate in a list at once.</li>
<li>Add motion that changes the meaning of the drawing, such as a smile on Sent back.</li>
<li>Use timers or randomness at module scope to start motion.</li>
</ul></div></div>
</main>
<script>
const root=document.documentElement,replay=document.getElementById("replay"),reduce=document.getElementById("reduce"),pause=document.getElementById("pause");
replay.onclick=()=>document.querySelectorAll('.mm[data-state="done"],.mm[data-state="sentback"],.mm[data-state="escalated"]').forEach(s=>{const p=s.parentNode,n=s.nextSibling;p.removeChild(s);p.insertBefore(s,n)});
const toggle=(b,c)=>{const on=b.getAttribute("aria-pressed")!=="true";b.setAttribute("aria-pressed",on);document.body.classList.toggle(c,on)};
reduce.onclick=()=>toggle(reduce,"reduce");pause.onclick=()=>toggle(pause,"paused");
const flow=${JSON.stringify(flowStates)};let i=0;const show=()=>{const s=flow[i%flow.length];document.querySelectorAll("[data-flow]").forEach(e=>{const on=e.dataset.flow===s;e.style.transition=on?"opacity 240ms cubic-bezier(.19,1,.22,1)":"opacity 120ms cubic-bezier(.8,0,.4,1)";e.style.opacity=on?1:0;if(on){const p=e.parentNode,n=e.nextSibling;p.removeChild(e);p.insertBefore(e,n)}});document.querySelectorAll(".steps span").forEach(e=>e.classList.toggle("on",+e.dataset.i===i%flow.length));i++};show();setInterval(show,2200);
</script></body></html>`;

writeFileSync(new URL("mascot-motion.html", import.meta.url), page);

// Compact preview of the ten states, for showing in chat. Not part of the comp.
if (process.argv[2]) {
	const lite = css.replace(/@font-face\{[^}]+\}/g, "").replace(/body\{background:[^;]+;/, "body{");
	const grid = `<!doctype html><html><head><meta charset="utf-8"><style>${lite}
body{font-family:var(--font-sans,Inter,system-ui)}.grid{grid-template-columns:repeat(5,1fr);gap:8px}.card{padding:8px 8px 10px;gap:4px;border-radius:12px}.stage{height:104px}.card p{font-size:11px}.card .k{font-size:10px}.card h3{font-size:13px}</style></head><body>
<div class="grid">${STATES.map((s) => card(s).replace('width="128" height="128"', 'width="92" height="92"')).join("")}</div>
<script>setInterval(()=>document.querySelectorAll('.mm[data-state="done"],.mm[data-state="sentback"],.mm[data-state="escalated"]').forEach(s=>{const p=s.parentNode,n=s.nextSibling;p.removeChild(s);p.insertBefore(s,n)}),3000)</script></body></html>`;
	writeFileSync(process.argv[2], grid);
}
