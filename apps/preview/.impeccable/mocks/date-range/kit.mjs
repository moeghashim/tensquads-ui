// Shared pieces for the date-range and list-detail comps (v0.4-trial-gaps 001).
// Styles come from the library and the templates, so the comps use real component classes.
import { readFileSync } from "node:fs";

export const R = process.env.TS_ROOT ?? new URL("../../../../../", import.meta.url).pathname.replace(/\/$/, "");
const read = (p) => readFileSync(`${R}/${p}`, "utf8");
const b64 = (p) => readFileSync(`${R}/${p}`).toString("base64");

function libraryCss() {
	const index = read("packages/ui/src/styles/styles.css");
	return [...index.matchAll(/@import "\.\/([^"]+)";/g)].map(([, f]) => read(`packages/ui/src/styles/${f}`)).join("\n");
}

const font = (family, file, weight) =>
	`@font-face{font-family:"${family}";src:url(data:font/woff2;base64,${b64(file)}) format("woff2");font-weight:${weight}}`;

export const baseCss = () =>
	[
		font("Inter", "packages/ui/src/fonts/inter/Inter-Regular.woff2", 400),
		font("Inter", "packages/ui/src/fonts/inter/Inter-Medium.woff2", 500),
		font("Inter", "packages/ui/src/fonts/inter/Inter-SemiBold.woff2", 600),
		font("IBM Plex Sans Arabic", "packages/ui/src/fonts/ibm-plex-sans-arabic/IBMPlexSansArabic-Regular.woff2", 400),
		font("IBM Plex Sans Arabic", "packages/ui/src/fonts/ibm-plex-sans-arabic/IBMPlexSansArabic-Medium.woff2", 500),
		font("IBM Plex Sans Arabic", "packages/ui/src/fonts/ibm-plex-sans-arabic/IBMPlexSansArabic-SemiBold.woff2", 600),
		read("packages/ui/src/tokens/tokens.css"),
		libraryCss(),
		read("templates/app-shell/app-shell.css"),
		read("templates/list/list.css"),
		"*{box-sizing:border-box}html,body{margin:0}body{background:var(--ts-canvas);color:var(--ts-text);font-family:var(--ts-font-sans);-webkit-font-smoothing:antialiased}",
	].join("\n");

export const page = ({ title, locale, theme, css, body }) =>
	`<!doctype html><html lang="${locale}" dir="${locale === "ar" ? "rtl" : "ltr"}" data-theme="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${baseCss()}\n${css}</style></head><body>${body}</body></html>`;

