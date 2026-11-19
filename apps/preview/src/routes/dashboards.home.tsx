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
import { getPreviewState } from "../state";
import { dashboardData, DashboardFrame, demoCopy, DemoPill, Icon } from "./-dashboards.shared";

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

function StoreDashboard() {
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const { locale, direction } = getPreviewState(search);
	const ar = locale === "ar";
	const c = demoCopy[locale];
	const [pendingIds, setPendingIds] = useState(() =>
		requestsByLocale[locale].map((request) => request.approvalId),
	);
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
			meta: ar ? "متصلة" : "Online",
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
				<section className="dashboard-panel">
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
						{dashboardData[locale].stats.home.map((stat) => (
							<StatTile key={stat.label} {...stat} />
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
										bot="petra"
										actionLabels={actionLabels}
										onDecision={(command) => {
											setSent(JSON.stringify(command, null, 2));
											setPendingIds((current) => current.filter((id) => id !== command.approvalId));
										}}
									/>
								))}
							</div>
						</Card>
					</div>
					{sent && (
						<Card className="sent-command" title={c.commandSent}>
							<pre>{sent}</pre>
						</Card>
					)}
				</section>
			</DashboardFrame>
			<ChatLauncher
				locale={locale}
				label={ar ? "اسأل بيترا" : "Ask Petra"}
				onClick={() => {
					window.location.href = `/chat?${new URLSearchParams(chatSearch as Record<string, string>).toString()}`;
				}}
			/>
		</main>
	);
}
