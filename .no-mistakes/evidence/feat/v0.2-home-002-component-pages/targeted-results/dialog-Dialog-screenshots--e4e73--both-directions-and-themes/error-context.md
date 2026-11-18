# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dialog.spec.ts >> Dialog screenshots cover closed and open states in both directions and themes
- Location: e2e/dialog.spec.ts:12:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toHaveCSS(expected) failed

Locator:  getByRole('dialog', { name: 'تعديل المشروع', exact: true })
Expected: "1"
Received: "0"

Call log:
  - Expect "toHaveCSS" getByRole('dialog', { name: 'تعديل المشروع', exact: true }) with timeout 5000ms
  - waiting for getByRole('dialog', { name: 'تعديل المشروع', exact: true })
    - locator resolved to <div data-open="" role="dialog" tabindex="-1" popover="manual" aria-modal="true" class="ts-dialog__content" data-slot="dialog-content" data-presentation="dialog" id="ui-sdk-_R_aediq_-content" aria-labelledby="ui-sdk-_R_aediq_-title" aria-describedby="ui-sdk-_R_aediq_-description">…</div>
    - unexpected value "0"
  - Test timeout of 30000ms exceeded.

```

```yaml
- dialog "تعديل المشروع":
  - heading "تعديل المشروع" [level=2]
  - paragraph: حدّث اسم المشروع ووصفه.
  - text: اسم المشروع
  - textbox "اسم المشروع": نورث ستار
  - button "إلغاء"
  - button "حفظ التغييرات"
