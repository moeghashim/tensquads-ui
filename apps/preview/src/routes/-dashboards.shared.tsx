import { Badge, type BarChartPoint, type StatTileProps } from "@tensquads/ui/react";
import type { ReactNode } from "react";
import arData from "../fixtures/dashboard-data.fixture.ar.json";
import enData from "../fixtures/dashboard-data.fixture.en.json";

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
type DashboardData = {
	stats: { home: Stat[]; admin: Stat[]; images: Stat[] };
	companiesChart: BarChartPoint[];
	revenueChart: BarChartPoint[];
	images: typeof enData.images;
	imagesAttention: string;
	squadsOnline: string;
	ownerSquadsOnline: string;
	attentionCount: number;
};
export const dashboardData: Record<"en" | "ar", DashboardData> = { en: enData, ar: arData };

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
	bugs: "Bugs",
	imageDetails: "Image details",
	registryPath: "Registry path",
	rollOut: "Roll out 2.1.1",
	viewChangelog: "View changelog",
	openBugs: "Open bugs",
	featuresToAdd: "Features to add",
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
	bugs: "الأخطاء",
	imageDetails: "تفاصيل الصورة",
	registryPath: "مسار السجل",
	rollOut: "نشر الإصدار ٢.١.١",
	viewChangelog: "عرض سجل التغييرات",
	openBugs: "الأخطاء المفتوحة",
	featuresToAdd: "ميزات مقترحة",
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
