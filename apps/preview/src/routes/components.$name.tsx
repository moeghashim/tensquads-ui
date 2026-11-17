import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/components/$name")({ component: ComponentPage });

function ComponentPage() {
	const { name } = Route.useParams();
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	return (
		<main className="gallery">
			<Link to="/" search={search as never}>Back to gallery</Link>
			<p className="eyebrow">Component preview</p>
			<h1>{name}</h1>
			<section className="component-list"><p className="empty-state">Add a component preview file to render this route.</p></section>
		</main>
	);
}
