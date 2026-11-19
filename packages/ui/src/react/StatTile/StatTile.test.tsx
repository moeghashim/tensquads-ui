import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getRegisteredComponents, TensquadsRenderer } from "../../openui";
import { StatTile } from "./StatTile.js";

afterEach(cleanup);

describe("StatTile", () => {
	it("renders every metric part and a sparkline with a useful name", () => {
		const { getByText, getByRole } = render(
			<StatTile
				label="Revenue"
				value="$24.8k"
				glyph="◷"
				unit="USD"
				delta={{ text: "+12% vs last week", tone: "positive" }}
				foot="Compared with last week"
				series={[3, 5, 4]}
			/>,
		);
		for (const text of ["Revenue", "$24.8k", "USD", "+12% vs last week", "Compared with last week"])
			expect(getByText(text)).toBeInTheDocument();
		expect(getByRole("img", { name: "Revenue trend" })).toBeInTheDocument();
	});

	it.each(["positive", "negative", "neutral"] as const)("styles %s delta text", (tone) => {
		const { getByText } = render(
			<StatTile label="Orders" value="42" delta={{ text: "Compared", tone }} series={null} />,
		);
		expect(getByText("Compared")).toHaveClass(`ts-stat-tile__delta--${tone}`);
		expect(document.querySelector("svg")).toBeNull();
	});

	it("round trips English and Arabic OpenUI fixtures", () => {
		expect(getRegisteredComponents().map(({ name }) => name)).toContain("StatTile");
		for (const [locale, label] of [
			["en", "Revenue"],
			["ar", "الإيرادات"],
		] as const) {
			const fixture = readFileSync(
				join(process.cwd(), "packages/ui/src/react/StatTile", `StatTile.fixture.${locale}.txt`),
				"utf8",
			);
			const onError = vi.fn();
			const { getByText } = render(<TensquadsRenderer stream={fixture} locale={locale} onError={onError} />);
			expect(getByText(label)).toBeInTheDocument();
			expect(onError).toHaveBeenCalledWith([]);
			cleanup();
		}
	});
});
