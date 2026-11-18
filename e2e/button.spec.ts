import { expect, test } from "@playwright/test";
import {
	capturePreviewScreenshots,
	expectAccessible,
	expectNoHorizontalScroll,
	expectThemeFocusRing,
	openPreview,
	type PreviewState,
} from "./helpers/preview";

const states: PreviewState[] = [
	{ locale: "en", direction: "ltr", theme: "light" },
	{ locale: "en", direction: "ltr", theme: "dark" },
	{ locale: "ar", direction: "rtl", theme: "light" },
	{ locale: "ar", direction: "rtl", theme: "dark" },
];

test("Button previews variants, sizes, and interaction states", async ({ page }, testInfo) => {
	for (const state of states) {
		await openPreview(page, state, "/components/Button");
		await expect(page.getByRole("heading", { name: "Button" })).toBeVisible();
		await expect(page.locator('[data-slot="button"]')).toHaveCount(31);
		await expect(page.getByRole("button", { name: state.locale === "ar" ? "إضافة" : "Add" })).toHaveCount(5);
		await expect(page.locator('[data-slot="button"][data-disabled]')).toHaveCount(5);
		const first = page.getByRole("button", { name: state.locale === "ar" ? "متابعة" : "Continue" }).first();
		await page.evaluate(() => {
			(window as typeof window & { buttonActivationCount?: number }).buttonActivationCount = 0;
			document.addEventListener("click", () => {
				const target = window as typeof window & { buttonActivationCount?: number };
				target.buttonActivationCount = (target.buttonActivationCount ?? 0) + 1;
			});
		});
		await first.focus();
		await page.keyboard.press("Enter");
		expect(
			await page.evaluate(
				() => (window as typeof window & { buttonActivationCount?: number }).buttonActivationCount,
			),
		).toBe(1);
		await first.focus();
		await page.keyboard.press("Space");
		expect(
			await page.evaluate(
				() => (window as typeof window & { buttonActivationCount?: number }).buttonActivationCount,
			),
		).toBe(2);
		await capturePreviewScreenshots(page, testInfo, `button-${state.locale}-${state.direction}-${state.theme}`);
		await expectNoHorizontalScroll(page);
		await expectAccessible(page);
		await page.keyboard.press("Tab");
		await expectThemeFocusRing(page, state.theme);
	}
});
