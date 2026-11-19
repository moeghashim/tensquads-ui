# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard-components.spec.ts >> StatTile dashboard states in en dark
- Location: e2e/dashboard-components.spec.ts:7:4

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 2
Received: 1
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
      - link "Dashboards" [ref=e16] [cursor=pointer]:
        - /url: /dashboards/home?locale=en&dir=ltr&theme=dark
      - link "Get started" [ref=e17] [cursor=pointer]:
        - /url: /get-started?locale=en&dir=ltr&theme=dark
    - generic [ref=e18]:
      - radiogroup "Language" [ref=e19]:
        - radio "English" [checked] [ref=e20] [cursor=pointer]
        - radio [checked] [aria-hidden]
        - radio "العربية" [ref=e21] [cursor=pointer]
        - radio [aria-hidden]
      - radiogroup "Theme" [ref=e22]:
        - radio "Light" [ref=e23] [cursor=pointer]
        - radio [aria-hidden]
        - radio "Dark" [checked] [ref=e24] [cursor=pointer]
        - radio [checked] [aria-hidden]
        - radio "System" [ref=e25] [cursor=pointer]
        - radio [aria-hidden]
  - main [ref=e26]:
    - generic [ref=e27]:
      - link "All components" [ref=e28] [cursor=pointer]:
        - /url: /components?locale=en&dir=ltr&theme=dark
      - paragraph [ref=e29]: Components
      - heading "StatTile" [level=1] [ref=e30]
    - region "API reference" [ref=e31]:
      - generic [ref=e32]:
        - region "Description" [ref=e33]:
          - heading "Description" [level=2] [ref=e34]
          - paragraph [ref=e35]:
            - text: Import
            - code [ref=e36]: StatTile
            - text: ","
            - code [ref=e37]: StatTileProps
            - text: ", and"
            - code [ref=e38]: StatTileDelta
            - text: from
            - code [ref=e39]: "@tensquads/ui/react"
            - text: . A tile shows one headline metric.
            - code [ref=e40]: label
            - text: and
            - code [ref=e41]: value
            - text: are required. Add an optional
            - code [ref=e42]: glyph
            - text: ","
            - code [ref=e43]: unit
            - text: ","
            - code [ref=e44]: delta
            - text: ","
            - code [ref=e45]: foot
            - text: ", and"
            - code [ref=e46]: series
            - text: . Delta tone is
            - code [ref=e47]: positive
            - text: ","
            - code [ref=e48]: negative
            - text: ", or"
            - code [ref=e49]: neutral
            - text: ; the consumer decides whether an increase is good. Delta text includes its comparison period. Use
            - code [ref=e50]: "delta: null"
            - text: and a
            - code [ref=e51]: foot
            - text: when there is no previous period. Pass
            - code [ref=e52]: "series: null"
            - text: or omit it for a metric without a trend. The sparkline uses the consumer-provided metric label as its accessible name. A sparkline needs at least two points and reverses in RTL so time follows the reading direction.
        - region "Props" [ref=e53]:
          - heading "Props" [level=2] [ref=e54]
          - paragraph [ref=e56]:
            - text: Wrap tiles in a container with
            - code [ref=e57]: className="ts-stat-grid"
            - text: . By default, this CSS grid uses six columns, then three at viewport widths of 73.75rem or less, two at 47.5rem or less, and one at 30rem or less (1180, 760, and 480px with the browser's default 16px font size). Values use tabular numerals. The OpenUI definition accepts serializable numeric series and metric text. For an OpenUI tile grid inside a panel, use
            - link "Card" [ref=e58] [cursor=pointer]:
              - /url: ../Card/Card.md
            - text: with
            - code [ref=e59]: "layout: \"stat-grid\""
            - text: .
    - region [ref=e60]:
      - heading "Live examples" [level=2] [ref=e61]
      - generic [ref=e62]:
        - generic [ref=e63]:
          - article [ref=e64]:
            - generic [ref=e65]: Revenue
            - generic [ref=e67]:
              - generic [ref=e68]: $24.8k
              - img "Revenue" [ref=e70]
            - generic [ref=e74]: +12% vs last week
          - article [ref=e76]:
            - generic [ref=e77]: Orders
            - generic [ref=e79]:
              - generic [ref=e80]: 1,284
              - img "Orders" [ref=e82]
            - generic [ref=e86]: −2.1% vs last week
          - article [ref=e88]:
            - generic [ref=e89]: Conversion
            - generic [ref=e91]:
              - generic [ref=e92]: 3.8%
              - img "Conversion" [ref=e94]
            - generic [ref=e98]: +12% vs last week
          - article [ref=e100]:
            - generic [ref=e101]: Avg. order
            - generic [ref=e103]:
              - generic [ref=e104]: $68.40
              - img "Avg. order" [ref=e106]
            - generic [ref=e110]: +12% vs last week
          - article [ref=e112]:
            - generic [ref=e113]: Visits
            - generic [ref=e115]:
              - generic [ref=e116]: 18.2k
              - img "Visits" [ref=e118]
            - generic [ref=e122]: −2.1% vs last week
          - article [ref=e124]:
            - generic [ref=e125]: Customers
            - generic [ref=e127]: "936"
            - generic [ref=e130]: +12% vs last week
        - region "OpenUI fixture" [ref=e132]:
          - article [ref=e135]:
            - generic [ref=e136]: Revenue
            - generic [ref=e138]:
              - generic [ref=e139]:
                - generic [ref=e140]: $24.8k
                - generic [ref=e141]: USD
              - img "Revenue" [ref=e142]
            - generic [ref=e146]:
              - generic [ref=e147]: +12% vs last week
              - generic [ref=e148]: Compared with last week
    - generic [ref=e149]:
      - heading "OpenUI fixture" [level=2] [ref=e150]
      - group [ref=e151]:
        - generic "Show fixture source" [ref=e152] [cursor=pointer]
    - navigation "Component pages" [ref=e153]:
      - 'link "Previous: PageHeader" [ref=e154] [cursor=pointer]':
        - /url: /components/PageHeader?locale=en&dir=ltr&theme=dark
        - text: "← Previous: PageHeader"
      - 'link "Next: BarChart" [ref=e155] [cursor=pointer]':
        - /url: /components/BarChart?locale=en&dir=ltr&theme=dark
        - text: "Next: BarChart →"
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | import { capturePreviewScreenshots, expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";
  3   | 
  4   | for (const locale of ["en", "ar"] as const) {
  5   | 	for (const theme of ["light", "dark"] as const) {
  6   | 		for (const name of ["Card", "PageHeader", "StatTile"] as const) {
  7   | 			test(`${name} dashboard states in ${locale} ${theme}`, async ({ page }, testInfo) => {
  8   | 				const direction = locale === "ar" ? "rtl" : "ltr";
  9   | 				await openPreview(page, { locale, direction, theme }, `/components/${name}`);
  10  | 				const examples = page.locator(".dashboard-component-preview");
  11  | 				await expect(examples).toBeVisible();
  12  | 				for (const [width, columns] of [
  13  | 					[1440, 2],
  14  | 					[480, 2],
  15  | 					[390, 2],
  16  | 					[339, 1],
  17  | 				] as const) {
  18  | 					await page.setViewportSize({ width, height: 900 });
  19  | 					if (name === "Card" || name === "StatTile") {
  20  | 						const grid = examples.locator(".ts-stat-grid").first();
  21  | 						await expect(grid).toHaveCSS("display", "grid");
  22  | 						expect(
  23  | 							await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length),
> 24  | 						).toBe(columns);
      |         ^ Error: expect(received).toBe(expected) // Object.is equality
  25  | 						const tiles = grid.locator('[data-slot="stat-tile"]');
  26  | 						const first = await tiles.nth(0).boundingBox();
  27  | 						const second = await tiles.nth(1).boundingBox();
  28  | 						expect(first).not.toBeNull();
  29  | 						expect(second).not.toBeNull();
  30  | 						if (first && second) {
  31  | 							if (columns === 1) expect(second.y).toBeGreaterThan(first.y);
  32  | 							else {
  33  | 								expect(second.y).toBeCloseTo(first.y, 0);
  34  | 								if (direction === "rtl") expect(second.x).toBeLessThan(first.x);
  35  | 								else expect(second.x).toBeGreaterThan(first.x);
  36  | 							}
  37  | 						}
  38  | 					}
  39  | 					if (name === "Card") {
  40  | 						await expect(examples.locator('.ts-card[data-variant="inset"]')).toBeVisible();
  41  | 						await expect(examples.locator('.ts-card--flush [data-slot="card-body"]')).toHaveCSS("padding", "0px");
  42  | 					} else if (name === "StatTile") {
  43  | 						const tiles = examples.locator(".ts-stat-grid > article");
  44  | 						await expect(tiles).toHaveCount(6);
  45  | 						await expect(tiles.last().getByRole("img")).toHaveCount(0);
  46  | 						await expect(tiles.first().getByRole("img")).toHaveAccessibleName(
  47  | 							locale === "ar" ? "الإيرادات" : "Revenue",
  48  | 						);
  49  | 						await expect(tiles.first().locator(".ts-stat-tile__delta")).toHaveText(
  50  | 							locale === "ar" ? "+١٢٪ مقارنة بالأسبوع الماضي" : "+12% vs last week",
  51  | 						);
  52  | 						await expect(tiles.nth(1).locator(".ts-stat-tile__delta")).toHaveText(
  53  | 							locale === "ar" ? "−٢٫١٪ مقارنة بالأسبوع الماضي" : "−2.1% vs last week",
  54  | 						);
  55  | 					} else {
  56  | 						await expect(
  57  | 							examples.getByRole("button", { name: locale === "ar" ? "تصدير التقرير" : "Export report" }),
  58  | 						).toBeVisible();
  59  | 						await expect(
  60  | 							examples
  61  | 								.locator(".ts-page-header")
  62  | 								.first()
  63  | 								.getByText(locale === "ar" ? "بيانات تجريبية" : "Demo data"),
  64  | 						).toBeVisible();
  65  | 					}
  66  | 					await expectAccessible(page);
  67  | 					await capturePreviewScreenshots(page, testInfo, `${name}-${locale}-${direction}-${theme}`, [width]);
  68  | 				}
  69  | 				await expectNoHorizontalScroll(page);
  70  | 			});
  71  | 		}
  72  | 	}
  73  | }
  74  | 
  75  | for (const locale of ["en", "ar"] as const) {
  76  | 	for (const theme of ["light", "dark"] as const) {
  77  | 		for (const name of ["BarChart", "Bars", "Distribution"] as const) {
  78  | 			test(`${name} chart states in ${locale} ${theme}`, async ({ page }, testInfo) => {
  79  | 				const direction = locale === "ar" ? "rtl" : "ltr";
  80  | 				await openPreview(page, { locale, direction, theme }, `/components/${name}`);
  81  | 				await expect(page.locator(".component-list .ts-card")).toBeVisible();
  82  | 				if (name === "BarChart") {
  83  | 					const columns = page.locator(".component-list .ts-bar-chart__column");
  84  | 					await expect(columns).toHaveCount(14);
  85  | 					await columns.first().focus();
  86  | 					await page.keyboard.press(direction === "rtl" ? "ArrowLeft" : "ArrowRight");
  87  | 					await expect(columns.nth(1)).toBeFocused();
  88  | 					await page.keyboard.press(direction === "rtl" ? "ArrowRight" : "ArrowLeft");
  89  | 					await expect(columns.first()).toBeFocused();
  90  | 					await page.locator(".component-list .ts-bar-chart").evaluate(
  91  | 						(element, dir) => {
  92  | 							element.setAttribute("dir", dir);
  93  | 						},
  94  | 						direction === "rtl" ? "ltr" : "rtl",
  95  | 					);
  96  | 					await page.keyboard.press(direction === "rtl" ? "ArrowRight" : "ArrowLeft");
  97  | 					await expect(columns.nth(1)).toBeFocused();
  98  | 					await page.keyboard.press(direction === "rtl" ? "ArrowLeft" : "ArrowRight");
  99  | 					await expect(columns.first()).toBeFocused();
  100 | 					await page
  101 | 						.locator(".component-list .ts-bar-chart")
  102 | 						.evaluate((element) => element.removeAttribute("dir"));
  103 | 				}
  104 | 				if (name === "Bars") await expect(page.locator(".component-list .ts-bars__row")).toHaveCount(2);
  105 | 				if (name === "Distribution")
  106 | 					await expect(page.locator(".component-list .ts-distribution__key li")).toHaveCount(3);
  107 | 				await expectAccessible(page);
  108 | 				for (const width of [1440, 390]) {
  109 | 					await page.setViewportSize({ width, height: 900 });
  110 | 					if (name === "BarChart") {
  111 | 						if (width === 1440) {
  112 | 							const last = await page.locator(".component-list .ts-bar-chart__column").last().boundingBox();
  113 | 							const plot = await page.locator(".component-list .ts-bar-chart__plot").boundingBox();
  114 | 							expect(last).not.toBeNull();
  115 | 							expect(plot).not.toBeNull();
  116 | 							if (last && plot) {
  117 | 								expect(last.x).toBeGreaterThanOrEqual(plot.x);
  118 | 								expect(last.x + last.width).toBeLessThanOrEqual(plot.x + plot.width);
  119 | 							}
  120 | 							await expect(page.locator(".component-list .ts-bar-chart__tick").last()).toHaveText(
  121 | 								locale === "ar" ? "٢٨ أكتوبر" : "Oct 28",
  122 | 							);
  123 | 						}
  124 | 						const positions = await page.locator(".component-list .ts-bar-chart").evaluate((chart) => {
```