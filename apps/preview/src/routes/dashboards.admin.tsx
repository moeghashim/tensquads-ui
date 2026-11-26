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
import { siteCopy } from "../copy";
import arImages from "../fixtures/dashboard-images.fixture.ar.json";
import enImages from "../fixtures/dashboard-images.fixture.en.json";
import { getPreviewState } from "../state";
import { DashboardFrame, DemoPill, dashboardData, dashboardNumberLocale, demoCopy, Icon } from "./-dashboards.shared";

import "../../../../templates/list-detail/list-detail.css";

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
	squads: number;
	online: number;
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
type ImageFixture = {
	id: string;
	name: string;
	nameAr: string;
	role: string;
	roleAr: string;
	path: string;
	version: string;
	updated: string;
	updatedAr: string;
	updatedAgeHours: number;
	lifecycle: string;
	deployed: number;
	latest: number;
	attention: boolean;
	bugs: {
		id: string;
		title: string;
		titleAr: string;
		severity: string;
		age: string;
		ageAr: string;
		accounts: number;
	}[];
	requests: { id: string; title: string; titleAr: string; status: string; inProgress: boolean }[];
};
const imagesByLocale: Record<"en" | "ar", ImageFixture[]> = {
	en: enImages,
	ar: arImages,
};

function AdminDashboard() {
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const { locale, direction } = getPreviewState(search);
	const copy = demoCopy[locale];
	const { format: numberText } = new Intl.NumberFormat(dashboardNumberLocale(locale));
	const adminCopy = siteCopy[locale].adminDemo;
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
	const stats =
		view === "companies"
			? data.stats.admin.map((stat, index) => ({
					...stat,
					foot:
						index === 0 || index === 3 || index === 4
							? undefined
							: [
									adminCopy.companyDelta,
									adminCopy.trialPaused,
									adminCopy.onlineNow,
									adminCopy.tasksDelta,
									adminCopy.payingCompanies,
									adminCopy.averagePaying,
								][index],
					delta:
						index === 0
							? { text: adminCopy.companyDelta, tone: "positive" as const }
							: index === 3
								? { text: adminCopy.tasksDelta, tone: "positive" as const }
								: index === 4
									? { text: adminCopy.payingCompanies, tone: "positive" as const }
									: null,
				}))
			: [];
	const planCounts = new Map<string, number>();
	for (const company of companiesByLocale[locale]) {
		planCounts.set(company.plan, (planCounts.get(company.plan) ?? 0) + 1);
	}
	const plans = Array.from(planCounts, ([label, value]) => {
		const planCompanies = companiesByLocale[locale].filter((company) => company.plan === label);
		const squads = planCompanies.reduce((total, company) => total + company.squads, 0);
		return {
			label,
			value,
			display: `${numberText(value)} ${adminCopy.companyUnit} · ${numberText(squads)} ${adminCopy.squadUnit}`,
			tone: label === "Growth" ? ("info" as const) : undefined,
		};
	});
	return (
		<main id="main" className="design-wrap dashboard-page" dir={direction}>
			<DashboardFrame>
				<Sidebar label="Platform admin" mobileLabel={copy.openNavigation}>
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
							count={numberText(data.attentionCount)}
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
								<Badge tone={view === "images" ? "danger" : "success"}>
									{view === "companies" ? data.squadsOnline : data.imagesAttention}
								</Badge>
							</>
						}
					/>
					{view === "companies" && (
						<div className="ts-stat-grid dashboard-stats">
							{stats.map((stat) => (
								<StatTile key={stat.label} {...stat} />
							))}
						</div>
					)}
					{view === "companies" ? (
						<>
							<div className="dashboard-grid dashboard-grid--3-2">
								<Card title={copy.companiesChartTitle} subtitle={copy.lastEightWeeks}>
									<BarChart
										locale={locale}
										label={adminCopy.companiesCreated}
										keys={[{ key: "history", label: "", tone: "subtle" }]}
										points={data.companiesChart.map((point, index, points) =>
											index === points.length - 1
												? point
												: { label: point.label, segments: [{ key: "history", value: point.value ?? 0 }] },
										)}
									/>
								</Card>
								<Card title={copy.plansTitle} subtitle={copy.activePlans}>
									<Bars style="progress" caption={adminCopy.planCaption} rows={plans} />
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
											{ key: "squads", label: copy.squads, align: "end" },
											{ key: "online", label: copy.online, align: "end" },
										]}
										rows={rows.map((row) => ({
											id: row.id,
											cells: {
												company: (
													<EntityCell
														initials={row.name.slice(0, 2)}
														name={row.name}
														detail={row.mission}
														tint={
															(["primary", "success"] as const)[
																companiesByLocale[locale].findIndex(
																	(company) => company.id === row.id,
																) % 2
															]
														}
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
														{adminCopy.status[row.subscription as keyof typeof adminCopy.status]}
													</Badge>
												),
												started: row.started,
												value: row.value,
												squads: <span className="dashboard-numeric">{numberText(row.squads)}</span>,
												online: (
													<Badge tone={row.online / row.squads >= 0.75 ? "success" : "default"}>
														{numberText(row.online)} / {numberText(row.squads)}
													</Badge>
												),
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

function TemplateIcon({ id }: { id: string }) {
	const paths: Record<string, string> = {
		orders: "M4 5h16v14H4zM8 9h8M8 13h5M8 16h3",
		support: "M4 5h16v12H9l-5 3zM8 9h8M8 13h5",
		marketing: "M4 14V9l11-4v13L4 14zm11-4h4l2 3v3h-6m-8-2 1 5h4l-1-4",
		finance: "M4 7h16M6 4v3m12-3v3M5 7v13h14V7M8 11h8M8 15h5",
		inventory: "M4 7h16v13H4zM3 4h18M8 11h8M8 15h5",
		analytics: "M4 19V5m0 14h16M7 15l4-4 3 2 5-7",
		people: "M16 20v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8m6-7a4 4 0 0 1 0 7",
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
			<path d={paths[id] ?? paths.orders} />
		</svg>
	);
}

function ImageView({ locale }: { locale: "en" | "ar" }) {
	const [selected, setSelected] = useState("orders");
	const [filter, setFilter] = useState("all");
	const c = demoCopy[locale];
	const copy = siteCopy[locale].adminDemo;
	const images = imagesByLocale[locale];
	const selectedImage = images.find((image) => image.id === selected) ?? images[0]!;
	const numberLocale = dashboardNumberLocale(locale);
	const { format: numberText } = new Intl.NumberFormat(numberLocale);
	const percent = new Intl.NumberFormat(numberLocale, { style: "percent" });
	const visibleImages = images.filter(
		(image) =>
			filter === "all" ||
			(filter === "attention" && image.attention) ||
			(filter === "bugs" && image.bugs.length > 0) ||
			(filter === "requests" && image.requests.length > 0),
	);
	const bugs = images.flatMap((image) => image.bugs);
	const requests = images.flatMap((image) => image.requests);
	const deployments = images.reduce((sum, image) => sum + image.deployed, 0);
	const behind = images.reduce((sum, image) => sum + image.deployed - image.latest, 0);
	const highBugs = bugs.filter((bug) => bug.severity === "High").length;
	const stats = [
		{
			label: copy.images,
			value: numberText(images.length),
			foot: copy.imagesFoot
				.replace("{stable}", numberText(images.filter((image) => image.lifecycle === "stable").length))
				.replace(
					"{preview}",
					numberText(images.filter((image) => image.lifecycle === "beta" || image.lifecycle === "draft").length),
				),
		},
		{
			label: copy.deployments,
			value: numberText(deployments),
			delta: { text: copy.deploymentsFoot.replace("{count}", numberText(behind)), tone: "negative" as const },
		},
		{
			label: copy.openBugs,
			value: numberText(bugs.length),
			delta: {
				text:
					locale === "ar" && highBugs === 2
						? copy.highBugsDual
						: copy.highBugs.replace("{count}", numberText(highBugs)),
				tone: "negative" as const,
			},
		},
		{
			label: copy.featuresRequested,
			value: numberText(requests.length),
			foot: copy.featuresFoot.replace(
				"{count}",
				numberText(requests.filter((request) => request.inProgress).length),
			),
		},
		{
			label: copy.updatedThisWeek,
			value: numberText(images.filter((image) => image.updatedAgeHours < 7 * 24).length),
			foot: copy.updatedFoot.replace("{count}", numberText(images.length)),
		},
	];
	return (
		<>
			<div className="ts-stat-grid dashboard-stats dashboard-stats--images">
				{stats.map((stat) => (
					<StatTile key={stat.label} {...stat} />
				))}
			</div>
			<div className="dashboard-grid dashboard-grid--3-2 dashboard-image-layout">
				<Card
					title={copy.allImagesCount
						.replace("{visible}", numberText(visibleImages.length))
						.replace("{total}", numberText(images.length))}
					flush
				>
					<div className="dashboard-image-filters">
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
					<DataTable
						caption={c.allImages}
						selectedId={selected}
						onRowSelect={setSelected}
						columns={[
							{ key: "image", label: copy.imageName },
							{ key: "version", label: copy.imageVersion, mono: true },
							{ key: "updated", label: copy.lastUpdated },
							{ key: "deployed", label: copy.deployed, align: "end" },
							{ key: "bugs", label: copy.bugs, align: "end" },
						]}
						rows={visibleImages.map((image) => ({
							id: image.id,
							cells: {
								image: (
									<span
										className="dashboard-image-cell"
										style={{
											display: "inline-flex",
											alignItems: "center",
											gap: "var(--ts-space-2)",
											minInlineSize: 0,
										}}
									>
										<span
											className={`ts-data-table__tile ts-data-table__tile--${["support", "finance", "analytics"].includes(image.id) ? "success" : "primary"}`}
											style={{ inlineSize: "28px", blockSize: "28px", minInlineSize: "28px", padding: 0 }}
										>
											<TemplateIcon id={image.id} />
										</span>
										<span className="dashboard-image-copy">
											<strong>{locale === "ar" ? image.nameAr : image.name}</strong>
											<small
												dir="ltr"
												style={{
													display: "block",
													maxInlineSize: "11rem",
													fontFamily: "var(--ts-font-mono)",
													fontSize: "var(--ts-text-xs-font-size)",
													overflow: "hidden",
													textOverflow: "ellipsis",
													whiteSpace: "nowrap",
												}}
											>
												{image.path}
											</small>
										</span>
									</span>
								),
								version: image.version,
								updated: locale === "ar" ? image.updatedAr : image.updated,
								deployed: <span className="dashboard-numeric">{numberText(image.deployed)}</span>,
								bugs: (
									<span
										className={image.bugs.length ? "dashboard-danger dashboard-numeric" : "dashboard-numeric"}
									>
										{numberText(image.bugs.length)}
									</span>
								),
							},
						}))}
					/>
				</Card>
				<div className="dashboard-stack">
					<Card title={locale === "ar" ? selectedImage.nameAr : selectedImage.name}>
						<div className="dashboard-image-detail-head">
							<p>{locale === "ar" ? selectedImage.roleAr : selectedImage.role}</p>
							{selectedImage.attention && <Badge tone="danger">{copy.needsAttention}</Badge>}
						</div>
						<dl className="template-detail-rows">
							<dt>{copy.imageName}</dt>
							<dd dir="ltr">{selectedImage.path}</dd>
							<dt>{copy.imageVersion}</dt>
							<dd dir="ltr">{selectedImage.version}</dd>
							<dt>{copy.lastUpdated}</dt>
							<dd>{locale === "ar" ? selectedImage.updatedAr : selectedImage.updated}</dd>
							<dt>{copy.deployedTo}</dt>
							<dd className="dashboard-numeric">{numberText(selectedImage.deployed)}</dd>
							<dt>{copy.onLatest}</dt>
							<dd>
								{copy.onLatestCount
									.replace("{latest}", numberText(selectedImage.latest))
									.replace("{deployed}", numberText(selectedImage.deployed))
									.replace("{percent}", percent.format(selectedImage.latest / selectedImage.deployed))}
							</dd>
						</dl>
						<div className="dashboard-actions">
							<Button>{copy.rollOut}</Button>
							<Button variant="soft">{copy.viewChangelog}</Button>
						</div>
					</Card>
					<Card title={c.openBugs} count={numberText(selectedImage.bugs.length)}>
						{selectedImage.bugs.length ? (
							selectedImage.bugs.map((bug) => (
								<div
									className="dashboard-inset-row"
									key={bug.id}
									style={{
										display: "grid",
										gap: "var(--ts-space-2)",
										padding: "var(--ts-space-3)",
										border: "1px solid var(--ts-border-subtle)",
										borderRadius: "var(--ts-radius-lg)",
									}}
								>
									<div className="dashboard-inset-title">
										<Badge
											tone={
												bug.severity === "High"
													? "danger"
													: bug.severity === "Medium"
														? "warning"
														: "default"
											}
										>
											{locale === "ar"
												? ({ High: "عالية", Medium: "متوسطة", Low: "منخفضة" } as Record<string, string>)[
														bug.severity
													]
												: bug.severity}
										</Badge>
										<strong>{locale === "ar" ? bug.titleAr : bug.title}</strong>
									</div>
									<small>
										{copy.bugMeta
											.replace("{id}", bug.id)
											.replace("{age}", locale === "ar" ? bug.ageAr : bug.age)
											.replace("{accounts}", numberText(bug.accounts))}
									</small>
								</div>
							))
						) : (
							<p className="dashboard-empty-line">{copy.emptyBugs}</p>
						)}
					</Card>
					<Card title={c.featuresToAdd} count={numberText(selectedImage.requests.length)}>
						{selectedImage.requests.length ? (
							selectedImage.requests.map((request) => (
								<div
									className="dashboard-inset-row"
									key={request.id}
									style={{
										display: "grid",
										gap: "var(--ts-space-2)",
										padding: "var(--ts-space-3)",
										border: "1px solid var(--ts-border-subtle)",
										borderRadius: "var(--ts-radius-lg)",
									}}
								>
									<div className="dashboard-inset-title">
										<strong>{locale === "ar" ? request.titleAr : request.title}</strong>
										<Badge tone={request.status === "Planned" ? "success" : "default"}>
											{request.status === "Planned" ? copy.planned : copy.backlog}
										</Badge>
									</div>
								</div>
							))
						) : (
							<p className="dashboard-empty-line">{copy.emptyFeatures}</p>
						)}
					</Card>
				</div>
			</div>
		</>
	);
}
