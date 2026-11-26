// List-and-detail template comp (v0.4-trial-gaps 001, D35). Run: node apps/preview/.impeccable/mocks/list-detail/list-detail.mjs
// Writes list-detail-{en-light,en-dark,ar-light}.html. Library and template CSS are inlined from the repository.
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fmt, icon, page, pickerCss, R, utc } from "../date-range/kit.mjs";

const SRC = `${R}/packages/ui/src/squadmates`;
const tmp = mkdtempSync(`${tmpdir()}/list-detail-`);
for (const f of ["mascots", "roster", "draw"]) writeFileSync(`${tmp}/${f}.ts`, readFileSync(`${SRC}/${f}.ts`, "utf8").replaceAll('.js"', '.ts"'));
const { squadmateMarkup } = await import(`${tmp}/draw.ts`);
const { SQUADMATES } = await import(`${tmp}/roster.ts`);
const BY = Object.fromEntries(SQUADMATES.map((m) => [m.name.toLowerCase(), m]));
let uid = 0;
const mate = (slug, size, state = "idle") => {
	const n = ++uid;
	return squadmateMarkup(BY[slug].id, state, size).replaceAll(`sm-${slug}-`, `sm-${slug}${n}-`);
};

const copy = {
	en: {
		workspace: "Store workspace",
		store: "Northstar Goods",
		nav: ["Overview", "Orders", "Accounts", "Rules", "Chat"],
		squad: "Your squad",
		squadmates: [["petra", "Squad lead"], ["pisa", "Orders"], ["kyoto", "Support"], ["zurich", "Finance"]],
		user: ["Moe Ghashim", "Store owner"],
		title: "Orders",
		lead: "Orders from your store, newest first.",
		exportLabel: "Export",
		table: "Orders",
		search: "Search orders",
		statusAll: "Status: All",
		cols: ["Order", "Customer", "Date", "Status", "Total"],
		statuses: { paid: "Paid", pending: "Pending", processing: "Processing", refunded: "Refunded", failed: "Failed" },
		detail: {
			close: "Close order details",
			placed: "Placed",
			payment: "Payment",
			card: "Mada •• 4421",
			items: "Items",
			subtotal: "Subtotal",
			vat: "VAT 15%",
			shipping: "Shipping",
			free: "Free",
			total: "Total",
			activity: "Activity",
			handled: "Handled by Pisa",
			events: [["Order placed", "10:42"], ["Payment captured", "10:43"], ["Packed by Giza", "14:05"], ["Out for delivery", "Today, 09:10"]],
			refund: "Refund",
			contact: "Contact customer",
			confirm: "A person confirms refunds. Pisa cannot refund on its own.",
		},
		products: [["Linen throw, sand", 1, 289], ["Stoneware mug set", 2, 120], ["Olive wood board", 1, 149]],
		menuTitle: "Status filter, open",
		mobileTitle: "Phone: the detail opens as a sheet",
		emptyTitle: "No orders match",
		pageOf: "Showing 6 of 128",
	},
	ar: {
		workspace: "مساحة المتجر",
		store: "متجر النجم",
		nav: ["نظرة عامة", "الطلبات", "الحسابات", "القواعد", "المحادثة"],
		squad: "فريقك",
		squadmates: [["petra", "قائدة الفريق"], ["pisa", "الطلبات"], ["kyoto", "الدعم"], ["zurich", "المالية"]],
		user: ["Moe Ghashim", "صاحب المتجر"],
		title: "الطلبات",
		lead: "طلبات متجرك، الأحدث أولًا.",
		exportLabel: "تصدير",
		table: "الطلبات",
		search: "البحث في الطلبات",
		statusAll: "الحالة: الكل",
		cols: ["الطلب", "العميل", "التاريخ", "الحالة", "الإجمالي"],
		statuses: { paid: "مدفوع", pending: "معلّق", processing: "قيد التجهيز", refunded: "مسترد", failed: "فشل" },
		detail: {
			close: "إغلاق تفاصيل الطلب",
			placed: "تاريخ الطلب",
			payment: "الدفع",
			card: "مدى •• ٤٤٢١",
			items: "المنتجات",
			subtotal: "المجموع الفرعي",
			vat: "ضريبة القيمة المضافة ١٥٪",
			shipping: "الشحن",
			free: "مجاني",
			total: "الإجمالي",
			activity: "النشاط",
			handled: "يتابعه بيزا",
			events: [["تم الطلب", "١٠:٤٢"], ["تم تحصيل الدفع", "١٠:٤٣"], ["جهّزه الجيزة", "١٤:٠٥"], ["خرج للتوصيل", "اليوم، ٠٩:١٠"]],
			refund: "استرداد",
			contact: "مراسلة العميل",
			confirm: "يؤكد شخص عمليات الاسترداد. لا يسترد بيزا المبلغ وحده.",
		},
		products: [["غطاء كتان رملي", 1, 289], ["طقم أكواب فخارية", 2, 120], ["لوح خشب زيتون", 1, 149]],
		menuTitle: "مرشح الحالة مفتوحًا",
		mobileTitle: "الهاتف: التفاصيل تفتح في لوحة",
		emptyTitle: "لا توجد طلبات مطابقة",
		pageOf: "يعرض ٦ من ١٢٨",
	},
};

