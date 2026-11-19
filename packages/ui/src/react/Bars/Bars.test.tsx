import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getRegisteredComponents, TensquadsRenderer } from "../../openui";
import { Bars } from "./Bars.js";

afterEach(cleanup);

describe("Bars", () => {
	it("scales progress rows and shows the caption", () => {
		const { getByText, container } = render(
			<Bars
				style="progress"
				caption="Average of 7.3 squads per company"
				rows={[
					{ label: "Growth", value: 4, display: "4 companies, 27 squads", tone: "info" },
					{ label: "Starter", value: 2, display: "2 companies, 5 squads" },
				]}
			/>,
		);
		expect(getByText("Average of 7.3 squads per company")).toBeInTheDocument();
		expect(container.querySelector(".ts-bars__fill")).toHaveStyle({ inlineSize: "100%" });
		expect(container.querySelector(".ts-bars__fill--info")).toBeInTheDocument();
	});

	it("round trips both locale fixtures", () => {
		expect(getRegisteredComponents().map(({ name }) => name)).toContain("Bars");
		for (const locale of ["en", "ar"] as const) {
			const fixture = readFileSync(
				join(process.cwd(), "packages/ui/src/react/Bars", `Bars.fixture.${locale}.txt`),
				"utf8",
			);
			const onError = vi.fn();
			const { getByText } = render(<TensquadsRenderer stream={fixture} locale={locale} onError={onError} />);
			expect(getByText(locale === "en" ? "Companies by plan" : "الشركات حسب الخطة")).toBeInTheDocument();
			expect(onError).toHaveBeenCalledWith([]);
			cleanup();
		}
	});
});
