import type { CanvasConnection } from "@tensquads/ui/react";
import type { WorkflowGraph } from "@tensquads/ui/schemas";
import type { WorkflowDocument } from "./demo-workflows";

type History = {
	past: WorkflowDocument[];
	present: WorkflowDocument;
	future: WorkflowDocument[];
	group?: object;
};

type Edit = {
	type: "edit";
	update: (document: WorkflowDocument) => WorkflowDocument;
	group?: object;
};

export function initialHistory(document: WorkflowDocument): History {
	return { past: [], present: document, future: [] };
}

export function updateHistory(history: History, action: Edit | { type: "undo" | "redo" }) {
	if (action.type === "edit") {
		const present = action.update(history.present);
		if (present === history.present) return history;
		const coalesced = action.group && action.group === history.group;
		return {
			past: coalesced ? history.past : [...history.past, history.present],
			present,
			future: [],
			group: action.group,
		};
	}
	const undo = action.type === "undo";
	const source = undo ? history.past : history.future;
	const present = source.at(-1);
	if (!present) return history;
	return {
		past: undo ? source.slice(0, -1) : [...history.past, history.present],
		present,
		future: undo ? [...history.future, history.present] : source.slice(0, -1),
	};
}

export function addConnection(graph: WorkflowGraph, connection: CanvasConnection): WorkflowGraph {
	const { from, to, fromPort } = connection;
	if (graph.edges.some((edge) => edge.from === from && edge.to === to && edge.fromPort === fromPort)) return graph;
	const id = JSON.stringify([from, fromPort, to]);
	return { ...graph, edges: [...graph.edges, { ...connection, id }] };
}
