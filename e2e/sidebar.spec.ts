import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { capturePreviewScreenshots, expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

for (const [locale, direction, theme] of [
	["en", "ltr", "light"],
	["ar", "rtl", "dark"],
] as const) {
	test(`Sidebar navigation in ${locale} ${direction} ${theme}`, async ({ page }, testInfo) => {
		await openPreview(page, { locale, direction, theme }, "/components/Sidebar");
		await page.setViewportSize({ width: 1440, height: 900 });
		await expect(page.locator(".ts-sidebar-shell > .ts-sidebar")).toBeVisible();
		await expect(page.locator(".ts-sidebar-item--disabled")).toHaveAttribute("aria-disabled", "true");
		await expectAccessible(page);
		await capturePreviewScreenshots(page, testInfo, `Sidebar-${locale}-${direction}-${theme}`, [1440]);

		await page.setViewportSize({ width: 390, height: 844 });
		await capturePreviewScreenshots(page, testInfo, `Sidebar-${locale}-${direction}-${theme}`, [390]);
		await page.locator(".sidebar-preview").scrollIntoViewIfNeeded();
		const menu = page.getByRole("button", { name: locale === "ar" ? "فتح التنقل" : "Open navigation" });
		await menu.focus();
		await page.keyboard.press("Enter");
		const sheet = page.getByRole("dialog");
		await expect(sheet).toBeVisible();
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
