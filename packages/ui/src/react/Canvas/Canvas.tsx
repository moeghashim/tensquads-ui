import { type ChangeDetails, createChange, createViewport, css, definePrimitive, direct } from "@ui-sdk/core";
import { createParts, type PartProps } from "@ui-sdk/react/primitive";
import type { ReactNode, Ref } from "react";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import type { WorkflowGraph } from "../../schemas/workflow.js";
import { Node } from "../Node/Node.js";
import { edgePath, portPosition } from "../workflow/geometry.js";
import { connectionsLabel, nodeLabel } from "../workflow/labels.js";
import { DEFAULT_NODE_WIDTH, type NodeSize } from "../workflow/tidy.js";
import { type CanvasViewport, toLogical, toPhysical } from "../workflow/viewport.js";

export type { CanvasViewport } from "../workflow/viewport.js";
export type CanvasHandle = { getNodeSizes(): Record<string, NodeSize> };
export type CanvasProps = Omit<
	PartProps<"div">,
	"children" | "dir" | "defaultViewport" | "viewport" | "onViewportChange" | "ref"
> & {
	graph: WorkflowGraph;
	label: string;
	viewport?: CanvasViewport;
	defaultViewport?: CanvasViewport;
	onViewportChange?: (viewport: CanvasViewport, details: ChangeDetails) => void;
	grid?: boolean;
	mode?: "select" | "pan";
	locale?: "en" | "ar";
	dir?: "ltr" | "rtl";
	children?: ReactNode;
	ref?: Ref<CanvasHandle>;
};

type CanvasState = { viewport: CanvasViewport };
type CanvasOptions = {
	viewport?: CanvasViewport;
	defaultViewport?: CanvasViewport;
	onViewportChange?: CanvasProps["onViewportChange"];
	locale?: "en" | "ar";
	direction?: "ltr" | "rtl";
};

const canvas = definePrimitive({
	name: "workflow-canvas",
	options: {
		viewport: "value",
		defaultViewport: "value",
		onViewportChange: "callback",
		locale: "string",
		direction: "string",
	},
	controlled: ["viewport"],
	live: ["viewport"],
	state: (options: CanvasOptions): CanvasState => ({
		viewport: options.viewport ?? options.defaultViewport ?? { x: 0, y: 0, zoom: 1 },
	}),
	sync: (options: CanvasOptions) => (options.viewport === undefined ? {} : { viewport: options.viewport }),
	api: (context) => {
		const change = createChange(context);
		const rtl = () => context.options().direction === "rtl";
		const width = () => context.element("root")?.getBoundingClientRect().width ?? 0;
		// The state is logical in both directions. createViewport measures from the left, so it gets a physical view of it.
		const store = {
			...context.store,
			get: () => {
				const state = context.store.get();
				return { ...state, viewport: toPhysical(state.viewport, width(), rtl()) };
			},
		};
		const viewport = createViewport(
			{ store, onDestroy: context.onDestroy },
			{
				key: "viewport",
				surface: () => context.element("root"),
				minZoom: () => 0.5,
				maxZoom: () => 2,
				message: (zoom) =>
					context.options().locale === "ar"
						? `التكبير ${Math.round(zoom * 100)}%`
						: `Zoom ${Math.round(zoom * 100)}%`,
				set: (value, details) => change("viewport", toLogical(value, width(), rtl()), details),
			},
		);
		return { viewport, rtl };
	},
	slots: (slot) => ({
		root: slot<{ label: string; mode: string }>({
			props: { label: "string", mode: "string" },
			role: "region",
			// Panning writes the style to the element. It renders nothing, and the server markup has it too.
			direct: direct(["style"]),
			attrs: (state, { props, api }) => ({
				dir: api.rtl() ? "rtl" : "ltr",
				"aria-label": props.label,
				tabindex: "0",
				style: css({
					"background-position": `${api.rtl() ? "right" : "left"} ${state.viewport.x}px top ${state.viewport.y}px`,
					"background-size": `${20 * state.viewport.zoom}px ${20 * state.viewport.zoom}px`,
				}),
			}),
			bind: (el, part) => {
				const wheel = (event: WheelEvent) => {
					if (isIgnored(event.target, el)) return;
					part.api.viewport.wheel(event);
				};
				el.addEventListener("wheel", wheel, { passive: false });
				return () => el.removeEventListener("wheel", wheel);
			},
			on: {
				pointerdown: (event, { el, api, props }) => {
					if (!el || isIgnored(event.target, el)) return;
					const ground =
						event.target === el ||
						(event.target instanceof Element &&
							event.target.matches('[data-slot="workflow-canvas-world"], [data-canvas-edge-layer]'));
					if (ground || props.mode === "pan") api.viewport.pointerdown(event);
				},
				keydown: (event, { api, el }) => {
					if (!el || isIgnored(event.target, el)) return;
					api.viewport.keydown(event);
				},
			},
		}),
		world: slot<{ label: string }>({
			props: { label: "string" },
			role: "listbox",
			keys: { none: "Added with selection and focus." },
			// In RTL the world starts at the right edge, so its place needs no measured width.
			direct: direct(["style"]),
			attrs: (state, { api, props }) => {
				const { x, y, zoom } = state.viewport;
				const rtl = api.rtl();
				return {
					"aria-label": props.label,
					"aria-multiselectable": "true",
					style: css({
						left: rtl ? "100%" : "0",
						transform: `translate(${rtl ? -x : x}px, ${y}px) scale(${zoom})`,
						"transform-origin": "0 0",
					}),
				};
			},
		}),
		node: slot<{ value: string; name: string; description: string | undefined }>({
			props: { value: "string", name: "string", description: "string" },
			role: "option",
			focus: { none: "Added with selection and focus." },
			press: { none: "Added with selection and focus." },
			attrs: (_state, { props }) => ({
				"aria-selected": "false",
				"aria-label": props.name,
				"aria-description": props.description,
			}),
		}),
	}),
});

