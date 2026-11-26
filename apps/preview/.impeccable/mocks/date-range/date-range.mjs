// DateRangePicker comp (v0.4-trial-gaps 001, D35). Run: node apps/preview/.impeccable/mocks/date-range/date-range.mjs
// Writes date-range-{en-light,en-dark,ar-light}.html. Library and template CSS are inlined from the repository.
import { writeFileSync } from "node:fs";
import { fmt, icon, month, page, pickerCss, utc } from "./kit.mjs";

const copy = {
	en: {
		title: "DateRangePicker",
		lead: "Pick a start and an end date in one control. Two months side by side on wide screens, one month in a sheet on phones. Presets cover the common ranges.",
		start: "Start date",
		end: "End date",
		presets: ["Today", "Last 7 days", "Last 30 days", "This month", "Last month", "Custom"],
		nights: (n) => `${n} days`,
		clear: "Clear",
		apply: "Apply",
		states: { closed: "Closed", empty: "Empty", open: "Open, range selected", picking: "Picking the end date", invalid: "Invalid", disabled: "Disabled", header: "In a page header", mobile: "Phone: one month in a sheet" },
		invalid: "The end date is before the start date.",
		orders: "Orders",
		ordersLead: "Orders from your store, newest first.",
		exportLabel: "Export",
		notes: [
			"The field shows both dates with a dash between them. An empty field shows its two placeholders.",
			"Selecting a start date and then an end date sets the range. Hovering previews the end. Presets set the range at once.",
			"Apply closes the popup and commits the range. Escape or a click outside restores the previous range.",
			"Arrows move by day, Page Up and Page Down by month, Home and End to the week's edges. Enter picks.",
			"Days before min or after max are disabled. Today has a dot.",
		],
	},
	ar: {
		title: "منتقي نطاق التاريخ",
		lead: "اختر تاريخ البداية وتاريخ النهاية في عنصر واحد. شهران متجاوران على الشاشات العريضة، وشهر واحد في لوحة على الهاتف. والاختيارات الجاهزة تغطي النطاقات الشائعة.",
		start: "تاريخ البداية",
		end: "تاريخ النهاية",
		presets: ["اليوم", "آخر ٧ أيام", "آخر ٣٠ يومًا", "هذا الشهر", "الشهر الماضي", "مخصص"],
		nights: (n) => `${fmt.num(n, "ar")} يومًا`,
		clear: "مسح",
		apply: "تطبيق",
		states: { closed: "مغلق", empty: "فارغ", open: "مفتوح مع نطاق محدد", picking: "اختيار تاريخ النهاية", invalid: "غير صالح", disabled: "معطّل", header: "في رأس الصفحة", mobile: "الهاتف: شهر واحد في لوحة" },
		invalid: "تاريخ النهاية قبل تاريخ البداية.",
		orders: "الطلبات",
		ordersLead: "طلبات متجرك، الأحدث أولًا.",
		exportLabel: "تصدير",
		notes: [
			"يعرض الحقل التاريخين بينهما شرطة. ويعرض الحقل الفارغ نصّيه المؤقتين.",
			"اختيار تاريخ البداية ثم تاريخ النهاية يحدد النطاق. والتمرير فوق يوم يعرض النهاية مسبقًا. والاختيارات الجاهزة تحدد النطاق مباشرة.",
			"زر التطبيق يغلق النافذة ويعتمد النطاق. ومفتاح Escape أو النقر خارجها يعيد النطاق السابق.",
			"الأسهم تنتقل يومًا، وPage Up وPage Down شهرًا، وHome وEnd إلى طرفي الأسبوع. وEnter يختار.",
			"الأيام قبل الحد الأدنى أو بعد الحد الأقصى معطّلة. واليوم عليه نقطة.",
		],
	},
};

const today = utc(2026, 10, 26);
const start = utc(2026, 10, 10);
const end = utc(2026, 10, 23);

function field(l, { s, e, state = "" } = {}) {
	const c = copy[l];
	const value = s
		? `<span>${fmt.short(s, l)}</span><span class="dr-sep">–</span><span>${e ? fmt.short(e, l) : `<span class="dr-ph">${c.end}</span>`}</span>`
		: `<span class="dr-ph">${c.start}</span><span class="dr-sep">–</span><span class="dr-ph">${c.end}</span>`;
	return `<div class="dr-field ${state}" role="group" aria-label="${c.start} – ${c.end}">${icon.calendar}${value}</div>`;
}

