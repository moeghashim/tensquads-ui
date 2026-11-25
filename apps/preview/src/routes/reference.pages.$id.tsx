import { createFileRoute, notFound, useRouterState } from "@tanstack/react-router";
import { DesignReferenceLayout, ReferenceIntro } from "../components/design-reference";
import { ReferenceViewer } from "../components/reference-viewer";
import { siteCopy } from "../copy";
import { pageDesigns } from "../reference";
import { getPreviewState } from "../state";

export const Route = createFileRoute("/reference/pages/$id")({
	loader: ({ params }) => {
		const design = pageDesigns.find(({ id }) => id === params.id);
		if (!design) throw notFound();
		return design;
	},
	component: PageDesign,
});

function PageDesign() {
	const design = Route.useLoaderData();
	const search = useRouterState({ select: (state) => state.location.search });
	const { locale } = getPreviewState(search);
	const copy = siteCopy[locale];
	const title = copy.reference.pageTitles[design.id];
	return (
		<main id="main" className="design-wrap">
			<ReferenceIntro title={title} lead={copy.designSystem.pages} />
			<DesignReferenceLayout locale={locale} search={search}>
				<ReferenceViewer {...design} title={title} locale={locale} />
			</DesignReferenceLayout>
		</main>
	);
}
