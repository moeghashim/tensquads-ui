import { act, cleanup, fireEvent, render } from "@testing-library/react";
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
		act(() => growing.focus());
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
		act(() => list.focus());
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
		act(() => list.focus());
		rerender(
			<TensquadsRenderer
				stream={`root = SegmentedControl("View", ${JSON.stringify(options)}, ${JSON.stringify(value)})`}
			/>,
		);
		expect(getByRole("radiogroup")).toBe(group);
		expect(list).toHaveFocus();
		expect(getAllByRole("radio").filter((item) => !item.hasAttribute("data-disabled"))).toHaveLength(2);
		expect(getAllByRole("radio", { checked: true })).toHaveLength(1);
		fireEvent.click(getByRole("radio", { name: "Grid" }));
		expect(getByRole("radio", { name: "Grid" })).toHaveAttribute("aria-checked", "true");
		expect(list).toHaveAttribute("aria-checked", "false");
	});

	it("keeps the selected option stable while a duplicate label grows into a distinct option", () => {
		const { getByRole, getAllByRole, rerender } = render(
			<TensquadsRenderer stream={'root = SegmentedControl("View", ["List", "List'} />,
		);
		const list = getAllByRole("radio", { name: "List" })[0];
		act(() => list.focus());
		fireEvent.click(list);
		expect(getAllByRole("radio").filter((item) => !item.hasAttribute("data-disabled"))).toHaveLength(1);
		rerender(<TensquadsRenderer stream={'root = SegmentedControl("View", ["List", "List view"], "List view")'} />);
		expect(getByRole("radio", { name: "List" })).toBe(list);
		expect(list).toHaveFocus();
		expect(list).toHaveAttribute("aria-checked", "true");
		fireEvent.click(getByRole("radio", { name: "List view" }));
		expect(getByRole("radio", { name: "List view" })).toHaveAttribute("aria-checked", "true");
		expect(getAllByRole("radio", { checked: true })).toHaveLength(1);
	});

	it.each(["ltr", "rtl"] as const)("preserves each growing slot through a duplicate in %s", (dir) => {
		for (const preceding of [["List"], ["List", "Grid"], ["List", "Grid", "Board"]]) {
			const prefix = `root = SegmentedControl("View", [${preceding.map((label) => JSON.stringify(label)).join(", ")}, "Li`;
			const { getByRole, getAllByRole, rerender, unmount } = render(
				<div dir={dir}>
					<TensquadsRenderer stream={prefix} />
				</div>,
			);
			const group = getByRole("radiogroup");
			const growing = getByRole("radio", { name: "Li" });
			act(() => growing.focus());
			fireEvent.click(growing);
			for (const stream of [prefix + "st", prefix + 'st view"], "List view")']) {
				rerender(
					<div dir={dir}>
						<TensquadsRenderer stream={stream} />
					</div>,
				);
				expect(getByRole("radiogroup")).toBe(group);
				expect(growing).toHaveFocus();
				expect(growing).toHaveAttribute("aria-checked", "true");
				expect(growing).not.toHaveAttribute("data-disabled");
				expect(getAllByRole("radio")).toHaveLength(preceding.length + 1);
				expect(getAllByRole("radio", { checked: true })).toEqual([growing]);
				const copies = getAllByRole("radio").filter((item) => item.textContent === "List");
				expect(copies.filter((item) => !item.hasAttribute("data-disabled"))).toHaveLength(1);
			}
			expect(getByRole("radio", { name: "List view" })).toBe(growing);
			fireEvent.click(getByRole("radio", { name: "List" }));
			expect(getByRole("radio", { name: "List" })).toHaveAttribute("aria-checked", "true");
			unmount();
		}
	});

	it("keeps an unselected focused slot mounted when its label temporarily duplicates another", () => {
		const { getByRole, getAllByRole, rerender } = render(
			<TensquadsRenderer stream={'root = SegmentedControl("View", ["List", "Li'} />,
		);
		const growing = getByRole("radio", { name: "Li" });
		act(() => growing.focus());
		for (const stream of [
			'root = SegmentedControl("View", ["List", "List',
			'root = SegmentedControl("View", ["List", "List view"], "List view")',
		]) {
			rerender(<TensquadsRenderer stream={stream} />);
			expect(growing).toHaveFocus();
			expect(growing).not.toHaveAttribute("data-disabled");
			expect(getAllByRole("radio", { checked: true })).toHaveLength(1);
		}
		expect(getByRole("radio", { name: "List view" })).toBe(growing);
	});

	it("accepts distinct options with an explicit member or an omitted initial value", () => {
		for (const value of [undefined, "Grid"]) {
			expect(
				SegmentedControlOpenUI.props.safeParse({ label: "View", options: ["List", "Grid"], value }).success,
			).toBe(true);
		}
	});
});
