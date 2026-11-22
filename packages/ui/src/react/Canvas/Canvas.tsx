import {
	type ChangeDetails,
	type ConnectDraft,
	createChange,
	createConnect,
	createFocusRecovery,
	createMove,
	createRovingFocus,
	createSelection,
	createViewport,
	css,
	definePrimitive,
	direct,
	dispatch,
	live,
	type MoveDraft,
	type MovePoint,
	spatialMove,
} from "@ui-sdk/core";
import { createParts, type PartProps } from "@ui-sdk/react/primitive";
import type { ReactNode, Ref } from "react";
import { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { WorkflowGraph } from "../../schemas/workflow.js";
import { Node } from "../Node/Node.js";
import { canConnect } from "../workflow/connect.js";
import { edgePath, portPosition } from "../workflow/geometry.js";
import { connectionsLabel, hiddenKind, kindLabel } from "../workflow/labels.js";
import { DEFAULT_NODE_WIDTH, type NodeSize } from "../workflow/tidy.js";
import { type CanvasViewport, toLogical, toPhysical } from "../workflow/viewport.js";

export type { CanvasViewport } from "../workflow/viewport.js";
export type CanvasSelection = { nodes: string[]; edges: string[] };
export type CanvasConnection = { from: string; fromPort?: number; to: string };
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
	onConnect?: (connection: CanvasConnection, details: ChangeDetails) => void;
	onDelete?: (selection: CanvasSelection, details: ChangeDetails) => void;
	grid?: boolean;
	mode?: "select" | "pan";
	locale?: "en" | "ar";
	dir?: "ltr" | "rtl";
	children?: ReactNode;
	ref?: Ref<CanvasHandle>;
};

