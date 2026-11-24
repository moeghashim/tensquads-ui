import { createFileRoute, useRouterState } from "@tanstack/react-router";
import principles from "../../../../design/agent-ui/README.md?raw";
import { DesignReferenceLayout, ReferenceIntro } from "../components/design-reference";
import { MarkdownProse } from "../components/docs/markdown-document";
import { siteCopy } from "../copy";
import { getPreviewState } from "../state";

export const Route = createFileRoute("/foundations/principles")({ component: PrinciplesPage });

function PrinciplesPage() {
	const search = useRouterState({ select: (state) => state.location.search });
	const { locale } = getPreviewState(search);
	const copy = siteCopy[locale];
	return (
		<main id="main" className="design-wrap">
			<ReferenceIntro title={copy.designSystem.principles} lead={copy.reference.principles} />
			<DesignReferenceLayout locale={locale} search={search}>
				{copy.reference.sourceLanguage && <p>{copy.reference.sourceLanguage}</p>}
				<article className="markdown-document reference-prose" lang="en" dir="ltr">
					<MarkdownProse markdown={principles} />
				</article>
			</DesignReferenceLayout>
		</main>
	);
}
