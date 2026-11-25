import {
	Card,
	type CardProps,
	ChatLauncher,
	PageHeader,
	Sidebar,
	SidebarAgent,
	SidebarBrand,
	SidebarItem,
	SidebarSection,
	SidebarUser,
	squadmateCharacterName,
} from "@tensquads/ui/react";
import type { Locale } from "@tensquads/ui/schemas";

const icons = {
	overview: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
	accounts: "M4 20V5l8-2v17M4 8h8m-5 3h1m-1 3h1m-1 3h1m5-7v10h5V10z",
	rules: "M5 6h14M5 12h14M5 18h14M8 4v4m8 2v4m-5 2v4",
	chat: "M4 5h16v11H9l-5 4z",
};

type Destination = keyof typeof icons;

const agents = ["pisa", "kyoto", "rio", "zurich", "giza"] as const;

const defaults = {
	en: {
		nav: "Workspace navigation",
		open: "Open workspace navigation",
		brand: "Northstar Goods",
		brandMark: "N",
		workspace: "Store workspace",
		owner: "Moe Ghashim",
		initials: "MG",
		ownerRole: "Store owner",
		squad: "Your squad",
		lead: "Squad lead",
		roles: ["Orders", "Support", "Marketing", "Finance", "Inventory"],
		links: { overview: "Overview", accounts: "Accounts", rules: "Rules", chat: "Chat" },
		title: "Workspace overview",
		subtitle: "Manage your store and see what your squad is working on.",
		section: "Store operations",
		description: "Your squad handles orders, customer support and stock.",
	},
	ar: {
		nav: "تنقّل مساحة العمل",
		open: "فتح قائمة مساحة العمل",
		brand: "متجر النجم",
		brandMark: "ن",
		workspace: "مساحة عمل المتجر",
		owner: "مهند غشيم",
		initials: "مغ",
		ownerRole: "مالك المتجر",
		squad: "فريقك",
		lead: "قيادة الفريق",
		roles: ["الطلبات", "الدعم", "التسويق", "المالية", "المخزون"],
		links: { overview: "نظرة عامة", accounts: "الحسابات", rules: "القواعد", chat: "المحادثة" },
		title: "نظرة عامة على مساحة العمل",
		subtitle: "أدر متجرك وتابع عمل فريقك.",
		section: "عمليات المتجر",
		description: "يتولى فريقك الطلبات ودعم العملاء ومتابعة المخزون.",
	},
};

export type AppShellProps = {
	locale?: Locale;
	copy?: typeof defaults.en;
	links?: Partial<Record<Destination, string>>;
	current?: Destination;
	children?: CardProps["children"];
};

export function AppShell({
	locale = "en",
	copy = defaults[locale],
	links = {},
	current = "overview",
	children,
}: AppShellProps) {
	return (
		<div className="template-shell">
			<aside className="template-shell__sidebar" aria-label={copy.workspace}>
				<Sidebar label={copy.nav} mobileLabel={copy.open}>
					<SidebarBrand icon={copy.brandMark} title={copy.brand} subtitle={copy.workspace} />
					<SidebarSection label={copy.workspace}>
						{(Object.keys(icons) as Destination[]).map((id) => (
							<SidebarItem
								key={id}
								icon={
									<svg
										aria-hidden="true"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.6"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d={icons[id]} />
									</svg>
								}
								active={id === current}
								disabled={!links[id]}
								render={<a href={links[id]} />}
							>
								{copy.links[id]}
							</SidebarItem>
						))}
					</SidebarSection>
					<SidebarSection label={copy.squad}>
						<SidebarAgent
							agent="petra"
							name={squadmateCharacterName("petra", locale)}
							roleLabel={copy.lead}
							meta={copy.lead}
							state="idle"
							status="online"
							locale={locale}
							featured
						/>
						{agents.map((agent, index) => (
							<SidebarAgent
								key={agent}
								agent={agent}
								name={squadmateCharacterName(agent, locale)}
								roleLabel={copy.roles[index] ?? ""}
								state="idle"
								status="online"
								locale={locale}
							/>
						))}
					</SidebarSection>
					<SidebarUser initials={copy.initials} name={copy.owner} userRole={copy.ownerRole} />
				</Sidebar>
			</aside>
			<main id="main" className="template-shell__panel">
				{children ?? (
					<>
						<PageHeader title={copy.title} subtitle={copy.subtitle} />
						<Card title={copy.section}>{copy.description}</Card>
					</>
				)}
				{current !== "chat" && links.chat && (
					<div className="template-shell__launcher">
						<ChatLauncher locale={locale} onClick={() => window.location.assign(links.chat ?? "")} />
					</div>
				)}
			</main>
		</div>
	);
}
