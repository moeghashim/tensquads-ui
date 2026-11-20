import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { getRegisteredComponents, TensquadsRenderer } from "@tensquads/ui/openui";
import { ChatReply } from "../../../../packages/ui/src/react/ChatReply/ChatReply";
import { siteCopy } from "../copy";
import { getPreviewState } from "../state";

const fixtures = import.meta.glob<string>("../../../../packages/ui/src/react/*/*.fixture.*.txt", {
	eager: true,
	query: "?raw",
	import: "default",
});
const components = getRegisteredComponents()
	.map(({ name }) => name)
	.sort();
if (!components.includes("Chat")) components.push("Chat");
components.push("ChatReply");
components.push("OwnerMessageView");
components.push("Sidebar");
components.push("ThemeToggle");
components.push("Toolbar");
components.sort();

export const Route = createFileRoute("/components/")({ component: ComponentsPage });

function ComponentsPage() {
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const { locale, direction } = getPreviewState(search);
	const copy = siteCopy[locale];
	return (
		<main className="content-page">
			<p className="eyebrow">{copy.nav.components}</p>
			<h1>{copy.galleryTitle}</h1>
			<p className="intro">{copy.componentsLead}</p>
			<div className="component-grid component-grid--index">
				{components.map((name) => {
					const fixture = fixtures[`../../../../packages/ui/src/react/${name}/${name}.fixture.${locale}.txt`];
					return (
						<div className="component-card" key={name}>
							<div className="component-card__preview">
								{name === "Sidebar" || name === "ThemeToggle" || name === "Toolbar" ? (
									<span>{locale === "ar" ? "معاينة التنقل" : "Navigation preview"}</span>
								) : fixture ? (
									name === "ChatReply" ? (
										<ChatReply reply={fixture} locale={locale} />
									) : (
										<TensquadsRenderer stream={fixture} locale={locale} />
									)
								) : (
									<span>{name}</span>
								)}
							</div>
							<Link
								className="component-card__link"
								to="/components/$name"
								params={{ name }}
								search={search as never}
							>
								<strong>{name}</strong>
								<span className="component-card__arrow" aria-hidden="true">
									{direction === "rtl" ? "←" : "→"}
								</span>
							</Link>
						</div>
					);
				})}
			</div>
			<Link className="back-link" to="/" search={search as never}>
				{copy.back}
			</Link>
		</main>
	);
}
