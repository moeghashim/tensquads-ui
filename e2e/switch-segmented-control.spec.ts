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

test("Switch previews on, off, disabled, keyboard and focus states", async ({ page }, testInfo) => {
	for (const state of states) {
		await openPreview(page, state, "/components/Switch");
		const switches = page
			.getByRole("region", { name: state.locale === "ar" ? "حالات المفتاح" : "Switch states" })
			.getByRole("switch");
		await expect(switches).toHaveCount(3);
		await expect(switches.nth(0)).toHaveAttribute("data-checked");
		await expect(switches.nth(1)).toHaveAttribute("data-unchecked");
		await expect(switches.nth(2)).toHaveAttribute("data-disabled");
		await switches.nth(1).focus();
		await page.keyboard.press("Space");
		await expect(switches.nth(1)).toHaveAttribute("data-checked");
		await capturePreviewScreenshots(page, testInfo, `switch-${state.locale}-${state.direction}-${state.theme}`);
		await expectNoHorizontalScroll(page);
		await expectAccessible(page);
		await switches.nth(0).focus();
		await expectThemeFocusRing(page, state.theme);
	}
});

test("SegmentedControl follows UI SDK arrow navigation in both directions", async ({ page }, testInfo) => {
	for (const state of states) {
		await openPreview(page, state, "/components/SegmentedControl");
		const section = page.getByRole("region", { name: state.locale === "ar" ? "أوضاع العرض" : "View modes" });
		const group = section.getByRole("radiogroup", { name: state.locale === "ar" ? "طريقة العرض" : "View" });
		const grid = group.getByRole("radio", { name: state.locale === "ar" ? "شبكة" : "Grid" });
		await expect(grid).toHaveAttribute("data-checked");
		await grid.focus();
		await page.keyboard.press(state.direction === "ltr" ? "ArrowLeft" : "ArrowRight");
		await expect(group.getByRole("radio", { name: state.locale === "ar" ? "قائمة" : "List" })).toHaveAttribute(
			"data-checked",
		);
		await expect(group).toBeVisible();
		await capturePreviewScreenshots(
			page,
			testInfo,
			`segmented-control-${state.locale}-${state.direction}-${state.theme}`,
		);
		await expectNoHorizontalScroll(page);
		await expectAccessible(page);
		await group.getByRole("radio", { name: state.locale === "ar" ? "شبكة" : "Grid" }).focus();
		await expectThemeFocusRing(page, state.theme);
	}
});
