import { expect, test } from "@playwright/test";
import { capturePreviewScreenshots, expectAccessible, openPreview } from "./helpers/preview";

for (const locale of ["en", "ar"] as const) {
	const direction = locale === "ar" ? "rtl" : "ltr";
	for (const theme of ["light", "dark"] as const) {
		test(`Toolbar preview ${locale} ${theme}`, async ({ page }, testInfo) => {
			await openPreview(page, { locale, direction, theme }, "/components/Toolbar");
			const toolbar = page.getByRole("toolbar");
			await expect(toolbar).toBeVisible();
			await expect(toolbar.getByRole("button", { name: locale === "ar" ? "تحريك اللوحة" : "Pan" })).toHaveAttribute(
				"aria-pressed",
				"true",
			);
			await expect(toolbar.getByRole("button", { name: locale === "ar" ? "إعادة" : "Redo" })).toHaveAttribute(
				"aria-disabled",
				"true",
			);
			await expectAccessible(page);
			await capturePreviewScreenshots(page, testInfo, `Toolbar-${locale}-${direction}-${theme}`);
		});
	}
}

test("Toolbar demo modes are exclusive and activate history", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/components/Toolbar");
	const toolbar = page.getByRole("toolbar", { name: "Canvas tools" });
	const pan = toolbar.getByRole("button", { name: "Pan" });
	const select = toolbar.getByRole("button", { name: "Select" });
	await select.click();
	await expect(select).toHaveAttribute("aria-pressed", "true");
	await expect(pan).toHaveAttribute("aria-pressed", "false");
	await expect(toolbar.getByRole("button", { name: "Undo" })).toBeEnabled();
});
