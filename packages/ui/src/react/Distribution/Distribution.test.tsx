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

	it("round trips both locale fixtures", () => {
		expect(getRegisteredComponents().map(({ name }) => name)).toContain("Distribution");
		for (const locale of ["en", "ar"] as const) {
			const fixture = readFileSync(
				join(process.cwd(), "packages/ui/src/react/Distribution", `Distribution.fixture.${locale}.txt`),
				"utf8",
			);
			const onError = vi.fn();
			const { getByText } = render(<TensquadsRenderer stream={fixture} locale={locale} onError={onError} />);
			expect(getByText(locale === "en" ? "Run outcomes" : "نتائج التشغيل")).toBeInTheDocument();
			expect(onError).toHaveBeenCalledWith([]);
			cleanup();
		}
	});
});
