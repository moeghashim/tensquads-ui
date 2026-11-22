import type { WorkflowGraph } from "../../schemas/workflow.js";

export function canConnect(graph: WorkflowGraph, from: string, fromPort: number | undefined, to: string) {
	if (from === to) return false;
	const source = graph.nodes.find((node) => node.id === from);
	const target = graph.nodes.find((node) => node.id === to);
	if (!source || !target || source.kind === "end" || target.kind === "start") return false;
	return !graph.edges.some((edge) => edge.from === from && edge.to === to && (edge.fromPort ?? 0) === (fromPort ?? 0));
}
