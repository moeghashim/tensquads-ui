import {
	Badge,
	BarChart,
	Bars,
	Card,
	DataTable,
	EmptyState,
	PageHeader,
	StatTile,
	StatusCell,
} from "@tensquads/ui/react";
import type { Locale } from "@tensquads/ui/schemas";

const defaults = {
	en: {
		title: "Store overview",
		subtitle: "Revenue, orders and work across your squad.",
		demo: "Sample data",
		metrics: ["Revenue", "Orders", "Average order", "Profit margin", "Tasks done by squads", "Hours saved"],
		week: "This week",
		comparison: "vs last week",
		trend: "Revenue, last 14 days",
		daily: "Daily revenue",
		queue: "Work by squad",
		queueWindow: "Tasks completed this week",
		squads: ["Orders", "Support", "Marketing", "Finance", "Inventory"],
		activity: "Recent activity",
		columns: ["Task", "Squad", "Status"],
		completed: "Done",
		tasks: ["Update tracking links", "Review refund requests", "Draft a stock reorder"],
		empty: "No activity yet",
		emptyDetail: "Completed squad tasks appear here.",
	},
	ar: {
		title: "نظرة عامة على المتجر",
		subtitle: "الإيرادات والطلبات وأعمال فريقك.",
		demo: "بيانات تجريبية",
		metrics: ["الإيرادات", "الطلبات", "متوسط الطلب", "هامش الربح", "المهام المنجزة", "الوقت الموفر"],
		week: "هذا الأسبوع",
		comparison: "مقارنة بالأسبوع الماضي",
		trend: "الإيرادات في آخر أسبوعين",
		daily: "الإيرادات اليومية",
		queue: "عمل الفريق",
		queueWindow: "المهام المنجزة هذا الأسبوع",
		squads: ["الطلبات", "الدعم", "التسويق", "المالية", "المخزون"],
		activity: "آخر الأنشطة",
		columns: ["المهمة", "الفريق", "الحالة"],
		completed: "تم",
		tasks: ["تحديث روابط التتبع", "مراجعة طلبات الاسترداد", "إعداد طلب تزويد المخزون"],
		empty: "لا توجد أنشطة بعد",
		emptyDetail: "تظهر هنا المهام التي أنجزها فريقك.",
	},
};

type Task = { id: string; title: string; squad: string };

export type DashboardProps = { locale?: Locale; copy?: typeof defaults.en; tasks?: Task[] };

export function Dashboard({ locale = "en", copy = defaults[locale], tasks }: DashboardProps) {
	const numberLocale = locale === "ar" ? "ar-EG-u-nu-arab" : "en-US";
	const number = new Intl.NumberFormat(numberLocale);
	const money = new Intl.NumberFormat(numberLocale, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
	const cents = new Intl.NumberFormat(numberLocale, { style: "currency", currency: "USD" });
	const percent = new Intl.NumberFormat(numberLocale, { style: "percent" });
	const delta = new Intl.NumberFormat(numberLocale, { style: "percent", signDisplay: "always" });
	const day = new Intl.DateTimeFormat(numberLocale, { day: "numeric", timeZone: "UTC" });
	const revenues = [980, 1040, 1020, 1110, 1060, 1150, 1160, 1010, 1120, 1090, 1250, 1180, 1330, 1440];
	const metrics = [
		{
			id: "revenue",
			value: money.format(8420),
			delta: { text: `${delta.format(0.12)} ${copy.comparison}`, tone: "positive" as const },
			series: revenues.slice(-7),
		},
		{ id: "orders", value: number.format(186) },
		{ id: "average", value: cents.format(45.27) },
		{ id: "margin", value: percent.format(0.31) },
		{ id: "tasks", value: number.format(186) },
		{ id: "hours", value: new Intl.NumberFormat(numberLocale, { style: "unit", unit: "hour" }).format(34) },
	];
	const records =
		tasks ??
		copy.tasks.map((title, index) => ({
			id: `task-${1042 - index}`,
			title,
			squad: copy.squads[[0, 1, 4][index] ?? 0] ?? "",
		}));

	return (
		<section className="template-dashboard">
			<PageHeader title={copy.title} subtitle={copy.subtitle} meta={<Badge>{copy.demo}</Badge>} />
			<div className="ts-stat-grid">
				{metrics.map(({ id, ...metric }, index) => (
					<StatTile key={id} label={copy.metrics[index] ?? ""} foot={copy.week} {...metric} />
				))}
			</div>
			<div className="template-dashboard__grid">
				<Card title={copy.trend} subtitle={copy.daily}>
					<BarChart
						label={copy.trend}
						locale={locale}
						points={revenues.map((value, index) => ({ label: day.format(Date.UTC(2026, 9, 14 + index)), value }))}
						highlight={[7, 13]}
						formatValue={money.format}
					/>
				</Card>
				<Card title={copy.queue} subtitle={copy.queueWindow}>
					<Bars
						rows={[58, 47, 32, 26, 23].map((value, index) => ({
							label: copy.squads[index] ?? "",
							value,
							display: number.format(value),
						}))}
					/>
				</Card>
			</div>
			<Card title={copy.activity} flush={records.length > 0}>
				{records.length > 0 ? (
					<DataTable
						caption={copy.activity}
						columns={["task", "squad", "status"].map((key, index) => ({ key, label: copy.columns[index] ?? "" }))}
						rows={records.map(({ id, title, squad }) => ({
							id,
							cells: { task: title, squad, status: <StatusCell tone="success" label={copy.completed} /> },
						}))}
					/>
				) : (
					<EmptyState title={copy.empty} description={copy.emptyDetail} />
				)}
			</Card>
		</section>
	);
}
