import {
	type ChangeDetails,
	createChange,
	createMove,
	createRovingFocus,
	createSelection,
	createViewport,
	css,
	definePrimitive,
	direct,
	spatialMove,
} from "@ui-sdk/core";
import { createParts, type PartProps } from "@ui-sdk/react/primitive";
import type { ReactNode, Ref } from "react";
import { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { WorkflowGraph } from "../../schemas/workflow.js";
import { Node } from "../Node/Node.js";
import { edgePath, portPosition } from "../workflow/geometry.js";
import { connectionsLabel, hiddenKind, kindLabel } from "../workflow/labels.js";
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
	onNodeMove?: (id: string, position: { x: number; y: number }, details: ChangeDetails) => void;
	grid?: boolean;
	mode?: "select" | "pan";
	locale?: "en" | "ar";
	dir?: "ltr" | "rtl";
	children?: ReactNode;
	ref?: Ref<CanvasHandle>;
};

type MovePoint = { x: number; y: number };
type MoveDraft = { keys: string[]; dx: number; dy: number } | null;
type CanvasState = {
	viewport: CanvasViewport;
	selected: string[];
	focused: string | null;
	positions: Record<string, MovePoint>;
	moving: MoveDraft;
};
type CanvasOptions = {
	viewport?: CanvasViewport;
	defaultViewport?: CanvasViewport;
	onViewportChange?: CanvasProps["onViewportChange"];
	selected?: string[];
	onSelectedChange?: (selection: string[], details: ChangeDetails) => void;
	positions?: Record<string, MovePoint>;
	onPositionsChange?: (positions: Record<string, MovePoint>, details: ChangeDetails) => void;
	titles?: Record<string, string>;
	movable?: boolean;
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
		positions: "value",
		onPositionsChange: "callback",
		titles: "value",
		movable: "boolean",
		mode: "string",
		locale: "string",
		direction: "string",
	},
	controlled: ["viewport", "selected", "positions"],
	live: ["viewport", "moving", "positions"],
	state: (options: CanvasOptions): CanvasState => ({
		viewport: options.viewport ?? options.defaultViewport ?? { x: 0, y: 0, zoom: 1 },
		selected: options.selected ?? [],
		positions: options.positions ?? {},
		moving: null,
		focused: null,
	}),
	sync: (options: CanvasOptions) => ({
		...(options.viewport === undefined ? {} : { viewport: options.viewport }),
		...(options.selected === undefined ? {} : { selected: options.selected }),
		...(options.positions === undefined ? {} : { positions: options.positions }),
	}),
	api: (context) => {
		const change = createChange(context);
		const selection = createSelection(context, {
			key: "selected",
			multiple: () => true,
			set: (value, details) => change("selected", value, details),
			order: () => [],
		});
		const physicalStore = {
			...context.store,
			get: () => {
				const state = context.store.get();
				return {
					...state,
					positions: Object.fromEntries(
						Object.entries(state.positions).map(([id, p]) => [id, { ...p, x: rtl() ? -p.x + 0 : p.x }]),
					),
				};
			},
		};
		const move = createMove(
			{ store: physicalStore, onDestroy: context.onDestroy },
			{
				key: "positions",
				draft: "moving",
				set: (positions, details) => {
					const logical = Object.fromEntries(
						Object.entries(positions).map(([id, p]) => [id, { ...p, x: rtl() ? -p.x + 0 : p.x }]),
					);
					return change("positions", logical, details);
				},
				step: () => 1,
				scale: () => context.store.get().viewport.zoom,
				disabled: () => !context.options().movable || context.options().mode === "pan",
				group: (id) =>
					context.store.get().selected.includes(`node:${id}`)
						? context.store
								.get()
								.selected.filter((key) => key.startsWith("node:"))
								.map((key) => key.slice(5))
						: [id],
				label: (id) => context.options().titles?.[id] ?? id,
				message: ({ keys, label, at }) => {
					if (keys.length > 1) {
						return context.options().locale === "ar"
							? `العقد المنقولة: ${keys.length}.`
							: `${keys.length} nodes moved.`;
					}
					const x = rtl() ? -at.x + 0 : at.x;
					return context.options().locale === "ar"
						? `موضع ${label} الآن ${x}، ${at.y}.`
						: `${label} moved to ${x}, ${at.y}.`;
				},
			},
		);
		const roving = createRovingFocus(context, {
			slot: "node",
			key: "focused",
			preferred: (item) => context.store.get().selected.includes(`node:${item.key}`),
			claims: (state, item) =>
				state.selected.some((key) => key.startsWith("node:")) ? state.selected.includes(`node:${item.key}`) : true,
			move: spatialMove(),
		});
		let pointerDown: { x: number; y: number } | null = null;
		let selectedOnPointerDown = false;
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
			move,
			moveEnabled: () => !!context.options().movable && context.options().mode !== "pan",
			isMoving: () => context.store.get().moving !== null,
			groupFor: (id: string) =>
				context.store.get().selected.includes(`node:${id}`)
					? context.store
							.get()
							.selected.filter((key) => key.startsWith("node:"))
							.map((key) => key.slice(5))
					: [id],
			viewport,
			roving,
			rtl,
			selection,
			isPan: () => context.options().mode === "pan",
			pointerDown: (value: { x: number; y: number } | null) => (pointerDown = value),
			nodePointerDown: (event: PointerEvent, key: string, el: HTMLElement) => {
				if (context.options().mode === "pan") {
					viewport.pointerdown(event);
					return;
				}
				const selected = context.store.get().selected.includes(`node:${key}`);
				selectedOnPointerDown = !selected;
				if (!selected) selectItem(selection, `node:${key}`, event);
				move.pointerdown(event, key, el);
			},
			nodePress: (key: string, event?: Event) => {
				const down = pointerDown;
				pointerDown = null;
				if (
					selectedOnPointerDown ||
					(down &&
						event &&
						Math.hypot((event as MouseEvent).clientX - down.x, (event as MouseEvent).clientY - down.y) > 3)
				) {
					selectedOnPointerDown = false;
					return;
				}
				if (!context.options().mode || context.options().mode !== "pan")
					selectItem(selection, `node:${key}`, event);
			},
			get pointerPosition() {
				return pointerDown;
			},
			clearSelection: (event: Event, reason = "clear-press") => {
				if (!context.store.get().selected.length) return false;
				change("selected", [], { reason, event });
				return true;
			},
			hasSelection: () => context.store.get().selected.length > 0,
			press: (key: string, event?: Event) => {
				if (context.options().mode !== "pan") selectItem(selection, key, event);
			},
			keyboardPress: (key: string, event: Event) => selectItem(selection, key, event),
		};
	},
	slots: (slot) => ({
		root: slot<{ label: string; nodeCount: number }>({
			props: { label: "string", nodeCount: "number" },
			role: "region",
			// Panning writes the style to the element. It renders nothing, and the server markup has it too.
			direct: direct(["style"]),
			attrs: (state, { props, api }) => ({
				dir: api.rtl() ? "rtl" : "ltr",
				"aria-label": props.label,
				tabindex: props.nodeCount === 0 ? "0" : "-1",
				"data-mode": api.isPan() ? "pan" : "select",
				"data-movable": api.moveEnabled() ? "true" : "false",
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
					if (event.target instanceof Element) {
						const node = event.target.closest<HTMLElement>("[data-node-id]");
						const key = node?.dataset.nodeId;
						if (node && key) {
							api.nodePointerDown(event, key, node);
							return;
						}
					}
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
					if (!el || event.defaultPrevented || isIgnored(event.target, el)) return;
					if (event.key === "Escape") {
						if (api.isMoving()) return;
						if (api.hasSelection()) {
							event.preventDefault();
							api.clearSelection(event, "escape-key");
						}
						return;
					}
					api.viewport.keydown(event);
				},
			},
		}),
		world: slot<{ label: string }>({
			props: { label: "string" },
			role: "listbox",
			keys: { none: "Each node handles these keys." },
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
			direct: direct(["style", "data-dragging"]),
			focus: "roving",
			press: ({ api, key }, event) => api.nodePress(key, event),
			keys: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"],
			bind: (el, part) => part.api.roving.bind(el, part),
			on: {
				keydown: (event, { el, api, key }) => {
					if (!el) return;
					if (
						event.shiftKey &&
						!event.altKey &&
						!event.ctrlKey &&
						!event.metaKey &&
						["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
					) {
						if (api.moveEnabled()) {
							const delta =
								event.key === "ArrowUp"
									? [0, -20]
									: event.key === "ArrowDown"
										? [0, 20]
										: event.key === "ArrowLeft"
											? [-20, 0]
											: [20, 0];
							api.move.moveBy(api.groupFor(key), delta[0] ?? 0, delta[1] ?? 0, { reason: "move-key", event });
							event.preventDefault();
						}
						return;
					}
					const moved = api.roving.keydown(event, el);
					if (moved) {
						event.preventDefault();
						return;
					}
					if ((event.key === "Enter" || event.key === " ") && !event.ctrlKey && !event.metaKey && !event.altKey) {
						event.preventDefault();
						if (!event.repeat) api.keyboardPress(`node:${key}`, event);
					}
				},
				focus: (event, { el, api }) => {
					if (el?.matches(":focus-visible"))
						api.viewport.reveal(api.viewport.rectOf(el), { padding: 24 }, { reason: "focus-in", event });
				},
				blur: (event, { el, store, api }) => {
					// While focus is inside, its node holds the stop. Once it leaves, Tab enters at the selected or first node again.
					const to = event.relatedTarget;
					const list = el?.closest('[data-slot="workflow-canvas-world"]');
					if (to instanceof Element && list?.contains(to)) return;
					store.set({ focused: null });
					api.roving.check();
				},
			},
			// The name is the card's own text, so it always holds what people see (WCAG 2.5.3).
			attrs: (state, { props, key, api }) => ({
				tabindex: api.roving.tabIndex(state, { key, props }),
				"aria-selected": String(state.selected.includes(`node:${key}`)),
				"aria-description": props.description,
				"data-dragging": api.move.dragging(state, key) ? "" : undefined,
				style: `inset-inline-start:${state.positions[key]?.x ?? 0}px;inset-block-start:${state.positions[key]?.y ?? 0}px;${api.move.style(state, key) ?? ""}`,
			}),
		}),
		path: slot<{
			value: string;
			d: string;
			from: string;
			to: string;
			dx1: number;
			dy1: number;
			dx2: number;
			dy2: number;
		}>({
			props: {
				value: "string",
				d: "string",
				from: "string",
				to: "string",
				dx1: "number",
				dy1: "number",
				dx2: "number",
				dy2: "number",
			},
			direct: direct(["d"]),
			attrs: (state, { props, api }) => {
				const draft = state.moving;
				const fromDragged = !!draft?.keys.includes(props.from);
				const toDragged = !!draft?.keys.includes(props.to);
				const x1 =
					(state.positions[props.from]?.x ?? 0) +
					props.dx1 +
					(fromDragged && draft ? (api.rtl() ? -draft.dx : draft.dx) : 0);
				const y1 = (state.positions[props.from]?.y ?? 0) + props.dy1 + (fromDragged && draft ? draft.dy : 0);
				const x2 =
					(state.positions[props.to]?.x ?? 0) +
					props.dx2 +
					(toDragged && draft ? (api.rtl() ? -draft.dx : draft.dx) : 0);
				const y2 = (state.positions[props.to]?.y ?? 0) + props.dy2 + (toDragged && draft ? draft.dy : 0);
				return { d: edgePath(x1, y1, x2, y2) };
			},
		}),
	}),
});

