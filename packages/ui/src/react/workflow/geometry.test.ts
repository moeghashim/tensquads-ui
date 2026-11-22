import { describe, expect, it } from "vitest";
import { WorkflowGraphSchema } from "../../schemas/workflow.js";
import { edgePath, portPosition } from "./geometry.js";

const node = (id: string, kind: "agent" | "start" | "end" | "if-else" = "agent", branches?: string[]) => ({
	id,
	kind,
	title: id,
	position: { x: 0, y: 0 },
	...(branches ? { branches } : {}),
});
const graph = (
	nodes: ReturnType<typeof node>[],
	edges: { id: string; from: string; fromPort?: number; to: string }[],
) => ({ nodes, edges });

describe("workflow graph schema", () => {
	it("accepts valid nodes and branch ports", () => {
		expect(
			WorkflowGraphSchema.safeParse(
				graph(
					[node("if", "if-else", ["Yes", "Else"]), node("done", "end")],
					[{ id: "e", from: "if", fromPort: 1, to: "done" }],
				),
			).success,
		).toBe(true);
	});
	it.each([
		[graph([node("a"), node("a")], []), "nodes.1.id"],
		[graph([node("a")], [{ id: "e", from: "a", to: "missing" }]), "edges.0.to"],
		[graph([node("a")], [{ id: "e", from: "missing", to: "a" }]), "edges.0.from"],
		[graph([node("start", "start"), node("a")], [{ id: "e", from: "a", to: "start" }]), "edges.0.to"],
		[graph([node("end", "end"), node("a")], [{ id: "e", from: "end", to: "a" }]), "edges.0.from"],
		[graph([node("a")], [{ id: "e", from: "a", fromPort: 0, to: "a" }]), "edges.0.fromPort"],
		[
			graph([node("if", "if-else", ["Yes", "No"])], [{ id: "e", from: "if", fromPort: 2, to: "if" }]),
			"edges.0.fromPort",
		],
		[
			graph(
				[node("a")],
				[
					{ id: "e", from: "a", to: "a" },
					{ id: "e", from: "a", to: "a" },
				],
			),
			"edges.1.id",
		],
		[graph([node("a", "agent", ["Yes", "No"])], []), "nodes.0.branches"],
		[graph([node("if", "if-else", ["Yes"])], []), "nodes.0.branches"],
	] as const)("reports invalid references at their paths", (input, path) => {
		const result = WorkflowGraphSchema.safeParse(input);
		expect(result.success).toBe(false);
		if (!result.success) expect(result.error.issues.some((issue) => issue.path.join(".") === path)).toBe(true);
	});
	it("rejects unknown node properties", () => {
		expect(WorkflowGraphSchema.safeParse({ nodes: [{ ...node("a"), extra: true }], edges: [] }).success).toBe(false);
	});
});

describe("workflow geometry", () => {
	it("matches the smooth-step connector path", () =>
		expect(edgePath(10, 20, 90, 60)).toBe("M10,20 C50,20 50,60 90,60"));
	it("matches Canvas guide head and branch port centres", () => {
		const branch = { ...node("if", "if-else", ["A", "B"]), position: { x: 12, y: 30 } };
		expect(portPosition(branch, "in", 200)).toEqual({ x: 12, y: 56.5 });
		expect(portPosition(branch, { out: 0 }, 200)).toEqual({ x: 212, y: 95 });
		expect(portPosition(branch, { out: 1 }, 200)).toEqual({ x: 212, y: 127 });
		expect(portPosition({ ...node("a"), position: { x: 12, y: 30 } }, { out: 0 }, 200)).toEqual({
			x: 212,
			y: 56.5,
		});
	});
});
