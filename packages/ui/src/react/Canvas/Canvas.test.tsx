import { act, cleanup, fireEvent, render } from "@testing-library/react";
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
	it.each(["ltr", "rtl"] as const)("renders nodes and edges on the server in %s", (dir) => {
		const markup = renderToStaticMarkup(<Canvas graph={graph} label="Workflow" dir={dir} />);
		expect(markup).toContain("Start");
		expect(markup).toContain("End");
		expect(markup).toContain('data-canvas-edge-layer=""');
		expect(markup).toContain("M200,");
		if (dir === "rtl") expect(markup).toContain('transform="scale(-1 1)"');
	});

	it("renders the default and controlled viewport without mutating the graph", () => {
		const onViewportChange = vi.fn();
		const controlled = render(
			<Canvas
				graph={graph}
				label="Workflow"
				viewport={{ x: 50, y: 12, zoom: 1 }}
				onViewportChange={onViewportChange}
			/>,
		);
		expect(controlled.getByRole("region", { name: "Workflow" })).toHaveAttribute("data-slot", "workflow-canvas");
		expect(graph.nodes[0]?.position).toEqual({ x: 20, y: 30 });
		controlled.unmount();
		const uncontrolled = render(
			<Canvas graph={graph} label="Workflow" defaultViewport={{ x: 18, y: 9, zoom: 1.2 }} />,
		);
		expect(uncontrolled.getByRole("region")).toBeInTheDocument();
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

	it("does not rerender Canvas children during live pans", () => {
		let renders = 0;
		function Example() {
			renders += 1;
			return <Canvas graph={graph} label="Workflow" />;
		}
		const { getByRole } = render(<Example />);
		const before = renders;
		fireEvent.wheel(getByRole("region"), { deltaY: -20, deltaX: 0, deltaMode: 0, clientX: 0, clientY: 0 });
		expect(renders).toBe(before);
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
