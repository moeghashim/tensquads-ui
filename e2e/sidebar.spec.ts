import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { capturePreviewScreenshots, expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

for (const [locale, direction, theme] of [
	["en", "ltr", "light"],
	["en", "ltr", "dark"],
	["ar", "rtl", "light"],
	["ar", "rtl", "dark"],
] as const) {
	test(`Sidebar navigation in ${locale} ${direction} ${theme}`, async ({ page }, testInfo) => {
		await openPreview(page, { locale, direction, theme }, "/components/Sidebar");
		await page.setViewportSize({ width: 1440, height: 900 });
		await expect(page.locator(".ts-sidebar-shell > .ts-sidebar")).toBeVisible();
		await expect(page.locator(".ts-sidebar-item--disabled")).toHaveAttribute("aria-disabled", "true");
		const desktopNav = page.locator(".ts-sidebar-shell > .ts-sidebar");
		const overviewName = locale === "ar" ? "نظرة عامة" : "Overview";
		const companiesName = locale === "ar" ? "الشركات 8" : "Companies 8";
		const squadsName = locale === "ar" ? "الفرق" : "Squads";
		const overview = desktopNav.getByRole("button", { name: overviewName, exact: true });
		const companies = desktopNav.getByRole("button", { name: companiesName, exact: true });
		const squads = desktopNav.getByRole("link", { name: squadsName, exact: true });
		await overview.focus();
		await page.keyboard.press("Tab");
		await expect(companies).toBeFocused();
		await page.keyboard.press("Tab");
		await expect(squads).toBeFocused();
		await page.keyboard.press("Tab");
		await expect.poll(() => desktopNav.evaluate((nav) => nav.contains(document.activeElement))).toBe(false);
		await page.keyboard.press("Shift+Tab");
		await expect(squads).toBeFocused();
		await page.keyboard.press("Shift+Tab");
		await expect(companies).toBeFocused();
		await page.keyboard.press("Shift+Tab");
		await expect(overview).toBeFocused();
		await expectAccessible(page);
		await capturePreviewScreenshots(page, testInfo, `Sidebar-${locale}-${direction}-${theme}`, [1440]);

		await page.setViewportSize({ width: 390, height: 844 });
		await expect(desktopNav).toBeHidden();
		await capturePreviewScreenshots(page, testInfo, `Sidebar-${locale}-${direction}-${theme}`, [390]);
		await page.locator(".sidebar-preview").scrollIntoViewIfNeeded();
		const menu = page.getByRole("button", { name: locale === "ar" ? "فتح التنقل" : "Open navigation" });
		await menu.focus();
		await page.keyboard.press("Enter");
		const sheet = page.getByRole("dialog");
		await expect(sheet).toBeVisible();
		await expect(sheet.getByRole("button", { name: overviewName, exact: true })).toBeFocused();
		await expect
			.poll(async () => {
				const bounds = await sheet.boundingBox();
				if (!bounds) return Number.POSITIVE_INFINITY;
				return Math.abs(direction === "rtl" ? bounds.x + bounds.width - 390 : bounds.x);
			})
			.toBeLessThanOrEqual(1);
		await page.keyboard.press("Tab");
		await expect(sheet.getByRole("button", { name: companiesName, exact: true })).toBeFocused();
		await page.keyboard.press("Tab");
		await expect(sheet.getByRole("link", { name: squadsName, exact: true })).toBeFocused();
		await page.keyboard.press("Tab");
		await expect(sheet.getByRole("button", { name: overviewName, exact: true })).toBeFocused();
		await page.keyboard.press("Shift+Tab");
		await expect(sheet.getByRole("link", { name: squadsName, exact: true })).toBeFocused();
		await expect(
			sheet.getByRole("navigation", { name: locale === "ar" ? "التنقل الجانبي" : "Main navigation" }),
		).toBeVisible();
		await expectAccessible(page);
		const openScreenshot = await page.screenshot({ animations: "disabled", caret: "hide", fullPage: false });
		const screenshotDirectory = join(process.cwd(), "test-results", "screenshots");
		await mkdir(screenshotDirectory, { recursive: true });
		const openFilename = `Sidebar-${locale}-${direction}-${theme}-open-390.png`;
		await writeFile(join(screenshotDirectory, openFilename), openScreenshot);
		await testInfo.attach(openFilename, { body: openScreenshot, contentType: "image/png" });
		const sheetScreenshot = await sheet.screenshot();
		await writeFile(join(screenshotDirectory, `Sidebar-${locale}-${direction}-${theme}-sheet.png`), sheetScreenshot);
		await page.keyboard.press("Escape");
		await expect(menu).toBeFocused();
		await expectNoHorizontalScroll(page);
	});
}