const orders = [
	["1047", "Sara Al-Qahtani", "سارة القحطاني", 25, "pending", 412],
	["1046", "Omar Haddad", "عمر حداد", 25, "processing", 1290],
	["1045", "Lina Farouk", "لينا فاروق", 24, "paid", 86.5],
	["1044", "Yousef Nasser", "يوسف ناصر", 23, "paid", 779.7],
	["1043", "Huda Salem", "هدى سالم", 22, "refunded", 240],
	["1042", "Khalid Mansour", "خالد منصور", 21, "failed", 155],
];
const SELECTED = "1044";
const tone = { paid: "success", pending: "warning", processing: "info", refunded: "default", failed: "danger" };
const AR_NAMES = { petra: "بترا", pisa: "بيزا", kyoto: "كيوتو", zurich: "زيورخ" };
const mateName = (slug, l) => (l === "ar" ? AR_NAMES[slug] : BY[slug].name);
const orderNo = (id, l) => `<bdi dir="ltr">#${num(Number(id), l).replace(/[,٬]/g, "")}</bdi>`;
const initials = (name) => name.split(/[\s-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const badge = (l, s) => `<span data-slot="badge" class="ts-badge ts-badge--${tone[s]}">${copy[l].statuses[s]}</span>`;
const num = (n, l) => fmt.num(n, l);

function sidebar(l) {
	const c = copy[l];
	const icons = ["M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z", "M5 7h14l-1.5 11h-11zM9 7a3 3 0 0 1 6 0", "M4 20V5l8-2v17M4 8h8m-5 3h1m-1 3h1m-1 3h1m5-7v10h5V10z", "M5 6h14M5 12h14M5 18h14M8 4v4m8 2v4m-5 2v4", "M4 5h16v11H9l-5 4z"];
	const items = c.nav
		.map((n, i) => `<a href="#" class="ts-sidebar-item" data-slot="button" ${i === 1 ? 'aria-current="page"' : ""}><span class="ts-sidebar-item-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${icons[i]}"/></svg></span><span class="ts-sidebar-item-label">${n}</span></a>`)
		.join("");
	const squad = c.squadmates
		.map(([s, role], i) => `<div class="ts-sidebar-agent${i === 0 ? " ts-sidebar-agent--featured" : ""}">${mate(s, i === 0 ? 40 : 28, s === "pisa" ? "running" : "idle")}<span class="ts-sidebar-agent-copy"><strong>${mateName(s, l)}</strong><span>${role}</span></span>${i ? '<span class="ts-sidebar-status ts-sidebar-status--online" aria-hidden="true"></span>' : ""}</div>`)
		.join("");
	return `<aside class="template-shell__sidebar" aria-label="${c.workspace}"><div class="ts-sidebar-shell"><nav aria-label="${c.workspace}" class="ts-sidebar template-shell__navigation"><div class="ts-sidebar-brand"><span class="ts-sidebar-brand-icon" aria-hidden="true">N</span><span class="ts-sidebar-brand-copy"><strong>${c.store}</strong><span>${c.workspace}</span></span></div><section class="ts-sidebar-section"><h2>${c.workspace}</h2><div>${items}</div></section><section class="ts-sidebar-section"><h2>${c.squad}</h2><div>${squad}</div></section><div class="ts-sidebar-user"><span class="ts-sidebar-avatar" aria-hidden="true">MG</span><span class="ts-sidebar-user-copy"><strong>${c.user[0]}</strong><span>${c.user[1]}</span></span></div></nav></div></aside>`;
}

function rows(l) {
	return orders
		.map(([id, en, ar, d, s, total]) => {
			const name = l === "ar" ? ar : en;
			return `<tr tabindex="0" class="${id === SELECTED ? "is-selected" : ""}" ${id === SELECTED ? 'aria-selected="true"' : ""}><td class="ts-data-table__mono"><b class="ld-order">${orderNo(id, l)}</b></td><td><span class="ts-data-table__entity"><span class="ts-data-table__tile ts-data-table__tile--primary" aria-hidden="true">${initials(name)}</span><span class="ts-data-table__entity-copy"><strong>${name}</strong></span></span></td><td>${fmt.short(utc(2026, 10, d), l)}</td><td>${badge(l, s)}</td><td class="is-end ld-num">${fmt.sar(total, l)}</td></tr>`;
		})
		.join("");
}

function table(l) {
	const c = copy[l];
	return `<section data-slot="card" data-variant="default" class="ts-card ts-card--flush ld-list"><header class="ts-card__header" data-slot="card-header"><div class="ts-card__heading"><div class="ts-card__title-row"><h2 class="ts-card__title">${c.table}</h2><span class="ts-card__count">${num(128, l)}</span></div></div><div class="ts-card__head-end"><div class="ts-card__actions" data-slot="card-actions"><div class="template-list__filters"><input type="search" aria-label="${c.search}" placeholder="${c.search}" class="ts-input ts-input--soft" data-slot="input" value=""/><button type="button" class="ts-button ts-button--soft ts-button--sm ts-menu-trigger" data-slot="menu-trigger" aria-haspopup="menu">${c.statusAll}<span class="ld-chev">${icon.chevron}</span></button></div></div></div></header><div class="ts-card__body" data-slot="card-body"><div class="ts-data-table__scroll" tabindex="0"><table class="ts-data-table"><caption>${c.table}</caption><thead><tr>${c.cols.map((h, i) => `<th scope="col"${i === 4 ? ' class="is-end"' : ""}>${h}</th>`).join("")}</tr></thead><tbody>${rows(l)}</tbody></table></div><footer class="ld-pager"><span>${c.pageOf}</span><span class="ld-pager__btns"><button class="ts-button ts-button--ghost ts-button--sm" data-slot="button" type="button" aria-label="Previous page"><span class="ld-flip">${icon.prev}</span></button><button class="ts-button ts-button--ghost ts-button--sm" data-slot="button" type="button" aria-label="Next page"><span class="ld-flip">${icon.next}</span></button></span></footer></div></section>`;
}

function detail(l, { sheet = false } = {}) {
	const c = copy[l];
	const d = c.detail;
	const [id, en, ar, day, s, total] = orders.find((o) => o[0] === SELECTED);
	const name = l === "ar" ? ar : en;
	const lines = c.products.map(([p, q, price]) => `<li><span class="ld-qty">${num(q, l)}×</span><span class="ld-prod">${p}</span><span class="ld-num">${fmt.sar(q * price, l)}</span></li>`).join("");
	const sub = c.products.reduce((a, [, q, p]) => a + q * p, 0);
	const vat = Math.round(sub * 0.15 * 100) / 100;
	const events = d.events.map(([e, t], i) => `<li class="${i === d.events.length - 1 ? "is-now" : ""}"><i></i><span>${e}</span><time>${t}</time></li>`).join("");
	return `<aside class="ld-detail${sheet ? " ld-detail--sheet" : ""}" aria-label="#${id}">
${sheet ? '<i class="phone__grab"></i>' : ""}
<header class="ld-detail__head"><div><p class="ld-eyebrow">${c.cols[0]}</p><h2>${orderNo(id, l)}</h2></div>${badge(l, s)}<button class="ld-close" aria-label="${d.close}">${icon.close}</button></header>
<div class="ld-customer"><span class="ts-data-table__tile ts-data-table__tile--primary" aria-hidden="true">${initials(name)}</span><span><strong>${name}</strong><span>${en.split(" ")[0].toLowerCase()}@example.com</span></span></div>
<dl class="ld-meta"><div><dt>${d.placed}</dt><dd>${fmt.short(utc(2026, 10, day), l)}</dd></div><div><dt>${d.payment}</dt><dd>${d.card}</dd></div></dl>
<section class="ld-sec"><h3>${d.items}</h3><ul class="ld-items">${lines}</ul>
<dl class="ld-totals"><div><dt>${d.subtotal}</dt><dd class="ld-num">${fmt.sar(sub, l)}</dd></div><div><dt>${d.vat}</dt><dd class="ld-num">${fmt.sar(vat, l)}</dd></div><div><dt>${d.shipping}</dt><dd>${d.free}</dd></div><div class="is-total"><dt>${d.total}</dt><dd class="ld-num">${fmt.sar(sub + vat, l)}</dd></div></dl></section>
<section class="ld-sec"><h3>${d.activity}</h3><div class="ld-handler">${mate("pisa", 32, "running")}<span>${d.handled}</span></div><ol class="ld-events">${events}</ol></section>
<footer class="ld-actions"><button class="ts-button ts-button--soft ts-button--md" data-slot="button" type="button" data-agent-confirm="${d.confirm}">${d.refund}</button><button class="ts-button ts-button--solid ts-button--md" data-slot="button" type="button">${d.contact}</button></footer>
<p class="ld-note">${d.confirm}</p>
</aside>`;
}

function menu(l) {
	const c = copy[l];
	const opts = ["all", "paid", "pending", "processing", "refunded", "failed"];
	const label = (o) => (o === "all" ? c.statusAll.split(/[:：]\s*/)[1] ?? c.statusAll : c.statuses[o]);
	const radio = opts.map((o, i) => `<div data-slot="menu-radio-item" role="menuitemradio" aria-checked="${i === 0}" ${i === 0 ? "data-checked" : ""} ${i === 2 ? "data-highlighted" : ""}><span data-slot="menu-item-indicator" ${i === 0 ? "data-checked" : "data-unchecked"}></span>${label(o)}</div>`).join("");
	return `<div class="ld-menu-demo"><button type="button" class="ts-button ts-button--soft ts-button--sm ts-menu-trigger" data-slot="menu-trigger" aria-expanded="true">${c.statusAll}<span class="ld-chev">${icon.chevron}</span></button><div data-slot="menu-content" role="menu" class="ld-menu">${radio}<div data-slot="menu-separator" role="separator"></div><div data-slot="menu-checkbox-item" role="menuitemcheckbox" aria-checked="true" data-checked><span data-slot="menu-item-indicator" data-checked></span>${l === "ar" ? "إخفاء الطلبات المؤرشفة" : "Hide archived orders"}</div></div></div>`;
}

function header(l) {
	const c = copy[l];
	return `<header data-slot="page-header" class="ts-page-header"><div class="ts-page-header__main"><div class="ts-page-header__copy"><h1 class="ts-page-header__title">${c.title}</h1><p class="ts-page-header__subtitle">${c.lead}</p></div><div class="ts-page-header__actions"><div class="dr-field" role="group">${icon.calendar}<span>${fmt.short(utc(2026, 10, 1), l)}</span><span class="dr-sep">–</span><span>${fmt.short(utc(2026, 10, 26), l)}</span></div><button class="ts-button ts-button--soft ts-button--md" data-slot="button" type="button"><span class="ld-ico">${icon.download}</span>${c.exportLabel}</button></div></div></header>`;
}

function phone(l) {
	const c = copy[l];
	const mobileRows = orders.slice(0, 4).map(([id, en, ar, d, s, total]) => `<li class="${id === SELECTED ? "is-selected" : ""}"><span><b>${orderNo(id, l)}</b> · ${l === "ar" ? ar : en}</span>${badge(l, s)}<span class="ld-num">${fmt.sar(total, l)}</span></li>`).join("");
	return `<div class="phone"><div class="phone__screen"><div class="ld-phone-page"><h1>${c.title}</h1><ul class="ld-mobile-list">${mobileRows}</ul></div><div class="phone__dim"></div>${detail(l, { sheet: true })}</div></div>`;
}

const css = `${pickerCss}
.board{max-inline-size:96rem;margin-inline:auto;padding:var(--ts-space-10) var(--ts-space-6) var(--ts-space-16)}
.eyebrow{margin:0 0 var(--ts-space-2);color:var(--ts-text-secondary);font-size:var(--ts-text-xs-font-size);font-weight:600;letter-spacing:.06em;text-transform:uppercase}
.board > h1{margin:0;color:var(--ts-text-emphasis);font-size:var(--ts-heading-3xl-font-size);line-height:var(--ts-heading-3xl-line-height);font-weight:600;letter-spacing:-.02em}
.lead{max-inline-size:64ch;margin:var(--ts-space-3) 0 var(--ts-space-8);color:var(--ts-text-secondary);font-size:var(--ts-text-md-font-size);line-height:1.55}
.frame{border:1px solid var(--ts-border-subtle);border-radius:var(--ts-radius-2xl);overflow:hidden;box-shadow:var(--ts-shadow-200)}
.frame .template-shell{min-block-size:0}
.ld-layout{display:grid;grid-template-columns:minmax(0,1fr) 23rem;gap:var(--ts-space-4);align-items:start}
.ld-order{color:var(--ts-text-emphasis);font-weight:600;font-variant-numeric:tabular-nums}
.ld-num{font-variant-numeric:tabular-nums;white-space:nowrap}
.ld-chev svg,.ld-ico svg,.ld-flip svg{inline-size:var(--ts-icon-sm);block-size:var(--ts-icon-sm)}
.ld-chev{display:inline-grid;margin-inline-start:var(--ts-space-0-5);opacity:.7}
[dir="rtl"] .ld-flip svg{transform:scaleX(-1)}
.ts-page-header__actions .ts-button{gap:var(--ts-space-1-5)}
.ld-pager{display:flex;align-items:center;justify-content:space-between;padding:var(--ts-space-2) var(--ts-space-4);border-block-start:1px solid var(--ts-border-subtle);color:var(--ts-text-secondary);font-size:var(--ts-text-sm-font-size)}
.ld-pager__btns{display:flex;gap:var(--ts-space-1)}
.ld-detail{position:sticky;inset-block-start:var(--ts-space-4);display:grid;gap:var(--ts-space-4);padding:var(--ts-space-5);border-radius:var(--ts-radius-xl);background:var(--ts-surface);box-shadow:var(--ts-shadow-hairline),var(--ts-shadow-100)}
.ld-detail__head{display:flex;align-items:flex-start;gap:var(--ts-space-2)}
.ld-detail__head > div{flex:1}
.ld-detail__head h2{margin:0;color:var(--ts-text-emphasis);font-size:var(--ts-heading-lg-font-size);line-height:1.2;font-weight:600;font-variant-numeric:tabular-nums}
.ld-eyebrow{margin:0 0 var(--ts-space-0-5);color:var(--ts-text-tertiary);font-size:var(--ts-text-xs-font-size)}
.ld-detail__head .ts-badge{margin-block-start:var(--ts-space-1)}
.ld-close{all:unset;display:grid;place-items:center;inline-size:var(--ts-control-sm);block-size:var(--ts-control-sm);border-radius:var(--ts-radius-md);color:var(--ts-text-secondary);cursor:pointer}
.ld-close:hover{background:var(--ts-ghost-hover)}
.ld-close svg{inline-size:var(--ts-icon-sm);block-size:var(--ts-icon-sm)}
.ld-customer{display:flex;align-items:center;gap:var(--ts-space-3)}
.ld-customer > span:last-child{display:grid}
.ld-customer strong{color:var(--ts-text-emphasis);font-weight:600;font-size:var(--ts-text-sm-font-size)}
.ld-customer > span:last-child > span{color:var(--ts-text-secondary);font-size:var(--ts-text-xs-font-size)}
.ld-meta{display:grid;grid-template-columns:1fr 1fr;gap:var(--ts-space-3);margin:0;padding:var(--ts-space-3);border-radius:var(--ts-radius-lg);background:var(--ts-surface-secondary)}
.ld-meta dt,.ld-totals dt{color:var(--ts-text-secondary);font-size:var(--ts-text-xs-font-size)}
.ld-meta dd{margin:var(--ts-space-0-5) 0 0;color:var(--ts-text-emphasis);font-size:var(--ts-text-sm-font-size);font-weight:500}
.ld-sec h3{margin:0 0 var(--ts-space-2);color:var(--ts-text-secondary);font-size:var(--ts-text-xs-font-size);font-weight:600;letter-spacing:.04em;text-transform:uppercase}
.ld-items{display:grid;gap:var(--ts-space-2);margin:0;padding:0;list-style:none;font-size:var(--ts-text-sm-font-size)}
.ld-items li{display:grid;grid-template-columns:auto 1fr auto;gap:var(--ts-space-2)}
.ld-qty{color:var(--ts-text-tertiary);font-variant-numeric:tabular-nums}
.ld-prod{color:var(--ts-text-emphasis)}
.ld-totals{display:grid;gap:var(--ts-space-1-5);margin:var(--ts-space-3) 0 0;padding-block-start:var(--ts-space-3);border-block-start:1px dashed var(--ts-border)}
.ld-totals div{display:flex;justify-content:space-between}
.ld-totals dd{margin:0;font-size:var(--ts-text-sm-font-size)}
.ld-totals .is-total dt,.ld-totals .is-total dd{color:var(--ts-text-emphasis);font-weight:600;font-size:var(--ts-text-md-font-size)}
.ld-handler{display:flex;align-items:center;gap:var(--ts-space-2);margin-block-end:var(--ts-space-2);color:var(--ts-text-secondary);font-size:var(--ts-text-sm-font-size)}
.ld-events{display:grid;gap:var(--ts-space-2);margin:0;padding:0;list-style:none;font-size:var(--ts-text-sm-font-size)}
.ld-events li{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:var(--ts-space-2);color:var(--ts-text)}
.ld-events i{inline-size:.5rem;block-size:.5rem;border-radius:50%;background:var(--ts-border-strong)}
.ld-events .is-now i{background:var(--ts-info-text)}
.ld-events time{color:var(--ts-text-tertiary);font-size:var(--ts-text-xs-font-size);font-variant-numeric:tabular-nums}
.ld-actions{display:grid;grid-template-columns:1fr 1fr;gap:var(--ts-space-2)}
.ld-note{margin:calc(-1 * var(--ts-space-2)) 0 0;color:var(--ts-text-tertiary);font-size:var(--ts-text-xs-font-size)}
.specimens{display:grid;grid-template-columns:minmax(0,1fr) 24rem;gap:var(--ts-space-6);margin-block-start:var(--ts-space-8);align-items:start}
.spec-cell{padding:var(--ts-space-6);border:1px solid var(--ts-border-subtle);border-radius:var(--ts-radius-xl);background:var(--ts-panel)}
.spec-cell > h2{margin:0 0 var(--ts-space-4);color:var(--ts-text-secondary);font-size:var(--ts-text-xs-font-size);font-weight:600;letter-spacing:.04em;text-transform:uppercase}
.ld-menu-demo{display:grid;justify-items:start;gap:var(--ts-space-1-5)}
.ld-menu-demo [data-slot="menu-content"]{position:static;min-inline-size:14rem}
.spec-notes{margin:var(--ts-space-6) 0 0;padding-inline-start:var(--ts-space-5);color:var(--ts-text-secondary);font-size:var(--ts-text-sm-font-size);line-height:1.6}
.spec-notes li+li{margin-block-start:var(--ts-space-2)}
.phone{inline-size:21rem;border-radius:2.25rem;padding:var(--ts-space-2-5);background:var(--ts-gray-1000);box-shadow:var(--ts-shadow-overlay),0 0 0 1px var(--ts-border-subtle)}
.phone__screen{position:relative;block-size:44rem;border-radius:1.75rem;overflow:hidden;background:var(--ts-panel)}
.phone__dim{position:absolute;inset:0;background:var(--ts-backdrop)}
.phone__grab{display:block;justify-self:center;inline-size:2.5rem;block-size:.3rem;border-radius:var(--ts-radius-full);background:var(--ts-border-strong)}
.ld-phone-page{padding:var(--ts-space-6) var(--ts-space-4)}
.ld-phone-page h1{margin:0 0 var(--ts-space-4);color:var(--ts-text-emphasis);font-size:var(--ts-heading-xl-font-size)}
.ld-mobile-list{display:grid;gap:var(--ts-space-2);margin:0;padding:0;list-style:none;font-size:var(--ts-text-sm-font-size)}
.ld-mobile-list li{display:grid;grid-template-columns:1fr auto;gap:var(--ts-space-1);padding:var(--ts-space-3);border-radius:var(--ts-radius-lg);background:var(--ts-surface)}
.ld-detail--sheet{position:absolute;inset-inline:0;inset-block:auto 0;align-content:start;max-block-size:86%;overflow:hidden;padding-block-start:var(--ts-space-2);border-radius:var(--ts-radius-2xl) var(--ts-radius-2xl) 0 0;gap:var(--ts-space-3)}
.ld-detail--sheet .ld-sec:last-of-type,.ld-detail--sheet .ld-note{display:none}
`;

function body(l) {
	const c = copy[l];
	const notes =
		l === "ar"
			? [
					"على الشاشات من ١٠٢٤ بكسل فأكثر تظهر التفاصيل بجانب الجدول وتبقى ثابتة أثناء التمرير. وتحت ذلك تفتح في لوحة من الأسفل.",
					"النقر على صف أو الضغط على Enter عليه يفتح تفاصيله ويحدده. والسهمان يتنقلان بين الصفوف ويحدّثان التفاصيل. وEscape يغلق التفاصيل ويعيد التركيز إلى الصف.",
					"أزرار الاسترداد تحمل data-agent-confirm، فلا ينفذها الوكيل دون موافقة شخص (D31).",
					"المبالغ بالريال السعودي، والأرقام عربية هندية في العربية.",
				]
			: [
					"At 1024 px and above the detail sits beside the table and stays in view while the table scrolls. Below that it opens as a bottom sheet.",
					"Clicking a row, or Enter on it, selects it and opens its detail. Up and Down move between rows and update the detail. Escape closes the detail and returns focus to the row.",
					"Refund carries data-agent-confirm, so an agent cannot run it without a person's answer (D31).",
					"Amounts are in SAR. Arabic uses Arabic-Indic digits.",
				];
	return `<main class="board">
<p class="eyebrow">v0.4 · ${l === "ar" ? "قالب جديد" : "New template"}</p><h1>${l === "ar" ? "القائمة والتفاصيل" : "List and detail"}</h1>
<p class="lead">${l === "ar" ? "جدول يمكن تصفيته، وبجانبه تفاصيل الصف المحدد. مبني فقط من مكوّنات المكتبة: الشريط الجانبي ورأس الصفحة والبطاقة والجدول والشارات والقائمة ومنتقي نطاق التاريخ." : "A filterable table with the selected row's detail beside it. Built only from library components: Sidebar, PageHeader, Card, DataTable, Badge, Menu and DateRangePicker."}</p>
<div class="frame"><div class="template-shell">${sidebar(l)}<main class="template-shell__panel">${header(l)}<div class="ld-layout">${table(l)}${detail(l)}</div></main></div></div>
<div class="specimens">
<section class="spec-cell"><h2>${c.menuTitle}</h2>${menu(l)}<ul class="spec-notes">${notes.map((n) => `<li>${n}</li>`).join("")}</ul></section>
<section class="spec-cell"><h2>${c.mobileTitle}</h2>${phone(l)}</section>
</div>
</main>`;
}

const out = (name) => new URL(name, import.meta.url);
for (const [l, theme] of [["en", "light"], ["en", "dark"], ["ar", "light"]]) {
	writeFileSync(out(`list-detail-${l}-${theme}.html`), page({ title: `List and detail comp (${l}, ${theme})`, locale: l, theme, css, body: body(l) }));
}
