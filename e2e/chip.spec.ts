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

test("OpenUI Chip fixtures show the supplied icon and open their object", async ({ page }) => {
	for (const state of states) {
		await openPreview(page, state, "/components/Chip");
		const chip = page.locator(".component-list").getByRole("link", { name: "response_schema" });
		await expect(chip.locator(".ts-chip__icon")).toHaveText("◇");
		await expect(chip).toHaveAttribute("href", "#response_schema");
		await chip.click();
		await expect(page).toHaveURL(/#response_schema$/);
		await page.evaluate(() => history.replaceState(null, "", location.pathname + location.search));
		await chip.focus();
		await page.keyboard.press("Enter");
		await expect(page).toHaveURL(/#response_schema$/);
	}
});

test("Chip previews icon, no icon, disabled, and long identifier states", async ({ page }, testInfo) => {
	for (const state of states) {
		await openPreview(page, state, "/components/Chip");
		await expect(page.getByRole("heading", { name: "Chip" })).toBeVisible();
		const gallery = page.locator(".chip-preview__grid");
		await expect(gallery.getByRole("button", { name: "response_schema" })).toBeVisible();
		await expect(gallery.getByRole("button", { name: "tool_search" })).toBeVisible();
		await expect(gallery.getByRole("button", { name: "output_format" })).toBeVisible();
		await expect(gallery.getByRole("button", { name: "disabled_object" })).toBeDisabled();
		const longName = "this_is_a_long_object_identifier_that_stays_visible";
		await expect(gallery.getByRole("button", { name: longName })).toBeVisible();
		const first = gallery.getByRole("button", { name: "response_schema" });
		await first.focus();
		await expect(first).toHaveCSS("outline-width", "2px");
		await expect(first).toHaveCSS("outline-offset", "2px");
		await expect(first).toHaveCSS("outline-color", state.theme === "light" ? "rgb(1, 105, 204)" : "rgb(2, 133, 255)");
		await page.evaluate(() => {
			(window as typeof window & { chipActivations?: number }).chipActivations = 0;
			document.addEventListener("click", (event) => {
				if ((event.target as HTMLElement).closest(".ts-chip")) {
					const target = window as typeof window & { chipActivations?: number };
					target.chipActivations = (target.chipActivations ?? 0) + 1;
				}
			});
		});
		await page.keyboard.press("Enter");
		await page.keyboard.press("Space");
		expect(await page.evaluate(() => (window as typeof window & { chipActivations?: number }).chipActivations)).toBe(
			2,
		);
		await expectThemeFocusRing(page, state.theme);
		await capturePreviewScreenshots(page, testInfo, `chip-${state.locale}-${state.direction}-${state.theme}`);
		await expectNoHorizontalScroll(page);
		await expectAccessible(page);
	}
});