type CanvasState = {
	viewport: CanvasViewport;
	selected: string[];
	focused: string | null;
	positions: Record<string, MovePoint>;
	moving: MoveDraft | null;
	connecting: ConnectDraft | null;
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
	graph?: WorkflowGraph;
	onConnect?: CanvasProps["onConnect"];
	onDelete?: CanvasProps["onDelete"];
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
		onConnect: "callback",
		onDelete: "callback",
		graph: "value",
	},
	controlled: ["viewport", "selected", "positions"],
	live: ["viewport", "moving", "connecting", "positions"],
	state: (options: CanvasOptions): CanvasState => ({
		viewport: options.viewport ?? options.defaultViewport ?? { x: 0, y: 0, zoom: 1 },
		selected: options.selected ?? [],
		positions: options.positions ?? {},
		moving: null,
		connecting: null,
		focused: null,
	}),
	sync: (options: CanvasOptions) => ({
		...(options.viewport === undefined ? {} : { viewport: options.viewport }),
		...(options.selected === undefined ? {} : { selected: options.selected }),
		...(options.positions === undefined ? {} : { positions: options.positions }),
	}),
	api: (context) => {
		const change = createChange(context);
		let fromPort: number | undefined;
		let fromWidth = DEFAULT_NODE_WIDTH;
		let pointerPoint = { x: 0, y: 0 };
		const nodeOf = (id: string) => context.options().graph?.nodes.find((node) => node.id === id);
		// createConnect snaps to a target's center. Here a drop anywhere on a node connects, so each draft gets the node
		// under the pointer before it is stored.
		const targetUnderPointer = (from: string) => {
			const graph = context.options().graph;
			if (!graph) return null;
			const contains = (element: Element | null | undefined) => {
				const box = element?.getBoundingClientRect();
				const { x, y } = pointerPoint;
				return !!box && x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
			};
			const node = [...graph.nodes].reverse().find(({ id }) => {
				const element = context.element("node", id);
				return contains(element) || contains(element?.querySelector('[data-port="in"]'));
			});
			return node && canConnect(graph, from, fromPort, node.id) ? node.id : null;
		};
		const connectStore = {
			...context.store,
			set: (patch: Partial<CanvasState>, delivered?: boolean) => {
				const draft = patch.connecting;
				context.store.set(
					draft ? { ...patch, connecting: { ...draft, to: targetUnderPointer(draft.from) } } : patch,
					delivered,
				);
			},
		};
		const connecting = createConnect(
			{ store: connectStore, onDestroy: context.onDestroy, parts: context.parts },
			{
				slot: "node",
				draft: "connecting",
				canConnect: (from, to) => {
					const graph = context.options().graph;
					return !!graph && canConnect(graph, from, fromPort, to);
				},
				point: (x, y) => {
					pointerPoint = { x, y };
					const point = viewport.toCanvas(x, y);
					return { ...point, x: rtl() ? -point.x + 0 : point.x };
				},
				radius: () => 0,
				label: (id) => context.options().titles?.[id] ?? id,
				message: (message, label) =>
					message.type === "connect"
						? context.options().locale === "ar"
							? `تم ربط ${label(message.from)} بـ ${label(message.to)}.`
							: `Connected ${label(message.from)} to ${label(message.to)}.`
						: message.type === "start"
							? context.options().locale === "ar"
								? `جارٍ الربط من ${label(message.from)}.`
								: `Connecting from ${label(message.from)}.`
							: message.type === "target"
								? context.options().locale === "ar"
									? `إلى ${label(message.to)}.`
									: `To ${label(message.to)}.`
								: context.options().locale === "ar"
									? "تم الإلغاء."
									: "Canceled.",
				connect: (from, to, details) => {
					const value: CanvasConnection = { from, ...(fromPort === undefined ? {} : { fromPort }), to };
					// dispatch reports an action with standard UI SDK details; this callback has no state key.
					return !dispatch(context, "onConnect", value, details);
				},
			},
		);
		const selection = createSelection(context, {
			key: "selected",
			multiple: () => true,
			set: (value, details) => change("selected", value, details),
			order: () => [],
		});
		// Positions are logical; createMove moves them physically. In RTL the two mirror each other. `+ 0` drops -0.
		const mirror = (positions: Record<string, MovePoint>) =>
			rtl()
				? Object.fromEntries(Object.entries(positions).map(([id, { x, y }]) => [id, { x: -x + 0, y }]))
				: positions;
		const groupFor = (id: string) => {
			const { selected } = context.store.get();
			return selected.includes(`node:${id}`)
				? selected.filter((key) => key.startsWith("node:")).map((key) => key.slice(5))
				: [id];
		};
		const physicalStore = {
			...context.store,
			get: () => {
				const state = context.store.get();
				return { ...state, positions: mirror(state.positions) };
			},
		};
		const moving = createMove(
			{ store: physicalStore, onDestroy: context.onDestroy },
			{
				key: "positions",
				draft: "moving",
				set: (positions, details) => change("positions", mirror(positions), details),
				step: () => 1,
				scale: () => context.store.get().viewport.zoom,
				disabled: () => !context.options().movable || context.options().mode === "pan",
				group: groupFor,
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
		let pressHandled = false;
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
		// What an agent can call. Its arguments come from a model, so each one is checked. Every change goes through the
		// same callback as a person's, which can cancel it.
		const select = (nodes: string[], edges: string[] = []) => {
			const graph = context.options().graph;
			if (!graph || !Array.isArray(nodes) || !Array.isArray(edges)) return false;
			return change("selected", fromCanvasSelection(inGraph({ nodes, edges }, graph)), { reason: "imperative" });
		};
		const move = (id: string, x: number, y: number) => {
			if (!context.options().movable || !nodeOf(id) || !Number.isFinite(x) || !Number.isFinite(y)) return false;
			const position = { x: Math.round(x) + 0, y: Math.round(y) + 0 };
			return change("positions", { ...context.store.get().positions, [id]: position }, { reason: "imperative" });
		};
		const connect = (from: string, to: string, port?: number) => {
			const graph = context.options().graph;
			const branches = nodeOf(from)?.branches;
			const portFits = branches
				? port !== undefined && Number.isInteger(port) && port >= 0 && port < branches.length
				: port === undefined;
			if (!graph || !context.options().onConnect || !portFits || !canConnect(graph, from, port, to)) return false;
			const value: CanvasConnection = { from, ...(port === undefined ? {} : { fromPort: port }), to };
			return !dispatch(context, "onConnect", value, { reason: "imperative" });
		};
		const deleteSelection = (event: KeyboardEvent) => {
			const { graph, onDelete } = context.options();
			const { selected, moving: dragged, connecting: drawn } = context.store.get();
			if (!graph || !onDelete || !selected.length || dragged || drawn) return;
			if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
			event.preventDefault();
			dispatch(context, "onDelete", toCanvasSelection(selected, graph), { reason: "delete-key", event });
		};
		// A removed node that held focus passes it to the node that takes its place, or to the canvas.
		const recovery = createFocusRecovery<{ index: number }>({
			fallback: ({ props }) => {
				const items = roving.items();
				return (items[props.index] ?? items.at(-1))?.el ?? context.element("root");
			},
		});
		return {
			select,
			move,
			connect,
			deleteSelection,
			recovery,
			moving,
			connecting,
			connectable: () => !!context.options().onConnect,
			connectionPath: (draft: ConnectDraft | null) => {
				const from = draft && nodeOf(draft.from);
				if (!from) return undefined;
				const to = draft.to === null ? undefined : nodeOf(draft.to);
				const start = portPosition(from, { out: fromPort ?? 0 }, fromWidth);
				const end = to ? portPosition(to, "in", DEFAULT_NODE_WIDTH) : draft;
				return edgePath(start.x, start.y, end.x, end.y);
			},
			moveEnabled: () => !!context.options().movable && context.options().mode !== "pan",
			isMoving: () => context.store.get().moving !== null,
			groupFor,
			viewport,
			roving,
			rtl,
			selection,
			isPan: () => context.options().mode === "pan",
			pointerDown: (value: { x: number; y: number } | null) => (pointerDown = value),
			nodePointerDown: (event: PointerEvent, key: string, el: HTMLElement) => {
				pressHandled = false;
				if (event.button !== 0) return;
				const output =
					event.target instanceof Element ? event.target.closest<HTMLElement>('[data-port="out"]') : null;
				if (output && context.options().onConnect && context.options().mode !== "pan") {
					// The click that ends this gesture selects nothing.
					pressHandled = true;
					fromPort = nodeOf(key)?.branches ? Number(output.dataset.portIndex ?? 0) : undefined;
					fromWidth = el.offsetWidth;
					connecting.pointerdown(event, key, el);
					return;
				}
				if (!context.store.get().selected.includes(`node:${key}`)) {
					pressHandled = true;
					selectItem(selection, `node:${key}`, event);
				}
				moving.pointerdown(event, key, el);
			},
			nodePress: (key: string, event?: Event) => {
				const down = pointerDown;
				const handled = pressHandled;
				pointerDown = null;
				pressHandled = false;
				if (context.options().mode === "pan") return;
				// A click from assistive technology has no press before it, so nothing has selected the node yet.
				if (event instanceof MouseEvent && event.detail > 0) {
					if (handled || (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 3)) return;
				}
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
				"data-connectable": api.connectable() ? "true" : undefined,
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
					const node =
						event.target instanceof Element ? event.target.closest<HTMLElement>("[data-node-id]") : null;
					if (ground || api.isPan()) api.viewport.pointerdown(event);
					else if (node?.dataset.nodeId) api.nodePointerDown(event, node.dataset.nodeId, node);
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
					if (event.key === "Delete" || event.key === "Backspace") {
						api.deleteSelection(event);
						return;
					}
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
		node: slot<{ value: string; index: number; description: string | undefined }>({
			props: { value: "string", index: "number", description: "string" },
			role: "option",
			direct: direct(["style", "data-dragging"]),
			live: live((state, { api, key }) => ({ "data-connect": api.connecting.role(state, key) })),
			focus: "roving",
			press: ({ api, key }, event) => api.nodePress(key, event),
			keys: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"],
			bind: (el, part) => {
				const leaveGroup = part.api.roving.bind(el, part);
				const stopRecovery = part.api.recovery.bind(el, part);
				return () => {
					stopRecovery();
					leaveGroup();
				};
			},
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
							event.preventDefault();
							api.moving.moveBy(api.groupFor(key), delta[0] ?? 0, delta[1] ?? 0, { reason: "move-key", event });
							// The host passes the new place back first, then a node that left the view comes back into it.
							requestAnimationFrame(() => {
								if (el.isConnected)
									api.viewport.reveal(api.viewport.rectOf(el), { padding: 24 }, { reason: "focus-in" });
							});
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
				"data-dragging": api.moving.dragging(state, key) ? "" : undefined,
				style: `inset-inline-start:${state.positions[key]?.x ?? 0}px;inset-block-start:${state.positions[key]?.y ?? 0}px;${api.moving.style(state, key) ?? ""}`,
			}),
		}),
		path: slot<{
			value: string;
			from: string;
			to: string;
			dx1: number;
			dy1: number;
			dx2: number;
			dy2: number;
		}>({
			props: {
				value: "string",
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
		connection: slot({
			direct: direct(["d", "data-active"]),
			attrs: (state, { api }) => ({
				"data-active": state.connecting ? "true" : undefined,
				d: api.connectionPath(state.connecting),
			}),
		}),
	}),
	agent: { actions: ["select", "move", "connect"] },
});

const {
	Root,
	World,
	Node: NodePart,
	Path,
	Connection,
} = createParts(canvas, { root: "div", world: "div", node: "div", path: "path", connection: "path" });

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

function inGraph({ nodes, edges }: CanvasSelection, graph: WorkflowGraph): CanvasSelection {
	const nodeIds = new Set(graph.nodes.map(({ id }) => id));
	const edgeIds = new Set(graph.edges.map(({ id }) => id));
	return { nodes: nodes.filter((id) => nodeIds.has(id)), edges: edges.filter((id) => edgeIds.has(id)) };
}

function toCanvasSelection(keys: string[], graph: WorkflowGraph): CanvasSelection {
	const selection: CanvasSelection = { nodes: [], edges: [] };
	for (const key of keys) {
		const separator = key.indexOf(":");
		if (separator < 0) continue;
		const type = key.slice(0, separator);
		const id = key.slice(separator + 1);
		if (type === "node") selection.nodes.push(id);
		if (type === "edge") selection.edges.push(id);
	}
	return inGraph(selection, graph);
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
	onConnect,
	onDelete,
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
	const selectedIds = useMemo(() => inGraph(activeSelection, graph), [activeSelection, graph]);
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
			graph={graph}
			onConnect={onConnect}
			onDelete={onDelete}
			movable={onNodeMove !== undefined}
			onPositionsChange={(next, details) => {
				for (const node of graph.nodes) {
					const position = next[node.id];
					if (!position || (position.x === node.position.x && position.y === node.position.y)) continue;
					onNodeMove?.(node.id, { x: position.x + 0, y: position.y + 0 }, details);
				}
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
						<Connection className="ts-canvas__connection" />
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
				{graph.nodes.map((node, index) => {
					const kind = hiddenKind(node, locale);
					return (
						<NodePart
							key={node.id}
							value={node.id}
							index={index}
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
