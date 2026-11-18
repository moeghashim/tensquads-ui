# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: input-field.spec.ts >> Field previews documented states in both directions and themes
- Location: e2e/input-field.spec.ts:19:2

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  429 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: chromium-field-ar-rtl-dark-390.png

Call log:
  - Expect "toHaveScreenshot(chromium-field-ar-rtl-dark-390.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 429 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 429 pixels (ratio 0.01 of all image pixels) are different.

```

# Page snapshot

```yaml
- main [ref=f3e2]:
  - link "العودة إلى المعرض" [ref=f3e3] [cursor=pointer]:
    - /url: /?locale=ar&dir=rtl&theme=dark
  - paragraph [ref=f3e4]: معاينة المكوّن
  - heading "Field" [level=1] [ref=f3e5]
  - region "حالات الإدخال" [ref=f3e6]:
    - generic [ref=f3e8]:
      - generic [ref=f3e9]: فارغ
      - textbox "فارغ" [ref=f3e10]
    - generic [ref=f3e12]:
      - generic [ref=f3e13]: عنصر نائب
      - textbox "عنصر نائب" [ref=f3e14]:
        - /placeholder: أدخل اسماً
    - generic [ref=f3e16]:
      - generic [ref=f3e17]: معبأ
      - textbox "معبأ" [ref=f3e18]: بنّاء
    - generic [ref=f3e20]:
      - generic [ref=f3e21]: معطّل
      - textbox "معطّل" [disabled] [ref=f3e22]: غير متاح
    - generic [ref=f3e24]:
      - generic [ref=f3e25]: للقراءة فقط
      - textbox "للقراءة فقط" [ref=f3e26]: للقراءة
    - generic [ref=f3e27]:
      - heading "وصف" [level=2] [ref=f3e28]
      - generic [ref=f3e29]:
        - generic [ref=f3e30]: اسم المشروع
        - textbox "اسم المشروع" [ref=f3e31]: بنّاء
        - paragraph [ref=f3e32]: استخدم اسماً يعرفه فريقك.
    - generic [ref=f3e33]:
      - heading "خطأ" [level=2] [ref=f3e34]
      - generic [ref=f3e35]:
        - generic [ref=f3e36]: اسم المشروع
        - textbox "اسم المشروع" [invalid] [ref=f3e37]
        - generic [ref=f3e38]: هذا الحقل مطلوب.
  - region "عينة OpenUI" [ref=f3e39]:
    - generic [ref=f3e42]:
      - generic [ref=f3e43]: اسم المشروع
      - textbox "اسم المشروع" [ref=f3e44]:
        - /placeholder: أدخل اسماً
        - text: بنّاء
      - paragraph [ref=f3e45]: استخدم اسماً يعرفه فريقك.
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