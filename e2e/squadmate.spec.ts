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

test("Squadmate previews every character and state in both locales and themes", async ({ page }, testInfo) => {
	for (const state of states) {
		await openPreview(page, state, "/components/Squadmate");
		await expect(page.getByRole("heading", { name: "Squadmate" })).toBeVisible();
		await expect(page.getByRole("img")).toHaveCount(130);
		await expect(page.getByRole("img", { name: state.locale === "ar" ? "بترا، خامل" : "Petra, Idle" })).toBeVisible();
		await capturePreviewScreenshots(page, testInfo, `squadmate-${state.locale}-${state.direction}-${state.theme}`);
		await expectNoHorizontalScroll(page);
		await expectAccessible(page);
		await expectThemeFocusRing(page, state.theme);
	}
});
