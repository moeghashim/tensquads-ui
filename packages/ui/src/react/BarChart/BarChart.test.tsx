import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getRegisteredComponents, TensquadsRenderer } from "../../openui";
import { BarChart } from "./BarChart.js";

afterEach(cleanup);

describe("BarChart", () => {
	it("scales marks from zero, highlights a range, and moves focus with arrows", () => {
		const { getByRole, getAllByRole } = render(
			<BarChart
				label="Companies"
				points={[
					{ label: "Oct 26", value: 2 },
					{ label: "Oct 27", value: 4 },
					{ label: "Oct 28", value: 3 },
				]}
				highlight={[0, 1]}
			/>,
		);
		const columns = getAllByRole("button");
		expect(columns[0]).toHaveAttribute("aria-label", "Oct 26: 2");
		expect(columns[0]).toHaveAttribute("tabindex", "0");
		expect(columns[2]).toHaveAttribute("tabindex", "-1");
		fireEvent.keyDown(columns[0]!, { key: "ArrowRight" });
		expect(columns[1]).toHaveFocus();
		expect(getByRole("button", { name: "Oct 27: 4" })).toBeInTheDocument();
		expect(document.querySelector(".ts-visually-hidden")).toHaveTextContent("Oct 26: 2, Oct 27: 4, Oct 28: 3");
	});

	it("shows tooltip label and total on focus", () => {
		const { getByRole, getByText } = render(<BarChart points={[{ label: "Oct 26", value: 3 }]} />);
		fireEvent.focus(getByRole("button", { name: "Oct 26: 3" }));
		expect(getByText("Oct 26: 3")).toBeInTheDocument();
	});

	it("renders keyed stacked series, tones, and their legend", () => {
		const { getByText, container } = render(
			<BarChart
				points={[
					{
						label: "Oct 26",
						segments: [
							{ key: "previous", value: 3 },
							{ key: "current", value: 5 },
						],
					},
				]}
				keys={[
					{ key: "previous", label: "Previous week", tone: "muted" },
					{ key: "current", label: "This week", tone: "strong" },
				]}
			/>,
		);
		expect(getByText("Previous week")).toBeInTheDocument();
		expect(getByText("This week")).toBeInTheDocument();
		expect(container.querySelectorAll(".ts-bar-chart__columns .ts-bar-chart__segment--muted")).toHaveLength(1);
		expect(container.querySelectorAll(".ts-bar-chart__columns .ts-bar-chart__segment--strong")).toHaveLength(1);
	});

	it("round trips both locale fixtures", () => {
		expect(getRegisteredComponents().map(({ name }) => name)).toContain("BarChart");
		for (const locale of ["en", "ar"] as const) {
			const fixture = readFileSync(
				join(process.cwd(), "packages/ui/src/react/BarChart", `BarChart.fixture.${locale}.txt`),
				"utf8",
			);
			const onError = vi.fn();
			const { getByText } = render(<TensquadsRenderer stream={fixture} locale={locale} onError={onError} />);
			expect(getByText(locale === "en" ? "Revenue" : "الإيرادات")).toBeInTheDocument();
			expect(onError).toHaveBeenCalledWith([]);
			cleanup();
		}
	});
});
