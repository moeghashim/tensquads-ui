import { readFileSync, writeFileSync } from "node:fs";
const R = new URL("../../../../../", import.meta.url).pathname.replace(/\/$/, "");
const tokens = readFileSync(`${R}/packages/ui/src/tokens/tokens.css`, "utf8");
const logo = readFileSync(`${R}/design/logo/logo.svg`, "utf8").replace(/<\?xml[^>]*>/, "").replace(/width="64" height="64"/, 'width="26" height="26"');
const nodes = [
	{ id: "s", x: 292, y: 392, w: 116, fam: "end", ico: "▶", t: "Start", m: "" },
	{ id: "c", x: 448, y: 350, w: 196, fam: "logic", ico: "⑂", t: "Classify request", m: "Logic · classify", br: ["Refund", "Question", "Other"] },
	{ id: "r", x: 700, y: 270, w: 200, fam: "agent", ico: "◆", t: "Refund agent", m: "Agent · Pisa", sel: true },
	{ id: "f", x: 700, y: 392, w: 200, fam: "agent", ico: "◆", t: "Answer from FAQ", m: "Agent · Delphi" },
	{ id: "a", x: 700, y: 514, w: 200, fam: "logic", ico: "✓", t: "Ask a person", m: "Logic · user approval" },
	{ id: "e", x: 948, y: 392, w: 96, fam: "end", ico: "■", t: "End", m: "" },
];
const H = 58;
const BR = 30;
const nh = (n) => (n.br ? H + n.br.length * BR + 6 : H);
const out = (n, i) => (n.br ? [n.x + n.w + 8, n.y + H + 6 + i * BR + BR / 2] : [n.x + n.w, n.y + H / 2]);
const inp = (n) => [n.x, n.y + H / 2];
const by = Object.fromEntries(nodes.map((n) => [n.id, n]));
const edges = [["s", "c"], ["c", "r", 0], ["c", "f", 1], ["c", "a", 2], ["r", "e"], ["f", "e"], ["a", "e"]];
const path = ([a, b, i]) => {
	const [x1, y1] = out(by[a], i ?? 0);
	const [x2, y2] = inp(by[b]);
	const dx = Math.max(30, (x2 - x1) / 2);
	return `<path d="M${x1} ${y1} C${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}"/>`;
};
const node = (n) =>
	`<div class="node${n.sel ? " sel" : ""}" data-family="${n.fam}" style="left:${n.x}px;top:${n.y}px;width:${n.w}px;height:${nh(n)}px">${n.id !== "s" ? '<i class="port in"></i>' : ""}<div class="nh"><span class="ico">${n.ico}</span><div><b>${n.t}</b>${n.m ? `<small>${n.m}</small>` : ""}</div></div>${n.br ? n.br.map((b) => `<div class="br">${b}<i class="port out"></i></div>`).join("") : n.id !== "e" ? '<i class="port out" style="top:23px"></i>' : ""}</div>`;