function popup(l, { hover, months = 2, foot = true } = {}) {
	const c = copy[l];
	const opts = { start, end: hover ? undefined : end, hover, today, locale: l };
	const ms = [month(2026, 10, opts), months === 2 ? month(2026, 11, opts) : ""].join("");
	const heads = [fmt.month(utc(2026, 10, 1), l), months === 2 ? fmt.month(utc(2026, 11, 1), l) : ""].filter(Boolean).map((h) => `<span>${h}</span>`).join("");
	const days = Math.round(((hover ?? end) - start) / 864e5) + 1;
	return `<div class="dr-pop${months === 1 ? " dr-pop--sheet" : ""}">
<div class="dr-presets">${c.presets.map((p, i) => `<button type="button" aria-pressed="${i === 5}">${p}</button>`).join("")}</div>
<div class="dr-main"><div class="dr-nav"><button class="dr-icon" aria-label="Previous month">${icon.prev}</button><h3>${heads}</h3><button class="dr-icon" aria-label="Next month">${icon.next}</button></div>
<div class="dr-months">${ms}</div>
${foot ? `<div class="dr-foot"><span><b>${fmt.short(start, l)} – ${fmt.short(hover ?? end, l)}</b> · ${c.nights(days)}</span><span class="dr-actions"><button class="ts-button ts-button--ghost ts-button--sm" data-slot="button" type="button">${c.clear}</button><button class="ts-button ts-button--solid ts-button--sm" data-slot="button" type="button">${c.apply}</button></span></div>` : ""}
</div></div>`;
}

function sheet(l) {
	const c = copy[l];
	return `<div class="phone"><div class="phone__screen"><div class="phone__dim"></div><div class="phone__sheet"><i class="phone__grab"></i>
<div class="sheet-head"><b>${c.start} – ${c.end}</b><button class="dr-icon" aria-label="Close">${icon.close}</button></div>
<div class="chips">${[...c.presets.slice(1, 3), c.presets[5]].map((p, i) => `<button type="button" class="ts-chip" data-slot="button" aria-pressed="${i === 2}">${p}</button>`).join("")}</div>
<div class="dr-nav"><button class="dr-icon" aria-label="Previous month">${icon.prev}</button><h3><span>${fmt.month(utc(2026, 10, 1), l)}</span></h3><button class="dr-icon" aria-label="Next month">${icon.next}</button></div>
${month(2026, 10, { start, end, today, locale: l })}
<div class="sheet-foot"><span><b>${fmt.short(start, l)} – ${fmt.short(end, l)}</b></span><button class="ts-button ts-button--solid ts-button--md" data-slot="button" type="button">${c.apply}</button></div>
</div></div></div>`;
}

