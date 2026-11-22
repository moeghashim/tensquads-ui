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
			2 * NODE_METRICS.cardBlockPadding
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
	const columns = new Map<string, number>();
	const pending = new Set(graph.nodes.map((node) => node.id));
	while (pending.size) {
		for (const node of graph.nodes) {
			if (!pending.has(node.id)) continue;
			const parents = predecessors.get(node.id) ?? [];
			if (parents.some((parent) => pending.has(parent.id))) continue;
			columns.set(
				node.id,
				parents.length ? Math.max(...parents.map((parent) => (columns.get(parent.id) ?? 0) + 1)) : 0,
			);
			pending.delete(node.id);
		}
	}
	const connected = new Set<string>();
	for (const edge of graph.edges) {
		connected.add(edge.from);
		connected.add(edge.to);
	}
	const flowNodes = graph.nodes.filter((node) => connected.has(node.id));
	const looseNodes = graph.nodes.filter((node) => !connected.has(node.id));
	const groups = new Map<number, WorkflowNode[]>();
	for (const node of flowNodes) {
		const col = columns.get(node.id) ?? 0;
		const group = groups.get(col) ?? [];
		group.push(node);
		groups.set(col, group);
	}
	const orderRank = new Map<string, number>();
	const orderedColumns = [...groups.keys()].sort((a, b) => a - b);
	for (const col of orderedColumns) {
		const group = groups.get(col)!;
		const parentOrder = new Map(
			group.map((node) => [
				node.id,
				(predecessors.get(node.id) ?? [])
					.filter((parent) => columns.get(parent.id) === col - 1)
					.sort((a, b) => orderRank.get(a.id)! - orderRank.get(b.id)! || a.port - b.port),
			]),
		);
		group.sort((a, b) => {
			const aParents = parentOrder.get(a.id)!;
			const bParents = parentOrder.get(b.id)!;
			for (let index = 0; index < Math.min(aParents.length, bParents.length); index++) {
				const ap = aParents[index]!;
				const bp = bParents[index]!;
				const difference = orderRank.get(ap.id)! - orderRank.get(bp.id)! || ap.port - bp.port;
				if (difference) return difference;
			}
			return aParents.length - bParents.length || nodeOrder.get(a.id)! - nodeOrder.get(b.id)!;
		});
		for (const [index, node] of group.entries()) orderRank.set(node.id, index);
	}
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
	const columnHeights = new Map<number, number>();
	for (const [col, group] of groups) {
		let height = 0;
		for (const [index, node] of group.entries()) {
			height += heightOf(node, sizes[node.id]);
			if (index < group.length - 1) height = atLeastGap(height, NODE_GAP);
		}
		columnHeights.set(col, height);
	}
	const flowHeight = Math.max(0, ...columnHeights.values());
	const positions: Record<string, { x: number; y: number }> = Object.create(null);
	for (const [col, group] of groups) {
		let y = originY + snap((flowHeight - columnHeights.get(col)!) / 2);
		for (const node of group) {
			positions[node.id] = { x: columnX.get(col) ?? originX, y };
			y = atLeastGap(y + heightOf(node, sizes[node.id]), NODE_GAP);
		}
	}
	let looseX = originX;
	const looseY = flowNodes.length ? atLeastGap(originY + flowHeight, NODE_GAP) : originY;
	for (const node of looseNodes) {
		const width = sizes[node.id]?.width ?? DEFAULT_NODE_WIDTH;
		positions[node.id] = { x: looseX, y: looseY };
		looseX = atLeastGap(looseX + width, COLUMN_GAP);
	}
	return positions;
}
