import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, type TestInfo } from "@playwright/test";

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
	await page.evaluate(() => document.fonts.ready);
	await expect(page.locator("html")).toHaveAttribute("lang", state.locale);
	await expect(page.locator("html")).toHaveAttribute("dir", state.direction);
	await expect(page.locator("html")).toHaveAttribute("data-theme", state.theme);
}

export async function capturePreviewScreenshots(
	page: Page,
	testInfo: TestInfo,
	name: string,
	widths: readonly number[] = [1440, 390],
) {
	await page.evaluate(() => document.fonts.ready);
	await expect(page.locator("[data-starting-style], [data-ending-style]")).toHaveCount(0);
	const screenshotDirectory = '~/.no-mistakes/evidence/01M8C3RX8GDXCKHGQR7V6FSM02';
	await mkdir(screenshotDirectory, { recursive: true });
	const original = page.viewportSize();
	for (const width of widths) {
		await page.setViewportSize({ width, height: 900 });
		const screenshot = await page.screenshot({ animations: "disabled", caret: "hide", fullPage: true });
		const filename = `${name}-${width}.png`;
		await writeFile(join(screenshotDirectory, filename), screenshot);
		await testInfo.attach(filename, { body: screenshot, contentType: "image/png" });
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
