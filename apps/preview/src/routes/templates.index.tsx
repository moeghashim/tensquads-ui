import { createFileRoute, Link } from "@tanstack/react-router";
import { ReferenceIntro } from "../components/design-reference";
import { getPreviewState } from "../state";
import { templateCopy, templateNames, templates } from "../template-catalog";

export const Route = createFileRoute("/templates/")({ component: TemplateIndex });

function TemplateIndex() {
	const search = Route.useSearch();
	const { locale } = getPreviewState(search);
	const copy = templateCopy[locale];
	return (
		<main id="main" className="design-wrap">
			<ReferenceIntro title={copy.title} lead={copy.lead} />
			<div className="foundation-grid">
				{templateNames.map((name) => (
					<Link key={name} to="/templates/$name" params={{ name }} search={search}>
						{templates[name][locale].title}
						<small>{templates[name][locale].description}</small>
					</Link>
				))}
			</div>
		</main>
	);
}
