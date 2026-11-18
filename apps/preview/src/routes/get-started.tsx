import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { siteCopy } from "../copy";
import { getPreviewState } from "../state";

export const Route = createFileRoute("/get-started")({ component: GetStartedPage });

function GetStartedPage() {
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const { locale } = getPreviewState(search);
	return (
		<main className="content-page">
			<h1>{siteCopy[locale].getStartedTitle}</h1>
		</main>
	);
}
