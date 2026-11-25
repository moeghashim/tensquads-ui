import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { WorkflowGraph } from "../../schemas/workflow.js";
import { Canvas } from "../Canvas/Canvas.js";
import { MiniMap } from "./MiniMap.js";

const graph: WorkflowGraph = {
	nodes: [
		{ id: "start", title: "Start", kind: "start", position: { x: 20, y: 20 } },
		{ id: "end", title: "End", kind: "end", position: { x: 300, y: 20 } },
	],
	edges: [],
};

let resizeOverlay: (width: number, height: number) => void;

beforeEach(() => {
	vi.stubGlobal(
		"ResizeObserver",
		class {
			constructor(private callback: ResizeObserverCallback) {}
			observe(target: Element) {
				if (target.hasAttribute("data-canvas-overlay")) {
					resizeOverlay = (width, height) =>
						act(() =>
							this.callback(
								[{ target, contentRect: new DOMRect(0, 0, width, height) } as ResizeObserverEntry],
								this,
							),
						);
				}
			}
			disconnect() {}
			unobserve() {}
		},
	);
});
afterEach(cleanup);
afterEach(() => vi.unstubAllGlobals());

test("shows only when graph dimensions exceed the visible area and hides after zooming out or resizing", () => {
	const renderCanvas = (zoom: number) => (
		<Canvas graph={graph} label="Workflow" viewport={{ x: 0, y: 0, zoom }}>
			<MiniMap placement="start" />
		</Canvas>
	);
	const { getByRole, queryByRole, rerender } = render(renderCanvas(1));
	resizeOverlay(300, 120);
	const minimap = () => queryByRole("region", { name: "Minimap" });
	expect(getByRole("region", { name: "Minimap" }).getAttribute("data-placement")).toBe("start");
	rerender(renderCanvas(0.5));
	expect(minimap()).toBeNull();
	rerender(renderCanvas(1));
	expect(minimap()).not.toBeNull();
	resizeOverlay(500, 120);
	expect(minimap()).toBeNull();
});

test("arrow keys update the uncontrolled viewport and respect canceled changes", () => {
	const onViewportChange = vi.fn();
	const { container, getByRole } = render(
		<Canvas graph={graph} label="Workflow" onViewportChange={onViewportChange}>
			<MiniMap />
		</Canvas>,
	);
	resizeOverlay(300, 120);
	const map = getByRole("region", { name: "Minimap" });
	const mask = container.querySelector("[data-viewport-mask]");
	const startX = Number(mask?.getAttribute("x"));
	fireEvent.keyDown(map, { key: "ArrowRight" });
	expect(onViewportChange).toHaveBeenLastCalledWith(
		{ x: -30, y: 0, zoom: 1 },
		expect.objectContaining({ event: expect.any(KeyboardEvent) }),
	);
	expect(Number(mask?.getAttribute("x"))).toBeGreaterThan(startX);
	fireEvent.keyDown(map, { key: "ArrowDown" });
	expect(onViewportChange).toHaveBeenLastCalledWith(
		{ x: -30, y: -12, zoom: 1 },
		expect.objectContaining({ event: expect.any(KeyboardEvent) }),
	);
	const maskY = mask?.getAttribute("y");
	onViewportChange.mockImplementationOnce((_viewport, details) => details.cancel());
	fireEvent.keyDown(map, { key: "ArrowUp" });
	expect(mask?.getAttribute("y")).toBe(maskY);
});
