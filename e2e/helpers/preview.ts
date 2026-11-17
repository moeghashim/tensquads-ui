import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, type TestInfo } from "@playwright/test";

// Supply the token's first font family in tests so OS fallbacks cannot change layout.
const screenshotStyles =
	[
		["DejaVuSans.ttf", 400],
		["DejaVuSans-Bold.ttf", 700],
	]
		.map(([file, weight]) => {
			const data = readFileSync(new URL(`../fonts/${file}`, import.meta.url)).toString("base64");
			return `@font-face { font-family: Inter; font-weight: ${weight}; src: url(data:font/ttf;base64,${data}) format("truetype"); }`;
		})
		.join("\n") +
	// Native select arrows reserve different widths on macOS and Linux.
	"\nselect { appearance: none; padding-inline-end: calc(var(--ts-space-3) + 16px); }";

export type PreviewDirection = "ltr" | "rtl";
export type PreviewLocale = "en" | "ar";
export type PreviewTheme = "light" | "dark";
export type PreviewState = {
	locale: PreviewLocale;
	direction: PreviewDirection;
	theme: PreviewTheme;
};

export async function openPreview(page: Page, state: PreviewState, route = "/") {
	const query = new URLSearchParams({ locale: state.locale, dir: state.direction, theme: state.theme });
	await page.goto(`${route}?${query.toString()}`);
	await page.addStyleTag({ content: screenshotStyles });
	await page.evaluate(() => document.fonts.ready);
	await expect(page.locator("html")).toHaveAttribute("lang", state.locale);
	await expect(page.locator("html")).toHaveAttribute("dir", state.direction);
	await expect(page.locator("html")).toHaveAttribute("data-theme", state.theme);
}

export async function capturePreviewScreenshots(page: Page, testInfo: TestInfo, name: string) {
	const original = page.viewportSize();
	for (const width of [1440, 390]) {
		await page.setViewportSize({ width, height: 900 });
		await expect(page).toHaveScreenshot(`${testInfo.project.name || "chromium"}-${name}-${width}.png`, {
			animations: "disabled",
			caret: "hide",
			fullPage: true,
		});
	}
	if (original) await page.setViewportSize(original);
}

export async function expectNoHorizontalScroll(page: Page) {
	await page.setViewportSize({ width: 390, height: 844 });
	const dimensions = await page.evaluate(() => ({
		viewport: document.documentElement.clientWidth,
		content: document.documentElement.scrollWidth,
	}));
	expect(dimensions.content, `Document is wider than the ${dimensions.viewport}px viewport`).toBeLessThanOrEqual(
		dimensions.viewport,
	);
}

export async function expectAccessible(page: Page) {
	const results = await new AxeBuilder({ page }).analyze();
	expect(results.violations).toEqual([]);
}

export async function expectThemeFocusRing(page: Page, theme: PreviewTheme) {
	await page.keyboard.press("Tab");
	const ring = await page.evaluate(() => {
		const active = document.activeElement;
		if (!active) return null;
		const style = getComputedStyle(active);
		return { width: style.outlineWidth, offset: style.outlineOffset, color: style.outlineColor };
	});
	const expectedColor = theme === "light" ? "rgb(1, 105, 204)" : "rgb(2, 133, 255)";
	expect(ring).toEqual({ width: "2px", offset: "2px", color: expectedColor });
}