const pal = [
	["Core", [["agent", "◆", "Agent"]]],
	["Logic", [["logic", "⑂", "Classify"], ["logic", "⑂", "If / else"], ["logic", "↻", "While"], ["logic", "✓", "User approval"]]],
	["Tools", [["tool", "⌕", "File search"], ["tool", "⛨", "Guardrails"], ["tool", "⚒", "MCP"]]],
	["Data", [["data", "⇄", "Transform"], ["data", "≡", "Set state"]]],
	["Other", [["note", "✎", "Note"], ["end", "■", "End"]]],
];
const guide = [
	["Add", "Drag a step from the palette, or press it", "⌘K"],
	["Connect", "Drag from the dot on a step's edge to the next step", "Inspector"],
	["Edit", "Select a step and change it on the right", "Click"],
	["Move", "Drag a step, or nudge it with the keyboard", "⇧ arrows"],
	["Delete", "Select a step and remove it", "⌫"],
	["Undo", "Take back any change", "⌘Z"],
];
const css = `*{box-sizing:border-box}html,body{margin:0}body{height:900px}body{background:var(--ts-canvas);color:var(--ts-text);font-family:Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased;font-size:14px}
.site{display:flex;align-items:center;gap:28px;height:56px;padding-inline:24px;border-block-end:1px solid var(--ts-border-subtle);background:var(--ts-surface)}
.brand{display:flex;align-items:center;gap:10px;font-weight:600;color:var(--ts-text-emphasis)}
.site nav{display:flex;gap:4px;flex:1;justify-content:center}.site nav a{padding:7px 12px;border-radius:999px;color:var(--ts-text-secondary)}.site nav a.on{background:var(--ts-surface-tertiary);color:var(--ts-text-emphasis);font-weight:500}
.util{display:flex;gap:16px;color:var(--ts-text-secondary)}
.bh{display:flex;align-items:center;gap:10px;height:56px;padding-inline:24px;border-block-end:1px solid var(--ts-border-subtle);background:var(--ts-surface)}
.crumb{color:var(--ts-text-secondary)}.crumb b{color:var(--ts-text-emphasis);font-weight:600}
.badge{font-size:12px;font-weight:600;padding:2px 9px;border-radius:999px;background:var(--ts-caution-surface);color:var(--ts-caution-surface-text)}
.sp{flex:1}.kbd{font-family:var(--ts-font-mono);font-size:11px;padding:1px 6px;border-radius:5px;border:1px solid var(--ts-border);color:var(--ts-text-secondary);background:var(--ts-surface)}
.btn{display:inline-flex;align-items:center;gap:8px;height:32px;padding:0 12px;border-radius:999px;font-size:13px;font-weight:500;background:var(--ts-surface-tertiary);color:var(--ts-text-emphasis);border:0;font-family:inherit}
.btn.on{background:var(--ts-text-emphasis);color:var(--ts-text-inverse)}.btn.on .kbd{background:transparent;color:inherit;border-color:currentColor;opacity:.7}
.stage{position:relative;height:calc(100% - 112px);overflow:hidden;background-image:radial-gradient(var(--ts-border) 1px,transparent 1.2px);background-size:20px 20px}
svg.edges{position:absolute;inset:0;width:100%;height:100%}svg.edges path{fill:none;stroke:var(--ts-border-strong);stroke-width:1.6}
.node{position:absolute;background:var(--ts-node-surface);border-radius:14px;box-shadow:var(--ts-shadow-node);border:1px solid var(--ts-node-ring)}
.node.sel{box-shadow:var(--ts-shadow-node-selected);border-color:var(--ts-node-ring-selected);outline:2px solid var(--ts-node-ring-selected);outline-offset:2px}
.nh{display:flex;gap:10px;align-items:center;height:${H}px;padding-inline:12px}
.ico{inline-size:30px;block-size:30px;border-radius:9px;display:grid;place-items:center;background:var(--ts-node-tint);color:var(--ts-node-ink);font-size:14px;flex:none}
.nh b{display:block;font-size:13.5px;font-weight:600;color:var(--ts-text-emphasis)}.nh small{display:block;font-size:12px;color:var(--ts-text-secondary)}
.br{position:relative;height:${BR}px;margin-inline:8px;padding-inline:8px;display:flex;align-items:center;font-size:12px;color:var(--ts-text-secondary);border-block-start:1px solid var(--ts-border-subtle)}
.port{position:absolute;display:block;width:10px;height:10px;border-radius:50%;background:var(--ts-surface);border:2px solid var(--ts-border-strong)}.port.in{inset-inline-start:-6px;top:23px}.port.out{inset-inline-end:-6px}.br .port.out{inset-inline-end:-14px;top:10px}
[data-family="agent"]{--ts-node-tint:var(--ts-tint-agent)}[data-family="logic"]{--ts-node-tint:var(--ts-tint-logic)}[data-family="end"]{--ts-node-tint:var(--ts-tint-end)}[data-family="tool"]{--ts-node-tint:var(--ts-tint-tool)}[data-family="data"]{--ts-node-tint:var(--ts-tint-data)}[data-family="note"]{--ts-node-tint:var(--ts-tint-note)}
.float{position:absolute;background:var(--ts-surface-elevated);border:1px solid var(--ts-border-subtle);border-radius:16px;box-shadow:var(--ts-shadow-overlay)}
.pal{left:20px;top:20px;width:228px;padding:10px}.pal .search{display:flex;justify-content:space-between;align-items:center;height:34px;padding-inline:10px;border-radius:9px;background:var(--ts-surface-secondary);color:var(--ts-text-tertiary);font-size:13px;margin-block-end:4px}
.pal small{display:block;padding:8px 8px 4px;font-size:11.5px;font-weight:500;color:var(--ts-text-tertiary)}
.pal .it{display:flex;gap:10px;align-items:center;padding:5px 8px;border-radius:8px;font-size:13px}.pal .it .ico{inline-size:24px;block-size:24px;border-radius:7px;font-size:12px}
.insp{right:20px;top:20px;bottom:20px;width:316px;display:flex;flex-direction:column}
.ih{display:flex;gap:10px;align-items:center;padding:16px;border-block-end:1px solid var(--ts-border-subtle)}.ih b{display:block;font-size:15px;color:var(--ts-text-emphasis)}.ih small{color:var(--ts-text-secondary);font-size:12px}
.ib{padding:16px;display:flex;flex-direction:column;gap:14px;flex:1;overflow:hidden}
.f label{display:block;font-size:12px;font-weight:500;color:var(--ts-text-secondary);margin-block-end:6px}.in{min-height:36px;border-radius:9px;background:var(--ts-surface-secondary);border:1px solid var(--ts-border-subtle);padding:8px 10px;font-size:13px;color:var(--ts-text-emphasis)}.in.ta{min-height:72px;line-height:1.45}
.sel2{display:flex;justify-content:space-between}
.conn{display:flex;flex-direction:column;gap:6px}.conn div{display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:7px 10px;border-radius:9px;border:1px solid var(--ts-border-subtle)}.conn span{color:var(--ts-text-tertiary);font-size:12px}
.if{display:flex;justify-content:space-between;gap:8px;padding:12px 16px;border-block-start:1px solid var(--ts-border-subtle)}
.danger{background:var(--ts-danger-surface);color:var(--ts-danger-surface-text)}
.guide{left:272px;right:360px;top:20px;padding:14px 16px;max-width:620px;margin-inline:auto}
.gt{display:flex;justify-content:space-between;align-items:center;margin-block-end:10px}.gt b{font-size:14px;color:var(--ts-text-emphasis)}.gt span{color:var(--ts-text-tertiary);font-size:12px}
.gg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.gg div{padding:8px 10px;border-radius:10px;background:var(--ts-surface-secondary)}.gg b{display:flex;justify-content:space-between;align-items:center;font-size:13px;color:var(--ts-text-emphasis)}.gg p{margin:3px 0 0;font-size:12px;line-height:1.4;color:var(--ts-text-secondary)}
.tb{left:272px;right:360px;margin-inline:auto;width:max-content;bottom:20px;display:flex;align-items:center;gap:4px;padding:5px;border-radius:999px}.tb .btn{height:34px}.tb hr{inline-size:1px;block-size:22px;border:0;background:var(--ts-border);margin:0 4px}
.mm{left:20px;bottom:20px;width:180px;height:112px;padding:8px}.mm svg{width:100%;height:100%}`;
const page = (theme) => `<!doctype html><html lang="en" data-theme="${theme}"><head><meta charset="utf-8"><style>${tokens}${css}</style></head><body>
<header class="site"><span class="brand">${logo}Design system</span><nav><a>Home</a><a>Foundations</a><a>Components</a><a class="on">Nodes</a><a>Chat</a></nav><span class="util"><span>العربية</span><span>◐</span></span></header>
<div class="bh"><span class="crumb">Workflows / <b>Support triage</b></span><span class="badge">Draft</span><span class="sp"></span><button class="btn on">Guide</button><button class="btn">Search <span class="kbd">⌘K</span></button><button class="btn">Tidy layout <span class="kbd">⌘⇧L</span></button></div>
<div class="stage"><svg class="edges">${edges.map(path).join("")}</svg>${nodes.map(node).join("")}
<div class="float pal"><div class="search">Add a step <span class="kbd">⌘K</span></div>${pal.map(([g, it]) => `<small>${g}</small>${it.map(([f, i, n]) => `<div class="it" data-family="${f}"><span class="ico">${i}</span>${n}</div>`).join("")}`).join("")}</div>
<div class="float guide"><div class="gt"><b>How to build a workflow</b><span>Hide guide ✕</span></div><div class="gg">${guide.map(([a, b, k]) => `<div><b>${a}<span class="kbd">${k}</span></b><p>${b}</p></div>`).join("")}</div></div>
<div class="float insp"><div class="ih"><span class="ico" data-family="agent">◆</span><div><b>Refund agent</b><small>Agent · selected</small></div></div><div class="ib">
<div class="f"><label>Title</label><div class="in">Refund agent</div></div>
<div class="f"><label>Squadmate</label><div class="in sel2">Pisa · Orders<span>⌄</span></div></div>
<div class="f"><label>Instructions</label><div class="in ta">Check the order, refund up to $20 on your own, and ask a person above that.</div></div>
<div class="f"><label>Connections</label><div class="conn"><div>From Classify request<span>Refund</span></div><div>To End<span>output</span></div><div style="border-style:dashed;color:var(--ts-text-secondary)">+ Connect to a step</div></div></div>
</div><div class="if"><button class="btn">Duplicate <span class="kbd">⌘D</span></button><button class="btn danger">Delete step <span class="kbd">⌫</span></button></div></div>
<div class="float mm"><svg viewBox="280 230 830 340">${edges.map(path).join("").replaceAll("<path", '<path stroke="currentColor" opacity=".3" fill="none"')}${nodes.map((n) => `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${nh(n)}" rx="10" fill="var(--ts-surface-tertiary)" stroke="var(--ts-border-strong)"/>`).join("")}<rect x="285" y="235" width="560" height="330" fill="none" stroke="var(--ts-text-emphasis)" stroke-width="4" rx="8"/></svg></div>
<div class="float tb"><button class="btn">Pan <span class="kbd">V</span></button><button class="btn on">Select <span class="kbd">S</span></button><hr><button class="btn">Undo</button><button class="btn">Redo</button><hr><button class="btn">− 100% +</button></div>
</div></body></html>`;
writeFileSync(new URL("nodes-light.html", import.meta.url), page("light"));
writeFileSync(new URL("nodes-dark.html", import.meta.url), page("dark"));
