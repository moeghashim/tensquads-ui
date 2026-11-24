import { readFileSync, writeFileSync } from "node:fs";
const R = new URL("../../../../../", import.meta.url).pathname.replace(/\/$/, "");
const tokens = readFileSync(`${R}/packages/ui/src/tokens/tokens.css`, "utf8");
const petra = readFileSync(`${R}/design/mascots/svg/petra.svg`, "utf8").replace(/<\?xml[^>]*>/, "").replace("<svg ", '<svg class="sm" ');
const font = (f) => `${R}/packages/ui/src/fonts/inter/${f}`;
const lines = [
  ['Squadmate', '"petra", "running", 64, "en"'],
  ['Badge', '"Checking", "info"'],
  ['Field', '"Store name", "storeName", "", "Bannaa Market", "", "", false, false'],
  ['Switch', '"Email me when done", true, false'],
  ['SegmentedControl', '"Billing cadence", ["Weekly", "Monthly"], "Weekly"'],
  ['Button', '"Send back", "soft", "md", true, false'],
  ['Button', '"Approve plan", "solid", "md", true, false'],
];
const T = {
  en: { dir: "ltr", eyebrow: "Stream to screen", h2: "An agent streams it. The library renders it.", lead: "Petra sends seven lines of OpenUI. Each line becomes a real component, in English or Arabic, light or dark.", en: "English", ar: "العربية", replay: "Replay", stream: "OpenUI stream", rendered: "Rendered", live: "Live", title: "Petra is setting up your store", sub: "Running skill", badge: "Checking", store: "Store name", storeV: "Bannaa Market", email: "Email me when done", cadence: "Billing cadence", weekly: "Weekly", monthly: "Monthly", back: "Send back", approve: "Approve plan", step: "Line 7 of 7", fixture: "home-demo.fixture.en.txt" },
  ar: { dir: "rtl", eyebrow: "من البث إلى الشاشة", h2: "يبثّه الوكيل، وتعرضه المكتبة.", lead: "ترسل بترا سبعة أسطر من OpenUI، فيصبح كل سطر مكوّنًا حقيقيًا، بالعربية أو الإنجليزية، فاتحًا أو داكنًا.", en: "English", ar: "العربية", replay: "إعادة التشغيل", stream: "بث OpenUI", rendered: "النتيجة", live: "مباشر", title: "بترا تُعِدّ متجرك", sub: "تنفيذ المهارة", badge: "قيد التحقق", store: "اسم المتجر", storeV: "سوق بنّاء", email: "راسلني عند الانتهاء", cadence: "دورة الفوترة", weekly: "أسبوعيًا", monthly: "شهريًا", back: "إعادة", approve: "اعتماد الخطة", step: "السطر 7 من 7", fixture: "home-demo.fixture.ar.txt" },
};
const css = `
@font-face{font-family:Inter;src:url(${font("Inter-Regular.woff2")});font-weight:400}
@font-face{font-family:Inter;src:url(${font("Inter-Medium.woff2")});font-weight:500}
@font-face{font-family:Inter;src:url(${font("Inter-SemiBold.woff2")});font-weight:600}
@font-face{font-family:"IBM Plex Sans Arabic";src:url(${R}/packages/ui/src/fonts/ibm-plex-sans-arabic/IBMPlexSansArabic-Regular.woff2)}
*{box-sizing:border-box}
body{margin:0;background:var(--ts-canvas);color:var(--ts-text);font-family:Inter,"IBM Plex Sans Arabic",var(--ts-font-sans);-webkit-font-smoothing:antialiased}
.wrap{max-inline-size:1216px;margin-inline:auto;padding:72px 32px}
.head{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px 48px;align-items:end;margin-block-end:32px}
.eyebrow{font-size:13px;font-weight:500;color:var(--ts-text-secondary);margin:0 0 10px}
h2{margin:0;font-size:36px;line-height:1.12;letter-spacing:-.02em;font-weight:600;color:var(--ts-text-emphasis);max-inline-size:20ch}
.lead{margin:14px 0 0;font-size:17px;line-height:1.55;color:var(--ts-text-secondary);max-inline-size:52ch}
.controls{display:flex;gap:10px;align-items:center}
.seg{display:inline-flex;padding:3px;border-radius:var(--ts-radius-full);background:var(--ts-surface-tertiary)}
.seg span{padding:6px 14px;border-radius:var(--ts-radius-full);font-size:14px;font-weight:500;color:var(--ts-text-secondary)}
.seg span.on{background:var(--ts-surface);color:var(--ts-text-emphasis);box-shadow:var(--ts-shadow-100)}
.btn{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 16px;border-radius:var(--ts-radius-full);font-size:14px;font-weight:500;border:0}
.btn.soft{background:var(--ts-surface-tertiary);color:var(--ts-text-emphasis)}
.btn.solid{background:var(--ts-primary-solid);color:var(--ts-text-inverse)}
.ic{inline-size:14px;block-size:14px}
.frame{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);border:1px solid var(--ts-border-subtle);border-radius:20px;background:var(--ts-surface);overflow:hidden;box-shadow:var(--ts-shadow-100)}
.pane-h{display:flex;align-items:center;justify-content:space-between;height:48px;padding-inline:20px;border-block-end:1px solid var(--ts-border-subtle);font-size:13px;font-weight:500;color:var(--ts-text-secondary)}
.pane-h b{font-weight:500;color:var(--ts-text-emphasis)}
.live{display:inline-flex;align-items:center;gap:6px;color:var(--ts-success-text)}
.live i{inline-size:6px;block-size:6px;border-radius:50%;background:var(--ts-success-solid)}
.code{background:var(--ts-surface-secondary);border-inline-end:1px solid var(--ts-border-subtle);display:flex;flex-direction:column}
ol{list-style:none;margin:0;padding:12px 0;font-family:var(--ts-font-mono);font-size:12.5px;line-height:20px;flex:1}
ol li{display:grid;grid-template-columns:40px minmax(0,1fr);padding:6px 20px 6px 0;color:var(--ts-text);border-inline-start:2px solid transparent}
ol li .n{color:var(--ts-text-tertiary);text-align:end;padding-inline-end:14px;user-select:none}
ol li .c{direction:ltr;text-align:start;overflow-wrap:anywhere}
.k{color:var(--ts-text-tertiary)} .f{color:var(--ts-text-emphasis);font-weight:500} .s{color:var(--ts-info-text)}
ol li.on{background:var(--ts-surface-tertiary);border-inline-start-color:var(--ts-text-emphasis)}
.foot{display:flex;align-items:center;gap:16px;height:44px;padding-inline:20px;border-block-start:1px solid var(--ts-border-subtle);font-size:12px;color:var(--ts-text-tertiary)}
.bar{display:flex;gap:3px;flex:1}.bar i{flex:1;height:3px;border-radius:2px;background:var(--ts-text-emphasis)}
.fx{font-family:var(--ts-font-mono)}
.render{display:flex;flex-direction:column}
.stage{flex:1;padding:28px 32px 32px;display:flex;flex-direction:column;gap:24px}
.who{display:grid;grid-template-columns:56px minmax(0,1fr) auto;gap:16px;align-items:center}
.who .sm{inline-size:56px;block-size:56px}
.who h3{margin:0;font-size:17px;font-weight:600;color:var(--ts-text-emphasis)}
.who p{margin:2px 0 0;font-size:14px;color:var(--ts-text-secondary)}
.badge{padding:3px 10px;border-radius:var(--ts-radius-full);background:var(--ts-info-surface);color:var(--ts-info-surface-text);font-size:12px;font-weight:600}
.rows{border-block:1px solid var(--ts-border-subtle)}
.row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:24px;align-items:center;min-block-size:60px;padding-block:10px}
.row+.row{border-block-start:1px solid var(--ts-border-subtle)}
.row label{font-size:14px;font-weight:500;color:var(--ts-text)}
.input{height:38px;border-radius:10px;background:var(--ts-surface-secondary);border:1px solid var(--ts-border-subtle);padding-inline:12px;display:flex;align-items:center;font-size:14px;color:var(--ts-text-emphasis)}
.sw{justify-self:end;inline-size:38px;block-size:22px;border-radius:999px;background:var(--ts-primary-solid);position:relative}
.sw::after{content:"";position:absolute;inset-block-start:3px;inset-inline-end:3px;inline-size:16px;block-size:16px;border-radius:50%;background:var(--ts-surface)}
.row .seg{justify-self:end}
.acts{display:flex;justify-content:flex-end;gap:10px;margin-block-start:auto}
.ring{outline:2px solid var(--ts-text-emphasis);outline-offset:3px}
@media (max-width:820px){.wrap{padding:40px 16px}.head{grid-template-columns:1fr}h2{font-size:28px}.frame{grid-template-columns:1fr}.code{border-inline-end:0;border-block-end:1px solid var(--ts-border-subtle)}.stage{padding:20px}.row{grid-template-columns:1fr;gap:8px}.sw,.row .seg{justify-self:start}}
`;
const arrow = '<svg class="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M13 8a5 5 0 1 1-1.5-3.6M13 3v3h-3"/></svg>';
const esc = (s) => s.replace(/"([^"]*)"/g, '<span class="s">"$1"</span>');
function page(lang, theme) {
  const t = T[lang];
  const code = lines.map(([f, a], i) => `<li class="${i === 6 ? "on" : ""}"><span class="n">${i + 1}</span><span class="c"><span class="k">root =</span> <span class="f">${f}</span>(${esc(a)})</span></li>`).join("");
  return `<!doctype html><html lang="${lang}" dir="${t.dir}" data-theme="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${tokens}${css}</style></head><body><section class="wrap">
<div class="head"><div><p class="eyebrow">${t.eyebrow}</p><h2>${t.h2}</h2><p class="lead">${t.lead}</p></div>
<div class="controls"><div class="seg" role="radiogroup"><span class="${lang === "en" ? "on" : ""}">${t.en}</span><span class="${lang === "ar" ? "on" : ""}">${t.ar}</span></div><button class="btn soft">${arrow}${t.replay}</button></div></div>
<div class="frame">
<div class="code"><div class="pane-h"><b>${t.stream}</b><span class="live"><i></i>${t.live}</span></div><ol>${code}</ol><div class="foot"><div class="bar">${"<i></i>".repeat(7)}</div><span>${t.step}</span></div></div>
<div class="render"><div class="pane-h"><b>${t.rendered}</b><span class="fx">${t.fixture}</span></div><div class="stage">
<div class="who">${petra}<div><h3>${t.title}</h3><p>${t.sub}</p></div><span class="badge">${t.badge}</span></div>
<div class="rows"><div class="row"><label>${t.store}</label><div class="input">${t.storeV}</div></div><div class="row"><label>${t.email}</label><div class="sw"></div></div><div class="row"><label>${t.cadence}</label><div class="seg"><span class="on">${t.weekly}</span><span>${t.monthly}</span></div></div></div>
<div class="acts"><button class="btn soft">${t.back}</button><button class="btn solid ring">${t.approve}</button></div>
</div></div></div></section></body></html>`;
}
for (const [l, th] of [["en", "light"], ["en", "dark"], ["ar", "light"]]) writeFileSync(new URL(`stream-${l}-${th}.html`, import.meta.url), page(l, th));
