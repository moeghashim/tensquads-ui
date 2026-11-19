import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getRegisteredComponents, TensquadsRenderer } from "../../openui";
import { PageHeader } from "./PageHeader.js";

afterEach(cleanup);

describe("PageHeader", () => {
	it("renders its title, subtitle, actions and metadata", () => {
		const { getByRole, getByText } = render(
			<PageHeader
				title="Overview"
				subtitle="Store activity"
				actions={<button type="button">Export</button>}
				meta={<span>Demo data</span>}
			/>,
		);
		expect(getByRole("heading", { level: 1, name: "Overview" })).toBeInTheDocument();
		for (const text of ["Store activity", "Export", "Demo data"]) expect(getByText(text)).toBeInTheDocument();
	});

	it("round trips English and Arabic OpenUI fixtures", () => {
		expect(getRegisteredComponents().map(({ name }) => name)).toContain("PageHeader");
		for (const [locale, label] of [
			["en", "Overview"],
			["ar", "نظرة عامة"],
		] as const) {
			const fixture = readFileSync(
				join(process.cwd(), "packages/ui/src/react/PageHeader", `PageHeader.fixture.${locale}.txt`),
				"utf8",
			);
			const onError = vi.fn();
			const { getByRole } = render(<TensquadsRenderer stream={fixture} locale={locale} onError={onError} />);
			expect(getByRole("heading", { level: 2, name: label })).toBeInTheDocument();
			expect(onError).toHaveBeenCalledWith([]);
			cleanup();
		}
	});
});
