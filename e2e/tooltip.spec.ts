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
	{ locale: "ar", direction: "ltr", theme: "light" },
	{ locale: "ar", direction: "ltr", theme: "dark" },
	{ locale: "en", direction: "rtl", theme: "light" },
	{ locale: "en", direction: "rtl", theme: "dark" },
];

for (const state of states) {
	test(`Tooltip preview works in ${state.locale}/${state.direction}/${state.theme}`, async ({ page }, testInfo) => {
		await openPreview(page, state, "/components/Tooltip");
		await expect(page.getByRole("heading", { name: "Tooltip" })).toBeVisible();
		await expectThemeFocusRing(page, state.theme);
		await expectAccessible(page);
		const preview = page.getByRole("region", {
			name: state.locale === "en" ? "Tooltip placements" : "مواضع التلميح",
		});
		const triggerName = state.locale === "en" ? "Add item" : "إضافة عنصر";
		const hint = state.locale === "en" ? "Create a new item" : "أنشئ عنصراً جديداً";
		const sides = ["top", "right", "bottom", "left"] as const;
		const physicalSides = {
			top: "top",
			right: state.direction === "rtl" ? "left" : "right",
			bottom: "bottom",
			left: state.direction === "rtl" ? "right" : "left",
		} as const;

		for (const [index, side] of sides.entries()) {
			const trigger = preview.getByRole("button", { name: triggerName }).nth(index);
			await trigger.focus();
			await expect(trigger).toBeFocused();
			const tooltip = page.locator('[data-slot="tooltip-content"][data-open]');
			await expect(tooltip).toHaveCount(1);
			await expect(tooltip).toBeVisible();
			const expectedSide = physicalSides[side];
			await expect(tooltip).toHaveAttribute("data-side", expectedSide);
			// UI SDK start/end placements mirror across the reading direction.
			await expect
				.poll(async () => {
					const anchor = await trigger.boundingBox();
					const content = await tooltip.boundingBox();
					if (!anchor || !content) return false;
					switch (expectedSide) {
						case "top":
							return content.y + content.height <= anchor.y;
						case "right":
							return content.x >= anchor.x + anchor.width;
						case "bottom":
							return content.y >= anchor.y + anchor.height;
						case "left":
							return content.x + content.width <= anchor.x;
					}
				})
				.toBe(true);
			await expect(tooltip).toContainText(hint);
			await expect(trigger).toHaveAttribute("aria-describedby", /.+/);
			await expect(tooltip.locator('[data-slot="tooltip-shortcut"]')).toContainText("K");
			await expect(page.locator('[data-slot="tooltip-content"][data-open]')).toHaveCount(1);
			await capturePreviewScreenshots(
				page,
				testInfo,
				`tooltip-${state.locale}-${state.direction}-${state.theme}-${side}`,
			);
			await expect(tooltip).toHaveCount(1);
			await expect(tooltip).toBeVisible();
			await expect(tooltip).toHaveAttribute("data-side", expectedSide);
		}
		await expectNoHorizontalScroll(page);
	});
}