// Calendar model. Weeks start on Sunday in both locales (en-US and ar-SA).
const tag = (locale) => (locale === "ar" ? "ar-SA-u-ca-gregory-nu-arab" : "en-US");
export const fmt = {
	month: (d, l) => new Intl.DateTimeFormat(tag(l), { month: "long", year: "numeric", timeZone: "UTC" }).format(d),
	day: (d, l) => new Intl.DateTimeFormat(tag(l), { day: "numeric", timeZone: "UTC" }).format(d),
	short: (d, l) => new Intl.DateTimeFormat(tag(l), { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(d),
	full: (d, l) => new Intl.DateTimeFormat(tag(l), { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d),
	weekday: (i, l) => new Intl.DateTimeFormat(tag(l), { weekday: "narrow", timeZone: "UTC" }).format(Date.UTC(2026, 10, 1 + i)),
	num: (n, l) => new Intl.NumberFormat(l === "ar" ? "ar-EG-u-nu-arab" : "en-US").format(n),
	sar: (n, l) => new Intl.NumberFormat(l === "ar" ? "ar-EG-u-nu-arab" : "en-US", { style: "currency", currency: "SAR" }).format(n),
};
export const utc = (y, m, d) => new Date(Date.UTC(y, m, d));
const same = (a, b) => a && b && a.getTime() === b.getTime();

export function month(year, m, { start, end, hover, today, min, locale }) {
	const first = utc(year, m, 1);
	const lead = first.getUTCDay();
	const days = new Date(Date.UTC(year, m + 1, 0)).getUTCDate();
	const cells = [];
	for (let i = 0; i < lead; i++) cells.push(`<span class="dr-cell" aria-hidden="true"></span>`);
	const to = end ?? hover;
	for (let d = 1; d <= days; d++) {
		const date = utc(year, m, d);
		const t = date.getTime();
		const inRange = start && to && t > start.getTime() && t < to.getTime();
		const cls = [
			"dr-day",
			same(date, start) && "is-start",
			same(date, to) && "is-end",
			inRange && (end ? "is-in" : "is-in is-pending"),
			!end && hover && same(date, hover) && "is-preview",
			same(date, today) && "is-today",
			min && t < min.getTime() && "is-off",
		].filter(Boolean);
		const col = (lead + d - 1) % 7;
		if (col === 0) cls.push("is-row-start");
		if (col === 6 || d === days) cls.push("is-row-end");
		if (d === 1) cls.push("is-month-start");
		const selected = same(date, start) || same(date, to);
		cells.push(
			`<button type="button" class="${cls.join(" ")}" ${selected ? 'aria-selected="true"' : ""} ${cls.includes("is-off") ? "disabled" : ""} aria-label="${fmt.full(date, locale)}"><span>${fmt.day(date, locale)}</span></button>`,
		);
	}
	const head = Array.from({ length: 7 }, (_, i) => `<span class="dr-wd">${fmt.weekday(i, locale)}</span>`).join("");
	return `<div class="dr-month"><div class="dr-grid" role="grid">${head}${cells.join("")}</div></div>`;
}

export const icon = {
	calendar:
		'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
	prev: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m14.5 6-6 6 6 6"/></svg>',
	next: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9.5 6 6 6-6 6"/></svg>',
	chevron: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m7 10 5 5 5-5"/></svg>',
	close: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
	search: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>',
	download: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m-5-5 5 5 5-5M5 19h14"/></svg>',
};

// The picker's own styles: the spec task 003 builds from. Tokens only; logical properties.
export const pickerCss = `
.dr-field{display:inline-flex;align-items:center;gap:var(--ts-space-2);block-size:var(--ts-control-md);padding-inline:var(--ts-space-3);border:1px solid var(--ts-border);border-radius:var(--ts-radius-md);background:var(--ts-surface);color:var(--ts-text-emphasis);font:var(--ts-text-sm-font-weight) var(--ts-text-sm-font-size)/1 var(--ts-font-sans);white-space:nowrap}
.dr-field svg{inline-size:var(--ts-icon-sm);block-size:var(--ts-icon-sm);color:var(--ts-text-secondary);flex:none}
.dr-field .dr-sep{color:var(--ts-text-tertiary)}
.dr-field .dr-ph{color:var(--ts-text-tertiary)}
.dr-field.is-open{border-color:var(--ts-input-border-focus);outline:2px solid var(--ts-ring);outline-offset:2px}
.dr-field.is-invalid{border-color:var(--ts-input-border-invalid)}
.dr-field.is-disabled{color:var(--ts-text-disabled);background:var(--ts-alpha-05);border-color:transparent}
.dr-field.is-disabled svg{color:var(--ts-text-disabled)}
.dr-field.is-sm{block-size:var(--ts-control-sm)}
.dr-error{margin:var(--ts-space-1-5) 0 0;color:var(--ts-red-700);font-size:var(--ts-text-sm-font-size)}
[data-theme="dark"] .dr-error{color:var(--ts-red-200)}
.dr-pop{display:inline-grid;grid-template-columns:auto 1fr;border:1px solid var(--ts-border-subtle);border-radius:var(--ts-radius-xl);background:var(--ts-surface);box-shadow:var(--ts-shadow-overlay),var(--ts-shadow-hairline);overflow:hidden}
.dr-presets{display:grid;align-content:start;gap:var(--ts-space-0-5);min-inline-size:9.5rem;padding:var(--ts-space-3);border-inline-end:1px solid var(--ts-border-subtle);background:var(--ts-surface-secondary)}
.dr-presets button{all:unset;padding:var(--ts-space-2) var(--ts-space-2-5);border-radius:var(--ts-radius-md);color:var(--ts-text-secondary);font-size:var(--ts-text-sm-font-size);cursor:pointer}
.dr-presets button:hover{background:var(--ts-ghost-hover);color:var(--ts-text-emphasis)}
.dr-presets button[aria-pressed="true"]{background:var(--ts-primary-soft);color:var(--ts-text-emphasis);font-weight:500}
.dr-main{padding:var(--ts-space-4)}
.dr-nav{display:flex;align-items:center;gap:var(--ts-space-2);margin-block-end:var(--ts-space-3)}
.dr-nav h3{flex:1;margin:0;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:var(--ts-space-6);text-align:center;color:var(--ts-text-emphasis);font-size:var(--ts-text-sm-font-size);font-weight:600}
.dr-icon{all:unset;display:grid;place-items:center;inline-size:var(--ts-control-sm);block-size:var(--ts-control-sm);border-radius:var(--ts-radius-md);color:var(--ts-text-secondary);cursor:pointer}
.dr-icon:hover{background:var(--ts-ghost-hover);color:var(--ts-text-emphasis)}
.dr-icon svg{inline-size:var(--ts-icon-sm);block-size:var(--ts-icon-sm)}
[dir="rtl"] .dr-icon svg{transform:scaleX(-1)}
.dr-months{display:grid;grid-auto-flow:column;gap:var(--ts-space-6)}
.dr-grid{display:grid;grid-template-columns:repeat(7,2.25rem);row-gap:var(--ts-space-0-5)}
.dr-wd{display:grid;place-items:center;block-size:var(--ts-space-8);color:var(--ts-text-tertiary);font-size:var(--ts-text-xs-font-size);font-weight:500}
.dr-cell{block-size:2.25rem}
.dr-day{all:unset;position:relative;display:grid;place-items:center;block-size:2.25rem;color:var(--ts-text);font-size:var(--ts-text-sm-font-size);font-variant-numeric:tabular-nums;cursor:pointer}
.dr-day span{position:relative;z-index:1;display:grid;place-items:center;inline-size:2.25rem;block-size:2.25rem;border-radius:var(--ts-radius-full)}
.dr-day:hover span{background:var(--ts-ghost-hover)}
.dr-day.is-in,.dr-day.is-start,.dr-day.is-end{background:var(--ts-primary-soft)}
.dr-day.is-start{border-start-start-radius:var(--ts-radius-full);border-end-start-radius:var(--ts-radius-full)}
.dr-day.is-end{border-start-end-radius:var(--ts-radius-full);border-end-end-radius:var(--ts-radius-full)}
.dr-day.is-in.is-row-start,.dr-day.is-in.is-month-start{border-start-start-radius:var(--ts-radius-md);border-end-start-radius:var(--ts-radius-md)}
.dr-day.is-in.is-row-end{border-start-end-radius:var(--ts-radius-md);border-end-end-radius:var(--ts-radius-md)}
.dr-day.is-start span,.dr-day.is-end span{background:var(--ts-primary-solid);color:var(--ts-text-inverse);font-weight:600}
.dr-day.is-preview{background:transparent}
.dr-day.is-preview span{background:transparent;outline:1.5px dashed var(--ts-primary-solid);outline-offset:-2px;color:var(--ts-text-emphasis)}
.dr-day.is-pending{background:var(--ts-alpha-05)}
.dr-day.is-today span::after{content:"";position:absolute;inset-block-end:5px;inline-size:4px;block-size:4px;border-radius:50%;background:currentColor}
.dr-day.is-off{color:var(--ts-text-disabled);cursor:not-allowed}
.dr-day:focus-visible span{outline:2px solid var(--ts-ring);outline-offset:1px}
.dr-foot{display:flex;align-items:center;justify-content:space-between;gap:var(--ts-space-3);margin-block-start:var(--ts-space-3);padding-block-start:var(--ts-space-3);border-block-start:1px solid var(--ts-border-subtle);color:var(--ts-text-secondary);font-size:var(--ts-text-sm-font-size)}
.dr-foot b{color:var(--ts-text-emphasis);font-weight:600}
.dr-foot .dr-actions{display:flex;gap:var(--ts-space-1-5)}
`;
