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
