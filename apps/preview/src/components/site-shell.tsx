import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { SegmentedControl, SegmentedControlIndicator, SegmentedControlItem } from "@tensquads/ui/react";
import { siteCopy } from "../copy";
import { getPreviewState } from "../state";
import { TensquadsWordmark } from "./tensquads-wordmark";

export function SiteShell() {
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const navigate = useNavigate();
	const { locale, theme } = getPreviewState(search);
	const copy = siteCopy[locale];
	const change = (key: "locale" | "theme", value: string) => {
		const nextSearch = { ...search, [key]: value };
		if (key === "locale") nextSearch.dir = value === "ar" ? "rtl" : "ltr";
		void navigate({ to: ".", search: nextSearch as never });
	};

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
					<Link to="/get-started" search={search as never}>
						{copy.nav.getStarted}
					</Link>
				</nav>
				<div className="site-controls">
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
			<Outlet />
		</div>
	);
}