const css = `${pickerCss}
.board{max-inline-size:76rem;margin-inline:auto;padding:var(--ts-space-12) var(--ts-space-6) var(--ts-space-16)}
.eyebrow{margin:0 0 var(--ts-space-2);color:var(--ts-text-secondary);font-size:var(--ts-text-xs-font-size);font-weight:600;letter-spacing:.06em;text-transform:uppercase}
.board h1{margin:0;color:var(--ts-text-emphasis);font-size:var(--ts-heading-3xl-font-size);line-height:var(--ts-heading-3xl-line-height);font-weight:600;letter-spacing:-.02em}
.lead{max-inline-size:60ch;margin:var(--ts-space-3) 0 var(--ts-space-10);color:var(--ts-text-secondary);font-size:var(--ts-text-md-font-size);line-height:1.55}
.spec{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--ts-space-4);margin-block-end:var(--ts-space-6)}
.cell{padding:var(--ts-space-5);border:1px solid var(--ts-border-subtle);border-radius:var(--ts-radius-xl);background:var(--ts-panel)}
.cell h2,.wide h2{margin:0 0 var(--ts-space-4);color:var(--ts-text-secondary);font-size:var(--ts-text-xs-font-size);font-weight:600;letter-spacing:.04em;text-transform:uppercase}
.wide{padding:var(--ts-space-6);margin-block-end:var(--ts-space-6);border:1px solid var(--ts-border-subtle);border-radius:var(--ts-radius-xl);background:var(--ts-panel)}
.stack{display:grid;justify-items:start;gap:var(--ts-space-3)}
.row2{display:grid;grid-template-columns:minmax(0,1fr) 23.5rem;gap:var(--ts-space-6);align-items:start}
.anchor{display:grid;justify-items:start;gap:var(--ts-space-2)}
.hdr{display:flex;align-items:flex-end;justify-content:space-between;gap:var(--ts-space-4);flex-wrap:wrap}
.hdr .ts-page-header{flex:1}
.hdr-actions{display:flex;gap:var(--ts-space-2);align-items:center}
.hdr-actions .ts-button svg{inline-size:var(--ts-icon-sm);block-size:var(--ts-icon-sm)}
.notes{margin:0;padding-inline-start:var(--ts-space-5);color:var(--ts-text-secondary);font-size:var(--ts-text-sm-font-size);line-height:1.6}
.notes li+li{margin-block-start:var(--ts-space-2)}
.phone{inline-size:20rem;border-radius:2.25rem;padding:var(--ts-space-2-5);background:var(--ts-gray-1000);box-shadow:var(--ts-shadow-overlay),0 0 0 1px var(--ts-border-subtle)}
.phone__screen{position:relative;block-size:41rem;border-radius:1.75rem;overflow:hidden;background:var(--ts-canvas)}
.phone__dim{position:absolute;inset:0;background:var(--ts-backdrop)}
.phone__sheet{position:absolute;inset-inline:0;inset-block-end:0;padding:var(--ts-space-2) var(--ts-space-4) var(--ts-space-5);border-start-start-radius:var(--ts-radius-2xl);border-start-end-radius:var(--ts-radius-2xl);background:var(--ts-surface)}
.phone__grab{display:block;inline-size:2.5rem;block-size:.3rem;margin:0 auto var(--ts-space-3);border-radius:var(--ts-radius-full);background:var(--ts-border-strong)}
.sheet-head{display:flex;align-items:center;justify-content:space-between;margin-block-end:var(--ts-space-3);color:var(--ts-text-emphasis)}
.chips{display:flex;gap:var(--ts-space-1-5);overflow:hidden;margin-block-end:var(--ts-space-3)}
.chips .ts-chip{flex:none}
.chips .ts-chip[aria-pressed="true"]{background:var(--ts-primary-solid);color:var(--ts-text-inverse)}
.phone .dr-grid{grid-template-columns:repeat(7,1fr)}
.phone .dr-day span{inline-size:2.25rem;block-size:2.25rem}
.sheet-foot{display:flex;align-items:center;justify-content:space-between;margin-block-start:var(--ts-space-4);padding-block-start:var(--ts-space-3);border-block-start:1px solid var(--ts-border-subtle);font-size:var(--ts-text-sm-font-size)}
.sheet-foot b{color:var(--ts-text-emphasis)}
`;

function body(l) {
	const c = copy[l];
	const s = c.states;
	return `<main class="board">
<p class="eyebrow">v0.4 · ${l === "ar" ? "مكوّن جديد" : "New component"}</p><h1>${c.title}</h1><p class="lead">${c.lead}</p>
<div class="spec">
<section class="cell"><h2>${s.closed}</h2><div class="stack">${field(l, { s: start, e: end })}</div></section>
<section class="cell"><h2>${s.empty}</h2><div class="stack">${field(l)}</div></section>
<section class="cell"><h2>${s.invalid} · ${s.disabled}</h2><div class="stack"><div>${field(l, { s: end, e: start, state: "is-invalid" })}<p class="dr-error">${c.invalid}</p></div>${field(l, { s: start, e: end, state: "is-disabled" })}</div></section>
</div>
<section class="wide"><h2>${s.open}</h2><div class="anchor">${field(l, { s: start, e: end, state: "is-open" })}${popup(l)}</div></section>
<div class="row2">
<section class="wide"><h2>${s.picking}</h2><div class="anchor">${field(l, { s: start, state: "is-open" })}${popup(l, { hover: utc(2026, 10, 18) })}</div></section>
<section class="wide"><h2>${s.mobile}</h2>${sheet(l)}</section>
</div>
<section class="wide"><h2>${s.header}</h2><div class="hdr"><header data-slot="page-header" class="ts-page-header"><div class="ts-page-header__main"><div class="ts-page-header__copy"><h1 class="ts-page-header__title">${c.orders}</h1><p class="ts-page-header__subtitle">${c.ordersLead}</p></div></div></header><div class="hdr-actions">${field(l, { s: start, e: end })}<button class="ts-button ts-button--soft ts-button--md" data-slot="button" type="button">${icon.download}${c.exportLabel}</button></div></div></section>
<section class="wide"><h2>${l === "ar" ? "السلوك" : "Behavior"}</h2><ul class="notes">${c.notes.map((n) => `<li>${n}</li>`).join("")}</ul></section>
</main>`;
}

const out = (name) => new URL(name, import.meta.url);
for (const [l, theme] of [["en", "light"], ["en", "dark"], ["ar", "light"]]) {
	writeFileSync(out(`date-range-${l}-${theme}.html`), page({ title: `DateRangePicker comp (${l}, ${theme})`, locale: l, theme, css, body: body(l) }));
}
