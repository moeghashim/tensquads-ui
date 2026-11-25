import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
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
import { openUIComponents, reactOnlyComponents } from "../catalog";
import { siteCopy } from "../copy";
import { signal } from "../design-assets";
import { designGuidePath, pageDesigns, productScreens, productScreenTitle, referenceSections } from "../reference";
import { getPreviewState } from "../state";
import { templateCopy } from "../template-catalog";
import { foundationNames, llmsUrl } from "./design-reference";
import { SitePageCommands } from "./site-page-commands";
import { useMarkdownHref } from "./use-markdown-href";

function SiteCommandPalette(props: React.ComponentProps<typeof CommandPalette>) {
	useCommandPaletteShortcut(() => props.onOpenChange(true));
	return <CommandPalette {...props} />;
}

export function SiteShell() {
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const path = useRouterState({ select: (state) => state.location.pathname });
	const builder = path === "/nodes" || path.startsWith("/nodes/");
	const navigate = useNavigate();
	const { locale, theme } = getPreviewState(search);
	const copy = siteCopy[locale];
	const markdownHref = useMarkdownHref(locale);
	const design = copy.designSystem;
	const nextLocale = locale === "en" ? "ar" : "en";
	const [paletteOpen, setPaletteOpen] = useState(false);
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
				{ id: "foundations", label: design.foundations, path: "/foundations" },
				{ id: "components", label: copy.nav.components, path: "/components" },
				{ id: "templates", label: templateCopy[locale].title, path: "/templates" },
				{ id: "nodes", label: copy.nav.nodes, path: "/nodes" },
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
			id: "foundations",
			label: design.foundations,
			items: [
				{
					id: "foundation-guide",
					label: design.foundationsIndex.guide.title,
					keywords: ["DESIGN.md"],
					onSelect: () => void navigate({ to: designGuidePath, search }),
				},
				...foundationNames.map((name) => ({
					id: `foundation-${name}`,
					label: design.foundationsIndex[name].title,
					keywords: [name],
					onSelect: () => void navigate({ to: "/foundations/$name", params: { name }, search }),
				})),
			],
		},
		{
			id: "reference",
			label: design.reference,
			items: [
				...referenceSections.map(({ id, path }) => ({
					id: `reference-${id}`,
					label: design[id],
					onSelect: () => void navigate({ to: path, search }),
				})),
				...productScreens.map((screen) => ({
					id: `screen-${screen.id}`,
					label: productScreenTitle(screen, locale),
					onSelect: () => void navigate({ to: "/reference/screens/$id", params: { id: screen.id }, search }),
				})),
				...pageDesigns.map(({ id }) => ({
					id: `page-design-${id}`,
					label: copy.reference.pageTitles[id],
					onSelect: () => void navigate({ to: "/reference/pages/$id", params: { id }, search }),
				})),
			],
		},
		{
			id: "components",
			label: locale === "ar" ? "المكوّنات" : "Components",
			items: [...openUIComponents.keys(), ...reactOnlyComponents].map((name) => ({
				id: `component-${name}`,
				label: name,
				keywords: [openUIComponents.get(name) ?? name],
				onSelect: () => void navigate({ to: "/components/$name", params: { name }, search }),
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
		<div className={builder ? "site-shell site-shell--builder" : "site-shell"}>
			<a className="site-skip" href="#main">
				{design.skip}
			</a>
			<header className="site-header">
				<div className="design-wrap site-header__inner">
					<Link className="site-brand" to="/" search={search}>
						<img src={signal.light} alt="" />
						<img className="theme-mark-dark" src={signal.dark} alt="" />
						{design.brand}
					</Link>
					<nav className="site-nav" aria-label={design.primaryNav}>
						{builder && (
							<Link to="/" search={search}>
								{copy.nav.home}
							</Link>
						)}
						<Link to="/foundations" search={search}>
							{design.foundations}
						</Link>
						<Link to="/components" search={search}>
							{copy.nav.components}
						</Link>
						<Link to="/templates" search={search}>
							{templateCopy[locale].title}
						</Link>
						<Link to="/nodes" search={search}>
							{copy.nav.nodes}
						</Link>
						<Link to="/chat" search={search}>
							{copy.nav.chatNav}
						</Link>
						{!builder && (
							<Link to="/get-started" search={search}>
								{copy.nav.getStarted}
							</Link>
						)}
					</nav>
					<div className="site-controls">
						{!builder && (
							<Button className="site-search-button" variant="ghost" onClick={() => setPaletteOpen(true)}>
								<svg aria-hidden="true" viewBox="0 0 24 24">
									<circle cx="10.8" cy="10.8" r="6.8" />
									<path d="m16 16 5 5" />
								</svg>
								<span>{locale === "ar" ? "بحث" : "Search"}</span>
								<kbd>⌘K</kbd>
							</Button>
						)}
						<Button variant="ghost" size="sm" onClick={() => change("locale", nextLocale)} lang={nextLocale}>
							{copy.locale[nextLocale]}
						</Button>
						{!builder && (
							<SegmentedControl
								className="site-theme"
								aria-label={copy.themeLabel}
								value={theme}
								onValueChange={(value) => value && change("theme", value)}
							>
								<SegmentedControlIndicator />
								{(["light", "dark", "system"] as const).map((mode) => (
									<SegmentedControlItem
										key={mode}
										value={mode}
										aria-label={copy.theme[mode]}
										title={copy.theme[mode]}
									>
										<svg aria-hidden="true" viewBox="0 0 24 24">
											{mode === "light" && (
												<path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19m0-14-1.5 1.5m-11 11L5 19m11-7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
											)}
											{mode === "dark" && <path d="M21 13a9 9 0 1 1-10-10 7.5 7.5 0 0 0 10 10Z" />}
											{mode === "system" && <path d="M3 4h18v13H3zM8 21h8m-4-4v4" />}
										</svg>
									</SegmentedControlItem>
								))}
							</SegmentedControl>
						)}
					</div>
				</div>
			</header>
			{!builder && (
				<SiteCommandPalette
					open={paletteOpen}
					onOpenChange={setPaletteOpen}
					groups={groups}
					locale={locale}
					labels={paletteLabels}
				/>
			)}
			<SitePageCommands.Provider value={groups[0]}>
				<Outlet />
			</SitePageCommands.Provider>
			{!builder && (
				<footer className="site-footer">
					<div className="site-footer__inner design-wrap">
						<span>
							<bdi>tensquads</bdi> · {design.brand}
						</span>
						<nav aria-label={design.resources}>
							<a href="https://github.com/moeghashim/tensquads-ui">{copy.footerGithub}</a>
							<Link to="/get-started" search={search}>
								{copy.nav.getStarted}
							</Link>
							<a href={llmsUrl}>llms.txt</a>
							{markdownHref && (
								<a href={markdownHref}>{locale === "ar" ? "عرض بصيغة Markdown" : "View as Markdown"}</a>
							)}
						</nav>
					</div>
				</footer>
			)}
		</div>
	);
}
