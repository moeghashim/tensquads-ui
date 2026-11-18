# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: button.spec.ts >> Button previews variants, sizes, and interaction states
- Location: e2e/button.spec.ts:18:1

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  453 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: chromium-button-ar-rtl-light-390.png

Call log:
  - Expect "toHaveScreenshot(chromium-button-ar-rtl-light-390.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 453 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 453 pixels (ratio 0.01 of all image pixels) are different.

```

# Page snapshot

```yaml
- main [ref=f2e2]:
  - link "العودة إلى المعرض" [ref=f2e3] [cursor=pointer]:
    - /url: /?locale=ar&dir=rtl&theme=light
  - paragraph [ref=f2e4]: معاينة المكوّن
  - heading "Button" [level=1] [ref=f2e5]
  - region "أنواع الأزرار" [ref=f2e6]:
    - generic [ref=f2e7]:
      - heading "solid" [level=2] [ref=f2e8]
      - button "متابعة" [active] [ref=f2e9] [cursor=pointer]
      - button "متابعة" [ref=f2e10] [cursor=pointer]
      - button "متابعة" [ref=f2e11] [cursor=pointer]
      - button "دائري" [ref=f2e12] [cursor=pointer]
      - button "إضافة" [ref=f2e13] [cursor=pointer]:
        - generic [aria-hidden] [ref=f2e14]: +
      - button "معطّل" [disabled] [ref=f2e15]
    - generic [ref=f2e16]:
      - heading "soft" [level=2] [ref=f2e17]
      - button "متابعة" [ref=f2e18] [cursor=pointer]
      - button "متابعة" [ref=f2e19] [cursor=pointer]
      - button "متابعة" [ref=f2e20] [cursor=pointer]
      - button "دائري" [ref=f2e21] [cursor=pointer]
      - button "إضافة" [ref=f2e22] [cursor=pointer]:
        - generic [aria-hidden] [ref=f2e23]: +
      - button "معطّل" [disabled] [ref=f2e24]
    - generic [ref=f2e25]:
      - heading "outline" [level=2] [ref=f2e26]
      - button "متابعة" [ref=f2e27] [cursor=pointer]
      - button "متابعة" [ref=f2e28] [cursor=pointer]
      - button "متابعة" [ref=f2e29] [cursor=pointer]
      - button "دائري" [ref=f2e30] [cursor=pointer]
      - button "إضافة" [ref=f2e31] [cursor=pointer]:
        - generic [aria-hidden] [ref=f2e32]: +
      - button "معطّل" [disabled] [ref=f2e33]
    - generic [ref=f2e34]:
      - heading "ghost" [level=2] [ref=f2e35]
      - button "متابعة" [ref=f2e36] [cursor=pointer]
      - button "متابعة" [ref=f2e37] [cursor=pointer]
      - button "متابعة" [ref=f2e38] [cursor=pointer]
      - button "دائري" [ref=f2e39] [cursor=pointer]
      - button "إضافة" [ref=f2e40] [cursor=pointer]:
        - generic [aria-hidden] [ref=f2e41]: +
      - button "معطّل" [disabled] [ref=f2e42]
    - generic [ref=f2e43]:
      - heading "danger" [level=2] [ref=f2e44]
      - button "متابعة" [ref=f2e45] [cursor=pointer]
      - button "متابعة" [ref=f2e46] [cursor=pointer]
      - button "متابعة" [ref=f2e47] [cursor=pointer]
      - button "دائري" [ref=f2e48] [cursor=pointer]
      - button "إضافة" [ref=f2e49] [cursor=pointer]:
        - generic [aria-hidden] [ref=f2e50]: +
      - button "معطّل" [disabled] [ref=f2e51]
  - region "عينة OpenUI" [ref=f2e52]:
    - button "متابعة" [ref=f2e55] [cursor=pointer]
```

# Test source

```ts
  1  | import AxeBuilder from "@axe-core/playwright";
  2  | import { expect, type Page, type TestInfo } from "@playwright/test";
  3  | 
  4  | // Native select arrows reserve different widths on macOS and Linux.
  5  | const screenshotStyles = "select { appearance: none; padding-inline-end: calc(var(--ts-space-3) + 16px); }";
  6  | 
  7  | export type PreviewDirection = "ltr" | "rtl";
  8  | export type PreviewLocale = "en" | "ar";
  9  | export type PreviewTheme = "light" | "dark";
  10 | export type PreviewState = {
  11 | 	locale: PreviewLocale;
  12 | 	direction: PreviewDirection;
  13 | 	theme: PreviewTheme;
  14 | };
  15 | 
  16 | export async function openPreview(page: Page, state: PreviewState, route = "/") {
  17 | 	const query = new URLSearchParams({ locale: state.locale, dir: state.direction, theme: state.theme });
  18 | 	await page.goto(`${route}?${query.toString()}`);
  19 | 	await page.addStyleTag({ content: screenshotStyles });
  20 | 	await page.evaluate(() => document.fonts.ready);
  21 | 	await expect(page.locator("html")).toHaveAttribute("lang", state.locale);
  22 | 	await expect(page.locator("html")).toHaveAttribute("dir", state.direction);
  23 | 	await expect(page.locator("html")).toHaveAttribute("data-theme", state.theme);
  24 | }
  25 | 
  26 | export async function capturePreviewScreenshots(page: Page, testInfo: TestInfo, name: string) {
  27 | 	const original = page.viewportSize();
  28 | 	for (const width of [1440, 390]) {
  29 | 		await page.setViewportSize({ width, height: 900 });
> 30 | 		await expect(page).toHaveScreenshot(`${testInfo.project.name || "chromium"}-${name}-${width}.png`, {
     |                      ^ Error: expect(page).toHaveScreenshot(expected) failed
  31 | 			animations: "disabled",
  32 | 			caret: "hide",
  33 | 			fullPage: true,
  34 | 			// Allow bounded macOS/Linux glyph rasterization differences without masking text.
  35 | 			maxDiffPixelRatio: 0.001,
  36 | 		});
  37 | 	}
  38 | 	if (original) await page.setViewportSize(original);
  39 | }
  40 | 
  41 | export async function expectNoHorizontalScroll(page: Page) {
  42 | 	await page.setViewportSize({ width: 390, height: 844 });
  43 | 	const dimensions = await page.evaluate(() => ({
  44 | 		viewport: document.documentElement.clientWidth,
  45 | 		content: document.documentElement.scrollWidth,
  46 | 	}));
  47 | 	expect(dimensions.content, `Document is wider than the ${dimensions.viewport}px viewport`).toBeLessThanOrEqual(
  48 | 		dimensions.viewport,
  49 | 	);
  50 | }
  51 | 
  52 | export async function expectAccessible(page: Page) {
  53 | 	const results = await new AxeBuilder({ page }).analyze();
  54 | 	expect(results.violations).toEqual([]);
  55 | }
  56 | 
  57 | export async function expectThemeFocusRing(page: Page, theme: PreviewTheme) {
  58 | 	await page.keyboard.press("Tab");
  59 | 	const ring = await page.evaluate(() => {
  60 | 		const active = document.activeElement;
  61 | 		if (!active) return null;
  62 | 		const style = getComputedStyle(active);
  63 | 		return { width: style.outlineWidth, offset: style.outlineOffset, color: style.outlineColor };
  64 | 	});
  65 | 	const expectedColor = theme === "light" ? "rgb(1, 105, 204)" : "rgb(2, 133, 255)";
  66 | 	expect(ring).toEqual({ width: "2px", offset: "2px", color: expectedColor });
  67 | }
  68 | 
```