const { Root, World, Node: NodePart } = createParts(canvas, { root: "div", world: "div", node: "div" });

function isIgnored(target: EventTarget | null, root: HTMLElement) {
	if (!(target instanceof Element)) return false;
	if (
		target.closest("[data-canvas-overlay], input, textarea, select, [contenteditable='true'], [data-editable='true']")
	)
		return true;
	return !root.contains(target);
}

export function Canvas({
	graph,
	label,
	viewport,
	defaultViewport,
	onViewportChange,
	grid = true,
	mode = "select",
	locale = "en",
	dir,
	children,
	ref,
	...props
}: CanvasProps) {
	const sizes = useRef<Record<string, NodeSize>>({});
	const nodeElements = useRef(new Map<string, HTMLElement>());
	const [, setSizeVersion] = useState(0);
	useImperativeHandle(
		ref,
		() => ({
			getNodeSizes: () => Object.fromEntries(Object.entries(sizes.current).map(([id, size]) => [id, { ...size }])),
		}),
		[],
	);
	useEffect(() => {
		const ids = new Map<Element, string>();
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const id = ids.get(entry.target);
				const box = entry.borderBoxSize;
				const size = Array.isArray(box) ? box[0] : box;
				if (id && size) sizes.current[id] = { width: size.inlineSize, height: size.blockSize };
			}
			setSizeVersion((version) => version + 1);
		});
		for (const [id, element] of nodeElements.current) {
			ids.set(element, id);
			observer.observe(element);
		}
		return () => observer.disconnect();
	}, [graph.nodes]);
	useEffect(() => {
		const valid = new Set(graph.nodes.map((node) => node.id));
		for (const id of sizes.current ? Object.keys(sizes.current) : []) if (!valid.has(id)) delete sizes.current[id];
		for (const id of nodeElements.current.keys()) if (!valid.has(id)) nodeElements.current.delete(id);
	}, [graph.nodes]);
	const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
	const resolvedDir = dir ?? (locale === "ar" ? "rtl" : "ltr");
	return (
		<Root
			{...props}
			label={label}
			viewport={viewport}
			defaultViewport={defaultViewport}
			onViewportChange={onViewportChange}
			data-grid={grid ? "true" : "false"}
			locale={locale}
			direction={resolvedDir}
			mode={mode}
			className={["ts-canvas", props.className].filter(Boolean).join(" ")}
		>
			<World label={label} className="ts-canvas__world">
				<svg data-canvas-edge-layer="" aria-hidden="true" className="ts-canvas__edges">
					<g transform={resolvedDir === "rtl" ? "scale(-1 1)" : undefined}>
						{graph.edges.map((edge) => {
							const from = nodeById.get(edge.from);
							const to = nodeById.get(edge.to);
							const start =
								from &&
								portPosition(
									from,
									{ out: edge.fromPort ?? 0 },
									sizes.current[from.id]?.width ?? DEFAULT_NODE_WIDTH,
								);
							const end = to && portPosition(to, "in", sizes.current[to.id]?.width ?? DEFAULT_NODE_WIDTH);
							return start && end ? (
								<g
									key={edge.id}
									data-edge-from={edge.from}
									data-edge-to={edge.to}
									data-edge-from-port={edge.fromPort ?? 0}
								>
									<path d={edgePath(start.x, start.y, end.x, end.y)} className="ts-canvas__edge" />
									<path d={edgePath(start.x, start.y, end.x, end.y)} className="ts-canvas__edge-hit" />
								</g>
							) : null;
						})}
					</g>
				</svg>
				{graph.nodes.map((node) => (
					<NodePart
						key={node.id}
						value={node.id}
						name={nodeLabel(node, locale)}
						description={connectionsLabel(node, graph, locale)}
						data-node-id={node.id}
						ref={(element) => {
							if (element) nodeElements.current.set(node.id, element);
							else nodeElements.current.delete(node.id);
						}}
						className="ts-canvas__node"
						style={{ insetInlineStart: node.position.x, insetBlockStart: node.position.y }}
					>
						<Node kind={node.kind} title={node.title} meta={node.meta} branches={node.branches} />
					</NodePart>
				))}
			</World>
			{children && (
				<div data-canvas-overlay="" className="ts-canvas__overlay">
					{children}
				</div>
			)}
		</Root>
	);
}
