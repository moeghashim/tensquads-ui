import { readFileSync, writeFileSync } from "node:fs";
const R = new URL("../../../../../", import.meta.url).pathname.replace(/\/$/, "");
const tokens = readFileSync(`${R}/packages/ui/src/tokens/tokens.css`, "utf8");
const m = (n, s) => readFileSync(`${R}/design/mascots/svg/${n}.svg`, "utf8").replace(/<\?xml[^>]*>/, "").replace("<svg ", `<svg style="width:${s}px;height:${s}px;flex:none" `);
const T = {
 en:{dir:"ltr",eyebrow:"Chat demo",h1:"The conversation behind an agent-built screen",lead:"Ask Petra for something. The squad does the work, and the answer comes back as real components you can edit and approve.",petra:"Petra",role:"Squad lead",scripted:"Scripted demo",replay:"Replay",user:"Set up a store for me",worked:"3 squadmates worked on this",steps:[["pisa","Pisa","Orders","orders-204","12s"],["angkor","Angkor","Website","website-318","20s"],["petra","Petra","Squad lead","master-421","4s"]],done:"Done",reply:"I have a plan ready. Change anything you like, then approve it and I'll start.",plan:"Launch plan",oui:"OpenUI",store:"Store name",storeV:"Bannaa Market",email:"Email me when done",cadence:"Updates",weekly:"Weekly",monthly:"Monthly",back:"Send back",approve:"Approve plan",ask:"Ask Petra anything",sugg:["Add a returns policy","Use my brand colours","Connect Instagram"],note:"No live model. Petra's reply is a scripted OpenUI stream.",side:"In this screen",parts:[["ChatReply","Petra's turn, with avatar and text"],["Step rows","Who worked on it, live status, task IDs"],["OpenUI block","Components streamed into the reply"],["Field · Switch · SegmentedControl","The plan's editable values"],["ApprovalCard actions","A person approves before work starts"],["Composer","Message box with suggestions"]],browse:"Browse components"},
};
const css=`*{box-sizing:border-box}body{margin:0;background:var(--ts-canvas);color:var(--ts-text);font-family:Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-inline-size:1216px;margin-inline:auto;padding:56px 32px}
.eyebrow{font-size:13px;font-weight:500;color:var(--ts-text-secondary);margin:0 0 10px}
h1{margin:0;font-size:40px;line-height:1.1;letter-spacing:-.025em;font-weight:600;color:var(--ts-text-emphasis);max-inline-size:18ch}
.lead{margin:14px 0 36px;font-size:17px;line-height:1.55;color:var(--ts-text-secondary);max-inline-size:56ch}
.layout{display:grid;grid-template-columns:minmax(0,8fr) minmax(0,4fr);gap:32px;align-items:start}
.win{border:1px solid var(--ts-border-subtle);border-radius:20px;background:var(--ts-surface);box-shadow:var(--ts-shadow-100);overflow:hidden;display:flex;flex-direction:column}
.wh{display:flex;align-items:center;gap:12px;height:60px;padding-inline:20px;border-block-end:1px solid var(--ts-border-subtle)}
.wh b{display:block;font-size:14px;color:var(--ts-text-emphasis)}.wh small{font-size:12px;color:var(--ts-text-secondary)}
.wh .sp{flex:1}.pill{font-size:12px;font-weight:500;padding:3px 10px;border-radius:999px;background:var(--ts-surface-tertiary);color:var(--ts-text-secondary)}
.btn{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 14px;border-radius:999px;font-size:13px;font-weight:500;border:0;background:var(--ts-surface-tertiary);color:var(--ts-text-emphasis)}
.btn.solid{background:var(--ts-primary-solid);color:var(--ts-text-inverse)}.btn.lg{height:36px;padding:0 16px;font-size:14px}
.thread{padding:28px 28px 8px;display:flex;flex-direction:column;gap:20px}
.me{align-self:flex-end;background:var(--ts-primary-solid);color:var(--ts-text-inverse);padding:10px 16px;border-radius:18px 18px 4px 18px;font-size:15px}
.turn{display:grid;grid-template-columns:32px minmax(0,1fr);gap:12px;align-items:start}
.body{display:flex;flex-direction:column;gap:14px}
.steps{border:1px solid var(--ts-border-subtle);border-radius:14px;overflow:hidden}
.steps .sh{display:flex;justify-content:space-between;padding:10px 14px;font-size:13px;font-weight:500;color:var(--ts-text-secondary);background:var(--ts-surface-secondary)}
.step{display:grid;grid-template-columns:28px minmax(0,1fr) auto auto;gap:12px;align-items:center;padding:9px 14px;border-block-start:1px solid var(--ts-border-subtle);font-size:14px}
.step b{font-weight:600;color:var(--ts-text-emphasis)}.step span.r{color:var(--ts-text-secondary);margin-inline-start:6px}
.step code{font-family:var(--ts-font-mono);font-size:12px;color:var(--ts-text-tertiary)}
.ok{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:500;color:var(--ts-success-text)}.ok i{inline-size:6px;block-size:6px;border-radius:50%;background:var(--ts-success-solid)}
.say{margin:0;font-size:15px;line-height:1.55;color:var(--ts-text)}
.block{border:1px solid var(--ts-border);border-radius:14px}
.bh{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-block-end:1px solid var(--ts-border-subtle)}.bh b{font-size:15px;color:var(--ts-text-emphasis)}
.tag{font-size:11px;font-weight:500;padding:2px 8px;border-radius:999px;background:var(--ts-info-surface);color:var(--ts-info-surface-text)}
.row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:20px;align-items:center;min-block-size:56px;padding:8px 16px}.row+.row{border-block-start:1px solid var(--ts-border-subtle)}
.row label{font-size:14px;font-weight:500}.input{height:36px;border-radius:10px;background:var(--ts-surface-secondary);border:1px solid var(--ts-border-subtle);padding-inline:12px;display:flex;align-items:center;font-size:14px;color:var(--ts-text-emphasis)}
.sw{justify-self:end;inline-size:38px;block-size:22px;border-radius:999px;background:var(--ts-primary-solid);position:relative}.sw::after{content:"";position:absolute;inset-block-start:3px;inset-inline-end:3px;inline-size:16px;block-size:16px;border-radius:50%;background:var(--ts-surface)}
.seg{justify-self:end;display:inline-flex;padding:3px;border-radius:999px;background:var(--ts-surface-tertiary)}.seg span{padding:5px 12px;border-radius:999px;font-size:13px;font-weight:500;color:var(--ts-text-secondary)}.seg span.on{background:var(--ts-surface);color:var(--ts-text-emphasis);box-shadow:var(--ts-shadow-100)}
.bf{display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-block-start:1px solid var(--ts-border-subtle);background:var(--ts-surface-secondary);border-radius:0 0 14px 14px}
.comp{padding:16px 28px 24px}.sugg{display:flex;gap:8px;flex-wrap:wrap;margin-block-end:10px}.sugg span{font-size:13px;padding:6px 12px;border-radius:999px;border:1px solid var(--ts-border-subtle);color:var(--ts-text-secondary)}
.box{display:flex;align-items:center;gap:8px;height:52px;padding-inline:18px 8px;border-radius:999px;border:1px solid var(--ts-border);background:var(--ts-surface);color:var(--ts-text-tertiary);font-size:15px}.box .sp{flex:1}.send{inline-size:36px;block-size:36px;border-radius:50%;background:var(--ts-surface-tertiary);display:grid;place-items:center;color:var(--ts-text-tertiary)}
.note{margin:10px 0 0;font-size:12px;color:var(--ts-text-tertiary);text-align:center}
aside{position:sticky;top:24px}aside h2{font-size:13px;font-weight:600;color:var(--ts-text-secondary);margin:0 0 12px;text-transform:none}
aside ol{list-style:none;margin:0;padding:0;border-block-start:1px solid var(--ts-border-subtle)}aside li{display:grid;grid-template-columns:24px minmax(0,1fr);gap:10px;padding:12px 0;border-block-end:1px solid var(--ts-border-subtle)}
aside li .n{inline-size:22px;block-size:22px;border-radius:50%;background:var(--ts-surface-tertiary);display:grid;place-items:center;font-size:11px;font-weight:600;color:var(--ts-text-secondary)}
aside li b{display:block;font-size:14px;color:var(--ts-text-emphasis);font-weight:500}aside li p{margin:2px 0 0;font-size:13px;color:var(--ts-text-secondary)}
aside .more{display:inline-block;margin-block-start:16px;font-size:14px;font-weight:500;color:var(--ts-text-emphasis)}
.mk{position:relative}
@media(max-width:900px){.wrap{padding:32px 16px}h1{font-size:30px}.layout{grid-template-columns:1fr}aside{position:static}.thread{padding:20px 16px 4px}.comp{padding:12px 16px 18px}.row{grid-template-columns:1fr;gap:6px}.sw,.seg{justify-self:start}.step{grid-template-columns:28px minmax(0,1fr) auto}.step code{display:none}}`;
const page=(theme)=>{const t=T.en;return `<!doctype html><html lang="en" data-theme="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${tokens}${css}</style></head><body><div class="wrap">
<p class="eyebrow">${t.eyebrow}</p><h1>${t.h1}</h1><p class="lead">${t.lead}</p>
<div class="layout"><div class="win">
<div class="wh">${m("petra",36)}<div><b>${t.petra}</b><small>${t.role}</small></div><span class="sp"></span><span class="pill">${t.scripted}</span><button class="btn">↻ ${t.replay}</button></div>
<div class="thread"><div class="me">${t.user}</div>
<div class="turn mk" data-n="1">${m("petra",32)}<div class="body">
<div class="steps mk" data-n="2"><div class="sh"><span>${t.worked}</span><span class="ok"><i></i>${t.done}</span></div>${t.steps.map(([id,n,r,c,d])=>`<div class="step">${m(id,28)}<div><b>${n}</b><span class="r">${r}</span></div><code>${c}</code><span class="ok"><i></i>${d}</span></div>`).join("")}</div>
<p class="say">${t.reply}</p>
<div class="block mk" data-n="3"><div class="bh"><b>${t.plan}</b><span class="tag">${t.oui}</span></div>
<div class="mk" data-n="4" style="--x:0"><div class="row"><label>${t.store}</label><div class="input">${t.storeV}</div></div><div class="row"><label>${t.email}</label><div class="sw"></div></div><div class="row"><label>${t.cadence}</label><div class="seg"><span class="on">${t.weekly}</span><span>${t.monthly}</span></div></div></div>
<div class="bf mk" data-n="5"><button class="btn lg">${t.back}</button><button class="btn lg solid">${t.approve}</button></div></div>
</div></div></div>
<div class="comp mk" data-n="6"><div class="sugg">${t.sugg.map(s=>`<span>${s}</span>`).join("")}</div><div class="box">${t.ask}<span class="sp"></span><span class="send">↑</span></div><p class="note">${t.note}</p></div>
</div>
<aside><h2>${t.side}</h2><ol>${t.parts.map(([a,b],i)=>`<li><span class="n">${i+1}</span><div><b>${a}</b><p>${b}</p></div></li>`).join("")}</ol><a class="more" href="#">${t.browse} →</a></aside></div></div></body></html>`};
writeFileSync(new URL("chat-light.html", import.meta.url),page("light"));writeFileSync(new URL("chat-dark.html", import.meta.url),page("dark"));
