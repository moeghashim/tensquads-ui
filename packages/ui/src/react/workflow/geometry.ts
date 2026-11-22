import type { WorkflowNode } from "../../schemas/workflow.js";
import { tokens } from "../../tokens/tokens.js";

const px = (value: string) => Number.parseFloat(value);
export const NODE_METRICS = {
	headRowHeight: px(tokens["control-sm"].light) + 2 * px(tokens["space-2-5"].light),
	branchRowHeight: px(tokens["control-sm"].light),
	branchGap: px(tokens["space-1"].light),
	headBranchGap: px(tokens["space-2"].light),
	cardBlockEndPadding: px(tokens["space-2-5"].light),
	portSize: px(tokens["handle-size"].light),
} as const;

export function edgePath(x1: number, y1: number, x2: number, y2: number) {
	const midpoint = (x1 + x2) / 2;
	return `M${x1},${y1} C${midpoint},${y1} ${midpoint},${y2} ${x2},${y2}`;
}

export function portPosition(node: WorkflowNode, port: "in" | { out: number }, width: number) {
	if (port === "in") return { x: node.position.x, y: node.position.y + NODE_METRICS.headRowHeight / 2 };
	const y = node.branches
		? node.position.y +
			NODE_METRICS.headRowHeight +
			NODE_METRICS.headBranchGap +
			port.out * (NODE_METRICS.branchRowHeight + NODE_METRICS.branchGap) +
			NODE_METRICS.branchRowHeight / 2
		: node.position.y + NODE_METRICS.headRowHeight / 2;
	return { x: node.position.x + width, y };
}
