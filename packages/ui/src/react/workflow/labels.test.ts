import { describe, expect, it } from "vitest";
import type { WorkflowGraph, WorkflowNode } from "../../schemas/workflow.js";
import { connectionsLabel, kindLabel, nodeLabel } from "./labels.js";

const node = (kind: WorkflowNode["kind"], title: string, id = "node"): WorkflowNode => ({
	id,
	kind,
	title,
	position: { x: 0, y: 0 },
});

describe("workflow labels", () => {
	it("labels every kind in English and Arabic", () => {
		const kinds: WorkflowNode["kind"][] = [
			"agent",
			"classify",
			"if-else",
			"while",
			"user-approval",
			"start",
			"end",
			"note",
			"file-search",
			"guardrails",
			"mcp",
			"transform",
			"set-state",
		];
		expect(kinds.map((kind) => kindLabel(kind, "en"))).toEqual([
			"Agent",
			"Classify",
			"If/else",
			"While",
			"User approval",
			"Start",
			"End",
			"Note",
			"File search",
			"Guardrails",
			"MCP",
			"Transform",
			"Set state",
		]);
		expect(kinds.map((kind) => kindLabel(kind, "ar"))).toEqual([
			"وكيل",
			"تصنيف",
			"شرط",
			"تكرار",
			"موافقة المستخدم",
			"بداية",
			"نهاية",
			"ملاحظة",
			"بحث في الملفات",
			"ضوابط",
			"MCP",
			"تحويل",
			"تعيين الحالة",
		]);
	});

	it("combines kind and title while avoiding duplicate or empty labels", () => {
		expect(nodeLabel(node("agent", "Draft reply"), "en")).toBe("Agent: Draft reply");
		expect(nodeLabel(node("agent", "Agent"), "en")).toBe("Agent");
		expect(nodeLabel(node("agent", "  "), "en")).toBe("Agent");
		expect(nodeLabel(node("agent", "وكيل"), "ar")).toBe("وكيل");
	});

	it("lists distinct existing outgoing targets in edge order", () => {
		const source = node("start", "Start", "start");
		const graph: WorkflowGraph = {
			nodes: [source, node("agent", "Draft reply", "a"), node("end", "", "b")],
			edges: [
				{ id: "1", from: "start", to: "a" },
				{ id: "2", from: "start", to: "missing" },
				{ id: "3", from: "start", to: "b" },
				{ id: "4", from: "start", to: "a" },
			],
		};
		expect(connectionsLabel(source, graph, "en")).toBe("Connects to Draft reply, End");
		expect(connectionsLabel(source, graph, "ar")).toBe("يتصل بـ: Draft reply، نهاية");
		expect(connectionsLabel(graph.nodes[1]!, graph, "en")).toBeUndefined();
	});
});
