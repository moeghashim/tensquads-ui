import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { Input, SegmentedControl, SegmentedControlIndicator, SegmentedControlItem } from "@tensquads/ui/react";
import { useEffect, useState } from "react";
import { catalogGroups, openUIComponents, reactOnlyComponents } from "../catalog";
import { CatalogPreview } from "../components/catalog-preview";
import { llmsUrl } from "../components/design-reference";
import { siteCopy } from "../copy";
import { getPreviewState } from "../state";

export const Route = createFileRoute("/components/")({ component: ComponentsPage });

type Category = keyof typeof catalogGroups;
type Filter = "all" | "openui" | "react";

const categories = Object.keys(catalogGroups) as Category[];
const componentTotal = openUIComponents.size + reactOnlyComponents.length;

function ComponentsPage() {
	const search = useRouterState({ select: (state) => state.location.search });
	const { locale, direction } = getPreviewState(search);
	const copy = siteCopy[locale].designSystem;
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState<Filter>("all");
	const [currentCategory, setCurrentCategory] = useState<Category>("actions");

	const term = query.trim().toLocaleLowerCase(locale);
	const visibleCategories = categories.flatMap((id) => {
		const names = catalogGroups[id].filter((name) => {
			const openUI = openUIComponents.has(name);
			if ((filter === "openui" && !openUI) || (filter === "react" && openUI)) return false;
			return `${name} ${copy.componentLeads[name]}`.toLocaleLowerCase(locale).includes(term);
		});
		return names.length ? [{ id, names }] : [];
	});

	const categoryIds = visibleCategories.map(({ id }) => id).join(" ");
	useEffect(() => {
		const headings = categoryIds.split(" ").flatMap((id) => document.getElementById(id) ?? []);
		const fromEnd = [...headings].reverse();
		const update = () => {
			const atEnd =
				window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;
			const visible = atEnd
				? fromEnd[0]
				: (fromEnd.find((heading) => heading.getBoundingClientRect().top < 120) ?? headings[0]);
			if (visible) setCurrentCategory(visible.id as Category);
		};
		update();
		window.addEventListener("scroll", update, { passive: true });
		window.addEventListener("resize", update);
		return () => {
			window.removeEventListener("scroll", update);
			window.removeEventListener("resize", update);
		};
	}, [categoryIds]);

	return (
		<main id="main" className="design-wrap catalog">
			<aside className="catalog-rail">
				<h1>{siteCopy[locale].nav.components}</h1>
				<p>
					{copy.catalogCount
						.replace("{total}", String(componentTotal))
						.replace("{openui}", String(openUIComponents.size))}
				</p>
				<Input
					type="search"
					aria-label={copy.filter}
					placeholder={copy.filter}
					value={query}
					onChange={(event) => setQuery(event.currentTarget.value)}
				/>
				<nav aria-label={copy.categories}>
					{visibleCategories.map(({ id, names }) => (
						<a key={id} href={`#${id}`} aria-current={currentCategory === id ? "location" : undefined}>
							{copy.groups[id]} <span>{names.length}</span>
						</a>
					))}
				</nav>
				<SegmentedControl
					aria-label={copy.filterTypes}
					value={filter}
					onValueChange={(value) => {
						if (value === "all" || value === "openui" || value === "react") setFilter(value);
					}}
				>
					<SegmentedControlIndicator />
					<SegmentedControlItem value="all">{copy.filterAll}</SegmentedControlItem>
					<SegmentedControlItem value="openui">OpenUI</SegmentedControlItem>
					<SegmentedControlItem value="react">{copy.filterReact}</SegmentedControlItem>
				</SegmentedControl>
				<a className="reference-resource" href={llmsUrl}>
					llms.txt
				</a>
			</aside>
			<div className="catalog-body">
				{visibleCategories.length === 0 && <p role="status">{copy.noMatches}</p>}
				{visibleCategories.map(({ id, names }) => (
					<section className="catalog-section" id={id} key={id} aria-labelledby={`category-${id}`}>
						<header className="catalog-section__head">
							<h2 id={`category-${id}`}>{copy.groups[id]}</h2>
							<p>{copy.groupLeads[id]}</p>
						</header>
						<div className="catalog-grid">
							{names.map((name) => {
								const openUI = openUIComponents.has(name);
								return (
									<Link
										className="component-card"
										to="/components/$name"
										params={{ name }}
										search={search}
										key={name}
									>
										<CatalogPreview name={name} locale={locale} direction={direction} />
										<div className="component-card__meta">
											<strong lang="en">{name}</strong>
											<p>{copy.componentLeads[name]}</p>
										</div>
										<div className="component-card__tags" lang="en">
											<span data-openui={openUI}>{openUI ? "OpenUI" : "React"}</span>
											<span>RTL</span>
										</div>
									</Link>
								);
							})}
						</div>
					</section>
				))}
			</div>
		</main>
	);
}
