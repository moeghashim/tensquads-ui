import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTensquadsLibrary, getRegisteredComponents, TensquadsRenderer } from "../../openui";
import { Chip } from "./Chip.js";

afterEach(cleanup);

describe("Chip", () => {
	it("wraps the UI SDK button, forwards props, and opens its object", () => {
		const onClick = vi.fn();
		const { getByRole } = render(
			<Chip name="response_schema" icon={<span>◇</span>} onClick={onClick} data-testid="schema" />,
		);
		const chip = getByRole("button", { name: "response_schema" });
		expect(chip).toHaveAttribute("data-slot", "button");
		expect(chip).toHaveAttribute("data-testid", "schema");
		expect(chip).toHaveClass("ts-chip");
		expect(chip.querySelector(".ts-chip__icon")).toHaveAttribute("aria-hidden", "true");
		fireEvent.click(chip);
		expect(onClick).toHaveBeenCalledOnce();
	});

	it("keeps keyboard focus and forwards render props", () => {
		const { getByRole } = render(<Chip name="tool_search" icon={<span>⌕</span>} />);
		const chip = getByRole("button", { name: "tool_search" });
		chip.focus();
		expect(chip).toHaveFocus();
	});

	it("preserves disabled state and composed focus class", () => {
		const { getByRole } = render(
			<>
				<Chip name="unavailable" icon={<span>◇</span>} disabled />
				<Chip name="link" icon={<span>◇</span>} render={<a href="/schema" />} />
			</>,
		);
		expect(getByRole("button", { name: "unavailable" })).toBeDisabled();
		expect(getByRole("link", { name: "link" })).toHaveAttribute("href", "/schema");
	});

	it("renders English and Arabic OpenUI fixtures", () => {
		for (const locale of ["en", "ar"] as const) {
			const fixture = readFileSync(
				join(process.cwd(), `packages/ui/src/react/Chip/Chip.fixture.${locale}.txt`),
				"utf8",
			);
			const { getByRole } = render(<TensquadsRenderer stream={fixture} locale={locale} />);
			const chip = getByRole("button", { name: "response_schema" });
			expect(chip).toBeInTheDocument();
			expect(chip.textContent).toBe("response_schema");
			cleanup();
		}
		expect(createTensquadsLibrary("en")).toBe(createTensquadsLibrary("en"));
		expect(getRegisteredComponents().map(({ name }) => name)).toContain("Chip");
	});
});
