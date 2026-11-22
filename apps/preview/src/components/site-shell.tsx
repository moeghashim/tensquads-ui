import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { getRegisteredComponents } from "@tensquads/ui/openui";
import {
	Button,
	CommandPalette,
	type CommandPaletteGroup,
	SegmentedControl,
	SegmentedControlIndicator,
	SegmentedControlItem,
	useCommandPaletteShortcut,
} from "@tensquads/ui/react";
import { useState } from "react";
import { siteCopy } from "../copy";
import { getPreviewState } from "../state";
import { TensquadsWordmark } from "./tensquads-wordmark";

export function SiteShell() {
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const navigate = useNavigate();
	const { locale, theme } = getPreviewState(search);
	const copy = siteCopy[locale];
	const [paletteOpen, setPaletteOpen] = useState(false);
	useCommandPaletteShortcut(() => setPaletteOpen(true));
	const change = (key: "locale" | "theme", value: string) => {
		const nextSearch = { ...search, [key]: value };
		if (key === "locale") nextSearch.dir = value === "ar" ? "rtl" : "ltr";
		void navigate({ to: ".", search: nextSearch as never });
	};
	const paletteLabels =
		locale === "ar"
			? {
					placeholder: "ابحث في الصفحات والمكوّنات…",
					empty: "لا توجد نتائج",
					navigate: "تنقّل",
					select: "اختيار",
					close: "إغلاق",
					title: "البحث",
				}
			: {
					placeholder: "Search pages and components…",
					empty: "No matches",
					navigate: "navigate",
					select: "select",
					close: "close",
					title: "Search",
				};
	const groups: CommandPaletteGroup[] = [
		{
			id: "pages",
			label: locale === "ar" ? "الصفحات" : "Pages",
			items: [
				{ id: "home", label: locale === "ar" ? "الرئيسية" : "Home", path: "/" },
				{ id: "get-started", label: locale === "ar" ? "البدء" : "Get started", path: "/get-started" },
				{ id: "components", label: copy.nav.components, path: "/components" },
				{ id: "chat", label: copy.nav.chat, path: "/chat" },
				{ id: "admin", label: locale === "ar" ? "لوحة الإدارة" : "Admin dashboard", path: "/dashboards/admin" },
				{
					id: "store",
					label: locale === "ar" ? "لوحة صاحب المتجر" : "Store owner dashboard",
					path: "/dashboards/home",
				},
			].map(({ id, label, path }) => ({
				id,
				label,
				onSelect: () => void navigate({ to: path as never, search: search as never }),
			})),
		},
		{
			id: "components",
			label: locale === "ar" ? "المكوّنات" : "Components",
			items: [
				...getRegisteredComponents().map((entry) => ({ name: entry.name, description: entry.description })),
				...(
					[
						"Chat",
						"ChatReply",
						"OwnerMessageView",
						"Sidebar",
						"ThemeToggle",
						"Toolbar",
						"CommandPalette",
						"Node",
						"Canvas",
					] as const
				).map((name) => ({ name, description: name })),
			]
				.filter(
					(entry, index, entries) => entries.findIndex((candidate) => candidate.name === entry.name) === index,
				)
				.map((entry) => ({
					id: `component-${entry.name}`,
					label: entry.name,
					keywords: [entry.description],
					onSelect: () =>
						void navigate({ to: "/components/$name", params: { name: entry.name }, search: search as never }),
				})),
		},
		{
			id: "settings",
			label: locale === "ar" ? "الإعدادات" : "Settings",
			items: [
				{
					id: "locale-ar",
					label: locale === "ar" ? "التبديل إلى العربية" : "Switch to Arabic",
					keywords: ["language"],
					onSelect: () => change("locale", "ar"),
				},
				{
					id: "locale-en",
					label: locale === "ar" ? "التبديل إلى الإنجليزية" : "Switch to English",
					keywords: ["language"],
					onSelect: () => change("locale", "en"),
				},
				...(["light", "dark", "system"] as const).map((theme) => ({
					id: `theme-${theme}`,
					label: `${locale === "ar" ? "السمة" : "Theme"}: ${copy.theme[theme]}`,
					keywords: [theme],
					onSelect: () => change("theme", theme),
				})),
			],
		},
	];

	return (
		<div className="site-shell">
			<header className="site-header">
				<div className="site-brand-group">
					<Link className="site-brand" to="/" search={search as never} aria-label="tensquads">
						<TensquadsWordmark />
					</Link>
					<span className="site-brand__ui">ui</span>
				</div>
				<nav className="site-nav" aria-label={locale === "ar" ? "التنقل الرئيسي" : "Primary navigation"}>
					<Link to="/" search={search as never} activeOptions={{ exact: true }}>
						{copy.nav.home}
					</Link>
					<Link to="/components" search={search as never}>
						{copy.nav.components}
					</Link>
					<Link to="/chat" search={search as never}>
						{copy.nav.chat}
					</Link>
					<Link to="/dashboards/home" search={search as never}>
						{copy.nav.dashboards}
					</Link>
					<Link to="/get-started" search={search as never}>
						{copy.nav.getStarted}
					</Link>
				</nav>
				<div className="site-controls">
					<Button className="site-search-button" variant="ghost" onClick={() => setPaletteOpen(true)}>
						<svg aria-hidden="true" viewBox="0 0 24 24">
							<circle cx="10.8" cy="10.8" r="6.8" />
							<path d="m16 16 5 5" />
						</svg>
						<span>{locale === "ar" ? "بحث" : "Search"}</span>
						<kbd>⌘K</kbd>
					</Button>
					<SegmentedControl
						aria-label={copy.localeLabel}
						value={locale}
						onValueChange={(value) => value && change("locale", value)}
					>
						<SegmentedControlIndicator />
						<SegmentedControlItem value="en">English</SegmentedControlItem>
						<SegmentedControlItem value="ar">العربية</SegmentedControlItem>
					</SegmentedControl>
					<SegmentedControl
						aria-label={copy.themeLabel}
						value={theme}
						onValueChange={(value) => value && change("theme", value)}
					>
						<SegmentedControlIndicator />
						<SegmentedControlItem value="light">{copy.theme.light}</SegmentedControlItem>
						<SegmentedControlItem value="dark">{copy.theme.dark}</SegmentedControlItem>
						<SegmentedControlItem value="system">{copy.theme.system}</SegmentedControlItem>
					</SegmentedControl>
				</div>
			</header>
			<CommandPalette
				open={paletteOpen}
				onOpenChange={setPaletteOpen}
				groups={groups}
				locale={locale}
				labels={paletteLabels}
			/>
			<Outlet />
		</div>
	);
}
