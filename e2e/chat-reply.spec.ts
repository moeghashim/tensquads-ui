import { expect, test } from "@playwright/test";
import { capturePreviewScreenshots, expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

test("ChatReply renders localized mixed replies and attaches review screenshots", async ({ page }, testInfo) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/components/ChatReply");
	await expect(page.getByRole("heading", { name: "Deployment status" })).toBeVisible();
	await expect(page.getByText("Ready", { exact: true })).toBeVisible();
	await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
	await expectAccessible(page);
	await capturePreviewScreenshots(page, testInfo, "ChatReply", [1440]);

	await openPreview(page, { locale: "ar", direction: "rtl", theme: "dark" }, "/components/ChatReply");
	await expect(page.getByRole("heading", { name: "حالة النشر" })).toBeVisible();
	await expect(page.getByRole("button", { name: "متابعة" })).toBeVisible();
	await expectAccessible(page);
	await expectNoHorizontalScroll(page);
	await capturePreviewScreenshots(page, testInfo, "ChatReply", [390]);
});
