import { expect, test } from "@playwright/test";
import {
	capturePreviewScreenshots,
	expectAccessible,
	expectNoHorizontalScroll,
	openPreview,
} from "./helpers/preview";

for (const locale of ["en", "ar"] as const) {
	for (const theme of ["light", "dark"] as const) {
		for (const name of ["Card", "PageHeader", "StatTile"] as const) {
			test(`${name} dashboard states in ${locale} ${theme}`, async ({ page }, testInfo) => {
				const direction = locale === "ar" ? "rtl" : "ltr";
				await openPreview(page, { locale, direction, theme }, `/components/${name}`);
				const examples = page.locator(".dashboard-component-preview");
				await expect(examples).toBeVisible();
				for (const [width, columns] of [[1440, 2], [390, 1]] as const) {
					await page.setViewportSize({ width, height: 900 });
					if (name === "Card" || name === "StatTile") {
						const grid = examples.locator(".ts-stat-grid").first();
						await expect(grid).toHaveCSS("display", "grid");
						expect(
							await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length),
						).toBe(columns);
						const tiles = grid.locator('[data-slot="stat-tile"]');
						const first = await tiles.nth(0).boundingBox();
						const second = await tiles.nth(1).boundingBox();
						expect(first).not.toBeNull();
						expect(second).not.toBeNull();
						if (first && second) {
							if (columns === 1) expect(second.y).toBeGreaterThan(first.y);
							else {
								expect(second.y).toBeCloseTo(first.y, 0);
								if (direction === "rtl") expect(second.x).toBeLessThan(first.x);
								else expect(second.x).toBeGreaterThan(first.x);
							}
						}
					}
					if (name === "Card") {
						await expect(examples.locator('.ts-card[data-variant="inset"]')).toBeVisible();
						await expect(examples.locator('.ts-card--flush [data-slot="card-body"]')).toHaveCSS(
							"padding",
							"0px",
						);
					} else if (name === "StatTile") {
						const tiles = examples.locator(".ts-stat-grid > article");
						await expect(tiles).toHaveCount(6);
						await expect(tiles.last().getByRole("img")).toHaveCount(0);
						await expect(tiles.first().getByRole("img")).toHaveAccessibleName(
							locale === "ar" ? "الإيرادات" : "Revenue",
						);
						await expect(tiles.first().locator(".ts-stat-tile__delta")).toHaveText(
							locale === "ar" ? "+١٢٪ مقارنة بالأسبوع الماضي" : "+12% vs last week",
						);
						await expect(tiles.nth(1).locator(".ts-stat-tile__delta")).toHaveText(
							locale === "ar" ? "−٢٫١٪ مقارنة بالأسبوع الماضي" : "−2.1% vs last week",
						);
					} else {
						await expect(
							examples.getByRole("button", { name: locale === "ar" ? "تصدير التقرير" : "Export report" }),
						).toBeVisible();
						await expect(
							examples.locator(".ts-page-header").first().getByText(locale === "ar" ? "بيانات تجريبية" : "Demo data"),
						).toBeVisible();
					}
					await capturePreviewScreenshots(page, testInfo, `${name}-${locale}-${direction}-${theme}`, [width]);
					await expectAccessible(page);
				}
				await expectNoHorizontalScroll(page);
			});
		}
	}
}
