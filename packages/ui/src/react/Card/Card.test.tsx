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

	it("renders a React title and subtitle", () => {
		const { getByRole, getByText } = render(<Card title={<span>Report</span>} subtitle={<em>This week</em>} />);
		expect(getByRole("heading", { name: "Report", level: 2 })).toContainElement(
			getByText("Report", { selector: "span" }),
		);
		expect(getByText("This week", { selector: "em" }).parentElement?.tagName).toBe("P");
	});

	it.each([0, 0n])("keeps %s in the heading and subtitle", (zero) => {
		const { getByRole, getByText } = render(<Card title={zero} subtitle={zero} />);
		expect(getByRole("heading", { name: "0", level: 2 })).toBeInTheDocument();
		expect(getByText("0", { selector: "p" })).toBeInTheDocument();
	});

	it("keeps an ordinary OpenUI body without a tile grid", () => {
		const onError = vi.fn();
		const { getByText, container } = render(
			<TensquadsRenderer stream={'root = Card("Report", null, null, ["Report body"])'} onError={onError} />,
		);
		expect(getByText("Report body")).toBeInTheDocument();
		expect(container.querySelector(".ts-stat-grid")).toBeNull();
		expect(onError).toHaveBeenCalledWith([]);
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
			expect(getByText(metric).closest(".ts-stat-grid")).toBeInTheDocument();
			expect(onError).toHaveBeenCalledWith([]);
			cleanup();
		}
	});
});
