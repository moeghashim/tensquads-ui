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

test("Tooltip preview works in both directions and themes", async ({ page }, testInfo) => {
	for (const state of states) {
		await openPreview(page, state, "/components/Tooltip");
		await expect(page.getByRole("heading", { name: "Tooltip" })).toBeVisible();
		await expectThemeFocusRing(page, state.theme);
		await page.keyboard.press("Tab");
		await expect(
			page.getByRole("button", { name: state.locale === "en" ? "Add item" : "إضافة عنصر" }).first(),
		).toBeFocused();
		await expect(page.getByRole("tooltip").first()).toBeVisible();
		await expect(page.getByRole("tooltip").first()).toContainText(
			state.locale === "en" ? "Create a new item" : "أنشئ عنصراً جديداً",
		);
		await expect(page.locator('[data-slot="tooltip-shortcut"]').first()).toContainText("K");
		await expectAccessible(page);
		await capturePreviewScreenshots(page, testInfo, `tooltip-${state.locale}-${state.direction}-${state.theme}`);
		await expectNoHorizontalScroll(page);
	}
});
