import { expect, test } from "@playwright/test";
import {
	capturePreviewScreenshots,
	expectAccessible,
	expectNoHorizontalScroll,
	openPreview,
	type PreviewState,
} from "./helpers/preview";

const states: PreviewState[] = [
	{ locale: "en", direction: "ltr", theme: "light" },
	{ locale: "en", direction: "ltr", theme: "dark" },
	{ locale: "ar", direction: "rtl", theme: "light" },
	{ locale: "ar", direction: "rtl", theme: "dark" },
];

test("Badge previews every tone in both locales and themes", async ({ page }, testInfo) => {
	for (const state of states) {
		await openPreview(page, state, "/components/Badge");
		await expect(page.getByRole("heading", { name: "Badge" })).toBeVisible();
		await expect(page.locator('[data-slot="badge"]')).toHaveCount(6);
		for (const tone of ["default", "success", "warning", "danger", "info"]) {
			await expect(page.locator(`[data-slot="badge"].ts-badge--${tone}`)).toHaveCount(tone === "success" ? 2 : 1);
		}
		await capturePreviewScreenshots(page, testInfo, `badge-${state.locale}-${state.direction}-${state.theme}`);
		await expectNoHorizontalScroll(page);
		await expectAccessible(page);
	}
});
