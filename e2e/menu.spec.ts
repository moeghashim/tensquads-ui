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

test("Menu shows open and closed states in both locales and themes", async ({ page }, testInfo) => {
	for (const state of states) {
		await openPreview(page, state, "/components/Menu");
		await expect(page.getByRole("heading", { name: "Menu", level: 1, exact: true })).toBeVisible();
		await expect(page.locator('[data-slot="menu-trigger"]')).toHaveCount(3);
		await expect(page.locator('[data-slot="menu-content"][data-open]')).toHaveCount(1);
		await expect(page.locator('[data-slot="menu-item"][data-destructive]')).toHaveCount(1);
		await expect(page.locator('[data-slot="menu-item"][data-disabled]')).toHaveCount(1);
		await capturePreviewScreenshots(page, testInfo, `menu-${state.locale}-${state.direction}-${state.theme}`);
		await expectNoHorizontalScroll(page);
		await expectAccessible(page);
		await page.locator('[data-slot="menu-trigger"]').first().focus();
		await expectThemeFocusRing(page, state.theme);
	}
});

test("Menu opens with Enter, Space, and ArrowDown, navigates, and returns focus on Escape", async ({ page }) => {
	for (const direction of ["ltr", "rtl"] as const) {
		const state: PreviewState = { locale: direction === "rtl" ? "ar" : "en", direction, theme: "light" };
		await openPreview(page, state, "/components/Menu");
		const trigger = page.locator('[data-slot="menu-trigger"]').first();
		for (const key of ["Enter", " ", "ArrowDown"]) {
			await trigger.focus();
			await page.keyboard.press(key);
			const first = page
				.getByRole("menuitem", { name: state.locale === "en" ? "Open project" : "فتح المشروع" })
				.first();
			await expect(first).toBeFocused();
			const content = page.locator('[data-slot="menu-content"][data-open]').first();
			await expect(content).toHaveAttribute("data-align", "start");
			const [triggerBounds, contentBounds] = await Promise.all([trigger.boundingBox(), content.boundingBox()]);
			expect(triggerBounds).not.toBeNull();
			expect(contentBounds).not.toBeNull();
			if (triggerBounds && contentBounds) {
				const triggerEdge = direction === "ltr" ? triggerBounds.x : triggerBounds.x + triggerBounds.width;
				const contentEdge = direction === "ltr" ? contentBounds.x : contentBounds.x + contentBounds.width;
				// Popup positioning can round a fractional trigger edge to the nearest pixel.
				expect(Math.abs(contentEdge - triggerEdge)).toBeLessThanOrEqual(0.5);
			}
			await page.keyboard.press("ArrowDown");
			await expect(
				page.getByRole("menuitem", { name: state.locale === "en" ? "Duplicate" : "نسخ المشروع" }).first(),
			).toBeFocused();
			await page.keyboard.press("Escape");
			await expect(trigger).toBeFocused();
		}
	}
});
