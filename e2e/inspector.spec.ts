import { expect, type Locator, type Page, test } from "@playwright/test";
import { capturePreviewScreenshots, expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

for (const locale of ["en", "ar"] as const) {
	for (const theme of ["light", "dark"] as const) {
		test(`Inspector edits fields and runs actions in ${locale} ${theme}`, async ({ page }) => {
			const ar = locale === "ar";
			const direction = ar ? "rtl" : "ltr";
			await openPreview(page, { locale, direction, theme }, "/components/Inspector");
			await capturePreviewScreenshots(page, test.info(), `inspector-${locale}-${direction}-${theme}`);
			const inspector = page.getByRole("region", { name: ar ? "وكيل" : "Agent" });
			const name = inspector.getByRole("textbox", { name: ar ? "الاسم" : "Name" });
			const instructions = inspector.getByRole("textbox", { name: ar ? "التعليمات" : "Instructions" });
			const reasoning = inspector.getByRole("switch", { name: ar ? "الاستدلال" : "Reasoning" });
			const before = await instructions.boundingBox();
			await name.fill(ar ? "مينا" : "Mina");
			const longLine = ar
				? "ساعد العملاء في طلباتهم وقدم خطوات واضحة للمستخدم. ".repeat(12)
				: "Help customers with their orders and give clear next steps. ".repeat(12);
			await instructions.fill(`${longLine}\n${longLine}`);
			await expect
				.poll(async () => (await instructions.boundingBox())?.height ?? 0)
				.toBeGreaterThan(before?.height ?? 0);
			await reasoning.focus();
			await page.keyboard.press("Space");
			await expect(reasoning).not.toBeChecked();
			await page.getByRole("button", { name: ar ? "تكرار" : "Duplicate" }).focus();
			await expect(page.getByRole("tooltip")).toHaveText(ar ? "تكرار" : "Duplicate");
			for (const [name, status] of [
				[ar ? "إضافة اقتراح" : "Add a suggestion", ar ? "تمت إضافة اقتراح" : "Suggestion added"],
				[ar ? "تكرار" : "Duplicate", ar ? "تم تكرار الوكيل" : "Agent duplicated"],
				[ar ? "حذف" : "Delete", ar ? "تم حذف الوكيل" : "Agent deleted"],
				[ar ? "المزيد" : "More", ar ? "تم فتح المزيد" : "More options opened"],
				[ar ? "تقييم" : "Evaluate", ar ? "بدأ التقييم" : "Evaluation started"],
			] as const) {
				await page.getByRole("button", { name }).click();
				await expect(page.getByRole("status")).toContainText(status);
			}
			await expect(nameFieldRow(name)).toHaveCSS("height", "28px");
			await expect(nameFieldRow(reasoning)).toHaveCSS("height", "28px");
			const labelBox = await inspector.getByText(ar ? "الاسم" : "Name", { exact: true }).boundingBox();
			const inputBox = await name.boundingBox();
			expect(labelBox).not.toBeNull();
			expect(inputBox).not.toBeNull();
			if (direction === "rtl") expect(labelBox!.x).toBeGreaterThan(inputBox!.x);
			else expect(labelBox!.x).toBeLessThan(inputBox!.x);
			await page.setViewportSize({ width: 390, height: 844 });
			await expectNoHorizontalScroll(page);
			await page.setViewportSize({ width: 360, height: 844 });
			await expectNoHorizontalScroll(page);
			await expectAccessible(page);
		});

		test(`Inspector chooses, connects and removes by keyboard in ${locale} ${theme}`, async ({ page }) => {
			const ar = locale === "ar";
			const direction = ar ? "rtl" : "ltr";
			await openPreview(page, { locale, direction, theme }, "/components/Inspector");
			const inspector = page.getByRole("region", { name: ar ? "وكيل" : "Agent" });
			const model = inspector.getByRole("combobox", { name: ar ? "النموذج" : "Model" });
			const connects = inspector.getByRole("combobox", { name: ar ? "يتصل بـ" : "Connects to" });
			const list = page.getByRole("listbox");
			for (const field of [model, connects]) await expect(nameFieldRow(field)).toHaveCSS("height", "28px");

			await model.focus();
			await page.keyboard.press("Enter");
			await expect(list).toBeVisible();
			await page.keyboard.press("ArrowDown");
			await page.keyboard.press("Enter");
			await expect(list).toBeHidden();
			await expect(model).toBeFocused();
			await expect(model).toHaveText(ar ? "دقيق" : "Thorough");

			// The whole row is the trigger, so a press on the label opens the list.
			const label = (await inspector.getByText(ar ? "النموذج" : "Model", { exact: true }).boundingBox())!;
			await page.mouse.click(label.x + label.width / 2, label.y + label.height / 2);
			await expect(list).toBeVisible();
			await page.keyboard.press("Escape");
			await expect(list).toBeHidden();

			await connects.focus();
			await page.keyboard.press("Enter");
			await expect(list).toBeVisible();
			await page.keyboard.press("ArrowDown");
			await page.keyboard.press("Enter");
			await expect(list).toBeVisible();
			await page.keyboard.press("ArrowDown");
			await page.keyboard.press("Enter");
			await expect(list.getByRole("option", { selected: true })).toHaveCount(3);
			await finishAnimations(page);
			await capturePreviewScreenshots(page, test.info(), `inspector-list-${locale}-${direction}-${theme}`);
			await expectAccessible(page);
			await page.keyboard.press("Escape");
			await expect(list).toBeHidden();
			await expect(connects).toBeFocused();
			await expect(connects.locator('[aria-hidden="true"]').first()).toHaveText(
				ar ? "صياغة الرد، +2" : "Draft reply, +2",
			);

			const chips = inspector.getByRole("list", { name: ar ? "مخطط الإخراج" : "Output schema" });
			const add = inspector.getByRole("button", { name: ar ? "إضافة مخطط الإخراج" : "Add Output schema" });
			await add.focus();
			await page.keyboard.press("Enter");
			await expect(chips.getByRole("listitem")).toHaveCount(2);
			await chips.getByRole("button").first().press("Enter");
			await expect(chips.getByRole("listitem")).toHaveCount(1);
			await expect(chips.getByRole("button")).toBeFocused();
			await page.keyboard.press("Enter");
			await expect(add).toBeFocused();

			await page.setViewportSize({ width: 390, height: 844 });
			await connects.click();
			await expect(list).toBeVisible();
			await finishAnimations(page);
			const box = (await list.boundingBox())!;
			expect(box.x).toBeGreaterThanOrEqual(0);
			expect(box.x + box.width).toBeLessThanOrEqual(390);
			await expectNoHorizontalScroll(page);
		});
	}
}

function nameFieldRow(input: Locator) {
	return input.locator("xpath=ancestor::*[@data-slot='field'][1]");
}

async function finishAnimations(page: Page) {
	await page.evaluate(() => Promise.all(document.getAnimations().map((animation) => animation.finished)));
}
