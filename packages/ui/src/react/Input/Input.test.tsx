import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Input } from "./Input.js";

afterEach(cleanup);

describe("Input", () => {
	it("wraps the SDK input and forwards native props, render, and value changes", () => {
		const onValueChange = vi.fn();
		const { getByRole } = render(
			<Input
				aria-label="Search"
				defaultValue="alpha"
				variant="outline"
				name="query"
				data-testid="query"
				onValueChange={onValueChange}
			/>,
		);
		const input = getByRole("textbox", { name: "Search" });
		expect(input).toHaveAttribute("data-slot", "input");
		expect(input).toHaveAttribute("name", "query");
		expect(input).toHaveClass("ts-input", "ts-input--outline");
		fireEvent.input(input, { target: { value: "beta" } });
		expect(onValueChange).toHaveBeenCalledWith("beta", expect.objectContaining({ reason: "input-change" }));
	});

	it("preserves render props and accepts an accessible name for standalone use", () => {
		const { getByRole } = render(
			<Input aria-label="Email" placeholder="name@example.com" render={<input type="search" />} />,
		);
		const input = getByRole("searchbox", { name: "Email" });
		expect(input).toHaveAttribute("data-slot", "input");
	});

	it.each(["disabled", "readOnly"] as const)("preserves %s state", (state) => {
		const { getByRole } = render(<Input aria-label="Value" {...{ [state]: true }} />);
		expect(getByRole("textbox", { name: "Value" })).toHaveAttribute(state === "readOnly" ? "readonly" : "disabled");
	});
});
