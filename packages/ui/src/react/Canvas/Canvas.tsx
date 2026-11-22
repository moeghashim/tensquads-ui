import { type ChangeDetails, createChange, createViewport, css, definePrimitive, live } from "@ui-sdk/core";
import { createParts, type PartProps } from "@ui-sdk/react/primitive";
import type { ReactNode, Ref } from "react";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import type { WorkflowGraph } from "../../schemas/workflow.js";
import { Node } from "../Node/Node.js";
import { edgePath, portPosition } from "../workflow/geometry.js";
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

type CanvasState = { viewport: CanvasViewport; width: number; grid: boolean };
type CanvasOptions = {
	viewport?: CanvasViewport;
	defaultViewport?: CanvasViewport;
	onViewportChange?: CanvasProps["onViewportChange"];
	grid?: boolean;
	locale?: "en" | "ar";
	direction?: "ltr" | "rtl";
};

const canvas = definePrimitive({
	name: "workflow-canvas",
	options: {
		viewport: "value",
		defaultViewport: "value",
		onViewportChange: "callback",
		grid: "boolean",
		locale: "string",
		direction: "string",
	},
	controlled: ["viewport"],
	live: ["viewport", "width", "grid"],
	state: (options: CanvasOptions): CanvasState => ({
		viewport: options.viewport ?? options.defaultViewport ?? { x: 0, y: 0, zoom: 1 },
		width: 0,
		grid: options.grid ?? true,
	}),
	sync: (options: CanvasOptions) => ({
		...(options.viewport === undefined ? {} : { viewport: options.viewport }),
		...(options.grid === undefined ? {} : { grid: options.grid }),
	}),
	api: (context) => {
		const change = createChange(context);
		const viewport = createViewport(context, {
			key: "viewport",
			surface: () => context.element("root"),
			minZoom: () => 0.5,
			maxZoom: () => 2,
			message: (zoom) =>
				context.options().locale === "ar"
					? `التكبير ${Math.round(zoom * 100)}%`
					: `Zoom ${Math.round(zoom * 100)}%`,
			set: (value, details) => change("viewport", value, details),
		});
		return { viewport, direction: () => context.options().direction ?? "ltr" };
	},
	slots: (slot) => ({
		root: slot<{ label: string; mode: string }>({
			props: { label: "string", mode: "string" },
			attrs: (state, { props, api }) => ({
				role: "region",
				dir: api.direction(),
				"aria-label": props.label,
				tabindex: "0",
				"data-grid": state.grid ? "true" : "false",
			}),
			live: live((state) => ({
				"data-grid": state.grid ? "true" : "false",
				style: css({
					"background-position": `${state.viewport.x}px ${state.viewport.y}px`,
					"background-size": `${20 * state.viewport.zoom}px ${20 * state.viewport.zoom}px`,
				}),
			})),
			bind: (el, part) => {
				const observer = new ResizeObserver((entries) => {
					const width = entries[0]?.contentRect.width;
					if (width === undefined || width === part.store.get().width) return;
					const state = part.store.get();
					const rtl = part.api.direction() === "rtl";
					const logical = toLogical(state.viewport, state.width, rtl);
					part.store.set({ width, viewport: toPhysical(logical, width, rtl) });
				});
				observer.observe(el);
				const wheel = (event: WheelEvent) => {
					if (isIgnored(event.target, el)) return;
					part.api.viewport.wheel(event);
				};
				el.addEventListener("wheel", wheel, { passive: false });
				return () => {
					observer.disconnect();
					el.removeEventListener("wheel", wheel);
				};
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
		world: slot<{ dir: string }>({
			props: { dir: "string" },
			attrs: () => ({ "aria-hidden": "false" }),
			live: live((state, { props, api }) => {
				const rtl = props.dir === "rtl";
				const beforeMeasure = rtl && state.width === 0;
				const logical = toLogical(state.viewport, state.width, rtl);
				const physical = beforeMeasure ? { ...state.viewport, x: -logical.x } : state.viewport;
				return {
					style: `${api.viewport.style({ ...state, viewport: physical })};left:${beforeMeasure ? "100%" : "0"}`,
				};
			}),
		}),
	}),
});

const { Root, World } = createParts(canvas, { root: "div", world: "div" });

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
	const rootRef = useRef<HTMLDivElement>(null);
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
	const publicViewportChange: CanvasProps["onViewportChange"] = (value, details) => {
		onViewportChange?.(toLogical(value, rootRef.current?.clientWidth ?? 0, resolvedDir === "rtl"), details);
	};
	return (
		<Root
			{...props}
			ref={rootRef}
			label={label}
			viewport={
				viewport ? toPhysical(viewport, rootRef.current?.clientWidth ?? 0, resolvedDir === "rtl") : undefined
			}
			defaultViewport={toPhysical(
				defaultViewport ?? { x: 0, y: 0, zoom: 1 },
				rootRef.current?.clientWidth ?? 0,
				resolvedDir === "rtl",
			)}
			onViewportChange={publicViewportChange}
			grid={grid}
			locale={locale}
			direction={resolvedDir}
			mode={mode}
			className={["ts-canvas", props.className].filter(Boolean).join(" ")}
		>
			<World dir={resolvedDir} className="ts-canvas__world">
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
					<div
						key={node.id}
						data-node-id={node.id}
						ref={(element) => {
							if (element) nodeElements.current.set(node.id, element);
							else nodeElements.current.delete(node.id);
						}}
						className="ts-canvas__node"
						style={{ insetInlineStart: node.position.x, insetBlockStart: node.position.y }}
					>
						<Node kind={node.kind} title={node.title} meta={node.meta} branches={node.branches} />
					</div>
				))}
			</World>
			{children && <div data-canvas-overlay="">{children}</div>}
		</Root>
	);
}
