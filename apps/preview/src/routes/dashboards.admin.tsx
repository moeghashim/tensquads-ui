import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import {
	Badge,
	BarChart,
	Bars,
	Button,
	Card,
	DataTable,
	EmptyState,
	EntityCell,
	Input,
	PageHeader,
	PersonCell,
	Sidebar,
	SidebarBrand,
	SidebarItem,
	SidebarSection,
	SidebarUser,
	StatTile,
} from "@tensquads/ui/react";
import { useMemo, useState } from "react";
import { getPreviewState } from "../state";
import { dashboardData, DashboardFrame, demoCopy, DemoPill, Icon } from "./-dashboards.shared";

export const Route = createFileRoute("/dashboards/admin")({ component: AdminDashboard });

type Company = {
	id: string;
	name: string;
	mission: string;
	owner: string;
	email: string;
	plan: string;
	subscription: string;
	started: string;
	value: string;
	squads: string;
	online: string;
};
const companyFixtures = import.meta.glob<string>("../fixtures/dashboard-companies.fixture.*.json", {
	eager: true,
	query: "?raw",
	import: "default",
});
const companiesByLocale = {
	en: JSON.parse(companyFixtures["../fixtures/dashboard-companies.fixture.en.json"] ?? "[]") as Company[],
	ar: JSON.parse(companyFixtures["../fixtures/dashboard-companies.fixture.ar.json"] ?? "[]") as Company[],
};

function AdminDashboard() {
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const { locale, direction } = getPreviewState(search);
	const ar = locale === "ar";
	const copy = demoCopy[locale];
	const view = search.view === "images" ? "images" : "companies";
	const navigate = useNavigate();
	const [filter, setFilter] = useState("All");
	const [query, setQuery] = useState("");
	const rows = useMemo(
		() =>
			companiesByLocale[locale].filter(
				(company) =>
					(filter === "All" || company.subscription === filter) &&
					`${company.name} ${company.mission} ${company.owner}`.toLowerCase().includes(query.toLowerCase()),
			),
		[filter, query, locale],
	);
	const items = [copy.companies, copy.imagesTitle];
	const setView = (next: "companies" | "images") =>
		void navigate({ to: ".", search: { ...search, view: next } as never });
	const data = dashboardData[locale];
	const stats = view === "companies" ? data.stats.admin : data.stats.images;
	const planCounts = new Map<string, number>();
	for (const company of companiesByLocale[locale]) {
		planCounts.set(company.plan, (planCounts.get(company.plan) ?? 0) + 1);
	}
	const plans = Array.from(planCounts, ([label, value]) => ({ label, value, display: String(value) }));
	return (
		<main className="dashboard-page" dir={direction}>
			<DashboardFrame>
				<Sidebar label={ar ? copy.adminNav : copy.adminNav} mobileLabel={copy.openNavigation}>
					<SidebarBrand icon={<Icon name="grid" />} title="Platform admin" subtitle={copy.workspace} />
					<SidebarSection label={copy.workspace}>
						<SidebarItem
							icon={<Icon name="building" />}
							active={view === "companies"}
							onClick={() => setView("companies")}
						>
							{items[0]}
						</SidebarItem>
						<SidebarItem
							icon={<Icon name="image" />}
							active={view === "images"}
							count={data.attentionCount}
							onClick={() => setView("images")}
						>
							{items[1]}
						</SidebarItem>
					</SidebarSection>
					<SidebarSection label={copy.comingNext}>
						<SidebarItem icon={<Icon name="chart" />} disabled>
							{copy.usageBilling}
						</SidebarItem>
						<SidebarItem icon={<Icon name="activity" />} disabled>
							{copy.platformHealth}
						</SidebarItem>
						<SidebarItem icon={<Icon name="users" />} disabled>
							{copy.adminUsers}
						</SidebarItem>
					</SidebarSection>
					<SidebarUser initials="MG" name="Moe Ghashim" userRole={copy.superAdmin} />
				</Sidebar>
				<section className="dashboard-panel">
					<PageHeader
						title={view === "companies" ? items[0] : items[1]}
						subtitle={view === "companies" ? copy.companiesSubtitle : copy.imagesSubtitle}
						meta={
							<>
								<DemoPill locale={locale} />
								<Badge tone="success">{view === "companies" ? data.squadsOnline : data.imagesAttention}</Badge>
							</>
						}
					/>
					<div className="ts-stat-grid dashboard-stats">
						{stats.map((stat) => (
							<StatTile key={stat.label} {...stat} />
						))}
					</div>
					{view === "companies" ? (
						<>
							<div className="dashboard-grid dashboard-grid--3-2">
								<Card title={copy.companiesChartTitle} subtitle={copy.lastEightWeeks}>
									<BarChart
										locale={locale}
										label={copy.companiesChartTitle}
										points={data.companiesChart}
									/>
								</Card>
								<Card title={copy.plansTitle} subtitle={copy.activePlans}>
									<Bars style="progress" rows={plans} />
								</Card>
							</div>
							<Card
								className="dashboard-table"
								title={copy.allCompanies}
								subtitle={copy.companyRecords}
								actions={
									<div className="dashboard-table-tools">
										<Input
											aria-label={copy.searchCompanies}
											placeholder={copy.search}
											value={query}
											onChange={(event) => setQuery(event.target.value)}
										/>
										{["All", "Active", "Trial", "Paused"].map((item) => (
											<Button
												key={item}
												size="sm"
												variant={filter === item ? "soft" : "ghost"}
												onClick={() => setFilter(item)}
											>
												{copy.filters[item as keyof typeof copy.filters]}
											</Button>
										))}
									</div>
								}
								flush
							>
								{rows.length === 0 ? (
									<EmptyState
										title={copy.noCompanies}
										description={copy.noCompaniesDescription}
										action={
											<Button
												pill
												onClick={() => {
													setQuery("");
													setFilter("All");
												}}
											>
												{copy.clearFilters}
											</Button>
										}
									/>
								) : (
									<DataTable
										caption={copy.allCompanies}
										columns={[
											{ key: "company", label: copy.company },
											{ key: "owner", label: copy.owner },
											{ key: "plan", label: copy.plan },
											{ key: "subscription", label: copy.subscription },
											{ key: "started", label: copy.started },
											{ key: "value", label: copy.allTimeValue, align: "end" },
											{ key: "squads", label: copy.squads },
											{ key: "online", label: copy.online },
										]}
										rows={rows.map((row) => ({
											id: row.id,
											cells: {
												company: (
													<EntityCell
														initials={row.name.slice(0, 2)}
														name={row.name}
														detail={row.mission}
													/>
												),
												owner: <PersonCell name={row.owner} email={row.email} />,
												plan: row.plan,
												subscription: (
													<Badge
														tone={
															row.subscription === "Active"
																? "success"
																: row.subscription === "Paused"
																	? "warning"
																	: "default"
														}
													>
														{copy.filters[row.subscription as keyof typeof copy.filters]}
													</Badge>
												),
												started: row.started,
												value: row.value,
												squads: row.squads,
												online: row.online,
											},
										}))}
									/>
								)}
							</Card>
						</>
					) : (
						<ImageView locale={locale} />
					)}
				</section>
			</DashboardFrame>
		</main>
	);
}

