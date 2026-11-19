import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BarChart } from "../packages/ui/src/react/BarChart/BarChart";

for (const direction of ["ltr", "rtl"] as const) {
	test(`BarChart reserves formatted axis space in ${direction}`, async ({ page }) => {
		const chart = renderToStaticMarkup(
			createElement(BarChart, {
				points: [
					{ label: "A", value: 6000 },
					{ label: "B", value: 10000 },
				],
				formatValue: (value) =>
					new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value),
			}),
		);
		await page.setContent(`<html dir="${direction}"><body>${chart}</body></html>`);
		await page.addStyleTag({ content: readFileSync("packages/ui/src/tokens/tokens.css", "utf8") });
		await page.addStyleTag({ content: readFileSync("packages/ui/src/styles/data-charts.css", "utf8") });
		await expect(page.locator(".ts-bar-chart__gridline").first()).toHaveText("$10,000.00");
		for (const width of [1440, 390]) {
			await page.setViewportSize({ width, height: 900 });
			const layout = await page.locator(".ts-bar-chart").evaluate((element) => {
				const bounds = (selector: string) =>
					Array.from(element.querySelectorAll(selector), (item) => {
						const { left, right } = item.getBoundingClientRect();
						return { left, right };
					});
				return {
					viewport: bounds(".ts-bar-chart__viewport")[0]!,
					labels: bounds(".ts-bar-chart__gridline > span"),
					columns: bounds(".ts-bar-chart__column"),
					ticks: bounds(".ts-bar-chart__tick"),
				};
			});
			for (const label of layout.labels) {
				expect(label.left).toBeGreaterThanOrEqual(layout.viewport.left);
				expect(label.right).toBeLessThanOrEqual(layout.viewport.right);
				for (const column of layout.columns) {
					expect(label.right <= column.left || label.left >= column.right).toBe(true);
				}
			}
			for (const [index, column] of layout.columns.entries()) {
				expect(column.left).toBeCloseTo(layout.ticks[index]!.left, 1);
				expect(column.right).toBeCloseTo(layout.ticks[index]!.right, 1);
			}
		}
	});
}
