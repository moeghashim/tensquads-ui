import { describe, expect, it } from "vitest";
import type { WorkflowGraph } from "../../schemas/workflow.js";
import { tidyLayout } from "./tidy.js";

const make = (
	id: string,
	kind: WorkflowGraph["nodes"][number]["kind"] = "agent",
	branches?: string[],
	x = 13,
	y = 27,
): WorkflowGraph["nodes"][number] => ({ id, kind, title: id, position: { x, y }, ...(branches ? { branches } : {}) });
const doesNotOverlap = (
	graph: WorkflowGraph,
	result: ReturnType<typeof tidyLayout>,
	sizes: Record<string, { width: number; height: number }>,
) => {
	for (let i = 0; i < graph.nodes.length; i++)
		for (let j = i + 1; j < graph.nodes.length; j++) {
			const a = graph.nodes[i]!;
			const b = graph.nodes[j]!;
			const pa = result[a.id]!;
			const pb = result[b.id]!;
			const sa = sizes[a.id] ?? { width: 180, height: 48 };
			const sb = sizes[b.id] ?? { width: 180, height: 48 };
			expect(
				pa.x + sa.width <= pb.x || pb.x + sb.width <= pa.x || pa.y + sa.height <= pb.y || pb.y + sb.height <= pa.y,
			).toBe(true);
		}
};

describe("tidyLayout", () => {
	it("lays out chains and keeps the starting bounds snapped", () => {
		const input: WorkflowGraph = {
			nodes: [make("start", "start"), make("a"), make("end", "end")],
			edges: [
				{ id: "1", from: "start", to: "a" },
				{ id: "2", from: "a", to: "end" },
			],
		};
		const output = tidyLayout(input);
		expect(output.start).toEqual({ x: 20, y: 20 });
		expect(output.a!.x).toBeGreaterThan(output.start!.x);
		expect(output.end!.x).toBeGreaterThan(output.a!.x);
	});
	it("orders a branch top to bottom and joins after the furthest parent", () => {
		const input: WorkflowGraph = {
			nodes: [
				make("start", "start"),
				make("branch", "if-else", ["yes", "no"]),
				make("yes"),
				make("no"),
				make("join"),
			],
			edges: [
				{ id: "s", from: "start", to: "branch" },
				{ id: "y", from: "branch", fromPort: 0, to: "yes" },
				{ id: "n", from: "branch", fromPort: 1, to: "no" },
				{ id: "j1", from: "yes", to: "join" },
				{ id: "j2", from: "no", to: "join" },
			],
		};
		const output = tidyLayout(input);
		expect(output.yes!.y).toBeLessThan(output.no!.y);
		expect(output.join!.x).toBeGreaterThan(output.yes!.x);
	});
	it("breaks a while loop deterministically and handles roots without a start", () => {
		const input: WorkflowGraph = {
			nodes: [make("while", "if-else", ["again", "done"]), make("work"), make("root")],
			edges: [
				{ id: "a", from: "while", fromPort: 0, to: "work" },
				{ id: "back", from: "work", to: "while" },
			],
		};
		const first = tidyLayout(input);
		expect(first).toEqual(tidyLayout(input));
		expect(first.root).toBeDefined();
	});
	it("places isolated nodes and notes below the flow in graph order", () => {
		const input: WorkflowGraph = {
			nodes: [make("a", "start"), make("b", "end"), make("quiet", "note"), make("solo")],
			edges: [{ id: "e", from: "a", to: "b" }],
		};
		const output = tidyLayout(input);
		expect(output.quiet!.y).toBe(output.solo!.y);
		expect(output.quiet!.x).toBeLessThan(output.solo!.x);
	});
	it("is empty for an empty graph", () => expect(tidyLayout({ nodes: [], edges: [] })).toEqual({}));
	it("uses supplied dimensions without overlap, remains idempotent, and preserves input", () => {
		const input: WorkflowGraph = {
			nodes: [make("s", "start"), make("a"), make("b"), make("loose", "note")],
			edges: [
				{ id: "1", from: "s", to: "a" },
				{ id: "2", from: "a", to: "b" },
			],
		};
		const before = structuredClone(input);
		const sizes = {
			s: { width: 244, height: 80 },
			a: { width: 126, height: 96 },
			b: { width: 300, height: 130 },
			loose: { width: 290, height: 70 },
		};
		const first = tidyLayout(input, sizes);
		expect(
			tidyLayout({ ...input, nodes: input.nodes.map((node) => ({ ...node, position: first[node.id]! })) }, sizes),
		).toEqual(first);
		expect(input).toEqual(before);
		doesNotOverlap(input, first, sizes);
	});
});
