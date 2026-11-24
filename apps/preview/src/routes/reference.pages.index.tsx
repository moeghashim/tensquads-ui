import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { Button } from "@tensquads/ui/react";
import { DesignReferenceLayout, ReferenceIntro } from "../components/design-reference";
import { siteCopy } from "../copy";
import { liveHomepages, pageDesigns } from "../reference";
import { getPreviewState } from "../state";

export const Route = createFileRoute("/reference/pages/")({ component: PageDesigns });

function PageDesigns() {
	const search = useRouterState({ select: (state) => state.location.search });
	const { locale } = getPreviewState(search);
	const copy = siteCopy[locale];

	return (
		<main id="main" className="design-wrap">
			<ReferenceIntro title={copy.designSystem.pages} lead={copy.reference.pages} />
			<DesignReferenceLayout locale={locale} search={search}>
				<div className="reference-page-gallery">
					<article className="reference-page-card reference-page-card--homepage">
						<div className="reference-page-card__body">
							<h2>{copy.reference.homepage}</h2>
							<p>{copy.reference.homepageDescription}</p>
							<div className="reference-page-card__shots">
								<a href={liveHomepages.en} hrefLang="en" target="_blank" rel="noreferrer">
									{copy.reference.homepageEnglish}
								</a>
								<a href={liveHomepages.ar} hrefLang="ar" target="_blank" rel="noreferrer">
									{copy.reference.homepageArabic}
								</a>
							</div>
						</div>
					</article>
					{pageDesigns.map(({ id, screenshot }) => (
						<article key={id} className="reference-page-card">
							<img src={screenshot} alt="" />
							<div className="reference-page-card__body">
								<h2>{copy.reference.pageTitles[id]}</h2>
								<Button
									variant="soft"
									render={<Link to="/reference/pages/$id" params={{ id }} search={search} />}
								>
									{copy.reference.openViewer}
								</Button>
								<div className="reference-page-card__shots">
									<a href={screenshot}>{copy.reference.desktopShot}</a>
								</div>
							</div>
						</article>
					))}
				</div>
			</DesignReferenceLayout>
		</main>
	);
}
