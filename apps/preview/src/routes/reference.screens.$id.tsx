import { createFileRoute, notFound, useRouterState } from "@tanstack/react-router";
import { DesignReferenceLayout, ReferenceIntro } from "../components/design-reference";
import { ReferenceViewer } from "../components/reference-viewer";
import { siteCopy } from "../copy";
import { productScreens, productScreenTitle } from "../reference";
import { getPreviewState } from "../state";

export const Route = createFileRoute("/reference/screens/$id")({
	loader: ({ params }) => {
		const screen = productScreens.find(({ id }) => id === params.id);
		if (!screen) throw notFound();
		return screen;
	},
	component: ScreenPage,
});

function ScreenPage() {
	const screen = Route.useLoaderData();
	const search = useRouterState({ select: (state) => state.location.search });
	const { locale } = getPreviewState(search);
	const title = productScreenTitle(screen, locale);
	const numbers = new Intl.NumberFormat(locale);
	return (
		<main id="main" className="design-wrap">
			<ReferenceIntro
				title={title}
				lead={siteCopy[locale].reference.dimensions(numbers.format(screen.width), numbers.format(screen.height))}
			/>
			<DesignReferenceLayout locale={locale} search={search}>
				<ReferenceViewer {...screen} title={title} locale={locale} />
			</DesignReferenceLayout>
		</main>
	);
}
