import { expect, test } from "@playwright/test";

test("component preview renders its locale fixture", async ({ page }) => {
	for (const locale of ["en", "ar"] as const) {
		await page.goto(`/components/Example?locale=${locale}&dir=${locale === "ar" ? "rtl" : "ltr"}&theme=light`);
		await expect(page.getByRole("heading", { name: "Example" })).toBeVisible();
		await expect(
			page.getByText(locale === "en" ? "OpenUI fixture rendered in English" : "تم عرض عينة OpenUI باللغة العربية"),
		).toBeVisible();
	}
});
