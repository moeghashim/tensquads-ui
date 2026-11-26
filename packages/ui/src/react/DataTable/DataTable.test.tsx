import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DataTable, EntityCell, PersonCell, StackCell, StatusCell } from "./DataTable.js";

afterEach(cleanup);

describe("DataTable", () => {
	const columns = [
		{ key: "company", label: "Company" },
		{ key: "amount", label: "Amount", align: "end" as const },
	];
	const rows = [
		{
			id: "a",
			cells: {
				company: <EntityCell initials="AC" name="Acme" detail="DS / Demo store / Reach $1M in annual sales" />,
				amount: "$149",
			},
		},
	];
	it("selects by mouse and keyboard and exposes the full detail title", () => {
		const onRowSelect = vi.fn();
		render(<DataTable caption="Companies" columns={columns} rows={rows} onRowSelect={onRowSelect} />);
		const row = screen.getByRole("row", { name: /Acme/ });
		fireEvent.click(row);
		expect(onRowSelect).toHaveBeenCalledWith("a");
		fireEvent.keyDown(row, { key: "Enter" });
		expect(onRowSelect).toHaveBeenCalledTimes(2);
		expect(screen.getByText(/Reach \$1M/)).toHaveAttribute("title", "DS / Demo store / Reach $1M in annual sales");
	});

	it("derives entity initials from the first two words", () => {
		const { getByText } = render(<EntityCell initials="No" name="Northstar Goods" detail="Store" />);
		expect(getByText("NG")).toBeInTheDocument();
	});

	it("renders an informational status as an info Badge", () => {
		render(<StatusCell label="Processing" tone="info" />);
		expect(screen.getByText("Processing")).toHaveAttribute("data-slot", "badge");
		expect(screen.getByText("Processing")).toHaveClass("ts-badge--info");
	});
	it.each(["ltr", "rtl"] as const)("preserves cell keyboard defaults and row selection in %s", (dir) => {
		const onRowSelect = vi.fn();
		render(
			<div dir={dir}>
				<DataTable
					caption="Companies"
					columns={columns}
					rows={[
						{
							id: "controls",
							cells: {
								company: <button type="button">Open company</button>,
								amount: <input aria-label="Company note" />,
							},
						},
					]}
					onRowSelect={onRowSelect}
				/>
			</div>,
		);
		const row = screen.getByRole("row", { name: /Open company/ });
		for (const control of [screen.getByRole("button"), screen.getByRole("textbox")]) {
			control.focus();
			for (const key of ["Enter", " "]) {
				expect(fireEvent.keyDown(control, { key })).toBe(true);
				expect(onRowSelect).not.toHaveBeenCalled();
			}
		}
		row.focus();
		for (const key of ["Enter", " "]) {
			onRowSelect.mockClear();
			expect(fireEvent.keyDown(row, { key })).toBe(false);
			expect(onRowSelect).toHaveBeenCalledExactlyOnceWith("controls");
		}
	});

	it("retains the full secondary text in every truncated cell helper", () => {
		render(
			<>
				<EntityCell initials="AC" name="Acme" detail="Full company description" />
				<PersonCell name="Maya" email="maya@example.com" />
				<StackCell primary="$149 / mo" secondary="Billed monthly under the company subscription" />
			</>,
		);
		for (const text of [
			"Full company description",
			"maya@example.com",
			"Billed monthly under the company subscription",
		]) {
			expect(screen.getByText(text)).toHaveAttribute("title", text);
		}
	});
});
