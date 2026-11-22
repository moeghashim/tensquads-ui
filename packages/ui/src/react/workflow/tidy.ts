import type { WorkflowGraph, WorkflowNode } from "../../schemas/workflow.js";
import { NODE_METRICS } from "./geometry.js";

export type NodeSize = { width: number; height: number };
// These layout distances are fixed in the task's tidy-layout specification.
const GRID = 20;
const COLUMN_GAP = 80;
const NODE_GAP = 40;
// The node guide specifies content-driven widths but no default. Use a 180px layout estimate until Canvas measures it.
const DEFAULT_NODE_WIDTH = 180;
const snap = (value: number) => Math.round(value / GRID) * GRID;
const atLeastGap = (value: number, min: number) => Math.ceil((value + min) / GRID) * GRID;

function heightOf(node: WorkflowNode, size?: NodeSize) {
	return (
		size?.height ??
		NODE_METRICS.headRowHeight +
			(node.branches
				? NODE_METRICS.headBranchGap +
					node.branches.length * NODE_METRICS.branchRowHeight +
					Math.max(0, node.branches.length - 1) * NODE_METRICS.branchGap
				: 0) +
			NODE_METRICS.cardBlockEndPadding
	);
}

export function tidyLayout(
	graph: WorkflowGraph,
	sizes: Record<string, NodeSize> = {},
): Record<string, { x: number; y: number }> {
	if (!graph.nodes.length) return {};
	const nodeOrder = new Map(graph.nodes.map((node, index) => [node.id, index]));
	const outgoing = new Map(graph.nodes.map((node) => [node.id, [] as string[]]));
	for (const edge of graph.edges) outgoing.get(edge.from)?.push(edge.to);
	// A depth-first walk in graph.nodes order marks only edges that point to an active ancestor as loop-closing.
	const visiting = new Set<string>();
	const visited = new Set<string>();
	const loopEdges = new Set<string>();
	const edgeKey = (from: string, to: string, index: number) => `${from}\u0000${to}\u0000${index}`;
	const edgeByPair = new Map<string, number[]>();
	graph.edges.forEach((edge, index) => {
		const key = `${edge.from}\u0000${edge.to}`;
		const list = edgeByPair.get(key) ?? [];
		list.push(index);
		edgeByPair.set(key, list);
	});
	const usedPairIndex = new Map<string, number>();
	const walk = (id: string) => {
		if (visited.has(id)) return;
		visiting.add(id);
		for (const target of outgoing.get(id) ?? []) {
			const pair = `${id}\u0000${target}`;
			const used = usedPairIndex.get(pair) ?? 0;
			const edgeIndex = edgeByPair.get(pair)?.[used];
			usedPairIndex.set(pair, used + 1);
			if (visiting.has(target)) {
				if (edgeIndex !== undefined) loopEdges.add(edgeKey(id, target, edgeIndex));
			} else walk(target);
		}
		visiting.delete(id);
		visited.add(id);
	};
	for (const node of graph.nodes) walk(node.id);
	const activeEdges = graph.edges.filter((edge, index) => !loopEdges.has(edgeKey(edge.from, edge.to, index)));
	const predecessors = new Map(graph.nodes.map((node) => [node.id, [] as { id: string; port: number }[]]));
	for (const edge of activeEdges) predecessors.get(edge.to)?.push({ id: edge.from, port: edge.fromPort ?? -1 });
	for (const items of predecessors.values())
		items.sort((a, b) => nodeOrder.get(a.id)! - nodeOrder.get(b.id)! || a.port - b.port);
	const columns = new Map<string, number>();
	const pending = new Set(graph.nodes.map((node) => node.id));
	while (pending.size) {
		let progressed = false;
		for (const node of graph.nodes) {
			if (!pending.has(node.id)) continue;
			const parents = predecessors.get(node.id) ?? [];
			if (parents.some((parent) => pending.has(parent.id))) continue;
			columns.set(
				node.id,
				parents.length ? Math.max(...parents.map((parent) => (columns.get(parent.id) ?? 0) + 1)) : 0,
			);
			pending.delete(node.id);
			progressed = true;
		}
		if (!progressed) {
			const first = graph.nodes.find((node) => pending.has(node.id));
			if (first) {
				columns.set(first.id, 0);
				pending.delete(first.id);
			}
		}
	}
	const connected = new Set<string>();
	for (const edge of graph.edges) {
		connected.add(edge.from);
		connected.add(edge.to);
	}
	const flowNodes = graph.nodes.filter((node) => connected.has(node.id));
	const looseNodes = graph.nodes.filter((node) => !connected.has(node.id));
	const children = new Map(graph.nodes.map((node) => [node.id, [] as { id: string; port: number }[]]));
	for (const edge of activeEdges) children.get(edge.from)?.push({ id: edge.to, port: edge.fromPort ?? -1 });
	for (const list of children.values())
		list.sort((a, b) => a.port - b.port || nodeOrder.get(a.id)! - nodeOrder.get(b.id)!);
	const orderRank = new Map<string, number>();
	let nextRank = 0;
	for (const root of flowNodes.filter((node) => !predecessors.get(node.id)?.length)) {
		const queue = [root.id];
		const seen = new Set<string>();
		while (queue.length) {
			const id = queue.shift()!;
			if (seen.has(id)) continue;
			seen.add(id);
			if (!orderRank.has(id)) orderRank.set(id, nextRank++);
			queue.push(...(children.get(id) ?? []).map((item) => item.id));
		}
	}
	for (const node of flowNodes) if (!orderRank.has(node.id)) orderRank.set(node.id, nextRank++);
	const groups = new Map<number, WorkflowNode[]>();
	for (const node of flowNodes) {
		const col = columns.get(node.id) ?? 0;
		const group = groups.get(col) ?? [];
		group.push(node);
		groups.set(col, group);
	}
	for (const group of groups.values())
		group.sort((a, b) => orderRank.get(a.id)! - orderRank.get(b.id)! || nodeOrder.get(a.id)! - nodeOrder.get(b.id)!);
	const originX = snap(Math.min(...graph.nodes.map((node) => node.position.x)));
	const originY = snap(Math.min(...graph.nodes.map((node) => node.position.y)));
	const maxColumn = Math.max(0, ...groups.keys());
	const columnX = new Map<number, number>();
	let x = originX;
	for (let col = 0; col <= maxColumn; col++) {
		columnX.set(col, x);
		const widest = Math.max(0, ...(groups.get(col) ?? []).map((node) => sizes[node.id]?.width ?? DEFAULT_NODE_WIDTH));
		x = atLeastGap(x + widest, COLUMN_GAP);
	}
	const positions: Record<string, { x: number; y: number }> = {};
	let flowBottom = originY;
	for (const [col, group] of groups) {
		let y = originY;
		for (const node of group) {
			positions[node.id] = { x: columnX.get(col) ?? originX, y };
			y = atLeastGap(y + heightOf(node, sizes[node.id]), NODE_GAP);
		}
		flowBottom = Math.max(flowBottom, y);
	}
	let looseX = originX;
	const looseY = flowNodes.length ? atLeastGap(flowBottom, NODE_GAP) : originY;
	for (const node of looseNodes) {
		const width = sizes[node.id]?.width ?? DEFAULT_NODE_WIDTH;
		positions[node.id] = { x: looseX, y: looseY };
		looseX = atLeastGap(looseX + width, COLUMN_GAP);
	}
	return positions;
}