const {
	Root,
	World,
	Node: NodePart,
	Path,
} = createParts(canvas, { root: "div", world: "div", node: "div", path: "path" });

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
	if (event && "shiftKey" in event && event.shiftKey) selection.toggle(key, details);
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
	onNodeMove,
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
	const positions = useMemo(
		() =>
			Object.fromEntries(graph.nodes.map((node) => [node.id, { x: node.position.x + 0, y: node.position.y + 0 }])),
		[graph.nodes],
	);
	const titles = useMemo(
		() => Object.fromEntries(graph.nodes.map((node) => [node.id, node.title.trim() || kindLabel(node.kind, locale)])),
		[graph.nodes, locale],
	);
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
			nodeCount={graph.nodes.length}
			viewport={viewport}
			defaultViewport={defaultViewport}
			onViewportChange={onViewportChange}
			selected={selectedKeys}
			positions={positions}
			titles={titles}
			movable={onNodeMove !== undefined}
			onPositionsChange={(next, details) => {
				let changed = false;
				for (const node of graph.nodes) {
					const position = next[node.id];
					if (!position || (position.x === node.position.x && position.y === node.position.y)) continue;
					changed = true;
					onNodeMove?.(node.id, { x: position.x + 0, y: position.y + 0 }, details);
				}
				return changed;
			}}
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
									<Path
										value={`${edge.id}:visible`}
										d={edgePath(start.x, start.y, end.x, end.y)}
										from={from.id}
										to={to.id}
										dx1={start.x - from.position.x}
										dy1={start.y - from.position.y}
										dx2={end.x - to.position.x}
										dy2={end.y - to.position.y}
										className="ts-canvas__edge"
									/>
									<Path
										value={`${edge.id}:hit`}
										d={edgePath(start.x, start.y, end.x, end.y)}
										from={from.id}
										to={to.id}
										dx1={start.x - from.position.x}
										dy1={start.y - from.position.y}
										dx2={end.x - to.position.x}
										dy2={end.y - to.position.y}
										className="ts-canvas__edge-hit"
									/>
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
