import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { FoundationLinks, ReferenceIntro } from "../components/design-reference";
import { siteCopy } from "../copy";
import { getPreviewState } from "../state";

export const Route = createFileRoute("/foundations/")({ component: FoundationsPage });

function FoundationsPage() {
	const search = useRouterState({ select: (state) => state.location.search });
	const { locale, direction } = getPreviewState(search);
	const copy = siteCopy[locale].designSystem;

	return (
		<main id="main" className="design-wrap">
			<ReferenceIntro title={copy.foundations} lead={copy.foundationLead} />
			<FoundationLinks locale={locale} direction={direction} search={search} descriptions />
		</main>
	);
}
