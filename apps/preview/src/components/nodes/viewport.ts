import type { CanvasViewport, NodeSize } from "@tensquads/ui/react";
import { DEFAULT_NODE_WIDTH, graphBounds, nodeHeight } from "@tensquads/ui/react/workflow/geometry";
import type { WorkflowNode } from "@tensquads/ui/schemas";

export function fitSteps(
	nodes: WorkflowNode[],
	sizes: Record<string, NodeSize>,
	area: { x: number; y: number; width: number; height: number },
	maxZoom: number,
): CanvasViewport | undefined {
	const bounds = graphBounds(
		nodes.map((node) => ({
			...node.position,
			width: sizes[node.id]?.width ?? DEFAULT_NODE_WIDTH,
			height: sizes[node.id]?.height ?? nodeHeight(node),
		})),
	);
	if (!bounds) return;
	const zoom = Math.max(0.5, Math.min(maxZoom, area.width / bounds.width, area.height / bounds.height));
	return {
		x: area.x + (area.width - bounds.width * zoom) / 2 - bounds.x * zoom,
		y: area.y + (area.height - bounds.height * zoom) / 2 - bounds.y * zoom,
		zoom,
	};
}
