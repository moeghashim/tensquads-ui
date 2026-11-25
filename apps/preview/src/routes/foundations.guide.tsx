import { createFileRoute, useRouterState } from "@tanstack/react-router";
import guide from "../../../../DESIGN.md?raw";
import { FoundationPageLinks, ReferenceIntro, ReferenceLayout } from "../components/design-reference";
import { MarkdownProse } from "../components/docs/markdown-document";
import { siteCopy } from "../copy";
import { getPreviewState } from "../state";

export const Route = createFileRoute("/foundations/guide")({ component: DesignGuidePage });

const markdown = guide.replaceAll("](https://tensquads-ui-preview.mohanadgh.workers.dev/", "](/");

function DesignGuidePage() {
	const search = useRouterState({ select: (state) => state.location.search });
	const { locale } = getPreviewState(search);
	const design = siteCopy[locale].designSystem;
	const { title, sourceLanguage } = design.foundationsIndex.guide;

	return (
		<main id="main" className="design-wrap">
			<ReferenceIntro title={title} />
			<ReferenceLayout label={design.foundations} links={<FoundationPageLinks locale={locale} search={search} />}>
				{sourceLanguage && <p>{sourceLanguage}</p>}
				<article className="markdown-document reference-prose design-guide" lang="en" dir="ltr">
					<MarkdownProse markdown={markdown} showCode omitTitle />
				</article>
			</ReferenceLayout>
		</main>
	);
}
