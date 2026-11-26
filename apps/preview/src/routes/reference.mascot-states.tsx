import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { squadmateCharacterName } from "@tensquads/ui/react";
import { AgentSlugSchema } from "@tensquads/ui/schemas";
import { DesignReferenceLayout } from "../components/design-reference";
import { MascotHero } from "../components/mascot-hero";
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
			<MascotHero locale={locale} />
			<DesignReferenceLayout locale={locale} search={search}>
				<section
					id="states"
					className="reference-state-gallery"
					aria-label={copy.designSystem.states}
					tabIndex={-1}
				>
					{AgentSlugSchema.options.map((agent) => (
						<section key={agent} className="reference-state-group">
							<h2>{squadmateCharacterName(agent, locale)}</h2>
							<SquadmateStates agent={agent} locale={locale} />
						</section>
					))}
				</section>
			</DesignReferenceLayout>
		</main>
	);
}
