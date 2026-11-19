import { expect, test } from "@playwright/test";
import { capturePreviewScreenshots, expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

for (const [locale, direction, theme] of [
	["en", "ltr", "light"],
	["en", "ltr", "dark"],
	["ar", "rtl", "light"],
	["ar", "rtl", "dark"],
] as const) {
	for (const name of ["ApprovalCard", "OwnerMessageView"] as const) {
		test(`${name} platform contract preview in ${locale} ${theme}`, async ({ page }, testInfo) => {
			await openPreview(page, { locale, direction, theme }, `/components/${name}`);
			if (name === "ApprovalCard") {
				const cards = page.locator(".ts-approval-card");
				await expect(cards).toHaveCount(2);
				await cards
					.first()
					.getByRole("button", { name: locale === "ar" ? "موافقة" : "Approve" })
					.click();
				await expect(page.locator(".ts-approval-card__outcome").first()).toHaveText(
					locale === "ar" ? "تمت الموافقة" : "Approved",
				);
				await cards
					.nth(1)
					.getByRole("button", { name: locale === "ar" ? "موافقة" : "Approve" })
					.click();
			} else {
				await expect(page.locator(".ts-owner-messages > *")).toHaveCount(6);
				await page.getByRole("button", { name: locale === "ar" ? "عاجل" : "Urgent" }).click();
			}
			await expect(
				page.getByRole("region", { name: locale === "ar" ? "الأوامر المرسلة" : "Sent commands" }),
			).toContainText(name === "ApprovalCard" ? "ApprovalDecision" : "OwnerAnswer");
			if (name === "ApprovalCard") {
				await expect(
					page.getByRole("region", { name: locale === "ar" ? "الأوامر المرسلة" : "Sent commands" }),
				).toContainText("contentHash");
			}
			await expectAccessible(page);
			for (const width of [1440, 390]) {
				await page.setViewportSize({ width, height: 900 });
				await capturePreviewScreenshots(page, testInfo, `${name}-${locale}-${direction}-${theme}`, [width]);
			}
			await expectNoHorizontalScroll(page);
		});
	}
}
