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

	describe("dragging", () => {
		const setup = (position: { x: number; y: number } | null = { x: 120, y: 80 }, withCanvas = true) => {
			const onInsert = vi.fn();
			const pointAt = vi.fn(() => position);
			const canvas = { current: { getNodeSizes: () => ({}), pointAt } };
			const view = render(
				<Palette
					label="Node palette"
					sections={DEFAULT_PALETTE_SECTIONS.en}
					onInsert={onInsert}
					canvas={withCanvas ? canvas : undefined}
				/>,
			);
			const row = screen.getByRole("button", { name: "Agent" });
			const send = (
				type: "pointerDown" | "pointerMove" | "pointerUp",
				at: number,
				pointerType = "mouse",
				button = 0,
			) =>
				fireEvent[type](type === "pointerDown" ? row : document, {
					pointerId: 1,
					pointerType,
					button,
					buttons: type === "pointerUp" ? 0 : 1,
					isPrimary: true,
					clientX: at,
					clientY: at,
				});
			const ghost = () => document.querySelector<HTMLElement>(".ts-palette__ghost");
			return { onInsert, pointAt, row, send, ghost, view };
		};

		it.each(["mouse", "pen"])("inserts once where a %s drag ends", (pointerType) => {
			const { onInsert, pointAt, row, send, ghost } = setup();
			send("pointerDown", 10, pointerType);
			send("pointerMove", 40, pointerType);
			send("pointerUp", 40, pointerType);
			expect(pointAt).toHaveBeenCalledWith(40, 40);
			expect(onInsert).toHaveBeenCalledTimes(1);
			expect(onInsert).toHaveBeenCalledWith("agent", { source: pointerType, position: { x: 120, y: 80 } });
			expect(ghost()).toBeNull();
			expect(row).not.toHaveAttribute("data-dragging");
		});

		it("inserts again on the press after a drop", async () => {
			const { onInsert, row, send } = setup();
			send("pointerDown", 10);
			send("pointerMove", 40);
			send("pointerUp", 40);
			await new Promise((resolve) => setTimeout(resolve));
			fireEvent.click(row);
			expect(onInsert).toHaveBeenCalledTimes(2);
			expect(onInsert.mock.calls[1]?.[1]).not.toHaveProperty("position");
		});

		it("inserts nothing when the canvas refuses the point", () => {
			const { onInsert, pointAt, send } = setup(null);
			send("pointerDown", 10);
			send("pointerMove", 40);
			send("pointerUp", 40);
			expect(pointAt).toHaveBeenCalledTimes(1);
			expect(onInsert).not.toHaveBeenCalled();
		});

		it("cancels on Escape", () => {
			const { onInsert, pointAt, send, ghost } = setup();
			send("pointerDown", 10);
			send("pointerMove", 40);
			fireEvent.keyDown(document, { key: "Escape" });
			send("pointerUp", 40);
			expect(pointAt).not.toHaveBeenCalled();
			expect(onInsert).not.toHaveBeenCalled();
			expect(ghost()).toBeNull();
		});

		it.each([
			["touch", "touch", 0, 40, true],
			["a secondary button", "mouse", 2, 40, true],
			["a move below the threshold", "mouse", 0, 11, true],
			["no canvas", "mouse", 0, 40, false],
		] as const)("does not drag with %s", (_name, pointerType, button, to, withCanvas) => {
			const { onInsert, pointAt, send, ghost } = setup(undefined, withCanvas);
			send("pointerDown", 10, pointerType, button);
			send("pointerMove", to, pointerType, button);
			expect(ghost()).toBeNull();
			send("pointerUp", to, pointerType, button);
			expect(pointAt).not.toHaveBeenCalled();
			expect(onInsert).not.toHaveBeenCalled();
		});

		it("stops when it unmounts during a drag", () => {
			const { onInsert, pointAt, send, view } = setup();
			send("pointerDown", 10);
			send("pointerMove", 40);
			view.unmount();
			send("pointerUp", 40);
			expect(pointAt).not.toHaveBeenCalled();
			expect(onInsert).not.toHaveBeenCalled();
		});
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
