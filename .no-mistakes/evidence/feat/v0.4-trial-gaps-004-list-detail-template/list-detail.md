# List and detail

Filter a table and show the selected order’s details.

Filter an orders table and show the selected order. At 1024 px and above, the detail stays beside the list. At smaller widths, selecting an order opens a bottom sheet.

Follows the [list and detail layout](https://github.com/moeghashim/tensquads-ui/blob/main/DESIGN.md#43-detail) and the [approved Orders comp](https://github.com/moeghashim/tensquads-ui/blob/main/apps/preview/.impeccable/mocks/list-detail/list-detail.mjs).

## Install and style

```sh
npm install github:moeghashim/tensquads-ui#<commit-sha>
```

Copy [ListDetail.tsx](https://github.com/moeghashim/tensquads-ui/blob/main/templates/list-detail/ListDetail.tsx), [list-detail.css](https://github.com/moeghashim/tensquads-ui/blob/main/templates/list-detail/list-detail.css) and the [AppShell template](https://github.com/moeghashim/tensquads-ui/blob/main/templates/app-shell/README.md). Keep the two template folders beside each other. Import both template styles after the library styles.

```css
@layer ui-sdk, tensquads;
@import "@tensquads/ui/fonts.css";
@import "@tensquads/ui/tokens.css";
@import "@tensquads/ui/styles.css";
@import "../app-shell/app-shell.css";
@import "./list-detail.css";
```

Set `lang` and `dir` on `<html>`. For Arabic, pass `locale="ar"` and set `lang="ar" dir="rtl"`. Dates, order numbers and SAR amounts use Arabic-Indic digits. Set `data-theme="light"` or `data-theme="dark"` to choose a theme.

## Use your order data

Pass `orders` newest first, with Gregorian ISO dates, prices in SAR and localized text. Pass the VAT amount from the order when available. The template otherwise calculates VAT at 15%. Set `links` to your app routes. Set `defaultRange` to the initial dates or `null` for all dates. Set `defaultSelectedId` to the order to show first on desktop. Replace the example date presets and payment copy with values for your page.

Bind `onExport` to export the filtered orders. Bind `onContact` to start a customer conversation and `onRefundRequest` to open your refund confirmation flow. The Refund button marks the amount and order number with `data-agent-confirm` so the agent bridge requires a person. The callback should request confirmation before moving money.

Press Enter or Space on a row to select it. While the desktop detail is open, Up and Down move between rows and update it. Escape closes the detail and returns focus to the selected row.

- [View source on GitHub](https://github.com/moeghashim/tensquads-ui/blob/main/templates/list-detail/ListDetail.tsx)

## ListDetail.tsx

```tsx
import {
	Button,
	Card,
	DataTable,
	type DateRange,
	DateRangePicker,
	Dialog,
	DialogBackdrop,
	DialogClose,
	DialogContent,
	DialogTitle,
	EmptyState,
	EntityCell,
	Input,
	Menu,
	MenuCheckboxItem,
	MenuContent,
	MenuItemIndicator,
	MenuRadioGroup,
	MenuRadioItem,
	MenuSeparator,
	MenuTrigger,
	PageHeader,
	Squadmate,
	StatusCell,
	squadmateCharacterName,
} from "@tensquads/ui/react";
import type { Locale } from "@tensquads/ui/schemas";
import { type KeyboardEvent, useId, useRef, useState, useSyncExternalStore } from "react";
import { AppShell, type AppShellProps, appShellCopy } from "../app-shell/AppShell";

const copy = {
	en: {
		workspace: "Store workspace",
		ownerRole: "Store owner",
		lead: "Squad lead",
		roles: { pisa: "Orders", kyoto: "Support", zurich: "Finance" },
		title: "Orders",
		subtitle: "Orders from your store, newest first.",
		export: "Export",
		dates: "Order dates",
		lastWeek: "Last 7 days",
		thisMonth: "This month",
		search: "Search orders",
		status: "Status",
		all: "All",
		hideArchived: "Hide archived orders",
		columns: { order: "Order", customer: "Customer", date: "Date", status: "Status", total: "Total" },
		statuses: { paid: "Paid", pending: "Pending", processing: "Processing", refunded: "Refunded", failed: "Failed" },
		close: "Close order details",
		placed: "Placed",
		payment: "Payment",
		card: "Mada •• 4421",
		items: "Items",
		sampleItem: "Order items",
		subtotal: "Subtotal",
		vat: "VAT 15%",
		shipping: "Shipping",
		free: "Free",
		total: "Total",
		activity: "Activity",
		handled: "Handled by Pisa",
		refund: "Refund",
		contact: "Contact customer",
		note: "A person confirms refunds. Pisa cannot refund on its own.",
		empty: "No orders match",
		tryAgain: "Change the search or clear the filters.",
		clear: "Clear filters",
		showing: (visible: string, total: string) => `Showing ${visible} of ${total}`,
		previous: "Previous page",
		next: "Next page",
	},
	ar: {
		workspace: "مساحة المتجر",
		ownerRole: "صاحب المتجر",
		lead: "قائدة الفريق",
		roles: { pisa: "الطلبات", kyoto: "الدعم", zurich: "المالية" },
		title: "الطلبات",
		subtitle: "طلبات متجرك، الأحدث أولًا.",
		export: "تصدير",
		dates: "تواريخ الطلبات",
		lastWeek: "آخر ٧ أيام",
		thisMonth: "هذا الشهر",
		search: "البحث في الطلبات",
		status: "الحالة",
		all: "الكل",
		hideArchived: "إخفاء الطلبات المؤرشفة",
		columns: { order: "الطلب", customer: "العميل", date: "التاريخ", status: "الحالة", total: "الإجمالي" },
		statuses: { paid: "مدفوع", pending: "معلّق", processing: "قيد التجهيز", refunded: "مسترد", failed: "فشل" },
		close: "إغلاق تفاصيل الطلب",
		placed: "تاريخ الطلب",
		payment: "الدفع",
		card: "مدى •• ٤٤٢١",
		items: "المنتجات",
		sampleItem: "منتجات الطلب",
		subtotal: "المجموع الفرعي",
		vat: "ضريبة القيمة المضافة ١٥٪",
		shipping: "الشحن",
		free: "مجاني",
		total: "الإجمالي",
		activity: "النشاط",
		handled: "يتابعه بيزا",
		refund: "استرداد",
		contact: "مراسلة العميل",
		note: "يؤكد شخص عمليات الاسترداد. لا يسترد بيزا المبلغ وحده.",
		empty: "لا توجد طلبات مطابقة",
		tryAgain: "غيّر عبارة البحث أو امسح عوامل التصفية.",
		clear: "مسح عوامل التصفية",
		showing: (visible: string, total: string) => `يعرض ${visible} من ${total}`,
		previous: "الصفحة السابقة",
		next: "الصفحة التالية",
	},
};

const statusTone = {
	paid: "success",
	pending: "warning",
	processing: "info",
	refunded: "default",
	failed: "danger",
} as const;
type OrderStatus = keyof typeof statusTone;
type StatusFilter = OrderStatus | "all";

type Localized = Record<Locale, string>;
type OrderItem = { name: Localized; quantity: number; unitPrice: number };
type OrderEvent = { label: Localized; time: Localized };
export type Order = {
	id: number;
	customer: Localized;
	email: string;
	date: string;
	status: OrderStatus;
	items: readonly OrderItem[];
	events: readonly OrderEvent[];
	vat?: number;
	archived?: boolean;
};

const samples = [
	["Sara Al-Qahtani", "سارة القحطاني", 25, "pending", 412],
	["Omar Haddad", "عمر حداد", 25, "processing", 1290],
	["Lina Farouk", "لينا فاروق", 24, "paid", 86.5],
	["Yousef Nasser", "يوسف ناصر", 23, "paid", 779.7],
	["Huda Salem", "هدى سالم", 22, "refunded", 240],
	["Khalid Mansour", "خالد منصور", 21, "failed", 155],
] satisfies [string, string, number, OrderStatus, number][];
const featuredItems: OrderItem[] = [
	{ name: { en: "Linen throw, sand", ar: "غطاء كتان رملي" }, quantity: 1, unitPrice: 289 },
	{ name: { en: "Stoneware mug set", ar: "طقم أكواب فخارية" }, quantity: 2, unitPrice: 120 },
	{ name: { en: "Olive wood board", ar: "لوح خشب زيتون" }, quantity: 1, unitPrice: 149 },
];
const placedEvent = { label: { en: "Order placed", ar: "تم الطلب" }, time: { en: "10:42", ar: "١٠:٤٢" } };
const featuredEvents: OrderEvent[] = [
	placedEvent,
	{ label: { en: "Payment captured", ar: "تم تحصيل الدفع" }, time: { en: "10:43", ar: "١٠:٤٣" } },
	{ label: { en: "Packed by Giza", ar: "جهّزه الجيزة" }, time: { en: "14:05", ar: "١٤:٠٥" } },
	{ label: { en: "Out for delivery", ar: "خرج للتوصيل" }, time: { en: "Today, 09:10", ar: "اليوم، ٠٩:١٠" } },
];

const initialId = 1044;
const pageSize = 6;
const initialRange = { start: "2026-11-01", end: "2026-11-26" };

const demoOrders: Order[] = Array.from({ length: 23 }, (_, page) =>
	samples.map(([en, ar, day, status, total], position) => {
		const index = page * pageSize + position;
		const id = 1047 - index;
		const date = page === 0 ? day : 20 - Math.floor((index - pageSize) / 7);
		const net = Math.round((total * 100) / 1.15);
		return {
			id,
			customer: { en, ar },
			email: `${en.split(" ", 1).join("").toLowerCase()}@example.com`,
			date: `2026-11-${String(date).padStart(2, "0")}`,
			status,
			items:
				id === initialId
					? featuredItems
					: [
							{
								name: { en: copy.en.sampleItem, ar: copy.ar.sampleItem },
								quantity: 1,
								unitPrice: net / 100,
							},
						],
			events: id === initialId ? featuredEvents : [placedEvent],
			vat: (Math.round(total * 100) - net) / 100,
			archived: index >= 128,
		};
	}),
)
	.flat()
	.slice(0, 134);

const icons = {
	previous: "m14.5 6-6 6 6 6",
	next: "m9.5 6 6 6-6 6",
	chevron: "m7 10 5 5 5-5",
	close: "M6 6l12 12M18 6 6 18",
	download: "M12 4v11m-5-5 5 5 5-5M5 19h14",
};

function Icon({ name }: { name: keyof typeof icons }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d={icons[name]} />
		</svg>
	);
}

const desktopQuery = "(min-width: 1024px)";
function subscribeToDesktop(change: () => void) {
	const media = window.matchMedia(desktopQuery);
	media.addEventListener("change", change);
	return () => media.removeEventListener("change", change);
}
const getDesktop = () => window.matchMedia(desktopQuery).matches;
const getServerDesktop = () => true;

function formatters(locale: Locale) {
	const numberLocale = locale === "ar" ? "ar-EG-u-nu-arab" : "en-US";
	const number = new Intl.NumberFormat(numberLocale);
	const id = new Intl.NumberFormat(numberLocale, { useGrouping: false });
	const currency = new Intl.NumberFormat(numberLocale, { style: "currency", currency: "SAR" });
	const date = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-arab" : "en-US", {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	});
	return {
		number: (value: number) => number.format(value),
		orderNumber: (value: number) => `#${id.format(value)}`,
		money: (value: number) => currency.format(value),
		date: (value: string) => date.format(new Date(value)),
	};
}

function totals({ items, vat: recordedVat }: Order) {
	const subtotal = items.reduce((sum, item) => sum + Math.round(item.unitPrice * 100) * item.quantity, 0);
	const vat = recordedVat === undefined ? Math.round(subtotal * 0.15) : Math.round(recordedVat * 100);
	return { subtotal: subtotal / 100, vat: vat / 100, total: (subtotal + vat) / 100 };
}

export type ListDetailProps = {
	locale?: Locale;
	links?: AppShellProps["links"];
	orders?: readonly Order[];
	defaultRange?: DateRange | null;
	defaultSelectedId?: number;
	onExport?: (orders: readonly Order[]) => void;
	onRefundRequest?: (order: Order) => void;
	onContact?: (order: Order) => void;
};

type OrderDetailProps = Pick<ListDetailProps, "onRefundRequest" | "onContact"> & {
	order: Order;
	locale: Locale;
	format: ReturnType<typeof formatters>;
	titleId: string;
	sheet?: boolean;
	onClose: () => void;
};

function OrderDetail({ order, locale, format, titleId, sheet, onClose, onRefundRequest, onContact }: OrderDetailProps) {
	const t = copy[locale];
	const { subtotal, vat, total } = totals(order);
	const orderNumber = format.orderNumber(order.id);
	const refundLabel =
		locale === "ar"
			? `استرداد ${format.money(total)} للطلب ${orderNumber}.`
			: `Refund ${format.money(total)} for order ${orderNumber}.`;
	const orderTitle = <bdi dir="ltr">{orderNumber}</bdi>;
	const close = (
		<Button variant="ghost" size="sm" iconOnly aria-label={t.close}>
			<Icon name="close" />
		</Button>
	);
	return (
		<div className="template-order__body">
			<header className="template-order__head">
				<div>
					<p>{t.columns.order}</p>
					{sheet ? <DialogTitle id={titleId}>{orderTitle}</DialogTitle> : <h2 id={titleId}>{orderTitle}</h2>}
				</div>
				<StatusCell label={t.statuses[order.status]} tone={statusTone[order.status]} />
				{sheet ? (
					<DialogClose aria-label={t.close} render={close} />
				) : (
					<Button variant="ghost" size="sm" iconOnly aria-label={t.close} onClick={onClose}>
						<Icon name="close" />
					</Button>
				)}
			</header>
			<div className="template-order__customer">
				<EntityCell name={order.customer[locale]} detail={order.email} />
			</div>
			<dl className="template-order__meta">
				<div>
					<dt>{t.placed}</dt>
					<dd>
						<time dateTime={order.date}>{format.date(order.date)}</time>
					</dd>
				</div>
				<div>
					<dt>{t.payment}</dt>
					<dd>{t.card}</dd>
				</div>
			</dl>
			<section>
				<h3>{t.items}</h3>
				<ul className="template-order__items">
					{order.items.map((item) => (
						<li key={item.name.en}>
							<span>{format.number(item.quantity)}×</span>
							<span>{item.name[locale]}</span>
							<bdi>{format.money(item.quantity * item.unitPrice)}</bdi>
						</li>
					))}
				</ul>
				<dl className="template-detail-rows template-order__totals">
					<dt>{t.subtotal}</dt>
					<dd>
						<bdi>{format.money(subtotal)}</bdi>
					</dd>
					<dt>{t.vat}</dt>
					<dd>
						<bdi>{format.money(vat)}</bdi>
					</dd>
					<dt>{t.shipping}</dt>
					<dd>{t.free}</dd>
					<dt>{t.total}</dt>
					<dd>
						<bdi>{format.money(total)}</bdi>
					</dd>
				</dl>
			</section>
			<section className="template-order__activity">
				<h3>{t.activity}</h3>
				<div className="template-order__handler">
					<Squadmate agent="pisa" size={32} state="running" locale={locale} />
					{t.handled}
				</div>
				<ol className="template-order__events">
					{order.events.map((event) => (
						<li key={event.label.en}>
							<span>{event.label[locale]}</span>
							<span>{event.time[locale]}</span>
						</li>
					))}
				</ol>
			</section>
			<footer className="template-order__actions">
				<Button
					variant="soft"
					data-agent-confirm={refundLabel}
					disabled={!onRefundRequest || order.status !== "paid"}
					onClick={() => onRefundRequest?.(order)}
				>
					{t.refund}
				</Button>
				<Button disabled={!onContact} onClick={() => onContact?.(order)}>
					{t.contact}
				</Button>
			</footer>
			<p className="template-order__note">{t.note}</p>
		</div>
	);
}

export function ListDetail({
	locale = "en",
	links,
	orders = demoOrders,
	defaultRange = initialRange,
	defaultSelectedId = initialId,
	onExport,
	onRefundRequest,
	onContact,
}: ListDetailProps) {
	const t = copy[locale];
	const format = formatters(locale);
	const shell = appShellCopy[locale];
	const desktop = useSyncExternalStore(subscribeToDesktop, getDesktop, getServerDesktop);
	const uid = useId();
	const activeRow = useRef<HTMLTableRowElement | null>(null);
	const [selectedId, setSelectedId] = useState<number | undefined>(defaultSelectedId);
	const [sheetOpen, setSheetOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [status, setStatus] = useState<StatusFilter>("all");
	const [hideArchived, setHideArchived] = useState(true);
	const [range, setRange] = useState(defaultRange);
	const [page, setPage] = useState(0);

	const search = query.trim().toLocaleLowerCase(locale).replace(/^#/, "");
	const matching = orders.filter(
		(order) =>
			(!range || (order.date >= range.start && order.date <= range.end)) &&
			(status === "all" || order.status === status) &&
			(!hideArchived || !order.archived) &&
			[order.customer[locale], format.orderNumber(order.id).slice(1), String(order.id)].some((value) =>
				value.toLocaleLowerCase(locale).includes(search),
			),
	);
	const lastPage = Math.max(0, Math.ceil(matching.length / pageSize) - 1);
	const currentPage = Math.min(page, lastPage);
	const offset = currentPage * pageSize;
	const visible = matching.slice(offset, offset + pageSize);
	const selected = visible.find(({ id }) => id === selectedId);
	const detailOpen = selected !== undefined && (desktop || sheetOpen);
	const titleId = `${uid}-title`;

	function rowFor(id: number) {
		return document.getElementById(`${uid}-order-${id}`)?.closest("tr") ?? null;
	}

	function selectOrder(id: number) {
		activeRow.current = rowFor(id);
		setSelectedId(id);
		if (!desktop) setSheetOpen(true);
	}

	function closeDetail(restoreFocus: boolean) {
		if (restoreFocus && selected) rowFor(selected.id)?.focus();
		setSelectedId(undefined);
		setSheetOpen(false);
	}

	function resetPage() {
		setPage(0);
		closeDetail(false);
	}

	function onListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
		if (!(event.target instanceof HTMLTableRowElement)) return;
		if (event.key === "Escape" && desktop && detailOpen) {
			event.preventDefault();
			closeDetail(true);
		}
		if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
		const next = event.key === "ArrowUp" ? event.target.previousElementSibling : event.target.nextElementSibling;
		event.preventDefault();
		if (next instanceof HTMLTableRowElement) {
			next.focus();
			const order = visible[next.sectionRowIndex];
			if (desktop && detailOpen && order) selectOrder(order.id);
		}
	}

	const panel = selected && (
		<OrderDetail
			order={selected}
			locale={locale}
			format={format}
			titleId={titleId}
			sheet={!desktop}
			onClose={() => closeDetail(true)}
			onRefundRequest={onRefundRequest}
			onContact={onContact}
		/>
	);

	return (
		<AppShell
			locale={locale}
			current="orders"
			links={links}
			showLauncher={false}
			copy={{
				...shell,
				workspace: t.workspace,
				brandMark: "N",
				owner: "Moe Ghashim",
				initials: "MG",
				ownerRole: t.ownerRole,
			}}
			squad={[
				{
					agent: "petra",
					name: squadmateCharacterName("petra", locale),
					roleLabel: t.lead,
					meta: t.lead,
					state: "idle",
					status: "online",
					featured: true,
				},
				...(["pisa", "kyoto", "zurich"] as const).map((agent) => ({
					agent,
					name: squadmateCharacterName(agent, locale),
					roleLabel: t.roles[agent],
					state: agent === "pisa" ? ("running" as const) : ("idle" as const),
					status: "online" as const,
				})),
			]}
		>
			<PageHeader
				title={t.title}
				subtitle={t.subtitle}
				actions={
					<>
						<DateRangePicker
							locale={locale}
							aria-label={t.dates}
							value={range}
							onValueChange={(value) => {
								setRange(value);
								resetPage();
							}}
							presets={[
								{ label: t.lastWeek, value: { start: "2026-11-20", end: "2026-11-26" } },
								{ label: t.thisMonth, value: initialRange },
							]}
						/>
						<Button
							className="template-order__export"
							variant="soft"
							disabled={!onExport}
							onClick={() => onExport?.(matching)}
						>
							<Icon name="download" />
							{t.export}
						</Button>
					</>
				}
			/>
			<div className="template-order__layout">
				{/* biome-ignore lint/a11y/noStaticElementInteractions: Delegate keys from DataTable's focusable rows. */}
				<div className="template-order__list" onKeyDown={onListKeyDown}>
					<Card
						title={t.title}
						count={format.number(matching.length)}
						flush={visible.length > 0}
						actions={
							<div className="template-order__filters">
								<Input
									type="search"
									aria-label={t.search}
									placeholder={t.search}
									value={query}
									onValueChange={(value) => {
										setQuery(value);
										resetPage();
									}}
								/>
								<Menu>
									<MenuTrigger variant="soft" className="template-order__status">
										{`${t.status}: ${status === "all" ? t.all : t.statuses[status]}`} <Icon name="chevron" />
									</MenuTrigger>
									<MenuContent>
										<MenuRadioGroup
											aria-label={t.status}
											value={status}
											onValueChange={(value) => {
												setStatus(value as StatusFilter);
												resetPage();
											}}
										>
											<MenuRadioItem value="all">
												<MenuItemIndicator keepMounted />
												{t.all}
											</MenuRadioItem>
											{(Object.keys(statusTone) as OrderStatus[]).map((value) => (
												<MenuRadioItem key={value} value={value}>
													<MenuItemIndicator keepMounted />
													{t.statuses[value]}
												</MenuRadioItem>
											))}
										</MenuRadioGroup>
										<MenuSeparator />
										<MenuCheckboxItem
											value="hide-archived"
											checked={hideArchived}
											onCheckedChange={(checked) => {
												setHideArchived(checked);
												resetPage();
											}}
										>
											<MenuItemIndicator keepMounted />
											{t.hideArchived}
										</MenuCheckboxItem>
									</MenuContent>
								</Menu>
							</div>
						}
					>
						{visible.length > 0 ? (
							<>
								<DataTable
									caption={t.title}
									columns={Object.entries(t.columns).map(([key, label]) => ({
										key,
										label,
										align: key === "total" ? "end" : "start",
									}))}
									selectedId={detailOpen ? String(selectedId) : undefined}
									onRowSelect={(id) => selectOrder(Number(id))}
									rows={visible.map((order) => ({
										id: String(order.id),
										cells: {
											order: (
												<bdi dir="ltr" className="template-order__number" id={`${uid}-order-${order.id}`}>
													{format.orderNumber(order.id)}
												</bdi>
											),
											customer: <EntityCell name={order.customer[locale]} detail="" />,
											date: format.date(order.date),
											status: (
												<StatusCell label={t.statuses[order.status]} tone={statusTone[order.status]} />
											),
											total: <bdi>{format.money(totals(order).total)}</bdi>,
										},
									}))}
								/>
								<footer className="template-order__pager">
									<span aria-live="polite">
										{t.showing(format.number(offset + visible.length), format.number(matching.length))}
									</span>
									<div>
										<Button
											variant="ghost"
											size="sm"
											iconOnly
											aria-label={t.previous}
											disabled={currentPage === 0}
											onClick={() => {
												setPage(currentPage - 1);
												closeDetail(false);
											}}
										>
											<Icon name="previous" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											iconOnly
											aria-label={t.next}
											disabled={currentPage === lastPage}
											onClick={() => {
												setPage(currentPage + 1);
												closeDetail(false);
											}}
										>
											<Icon name="next" />
										</Button>
									</div>
								</footer>
							</>
						) : (
							<EmptyState
								title={t.empty}
								description={t.tryAgain}
								action={
									<Button
										variant="soft"
										onClick={() => {
											setQuery("");
											setStatus("all");
											setRange(null);
											setHideArchived(true);
											resetPage();
										}}
									>
										{t.clear}
									</Button>
								}
							/>
						)}
					</Card>
				</div>
				{desktop && detailOpen && (
					<aside
						className="template-order__panel"
						aria-labelledby={titleId}
						onKeyDown={(event) => {
							if (event.key === "Escape") {
								event.preventDefault();
								closeDetail(true);
							}
						}}
					>
						{panel}
					</aside>
				)}
			</div>
			{!desktop && (
				<Dialog
					open={detailOpen}
					onOpenChange={(open) => {
						if (!open) closeDetail(false);
					}}
				>
					<DialogBackdrop />
					<DialogContent
						className="template-order__sheet"
						initialFocus="content"
						finalFocus={() => activeRow.current}
					>
						{panel}
					</DialogContent>
				</Dialog>
			)}
		</AppShell>
	);
}
```

## list-detail.css

```css
@layer tensquads {
	.template-detail-rows {
		display: grid;
		grid-template-columns: minmax(6rem, 1fr) minmax(0, 2fr);
		gap: var(--ts-space-2) var(--ts-space-4);
		margin: 0;
		font-size: var(--ts-text-sm-font-size);
	}
	.template-detail-rows dt {
		color: var(--ts-text-secondary);
	}
	.template-detail-rows dd {
		min-inline-size: 0;
		margin: 0;
		color: var(--ts-text-emphasis);
		font-family: var(--ts-font-mono);
		overflow-wrap: anywhere;
	}
}

.template-order__layout {
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	align-items: start;
	gap: var(--ts-space-4);
}

@media (min-width: 1024px) {
	.template-order__layout:has(.template-order__panel) {
		grid-template-columns: minmax(0, 1fr) clamp(16rem, 28vw, 23rem);
	}
}

.template-order__list .ts-card__header {
	flex-wrap: wrap;
}

.template-order__list .ts-data-table__entity-copy > span:empty {
	display: none;
}

.template-order__filters,
.template-order__pager,
.template-order__pager > div {
	display: flex;
	align-items: center;
	gap: var(--ts-space-1);
}

.template-order__filters {
	flex-wrap: wrap;
}

.template-order__filters [data-slot="input"] {
	inline-size: 12rem;
	max-inline-size: 100%;
}

.template-order__status {
	min-block-size: var(--ts-control-sm);
}

.template-order__export svg,
.template-order__status svg,
.template-order__pager svg,
.template-order__head button svg {
	flex: none;
	inline-size: var(--ts-icon-sm);
	block-size: var(--ts-icon-sm);
}

.template-order__pager {
	justify-content: space-between;
	padding: var(--ts-space-2) var(--ts-space-4);
	color: var(--ts-text-secondary);
	font-size: var(--ts-text-sm-font-size);
}

.template-order__pager:dir(rtl) svg {
	transform: scaleX(-1);
}

.template-order__number {
	color: var(--ts-text-emphasis);
	font-weight: var(--ts-heading-xs-font-weight);
	font-variant-numeric: tabular-nums;
}

.template-order__panel {
	position: sticky;
	inset-block-start: var(--ts-space-4);
	max-block-size: calc(100dvb - 2 * var(--ts-space-4));
	overflow: auto;
	border-radius: var(--ts-radius-xl);
	background: var(--ts-surface);
	box-shadow: var(--ts-shadow-hairline), var(--ts-shadow-100);
}

.template-order__body {
	display: grid;
	gap: var(--ts-space-4);
	padding: var(--ts-space-5);
	font-family: var(--ts-font-sans);
	line-height: var(--ts-text-md-line-height);
}

.template-order__head {
	display: flex;
	align-items: start;
	gap: var(--ts-space-2);
}

.template-order__head > div {
	flex: 1;
}

.template-order__head h2 {
	margin: 0;
	color: var(--ts-text-emphasis);
	font-size: var(--ts-heading-lg-font-size);
	font-weight: var(--ts-heading-lg-font-weight);
	line-height: var(--ts-heading-lg-line-height);
	font-variant-numeric: tabular-nums;
}

.template-order__head p,
.template-order__note {
	margin: 0;
	color: var(--ts-text-secondary);
	font-size: var(--ts-text-xs-font-size);
}

.template-order__head p {
	margin-block-end: var(--ts-space-0-5);
}

.template-order__head .ts-badge {
	margin-block-start: var(--ts-space-1);
}

.template-order__customer .ts-data-table__entity {
	min-inline-size: 0;
}

.template-order__customer .ts-data-table__entity-copy > span {
	inline-size: auto;
	min-inline-size: 0;
	font-size: var(--ts-text-xs-font-size);
	direction: ltr;
	text-align: match-parent;
}

.template-order__meta {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: var(--ts-space-3);
	margin: 0;
	padding: var(--ts-space-3);
	border-radius: var(--ts-radius-lg);
	background: var(--ts-surface-secondary);
}

.template-order__meta dt {
	color: var(--ts-text-secondary);
	font-size: var(--ts-text-xs-font-size);
}

.template-order__meta dd {
	margin: 0;
	margin-block-start: var(--ts-space-0-5);
	color: var(--ts-text-emphasis);
	font-size: var(--ts-text-sm-font-size);
	font-weight: var(--ts-field-value-font-weight);
}

.template-order__body h3 {
	margin: 0;
	margin-block-end: var(--ts-space-2);
	color: var(--ts-text-secondary);
	font:
		var(--ts-small-caps-md-font-weight) var(--ts-small-caps-md-font-size) / var(--ts-small-caps-md-line-height)
		var(--ts-small-caps-md-font-family);
	letter-spacing: var(--ts-small-caps-md-letter-spacing);
	text-transform: uppercase;
}

.template-order__items,
.template-order__events {
	display: grid;
	gap: var(--ts-space-2);
	margin: 0;
	padding: 0;
	list-style: none;
	font-size: var(--ts-text-sm-font-size);
}

.template-order__items li {
	display: grid;
	grid-template-columns: auto minmax(0, 1fr) auto;
	gap: var(--ts-space-2);
}

.template-order__items li > :first-child {
	color: var(--ts-text-secondary);
}

.template-order__items bdi,
.template-order__totals bdi,
.template-order__events li > :last-child {
	font-variant-numeric: tabular-nums;
}

.template-order__totals.template-detail-rows {
	grid-template-columns: minmax(0, 1fr) auto;
	gap: var(--ts-space-1-5) var(--ts-space-3);
	align-items: baseline;
	margin-block-start: var(--ts-space-3);
	padding-block-start: var(--ts-space-3);
	border-block-start: thin dashed var(--ts-border);
}

.template-order__totals dt {
	font-size: var(--ts-text-xs-font-size);
}

.template-order__totals dd {
	font-family: inherit;
	text-align: end;
}

.template-order__totals :is(dt, dd):last-of-type {
	color: var(--ts-text-emphasis);
	font-size: var(--ts-text-md-font-size);
	font-weight: var(--ts-heading-xs-font-weight);
}

.template-order__handler {
	display: flex;
	align-items: center;
	gap: var(--ts-space-2);
	margin-block-end: var(--ts-space-2);
	color: var(--ts-text-secondary);
	font-size: var(--ts-text-sm-font-size);
}

.template-order__events li {
	display: grid;
	grid-template-columns: auto minmax(0, 1fr) auto;
	align-items: center;
	gap: var(--ts-space-2);
}

.template-order__events li::before {
	content: "";
	inline-size: var(--ts-space-2);
	block-size: var(--ts-space-2);
	border-radius: var(--ts-radius-full);
	background: var(--ts-border-strong);
}

.template-order__events li:last-child::before {
	background: var(--ts-info-text);
}

.template-order__events li > :last-child {
	color: var(--ts-text-secondary);
	font-size: var(--ts-text-xs-font-size);
	text-align: end;
}

.template-order__actions {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: var(--ts-space-2);
}

.template-order__actions button {
	white-space: normal;
}

.template-order__note {
	margin-block-start: calc(-1 * var(--ts-space-2));
}

[data-slot="dialog-content"].template-order__sheet {
	inset-block: auto 0;
	inset-inline: 0;
	inline-size: 100%;
	max-block-size: 86dvb;
	gap: 0;
	padding: 0;
	translate: none;
	border-end-start-radius: 0;
	border-end-end-radius: 0;
	background: var(--ts-surface);
}

.template-order__sheet::before {
	content: "";
	justify-self: center;
	inline-size: var(--ts-space-10);
	block-size: var(--ts-space-1);
	margin-block-start: var(--ts-space-2);
	border-radius: var(--ts-radius-full);
	background: var(--ts-border-strong);
}

.template-order__sheet .template-order__body {
	line-height: var(--ts-text-sm-line-height);
	gap: var(--ts-space-3);
	padding-block-start: var(--ts-space-2);
	padding-block-end: max(var(--ts-space-5), env(safe-area-inset-bottom));
}

.template-order__sheet :is(.template-order__activity, .template-order__note) {
	display: none;
}

@media (max-width: 47.5rem) {
	.template-order__filters,
	.template-order__filters [data-slot="input"] {
		inline-size: 100%;
	}
}
```
