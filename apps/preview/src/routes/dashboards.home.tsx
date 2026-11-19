import { createFileRoute, useRouterState } from "@tanstack/react-router";
import {
	ApprovalCard,
	Badge,
	BarChart,
	Card,
	ChatLauncher,
	PageHeader,
	Sidebar,
	SidebarAgent,
	SidebarBrand,
	SidebarSection,
	SidebarUser,
	StatTile,
} from "@tensquads/ui/react";
import type { PlatformApprovalRequest } from "@tensquads/ui/schemas";
import { useState } from "react";
import { siteCopy } from "../copy";
import arHome from "../fixtures/dashboard-home.fixture.ar.json";
import enHome from "../fixtures/dashboard-home.fixture.en.json";
import { getPreviewState } from "../state";
import { DashboardFrame, DemoPill, dashboardData, demoCopy, Icon } from "./-dashboards.shared";

export const Route = createFileRoute("/dashboards/home")({ component: StoreDashboard });
const approvalFixtures = import.meta.glob<string>("../fixtures/dashboard-approvals.fixture.*.json", {
	eager: true,
	query: "?raw",
	import: "default",
});
const requestsByLocale = {
	en: JSON.parse(
		approvalFixtures["../fixtures/dashboard-approvals.fixture.en.json"] ?? "[]",
	) as PlatformApprovalRequest[],
	ar: JSON.parse(
		approvalFixtures["../fixtures/dashboard-approvals.fixture.ar.json"] ?? "[]",
	) as PlatformApprovalRequest[],
};
const homeData = { en: enHome, ar: arHome };

