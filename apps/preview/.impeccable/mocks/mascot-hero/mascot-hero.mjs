// "Meet the squad" hero for /reference/mascot-states. Run: node apps/preview/.impeccable/mocks/mascot-hero/mascot-hero.mjs
// Poses use the squadmate motion part hooks (SQUADMATE_PARTS, D33) as static transforms.
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";

const R = new URL("../../../../../", import.meta.url).pathname.replace(/\/$/, "");
const tokens = readFileSync(`${R}/packages/ui/src/tokens/tokens.css`, "utf8");
const b64 = (f) => readFileSync(`${R}/packages/ui/src/fonts/inter/${f}`).toString("base64");
const SRC = `${R}/packages/ui/src/squadmates`;
const tmp = mkdtempSync(`${tmpdir()}/hero-`);
for (const f of ["mascots", "roster", "draw"]) writeFileSync(`${tmp}/${f}.ts`, readFileSync(`${SRC}/${f}.ts`, "utf8").replaceAll('.js"', '.ts"'));
const { squadmateMarkup } = await import(`${tmp}/draw.ts`);
const { SQUADMATES } = await import(`${tmp}/roster.ts`);
const BY = Object.fromEntries(SQUADMATES.map((m) => [m.name.toLowerCase(), m]));

// Poses: transforms on the part hooks, in drawing units. Left arm turns up with +deg, right arm with −deg.
const POSES = {
	cheer: { "sm-all": "translateY(-8px)", "sm-arm-l": "rotate(96deg)", "sm-arm-r": "rotate(-60deg)", "sm-face": "translateY(-4px) rotate(-3deg)" },
	jump: { "sm-all": "translateY(-46px) rotate(-3deg)", "sm-arm-l": "rotate(92deg)", "sm-arm-r": "rotate(-55deg)", "sm-foot-l": "rotate(14deg) translateY(-6px)", "sm-foot-r": "rotate(-10deg)", "sm-shadow": "scale(.62)" },
	wave: { "sm-arm-l": "rotate(100deg)", "sm-all": "rotate(2deg)", "sm-face": "rotate(4deg)" },
	hips: { "sm-arm-l": "rotate(-28deg)", "sm-arm-r": "rotate(30deg)", "sm-all": "scale(1.02,.99)" },
	leanIn: { "sm-all": "rotate(7deg)", "sm-face": "rotate(5deg) translateX(4px)", "sm-arm-r": "rotate(-35deg)" },
	leanOut: { "sm-all": "rotate(-7deg)", "sm-face": "rotate(-5deg) translateX(-4px)", "sm-arm-l": "rotate(40deg)" },
	think: { "sm-face": "translateY(-6px) rotate(-8deg)", "sm-arm-l": "rotate(30deg)", "sm-all": "rotate(-2deg)" },
	step: { "sm-foot-r": "translateY(-16px) rotate(-12deg)", "sm-all": "rotate(3deg)", "sm-arm-l": "rotate(60deg)" },
	peek: { "sm-all": "rotate(-9deg) translateX(-6px)", "sm-face": "translateX(-8px) rotate(-6deg)", "sm-arm-r": "rotate(-45deg)" },
	leader: { "sm-arm-r": "rotate(-40deg)", "sm-foot-r": "translateY(-6px) rotate(-6deg)", "sm-face": "rotate(-3deg)" },
};
// Petra and Machu already raise their left arm; Zurich and Rio hold their prop at face height.
const RAISED = new Set(["petra", "machu"]);
const HIGH_GRIP = new Set(["zurich", "rio"]);

// Two staggered rows, like a team photo. Petra leads in the middle of the front row.
const BACK = [
	["giza", "step", "idle"],
	["angkor", "peek", "running"],
	["machu", "cheer", "done"],
	["greenwich", "leanOut", "idle"],
	["alexandria", "jump", "done"],
	["venice", "wave", "done"],
];
const FRONT = [
	["rio", "cheer", "done"],
	["zurich", "wave", "idle"],
	["kyoto", "leanIn", "running"],
	["petra", "leader", "idle"],
	["pisa", "hips", "idle"],
	["delphi", "think", "planning"],
	["sydney", "jump", "done"],
];

let uid = 0;
function mate(slug, pose, state, size) {
	const n = ++uid;
	let svg = squadmateMarkup(BY[slug].id, state, size).replaceAll(`sm-${slug}-`, `sm-${slug}${n}-`);
	// The hero shows characters, not status: drop the state badge, keep Delphi's thought dots.
	if (state !== "planning") svg = svg.replace(/<g class="sm-badge">[\s\S]*?<\/g>\n/, "");
	const pose_ = { ...POSES[pose] };
	if (RAISED.has(slug)) delete pose_["sm-arm-l"];
	if (HIGH_GRIP.has(slug) && pose_["sm-arm-r"]) pose_["sm-arm-r"] = "rotate(-12deg)";
	const rules = Object.entries(pose_)
		.map(([part, t]) => `#hm${n} .${part}{transform:${t}}`)
		.join("");
	return { svg: svg.replace("<svg ", `<svg id="hm${n}" class="hm" `), rules, name: BY[slug].name, role: BY[slug].role };
}

const back = BACK.map(([s, p, st]) => mate(s, p, st, 156));
const front = FRONT.map(([s, p, st]) => mate(s, p, st, s === "petra" ? 214 : 182));
const all = [...back, ...front];

