# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard-components.spec.ts >> StatTile dashboard states in en dark
- Location: e2e/dashboard-components.spec.ts:12:4

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 93

- Array []
+ Array [
+   Object {
+     "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
+     "help": "Elements must meet minimum color contrast ratio thresholds",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/color-contrast?application=playwright",
+     "id": "color-contrast",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#1c1c1c",
+               "contrastRatio": 3.72,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#e02e2a",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.72 (foreground color: #e02e2a, background color: #1c1c1c, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<article data-slot=\"stat-tile\" class=\"ts-stat-tile\">",
+                 "target": Array [
+                   "article:nth-child(2)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.72 (foreground color: #e02e2a, background color: #1c1c1c, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"ts-stat-tile__delta ts-stat-tile__delta--negative\">−2.1% vs last week</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "article:nth-child(2) > .ts-stat-tile__footer > .ts-stat-tile__delta--negative.ts-stat-tile__delta",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#1c1c1c",
+               "contrastRatio": 3.72,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#e02e2a",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.72 (foreground color: #e02e2a, background color: #1c1c1c, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<article data-slot=\"stat-tile\" class=\"ts-stat-tile\">",
+                 "target": Array [
+                   "article:nth-child(5)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.72 (foreground color: #e02e2a, background color: #1c1c1c, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"ts-stat-tile__delta ts-stat-tile__delta--negative\">−2.1% vs last week</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "article:nth-child(5) > .ts-stat-tile__footer > .ts-stat-tile__delta--negative.ts-stat-tile__delta",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.color",
+       "wcag2aa",
+       "wcag143",
+       "TTv5",
+       "TT13.c",
+       "EN-301-549",
+       "EN-9.1.4.3",
+       "ACT",
+       "RGAAv4",
+       "RGAA-3.2.1",
+     ],
+   },
+ ]
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "tensquads" [ref=e5] [cursor=pointer]:
        - /url: /?locale=en&dir=ltr&theme=dark
      - generic [ref=e11]: ui
    - navigation "Primary navigation" [ref=e12]:
      - link "Home" [ref=e13] [cursor=pointer]:
        - /url: /?locale=en&dir=ltr&theme=dark
      - link "Components" [ref=e14] [cursor=pointer]:
        - /url: /components?locale=en&dir=ltr&theme=dark
      - link "Chat demo" [ref=e15] [cursor=pointer]:
        - /url: /chat?locale=en&dir=ltr&theme=dark
      - link "Get started" [ref=e16] [cursor=pointer]:
        - /url: /get-started?locale=en&dir=ltr&theme=dark
    - generic [ref=e17]:
      - radiogroup "Language" [ref=e18]:
        - radio "English" [checked] [ref=e19] [cursor=pointer]
        - radio [checked] [aria-hidden]
        - radio "العربية" [ref=e20] [cursor=pointer]
        - radio [aria-hidden]
      - radiogroup "Theme" [ref=e21]:
        - radio "Light" [ref=e22] [cursor=pointer]
        - radio [aria-hidden]
        - radio "Dark" [checked] [ref=e23] [cursor=pointer]
        - radio [checked] [aria-hidden]
        - radio "System" [ref=e24] [cursor=pointer]
        - radio [aria-hidden]
  - main [ref=e25]:
    - generic [ref=e26]:
      - link "All components" [ref=e27] [cursor=pointer]:
        - /url: /components?locale=en&dir=ltr&theme=dark
      - paragraph [ref=e28]: Components
      - heading "StatTile" [level=1] [ref=e29]
    - region "API reference" [ref=e30]:
      - generic [ref=e31]:
        - region "Description" [ref=e32]:
          - heading "Description" [level=2] [ref=e33]
          - paragraph [ref=e34]:
            - text: Import
            - code [ref=e35]: StatTile
            - text: ","
            - code [ref=e36]: StatTileProps
            - text: ", and"
            - code [ref=e37]: StatTileDelta
            - text: from
            - code [ref=e38]: "@tensquads/ui/react"
            - text: . A tile shows one headline metric.
            - code [ref=e39]: label
            - text: and
            - code [ref=e40]: value
            - text: are required. Add an optional
            - code [ref=e41]: glyph
            - text: ","
            - code [ref=e42]: unit
            - text: ","
            - code [ref=e43]: delta
            - text: ","
            - code [ref=e44]: foot
            - text: ", and"
            - code [ref=e45]: series
            - text: . Delta tone is
            - code [ref=e46]: positive
            - text: ","
            - code [ref=e47]: negative
            - text: ", or"
            - code [ref=e48]: neutral
            - text: ; the consumer decides whether an increase is good. Delta text includes its comparison period. Use
            - code [ref=e49]: "delta: null"
            - text: and a
            - code [ref=e50]: foot
            - text: when there is no previous period. Pass
            - code [ref=e51]: "series: null"
            - text: or omit it for a metric without a trend. The sparkline uses the consumer-provided metric label as its accessible name. A sparkline needs at least two points and reverses in RTL so time follows the reading direction.
        - region "Props" [ref=e52]:
          - heading "Props" [level=2] [ref=e53]
          - paragraph [ref=e55]:
            - text: Use
            - code [ref=e56]: StatGrid
            - text: "as a CSS wrapper around tiles:"
            - code [ref=e57]: className="ts-stat-grid"
            - text: . It lays out six, three, two, then one column as the viewport narrows. Values use tabular numerals. The OpenUI definition accepts serializable numeric series and metric text.
    - region [ref=e58]:
      - heading "Live examples" [level=2] [ref=e59]
      - generic [ref=e60]:
        - generic [ref=e61]:
          - article [ref=e62]:
            - generic [ref=e63]:
              - generic [aria-hidden] [ref=e64]: ◷
              - generic [ref=e65]: Revenue
            - generic [ref=e66]:
              - generic [ref=e67]: $24.8k
              - img "Revenue" [ref=e69]
            - generic [ref=e73]: +12% vs last week
          - article [ref=e75]:
            - generic [ref=e76]:
              - generic [aria-hidden] [ref=e77]: ▤
              - generic [ref=e78]: Orders
            - generic [ref=e79]:
              - generic [ref=e80]: 1,284
              - img "Orders" [ref=e82]
            - generic [ref=e86]: −2.1% vs last week
          - article [ref=e88]:
            - generic [ref=e89]:
              - generic [aria-hidden] [ref=e90]: ↗
              - generic [ref=e91]: Conversion
            - generic [ref=e92]:
              - generic [ref=e93]: 3.8%
              - img "Conversion" [ref=e95]
            - generic [ref=e99]: +12% vs last week
          - article [ref=e101]:
            - generic [ref=e102]:
              - generic [aria-hidden] [ref=e103]: ◉
              - generic [ref=e104]: Avg. order
            - generic [ref=e105]:
              - generic [ref=e106]: $68.40
              - img "Avg. order" [ref=e108]
            - generic [ref=e112]: +12% vs last week
          - article [ref=e114]:
            - generic [ref=e115]:
              - generic [aria-hidden] [ref=e116]: ⌁
              - generic [ref=e117]: Visits
            - generic [ref=e118]:
              - generic [ref=e119]: 18.2k
              - img "Visits" [ref=e121]
            - generic [ref=e125]: −2.1% vs last week
          - article [ref=e127]:
            - generic [ref=e128]:
              - generic [aria-hidden] [ref=e129]: ♙
              - generic [ref=e130]: Customers
            - generic [ref=e131]: "936"
            - generic [ref=e134]: +12% vs last week
        - region "OpenUI fixture" [ref=e136]:
          - article [ref=e139]:
            - generic [ref=e140]:
              - generic [aria-hidden] [ref=e141]: ◷
              - generic [ref=e142]: Revenue
            - generic [ref=e143]:
              - generic [ref=e144]:
                - generic [ref=e145]: $24.8k
                - generic [ref=e146]: USD
              - img "Revenue" [ref=e147]
            - generic [ref=e151]:
              - generic [ref=e152]: +12% vs last week
              - generic [ref=e153]: Compared with last week
    - generic [ref=e154]:
      - heading "OpenUI fixture" [level=2] [ref=e155]
      - group [ref=e156]:
        - generic "Show fixture source" [ref=e157] [cursor=pointer]
    - navigation "Component pages" [ref=e158]:
      - 'link "Previous: PageHeader" [ref=e159] [cursor=pointer]':
        - /url: /components/PageHeader?locale=en&dir=ltr&theme=dark
        - text: "← Previous: PageHeader"
      - 'link "Next: Chat" [ref=e160] [cursor=pointer]':
        - /url: /components/Chat?locale=en&dir=ltr&theme=dark
        - text: "Next: Chat →"
```

# Test source

```ts
  1  | import { mkdir, writeFile } from "node:fs/promises";
  2  | import { join } from "node:path";
  3  | import AxeBuilder from "@axe-core/playwright";
  4  | import { expect, type Page, type TestInfo } from "@playwright/test";
  5  | 
  6  | export type PreviewDirection = "ltr" | "rtl";
  7  | export type PreviewLocale = "en" | "ar";
  8  | export type PreviewTheme = "light" | "dark";
  9  | export type PreviewState = {
  10 | 	locale: PreviewLocale;
  11 | 	direction: PreviewDirection;
  12 | 	theme: PreviewTheme;
  13 | };
  14 | 
  15 | export async function openPreview(page: Page, state: PreviewState, route = "/") {
  16 | 	const query = new URLSearchParams({ locale: state.locale, dir: state.direction, theme: state.theme });
  17 | 	await page.goto(`${route}?${query.toString()}`);
  18 | 	await page.evaluate(() => document.fonts.ready);
  19 | 	await expect(page.locator("html")).toHaveAttribute("lang", state.locale);
  20 | 	await expect(page.locator("html")).toHaveAttribute("dir", state.direction);
  21 | 	await expect(page.locator("html")).toHaveAttribute("data-theme", state.theme);
  22 | }
  23 | 
  24 | export async function capturePreviewScreenshots(
  25 | 	page: Page,
  26 | 	testInfo: TestInfo,
  27 | 	name: string,
  28 | 	widths: readonly number[] = [1440, 390],
  29 | ) {
  30 | 	await page.evaluate(() => document.fonts.ready);
  31 | 	await expect(page.locator("[data-starting-style], [data-ending-style]")).toHaveCount(0);
  32 | 	const screenshotDirectory = join(process.cwd(), "test-results", "screenshots");
  33 | 	await mkdir(screenshotDirectory, { recursive: true });
  34 | 	const original = page.viewportSize();
  35 | 	for (const width of widths) {
  36 | 		await page.setViewportSize({ width, height: 900 });
  37 | 		const screenshot = await page.screenshot({ animations: "disabled", caret: "hide", fullPage: true });
  38 | 		const filename = `${name}-${width}.png`;
  39 | 		await writeFile(join(screenshotDirectory, filename), screenshot);
  40 | 		await testInfo.attach(filename, { body: screenshot, contentType: "image/png" });
  41 | 	}
  42 | 	if (original) await page.setViewportSize(original);
  43 | }
  44 | 
  45 | export async function expectNoHorizontalScroll(page: Page) {
  46 | 	await page.setViewportSize({ width: 390, height: 844 });
  47 | 	const dimensions = await page.evaluate(() => ({
  48 | 		viewport: document.documentElement.clientWidth,
  49 | 		content: document.documentElement.scrollWidth,
  50 | 	}));
  51 | 	expect(dimensions.content, `Document is wider than the ${dimensions.viewport}px viewport`).toBeLessThanOrEqual(
  52 | 		dimensions.viewport,
  53 | 	);
  54 | }
  55 | 
  56 | export async function expectAccessible(page: Page) {
  57 | 	const results = await new AxeBuilder({ page }).analyze();
> 58 | 	expect(results.violations).toEqual([]);
     |                             ^ Error: expect(received).toEqual(expected) // deep equality
  59 | }
  60 | 
  61 | export async function expectThemeFocusRing(page: Page, theme: PreviewTheme) {
  62 | 	await page.keyboard.press("Tab");
  63 | 	const ring = await page.evaluate(() => {
  64 | 		const active = document.activeElement;
  65 | 		if (!active) return null;
  66 | 		const style = getComputedStyle(active);
  67 | 		return { width: style.outlineWidth, offset: style.outlineOffset, color: style.outlineColor };
  68 | 	});
  69 | 	const expectedColor = theme === "light" ? "rgb(1, 105, 204)" : "rgb(2, 133, 255)";
  70 | 	expect(ring).toEqual({ width: "2px", offset: "2px", color: expectedColor });
  71 | }
  72 | 
```