function StoreDashboard() {
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const { locale, direction } = getPreviewState(search);
	const ar = locale === "ar";
	const c = demoCopy[locale];
	const homeCopy = siteCopy[locale].dashboardHome;
	const statDeltas = [
		{ text: `+${ar ? "١٢" : "12"}% ${homeCopy.vsLastWeek}`, tone: "positive" },
		{ text: `+${ar ? "٨" : "8"}% ${homeCopy.vsLastWeek}`, tone: "positive" },
		{ text: `+${ar ? "٤" : "4"}% ${homeCopy.vsLastWeek}`, tone: "positive" },
		{ text: `${ar ? "-١ نقطة" : "-1 pt"} ${homeCopy.vsLastWeek}`, tone: "negative" },
		// The last two tiles have no prior period; their foot line says what the number covers.
		null,
		null,
	] as const;
	const [pendingIds, setPendingIds] = useState(() => requestsByLocale[locale].map((request) => request.approvalId));
	const pending = requestsByLocale[locale].filter((request) => pendingIds.includes(request.approvalId));
	const [sent, setSent] = useState<string>();
	const agents = [
		{
			agent: "petra" as const,
			state: "running" as const,
			name: ar ? "بترا" : "Petra",
			roleLabel: ar ? "قائدة الفريق" : "Team lead",
			status: "online" as const,
			featured: true,
			meta: homeCopy.runsSquads,
		},
		{
			agent: "pisa" as const,
			state: "running" as const,
			name: ar ? "بيزا" : "Pisa",
			roleLabel: ar ? "الطلبات" : "Orders",
			status: "online" as const,
		},
		{
			agent: "kyoto" as const,
			state: "idle" as const,
			name: ar ? "كيوتو" : "Kyoto",
			roleLabel: ar ? "التسويق" : "Marketing",
			status: "online" as const,
		},
		{
			agent: "rio" as const,
			state: "running" as const,
			name: ar ? "ريو" : "Rio",
			roleLabel: ar ? "المخزون" : "Inventory",
			status: "online" as const,
		},
		{
			agent: "zurich" as const,
			state: "idle" as const,
			name: ar ? "زيورخ" : "Zurich",
			roleLabel: ar ? "الدعم" : "Support",
			status: "idle" as const,
		},
		{
			agent: "giza" as const,
			state: "running" as const,
			name: ar ? "الجيزة" : "Giza",
			roleLabel: ar ? "التحليلات" : "Analytics",
			status: "online" as const,
		},
	];
	const actionLabels = ar
		? { refund: "استرداد", send_reply: "إرسال رد", discount: "خصم" }
		: { refund: "Refund", send_reply: "Send a reply", discount: "Discount" };
	const ruleLabels = ar
		? { refund_limit: "حد الاسترداد", discount_limit: "حد الخصم" }
		: { refund_limit: "Refund limit", discount_limit: "Discount limit" };
	const chatSearch = { ...search };
	return (
		<main className="dashboard-page" dir={direction}>
			<DashboardFrame>
				<Sidebar label={ar ? "تنقل المتجر" : "Store navigation"} mobileLabel={c.openNavigation}>
					<SidebarBrand
						icon={<Icon name="store" />}
						title={ar ? "متجر مو" : "Moe's store"}
						subtitle={c.workspace}
					/>
					<SidebarSection label={c.squad}>
						{agents.map((agent, index) => (
							<SidebarAgent key={agent.agent} {...agent} locale={locale} featured={index === 0} />
						))}
					</SidebarSection>
					<SidebarUser initials="MG" name="Moe Ghashim" userRole={ar ? "مالك المتجر" : "Store owner"} />
				</Sidebar>
				<section className="dashboard-panel dashboard-panel--home">
					<PageHeader
						title={ar ? "صباح الخير، Moe" : "Good morning, Moe"}
						subtitle={ar ? "إليك ملخص متجرك اليوم" : "Here is your store overview for today"}
						meta={
							<>
								<span className="mission-pill">
									<Badge tone="success">{c.mission}</Badge>
									{ar ? "جعل العناية بالبشرة أبسط" : "Make skincare feel simple"}
								</span>
								<DemoPill locale={locale} />
								<Badge tone="success">{dashboardData[locale].ownerSquadsOnline}</Badge>
							</>
						}
					/>
					<div className="ts-stat-grid dashboard-stats">
						{dashboardData[locale].stats.home.map((stat, index) => (
							<StatTile key={stat.label} {...stat} delta={statDeltas[index]} />
						))}
					</div>
					<div className="dashboard-grid dashboard-grid--3-2">
						<Card title={c.revenueChartTitle} subtitle={c.lastFourteenDays}>
							<BarChart
								locale={locale}
								label={c.revenueChartTitle}
								points={dashboardData[locale].revenueChart}
								keys={[
									{ key: "previous", label: c.previousWeek, tone: "subtle" },
									{ key: "current", label: c.thisWeek, tone: "strong" },
								]}
							/>
						</Card>
						<Card title={c.needsApproval} count={pending.length}>
							<div className="approval-list">
								{pending.map((request) => (
									<ApprovalCard
										key={request.approvalId}
										request={request}
										locale={locale}
										bot={
											homeData[locale].approvalDetails[
												request.approvalId as keyof typeof homeData.en.approvalDetails
											]?.agent
										}
										taskId={
											homeData[locale].approvalDetails[
												request.approvalId as keyof typeof homeData.en.approvalDetails
											]?.taskId
										}
										actionLabels={actionLabels}
										ruleLabels={ruleLabels}
										onDecision={(command) => {
											setSent(JSON.stringify(command, null, 2));
											setPendingIds((current) => current.filter((id) => id !== command.approvalId));
										}}
									/>
								))}
							</div>
							{sent && (
								<details className="sent-commands">
									<summary>{homeCopy.sentCommands}</summary>
									<pre>{sent}</pre>
								</details>
							)}
						</Card>
					</div>
				</section>
			</DashboardFrame>
			<ChatLauncher
				locale={locale}
				waiting={pending.length}
				label={ar ? "اسأل بيترا" : "Ask Petra"}
				onClick={() => {
					window.location.href = `/chat?${new URLSearchParams(chatSearch as Record<string, string>).toString()}`;
				}}
			/>
		</main>
	);
}
