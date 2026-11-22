import {
	type ChangeDetails,
	createChange,
	createSelection,
	createViewport,
	css,
	definePrimitive,
	direct,
} from "@ui-sdk/core";
import { createParts, type PartProps } from "@ui-sdk/react/primitive";
import type { ReactNode, Ref } from "react";
import { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { WorkflowGraph } from "../../schemas/workflow.js";
import { Node } from "../Node/Node.js";
import { edgePath, portPosition } from "../workflow/geometry.js";
import { connectionsLabel, hiddenKind } from "../workflow/labels.js";
import { DEFAULT_NODE_WIDTH, type NodeSize } from "../workflow/tidy.js";
import { type CanvasViewport, toLogical, toPhysical } from "../workflow/viewport.js";

export type { CanvasViewport } from "../workflow/viewport.js";
export type CanvasSelection = { nodes: string[]; edges: string[] };
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
	selection?: CanvasSelection;
	onSelectionChange?: (selection: CanvasSelection, details: ChangeDetails) => void;
	grid?: boolean;
	mode?: "select" | "pan";
	locale?: "en" | "ar";
	dir?: "ltr" | "rtl";
	children?: ReactNode;
	ref?: Ref<CanvasHandle>;
};

type CanvasState = { viewport: CanvasViewport; selected: string[] };
type CanvasOptions = {
	viewport?: CanvasViewport;
	defaultViewport?: CanvasViewport;
	onViewportChange?: CanvasProps["onViewportChange"];
	selected?: string[];
	onSelectedChange?: (selection: string[], details: ChangeDetails) => void;
	mode?: string;
	locale?: "en" | "ar";
	direction?: "ltr" | "rtl";
};

