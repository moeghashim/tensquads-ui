import { createFileRoute, notFound } from "@tanstack/react-router";
import { BuilderRoute } from "../components/nodes/builder";
import { isWorkflowId } from "../components/nodes/demo-workflows";

export const Route = createFileRoute("/nodes/$id")({
	loader: ({ params: { id } }) => {
		if (!isWorkflowId(id)) throw notFound();
		return id;
	},
	component: () => <BuilderRoute id={Route.useLoaderData()} />,
});
