import { expect, test } from "@playwright/test";
import { capturePreviewScreenshots, expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

const route = "/components/DateRangePicker";

for (const locale of ["en", "ar"] as const) {
	const direction = locale === "ar" ? "rtl" : "ltr";
	const triggerName = locale === "ar" ? "تاريخ البداية – تاريخ النهاية" : "Start date – End date";
	for (const theme of ["light", "dark"] as const) {
		test(`DateRangePicker ${locale} ${theme} popover and sheet`, async ({ page }, testInfo) => {
			await page.setViewportSize({ width: 1440, height: 900 });
			await openPreview(page, { locale, direction, theme }, route);
			const trigger = page.getByRole("button", { name: triggerName, exact: true });
			await trigger.click();
			const dialog = page.getByRole("dialog", { name: triggerName });
			const months = dialog.getByRole("grid");
			const day = (iso: string) => dialog.locator(`[data-slot="calendar-day"][data-value="${iso}"]`);
			await expect(months).toHaveCount(2);
			await expect(dialog).toHaveAttribute("data-presentation", "popover");
			await expect(dialog.getByRole("button", { name: locale === "ar" ? "مخصص" : "Custom" })).toHaveAttribute(
				"aria-pressed",
				"true",
			);
			await expect(day("2026-10-10")).toBeFocused();
			const firstMonth = await months.nth(0).boundingBox();
			const secondMonth = await months.nth(1).boundingBox();
			expect(
				firstMonth &&
					secondMonth &&
					(locale === "ar" ? firstMonth.x > secondMonth.x : firstMonth.x < secondMonth.x),
			).toBe(true);
			if (locale === "ar") {
				await expect(dialog.getByText("أكتوبر ٢٠٢٦", { exact: true })).toBeVisible();
				await expect(months.first().getByRole("columnheader").first()).toHaveAccessibleName(/الأحد/);
				await expect(day("2026-10-10")).toHaveText("١٠");
			}
			await expectAccessible(page);
			await capturePreviewScreenshots(page, testInfo, `DateRangePicker-${locale}-${direction}-${theme}`, [1440]);
			await page.keyboard.press("Escape");
			await expect(trigger).toBeFocused();

			await page.setViewportSize({ width: 1023, height: 900 });
			await trigger.click();
			await expect(months).toHaveCount(1);
			await expect(dialog).toHaveAttribute("data-presentation", "popover");
			await page.keyboard.press("Escape");
			await expect(dialog).toHaveCount(0);

			await expectNoHorizontalScroll(page);
			await page.setViewportSize({ width: 390, height: 900 });
			await trigger.click();
			await expect(dialog).toHaveAttribute("data-presentation", "sheet");
			await expect(months).toHaveCount(1);
			await expect(months.first()).toBeInViewport();
			await expect(dialog.getByRole("button", { name: locale === "ar" ? "تطبيق" : "Apply" })).toBeInViewport();
			await expectAccessible(page);
			await expect(page.evaluate(() => document.documentElement.scrollWidth)).resolves.toBe(390);
			await capturePreviewScreenshots(page, testInfo, `DateRangePicker-${locale}-${direction}-${theme}`, [390]);
		});
	}

	test(`DateRangePicker ${locale} keyboard navigation, cancellation and Apply`, async ({ page }) => {
		await openPreview(page, { locale, direction, theme: "light" }, route);
		const trigger = page.getByRole("button", { name: triggerName, exact: true });
		const dialog = page.getByRole("dialog", { name: triggerName });
		const day = (iso: string) => dialog.locator(`[data-slot="calendar-day"][data-value="${iso}"]`);
		await trigger.press("Enter");
		await expect(day("2026-10-10")).toBeFocused();
		await page.keyboard.press(locale === "ar" ? "ArrowLeft" : "ArrowRight");
		await expect(day("2026-10-11")).toBeFocused();
		await page.keyboard.press("PageDown");
		await expect(day("2026-11-11")).toBeFocused();
		await page.keyboard.press("Home");
		await expect(day("2026-11-08")).toBeFocused();
		await page.keyboard.press("End");
		await expect(day("2026-11-14")).toBeFocused();
		await page.keyboard.press("PageUp");
		await expect(day("2026-10-14")).toBeFocused();
		await page.keyboard.press("Enter");
		await expect(day("2026-10-14")).toHaveAttribute("data-preview");
		await expect(dialog.getByRole("button", { name: locale === "ar" ? "تطبيق" : "Apply" })).toBeDisabled();
		await page.keyboard.press("Escape");
		await expect(dialog).toHaveCount(0);
		await expect(trigger).toBeFocused();

		await trigger.press("Space");
		await expect(day("2026-10-10")).toBeFocused();
		await expect(dialog.locator("[data-preview]")).toHaveCount(0);
		for (let i = 0; i < 4; i++) await page.keyboard.press(locale === "ar" ? "ArrowLeft" : "ArrowRight");
		await expect(day("2026-10-14")).toBeFocused();
		await page.keyboard.press("Enter");
		for (let i = 0; i < 4; i++) await page.keyboard.press(locale === "ar" ? "ArrowLeft" : "ArrowRight");
		await expect(day("2026-10-18")).toBeFocused();
		await page.keyboard.press("Enter");
		const apply = dialog.getByRole("button", { name: locale === "ar" ? "تطبيق" : "Apply" });
		await apply.press("Enter");
		await expect(dialog).toHaveCount(0);
		const committed = locale === "ar" ? /١٤.*١٨/ : "Oct 14, 2026 – Oct 18, 2026";
		await expect(trigger).toHaveAccessibleDescription(committed);

		await trigger.click();
		await day("2026-10-21").click();
		await expect(day("2026-10-21")).toHaveAttribute("data-preview");
		await page.locator("#component-preview-heading").click();
		await expect(dialog).toHaveCount(0);
		await expect(trigger).toHaveAccessibleDescription(committed);
		await trigger.click();
		await expect(dialog.locator("[data-preview]")).toHaveCount(0);
	});
}
