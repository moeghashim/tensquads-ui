import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getRegisteredComponents, TensquadsRenderer } from "../../openui";
import { Distribution } from "./Distribution.js";

afterEach(cleanup);

describe("Distribution", () => {
	it("folds sorted parts after the sixth into Other", () => {
		const { getByText, getAllByRole } = render(
			<Distribution
				parts={[
					{ label: "A", value: 1 },
					{ label: "B", value: 2 },
					{ label: "C", value: 3 },
					{ label: "D", value: 4 },
					{ label: "E", value: 5 },
					{ label: "F", value: 6 },
					{ label: "G", value: 7 },
				]}
			/>,
		);
		expect(getAllByRole("listitem")).toHaveLength(6);
		expect(getByText("Other")).toBeInTheDocument();
		expect(getByText("Other").parentElement?.querySelector("strong")).toHaveTextContent("3");
	});

	it.each(["en", "ar"] as const)("fills the distribution proportionally for fractional %s values", (locale) => {
		const { container, rerender } = render(
			<div dir={locale === "ar" ? "rtl" : "ltr"}>
				<Distribution locale={locale} parts={[{ label: "A", value: 0.125 }, { label: "B", value: 0.375 }]} />
			</div>,
		);
		const weights = Array.from(container.querySelectorAll(".ts-distribution__segment"), (part) =>
			Number(getComputedStyle(part).flexGrow),
		);
		expect(weights[0]! + weights[1]!).toBeGreaterThanOrEqual(1);
		expect(weights[0]! / weights[1]!).toBeCloseTo(3);
		rerender(<Distribution locale={locale} parts={[{ label: "Zero", value: 0 }]} />);
		expect(container.querySelector(".ts-distribution__segment")).toHaveStyle({ flexGrow: "0" });
		rerender(<Distribution locale={locale} parts={[]} />);
		expect(container.querySelectorAll(".ts-distribution__segment")).toHaveLength(0);
	});

	it.each(["en", "ar"] as const)("localizes generated %s copy in React and OpenUI", (locale) => {
		const parts = [
			{ label: "A", value: 1 },
			{ label: "B", value: 2 },
			{ label: "C", value: 3 },
			{ label: "D", value: 4 },
			{ label: "E", value: 5 },
			{ label: "F", value: 6 },
			{ label: "G", value: 7 },
		];
		const { container, getByText, getAllByRole, rerender } = render(<Distribution locale={locale} parts={parts} />);
		const checkCopy = () => {
			expect(container.querySelector("p")).toHaveTextContent(locale === "ar" ? "التوزيع:" : "Distribution:");
			expect(getByText(locale === "ar" ? "أخرى" : "Other")).toBeInTheDocument();
			expect(
				Array.from(container.querySelectorAll(".ts-distribution__segment"), (segment) => segment.getAttribute("title")),
			).toEqual(["G: 7", "F: 6", "E: 5", "D: 4", "C: 3", locale === "ar" ? "أخرى: 3" : "Other: 3"]);
			for (const item of getAllByRole("listitem")) {
				expect(item).toHaveTextContent(locale === "ar" ? "من 28" : "of 28");
			}
		};
		checkCopy();
		rerender(
			<TensquadsRenderer
				locale={locale}
				stream={`root = Distribution(${JSON.stringify(parts)}, null, "${locale}")`}
			/>,
		);
		checkCopy();
	});

	it("round trips both locale fixtures", () => {
		expect(getRegisteredComponents().map(({ name }) => name)).toContain("Distribution");
		for (const locale of ["en", "ar"] as const) {
			const fixture = readFileSync(
				join(process.cwd(), "packages/ui/src/react/Distribution", `Distribution.fixture.${locale}.txt`),
				"utf8",
			);
			const onError = vi.fn();
			const { getByText, getByTitle } = render(<TensquadsRenderer stream={fixture} locale={locale} onError={onError} />);
			expect(getByText(locale === "en" ? "Run outcomes" : "نتائج التشغيل")).toBeInTheDocument();
			expect(onError).toHaveBeenCalledWith([]);
			for (const title of locale === "ar"
				? ["ناجح: 68", "فشل: 12", "تم التخطي: 5"]
				: ["Pass: 68", "Fail: 12", "Skipped: 5"]) {
				expect(getByTitle(title)).toHaveClass("ts-distribution__segment");
			}
			expect(document.querySelector(".ts-distribution__key")).toHaveTextContent(
				locale === "ar" ? "من 85" : "of 85",
			);
			cleanup();
		}
	});
});
