import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SegmentedControl, SegmentedControlIndicator, SegmentedControlItem } from "./SegmentedControl.js";

function Example({
	dir = "ltr",
	onValueChange = vi.fn(),
}: {
	dir?: "ltr" | "rtl";
	onValueChange?: (value: string | null, details: unknown) => void;
}) {
	return (
		<div dir={dir}>
			<SegmentedControl aria-label="View" defaultValue="list" onValueChange={onValueChange}>
				<SegmentedControlIndicator />
				<SegmentedControlItem value="list">List</SegmentedControlItem>
				<SegmentedControlItem value="grid">Grid</SegmentedControlItem>
				<SegmentedControlItem value="board" disabled>
					Board
				</SegmentedControlItem>
			</SegmentedControl>
		</div>
	);
}

afterEach(cleanup);

describe("SegmentedControl", () => {
	it("preserves SDK parts, names, selection, disabled state, render and callbacks", () => {
		const onValueChange = vi.fn();
		const { getByRole, getByText } = render(<Example onValueChange={onValueChange} />);
		const group = getByRole("radiogroup", { name: "View" });
		expect(group).toHaveAttribute("data-slot", "segmented-control");
		expect(getByRole("radio", { name: "List" })).toHaveAttribute("data-checked");
		expect(getByRole("radio", { name: "Board" })).toHaveAttribute("data-disabled");
		expect(group.querySelector('[data-slot="segmented-control-indicator"]')).toBeInTheDocument();
		fireEvent.click(getByText("Grid"));
		expect(onValueChange).toHaveBeenCalledWith("grid", expect.objectContaining({ reason: "item-press" }));
	});

	it.each(["ltr", "rtl"] as const)("moves to the next item with the direction-aware arrow key in %s", (dir) => {
		const onValueChange = vi.fn();
		const { getByRole } = render(<Example dir={dir} onValueChange={onValueChange} />);
		const selected = getByRole("radio", { name: "List" });
		selected.focus();
		fireEvent.keyDown(selected, { key: dir === "ltr" ? "ArrowRight" : "ArrowLeft" });
		expect(onValueChange).toHaveBeenCalledWith("grid", expect.objectContaining({ reason: "list-navigation" }));
	});

	it("supports value control and item render props", () => {
		const { getByRole } = render(
			<SegmentedControl aria-label="Layout" value="cards">
				<SegmentedControlIndicator />
				<SegmentedControlItem value="cards" render={<button type="button" data-testid="cards" />}>
					Cards
				</SegmentedControlItem>
			</SegmentedControl>,
		);
		expect(getByRole("radio", { name: "Cards" })).toHaveAttribute("data-checked");
		expect(getByRole("radio", { name: "Cards" })).toHaveAttribute("data-testid", "cards");
	});
});
