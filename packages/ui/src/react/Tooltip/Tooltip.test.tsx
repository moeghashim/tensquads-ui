import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getRegisteredComponents, TensquadsRenderer } from "../../openui";
import { Button } from "../Button/Button.js";
import { Tooltip, TooltipArrow, TooltipContent, TooltipShortcut, TooltipTrigger } from "./Tooltip.js";

Object.defineProperty(Element.prototype, "getAnimations", { configurable: true, value: () => [] });

afterEach(() => {
	cleanup();
	document.documentElement.removeAttribute("dir");
});

describe("Tooltip", () => {
	it("opens on keyboard focus, describes the named icon button, and closes on Escape", async () => {
		const { getByRole, getByTestId, queryByRole } = render(
			<Tooltip defaultOpen>
				<TooltipTrigger render={<Button iconOnly aria-label="Add item" />}>
					<span aria-hidden="true">+</span>
				</TooltipTrigger>
				<TooltipContent data-testid="tip">Create a new item</TooltipContent>
			</Tooltip>,
		);
		const trigger = getByRole("button", { name: "Add item" });
		// The SDK part delegates the rendered slot to Button, per its render contract.
		expect(trigger).toHaveAttribute("data-slot", "button");
		expect(trigger).toHaveAttribute("aria-label", "Add item");
		trigger.focus();
		const tooltip = getByTestId("tip");
		expect(tooltip).toHaveAttribute("data-open");
		expect(tooltip).toHaveTextContent("Create a new item");
		expect(trigger.getAttribute("aria-describedby")?.split(" ")).toContain(tooltip.id);
		fireEvent.keyDown(trigger, { key: "Escape" });
		await waitFor(() => expect(tooltip).toHaveAttribute("data-closed"));
		expect(trigger).toHaveFocus();
		expect(queryByRole("tooltip", { hidden: true })).toBeInTheDocument();
	});

	it("preserves UI SDK parts, render props, shortcut and requested placement", async () => {
		const { getByRole, getByTestId } = render(
			<Tooltip defaultOpen shortcut="mod+k">
				<TooltipTrigger render={<Button iconOnly aria-label="Search" data-testid="search" />}>
					<span aria-hidden="true">⌕</span>
				</TooltipTrigger>
				<TooltipContent side="right" data-testid="content">
					Search
					<TooltipShortcut />
					<TooltipArrow />
				</TooltipContent>
			</Tooltip>,
		);
		const tooltip = getByTestId("content");
		await waitFor(() => expect(tooltip).toHaveAttribute("data-side", "right"));
		expect(getByRole("button", { name: "Search" })).toHaveAttribute("data-testid", "search");
		expect(tooltip.querySelector('[data-slot="tooltip-shortcut"]')).toBeInTheDocument();
		expect(tooltip.querySelector('[data-slot="tooltip-arrow"]')).toBeInTheDocument();
	});

	it("does not open when disabled", () => {
		const { getByRole, getByTestId } = render(
			<Tooltip disabled>
				<TooltipTrigger>Help</TooltipTrigger>
				<TooltipContent data-testid="disabled-tip">More information</TooltipContent>
			</Tooltip>,
		);
		fireEvent.pointerEnter(getByRole("button", { name: "Help" }));
		fireEvent.focus(getByRole("button", { name: "Help" }));
		expect(getByTestId("disabled-tip")).toHaveAttribute("data-closed");
	});
});

describe("OpenUI round trips", () => {
	it("registers both locale fixtures and renders an accessible trigger", () => {
		expect(getRegisteredComponents().map(({ name }) => name)).toContain("Tooltip");
		for (const locale of ["en", "ar"] as const) {
			const fixture = readFileSync(
				join(process.cwd(), "packages/ui/src/react/Tooltip", `Tooltip.fixture.${locale}.txt`),
				"utf8",
			);
			const onError = vi.fn();
			const { getByRole } = render(<TensquadsRenderer stream={fixture} locale={locale} onError={onError} />);
			expect(getByRole("button", { name: locale === "en" ? "Add item" : "إضافة عنصر" })).toBeInTheDocument();
			expect(onError).toHaveBeenCalledWith([]);
			cleanup();
		}
	});
});