```

# Test source

```ts
  1   | import AxeBuilder from "@axe-core/playwright";
  2   | import { expect, test } from "@playwright/test";
  3   | import { capturePreviewScreenshots, expectThemeFocusRing, openPreview, type PreviewState } from "./helpers/preview";
  4   | 
  5   | const states: PreviewState[] = [
  6   | 	{ locale: "en", direction: "ltr", theme: "light" },
  7   | 	{ locale: "en", direction: "ltr", theme: "dark" },
  8   | 	{ locale: "ar", direction: "rtl", theme: "light" },
  9   | 	{ locale: "ar", direction: "rtl", theme: "dark" },
  10  | ];
  11  | 
  12  | test("Dialog screenshots cover closed and open states in both directions and themes", async ({ page }, testInfo) => {
  13  | 	for (const state of states) {
  14  | 		await openPreview(page, state, "/components/Dialog");
  15  | 		const copy =
  16  | 			state.locale === "en"
  17  | 				? {
  18  | 						simpleTrigger: "Open dialog",
  19  | 						simpleTitle: "Review request",
  20  | 						formTrigger: "Edit project",
  21  | 						formTitle: "Edit project",
  22  | 						field: "Project name",
  23  | 						deleteTrigger: "Delete project",
  24  | 						deleteTitle: "Delete project?",
  25  | 					}
  26  | 				: {
  27  | 						simpleTrigger: "فتح الحوار",
  28  | 						simpleTitle: "مراجعة الطلب",
  29  | 						formTrigger: "تعديل المشروع",
  30  | 						formTitle: "تعديل المشروع",
  31  | 						field: "اسم المشروع",
  32  | 						deleteTrigger: "حذف المشروع",
  33  | 						deleteTitle: "حذف المشروع؟",
  34  | 					};
  35  | 		const examples = [
  36  | 			{ id: "simple", trigger: copy.simpleTrigger, title: copy.simpleTitle },
  37  | 			{ id: "form", trigger: copy.formTrigger, title: copy.formTitle },
  38  | 			{ id: "destructive", trigger: copy.deleteTrigger, title: copy.deleteTitle },
  39  | 		];
  40  | 		const trigger = page.getByRole("button", { name: copy.simpleTrigger });
  41  | 		const fixtureTrigger = page
  42  | 			.getByRole("region", { name: state.locale === "en" ? "OpenUI fixture" : "عينة OpenUI" })
  43  | 			.getByRole("button", { name: state.locale === "en" ? "Review" : "مراجعة" });
  44  | 		await expect(trigger).toBeVisible();
  45  | 		await expect(fixtureTrigger).toBeVisible();
  46  | 		await expect(page.getByRole("dialog")).toHaveCount(0);
  47  | 		await capturePreviewScreenshots(page, testInfo, `dialog-${state.locale}-${state.theme}-closed`);
  48  | 		await expectThemeFocusRing(page, state.theme);
  49  | 		for (const example of examples) {
  50  | 			for (const width of [1440, 390]) {
  51  | 				await page.setViewportSize({ width, height: 900 });
  52  | 				await page.getByRole("button", { name: example.trigger, exact: true }).click();
  53  | 				const dialog = page.getByRole("dialog", { name: example.title, exact: true });
  54  | 				await expect(dialog).toBeVisible();
  55  | 				await expect(dialog).toHaveAttribute("data-open");
  56  | 				await expect(dialog).not.toHaveAttribute("data-starting-style");
  57  | 				await page.evaluate(() => document.fonts.ready);
> 58  | 				await expect(dialog).toHaveCSS("opacity", "1");
      |                          ^ Error: expect(locator).toHaveCSS(expected) failed
  59  | 				if (example.id === "form") {
  60  | 					await expect(dialog.getByRole("textbox", { name: copy.field })).toBeVisible();
  61  | 				}
  62  | 				const axe = await new AxeBuilder({ page }).analyze();
  63  | 				expect(axe.violations).toEqual([]);
  64  | 				const bounds = await dialog.boundingBox();
  65  | 				expect(bounds).not.toBeNull();
  66  | 				if (!bounds) throw new Error("Dialog has no visible bounds");
  67  | 				expect(bounds.x).toBeGreaterThanOrEqual(0);
  68  | 				expect(bounds.y).toBeGreaterThanOrEqual(0);
  69  | 				expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
  70  | 				expect(bounds.y + bounds.height).toBeLessThanOrEqual(900);
  71  | 				await capturePreviewScreenshots(
  72  | 					page,
  73  | 					testInfo,
  74  | 					`dialog-${state.locale}-${state.theme}-${example.id}-open`,
  75  | 					[width],
  76  | 				);
  77  | 				const dimensions = await page.evaluate(() => ({
  78  | 					viewport: document.documentElement.clientWidth,
  79  | 					content: document.documentElement.scrollWidth,
  80  | 				}));
  81  | 				expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  82  | 				await page.keyboard.press("Escape");
  83  | 				await expect(dialog).toHaveCount(0);
  84  | 			}
  85  | 		}
  86  | 	}
  87  | });
  88  | 
  89  | test("every Dialog example stays within the viewport", async ({ page }) => {
  90  | 	for (const state of states) {
  91  | 		await openPreview(page, state, "/components/Dialog");
  92  | 		const labels =
  93  | 			state.locale === "en"
  94  | 				? ["Open dialog", "Edit project", "Delete project", "Review"]
  95  | 				: ["فتح الحوار", "تعديل المشروع", "حذف المشروع", "مراجعة"];
  96  | 		for (const width of [1440, 390]) {
  97  | 			await page.setViewportSize({ width, height: 900 });
  98  | 			for (const name of labels) {
  99  | 				await page.getByRole("button", { name, exact: true }).click();
  100 | 				const dialog = page.getByRole("dialog");
  101 | 				await expect(dialog).toBeVisible();
  102 | 				await expect(dialog).not.toHaveAttribute("data-starting-style");
  103 | 				const bounds = await dialog.boundingBox();
  104 | 				expect(bounds).not.toBeNull();
  105 | 				if (!bounds) throw new Error("Dialog has no visible bounds");
  106 | 				expect(bounds.x).toBeGreaterThanOrEqual(0);
  107 | 				expect(bounds.y).toBeGreaterThanOrEqual(0);
  108 | 				expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
  109 | 				expect(bounds.y + bounds.height).toBeLessThanOrEqual(900);
  110 | 				await page.keyboard.press("Escape");
  111 | 				await expect(dialog).toHaveCount(0);
  112 | 			}
  113 | 		}
  114 | 	}
  115 | });
  116 | 
  117 | test("Dialog traps Tab, opens from the keyboard, and returns focus after Escape", async ({ page }) => {
  118 | 	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/components/Dialog");
  119 | 	const trigger = page.getByRole("button", { name: "Open dialog" });
  120 | 	await trigger.focus();
  121 | 	await page.keyboard.press("Enter");
  122 | 	const dialog = page.getByRole("dialog", { name: "Review request" });
  123 | 	await expect(dialog).toBeVisible();
  124 | 	await expect(dialog).toContainText("Review their profile before adding them to the squad.");
  125 | 	await expect
  126 | 		.poll(() => page.evaluate(() => document.activeElement?.closest('[data-slot="dialog-content"]') !== null))
  127 | 		.toBe(true);
  128 | 	const controls = dialog.getByRole("button");
  129 | 	await controls.last().focus();
  130 | 	await page.keyboard.press("Tab");
  131 | 	await expect(controls.first()).toBeFocused();
  132 | 	await page.keyboard.press("Escape");
  133 | 	await expect(dialog).toHaveCount(0);
  134 | 	await expect(trigger).toBeFocused();
  135 | });
  136 | 
```