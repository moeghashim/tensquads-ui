import { describe, expect, it } from "vitest";
import type { WorkflowGraph } from "../../schemas/workflow.js";
import { canConnect } from "./connect.js";

const graph: WorkflowGraph = {
	nodes: [
		{ id: "start", kind: "start", title: "Start", position: { x: 0, y: 0 } },
		{ id: "branch", kind: "classify", title: "Branch", branches: ["A", "B"], position: { x: 1, y: 0 } },
		{ id: "plain", kind: "note", title: "Note", position: { x: 2, y: 0 } },
		{ id: "end", kind: "end", title: "End", position: { x: 3, y: 0 } },
	],
	edges: [{ id: "edge", from: "branch", fromPort: 1, to: "plain" }],
};

describe("canConnect", () => {
	it("refuses the same node", () => expect(canConnect(graph, "plain", undefined, "plain")).toBe(false));
	it("refuses a start target", () => expect(canConnect(graph, "plain", undefined, "start")).toBe(false));
	it("refuses an end source", () => expect(canConnect(graph, "end", undefined, "plain")).toBe(false));
	it("refuses an exact duplicate, treating a missing port as zero", () => {
		expect(canConnect({ ...graph, edges: [{ id: "e", from: "start", to: "plain" }] }, "start", 0, "plain")).toBe(
			false,
		);
	});
	it("allows distinct branch ports and notes", () => {
		expect(canConnect(graph, "branch", 0, "plain")).toBe(true);
		expect(canConnect(graph, "branch", 1, "end")).toBe(true);
	});
});
