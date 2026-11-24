import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { squadmateCharacterName } from "@tensquads/ui/react";
import { AgentSlugSchema } from "@tensquads/ui/schemas";
import { DesignReferenceLayout, ReferenceIntro } from "../components/design-reference";
import { SquadmateStates } from "../components/squadmate-states";
import { siteCopy } from "../copy";
import { getPreviewState } from "../state";

export const Route = createFileRoute("/reference/mascot-states")({ component: MascotStatesPage });

function MascotStatesPage() {
	const search = useRouterState({ select: (state) => state.location.search });
	const { locale } = getPreviewState(search);
	const copy = siteCopy[locale];

	return (
		<main id="main" className="design-wrap">
			<ReferenceIntro title={copy.designSystem.states} lead={copy.reference.states} />
			<DesignReferenceLayout locale={locale} search={search}>
				<div className="reference-state-gallery">
					{AgentSlugSchema.options.map((agent) => (
						<section key={agent} className="reference-state-group">
							<h2>{squadmateCharacterName(agent, locale)}</h2>
							<SquadmateStates agent={agent} locale={locale} />
						</section>
					))}
				</div>
			</DesignReferenceLayout>
		</main>
	);
}
