import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getRegisteredComponents, TensquadsRenderer } from "../../openui";
import { BarChart } from "./BarChart.js";

afterEach(cleanup);

describe("BarChart", () => {
	it.each(["en", "ar"] as const)("keeps date slots and thins long-series labels in %s", (locale) => {
		for (const length of [14, 15, 30]) {
			const points = Array.from({ length }, (_, index) => ({ label: `Day ${index + 1}`, value: 1 }));
			const stream = `root = BarChart(${JSON.stringify(points)}, [], null, null, "${locale}")`;
			for (const chart of [
				<BarChart key="react" points={points} locale={locale} />,
				<TensquadsRenderer key="openui" stream={stream} locale={locale} />,
			]) {
				const { container, getAllByRole, unmount } = render(
					<div dir={locale === "ar" ? "rtl" : "ltr"}>{chart}</div>,
				);
				const ticks = Array.from(container.querySelectorAll(".ts-bar-chart__tick"));
				expect(ticks).toHaveLength(length);
				expect(ticks.filter((tick) => tick.textContent).map((tick) => tick.textContent)).toEqual(
					length === 14
						? points.map((point) => point.label)
						: length === 15
							? ["Day 1", "Day 6", "Day 11"]
							: ["Day 1", "Day 6", "Day 11", "Day 16", "Day 21", "Day 26"],
				);
				expect(getAllByRole("button").map((column) => column.getAttribute("aria-label"))).toEqual(
					points.map((point) => `${point.label}: ${locale === "ar" ? "١" : "1"}`),
				);
				unmount();
			}
		}
	});

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

	it.each(["ltr", "rtl"] as const)("uses whole-number nice ticks for integer data in %s", (dir) => {
		for (const points of [
			[
				{ label: "A", value: 2 },
				{ label: "B", value: 3 },
			],
			[
				{
					label: "A",
					segments: [
						{ key: "one", value: 1 },
						{ key: "two", value: 1 },
					],
				},
				{
					label: "B",
					segments: [
						{ key: "one", value: 1 },
						{ key: "two", value: 2 },
					],
				},
			],
		]) {
			const { container, getByRole, unmount } = render(
				<div dir={dir}>
					<BarChart locale={dir === "rtl" ? "ar" : "en"} points={points} />
				</div>,
			);
			expect(Array.from(container.querySelectorAll(".ts-bar-chart__gridline"), (tick) => tick.textContent)).toEqual(
				dir === "rtl" ? ["٤", "٢", "٠"] : ["4", "2", "0"],
			);
			const smaller = getByRole("button", { name: dir === "rtl" ? "A: ٢" : "A: 2" }).querySelector<HTMLElement>(
				".ts-bar-chart__stack",
			);
			expect(Number.parseFloat(smaller!.style.blockSize)).toBeCloseTo(50, 3);
			expect(
				getByRole("button", { name: dir === "rtl" ? "B: ٣" : "B: 3" }).querySelector(".ts-bar-chart__stack"),
			).toHaveStyle({
				blockSize: "75%",
			});
			unmount();
		}
	});

	it("uses a custom formatter for ticks, tooltip values, and the summary", () => {
		const formatValue = (value: number) => `$${value.toFixed(2)}`;
		const { container, getByRole, getByText } = render(
			<BarChart points={[{ label: "Today", value: 3 }]} formatValue={formatValue} />,
		);
		expect(Array.from(container.querySelectorAll(".ts-bar-chart__gridline"), (tick) => tick.textContent)).toEqual([
			"$4.00",
			"$2.00",
			"$0.00",
		]);
		fireEvent.focus(getByRole("button", { name: "Today: $3.00" }));
		expect(getByText("Today: $3.00")).toBeInTheDocument();
		expect(container.querySelector(".ts-visually-hidden")).toHaveTextContent("Chart: Today: $3.00");
	});

	it("labels every point through 14 and every fifth point beyond 14", () => {
		const points = Array.from({ length: 15 }, (_, index) => ({ label: `Day ${index + 1}`, value: index + 1 }));
		const { container, rerender } = render(<BarChart points={points.slice(0, 14)} />);
		const tickLabels = () =>
			Array.from(container.querySelectorAll(".ts-bar-chart__tick"), (tick) => tick.textContent);
		expect(tickLabels()).toEqual(points.slice(0, 14).map(({ label }) => label));
		rerender(<BarChart points={points} />);
		expect(tickLabels()).toEqual(["Day 1", "", "", "", "", "Day 6", "", "", "", "", "Day 11", "", "", "", ""]);
	});

	it.each(["en", "ar"] as const)("allocates the full fractional stack in %s", (locale) => {
		const { container, getByRole } = render(
			<div dir={locale === "ar" ? "rtl" : "ltr"}>
				<BarChart
					locale={locale}
					points={[
						{ label: "Quarter", value: 0.25 },
						{ label: "Half", value: 0.5 },
						{
							label: "Stacked",
							segments: [
								{ key: "a", value: 0.125 },
								{ key: "b", value: 0.375 },
							],
						},
						{ label: "Zero", value: 0 },
					]}
				/>
			</div>,
		);
		for (const [name, height] of [
			[locale === "ar" ? "Quarter: ٠٫٢٥" : "Quarter: 0.25", "25%"],
			[locale === "ar" ? "Half: ٠٫٥" : "Half: 0.5", "50%"],
		] as const) {
			const stack = getByRole("button", { name }).querySelector<HTMLElement>(".ts-bar-chart__stack")!;
			expect(stack).toHaveStyle({ blockSize: height });
			expect(Number(getComputedStyle(stack.firstElementChild!).flexGrow)).toBeGreaterThanOrEqual(1);
		}
		const stacked = getByRole("button", { name: locale === "ar" ? "Stacked: ٠٫٥" : "Stacked: 0.5" });
		expect(stacked.querySelector(".ts-bar-chart__stack")).toHaveStyle({ blockSize: "50%" });
		const weights = Array.from(stacked.querySelectorAll(".ts-bar-chart__segment"), (part) =>
			Number(getComputedStyle(part).flexGrow),
		);
		expect(weights[0]! + weights[1]!).toBeGreaterThanOrEqual(1);
		expect(weights[1]! / weights[0]!).toBeCloseTo(3);
		expect(
			getByRole("button", { name: locale === "ar" ? "Zero: ٠" : "Zero: 0" }).querySelectorAll(
				".ts-bar-chart__segment",
			),
		).toHaveLength(0);
		expect(container.querySelectorAll(".ts-bar-chart__segment")).toHaveLength(4);
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

	it("keeps zero marks empty in scalar and stacked columns", () => {
		const { getByRole } = render(
			<BarChart
				points={[
					{ label: "Zero", value: 0 },
					{
						label: "Empty stack",
						segments: [
							{ key: "a", value: 0 },
							{ key: "b", value: 0 },
						],
					},
					{
						label: "Mixed",
						segments: [
							{ key: "a", value: 0 },
							{ key: "b", value: 4 },
						],
					},
				]}
			/>,
		);
		for (const name of ["Zero: 0", "Empty stack: 0"]) {
			const stack = getByRole("button", { name }).querySelector(".ts-bar-chart__stack");
			expect(stack).toHaveStyle({ blockSize: "0%" });
			expect(stack?.children).toHaveLength(0);
		}
		const mixed = getByRole("button", { name: "Mixed: 4" });
		expect(mixed.querySelector(".ts-bar-chart__stack")).toHaveStyle({ blockSize: "100%" });
		expect(mixed.querySelectorAll(".ts-bar-chart__segment")).toHaveLength(1);
		fireEvent.focus(mixed);
		expect(document.body).toHaveTextContent("a: 0");
	});

	it("retains one tab stop after shrinking, emptying and growing points", () => {
		const points = Array.from({ length: 14 }, (_, index) => ({ label: `Day ${index}`, value: index }));
		const { getAllByRole, rerender } = render(<BarChart points={points} />);
		fireEvent.focus(getAllByRole("button")[13]!);
		rerender(<BarChart points={points.slice(0, 7)} />);
		let columns = getAllByRole("button");
		expect(columns.filter((column) => column.tabIndex === 0)).toEqual([columns[6]]);
		fireEvent.keyDown(columns[6]!, { key: "ArrowLeft" });
		expect(columns[5]).toHaveFocus();
		rerender(<BarChart points={[]} />);
		rerender(<BarChart points={points.slice(0, 2)} />);
		columns = getAllByRole("button");
		expect(columns.filter((column) => column.tabIndex === 0)).toEqual([columns[1]]);
		fireEvent.keyDown(columns[1]!, { key: "ArrowLeft" });
		expect(columns[0]).toHaveFocus();
	});

	it.each(["en", "ar"] as const)("localizes the default %s summary in React and OpenUI", (locale) => {
		const label = locale === "ar" ? "رسم بياني" : "Chart";
		const { container, rerender } = render(<BarChart locale={locale} points={[{ label: "A", value: 1 }]} />);
		expect(container.querySelector(".ts-visually-hidden")).toHaveTextContent(
			`${label}: A: ${locale === "ar" ? "١" : "1"}`,
		);
		rerender(
			<TensquadsRenderer
				locale={locale}
				stream={`root = BarChart([{label: "A", value: 1}], [], null, null, "${locale}")`}
			/>,
		);
		expect(container.querySelector(".ts-visually-hidden")).toHaveTextContent(
			`${label}: A: ${locale === "ar" ? "١" : "1"}`,
		);
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
