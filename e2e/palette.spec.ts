import { expect, test } from "@playwright/test";
import { expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

for (const locale of ["en", "ar"] as const) {
	for (const theme of ["light", "dark"] as const) {
		test(`Palette inserts by pointer and keyboard in ${locale} ${theme}`, async ({ page }) => {
			const direction = locale === "ar" ? "rtl" : "ltr";
			await openPreview(page, { locale, direction, theme }, "/components/Palette");
			const palette = page.getByRole("toolbar", { name: locale === "ar" ? "عُقد سير العمل" : "Workflow nodes" });
			const button = palette.getByRole("button", { name: locale === "ar" ? "وكيل" : "Agent" });
			await expect(palette).toHaveCSS("width", "200px");
			await expect(button).toHaveCSS("height", "40px");
			await button.click();
			await expect(page.getByRole("status")).toHaveText(locale === "ar" ? "تمت إضافة: وكيل" : "Added: Agent");
			await expect(page.locator(".palette-preview")).toHaveAttribute("data-last-source", "mouse");
			await button.focus();
			await page.keyboard.press("ArrowDown");
			await page.keyboard.press("Enter");
			await expect(page.getByRole("status")).toHaveText(locale === "ar" ? "تمت إضافة: النهاية" : "Added: End");
			await expect(page.locator(".palette-preview")).toHaveAttribute("data-last-source", "keyboard");
			await page.keyboard.press("Space");
			await page.keyboard.press("ArrowDown");
			await page.keyboard.press("Space");
			await expect(page.getByRole("status")).toHaveText(locale === "ar" ? "تمت إضافة: ملاحظة" : "Added: Note");
			await expectAccessible(page);
			await page.setViewportSize({ width: 390, height: 844 });
			await expectNoHorizontalScroll(page);
		});
	}
}
