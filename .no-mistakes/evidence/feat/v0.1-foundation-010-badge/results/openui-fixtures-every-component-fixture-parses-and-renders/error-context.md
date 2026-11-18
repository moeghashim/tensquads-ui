# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: openui/fixtures.spec.ts >> every component fixture parses and renders
- Location: e2e/openui/fixtures.spec.ts:6:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('region', { name: 'OpenUI fixture' }).getByRole('img', { name: 'Petra, Planning' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('region', { name: 'OpenUI fixture' }).getByRole('img', { name: 'Petra, Planning' }) with timeout 5000ms
  - waiting for getByRole('region', { name: 'OpenUI fixture' }).getByRole('img', { name: 'Petra, Planning' })

```

```yaml
- main:
  - link "Back to gallery":
    - /url: /?locale=en&dir=ltr&theme=light
  - paragraph: Component preview
  - heading "Badge" [level=1]
  - region "Badge tones": Draft Complete Pending Failed Information
  - region "OpenUI fixture": Ready
```

# Test source

```ts
  1  | import { readFileSync } from "node:fs";
  2  | import { createParser } from "@openuidev/lang-core";
  3  | import { expect, test } from "@playwright/test";
  4  | import { createTensquadsLibrary, getRegisteredComponents } from "../../packages/ui/src/openui";
  5  | 
  6  | test("every component fixture parses and renders", async ({ page }) => {
  7  | 	for (const locale of ["en", "ar"] as const) {
  8  | 		for (const component of getRegisteredComponents()) {
  9  | 			const fixture = readFileSync(
  10 | 				`packages/ui/src/react/${component.name}/${component.name}.fixture.${locale}.txt`,
  11 | 				"utf8",
  12 | 			);
  13 | 			const parsed = createParser(createTensquadsLibrary(locale).toJSONSchema()).parse(fixture);
  14 | 			expect(parsed?.root).toBeTruthy();
  15 | 			expect(parsed?.meta.errors).toEqual([]);
  16 | 			await page.goto(
  17 | 				`/components/${component.name}?locale=${locale}&dir=${locale === "ar" ? "rtl" : "ltr"}&theme=light`,
  18 | 			);
  19 | 			await expect(page.getByRole("heading", { name: component.name })).toBeVisible();
  20 | 			const fixtureRegion = page.getByRole("region", {
  21 | 				name: locale === "en" ? "OpenUI fixture" : "عينة OpenUI",
  22 | 			});
  23 | 			if (component.name === "Button") {
  24 | 				await expect(
  25 | 					fixtureRegion.getByRole("button", { name: locale === "en" ? "Continue" : "متابعة" }),
  26 | 				).toBeVisible();
  27 | 			} else {
  28 | 				const image = fixtureRegion.getByRole("img", {
  29 | 					name: locale === "en" ? "Petra, Planning" : "بترا، تخطيط",
  30 | 				});
> 31 | 				await expect(image).toBeVisible();
     |                         ^ Error: expect(locator).toBeVisible() failed
  32 | 				await expect(image).toHaveCSS("width", "64px");
  33 | 				await expect(image).toHaveCSS("height", "64px");
  34 | 			}
  35 | 		}
  36 | 	}
  37 | });
  38 | 
```