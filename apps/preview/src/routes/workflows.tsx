import { createFileRoute, useRouter } from "@tanstack/react-router";
import { WorkflowCard } from "@tensquads/ui/react";
import { builderCopy } from "../components/nodes/copy";
import { demoWorkflow, workflowIds } from "../components/nodes/demo-workflows";
import { getPreviewState } from "../state";

export const Route = createFileRoute("/workflows")({
	component: WorkflowList,
});

function WorkflowList() {
	const search = Route.useSearch();
	const router = useRouter();
	const { locale } = getPreviewState(search);
	const copy = builderCopy[locale];
	return (
		<main id="main" className="design-wrap workflow-list">
			<h1>{copy.workflows}</h1>
			<p>{copy.listLead}</p>
			<div className="workflow-list__grid">
				{workflowIds.map((id) => {
					const { name, meta, status, stats, document } = demoWorkflow(id, locale);
					const href = router.buildLocation({ to: "/nodes/$id", params: { id }, search }).href;
					return (
						<WorkflowCard
							key={id}
							name={name}
							meta={meta}
							status={status}
							stats={stats}
							graph={document.graph}
							href={href}
							locale={locale}
						/>
					);
				})}
			</div>
		</main>
	);
}
