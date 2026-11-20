import { expect, test } from "@playwright/test";
import { capturePreviewScreenshots, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

for (const locale of ["en", "ar"] as const) {
	const direction = locale === "en" ? "ltr" : "rtl";
	for (const theme of ["light", "dark"] as const) {
		test(`ThemeToggle screenshots ${locale} ${theme}`, async ({ page }, testInfo) => {
			await openPreview(page, { locale, direction, theme }, "/components/ThemeToggle");
			const name =
				locale === "en"
					? theme === "light"
						? "Switch to dark theme"
						: "Switch to light theme"
					: theme === "light"
						? "التبديل إلى المظهر الداكن"
						: "التبديل إلى المظهر الفاتح";
			await expect(page.getByRole("button", { name })).toBeVisible();
			await capturePreviewScreenshots(page, testInfo, `theme-toggle-${locale}-${direction}-${theme}`);
			await expectNoHorizontalScroll(page);
		});
	}
}

for (const query of ["", "?theme=system"]) {
	test(`ThemeToggle follows OS changes with ${query || "no theme parameter"}`, async ({ page }) => {
		await page.emulateMedia({ colorScheme: "dark" });
		await page.goto(`/components/ThemeToggle${query}`);
		await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
		await page.emulateMedia({ colorScheme: "light" });
		await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible();
		await page.emulateMedia({ colorScheme: "dark" });
		await page.getByRole("button", { name: "Switch to light theme" }).click();
		await expect(page).toHaveURL(/theme=light/);
		await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
		await page.emulateMedia({ colorScheme: "light" });
		await page.emulateMedia({ colorScheme: "dark" });
		await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible();
	});
}

test("ThemeToggle keeps the preview theme URL-driven", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/components/ThemeToggle");
	const toggle = page.getByRole("button", { name: "Switch to dark theme" });
	await expect(toggle).toBeVisible();
	expect(await toggle.boundingBox()).toMatchObject({ width: 36, height: 36 });
	await toggle.click();
	await expect(page).toHaveURL(/theme=dark/);
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
	await page.emulateMedia({ colorScheme: "dark" });
	await page.emulateMedia({ colorScheme: "light" });
	await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
});
