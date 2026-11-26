import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Icon } from "@tensquads/ui/icons/Icon";
import {
	Badge,
	Button,
	Canvas,
	type CanvasConnection,
	type CanvasHandle,
	type CanvasSelection,
	type CanvasViewport,
	CommandPalette,
	type CommandPaletteGroup,
	DEFAULT_PALETTE_SECTIONS,
	MiniMap,
	Palette,
	type PaletteSection,
	squadmateCharacterName,
	Toolbar,
	type ToolbarItem,
	themePreference,
	tidyLayout,
} from "@tensquads/ui/react";
import { DEFAULT_NODE_WIDTH, nodeHeight } from "@tensquads/ui/react/workflow/geometry";
import { kindLabel } from "@tensquads/ui/react/workflow/labels";
import { WORKFLOW_KIND_ICON, type WorkflowNode, type WorkflowNodeKind } from "@tensquads/ui/schemas";
import { createLocalStorage } from "@ui-sdk/core";
import { useContext, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from "react";
import { type Direction, getPreviewState, type Locale } from "../../state";
import { SitePageCommands, siteSearchEvent } from "../site-page-commands";
import { BuilderTheme } from "../site-theme";
import { builderCopy } from "./copy";
import {
	type DemoWorkflow,
	demoWorkflow,
	type StepSettings,
	type WorkflowDocument,
	type WorkflowId,
} from "./demo-workflows";
import { BuilderGuide } from "./guide";
import { addConnection, initialHistory, updateHistory } from "./history";
import { StepInspector } from "./step-inspector";
import { fitSteps } from "./viewport";

type Position = WorkflowNode["position"];
const homeViewport = { x: 0, y: 0, zoom: 1 };
const emptySelection: CanvasSelection = { nodes: [], edges: [] };
const themeStorage = createLocalStorage("tensquads.theme");

function paletteSections(locale: Locale): PaletteSection[] {
	const defaults = DEFAULT_PALETTE_SECTIONS[locale];
	const items = defaults.flatMap((section) => section.items);
	return [
		...[...defaults]
			.sort(
				(a, b) =>
					["core", "logic", "tools", "data"].indexOf(a.id) - ["core", "logic", "tools", "data"].indexOf(b.id),
			)
			.map((section) => ({
				...section,
				items: section.items
					.filter(({ kind }) => kind !== "note" && kind !== "end")
					.sort((a, b) => Number(b.kind === "classify") - Number(a.kind === "classify")),
			})),
		{
			id: "other",
			label: builderCopy[locale].other,
			items: items.filter(({ kind }) => kind === "note" || kind === "end").reverse(),
		},
	];
}

export function BuilderRoute({ id }: { id: WorkflowId }) {
	const search = useRouterState({ select: (state) => state.location.search });
	const { locale, direction } = getPreviewState(search);
	const theme = useContext(BuilderTheme);
	const navigate = useNavigate();
	const workflow = useMemo(() => demoWorkflow(id, locale), [id, locale]);
	const setTheme = (next: "light" | "dark") => {
		// A URL override can differ from the stored default. Persist an explicit choice even when it equals that default.
		if (!themePreference.set(next)) themeStorage.set(next);
		void navigate({ to: ".", search: { ...search, theme: next }, replace: true });
	};
	return (
		<Builder
			key={`${id}-${locale}-${direction}`}
			workflow={workflow}
			locale={locale}
			dir={direction}
			theme={theme}
			onTheme={setTheme}
		/>
	);
}

function Builder({
	workflow,
	locale,
	dir,
	theme,
	onTheme,
}: {
	workflow: DemoWorkflow;
	locale: Locale;
	dir: Direction;
	theme: "light" | "dark";
	onTheme: (theme: "light" | "dark") => void;
}) {
	const copy = builderCopy[locale];
	const [history, dispatch] = useReducer(updateHistory, workflow.document, initialHistory);
	const { graph, settings } = history.present;
	const [viewport, setViewport] = useState<CanvasViewport>(homeViewport);
	const [selection, setSelection] = useState<CanvasSelection>({ nodes: [workflow.initialSelection], edges: [] });
	const [mode, setMode] = useState<"pan" | "select">("select");
	const [guideOpen, setGuideOpen] = useState(true);
	const [commandOpen, setCommandOpen] = useState(false);
	const [sheet, setSheet] = useState<"palette" | "inspector" | null>(null);
	const [tidying, setTidying] = useState(false);
	const stage = useRef<HTMLDivElement>(null);
	const canvas = useRef<CanvasHandle>(null);
	const guideButton = useRef<HTMLButtonElement>(null);
	const palettePanel = useRef<HTMLDivElement>(null);
	const inspectorPanel = useRef<HTMLDivElement>(null);
	const mobileControls = useRef<HTMLDivElement>(null);
	const paletteButton = useRef<HTMLButtonElement>(null);
	const inspectorButton = useRef<HTMLButtonElement>(null);
	const restoreInspectorFocus = useRef(false);
	const commandFromNode = useRef(false);
	const commandDestination = useRef<WorkflowNode | null>(null);
	const guide = useRef<HTMLDivElement>(null);
	const fieldGroup = useRef<object | undefined>(undefined);
	const viewEdited = useRef(false);
	const sequence = useRef(0);
	const sitePages = useContext(SitePageCommands);

	useLayoutEffect(() => {
		if (!restoreInspectorFocus.current) return;
		restoreInspectorFocus.current = false;
		if (mobileControls.current?.getClientRects().length) {
			inspectorButton.current?.focus();
		} else {
			stage.current?.querySelector<HTMLElement>('[data-slot="workflow-canvas"]')?.focus();
		}
	});

	const active = graph.nodes.find((node) => node.id === selection.nodes[0]);
	const nameOf = (node: WorkflowNode) => node.title.trim() || kindLabel(node.kind, locale);
	const edit = (update: (document: WorkflowDocument) => WorkflowDocument, group?: object) => {
		viewEdited.current = true;
		dispatch({ type: "edit", update, group });
	};
	const moveViewport = (next: CanvasViewport) => {
		viewEdited.current = true;
		setViewport(next);
	};
	const resizeArea = () => {
		const width = stage.current?.clientWidth ?? 1;
		const height = stage.current?.clientHeight ?? 1;
		const compact = Boolean(mobileControls.current?.getClientRects().length);
		const gutter = 24;
		const start = compact ? gutter : (palettePanel.current?.offsetWidth ?? 0) + gutter;
		const end = compact ? gutter : (inspectorPanel.current?.offsetWidth ?? 0) + gutter;
		const top = (guide.current?.offsetHeight ?? 0) + gutter * (compact ? 3 : 1);
		const bottom = 88;
		return { x: start, y: top, width: Math.max(1, width - start - end), height: Math.max(1, height - top - bottom) };
	};
	const areaOnResize = useRef(resizeArea);
	areaOnResize.current = resizeArea;
	useEffect(() => {
		const element = stage.current;
		if (!element) return;
		const observer = new ResizeObserver(() => {
			if (viewEdited.current) return;
			if (element.clientWidth >= 1380 && element.clientHeight >= 620) {
				setViewport(homeViewport);
				return;
			}
			const next = fitSteps(
				workflow.document.graph.nodes,
				canvas.current?.getNodeSizes() ?? {},
				areaOnResize.current(),
				1,
			);
			if (next) setViewport(next);
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, [workflow.document.graph.nodes]);

	const placeInView = (nodes: WorkflowNode[], maxZoom: number) => {
		const next = fitSteps(nodes, canvas.current?.getNodeSizes() ?? {}, resizeArea(), maxZoom);
		if (next) moveViewport(next);
	};
	const openCommands = () => {
		commandFromNode.current = Boolean(document.activeElement?.closest("[data-node-id]"));
		commandDestination.current = null;
		setCommandOpen(true);
	};
	const revealCommand = (node: WorkflowNode) => {
		if (commandFromNode.current) commandDestination.current = node;
		else placeInView([node], viewport.zoom);
	};
	const insert = (kind: WorkflowNodeKind, drop?: Position) => {
		const id = `step-${++sequence.current}`;
		const sizes = canvas.current?.getNodeSizes() ?? {};
		const area = resizeArea();
		const center = {
			x: (area.x + area.width / 2 - viewport.x) / viewport.zoom,
			y: (area.y + area.height / 2 - viewport.y) / viewport.zoom,
		};
		const anchor = drop ?? center;
		const branches =
			kind === "classify"
				? locale === "ar"
					? ["مطابق", "أخرى"]
					: ["Match", "Other"]
				: kind === "if-else"
					? locale === "ar"
						? ["نعم", "وإلا"]
						: ["If", "Else"]
					: kind === "guardrails"
						? locale === "ar"
							? ["اجتياز", "إيقاف"]
							: ["Pass", "Block"]
						: undefined;
		const title = kindLabel(kind, locale);
		const node: WorkflowNode = {
			id,
			kind,
			title,
			meta: kind !== "note" && kind !== "end" ? title : undefined,
			position: anchor,
			branches,
		};
		node.position =
			!drop && active
				? {
						x: Math.ceil(active.position.x + (sizes[active.id]?.width ?? DEFAULT_NODE_WIDTH) + 40),
						y: active.position.y,
					}
				: { x: Math.round(anchor.x - DEFAULT_NODE_WIDTH / 2), y: Math.round(anchor.y - nodeHeight(node) / 2) };
		edit((doc) => ({ ...doc, graph: { ...doc.graph, nodes: [...doc.graph.nodes, node] } }));
		setSelection({ nodes: [id], edges: [] });
		if (!drop) {
			const end = viewport.x + (node.position.x + DEFAULT_NODE_WIDTH) * viewport.zoom;
			const start = viewport.x + node.position.x * viewport.zoom;
			const top = viewport.y + node.position.y * viewport.zoom;
			if (
				start < area.x ||
				end > area.x + area.width ||
				top < area.y ||
				top + nodeHeight(node) * viewport.zoom > area.y + area.height
			) {
				placeInView([node], viewport.zoom);
			}
		}
		return node;
	};
	const duplicate = () => {
		if (!active) return;
		const id = `step-${++sequence.current}`;
		const node = {
			...active,
			id,
			title: copy.copyName(nameOf(active)),
			position: { x: active.position.x + 40, y: active.position.y + 80 },
		};
		edit((doc) => {
			const original = doc.settings[active.id];
			return {
				graph: { ...doc.graph, nodes: [...doc.graph.nodes, node] },
				settings: original ? { ...doc.settings, [id]: original } : doc.settings,
			};
		});
		setSelection({ nodes: [id], edges: [] });
	};
	const remove = ({ nodes, edges }: CanvasSelection) => {
		if (active && nodes.includes(active.id) && inspectorPanel.current?.contains(document.activeElement)) {
			restoreInspectorFocus.current = true;
		}
		edit((doc) => {
			const keepNodes = doc.graph.nodes.filter((node) => !nodes.includes(node.id));
			const keepEdges = doc.graph.edges.filter(
				(edge) => !edges.includes(edge.id) && !nodes.includes(edge.from) && !nodes.includes(edge.to),
			);
			if (keepNodes.length === doc.graph.nodes.length && keepEdges.length === doc.graph.edges.length) return doc;
			return {
				graph: { nodes: keepNodes, edges: keepEdges },
				settings: Object.fromEntries(Object.entries(doc.settings).filter(([id]) => !nodes.includes(id))),
			};
		});
		setSelection(emptySelection);
	};
	const updateTitle = (id: string, title: string) => {
		fieldGroup.current ??= {};
		edit(
			(doc) => ({
				...doc,
				graph: { ...doc.graph, nodes: doc.graph.nodes.map((node) => (node.id === id ? { ...node, title } : node)) },
			}),
			fieldGroup.current,
		);
	};
	const updateSettings = (id: string, patch: Partial<StepSettings>) => {
		const { instructions, squadmate } = patch;
		if (instructions !== undefined) fieldGroup.current ??= {};
		edit(
			(doc) => ({
				settings: { ...doc.settings, [id]: { instructions: "", ...doc.settings[id], ...patch } },
				graph: squadmate
					? {
							...doc.graph,
							nodes: doc.graph.nodes.map((node) =>
								node.id === id
									? {
											...node,
											meta: `${kindLabel("agent", locale)} · ${squadmateCharacterName(squadmate, locale)}`,
										}
									: node,
							),
						}
					: doc.graph,
			}),
			patch.instructions !== undefined ? fieldGroup.current : undefined,
		);
	};
	const connect = (connection: CanvasConnection) => {
		edit((doc) => {
			const next = addConnection(doc.graph, connection);
			return next === doc.graph ? doc : { ...doc, graph: next };
		});
	};
	const updateConnections = (from: string, fromPort: number | undefined, targets: string[]) => {
		edit((doc) => {
			const kept = doc.graph.edges.filter(
				(edge) => edge.from !== from || edge.fromPort !== fromPort || targets.includes(edge.to),
			);
			const next = targets.reduce((graph, to) => addConnection(graph, { from, fromPort, to }), {
				...doc.graph,
				edges: kept,
			});
			return next.edges.length === doc.graph.edges.length &&
				next.edges.every((edge, index) => edge === doc.graph.edges[index])
				? doc
				: { ...doc, graph: next };
		});
	};
	const travel = (type: "undo" | "redo") => {
		fieldGroup.current = undefined;
		setTidying(false);
		dispatch({ type });
	};
	const tidy = () => {
		if (!graph.nodes.length) return;
		const positions = tidyLayout(graph, canvas.current?.getNodeSizes());
		const nodes = graph.nodes.map((node) => {
			const position = positions[node.id];
			return position && (position.x !== node.position.x || position.y !== node.position.y)
				? { ...node, position }
				: node;
		});
		setTidying(true);
		if (nodes.some((node, index) => node !== graph.nodes[index])) {
			edit((doc) => ({ ...doc, graph: { ...doc.graph, nodes } }));
		}
		placeInView(nodes, 1);
	};
	const toggleTheme = () => onTheme(theme === "light" ? "dark" : "light");
	const closeSheet = () => {
		if (!sheet) return;
		setSheet(null);
		(sheet === "palette" ? paletteButton : inspectorButton).current?.focus();
	};

	useEffect(() => {
		if (!tidying) return;
		const timeout = window.setTimeout(() => setTidying(false), 200);
		return () => window.clearTimeout(timeout);
	}, [tidying]);

	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if (
				event.defaultPrevented ||
				event.isComposing ||
				event.altKey ||
				(event.target instanceof Element &&
					event.target.closest(
						"input, textarea, select, [contenteditable]:not([contenteditable=false]), [role=combobox], [data-slot=select-content]",
					))
			)
				return;
			const key = event.key.toLowerCase();
			const mod = event.metaKey || event.ctrlKey;
			if (mod && key === "k") {
				event.preventDefault();
				openCommands();
				return;
			}
			if (commandOpen) return;
			let action: (() => void) | undefined;
			if (mod) {
				if (key === "z") action = () => travel(event.shiftKey ? "redo" : "undo");
				if (key === "d" && !event.shiftKey && active) action = duplicate;
				if (key === "l" && event.shiftKey) action = tidy;
				if (key === "t" && event.shiftKey) action = toggleTheme;
			} else if (!event.shiftKey) {
				if (key === "v") action = () => setMode("pan");
				if (key === "s") action = () => setMode("select");
				if ((key === "delete" || key === "backspace") && (active || selection.edges.length))
					action = () => remove(selection);
				if (key === "escape" && sheet) action = closeSheet;
			}
			if (action) {
				event.preventDefault();
				action();
			}
		};
		window.addEventListener("keydown", onKey);
		window.addEventListener(siteSearchEvent, openCommands);
		return () => {
			window.removeEventListener("keydown", onKey);
			window.removeEventListener(siteSearchEvent, openCommands);
		};
	});

	const sections = paletteSections(locale);
	const nodeIcon = (kind: WorkflowNodeKind) => (
		<span className="builder-kind-icon" data-kind={kind}>
			<Icon name={WORKFLOW_KIND_ICON[kind]} size={14} />
		</span>
	);
	const commands: CommandPaletteGroup[] = [
		{
			id: "add",
			label: copy.add,
			items: sections.flatMap(({ items }) =>
				items.map(({ kind, label }) => ({
					id: `add-${kind}`,
					label,
					icon: nodeIcon(kind),
					onSelect: () => revealCommand(insert(kind)),
				})),
			),
		},
		{
			id: "jump",
			label: copy.jump,
			items: graph.nodes.map((node) => ({
				id: `jump-${node.id}`,
				label: nameOf(node),
				icon: nodeIcon(node.kind),
				onSelect: () => {
					setSelection({ nodes: [node.id], edges: [] });
					revealCommand(node);
				},
			})),
		},
		{
			id: "actions",
			label: copy.actions,
			items: [
				{ id: "undo", label: copy.undo, icon: <Icon name="undo" />, hint: ["⌘Z"], onSelect: () => travel("undo") },
				{ id: "redo", label: copy.redo, icon: <Icon name="redo" />, hint: ["⌘⇧Z"], onSelect: () => travel("redo") },
				{ id: "tidy", label: copy.tidy, icon: <Icon name="layout" />, hint: ["⌘⇧L"], onSelect: tidy },
				{
					id: "theme",
					label: copy.toggleTheme,
					icon: <Icon name={theme === "light" ? "moon" : "sun"} />,
					hint: ["⌘⇧T"],
					onSelect: toggleTheme,
				},
			],
		},
		...(sitePages ? [sitePages] : []),
	];
	const tools: ToolbarItem[] = [
		{
			id: "pan",
			type: "toggle",
			label: `${copy.pan} (V)`,
			icon: <Icon name="hand" />,
			pressed: mode === "pan",
			onPressedChange: () => setMode("pan"),
		},
		{
			id: "select",
			type: "toggle",
			label: `${copy.select} (S)`,
			icon: <Icon name="cursor" />,
			pressed: mode === "select",
			onPressedChange: () => setMode("select"),
		},
		{ id: "history", type: "separator" },
		{
			id: "undo",
			type: "button",
			label: `${copy.undo} (⌘Z)`,
			icon: <Icon name="undo" />,
			disabled: !history.past.length,
			onClick: () => travel("undo"),
		},
		{
			id: "redo",
			type: "button",
			label: `${copy.redo} (⌘⇧Z)`,
			icon: <Icon name="redo" />,
			disabled: !history.future.length,
			onClick: () => travel("redo"),
		},
	];

	return (
		<main
			id="main"
			className="builder"
			onFocus={(event) => {
				const node = commandDestination.current;
				if (!node || !(event.target instanceof Element) || !event.target.closest("[data-node-id]")) return;
				commandDestination.current = null;
				// Let the dialog finish restoring focus before moving it to the command destination.
				queueMicrotask(() => {
					stage.current?.querySelector<HTMLElement>(`[data-node-id="${CSS.escape(node.id)}"]`)?.focus();
					placeInView([node], viewport.zoom);
				});
			}}
		>
			<header className="design-wrap builder-header">
				<div className="builder-crumb">
					<Link to="/workflows" search={(prev) => prev}>
						{copy.workflows}
					</Link>
					<span aria-hidden="true">/</span>
					<h1>{workflow.name}</h1>
					<Badge
						className="builder-status"
						tone={workflow.status === "live" ? "success" : "default"}
						data-status={workflow.status}
					>
						{copy[workflow.status]}
					</Badge>
				</div>
				<div className="builder-header__actions">
					<Button
						ref={guideButton}
						size="sm"
						variant={guideOpen ? "solid" : "soft"}
						aria-pressed={guideOpen}
						onClick={() => setGuideOpen(!guideOpen)}
					>
						{copy.guide}
					</Button>
					<Button size="sm" variant="soft" onClick={openCommands}>
						{copy.search} <kbd>⌘K</kbd>
					</Button>
					<Button size="sm" variant="soft" onClick={tidy}>
						{copy.tidy} <kbd>⌘⇧L</kbd>
					</Button>
				</div>
			</header>
			<div className="builder-stage" ref={stage} data-tidying={tidying || undefined}>
				<Canvas
					ref={canvas}
					graph={graph}
					label={copy.canvas}
					viewport={viewport}
					onViewportChange={moveViewport}
					selection={selection}
					onSelectionChange={setSelection}
					mode={mode}
					locale={locale}
					dir={dir}
					onNodeMove={(id, position, details) =>
						edit(
							(doc) => ({
								...doc,
								graph: {
									...doc.graph,
									nodes: doc.graph.nodes.map((node) => (node.id === id ? { ...node, position } : node)),
								},
							}),
							details.event ?? undefined,
						)
					}
					onConnect={connect}
					onDelete={remove}
				>
					<MiniMap placement="start" />
					<Toolbar label={copy.toolbar} className="builder-toolbar" items={tools} />
				</Canvas>
				<div className="builder-mobile-switches" ref={mobileControls}>
					<Button
						size="sm"
						variant="soft"
						aria-expanded={sheet === "palette"}
						ref={paletteButton}
						aria-controls="builder-palette"
						onClick={() => setSheet(sheet === "palette" ? null : "palette")}
					>
						{copy.palette}
					</Button>
					<Button
						size="sm"
						variant="soft"
						aria-expanded={sheet === "inspector"}
						ref={inspectorButton}
						aria-controls="builder-inspector"
						onClick={() => setSheet(sheet === "inspector" ? null : "inspector")}
					>
						{copy.inspector}
					</Button>
				</div>
				<div
					className="builder-palette"
					id="builder-palette"
					data-sheet-open={sheet === "palette"}
					ref={palettePanel}
				>
					<Button className="builder-palette-search" size="sm" variant="soft" onClick={openCommands}>
						{copy.palette}
						<kbd>⌘K</kbd>
					</Button>
					<Palette
						canvas={canvas}
						sections={sections}
						label={copy.palette}
						onInsert={(kind, details) => {
							insert(kind, details.position);
							closeSheet();
						}}
					/>
				</div>
				{guideOpen && (
					<div className="builder-guide-position" ref={guide}>
						<BuilderGuide
							locale={locale}
							onHide={() => {
								setGuideOpen(false);
								guideButton.current?.focus();
							}}
						/>
					</div>
				)}
				<div
					className="builder-inspector"
					id="builder-inspector"
					data-sheet-open={sheet === "inspector"}
					ref={inspectorPanel}
					onBlurCapture={() => {
						fieldGroup.current = undefined;
					}}
				>
					<StepInspector
						node={active}
						graph={graph}
						settings={active && settings[active.id]}
						locale={locale}
						nameOf={nameOf}
						onTitle={(title) => {
							if (active) updateTitle(active.id, title);
						}}
						onSettings={(patch) => {
							if (active) updateSettings(active.id, patch);
						}}
						onConnections={(port, targets) => {
							if (active) updateConnections(active.id, port, targets);
						}}
						onDuplicate={duplicate}
						onDelete={() => {
							if (active) remove({ nodes: [active.id], edges: [] });
						}}
					/>
				</div>
			</div>
			<CommandPalette
				open={commandOpen}
				onOpenChange={setCommandOpen}
				groups={commands}
				labels={copy.find}
				locale={locale}
			/>
		</main>
	);
}
