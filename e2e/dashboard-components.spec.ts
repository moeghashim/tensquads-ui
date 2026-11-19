import { expect, test } from "@playwright/test";
import { capturePreviewScreenshots, expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

for (const locale of ["en", "ar"] as const) {
	for (const theme of ["light", "dark"] as const) {
		for (const name of ["Card", "PageHeader", "StatTile"] as const) {
			test(`${name} dashboard states in ${locale} ${theme}`, async ({ page }, testInfo) => {
				const direction = locale === "ar" ? "rtl" : "ltr";
				await openPreview(page, { locale, direction, theme }, `/components/${name}`);
				const examples = page.locator(".dashboard-component-preview");
				await expect(examples).toBeVisible();
				for (const [width, columns] of [
					[1440, 2],
					[390, 2],
					[339, 1],
				] as const) {
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
						await expect(examples.locator('.ts-card--flush [data-slot="card-body"]')).toHaveCSS("padding", "0px");
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
							examples
								.locator(".ts-page-header")
								.first()
								.getByText(locale === "ar" ? "بيانات تجريبية" : "Demo data"),
						).toBeVisible();
					}
					await expectAccessible(page);
					await capturePreviewScreenshots(page, testInfo, `${name}-${locale}-${direction}-${theme}`, [width]);
				}
				await expectNoHorizontalScroll(page);
			});
		}
	}
}

for (const locale of ["en", "ar"] as const) {
	for (const theme of ["light", "dark"] as const) {
		for (const name of ["BarChart", "Bars", "Distribution"] as const) {
			test(`${name} chart states in ${locale} ${theme}`, async ({ page }, testInfo) => {
				const direction = locale === "ar" ? "rtl" : "ltr";
				await openPreview(page, { locale, direction, theme }, `/components/${name}`);
				await expect(page.locator(".component-list .ts-card")).toBeVisible();
				if (name === "BarChart") {
					const columns = page.locator(".component-list .ts-bar-chart__column");
					await expect(columns).toHaveCount(14);
					await columns.first().focus();
					await page.keyboard.press(direction === "rtl" ? "ArrowLeft" : "ArrowRight");
					await expect(columns.nth(1)).toBeFocused();
					await page.keyboard.press(direction === "rtl" ? "ArrowRight" : "ArrowLeft");
					await expect(columns.first()).toBeFocused();
					await page.locator(".component-list .ts-bar-chart").evaluate(
						(element, dir) => {
							element.setAttribute("dir", dir);
						},
						direction === "rtl" ? "ltr" : "rtl",
					);
					await page.keyboard.press(direction === "rtl" ? "ArrowRight" : "ArrowLeft");
					await expect(columns.nth(1)).toBeFocused();
					await page.keyboard.press(direction === "rtl" ? "ArrowLeft" : "ArrowRight");
					await expect(columns.first()).toBeFocused();
					await page
						.locator(".component-list .ts-bar-chart")
						.evaluate((element) => element.removeAttribute("dir"));
				}
				if (name === "Bars") await expect(page.locator(".component-list .ts-bars__row")).toHaveCount(2);
				if (name === "Distribution")
					await expect(page.locator(".component-list .ts-distribution__key li")).toHaveCount(3);
				await expectAccessible(page);
				for (const width of [1440, 390]) {
					await page.setViewportSize({ width, height: 900 });
					if (name === "BarChart") {
						if (width === 1440) {
							const last = await page.locator(".component-list .ts-bar-chart__column").last().boundingBox();
							const plot = await page.locator(".component-list .ts-bar-chart__plot").boundingBox();
							expect(last).not.toBeNull();
							expect(plot).not.toBeNull();
							if (last && plot) {
								expect(last.x).toBeGreaterThanOrEqual(plot.x);
								expect(last.x + last.width).toBeLessThanOrEqual(plot.x + plot.width);
							}
							await expect(page.locator(".component-list .ts-bar-chart__tick").last()).toHaveText(
								locale === "ar" ? "٢٨ أكتوبر" : "Oct 28",
							);
						}
						const positions = await page.locator(".component-list .ts-bar-chart").evaluate((chart) => {
							const bounds = (selector: string) =>
								Array.from(chart.querySelectorAll(selector), (element) => {
									const { x, width } = element.getBoundingClientRect();
									return { x, width };
								});
							return {
								columns: bounds(".ts-bar-chart__column"),
								ticks: bounds(".ts-bar-chart__tick"),
								marks: bounds(".ts-bar-chart__stack"),
							};
						});
						expect(positions.columns).toHaveLength(14);
						expect(positions.ticks).toHaveLength(14);
						expect(positions.marks).toHaveLength(14);
						for (const [index, column] of positions.columns.entries()) {
							expect(column.x).toBeCloseTo(positions.ticks[index]!.x, 0);
							expect(column.width).toBeCloseTo(positions.ticks[index]!.width, 0);
							const mark = positions.marks[index]!;
							expect(mark.width).toBeGreaterThan(0);
							expect(mark.width).toBeLessThanOrEqual(28);
							expect(mark.x + mark.width / 2).toBeCloseTo(column.x + column.width / 2, 0);
						}
						for (const chart of await page.locator(".ts-bar-chart").all()) {
							const clearance = await chart.evaluate((element) => {
								const viewport = element.querySelector<HTMLElement>(".ts-bar-chart__viewport")!;
								viewport.scrollTop = 0;
								const boundary = viewport.getBoundingClientRect();
								return Array.from(
									element.querySelectorAll(".ts-bar-chart__gridline > span, .ts-bar-chart__column"),
									(mark) => {
										const bounds = mark.getBoundingClientRect();
										const ring = mark.matches("button") ? 4 : 0;
										return {
											top: bounds.top - ring - boundary.top,
											bottom: boundary.bottom - bounds.bottom - ring,
										};
									},
								);
							});
							for (const mark of clearance) {
								expect(mark.top).toBeGreaterThanOrEqual(0);
								expect(mark.bottom).toBeGreaterThanOrEqual(0);
							}
						}
					}
					await capturePreviewScreenshots(page, testInfo, `${name}-${locale}-${direction}-${theme}`, [width]);
				}
				await expectNoHorizontalScroll(page);
			});
		}
	}
}
