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

for (const component of ["Input", "Field"] as const) {
	test(`${component} previews documented states in both directions and themes`, async ({ page }, testInfo) => {
		for (const state of states) {
			await openPreview(page, state, `/components/${component}`);
			await expect(page.getByRole("heading", { name: component, level: 1, exact: true })).toBeVisible();
			const inputs = page.getByRole("textbox");
			await expect(inputs).toHaveCount(component === "Input" ? 6 : 8);
			if (component === "Field") {
				await expect(page.locator('[data-slot="field"][data-invalid]')).toHaveCount(1);
				await expect(
					page.getByText(state.locale === "ar" ? "هذا الحقل مطلوب." : "This field is required."),
				).toBeVisible();
			}
			const first = inputs.first();
			await capturePreviewScreenshots(
				page,
				testInfo,
				`${component.toLowerCase()}-${state.locale}-${state.direction}-${state.theme}`,
			);
			await expectNoHorizontalScroll(page);
			await expectAccessible(page);
			if (component === "Field") {
				await page
					.getByText(state.locale === "ar" ? "فارغ" : "Empty")
					.first()
					.click();
				await expect(first).toBeFocused();
			}
			await first.focus();
			await page.keyboard.type(state.locale === "ar" ? "مرحبا" : "Hello");
			await expect(first).toHaveValue(state.locale === "ar" ? "مرحبا" : "Hello");
			await first.focus();
			await expectThemeFocusRing(page, state.theme);
		}
	});
}
