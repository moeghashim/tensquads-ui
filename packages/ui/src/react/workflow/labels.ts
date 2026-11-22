import type { WorkflowGraph, WorkflowNode, WorkflowNodeKind } from "../../schemas/workflow.js";

const labels = {
	en: {
		agent: "Agent",
		classify: "Classify",
		"if-else": "If/else",
		while: "While",
		"user-approval": "User approval",
		start: "Start",
		end: "End",
		note: "Note",
		"file-search": "File search",
		guardrails: "Guardrails",
		mcp: "MCP",
		transform: "Transform",
		"set-state": "Set state",
	},
	ar: {
		agent: "وكيل",
		classify: "تصنيف",
		"if-else": "شرط",
		while: "تكرار",
		"user-approval": "موافقة المستخدم",
		start: "البداية",
		end: "النهاية",
		note: "ملاحظة",
		"file-search": "بحث في الملفات",
		guardrails: "ضوابط",
		mcp: "MCP",
		transform: "تحويل",
		"set-state": "تعيين الحالة",
	},
} satisfies Record<"en" | "ar", Record<WorkflowNodeKind, string>>;

export function kindLabel(kind: WorkflowNodeKind, locale: "en" | "ar") {
	return labels[locale][kind];
}

/** The kind for assistive technology, or undefined when the card's own text already shows it. */
export function hiddenKind(node: WorkflowNode, locale: "en" | "ar") {
	const kind = kindLabel(node.kind, locale);
	const meta = node.kind === "note" ? undefined : node.meta;
	return [node.title, meta].some((text) => text?.trim() === kind) ? undefined : kind;
}

export function connectionsLabel(node: WorkflowNode, graph: WorkflowGraph, locale: "en" | "ar"): string | undefined {
	const targetIds = new Set<string>();
	const targets: WorkflowNode[] = [];
	const nodesById = new Map(graph.nodes.map((target) => [target.id, target]));
	for (const edge of graph.edges) {
		if (edge.from !== node.id || targetIds.has(edge.to)) continue;
		const target = nodesById.get(edge.to);
		if (!target) continue;
		targetIds.add(edge.to);
		targets.push(target);
	}
	if (!targets.length) return undefined;
	const names = targets.map((target) => target.title.trim() || kindLabel(target.kind, locale));
	return locale === "ar" ? `يتصل بـ: ${names.join("، ")}` : `Connects to ${names.join(", ")}`;
}
