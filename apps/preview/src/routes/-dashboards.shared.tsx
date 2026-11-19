import type { StatTileProps } from "@tensquads/ui/react";
import { Badge } from "@tensquads/ui/react";
import type { ReactNode } from "react";

export function DashboardFrame({ children }: { children: ReactNode }) {
	return <div className="dashboard-window">{children}</div>;
}
export function DemoPill({ locale }: { locale: "en" | "ar" }) {
	return <Badge tone="default">{locale === "ar" ? "بيانات تجريبية" : "Demo data"}</Badge>;
}

export function Icon({ name }: { name: string }) {
	const paths: Record<string, string> = {
		grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
		building: "M4 20V5l8-2v17M4 8h8m-5 3h1m-1 3h1m-1 3h1m5-7h2m-2 4h2m-2 4h2m-1-7v12",
		image: "M4 5h16v14H4zM7 15l3-3 3 3 2-2 3 3M9 9h.01",
		chart: "M4 19V5m0 14h16M7 15l4-5 3 3 5-7",
		activity: "M3 12h4l3-8 4 16 3-8h4",
		users: "M16 20v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8m6-7a4 4 0 0 1 0 7m2 3a4 4 0 0 1 2 4v2",
		store: "M3 9l2-5h14l2 5M4 9v11h16V9M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0",
	};
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d={paths[name] ?? paths.grid} />
		</svg>
	);
}

type Stat = Pick<StatTileProps, "label" | "value" | "foot" | "series" | "delta" | "unit">;
const homeEn: Stat[] = [
	{ label: "Revenue", value: "$24,680", foot: "This month", series: [4, 5, 5, 6, 7, 6, 8, 9] },
	{ label: "Orders", value: "1,284", foot: "This month", series: [4, 5, 4, 6, 7, 8, 7, 9] },
	{ label: "Average order", value: "$19.22", foot: "Across all orders", series: [5, 4, 6, 6, 7, 5, 8, 9] },
	{ label: "Profit margin", value: "32.8%", foot: "After operating costs", series: [5, 6, 5, 7, 6, 8, 7, 9] },
	{ label: "Tasks done", value: "186", foot: "Across your squads", series: [3, 5, 4, 6, 7, 6, 8, 9] },
	{ label: "Hours saved", value: "42.5", unit: "h", foot: "Estimated this month", series: [2, 4, 4, 5, 7, 6, 8, 9] },
];
const homeAr: Stat[] = homeEn.map((item, i) => ({
	...item,
	label: ["الإيرادات", "الطلبات", "متوسط الطلب", "هامش الربح", "المهام المنجزة", "الساعات الموفرة"][i] ?? item.label,
	foot:
		["هذا الشهر", "هذا الشهر", "لكل الطلبات", "بعد تكاليف التشغيل", "على مستوى الفرق", "تقديري هذا الشهر"][i] ??
		item.foot,
}));
const adminEn: Stat[] = [
	{ label: "Companies", value: "9", foot: "Across all plans" },
	{ label: "Active companies", value: "6", foot: "Currently subscribed" },
	{ label: "Squads", value: "66", foot: "Across all companies" },
	{ label: "Tasks done 7d", value: "4,765", foot: "In the last 7 days" },
	{ label: "Monthly recurring", value: "$1,294", foot: "Current monthly value" },
	{ label: "All-time value", value: "$14,568", foot: "Since launch" },
];
const adminAr: Stat[] = adminEn.map((item, i) => ({
	...item,
	label:
		["الشركات", "الشركات النشطة", "الفرق", "المهام المنجزة ٧ أيام", "الإيراد الشهري", "القيمة الإجمالية"][i] ??
		item.label,
	foot:
		["ضمن جميع الخطط", "اشتراك نشط", "في جميع الشركات", "خلال آخر ٧ أيام", "القيمة الشهرية الحالية", "منذ الإطلاق"][
			i
		] ?? item.foot,
}));
const imageEn: Stat[] = [
	{ label: "Images", value: "18", foot: "In the registry" },
	{ label: "Deployed", value: "16", foot: "In production" },
	{ label: "Needs attention", value: "2", foot: "Review requested" },
	{ label: "Open bugs", value: "3", foot: "Across all images" },
	{ label: "Requests", value: "5", foot: "Waiting for review" },
];
const imageAr: Stat[] = imageEn.map((item, i) => ({
	...item,
	label: ["الصور", "المنشورة", "تحتاج إلى مراجعة", "الأخطاء المفتوحة", "الطلبات"][i] ?? item.label,
	foot: ["في السجل", "في بيئة الإنتاج", "بحاجة إلى مراجعة", "في جميع الصور", "بانتظار المراجعة"][i] ?? item.foot,
}));
export const demoStats = {
	en: { home: homeEn, admin: adminEn, images: imageEn },
	ar: { home: homeAr, admin: adminAr, images: imageAr },
};