const canvas = definePrimitive({
	name: "workflow-canvas",
	options: {
		viewport: "value",
		defaultViewport: "value",
		onViewportChange: "callback",
		selected: "value",
		onSelectedChange: "callback",
		mode: "string",
		locale: "string",
		direction: "string",
	},
	controlled: ["viewport", "selected"],
	live: ["viewport"],
	state: (options: CanvasOptions): CanvasState => ({
		viewport: options.viewport ?? options.defaultViewport ?? { x: 0, y: 0, zoom: 1 },
		selected: options.selected ?? [],
	}),
	sync: (options: CanvasOptions) => ({
		...(options.viewport === undefined ? {} : { viewport: options.viewport }),
		...(options.selected === undefined ? {} : { selected: options.selected }),
	}),
	api: (context) => {
		const change = createChange(context);
		const selection = createSelection(context, {
			key: "selected",
			multiple: () => true,
			set: (value, details) => change("selected", value, details),
			order: () => [],
		});
		let pointerDown: { x: number; y: number } | null = null;
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
		return {
			viewport,
			rtl,
			selection,
			isPan: () => context.options().mode === "pan",
			pointerDown: (value: { x: number; y: number } | null) => (pointerDown = value),
			get pointerPosition() {
				return pointerDown;
			},
			clearSelection: (event: MouseEvent) => {
				if (context.store.get().selected.length) change("selected", [], { reason: "clear-press", event });
			},
			press: (key: string, event?: Event) => {
				if (context.options().mode !== "pan") selectItem(selection, key, event);
			},
		};
	},
	slots: (slot) => ({
		root: slot<{ label: string }>({
			props: { label: "string" },
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
				pointerdown: (event, { el, api }) => {
					if (!el || isIgnored(event.target, el)) return;
					api.pointerDown({ x: event.clientX, y: event.clientY });
					const ground =
						event.target === el ||
						(event.target instanceof Element &&
							event.target.matches('[data-slot="workflow-canvas-world"], [data-canvas-edge-layer]'));
					if (ground || api.isPan()) api.viewport.pointerdown(event);
				},
				click: (event, { el, api }) => {
					if (!el || isIgnored(event.target, el)) return;
					const down = api.pointerPosition;
					api.pointerDown(null);
					if (api.isPan()) return;
					const target = event.target;
					if (!(target instanceof Element)) return;
					if (target.closest('[data-slot="workflow-canvas-node"], [data-slot="workflow-node"]')) return;
					if (target.closest("[data-edge-id]")) {
						if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 3) return;
						const edgeId = target.closest<SVGGElement>("[data-edge-id]")?.dataset.edgeId;
						if (edgeId) api.press(`edge:${edgeId}`, event);
						return;
					}
					if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 3) return;
					if (event.shiftKey) return;
					api.clearSelection(event);
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
		node: slot<{ value: string; description: string | undefined }>({
			props: { value: "string", description: "string" },
			role: "option",
			focus: { none: "Added with selection and focus." },
			press: ({ api, key }, event) => api.press(`node:${key}`, event),
			// The name is the card's own text, so it always holds what people see (WCAG 2.5.3).
			attrs: (state, { props, key }) => ({
				"aria-selected": String(state.selected.includes(`node:${key}`)),
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

function selectItem(
	selection: {
		choose(key: string, details: { reason: "item-press"; event?: Event }): void;
		toggle(key: string, details: { reason: "item-press"; event?: Event }): void;
	},
	key: string,
	event?: Event,
) {
	const details = { reason: "item-press" as const, event };
	if (event instanceof MouseEvent && event.shiftKey) selection.toggle(key, details);
	else selection.choose(key, details);
}

function toCanvasSelection(keys: string[], graph: WorkflowGraph): CanvasSelection {
	const nodes = new Set(graph.nodes.map((node) => node.id));
	const edges = new Set(graph.edges.map((edge) => edge.id));
	const selection: CanvasSelection = { nodes: [], edges: [] };
	for (const key of keys) {
		const separator = key.indexOf(":");
		if (separator < 0) continue;
		const type = key.slice(0, separator);
		const id = key.slice(separator + 1);
		if (type === "node" && nodes.has(id)) selection.nodes.push(id);
		if (type === "edge" && edges.has(id)) selection.edges.push(id);
	}
	return selection;
}

function fromCanvasSelection(selection: CanvasSelection): string[] {
	return [...selection.nodes.map((id) => `node:${id}`), ...selection.edges.map((id) => `edge:${id}`)];
}

export function Canvas({
	graph,
	label,
	viewport,
	defaultViewport,
	onViewportChange,
	selection,
	onSelectionChange,
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
	const [internalSelection, setInternalSelection] = useState<CanvasSelection>({ nodes: [], edges: [] });
	const activeSelection = selection ?? internalSelection;
	const selectedIds = useMemo(
		() => toCanvasSelection(fromCanvasSelection(activeSelection), graph),
		[activeSelection, graph],
	);
	const selectedKeys = useMemo(() => fromCanvasSelection(selectedIds), [selectedIds]);
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
			selected={selectedKeys}
			mode={mode}
			onSelectedChange={(keys, details) => {
				const next = toCanvasSelection(keys, graph);
				onSelectionChange?.(next, details);
				if (selection === undefined && !details.canceled) setInternalSelection(next);
			}}
			data-grid={grid ? "true" : "false"}
			locale={locale}
			direction={resolvedDir}
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
									data-edge-id={edge.id}
									data-edge-to={edge.to}
									data-selected={selectedIds.edges.includes(edge.id) ? "true" : undefined}
									data-edge-from-port={edge.fromPort ?? 0}
								>
									<path d={edgePath(start.x, start.y, end.x, end.y)} className="ts-canvas__edge" />
									<path d={edgePath(start.x, start.y, end.x, end.y)} className="ts-canvas__edge-hit" />
								</g>
							) : null;
						})}
					</g>
				</svg>
				{graph.nodes.map((node) => {
					const kind = hiddenKind(node, locale);
					return (
						<NodePart
							key={node.id}
							value={node.id}
							description={connectionsLabel(node, graph, locale)}
							data-node-id={node.id}
							ref={(element) => {
								if (element) nodeElements.current.set(node.id, element);
								else nodeElements.current.delete(node.id);
							}}
							className="ts-canvas__node"
							style={{ insetInlineStart: node.position.x, insetBlockStart: node.position.y }}
						>
							{kind && <span className="ts-visually-hidden">{`${kind}: `}</span>}
							<Node
								kind={node.kind}
								title={node.title}
								meta={node.meta}
								branches={node.branches}
								selected={selectedIds.nodes.includes(node.id)}
							/>
						</NodePart>
					);
				})}
			</World>
			{children && (
				<div data-canvas-overlay="" className="ts-canvas__overlay">
					{children}
				</div>
			)}
		</Root>
	);
}
