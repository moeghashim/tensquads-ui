import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Toolbar, type ToolbarItem } from "./Toolbar.js";

afterEach(cleanup);
Object.defineProperty(Element.prototype, "getAnimations", { configurable: true, value: () => [] });

const icon = (name: string) => <svg aria-hidden="true" data-icon={name} viewBox="0 0 24 24" />;
const items: ToolbarItem[] = [
	{ type: "toggle", id: "pan", label: "Pan", icon: icon("pan"), pressed: true, onPressedChange: vi.fn() },
	{ type: "toggle", id: "select", label: "Select", icon: icon("select"), pressed: false, onPressedChange: vi.fn() },
	{ type: "separator", id: "history" },
	{ type: "button", id: "undo", label: "Undo", icon: icon("undo"), onClick: vi.fn(), disabled: true },
	{ type: "button", id: "redo", label: "Redo", icon: icon("redo"), onClick: vi.fn(), disabled: true },
];

describe("Toolbar", () => {
	it("names controls, renders separators and keeps one toolbar tab stop", () => {
		const { container } = render(<Toolbar label="Canvas tools" items={items} />);
		const toolbar = screen.getByRole("toolbar", { name: "Canvas tools" });
		expect(within(toolbar).getByRole("button", { name: "Pan" })).toHaveAttribute("aria-pressed", "true");
		expect(within(toolbar).getByRole("button", { name: "Undo" })).toHaveAttribute("aria-disabled", "true");
		expect(within(toolbar).getByRole("separator")).toBeInTheDocument();
		expect(container.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
	});

	it("moves focus with toolbar arrows, including in RTL", () => {
		const { rerender } = render(<Toolbar label="Tools" items={items} />);
		const pan = screen.getByRole("button", { name: "Pan" });
		pan.focus();
		fireEvent.keyDown(pan, { key: "ArrowRight" });
		expect(screen.getByRole("button", { name: "Select" })).toHaveFocus();
		rerender(
			<div dir="rtl">
				<Toolbar label="Tools" items={items} />
			</div>,
		);
		const rtlPan = screen.getByRole("button", { name: "Pan" });
		rtlPan.focus();
		fireEvent.keyDown(rtlPan, { key: "ArrowLeft" });
		expect(screen.getByRole("button", { name: "Select" })).toHaveFocus();
	});

	it("reports toggle state changes, ignores disabled actions, and names tooltip text", () => {
		const toggle = vi.fn();
		const click = vi.fn();
		const entries: ToolbarItem[] = [
			{ type: "toggle", id: "pan", label: "Pan", icon: icon("pan"), pressed: false, onPressedChange: toggle },
			{ type: "button", id: "undo", label: "Undo", icon: icon("undo"), onClick: click, disabled: true },
		];
		render(<Toolbar label="Tools" items={entries} />);
		fireEvent.click(screen.getByRole("button", { name: "Pan" }));
		expect(toggle).toHaveBeenCalledWith(true, expect.anything());
		fireEvent.click(screen.getByRole("button", { name: "Undo" }));
		expect(click).not.toHaveBeenCalled();
		expect(screen.getAllByRole("tooltip", { hidden: true }).some((tooltip) => tooltip.textContent === "Pan")).toBe(
			true,
		);
	});
});
