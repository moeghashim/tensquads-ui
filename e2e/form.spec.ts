import { expect, test } from "@playwright/test";
import { capturePreviewScreenshots, expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

for (const locale of ["en", "ar"] as const) {
	for (const theme of ["light", "dark"] as const) {
		test(`Form submits current values and locks in ${locale}/${theme}`, async ({ page }, testInfo) => {
			const ar = locale === "ar";
			await openPreview(page, { locale, theme, direction: ar ? "rtl" : "ltr" }, "/components/Form");
			const example = page.getByTestId("form-example");
			const name = example.getByRole("textbox", { name: ar ? "اسم المشروع" : "Project name" });
			const owner = example.getByRole("textbox", { name: ar ? "المسؤول" : "Owner" });
			const submit = example.getByRole("button", { name: ar ? "حفظ المشروع" : "Save project" });
			await name.focus();
			await expect(name).toBeFocused();
			await page.keyboard.press("Tab");
			await expect(owner).toBeFocused();
			await page.keyboard.press("Tab");
			await expect(submit).toBeFocused();
			await name.fill(ar ? "مشروع جديد" : "New project");
			await owner.fill(ar ? "سارة" : "Sarah");
			await expectAccessible(page);
			await capturePreviewScreenshots(page, testInfo, `Form-before-${locale}-${theme}`);
			if (theme === "light") await owner.press("Enter");
			else await submit.click();
			await expect(example.getByText(ar ? "تم حفظ المشروع." : "Project saved.")).toBeVisible();
			await expect(example.locator(".ts-chat__user-message")).toHaveText(ar ? "حفظ المشروع" : "Save project");
			await expect(name).toHaveValue(ar ? "مشروع جديد" : "New project");
			await expect(owner).toHaveValue(ar ? "سارة" : "Sarah");
			for (const control of [name, owner, submit]) await expect(control).toBeDisabled();
			await expectAccessible(page);
			await capturePreviewScreenshots(page, testInfo, `Form-after-${locale}-${theme}`);
			await expectNoHorizontalScroll(page);
		});
	}
}
