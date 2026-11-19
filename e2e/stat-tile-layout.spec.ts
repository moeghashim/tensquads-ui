import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StatTile } from "../packages/ui/src/react/StatTile/StatTile";

for (const locale of ["en", "ar"] as const) {
	for (const theme of ["light", "dark"] as const) {
		test(`StatTile values and trends stay separate in ${locale} ${theme}`, async ({ page }) => {
			const tiles = Array.from({ length: 6 }, (_, index) =>
				renderToStaticMarkup(
					createElement(StatTile, {
						label: locale === "ar" ? "الإيرادات" : "Revenue",
						value: locale === "ar" ? "٢٤٬٨٦٠" : "$14,568",
						unit: index % 2 === 0 ? (locale === "ar" ? "ر.س" : "SAR") : undefined,
						series: [3, 7, 4, 9],
					}),
				),
			).join("");
			await page.setContent(
				`<html lang="${locale}" dir="${locale === "ar" ? "rtl" : "ltr"}" data-theme="${theme}"><body><div class="ts-stat-grid">${tiles}</div></body></html>`,
			);
			await page.addStyleTag({ content: readFileSync("packages/ui/src/tokens/tokens.css", "utf8") });
			await page.addStyleTag({ content: readFileSync("packages/ui/src/styles/stat-tile.css", "utf8") });
			// Task 001 requires six, three, two and one columns, with readable values and 112×32 trends.
			for (const [width, columns] of [
				[1440, 6],
				[1180, 3],
				[760, 2],
				[480, 2],
				[390, 2],
				[339, 1],
			] as const) {
				await page.setViewportSize({ width, height: 900 });
				const grid = page.locator(".ts-stat-grid");
				expect(
					await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length),
				).toBe(columns);
				for (const tile of await grid.getByRole("article").all()) {
					const value = await tile.locator(".ts-stat-tile__value").boundingBox();
					const trend = await tile.getByRole("img").boundingBox();
					expect(value).not.toBeNull();
					expect(trend).not.toBeNull();
					if (!value || !trend) throw new Error("Missing value or trend");
					const tileBox = await tile.boundingBox();
					expect(tileBox).not.toBeNull();
					if (tileBox) {
						expect(value.x).toBeGreaterThanOrEqual(tileBox.x);
						expect(value.x + value.width).toBeLessThanOrEqual(tileBox.x + tileBox.width);
					}
					expect(trend.width).toBe(112);
					expect(trend.height).toBe(32);
					expect(
						value.x + value.width <= trend.x ||
							trend.x + trend.width <= value.x ||
							value.y + value.height <= trend.y ||
							trend.y + trend.height <= value.y,
						`Value and trend overlap at ${width}px`,
					).toBe(true);
				}
				expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
			}
		});
	}
}
