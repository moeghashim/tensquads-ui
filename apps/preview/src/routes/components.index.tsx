import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { getRegisteredComponents, TensquadsRenderer } from "@tensquads/ui/openui";
import { siteCopy } from "../copy";
import { getPreviewState } from "../state";

const fixtures = import.meta.glob<string>("../../../../packages/ui/src/react/*/*.fixture.*.txt", {
	eager: true,
	query: "?raw",
	import: "default",
});
const components = getRegisteredComponents()
	.map(({ name }) => name)
	.sort();

export const Route = createFileRoute("/components/")({ component: ComponentsPage });

function ComponentsPage() {
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const { locale } = getPreviewState(search);
	const copy = siteCopy[locale];
	return (
		<main className="content-page">
			<p className="eyebrow">{copy.nav.components}</p>
			<h1>{copy.galleryTitle}</h1>
			<p className="intro">{copy.componentsLead}</p>
			<div className="component-grid component-grid--index">
				{components.map((name) => {
					const fixture = fixtures[`../../../../packages/ui/src/react/${name}/${name}.fixture.${locale}.txt`];
					return (
						<Link
							className="component-card"
							to="/components/$name"
							params={{ name }}
							search={search as never}
							key={name}
						>
							<div className="component-card__preview">
								{fixture ? <TensquadsRenderer stream={fixture} locale={locale} /> : <span>{name}</span>}
							</div>
							<strong>{name}</strong>
							<span className="component-card__arrow" aria-hidden="true">
								↗
							</span>
						</Link>
					);
				})}
			</div>
			<Link className="back-link" to="/" search={search as never}>
				{copy.back}
			</Link>
		</main>
	);
}
