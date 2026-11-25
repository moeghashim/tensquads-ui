import { Button, Card, DataTable, EmptyState, EntityCell, Input, PageHeader, StatusCell } from "@tensquads/ui/react";
import type { Locale } from "@tensquads/ui/schemas";

type Account = { id: string; name: string; domain: string; plan: string; active: boolean; squads: number };

const defaults = {
	en: {
		title: "Accounts",
		subtitle: "See companies, subscription plans and active squads.",
		table: "Companies",
		search: "Search companies",
		activeOnly: "Active only",
		columns: { company: "Company", plan: "Plan", status: "Status", squads: "Squads" },
		active: "Active",
		paused: "Paused",
		empty: "No companies yet",
		emptyDetail: "Companies appear here when they join your workspace.",
		noResults: "No matching companies",
		tryAgain: "Change the search or clear the filters.",
		clear: "Clear filters",
		accounts: [
			{
				id: "northstar",
				name: "Northstar Goods",
				domain: "northstar.example",
				plan: "Growth",
				active: true,
				squads: 5,
			},
			{ id: "forms", name: "Forma Studio", domain: "forma.example", plan: "Starter", active: true, squads: 3 },
			{ id: "coast", name: "Coast Supply", domain: "coast.example", plan: "Growth", active: false, squads: 4 },
			{ id: "common", name: "Common Store", domain: "common.example", plan: "Starter", active: true, squads: 2 },
		],
	},
	ar: {
		title: "الحسابات",
		subtitle: "تابع الشركات وخطط الاشتراك والفرق النشطة.",
		table: "الشركات",
		search: "البحث عن شركة",
		activeOnly: "النشطة فقط",
		columns: { company: "الشركة", plan: "الخطة", status: "الحالة", squads: "الفرق" },
		active: "نشط",
		paused: "متوقف",
		empty: "لا توجد شركات بعد",
		emptyDetail: "تظهر الشركات هنا عند انضمامها إلى مساحة عملك.",
		noResults: "لا توجد شركات مطابقة",
		tryAgain: "غيّر عبارة البحث أو امسح عوامل التصفية.",
		clear: "مسح عوامل التصفية",
		accounts: [
			{ id: "northstar", name: "متجر النجم", domain: "northstar.example", plan: "النمو", active: true, squads: 5 },
			{ id: "forms", name: "استوديو فورما", domain: "forma.example", plan: "البداية", active: true, squads: 3 },
			{ id: "coast", name: "إمدادات الساحل", domain: "coast.example", plan: "النمو", active: false, squads: 4 },
			{ id: "common", name: "المتجر العام", domain: "common.example", plan: "البداية", active: true, squads: 2 },
		],
	},
};

type Filters = { query: string; activeOnly: boolean };
const emptyFilters: Filters = { query: "", activeOnly: false };

export type ListProps = {
	locale?: Locale;
	copy?: typeof defaults.en;
	accounts?: Account[];
	filters?: Filters;
	onFiltersChange?: (filters: Filters) => void;
};

export function List({
	locale = "en",
	copy = defaults[locale],
	accounts = copy.accounts,
	filters = emptyFilters,
	onFiltersChange,
}: ListProps) {
	const number = new Intl.NumberFormat(locale === "ar" ? "ar-EG-u-nu-arab" : "en-US");
	const query = filters.query.trim().toLocaleLowerCase(locale);
	const matches = accounts.filter(
		({ name, domain, active }) =>
			(!filters.activeOnly || active) &&
			[name, domain].some((text) => text.toLocaleLowerCase(locale).includes(query)),
	);
	return (
		<section className="template-list">
			<PageHeader title={copy.title} subtitle={copy.subtitle} />
			<Card
				title={copy.table}
				count={number.format(matches.length)}
				flush={matches.length > 0}
				actions={
					onFiltersChange && (
						<div className="template-list__filters">
							<Input
								type="search"
								aria-label={copy.search}
								placeholder={copy.search}
								value={filters.query}
								onValueChange={(query) => onFiltersChange({ ...filters, query })}
							/>
							<Button
								variant="soft"
								size="sm"
								aria-pressed={filters.activeOnly}
								onClick={() => onFiltersChange({ ...filters, activeOnly: !filters.activeOnly })}
							>
								{copy.activeOnly}
							</Button>
						</div>
					)
				}
			>
				{matches.length > 0 ? (
					<DataTable
						caption={copy.table}
						columns={[
							{ key: "company", label: copy.columns.company },
							{ key: "plan", label: copy.columns.plan },
							{ key: "status", label: copy.columns.status },
							{ key: "squads", label: copy.columns.squads, align: "end" },
						]}
						rows={matches.map(({ id, name, domain, plan, active, squads }) => ({
							id,
							cells: {
								company: <EntityCell name={name} detail={domain} />,
								plan,
								status: (
									<StatusCell
										label={active ? copy.active : copy.paused}
										tone={active ? "success" : "default"}
									/>
								),
								squads: number.format(squads),
							},
						}))}
					/>
				) : accounts.length > 0 ? (
					<EmptyState
						title={copy.noResults}
						description={copy.tryAgain}
						action={
							onFiltersChange && (
								<Button variant="soft" onClick={() => onFiltersChange(emptyFilters)}>
									{copy.clear}
								</Button>
							)
						}
					/>
				) : (
					<EmptyState title={copy.empty} description={copy.emptyDetail} />
				)}
			</Card>
		</section>
	);
}
