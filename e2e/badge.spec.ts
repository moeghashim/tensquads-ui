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
		await expect(page.getByRole("heading", { name: "Badge", level: 1, exact: true })).toBeVisible();
		await expect(page.locator('[data-slot="badge"]')).toHaveCount(6);
		for (const tone of ["default", "success", "warning", "danger", "info"]) {
			await expect(page.locator(`[data-slot="badge"].ts-badge--${tone}`)).toHaveCount(tone === "success" ? 2 : 1);
		}
		await capturePreviewScreenshots(page, testInfo, `badge-${state.locale}-${state.direction}-${state.theme}`);
		for (const width of [1440, 390]) {
			await page.setViewportSize({ width, height: 900 });
			await expectAccessible(page);
			await testInfo.attach(`badge-${state.locale}-${state.theme}-${width}`, {
				body: await page.screenshot({ fullPage: true }),
				contentType: "image/png",
			});
		}
		await expectNoHorizontalScroll(page);
		await expectAccessible(page);
	}
});

test("Badge labels stay outside keyboard and click interactions", async ({ page }, testInfo) => {
	for (const state of states) {
		await openPreview(page, state, "/components/Badge");
		const badges = page.locator('[data-slot="badge"]');
		await expect(badges).toHaveCount(6);
		for (const badge of await badges.all()) {
			await expect(badge).toHaveJSProperty("tagName", "SPAN");
			await expect(badge).not.toHaveAttribute("role");
			await expect(badge).not.toHaveAttribute("tabindex");
			await badge.evaluate((element) => (element as HTMLElement).focus());
			await expect(badge).not.toBeFocused();
			const label = await badge.textContent();
			await badge.click();
			await page.keyboard.press("Enter");
			await page.keyboard.press("Space");
			await expect(badge).toHaveText(label ?? "");
			await expect(badge).not.toBeFocused();
		}
		await expect(page.getByRole("menu")).toHaveCount(0);
		await page.locator("body").click({ position: { x: 1, y: 1 } });
		for (let index = 0; index < 12; index++) {
			await page.keyboard.press("Tab");
			await expect(page.locator('[data-slot="badge"]:focus')).toHaveCount(0);
		}
		await testInfo.attach(`non-interactive-${state.locale}-${state.theme}`, {
			body: JSON.stringify({
				locale: state.locale,
				theme: state.theme,
				labels: await badges.allTextContents(),
				programmaticFocusRejected: true,
				tabStopsSkipped: true,
				menuCount: 0,
			}),
			contentType: "application/json",
		});
	}
});