const css = `
@font-face{font-family:Inter;src:url(data:font/woff2;base64,${b64("Inter-Regular.woff2")}) format("woff2");font-weight:400}
@font-face{font-family:Inter;src:url(data:font/woff2;base64,${b64("Inter-SemiBold.woff2")}) format("woff2");font-weight:600}
${tokens}
*{box-sizing:border-box}html,body{margin:0}
body{background:var(--ts-canvas);color:var(--ts-text);font-family:Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.site{height:56px;border-block-end:1px solid var(--ts-border-subtle);background:var(--ts-surface)}
main{max-width:1180px;margin-inline:auto;padding:40px 32px 64px}
.hero{position:relative;border-radius:28px;overflow:hidden;background:
 radial-gradient(120% 70% at 50% 108%,var(--ts-surface-tertiary) 0 38%,transparent 39%),
 linear-gradient(var(--ts-surface),var(--ts-surface-secondary));border:1px solid var(--ts-border-subtle);padding:44px 40px 0}
.hero header{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap}
.eyebrow{font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--ts-text-secondary);margin-bottom:10px}
h1{margin:0;font-size:44px;line-height:1.08;letter-spacing:-.025em;color:var(--ts-text-emphasis);font-weight:600}
.lead{margin:12px 0 0;max-width:52ch;font-size:16px;line-height:1.55;color:var(--ts-text-secondary)}
.count{display:flex;gap:8px}.count span{font-size:13px;padding:6px 12px;border-radius:999px;background:var(--ts-surface-tertiary);color:var(--ts-text-secondary)}
.count b{color:var(--ts-text-emphasis);font-weight:600}
.stage{position:relative;height:392px;margin-top:-28px}
.row{position:absolute;inset-inline:0;display:flex;justify-content:center}
.row.back{bottom:150px;gap:0}
.row.back .who{margin-inline:-6px}
.row.front{bottom:4px;gap:0}
.row.front .who{margin-inline:-22px}.row.front .who:nth-child(4){z-index:2}
.row.back .who{filter:saturate(.92)}
.who{margin:0;position:relative;display:flex;flex-direction:column;align-items:center;outline:none}
.who .tag{position:absolute;bottom:-4px;font-size:12px;font-weight:600;color:var(--ts-text-emphasis);background:var(--ts-surface);border:1px solid var(--ts-border-subtle);border-radius:999px;padding:3px 10px;opacity:0;transform:translateY(4px);transition:opacity var(--ts-duration-enter) var(--ts-ease-enter),transform var(--ts-duration-enter) var(--ts-ease-enter);white-space:nowrap;box-shadow:var(--ts-shadow-sm,0 1px 2px #0001)}
.who .tag small{font-weight:400;color:var(--ts-text-secondary);margin-inline-start:4px}
.who:hover .tag,.who:focus-visible .tag{opacity:1;transform:none}
.row.back .who:nth-child(odd){margin-block-end:14px}
.row.front .who:nth-child(3),.row.front .who:nth-child(5){margin-block-end:10px}
.hm{overflow:visible;display:block}
.hm :is(.sm-all,.sm-torso,.sm-foot-l,.sm-foot-r,.sm-arm-l,.sm-arm-r,.sm-face){transform-origin:0 0;transition:transform 360ms var(--ts-ease-move)}
.hm .sm-shadow{transform-box:fill-box;transform-origin:center}
${all.map((m) => m.rules).join("\n")}
/* A hop passes along the squad, one squadmate at a time. */
@keyframes hop{0%,100%{translate:0 0}40%{translate:0 -10px}70%{translate:0 1px}}
.who.go .hop{animation:hop 560ms var(--ts-ease-move) both}
@media (prefers-reduced-motion:reduce){.who.go .hop{animation:none}.hm *{transition:none}}
.caption{display:flex;justify-content:space-between;align-items:center;gap:16px;border-block-start:1px solid var(--ts-border-subtle);margin-inline:-40px;padding:14px 40px;background:var(--ts-surface);font-size:13px;color:var(--ts-text-secondary)}
.caption a{color:var(--ts-text-emphasis);font-weight:600;text-decoration:none}
.below{margin-top:28px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;opacity:.55}
.below div{height:120px;border-radius:16px;background:var(--ts-surface);border:1px solid var(--ts-border-subtle)}
`;

const figure = (m) => `<figure class="who" tabindex="0"><div class="hop">${m.svg}</div><figcaption class="tag">${m.name}<small>${m.role}</small></figcaption></figure>`;

const page = (theme) => `<!doctype html><html lang="en" data-theme="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Meet the squad</title><style>${css}</style></head><body>
<div class="site"></div>
<main>
<section class="hero" aria-labelledby="t">
<header><div><div class="eyebrow">Design system · Reference</div><h1 id="t">Meet the squad</h1><p class="lead">Thirteen squadmates, each named after a place and each shaped by it. Below, every squadmate in all ten Agent loop states.</p></div>
<div class="count"><span><b>13</b> squadmates</span><span><b>10</b> states</span><span><b>130</b> drawings</span></div></header>
<div class="stage" role="img" aria-label="All thirteen squadmates together: ${all.map((m) => m.name).join(", ")}.">
<div class="row back">${back.map(figure).join("")}</div>
<div class="row front">${front.map(figure).join("")}</div>
</div>
<div class="caption"><span>Hover or focus a squadmate to see its name and role.</span><a href="#states">Jump to the states ↓</a></div>
</section>
<div class="below" id="states"><div></div><div></div><div></div></div>
</main>
<script>
const whos=[...document.querySelectorAll(".row.back .who"),...document.querySelectorAll(".row.front .who")].sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left);
let i=0;const tick=()=>{const w=whos[i%whos.length];w.classList.remove("go");void w.offsetWidth;w.classList.add("go");i++;};
if(!matchMedia("(prefers-reduced-motion: reduce)").matches)setInterval(tick,420);
</script></body></html>`;

writeFileSync(new URL("mascot-hero-light.html", import.meta.url), page("light"));
writeFileSync(new URL("mascot-hero-dark.html", import.meta.url), page("dark"));