function ImageView({ locale }: { locale: "en" | "ar" }) {
	const [selected, setSelected] = useState("petra");
	const [filter, setFilter] = useState("all");
	const c = demoCopy[locale];
	const images = dashboardData[locale].images;
	const selectedImage = images.find((image) => image.id === selected);
	const visibleImages = images.filter(
		(image) =>
			filter === "all" ||
			(filter === "attention" && (image.bugs.length > 0 || image.requests.length > 0)) ||
			(filter === "bugs" && image.bugs.length > 0) ||
			(filter === "requests" && image.requests.length > 0),
	);
	return (
		<div className="dashboard-grid dashboard-grid--2-3">
			<Card
				title={c.allImages}
				actions={
					<div className="dashboard-table-tools">
						{[
							["all", c.all],
							["attention", c.needsAttention],
							["bugs", c.withBugs],
							["requests", c.withRequests],
						].map(([value, label]) => (
							<Button
								key={value}
								size="sm"
								variant={filter === value ? "soft" : "ghost"}
								onClick={() => value && setFilter(value)}
							>
								{label}
							</Button>
						))}
					</div>
				}
				flush
			>
				<DataTable
					caption={c.allImages}
					selectedId={selected}
					onRowSelect={setSelected}
					columns={[
						{ key: "path", label: c.image, mono: true },
						{ key: "version", label: c.version },
						{ key: "updated", label: c.lastUpdated },
						{ key: "deployed", label: c.deployed },
						{ key: "bugs", label: c.bugs, align: "end" },
					]}
					rows={visibleImages.map((row) => ({
						id: row.id,
						cells: {
							path: row.path,
							version: row.version,
							updated: row.updated,
							deployed: row.deployed,
							bugs: row.bugs.length,
						},
					}))}
				/>
			</Card>
			<div className="dashboard-stack">
				<Card title={c.imageDetails}>
					<dl className="dashboard-details">
						<dt>{c.registryPath}</dt>
						<dd>{selectedImage?.path}</dd>
						<dt>{c.version}</dt>
						<dd>{selectedImage?.version}</dd>
						<dt>{c.lastUpdated}</dt>
						<dd>{selectedImage?.updated}</dd>
					</dl>
					<div className="dashboard-actions">
						<Button>{c.rollOut}</Button>
						<Button variant="soft">{c.viewChangelog}</Button>
					</div>
				</Card>
				<Card title={c.openBugs}>
					{selectedImage?.bugs.map((bug) => (
						<p key={bug.id}>
							{bug.title} <Badge tone="danger">{bug.severity}</Badge>
						</p>
					))}
				</Card>
				<Card title={c.featuresToAdd}>
					{selectedImage?.requests.map((request) => (
						<p key={request.id}>
							{request.title} <Badge tone="default">{request.status}</Badge>
						</p>
					))}
				</Card>
			</div>
		</div>
	);
}
