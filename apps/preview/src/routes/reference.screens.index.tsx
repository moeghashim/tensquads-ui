import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { Arrow, DesignReferenceLayout, ReferenceIntro } from "../components/design-reference";
import { siteCopy } from "../copy";
import { productScreens, productScreenTitle } from "../reference";
import { getPreviewState } from "../state";

export const Route = createFileRoute("/reference/screens/")({ component: ScreensPage });

function ScreensPage() {
	const search = useRouterState({ select: (state) => state.location.search });
	const { locale, direction } = getPreviewState(search);
	const copy = siteCopy[locale];
	const numbers = new Intl.NumberFormat(locale);
	return (
		<main id="main" className="design-wrap">
			<ReferenceIntro title={copy.designSystem.screens} lead={copy.reference.screens} />
			<DesignReferenceLayout locale={locale} search={search}>
				<ul className="reference-screen-list">
					{productScreens.map((screen) => (
						<li key={screen.id}>
							<Link to="/reference/screens/$id" params={{ id: screen.id }} search={search}>
								<strong>{productScreenTitle(screen, locale)}</strong>
								<small>
									{copy.reference.dimensions(numbers.format(screen.width), numbers.format(screen.height))}
								</small>
								<Arrow direction={direction} />
							</Link>
						</li>
					))}
				</ul>
			</DesignReferenceLayout>
		</main>
	);
}
