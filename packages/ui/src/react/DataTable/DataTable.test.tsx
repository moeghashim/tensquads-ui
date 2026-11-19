import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataTable, EntityCell } from "./DataTable.js";

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
});
