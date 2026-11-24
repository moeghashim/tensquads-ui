import { Badge, type BarChartPoint, type StatTileProps } from "@tensquads/ui/react";
import type { ReactNode } from "react";
import { storeHeader } from "../dashboard-copy";
import arData from "../fixtures/dashboard-data.fixture.ar.json";
import enData from "../fixtures/dashboard-data.fixture.en.json";

export { demoCopy } from "../dashboard-copy";

export function DashboardFrame({ children }: { children: ReactNode }) {
	return <div className="dashboard-window">{children}</div>;
}
export function DemoPill({ locale }: { locale: "en" | "ar" }) {
	return <Badge tone="default">{storeHeader[locale].demo}</Badge>;
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
