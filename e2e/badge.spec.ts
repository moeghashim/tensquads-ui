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

for (const state of states) {
	test(`Selected DataTable rows keep every Badge tone readable in ${state.locale} ${state.theme}`, async ({
		page,
	}, testInfo) => {
		await openPreview(page, state, "/components/DataTable");
		const table = page.getByRole("table", { name: state.locale === "ar" ? "حالات الطلبات" : "Order statuses" });
		const results: Record<string, number> = {};
		for (const tone of ["default", "success", "warning", "danger", "info"]) {
			const badgeSelector = `[data-slot="badge"].ts-badge--${tone}`;
			const row = table.getByRole("row").filter({ has: page.locator(badgeSelector) });
			await row.focus();
			await page.keyboard.press("Space");
			await expect(row).toHaveAttribute("aria-selected", "true");
			results[tone] = await row.locator(badgeSelector).evaluate((element) => {
				const canvas = document.createElement("canvas");
				canvas.width = 1;
				canvas.height = 1;
				const context = canvas.getContext("2d");
				if (!context) throw new Error("A 2D canvas is required to composite Badge colors");

				const paint = (color: string) => {
					context.fillStyle = color;
					context.fillRect(0, 0, 1, 1);
				};
				const luminance = () => {
					const rgb = Array.from(context.getImageData(0, 0, 1, 1).data.slice(0, 3), (value) => {
						const channel = value / 255;
						return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
					});
					const [red = 0, green = 0, blue = 0] = rgb;
					return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
				};
				const backgrounds = [];
				for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
					backgrounds.push(getComputedStyle(ancestor).backgroundColor);
				}
				paint("white");
				for (const background of backgrounds.reverse()) paint(background);
				const background = luminance();
				paint(getComputedStyle(element).color);
				const text = luminance();
				return (Math.max(background, text) + 0.05) / (Math.min(background, text) + 0.05);
			});
		}
		await testInfo.attach("selected-badge-contrast", {
			body: JSON.stringify(results),
			contentType: "application/json",
		});
		for (const [tone, ratio] of Object.entries(results)) {
			expect.soft(ratio, `${tone} Badge text contrast`).toBeGreaterThanOrEqual(4.5);
		}
	});
}
