import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { capturePreviewScreenshots, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

test("CommandPalette opens, filters, selects and passes axe in both locales and themes", async ({ page }) => {
	for (const locale of ["en", "ar"] as const) {
		for (const theme of ["light", "dark"] as const) {
			await openPreview(
				page,
				{ locale, direction: locale === "ar" ? "rtl" : "ltr", theme },
				"/components/CommandPalette",
			);
			await page.getByRole("button", { name: locale === "ar" ? "افتح البحث" : "Open search" }).click();
			const dialog = page.getByRole("dialog");
			await expect(dialog).toBeVisible();
			await expect(dialog).not.toHaveAttribute("data-starting-style");
			const paletteTop = await dialog.evaluate((element) => element.getBoundingClientRect().top);
			expect(paletteTop).toBeLessThan(120);
			const audit = await new AxeBuilder({ page }).include('[data-slot="dialog-content"]').analyze();
			expect(audit.violations).toEqual([]);
			await capturePreviewScreenshots(page, test.info(), `CommandPalette-${locale}-${theme}`);
			await expectNoHorizontalScroll(page);
			await expect(dialog).toBeVisible();
			const input = dialog.getByRole("combobox");
			await input.fill(locale === "ar" ? "المكونات" : "Components");
			await expect(dialog.getByText(locale === "ar" ? "المكوّنات" : "Components", { exact: true })).toBeVisible();
			await page.keyboard.press("ArrowDown");
			await page.keyboard.press("Enter");
			await expect(dialog).toHaveCount(0);
		}
	}
});

test("site shortcut finds a component and navigates to its page", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "dark" }, "/");
	const shortcut = await page.evaluate(() =>
		/Mac|iPhone|iPad|iPod/.test(navigator.platform) ? "Meta+k" : "Control+k",
	);
	await page.keyboard.press(shortcut);
	const dialog = page.getByRole("dialog", { name: "Search" });
	await expect(dialog).toBeVisible();
	await dialog.getByRole("combobox").fill("Toolbar");
	await page.keyboard.press("Enter");
	await expect(page).toHaveURL(/\/components\/Toolbar\?/);
});

test("CommandPalette closes on a backdrop press and returns focus", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/components/CommandPalette");
	const trigger = page.getByRole("button", { name: "Open search" });
	await trigger.click();
	await expect(page.getByRole("dialog")).toBeVisible();
	await page.locator('[data-slot="dialog-backdrop"]').click({ position: { x: 10, y: 10 } });
	await expect(page.getByRole("dialog")).toHaveCount(0);
	await expect(trigger).toBeFocused();
});

test("CommandPalette filters keywords, handles no matches and closes a search on the first Escape", async ({
	page,
}) => {
	for (const locale of ["en", "ar"] as const) {
		await openPreview(
			page,
			{ locale, direction: locale === "ar" ? "rtl" : "ltr", theme: "dark" },
			"/components/CommandPalette",
		);
		const trigger = page.getByRole("button", { name: locale === "ar" ? "افتح البحث" : "Open search" });
		await trigger.click();
		const dialog = page.getByRole("dialog");
		const input = dialog.getByRole("combobox");
		await expect(input).toBeFocused();
		await input.fill("dark");
		await expect(dialog.getByRole("group")).toHaveCount(1);
		await expect(
			dialog.getByRole("option", { name: locale === "ar" ? "تغيير السمة" : "Change theme" }),
		).toBeVisible();
		await input.fill("zzq-no-such-command-9876");
		await expect(dialog.getByRole("option")).toHaveCount(0);
		await expect(dialog.getByRole("group")).toHaveCount(0);
		await expect(dialog.getByText(locale === "ar" ? "لا توجد نتائج" : "No matches", { exact: true })).toBeVisible();
		await page.keyboard.press("Enter");
		await expect(dialog).toBeVisible();
		await page.keyboard.press("Escape");
		await expect(dialog).toHaveCount(0);
		await expect(trigger).toBeFocused();
		await trigger.click();
		await expect(input).toHaveValue("");
		await expect(dialog.getByRole("option")).toHaveCount(4);
		await page.keyboard.press("Escape");
	}
});
