import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { TensquadsRenderer } from "@tensquads/ui/openui";
import {
	Squadmate,
	squadmateCharacterName,
	squadmateStateLabel,
} from "../../../../packages/ui/src/react/Squadmate/Squadmate";
import { AGENT_ROLE_TO_SLUG, type AgentState } from "../../../../packages/ui/src/schemas";
import { AGENT_LOOP_STATES, SQUADMATES } from "../../../../packages/ui/src/squadmates";
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
	if (name === "Squadmate") {
		const states: AgentState[] = ["idle", ...AGENT_LOOP_STATES.map(({ id }) => id)];
		return (
			<main className="gallery">
				<Link className="route-example" to="/" search={search as never}>
					{locale === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{locale === "ar" ? "معاينة المكوّن" : "Component preview"}</p>
				<h1>Squadmate</h1>
				<section
					className="squadmate-gallery"
					aria-label={locale === "ar" ? "الزملاء وحالاتهم" : "Squadmates and states"}
				>
					{SQUADMATES.map((mate) => (
						<div className="squadmate-gallery__agent" key={mate.id}>
							<h2>{squadmateCharacterName(AGENT_ROLE_TO_SLUG[mate.id], locale)}</h2>
							<div className="squadmate-gallery__states">
								{states.map((state) => (
									<figure key={state}>
										<Squadmate agent={AGENT_ROLE_TO_SLUG[mate.id]} state={state} size={48} locale={locale} />
										<figcaption>{squadmateStateLabel(state, locale)}</figcaption>
									</figure>
								))}
							</div>
						</div>
					))}
				</section>
			</main>
		);
	}
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
