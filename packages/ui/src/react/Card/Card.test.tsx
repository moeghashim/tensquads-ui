import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getRegisteredComponents, TensquadsRenderer } from "../../openui";
import { Card } from "./Card.js";

afterEach(cleanup);

describe("Card", () => {
	it("renders its heading, count, actions, legend, body and footer", () => {
		const { getByText, getByTestId } = render(
			<Card
				title="Open orders"
				subtitle="This week"
				count="3"
				actions={<button type="button">Filter</button>}
				legend={[{ label: "Complete", value: "8" }]}
				footer="View all"
				data-testid="card"
			>
				Body
			</Card>,
		);
		expect(getByTestId("card")).toHaveAttribute("data-slot", "card");
		for (const text of ["Open orders", "This week", "3", "Filter", "Complete", "8", "Body", "View all"])
			expect(getByText(text)).toBeInTheDocument();
	});

	it("supports inset and flush variants", () => {
		const { getByTestId } = render(
			<Card variant="inset" flush data-testid="card">
				Rows
			</Card>,
		);
		expect(getByTestId("card")).toHaveAttribute("data-variant", "inset");
		expect(getByTestId("card")).toHaveClass("ts-card--flush");
	});

	it("round trips English and Arabic OpenUI fixtures", () => {
		expect(getRegisteredComponents().map(({ name }) => name)).toContain("Card");
		for (const [locale, label, metric] of [
			["en", "Revenue", "Orders"],
			["ar", "الإيرادات", "الطلبات"],
		] as const) {
			const fixture = readFileSync(
				join(process.cwd(), "packages/ui/src/react/Card", `Card.fixture.${locale}.txt`),
				"utf8",
			);
			const onError = vi.fn();
			const { getByRole, getByText } = render(
				<TensquadsRenderer stream={fixture} locale={locale} onError={onError} />,
			);
			expect(getByRole("heading", { name: label })).toBeInTheDocument();
			expect(getByText(metric)).toBeInTheDocument();
			expect(onError).toHaveBeenCalledWith([]);
			cleanup();
		}
	});
});
