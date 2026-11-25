"use client";

import { bindDrag, definePrimitive, dragThreshold, isRTL } from "@ui-sdk/core";
import { createParts } from "@ui-sdk/react/primitive";
import { useContext } from "react";
import { WORKFLOW_KIND_FAMILY } from "../../schemas/workflow.js";
import { CanvasContext, type CanvasPan } from "../workflow/canvas-context.js";
import { DEFAULT_NODE_WIDTH, graphBounds, type NodeSize, nodeHeight } from "../workflow/geometry.js";
import type { CanvasViewport } from "../workflow/viewport.js";

const WIDTH = 180;
const HEIGHT = 110;
const PADDING = 8;
const arrowDelta = {
	ArrowLeft: [-1, 0],
	ArrowRight: [1, 0],
	ArrowUp: [0, -1],
	ArrowDown: [0, 1],
} as const;

type MapOptions = {
	viewport: CanvasViewport;
	size: NodeSize;
	scale: number;
	origin: { x: number; y: number };
	pan: CanvasPan;
};

const miniMap = definePrimitive({
	name: "workflow-minimap",
	options: { viewport: "value", size: "value", scale: "number", origin: "value", pan: "callback" },
	state: (_options: MapOptions) => ({}),
	api: (context) => {
		let stopDrag: (() => void) | undefined;
		context.onDestroy(() => stopDrag?.());
		return {
			options: context.options,
			drag: (...args: Parameters<typeof bindDrag>) => {
				stopDrag?.();
				stopDrag = bindDrag(...args);
			},
		};
	},
	slots: (slot) => ({
		root: slot<{ label: string }>({
			props: { label: "string" },
			role: "region",
			attrs: (_state, { props }) => ({
				"aria-label": props.label,
				"aria-keyshortcuts": "ArrowLeft ArrowRight ArrowUp ArrowDown",
				tabindex: "0",
			}),
			on: {
				keydown: (event, { el, api }) => {
					if (!el || !Object.hasOwn(arrowDelta, event.key) || event.altKey || event.ctrlKey || event.metaKey)
						return;
					const [dx, dy] = arrowDelta[event.key as keyof typeof arrowDelta];
					const { viewport, size, pan } = api.options();
					event.preventDefault();
					pan(
						{
							...viewport,
							x: viewport.x - dx * size.width * (isRTL(el) ? -0.1 : 0.1),
							y: viewport.y - dy * size.height * 0.1,
						},
						"imperative",
						event,
					);
				},
				pointerdown: (event, { el, api }) => {
					if (!el || event.button !== 0 || event.isPrimary === false) return;
					if (!(event.target instanceof Element) || !event.target.hasAttribute("data-viewport-mask")) return;
					const { viewport, scale, pan } = api.options();
					const box = el.getBoundingClientRect();
					if (!box.width || !box.height) return;
					const startX = event.clientX;
					const startY = event.clientY;
					const dx = ((WIDTH * viewport.zoom) / (box.width * scale)) * (isRTL(el) ? -1 : 1);
					const dy = (HEIGHT * viewport.zoom) / (box.height * scale);
					api.drag(el, event, {
						threshold: dragThreshold,
						cancelOnEscape: true,
						onEnd: (event, canceled) => {
							if (canceled) pan(viewport, "drag", event);
						},
						onMove: ({ x, y, event }) => {
							pan(
								{ ...viewport, x: viewport.x - (x - startX) * dx, y: viewport.y - (y - startY) * dy },
								"drag",
								event,
							);
						},
					});
				},
				click: (event, { el, api }) => {
					if (!el || event.detail === 0) return;
					const box = el.getBoundingClientRect();
					if (!box.width || !box.height) return;
					const { viewport, size, origin, scale, pan } = api.options();
					const inline = (isRTL(el) ? box.right - event.clientX : event.clientX - box.left) / box.width;
					const x = origin.x + (inline * WIDTH) / scale;
					const y = origin.y + ((event.clientY - box.top) * HEIGHT) / (box.height * scale);
					pan(
						{ ...viewport, x: size.width / 2 - x * viewport.zoom, y: size.height / 2 - y * viewport.zoom },
						"imperative",
						event,
					);
				},
			},
		}),
	}),
});

const { Root } = createParts(miniMap, { root: "div" });

export type MiniMapProps = {
	placement?: "end" | "start";
};

export function MiniMap({ placement = "end" }: MiniMapProps) {
	const canvas = useContext(CanvasContext);
	if (!canvas) return null;
	const { graph, viewport, nodeSizes, size, locale, pan } = canvas;
	if (!size.width || !size.height) return null;
	const nodes = graph.nodes.map((node) => ({
		id: node.id,
		family: WORKFLOW_KIND_FAMILY[node.kind],
		...node.position,
		width: nodeSizes[node.id]?.width ?? DEFAULT_NODE_WIDTH,
		height: nodeSizes[node.id]?.height ?? nodeHeight(node),
	}));
	const bounds = graphBounds(nodes);
	const visibleWidth = size.width / viewport.zoom;
	const visibleHeight = size.height / viewport.zoom;
	if (!bounds || (bounds.width <= visibleWidth && bounds.height <= visibleHeight)) return null;

	const scale = Math.min((WIDTH - 2 * PADDING) / bounds.width, (HEIGHT - 2 * PADDING) / bounds.height);
	const origin = {
		x: bounds.x + (bounds.width - WIDTH / scale) / 2,
		y: bounds.y + (bounds.height - HEIGHT / scale) / 2,
	};

	return (
		<Root
			label={locale === "ar" ? "خريطة مصغّرة" : "Minimap"}
			className="ts-minimap"
			data-placement={placement}
			viewport={viewport}
			size={size}
			scale={scale}
			origin={origin}
			pan={pan}
		>
			<svg
				aria-hidden="true"
				className="ts-minimap__map"
				viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
				preserveAspectRatio="none"
			>
				{nodes.map((node) => (
					<rect
						key={node.id}
						className="ts-workflow-graph-node ts-minimap__node"
						data-family={node.family}
						x={(node.x - origin.x) * scale}
						y={(node.y - origin.y) * scale}
						width={node.width * scale}
						height={node.height * scale}
					/>
				))}
				<rect
					data-viewport-mask=""
					className="ts-minimap__viewport"
					x={(-viewport.x / viewport.zoom - origin.x) * scale}
					y={(-viewport.y / viewport.zoom - origin.y) * scale}
					width={visibleWidth * scale}
					height={visibleHeight * scale}
				/>
			</svg>
		</Root>
	);
}
