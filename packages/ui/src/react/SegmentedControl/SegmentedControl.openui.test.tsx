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

	it.each(["ltr", "rtl"] as const)("keeps a growing option selected and focused in %s", (dir) => {
		const { getByRole, getAllByRole, rerender } = render(
			<div dir={dir}>
				<TensquadsRenderer stream={'root = SegmentedControl("View", ["List", "Gr'} />
			</div>,
		);
		const group = getByRole("radiogroup");
		const growing = getByRole("radio", { name: "Gr" });
		growing.focus();
		fireEvent.click(growing);
		expect(growing).toHaveAttribute("aria-checked", "true");
		for (const stream of [
			'root = SegmentedControl("View", ["List", "Grid"], "G',
			'root = SegmentedControl("View", ["List", "Grid"], "Grid")',
		]) {
			rerender(
				<div dir={dir}>
					<TensquadsRenderer stream={stream} />
				</div>,
			);
			expect(getByRole("radiogroup")).toBe(group);
			expect(getByRole("radio", { name: "Grid" })).toBe(growing);
			expect(growing).toHaveFocus();
			expect(growing).toHaveAttribute("aria-checked", "true");
			expect(getAllByRole("radio", { checked: true })).toHaveLength(1);
		}
		fireEvent.click(getByRole("radio", { name: "List" }));
		expect(getByRole("radio", { name: "List" })).toHaveAttribute("aria-checked", "true");
	});

	it("defers an unfinished initial value without removing the focused control", () => {
		const { getByRole, rerender } = render(
			<TensquadsRenderer stream={'root = SegmentedControl("View", ["List", "Grid"],'} />,
		);
		const group = getByRole("radiogroup");
		const list = getByRole("radio", { name: "List" });
		list.focus();
		rerender(<TensquadsRenderer stream={'root = SegmentedControl("View", ["List", "Grid"], "G'} />);
		expect(getByRole("radiogroup")).toBe(group);
		expect(list).toHaveFocus();
		expect(list).toHaveAttribute("aria-checked", "true");
		rerender(<TensquadsRenderer stream={'root = SegmentedControl("View", ["List", "Grid"], "Grid")'} />);
		expect(getByRole("radiogroup")).toBe(group);
		expect(list).toHaveFocus();
		expect(getByRole("radio", { name: "Grid" })).toHaveAttribute("aria-checked", "true");
		fireEvent.click(list);
		expect(list).toHaveAttribute("aria-checked", "true");
	});

	it.each([
		{ options: ["List", "List", "Grid"], value: "List" },
		{ options: ["List", "Grid"], value: "Board" },
	])("rejects invalid schema input but keeps streamed choices usable: %j", ({ options, value }) => {
		expect(SegmentedControlOpenUI.props.safeParse({ label: "View", options, value }).success).toBe(false);
		const { getByRole, getAllByRole, rerender } = render(
			<TensquadsRenderer stream={'root = SegmentedControl("View", ["List", "Grid"],'} />,
		);
		const group = getByRole("radiogroup");
		const list = getByRole("radio", { name: "List" });
		list.focus();
		rerender(
			<TensquadsRenderer
				stream={`root = SegmentedControl("View", ${JSON.stringify(options)}, ${JSON.stringify(value)})`}
			/>,
		);
		expect(getByRole("radiogroup")).toBe(group);
		expect(list).toHaveFocus();
		expect(getAllByRole("radio")).toHaveLength(2);
		expect(getAllByRole("radio", { checked: true })).toHaveLength(1);
		fireEvent.click(getByRole("radio", { name: "Grid" }));
		expect(getByRole("radio", { name: "Grid" })).toHaveAttribute("aria-checked", "true");
		expect(list).toHaveAttribute("aria-checked", "false");
	});

	it("keeps the selected option stable while a duplicate label grows into a distinct option", () => {
		const { getByRole, getAllByRole, rerender } = render(
			<TensquadsRenderer stream={'root = SegmentedControl("View", ["List", "List'} />,
		);
		const list = getByRole("radio", { name: "List" });
		list.focus();
		fireEvent.click(list);
		expect(getAllByRole("radio")).toHaveLength(1);
		rerender(<TensquadsRenderer stream={'root = SegmentedControl("View", ["List", "List view"], "List view")'} />);
		expect(getByRole("radio", { name: "List" })).toBe(list);
		expect(list).toHaveFocus();
		expect(list).toHaveAttribute("aria-checked", "true");
		fireEvent.click(getByRole("radio", { name: "List view" }));
		expect(getByRole("radio", { name: "List view" })).toHaveAttribute("aria-checked", "true");
		expect(getAllByRole("radio", { checked: true })).toHaveLength(1);
	});

	it("accepts distinct options with an explicit member or an omitted initial value", () => {
		for (const value of [undefined, "Grid"]) {
			expect(
				SegmentedControlOpenUI.props.safeParse({ label: "View", options: ["List", "Grid"], value }).success,
			).toBe(true);
		}
	});
});