const en = {
	openNavigation: "Open navigation",
	workspace: "Workspace",
	comingNext: "Coming next",
	usageBilling: "Usage and billing",
	platformHealth: "Platform health",
	adminUsers: "Admin users",
	superAdmin: "Super admin",
	companiesSubtitle: "A view of companies, squads, and platform activity",
	companies: "Companies",
	adminNav: "Admin navigation",
	imagesTitle: "Squad images",
	imagesSubtitle: "Squad artwork and registry health",
	squadsOnline: "53 squads online now",
	imagesAttention: "2 images need attention",
	companiesChartTitle: "Companies created, last 8 weeks",
	lastEightWeeks: "New company accounts",
	plansTitle: "Companies by plan",
	activePlans: "Current plan mix",
	allCompanies: "All companies",
	companyRecords: "Company accounts across the platform",
	noCompanies: "No companies found",
	noCompaniesDescription: "Clear the filters to view company accounts.",
	clearFilters: "Clear filters",
	searchCompanies: "Search companies",
	search: "Search",
	filters: { All: "All", Active: "Active", Trial: "Trial", Paused: "Paused" },
	company: "Company and mission",
	owner: "Owner",
	plan: "Plan",
	subscription: "Subscription",
	started: "Started",
	allTimeValue: "All-time value",
	squads: "Squads",
	online: "Online",
	allImages: "All images",
	all: "All",
	needsAttention: "Needs attention",
	withBugs: "With bugs",
	withRequests: "With requests",
	image: "Image",
	version: "Version",
	lastUpdated: "Last updated",
	deployed: "Deployed",
	yes: "Yes",
	bugs: "Bugs",
	imageDetails: "Image details",
	registryPath: "Registry path",
	rollOut: "Roll out 2.1.1",
	viewChangelog: "View changelog",
	openBugs: "Open bugs",
	featuresToAdd: "Features to add",
	high: "High",
	requested: "Requested",
	squad: "Squad",
	mission: "Mission",
	revenueChartTitle: "Revenue, last 14 days",
	lastFourteenDays: "Daily revenue",
	previousWeek: "Previous week",
	thisWeek: "This week",
	needsApproval: "Needs your approval",
	commandSent: "ApprovalDecision command sent",
	revenue: "Revenue",
};
const ar = {
	...en,
	openNavigation: "فتح التنقل",
	workspace: "مساحة العمل",
	comingNext: "قريبًا",
	usageBilling: "الاستخدام والفوترة",
	platformHealth: "حالة المنصة",
	adminUsers: "المشرفون",
	superAdmin: "مشرف المنصة",
	companiesSubtitle: "عرض الشركات والفرق ونشاط المنصة",
	companies: "الشركات",
	adminNav: "التنقل الإداري",
	imagesTitle: "صور الفرق",
	imagesSubtitle: "صور الفرق وحالة السجل",
	squadsOnline: "٥٣ فريقًا متصلًا الآن",
	imagesAttention: "صورتان تحتاجان إلى مراجعة",
	companiesChartTitle: "الشركات المضافة خلال ٨ أسابيع",
	lastEightWeeks: "حسابات الشركات الجديدة",
	plansTitle: "الشركات حسب الخطة",
	activePlans: "توزيع الخطط الحالي",
	allCompanies: "جميع الشركات",
	companyRecords: "حسابات الشركات على المنصة",
	noCompanies: "لم نعثر على شركات",
	noCompaniesDescription: "أزل عوامل التصفية لعرض حسابات الشركات.",
	clearFilters: "إزالة عوامل التصفية",
	searchCompanies: "البحث عن الشركات",
	search: "بحث",
	filters: { All: "الكل", Active: "نشطة", Trial: "تجريبية", Paused: "متوقفة" },
	company: "الشركة والمهمة",
	owner: "المالك",
	plan: "الخطة",
	subscription: "الاشتراك",
	started: "تاريخ البدء",
	allTimeValue: "القيمة الإجمالية",
	squads: "الفرق",
	online: "متصل",
	allImages: "جميع الصور",
	all: "الكل",
	needsAttention: "تحتاج إلى مراجعة",
	withBugs: "بها أخطاء",
	withRequests: "بها طلبات",
	image: "الصورة",
	version: "الإصدار",
	lastUpdated: "آخر تحديث",
	deployed: "منشورة",
	yes: "نعم",
	bugs: "الأخطاء",
	imageDetails: "تفاصيل الصورة",
	registryPath: "مسار السجل",
	rollOut: "نشر الإصدار ٢.١.١",
	viewChangelog: "عرض سجل التغييرات",
	openBugs: "الأخطاء المفتوحة",
	featuresToAdd: "ميزات مقترحة",
	high: "مرتفع",
	requested: "مطلوبة",
	squad: "الفريق",
	mission: "المهمة",
	revenueChartTitle: "الإيرادات خلال ١٤ يومًا",
	lastFourteenDays: "الإيرادات اليومية",
	previousWeek: "الأسبوع السابق",
	thisWeek: "هذا الأسبوع",
	needsApproval: "بانتظار موافقتك",
	commandSent: "تم إرسال أمر قرار الموافقة",
	revenue: "الإيرادات",
};
export const demoCopy = { en, ar } as const;
