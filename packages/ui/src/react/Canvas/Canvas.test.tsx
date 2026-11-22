import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { Profiler } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { WorkflowGraph } from "../../schemas/workflow.js";
import { Canvas, type CanvasHandle } from "./Canvas.js";

const graph: WorkflowGraph = {
	nodes: [
		{ id: "start", kind: "start", title: "Start", position: { x: 20, y: 30 } },
		{ id: "end", kind: "end", title: "End", position: { x: 240, y: 30 } },
	],
	edges: [{ id: "edge", from: "start", to: "end" }],
};

afterEach(cleanup);
afterEach(() => vi.unstubAllGlobals());

let observers: Array<{ callback: ResizeObserverCallback; targets: Element[] }>;
beforeEach(() => {
	observers = [];
	vi.stubGlobal(
		"ResizeObserver",
		class {
			callback: ResizeObserverCallback;
			targets: Element[] = [];
			constructor(callback: ResizeObserverCallback) {
				this.callback = callback;
				observers.push(this);
			}
			observe(target: Element) {
				this.targets.push(target);
			}
			disconnect() {}
			unobserve() {}
		},
	);
});

describe("Canvas", () => {
	it("gives the first selected node the single server tab stop", () => {
		for (const selection of [undefined, { nodes: ["end"], edges: [] }]) {
			const markup = renderToStaticMarkup(<Canvas graph={graph} label="Workflow" selection={selection} />);
			expect(markup.match(/tabindex="0"/g)).toHaveLength(1);
			expect(markup).toContain(`data-node-id="${selection?.nodes[0] ?? "start"}"`);
		}
	});

	it("chooses and toggles focused nodes once per key, including in pan mode", () => {
		const onSelectionChange = vi.fn();
		const { getByRole, rerender } = render(
			<Canvas graph={graph} label="Workflow" onSelectionChange={onSelectionChange} />,
		);
		const start = getByRole("option", { name: "Start" });
		fireEvent.keyDown(start, { key: "Enter" });
		expect(onSelectionChange).toHaveBeenCalledTimes(1);
		expect(onSelectionChange).toHaveBeenLastCalledWith(
			{ nodes: ["start"], edges: [] },
			expect.objectContaining({ reason: "item-press" }),
		);
		expect(onSelectionChange.mock.calls[0]?.[1].event.defaultPrevented).toBe(true);
		fireEvent.keyDown(start, { key: " ", shiftKey: true });
		expect(onSelectionChange).toHaveBeenCalledTimes(2);
		expect(onSelectionChange).toHaveBeenLastCalledWith(
			{ nodes: [], edges: [] },
			expect.objectContaining({ reason: "item-press" }),
		);
		rerender(<Canvas graph={graph} label="Workflow" mode="pan" onSelectionChange={onSelectionChange} />);
		fireEvent.keyDown(getByRole("option", { name: "End" }), { key: "Enter" });
		expect(onSelectionChange).toHaveBeenCalledTimes(3);
	});

	it("clears selection once on Escape and does not prevent an empty Escape", () => {
		const onSelectionChange = vi.fn();
		const { getByRole } = render(<Canvas graph={graph} label="Workflow" onSelectionChange={onSelectionChange} />);
		fireEvent.click(getByRole("option", { name: "Start" }));
		onSelectionChange.mockClear();
		expect(fireEvent.keyDown(getByRole("region"), { key: "Escape" })).toBe(false);
		expect(onSelectionChange).toHaveBeenCalledTimes(1);
		expect(onSelectionChange).toHaveBeenLastCalledWith(
			{ nodes: [], edges: [] },
			expect.objectContaining({ reason: "escape-key" }),
		);
		expect(fireEvent.keyDown(getByRole("region"), { key: "Escape" })).toBe(true);
		expect(onSelectionChange).toHaveBeenCalledTimes(1);
	});

	it("makes an empty canvas root the tab stop", () => {
		const markup = renderToStaticMarkup(<Canvas graph={{ nodes: [], edges: [] }} label="Workflow" />);
		expect(markup).toContain('tabindex="0"');
	});

	it.each(["ltr", "rtl"] as const)("moves focused nodes by physical keyboard direction in %s", (dir) => {
		const onNodeMove = vi.fn();
		const { getByRole } = render(<Canvas graph={graph} label="Workflow" dir={dir} onNodeMove={onNodeMove} />);
		const start = getByRole("option", { name: "Start" });
		start.focus();
		fireEvent.keyDown(start, { key: "ArrowRight", shiftKey: true });
		const x = dir === "rtl" ? 0 : 40;
		expect(onNodeMove).toHaveBeenCalledTimes(1);
		expect(onNodeMove).toHaveBeenCalledWith("start", { x, y: 30 }, expect.objectContaining({ reason: "move-key" }));
		fireEvent.keyDown(start, { key: "ArrowRight", shiftKey: true });
		expect(onNodeMove).toHaveBeenCalledTimes(2);
	});

	it("moves every selected node and leaves a host-controlled graph untouched", () => {
		const frozen: WorkflowGraph = {
			nodes: graph.nodes.map((node) => ({ ...node, position: { ...node.position } })),
			edges: graph.edges.map((edge) => ({ ...edge })),
		};
		for (const node of frozen.nodes) {
			Object.freeze(node.position);
			Object.freeze(node);
		}
		for (const edge of frozen.edges) Object.freeze(edge);
		Object.freeze(frozen.nodes);
		Object.freeze(frozen.edges);
		Object.freeze(frozen);
		const onNodeMove = vi.fn();
		const { getByRole } = render(
			<Canvas
				graph={frozen}
				label="Workflow"
				selection={{ nodes: ["start", "end"], edges: [] }}
				onNodeMove={onNodeMove}
			/>,
		);
		fireEvent.keyDown(getByRole("option", { name: "Start" }), { key: "ArrowDown", shiftKey: true });
		expect(onNodeMove).toHaveBeenCalledTimes(2);
		expect(frozen.nodes[0]?.position).toEqual({ x: 20, y: 30 });
		expect(frozen.nodes[1]?.position).toEqual({ x: 240, y: 30 });
	});

	it("keeps nodes fixed without a move callback and includes server path data", () => {
		const markup = renderToStaticMarkup(<Canvas graph={graph} label="Workflow" />);
		expect(markup).toContain("inset-inline-start:20px");
		expect(markup).toContain('d="M200,');
	});

	it("ignores presses that are not the primary button", () => {
		const onSelectionChange = vi.fn();
		const { getByRole } = render(
			<Canvas graph={graph} label="Workflow" onSelectionChange={onSelectionChange} onNodeMove={vi.fn()} />,
		);
		fireEvent.pointerDown(getByRole("option", { name: "Start" }), { button: 2 });
		expect(onSelectionChange).not.toHaveBeenCalled();
	});

	it("selects from a virtual click after a drag whose click never came", () => {
		const { getByRole } = render(<Canvas graph={graph} label="Workflow" onNodeMove={vi.fn()} />);
		const start = getByRole("option", { name: "Start" });
		fireEvent.pointerDown(start, { button: 0, isPrimary: true, clientX: 10, clientY: 10 });
		fireEvent.pointerUp(document, { button: 0, isPrimary: true, clientX: 10, clientY: 10 });
		fireEvent.click(getByRole("region"), { clientX: 10, clientY: 10 });
		expect(start).toHaveAttribute("aria-selected", "false");
		act(() => start.click());
		expect(start).toHaveAttribute("aria-selected", "true");
	});

	it("does not move without a move callback", () => {
		const { getByRole } = render(<Canvas graph={graph} label="Workflow" />);
		const start = getByRole("option", { name: "Start" });
		start.focus();
		fireEvent.keyDown(start, { key: "ArrowRight", shiftKey: true });
		expect(start).toHaveFocus();
		expect(start).toHaveStyle({ insetInlineStart: "20px" });
		expect(getByRole("region")).toHaveAttribute("data-movable", "false");
	});

	it("connects branch outputs to node bodies without selecting nodes or rendering during the drag", () => {
		const connectGraph: WorkflowGraph = {
			nodes: [
				{ id: "branch", kind: "classify", title: "Branch", branches: ["A", "B"], position: { x: 0, y: 0 } },
				{ id: "target", kind: "note", title: "Target", position: { x: 200, y: 0 } },
			],
			edges: [],
		};
		const onConnect = vi.fn();
		let renders = 0;
		const { container, getByRole } = render(
			<Profiler id="canvas" onRender={() => (renders += 1)}>
				<Canvas graph={connectGraph} label="Workflow" onConnect={onConnect} />
			</Profiler>,
		);
		const source = getByRole("option", { name: "Classify: Branch A B" });
		const target = getByRole("option", { name: "Note: Target" });
		vi.spyOn(source, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 120, 90));
		vi.spyOn(target, "getBoundingClientRect").mockReturnValue(new DOMRect(200, 0, 120, 90));
		const out = source.querySelector<HTMLElement>('[data-port="out"][data-port-index="1"]')!;
		vi.spyOn(out, "getBoundingClientRect").mockReturnValue(new DOMRect(116, 35, 8, 8));
		const input = target.querySelector<HTMLElement>('[data-port="in"]')!;
		vi.spyOn(input, "getBoundingClientRect").mockReturnValue(new DOMRect(196, 35, 8, 8));
		const initialRenders = renders;
		fireEvent.pointerDown(out, {
			pointerId: 1,
			button: 0,
			isPrimary: true,
			pointerType: "mouse",
			clientX: 120,
			clientY: 39,
		});
		fireEvent.pointerMove(document, { pointerId: 1, pointerType: "mouse", buttons: 1, clientX: 220, clientY: 45 });
		expect(renders).toBe(initialRenders);
		fireEvent.pointerUp(document, { pointerId: 1, pointerType: "mouse", button: 0, clientX: 220, clientY: 45 });
		expect(onConnect).toHaveBeenCalledTimes(1);
		expect(onConnect).toHaveBeenCalledWith(
			{ from: "branch", fromPort: 1, to: "target" },
			expect.objectContaining({ reason: "drag" }),
		);
		expect(source).toHaveAttribute("aria-selected", "false");
		expect(container.querySelector(".ts-canvas__connection")).toBeTruthy();
	});

	it("selects an output node on press when connecting is unavailable", () => {
		const onSelectionChange = vi.fn();
		const { getByRole } = render(<Canvas graph={graph} label="Workflow" onSelectionChange={onSelectionChange} />);
		fireEvent.pointerDown(getByRole("option", { name: "Start" }).querySelector('[data-port="out"]')!, { button: 0 });
		expect(onSelectionChange).toHaveBeenCalledTimes(1);
	});

	it("omits fromPort for a node with one output", () => {
		const plainGraph: WorkflowGraph = {
			nodes: [
				{ id: "source", kind: "start", title: "Source", position: { x: 0, y: 0 } },
				{ id: "target", kind: "note", title: "Target", position: { x: 200, y: 0 } },
			],
			edges: [],
		};
		const onConnect = vi.fn();
		const { getByRole } = render(<Canvas graph={plainGraph} label="Workflow" onConnect={onConnect} />);
		const source = getByRole("option", { name: "Start: Source" });
		const target = getByRole("option", { name: "Note: Target" });
		vi.spyOn(source, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 120, 90));
		vi.spyOn(target, "getBoundingClientRect").mockReturnValue(new DOMRect(200, 0, 120, 90));
		const out = source.querySelector<HTMLElement>('[data-port="out"]')!;
		vi.spyOn(out, "getBoundingClientRect").mockReturnValue(new DOMRect(116, 35, 8, 8));
		fireEvent.pointerDown(out, {
			pointerId: 1,
			button: 0,
			isPrimary: true,
			pointerType: "mouse",
			clientX: 120,
			clientY: 39,
		});
		fireEvent.pointerMove(document, { pointerId: 1, pointerType: "mouse", buttons: 1, clientX: 220, clientY: 45 });
		fireEvent.pointerUp(document, { pointerId: 1, pointerType: "mouse", button: 0, clientX: 220, clientY: 45 });
		expect(onConnect).toHaveBeenCalledWith(
			{ from: "source", to: "target" },
			expect.objectContaining({ reason: "drag" }),
		);
	});

	it("draws a drag without rendering and waits for the host graph", async () => {
		const onNodeMove = vi.fn();
		let renders = 0;
		const { getByRole } = render(
			<Profiler
				id="canvas"
				onRender={() => {
					renders += 1;
				}}
			>
				<Canvas
					graph={graph}
					label="Workflow"
					selection={{ nodes: ["start"], edges: [] }}
					onNodeMove={onNodeMove}
				/>
			</Profiler>,
		);
		const start = getByRole("option", { name: "Start" });
		const initialRenders = renders;
		fireEvent.pointerDown(start, {
			pointerId: 1,
			button: 0,
			isPrimary: true,
			pointerType: "mouse",
			clientX: 10,
			clientY: 10,
		});
		fireEvent.pointerMove(document, { pointerId: 1, pointerType: "mouse", buttons: 1, clientX: 30, clientY: 30 });
		await act(async () => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined))));
		expect(renders).toBe(initialRenders);
		fireEvent.pointerUp(document, { pointerId: 1, pointerType: "mouse", button: 0, clientX: 30, clientY: 30 });
		expect(onNodeMove).toHaveBeenCalledTimes(1);
		fireEvent.click(start);
		expect(start).toHaveStyle({ insetInlineStart: "20px", insetBlockStart: "30px" });
	});

	it.each(["ltr", "rtl"] as const)("renders nodes and edges on the server in %s", (dir) => {
		const markup = renderToStaticMarkup(<Canvas graph={graph} label="Workflow" dir={dir} />);
		expect(markup).toContain('role="listbox"');
		expect(markup).toContain('role="option"');
		expect(markup).toContain("Start");
		expect(markup).toContain("End");
		expect(markup).toContain('data-canvas-edge-layer=""');
		expect(markup).toContain("M200,");
		if (dir === "rtl") expect(markup).toContain('transform="scale(-1 1)"');
	});

	it.each([
		{ locale: "en" as const, canvasName: "Workflow", firstName: "Start", firstDescription: "Connects to End" },
		{ locale: "ar" as const, canvasName: "سير العمل", firstName: "البداية: Start", firstDescription: "يتصل بـ: End" },
	])("names the listbox and its options in $locale", ({ locale, canvasName, firstName, firstDescription }) => {
		const { getByRole } = render(<Canvas graph={graph} label={canvasName} locale={locale} />);
		const listbox = getByRole("listbox", { name: canvasName });
		const option = getByRole("option", { name: firstName });
		expect(listbox).toHaveAttribute("aria-multiselectable", "true");
		expect(option).toHaveAttribute("aria-description", firstDescription);
		expect(option).toHaveAttribute("aria-selected", "false");
	});

	it("places the world from the inline-start edge without a measured width", () => {
		const ltr = renderToStaticMarkup(
			<Canvas graph={graph} label="Workflow" defaultViewport={{ x: 18, y: 9, zoom: 1.2 }} />,
		);
		expect(ltr).toContain("translate(18px, 9px) scale(1.2)");
		const rtl = renderToStaticMarkup(
			<Canvas graph={graph} label="Workflow" dir="rtl" viewport={{ x: 18, y: 9, zoom: 1.2 }} />,
		);
		expect(rtl).toContain("translate(-18px, 9px) scale(1.2)");
		expect(rtl).toContain("left:100%");
	});

	it("reports a logical viewport in RTL", () => {
		const onViewportChange = vi.fn();
		const { getByRole } = render(
			<Canvas
				graph={graph}
				label="Workflow"
				dir="rtl"
				viewport={{ x: 40, y: 5, zoom: 1 }}
				onViewportChange={onViewportChange}
			/>,
		);
		const root = getByRole("region");
		vi.spyOn(root, "getBoundingClientRect").mockReturnValue(new DOMRect(100, 0, 500, 300));
		// The wheel moves the graph 20px to the left, which is further from the right edge.
		fireEvent.wheel(root, { deltaX: 20, deltaY: 0, deltaMode: 0 });
		expect(onViewportChange).toHaveBeenCalledWith(
			{ x: 60, y: 5, zoom: 1 },
			expect.objectContaining({ reason: "wheel" }),
		);
	});

	it("updates an uncontrolled viewport and reports logical controlled changes", () => {
		const uncontrolled = render(<Canvas graph={graph} label="Workflow" defaultViewport={{ x: 10, y: 5, zoom: 1 }} />);
		const uncontrolledRoot = uncontrolled.getByRole("region");
		fireEvent.wheel(uncontrolledRoot, { deltaY: -20, deltaX: 0, deltaMode: 0, clientX: 0, clientY: 0 });
		expect(uncontrolled.container.querySelector(".ts-canvas__world")).toHaveStyle({
			transform: "translate(10px, 25px) scale(1)",
		});
		uncontrolled.unmount();

		const onViewportChange = vi.fn();
		const controlled = render(
			<Canvas
				graph={graph}
				label="Workflow"
				viewport={{ x: 10, y: 5, zoom: 1 }}
				onViewportChange={onViewportChange}
			/>,
		);
		fireEvent.wheel(controlled.getByRole("region"), { deltaY: -20, deltaX: 0, deltaMode: 0, clientX: 0, clientY: 0 });
		expect(onViewportChange).toHaveBeenCalledWith(
			{ x: 10, y: 25, zoom: 1 },
			expect.objectContaining({ reason: "wheel" }),
		);
		expect(controlled.container.querySelector(".ts-canvas__world")).toHaveStyle({
			transform: "translate(10px, 5px) scale(1)",
		});
	});

	it("does not render nodes while panning", () => {
		const onRender = vi.fn();
		const { getByRole, container } = render(
			<Profiler id="canvas" onRender={onRender}>
				<Canvas graph={graph} label="Workflow" />
			</Profiler>,
		);
		onRender.mockClear();
		fireEvent.wheel(getByRole("region"), { deltaY: -20, deltaX: 0, deltaMode: 0 });
		expect(container.querySelector(".ts-canvas__world")).toHaveStyle({ transform: "translate(0px, 20px) scale(1)" });
		expect(onRender).not.toHaveBeenCalled();
	});

	it("chooses nodes, toggles with Shift, and reports item presses", () => {
		const onSelectionChange = vi.fn();
		const { getByRole } = render(<Canvas graph={graph} label="Workflow" onSelectionChange={onSelectionChange} />);
		const start = getByRole("option", { name: "Start" });
		const end = getByRole("option", { name: "End" });
		fireEvent.click(start);
		expect(onSelectionChange).toHaveBeenCalled();
		expect(start).toHaveAttribute("aria-selected", "true");
		expect(onSelectionChange).toHaveBeenLastCalledWith(
			{ nodes: ["start"], edges: [] },
			expect.objectContaining({ reason: "item-press" }),
		);
		fireEvent.click(end, { shiftKey: true });
		expect(start).toHaveAttribute("aria-selected", "true");
		expect(end).toHaveAttribute("aria-selected", "true");
		fireEvent.click(start, { shiftKey: true });
		expect(start).toHaveAttribute("aria-selected", "false");
		expect(end).toHaveAttribute("aria-selected", "true");
	});

	it("selects a node from a virtual element click", () => {
		const { getByRole } = render(<Canvas graph={graph} label="Workflow" />);
		const start = getByRole("option", { name: "Start" });
		act(() => start.click());
		expect(start).toHaveAttribute("aria-selected", "true");
	});

	it("toggles an edge with Shift", () => {
		const onSelectionChange = vi.fn();
		const { container } = render(<Canvas graph={graph} label="Workflow" onSelectionChange={onSelectionChange} />);
		const hitPath = container.querySelector(".ts-canvas__edge-hit")!;
		const edge = container.querySelector("[data-edge-id='edge']");
		fireEvent.click(hitPath);
		expect(edge).toHaveAttribute("data-selected", "true");
		fireEvent.click(hitPath, { shiftKey: true });
		expect(edge).not.toHaveAttribute("data-selected", "true");
		expect(onSelectionChange).toHaveBeenLastCalledWith(
			{ nodes: [], edges: [] },
			expect.objectContaining({ reason: "item-press" }),
		);
	});

	it("chooses an edge and clears the selection once from the ground", () => {
		const onSelectionChange = vi.fn();
		const { getByRole, container } = render(
			<Canvas graph={graph} label="Workflow" onSelectionChange={onSelectionChange} />,
		);
		fireEvent.click(getByRole("option", { name: "Start" }));
		fireEvent.click(container.querySelector(".ts-canvas__edge-hit")!);
		expect(getByRole("option", { name: "Start" })).toHaveAttribute("aria-selected", "false");
		expect(container.querySelector("[data-edge-id='edge']")).toHaveAttribute("data-selected", "true");
		expect(onSelectionChange).toHaveBeenLastCalledWith(
			{ nodes: [], edges: ["edge"] },
			expect.objectContaining({ reason: "item-press" }),
		);
		const root = getByRole("region");
		fireEvent.click(root);
		expect(onSelectionChange).toHaveBeenCalledTimes(3);
		expect(onSelectionChange).toHaveBeenLastCalledWith(
			{ nodes: [], edges: [] },
			expect.objectContaining({ reason: "clear-press" }),
		);
		fireEvent.click(root);
		expect(onSelectionChange).toHaveBeenCalledTimes(3);
	});

	it("does not change selection from ground drags or in pan mode", () => {
		const onSelectionChange = vi.fn();
		const { getByRole, rerender } = render(
			<Canvas graph={graph} label="Workflow" onSelectionChange={onSelectionChange} />,
		);
		const root = getByRole("region");
		fireEvent.click(getByRole("option", { name: "Start" }));
		onSelectionChange.mockClear();
		fireEvent.pointerDown(root, { clientX: 10, clientY: 10 });
		fireEvent.pointerMove(root, { clientX: 20, clientY: 10 });
		fireEvent.click(root, { clientX: 20, clientY: 10 });
		expect(getByRole("option", { name: "Start" })).toHaveAttribute("aria-selected", "true");
		expect(onSelectionChange).not.toHaveBeenCalled();
		rerender(<Canvas graph={graph} label="Workflow" mode="pan" onSelectionChange={onSelectionChange} />);
		fireEvent.click(getByRole("option", { name: "End" }));
		fireEvent.click(root);
		expect(getByRole("option", { name: "Start" })).toHaveAttribute("aria-selected", "true");
		expect(onSelectionChange).not.toHaveBeenCalled();
	});

	it("keeps controlled selection when the host refuses a request", () => {
		const onSelectionChange = vi.fn();
		const { getByRole } = render(
			<Canvas
				graph={graph}
				label="Workflow"
				selection={{ nodes: ["start"], edges: [] }}
				onSelectionChange={onSelectionChange}
			/>,
		);
		fireEvent.click(getByRole("option", { name: "End" }));
		expect(onSelectionChange).toHaveBeenCalledWith(
			{ nodes: ["end"], edges: [] },
			expect.objectContaining({ reason: "item-press" }),
		);
		expect(getByRole("option", { name: "Start" })).toHaveAttribute("aria-selected", "true");
		expect(getByRole("option", { name: "End" })).toHaveAttribute("aria-selected", "false");
	});

	it("keeps its own selection when the host cancels the change", () => {
		const { getByRole } = render(
			<Canvas graph={graph} label="Workflow" onSelectionChange={(_selection, details) => details.cancel()} />,
		);
		fireEvent.click(getByRole("option", { name: "Start" }));
		expect(getByRole("option", { name: "Start" })).toHaveAttribute("aria-selected", "false");
	});

	it("does not report a clear when only missing ids were selected", () => {
		const onSelectionChange = vi.fn();
		const { getByRole } = render(
			<Canvas
				graph={graph}
				label="Workflow"
				selection={{ nodes: ["missing"], edges: [] }}
				onSelectionChange={onSelectionChange}
			/>,
		);
		fireEvent.click(getByRole("region"));
		expect(onSelectionChange).not.toHaveBeenCalled();
	});

	it("round-trips ids with colons and ignores selections missing from the graph", () => {
		const colonGraph: WorkflowGraph = {
			nodes: [{ id: "start:one", kind: "start", title: "Colon node", position: { x: 20, y: 30 } }],
			edges: [],
		};
		const onSelectionChange = vi.fn();
		const { getByRole, rerender } = render(
			<Canvas graph={colonGraph} label="Workflow" onSelectionChange={onSelectionChange} />,
		);
		fireEvent.click(getByRole("option", { name: "Start: Colon node" }));
		expect(onSelectionChange).toHaveBeenCalledWith({ nodes: ["start:one"], edges: [] }, expect.anything());
		rerender(<Canvas graph={graph} label="Workflow" selection={{ nodes: ["missing"], edges: ["missing-edge"] }} />);
		expect(getByRole("option", { name: "Start" })).toHaveAttribute("aria-selected", "false");
	});

	it("returns a copy of node sizes and prunes removed nodes", () => {
		const ref = { current: null } as React.RefObject<CanvasHandle | null>;
		const { rerender } = render(<Canvas ref={ref} graph={graph} label="Workflow" />);
		act(() => {
			for (const observer of observers) {
				const entries = observer.targets
					.filter((target) => target.classList.contains("ts-canvas__node"))
					.map(
						(target) =>
							({
								target,
								borderBoxSize: [{ inlineSize: 180, blockSize: 80 }],
							}) as unknown as ResizeObserverEntry,
					);
				if (entries.length) observer.callback(entries, {} as ResizeObserver);
			}
		});
		const measured = ref.current?.getNodeSizes();
		expect(measured?.start).toEqual({ width: 180, height: 80 });
		if (measured) measured.start = { width: 1, height: 1 };
		expect(ref.current?.getNodeSizes().start).toEqual({ width: 180, height: 80 });
		rerender(<Canvas ref={ref} graph={{ nodes: [graph.nodes[1]!], edges: [] }} label="Workflow" />);
		expect(ref.current?.getNodeSizes()).not.toHaveProperty("start");
	});
});
