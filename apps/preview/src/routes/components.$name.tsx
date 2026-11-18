import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { TensquadsRenderer } from "@tensquads/ui/openui";
import { getPreviewState } from "../state";

const fixtures = import.meta.glob<string>("../../../../packages/ui/src/react/*/*.fixture.*.txt", {
	eager: true,
	query: "?raw",
	import: "default",
});

export const Route = createFileRoute("/components/$name")({ component: ComponentPage });

function ComponentPage() {
	const { name } = Route.useParams();
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const { locale } = getPreviewState(search);
	const stream = fixtures[`../../../../packages/ui/src/react/${name}/${name}.fixture.${locale}.txt`];
	return (
		<main className="gallery">
			<Link to="/" search={search as never}>
				Back to gallery
			</Link>
			<p className="eyebrow">Component preview</p>
			<h1>{name}</h1>
			<section className="component-list">
				{stream ? (
					<TensquadsRenderer stream={stream} locale={locale} />
				) : (
					<p className="empty-state">No {locale} OpenUI fixture is registered for this component.</p>
				)}
			</section>
		</main>
	);
}
