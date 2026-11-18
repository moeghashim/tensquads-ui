import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TensquadsRenderer } from "../../openui/TensquadsRenderer.js";
import { SegmentedControlOpenUI } from "./SegmentedControl.openui.js";

afterEach(cleanup);

describe("streamed SegmentedControl values", () => {
	it("applies a later initial value without remounting the group", () => {
		const { getByRole, rerender } = render(
			<TensquadsRenderer stream={'root = SegmentedControl("View", ["List", "Grid"],'} />,
		);
		const group = getByRole("radiogroup");
		expect(getByRole("radio", { name: "List" })).toHaveAttribute("aria-checked", "true");
		rerender(<TensquadsRenderer stream={'root = SegmentedControl("View", ["List", "Grid"], "Grid")'} />);
		expect(getByRole("radiogroup")).toBe(group);
		expect(getByRole("radio", { name: "Grid" })).toHaveAttribute("aria-checked", "true");
		expect(getByRole("radio", { name: "List" })).toHaveAttribute("aria-checked", "false");
	});

	it("preserves user selection through later stream chunks", () => {
		const { getByRole, rerender } = render(
			<TensquadsRenderer stream={'root = SegmentedControl("View", ["List", "Grid"],'} />,
		);
		fireEvent.click(getByRole("radio", { name: "Grid" }));
		rerender(<TensquadsRenderer stream={'root = SegmentedControl("View", ["List", "Grid"], "List")'} />);
		expect(getByRole("radio", { name: "Grid" })).toHaveAttribute("aria-checked", "true");
	});

	it.each([
		{ options: ["List", "List"], value: "List" },
		{ options: ["List", "Grid"], value: "Board" },
	])("rejects invalid identities in the schema and renderer: %j", ({ options, value }) => {
		expect(SegmentedControlOpenUI.props.safeParse({ label: "View", options, value }).success).toBe(false);
		const { queryByRole } = render(
			<TensquadsRenderer stream={`root = SegmentedControl("View", ${JSON.stringify(options)}, ${JSON.stringify(value)})`} />,
		);
		expect(queryByRole("radiogroup")).not.toBeInTheDocument();
	});

	it("accepts distinct options with an explicit member or an omitted initial value", () => {
		for (const value of [undefined, "Grid"]) {
			expect(SegmentedControlOpenUI.props.safeParse({ label: "View", options: ["List", "Grid"], value }).success).toBe(true);
		}
	});
});
