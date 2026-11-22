import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_PALETTE_SECTIONS, Palette } from "./Palette.js";

afterEach(cleanup);

const kinds = [
	["agent", "end", "note"],
	["file-search", "guardrails", "mcp"],
	["if-else", "while", "user-approval", "classify"],
	["transform", "set-state"],
];

describe("Palette", () => {
	it.each(["en", "ar"] as const)("localizes and orders sections in %s", (locale) => {
		const sections = DEFAULT_PALETTE_SECTIONS[locale];
		expect(sections.map(({ id }) => id)).toEqual(["core", "tools", "logic", "data"]);
		expect(sections.map(({ items }) => items.map(({ kind }) => kind))).toEqual(kinds);
		expect(sections.flatMap(({ items }) => items.map(({ kind }) => kind))).not.toContain("start");
		render(<Palette label="Node palette" sections={sections} onInsert={vi.fn()} />);
		const toolbar = screen.getByRole("toolbar", { name: "Node palette" });
		for (const section of sections) {
			const group = within(toolbar).getByRole("group", { name: section.label });
			for (const { label } of section.items)
				expect(within(group).getByRole("button", { name: label })).toBeVisible();
		}
		expect(toolbar.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
	});

	it("inserts once on click and passes the UI SDK source", () => {
		const onInsert = vi.fn();
		render(<Palette label="Node palette" sections={DEFAULT_PALETTE_SECTIONS.en} onInsert={onInsert} />);
		fireEvent.click(screen.getByRole("button", { name: "Agent" }));
		expect(onInsert).toHaveBeenCalledTimes(1);
		expect(onInsert).toHaveBeenCalledWith("agent", { source: "programmatic" });
	});

	it("drops a mouse drag on Canvas once with its graph position", () => {
		const onInsert = vi.fn();
		const canvas = { current: { getNodeSizes: vi.fn(() => ({})), pointAt: vi.fn(() => ({ x: 120, y: 80 })) } };
		render(
			<Palette label="Node palette" sections={DEFAULT_PALETTE_SECTIONS.en} onInsert={onInsert} canvas={canvas} />,
		);
		const button = screen.getByRole("button", { name: "Agent" });
		fireEvent.pointerDown(button, {
			pointerId: 1,
			pointerType: "mouse",
			button: 0,
			isPrimary: true,
			clientX: 10,
			clientY: 10,
		});
		fireEvent.pointerMove(document, { pointerId: 1, pointerType: "mouse", buttons: 1, clientX: 40, clientY: 50 });
		fireEvent.pointerUp(document, { pointerId: 1, pointerType: "mouse", button: 0, clientX: 40, clientY: 50 });
		expect(canvas.current.pointAt).toHaveBeenCalledWith(40, 50);
		expect(onInsert).toHaveBeenCalledTimes(1);
		expect(onInsert).toHaveBeenCalledWith("agent", { source: "mouse", position: { x: 120, y: 80 } });
	});

	it("cancels an Escape drag and does not drag touch presses", () => {
		const onInsert = vi.fn();
		const canvas = { current: { getNodeSizes: vi.fn(() => ({})), pointAt: vi.fn(() => ({ x: 0, y: 0 })) } };
		render(
			<Palette label="Node palette" sections={DEFAULT_PALETTE_SECTIONS.en} onInsert={onInsert} canvas={canvas} />,
		);
		const button = screen.getByRole("button", { name: "Agent" });
		fireEvent.pointerDown(button, {
			pointerId: 2,
			pointerType: "mouse",
			button: 0,
			isPrimary: true,
			clientX: 10,
			clientY: 10,
		});
		fireEvent.pointerMove(document, { pointerId: 2, pointerType: "mouse", buttons: 1, clientX: 40, clientY: 50 });
		fireEvent.keyDown(document, { key: "Escape" });
		expect(onInsert).not.toHaveBeenCalled();
		fireEvent.pointerDown(button, {
			pointerId: 3,
			pointerType: "touch",
			button: 0,
			isPrimary: true,
			clientX: 10,
			clientY: 10,
		});
		fireEvent.pointerMove(document, { pointerId: 3, pointerType: "touch", buttons: 1, clientX: 40, clientY: 50 });
		fireEvent.pointerUp(document, { pointerId: 3, pointerType: "touch", button: 0, clientX: 40, clientY: 50 });
		expect(canvas.current.pointAt).not.toHaveBeenCalled();
		expect(onInsert).not.toHaveBeenCalled();
	});

	it("does not start a drag below the threshold and stops tracking on unmount", () => {
		const onInsert = vi.fn();
		const canvas = { current: { getNodeSizes: vi.fn(() => ({})), pointAt: vi.fn(() => ({ x: 0, y: 0 })) } };
		const view = render(
			<Palette label="Node palette" sections={DEFAULT_PALETTE_SECTIONS.en} onInsert={onInsert} canvas={canvas} />,
		);
		const button = screen.getByRole("button", { name: "Agent" });
		fireEvent.pointerDown(button, {
			pointerId: 4,
			pointerType: "mouse",
			button: 0,
			isPrimary: true,
			clientX: 10,
			clientY: 10,
		});
		fireEvent.pointerMove(document, { pointerId: 4, pointerType: "mouse", buttons: 1, clientX: 11, clientY: 11 });
		expect(screen.queryByLabelText("Agent")).toBeNull();
		view.unmount();
		fireEvent.pointerUp(document, { pointerId: 4, pointerType: "mouse", button: 0, clientX: 11, clientY: 11 });
		expect(onInsert).not.toHaveBeenCalled();
		expect(canvas.current.pointAt).not.toHaveBeenCalled();
	});

	it("moves focus with vertical toolbar keys without wrapping", () => {
		render(<Palette label="Node palette" sections={DEFAULT_PALETTE_SECTIONS.en} onInsert={vi.fn()} />);
		const agent = screen.getByRole("button", { name: "Agent" });
		const end = screen.getByRole("button", { name: "End" });
		const setState = screen.getByRole("button", { name: "Set state" });
		agent.focus();
		fireEvent.keyDown(agent, { key: "ArrowDown" });
		expect(end).toHaveFocus();
		fireEvent.keyDown(end, { key: "ArrowUp" });
		expect(agent).toHaveFocus();
		fireEvent.keyDown(agent, { key: "Home" });
		expect(agent).toHaveFocus();
		fireEvent.keyDown(agent, { key: "End" });
		expect(setState).toHaveFocus();
		fireEvent.keyDown(setState, { key: "ArrowDown" });
		expect(setState).toHaveFocus();
	});

	it("renders named groups and server markup", () => {
		const markup = renderToStaticMarkup(
			<Palette label="Node palette" sections={DEFAULT_PALETTE_SECTIONS.en} onInsert={vi.fn()} />,
		);
		expect(markup).toContain("aria-labelledby=");
		expect(markup).toContain('data-family="agent"');
	});
});
