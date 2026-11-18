import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TensquadsRenderer } from "../../openui/TensquadsRenderer.js";
import { Input, InputClear, InputGroup } from "../index.js";

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

describe("OpenUI streamed values", () => {
	it.each(["en", "ar"] as const)("updates streamed text and preserves edits in %s", (locale) => {
		const stream = (value: string) => `root = Input("Search", "Find", "${value}")`;
		const { getByRole, rerender } = render(<TensquadsRenderer stream={stream("N").slice(0, -2)} locale={locale} />);
		const input = getByRole("textbox", { name: "Search" });
		expect(input).toHaveValue("N");
		rerender(<TensquadsRenderer stream={stream("Northstar")} locale={locale} />);
		expect(getByRole("textbox", { name: "Search" })).toBe(input);
		expect(input).toHaveValue("Northstar");
		fireEvent.input(input, { target: { value: "My project" } });
		expect(input).toHaveValue("My project");
		rerender(<TensquadsRenderer stream={stream("Northstar")} locale={locale} />);
		expect(input).toHaveValue("My project");
		rerender(<TensquadsRenderer stream={stream("")} locale={locale} />);
		expect(input).toHaveValue("");
	});
});

describe("Input parts", () => {
	it.each(["ltr", "rtl"])("clears grouped text and returns focus in %s", async (dir) => {
		const onValueChange = vi.fn();
		const { getByRole, getByTestId, queryByRole } = render(
			<InputGroup
				dir={dir}
				data-testid="group"
				render={<section />}
				className={(state) => (state.filled ? "filled" : "empty")}
			>
				<Input aria-label="Website" defaultValue="example.com" onValueChange={onValueChange} />
				<InputClear
					aria-label="Clear website"
					render={<button type="button" />}
					className={(state) => (state.filled ? "clearable" : "empty")}
				/>
			</InputGroup>,
		);
		const group = getByTestId("group");
		expect(group.tagName).toBe("SECTION");
		expect(group).toHaveAttribute("data-slot", "input-group");
		expect(group).toHaveAttribute("dir", dir);
		await waitFor(() => expect(group).toHaveClass("filled"));
		const clear = getByRole("button", { name: "Clear website" });
		expect(clear).toHaveAttribute("data-slot", "input-clear");
		expect(clear).toHaveAttribute("type", "button");
		expect(clear).toHaveClass("clearable");
		fireEvent.click(clear);
		const input = getByRole("textbox", { name: "Website" });
		expect(input).toHaveValue("");
		expect(input).toHaveFocus();
		expect(onValueChange).toHaveBeenCalledWith("", expect.objectContaining({ reason: "clear-press" }));
		expect(queryByRole("button", { name: "Clear website" })).not.toBeInTheDocument();
		await waitFor(() => expect(group).toHaveClass("empty"));
	});
});
