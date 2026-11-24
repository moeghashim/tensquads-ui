import { readFileSync, writeFileSync } from "node:fs";
const R = new URL("../../../../../", import.meta.url).pathname.replace(/\/$/, "");
const tokens = readFileSync(`${R}/packages/ui/src/tokens/tokens.css`, "utf8");
const petra = readFileSync(`${R}/design/mascots/svg/petra.svg`, "utf8").replace(/<\?xml[^>]*>/, "").replace("<svg ", '<svg style="width:26px;height:26px" ');
const P = {
  Button: `<div class="row"><span class="b solid">Continue</span><span class="b soft">Cancel</span></div>`,
  Menu: `<div class="menu"><div>Duplicate</div><div class="hl">Rename</div><div>Archive</div></div>`,
  Tooltip: `<div class="col"><span class="tip">Copied</span><span class="b soft">Copy link</span></div>`,
  Chip: `<div class="row"><span class="chip">◇ response_schema</span></div>`,
  StatTile: `<div class="tile"><small>Orders</small><b>1,284</b><svg width="90" height="22"><polyline points="0,18 22,12 44,15 66,6 90,3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg><em>+12% vs last week</em></div>`,
  BarChart: `<div class="bars">${[9,11,8,14,13,10,12,16].map((h,i)=>`<i style="height:${h*4}px;opacity:${i==7?1:.55}"></i>`).join("")}</div>`,
  Bars: `<div class="hb"><div><span>Growth</span><span>27</span></div><i style="width:84%"></i><div><span>Starter</span><span>5</span></div><i style="width:32%;opacity:.5"></i></div>`,
  DataTable: `<div class="tbl"><div class="th"><span>Order</span><span>Status</span><span>Total</span></div><div><span>#1042</span><span class="ok">Paid</span><span>$42</span></div><div><span>#1041</span><span class="ok">Paid</span><span>$18</span></div><div><span>#1040</span><span class="wait">Open</span><span>$96</span></div></div>`,
  Node: `<div class="node"><span class="dot"></span><div><b>Classify request</b><small>Logic · if-else</small></div></div>`,
  Canvas: `<svg width="200" height="96" viewBox="0 0 200 96"><path d="M54 30 C80 30 80 66 106 66 M54 30 C80 30 80 22 106 22" stroke="currentColor" opacity=".35" fill="none"/><rect x="6" y="18" width="48" height="24" rx="7" class="n"/><rect x="106" y="10" width="62" height="24" rx="7" class="n"/><rect x="106" y="54" width="62" height="24" rx="7" class="n sel"/></svg>`,
  Palette: `<div class="pal"><small>Logic</small><div>⑂ If / else</div><div>↻ While</div><div>✓ User approval</div></div>`,
  Inspector: `<div class="insp"><small>Node</small><div class="f">Title<span>Classify</span></div><div class="f">Kind<span>if-else</span></div></div>`,
};
const groups = [
  ["Actions", "Things a person presses or picks.", [["Button","Primary, soft and ghost actions in three sizes."],["Menu","A list of actions that opens from a trigger."],["Tooltip","A short label on hover and focus."],["Chip","A compact token for a tag, tool or schema."]]],
  ["Data and charts", "Numbers people scan at a glance.", [["StatTile","One number with its trend and sparkline."],["BarChart","Compare values over time."],["Bars","Horizontal shares of a whole."],["DataTable","Sortable rows with status and totals."]]],
  ["Workflow", "The builder for squad workflows.", [["Node","One workflow step with its ports."],["Canvas","Pan, zoom and connect a graph."],["Palette","Drag new steps onto the canvas."],["Inspector","Edit the selected step."]]],
];
const oui = new Set("Button Menu Tooltip Chip StatTile BarChart Bars DataTable".split(" "));
const css = `*{box-sizing:border-box}body{margin:0;background:var(--ts-canvas);color:var(--ts-text);font-family:Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-inline-size:1216px;margin-inline:auto;padding:56px 32px;display:grid;grid-template-columns:200px minmax(0,1fr);gap:48px}
aside{position:sticky;top:24px;align-self:start;font-size:14px}aside h1{font-size:28px;margin:0 0 6px;letter-spacing:-.02em;color:var(--ts-text-emphasis)}aside p{margin:0 0 20px;color:var(--ts-text-secondary);font-size:13px;line-height:1.5}
.search{height:36px;border-radius:10px;border:1px solid var(--ts-border-subtle);background:var(--ts-surface);display:flex;align-items:center;padding-inline:12px;color:var(--ts-text-tertiary);font-size:13px;margin-block-end:20px}
aside a{display:flex;justify-content:space-between;padding:7px 10px;border-radius:8px;color:var(--ts-text-secondary);text-decoration:none}aside a.on{background:var(--ts-surface-tertiary);color:var(--ts-text-emphasis);font-weight:500}aside a span{color:var(--ts-text-tertiary)}
.filters{display:flex;gap:6px;margin-block-start:20px;flex-wrap:wrap}.filters span{font-size:12px;padding:4px 10px;border-radius:999px;border:1px solid var(--ts-border-subtle);color:var(--ts-text-secondary)}.filters span.on{background:var(--ts-text-emphasis);color:var(--ts-text-inverse);border-color:transparent}
section+section{margin-block-start:56px}
.gh{display:flex;align-items:baseline;justify-content:space-between;border-block-end:1px solid var(--ts-border-subtle);padding-block-end:12px;margin-block-end:20px}.gh h2{margin:0;font-size:20px;font-weight:600;color:var(--ts-text-emphasis)}.gh p{margin:0;color:var(--ts-text-tertiary);font-size:13px}
.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
.card{display:flex;flex-direction:column;gap:12px;text-decoration:none;color:inherit}
.stage{aspect-ratio:4/3;border-radius:14px;background:var(--ts-surface);border:1px solid var(--ts-border-subtle);display:grid;place-items:center;overflow:hidden;padding:16px;color:var(--ts-text-emphasis)}
.card:hover .stage{border-color:var(--ts-border-strong)}
.meta b{display:block;font-size:14px;font-weight:600;color:var(--ts-text-emphasis)}.meta p{margin:3px 0 8px;font-size:13px;line-height:1.45;color:var(--ts-text-secondary);min-block-size:38px}
.tags{display:flex;gap:6px}.tags span{font-size:11px;font-weight:500;padding:2px 8px;border-radius:999px;background:var(--ts-surface-tertiary);color:var(--ts-text-secondary)}.tags span.o{background:var(--ts-info-surface);color:var(--ts-info-surface-text)}
.row{display:flex;gap:6px}.col{display:flex;flex-direction:column;align-items:center;gap:6px}
.b{font-size:12px;font-weight:500;padding:6px 12px;border-radius:999px}.b.solid{background:var(--ts-primary-solid);color:var(--ts-text-inverse)}.b.soft{background:var(--ts-surface-tertiary)}
.menu{inline-size:120px;border-radius:10px;background:var(--ts-surface-elevated);box-shadow:var(--ts-shadow-overlay);padding:4px;font-size:12px}.menu div{padding:5px 8px;border-radius:6px}.menu .hl{background:var(--ts-surface-tertiary)}
.tip{font-size:11px;background:var(--ts-primary-solid);color:var(--ts-text-inverse);padding:3px 8px;border-radius:6px}
.chip{font-size:12px;padding:4px 10px;border-radius:999px;background:var(--ts-surface-tertiary)}
.tile{inline-size:130px;font-size:11px;display:flex;flex-direction:column;gap:2px}.tile small{color:var(--ts-text-secondary)}.tile b{font-size:22px}.tile em{font-style:normal;color:var(--ts-success-text)}
.bars{display:flex;align-items:end;gap:5px;block-size:70px;border-block-end:1px solid var(--ts-border)}.bars i{inline-size:12px;background:currentColor;border-radius:3px 3px 0 0}
.hb{inline-size:150px;font-size:11px;display:flex;flex-direction:column;gap:4px}.hb div{display:flex;justify-content:space-between}.hb i{block-size:5px;border-radius:3px;background:currentColor}
.tbl{inline-size:170px;font-size:10.5px}.tbl div{display:grid;grid-template-columns:1fr 1fr auto;padding:4px 0;border-block-end:1px solid var(--ts-border-subtle)}.tbl .th{color:var(--ts-text-tertiary)}.ok{color:var(--ts-success-text)}.wait{color:var(--ts-caution-text)}
.node{display:flex;gap:8px;align-items:center;padding:8px 12px;border-radius:12px;background:var(--ts-surface-elevated);box-shadow:var(--ts-shadow-node);font-size:12px}.node small{display:block;color:var(--ts-text-secondary);font-size:10.5px}.dot{inline-size:22px;block-size:22px;border-radius:7px;background:var(--ts-discovery-surface)}
svg .n{fill:var(--ts-surface-elevated);stroke:var(--ts-border)}svg .sel{stroke:var(--ts-text-emphasis);stroke-width:1.5}
.pal,.insp{inline-size:140px;font-size:11.5px;display:flex;flex-direction:column;gap:3px}.pal small,.insp small{color:var(--ts-text-tertiary);font-size:10.5px}.pal div{padding:5px 8px;border-radius:7px;background:var(--ts-surface-secondary)}
.insp .f{display:flex;justify-content:space-between;padding:5px 8px;border-radius:7px;background:var(--ts-surface-secondary);color:var(--ts-text-secondary)}.insp .f span{color:var(--ts-text-emphasis)}
@media(max-width:900px){.wrap{grid-template-columns:1fr;padding:32px 16px;gap:24px}aside{position:static}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
const html = (theme) => `<!doctype html><html lang="en" data-theme="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${tokens}${css}</style></head><body><div class="wrap">
<aside><h1>Components</h1><p>33 React components. 22 can also be streamed by an agent as OpenUI.</p><div class="search">⌕ Filter components</div>
${[["Actions",6],["Forms",6],["Feedback",4],["Data and charts",7],["Chat and agents",5],["App shell",4],["Workflow",4]].map(([n,c],i)=>`<a class="${i==0?"on":""}" href="#">${n}<span>${c}</span></a>`).join("")}
<div class="filters"><span class="on">All</span><span>OpenUI</span><span>React only</span></div></aside>
<main>${groups.map(([g,d,items])=>`<section><div class="gh"><h2>${g}</h2><p>${d}</p></div><div class="grid">${items.map(([n,t])=>`<a class="card" href="#"><div class="stage">${P[n]}</div><div class="meta"><b>${n}</b><p>${t}</p><div class="tags">${oui.has(n)?'<span class="o">OpenUI</span>':'<span>React</span>'}<span>RTL</span></div></div></a>`).join("")}</div></section>`).join("")}</main></div></body></html>`;
writeFileSync(new URL("catalog-light.html", import.meta.url), html("light")); writeFileSync(new URL("catalog-dark.html", import.meta.url), html("dark"));
