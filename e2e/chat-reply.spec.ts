import { expect, test } from "@playwright/test";
import { capturePreviewScreenshots, expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

for (const locale of ["en", "ar"] as const) {
	for (const theme of ["light", "dark"] as const) {
		test(`ChatReply renders ${locale} replies in ${theme} and attaches review screenshots`, async ({ page }, testInfo) => {
			const direction = locale === "ar" ? "rtl" : "ltr";
			await openPreview(page, { locale, direction, theme }, "/components/ChatReply");
			await expect(page.getByRole("heading", { name: locale === "ar" ? "حالة النشر" : "Deployment status" })).toBeVisible();
			await expect(page.locator(".ts-chat-reply__openui").getByText(locale === "ar" ? "جاهز" : "Ready", { exact: true })).toBeVisible();
			await expect(page.getByRole("button", { name: locale === "ar" ? "متابعة" : "Continue" })).toBeVisible();
			await expectAccessible(page);
			await expectNoHorizontalScroll(page);
			await capturePreviewScreenshots(page, testInfo, `ChatReply-${locale}-${direction}-${theme}`);
		});
	}
}
