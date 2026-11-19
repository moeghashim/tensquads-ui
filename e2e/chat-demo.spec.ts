import { expect, test } from "@playwright/test";
import { capturePreviewScreenshots, expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

const states = [
	{
		locale: "en" as const,
		direction: "ltr" as const,
		theme: "light" as const,
		store: "Northstar Goods",
		storeLabel: "Store name",
		emailLabel: "Email me when done",
		frequency: "Monthly",
		weekly: "Weekly",
		monthly: "Monthly",
		approve: "Approve plan",
		action: "Approve plan",
		followup: "Plan approved for Northstar Goods. I will send Monthly updates. Email notifications are off.",
		freeReply: "This site has no live model. The chat demo uses a scripted reply.",
	},
	{
		locale: "ar" as const,
		direction: "rtl" as const,
		theme: "dark" as const,
		store: "متجر الندى",
		storeLabel: "اسم المتجر",
		emailLabel: "أرسل إليّ إشعاراً عند الانتهاء",
		frequency: "شهري",
		weekly: "أسبوعي",
		monthly: "شهري",
		approve: "اعتماد الخطة",
		action: "اعتماد الخطة",
		followup: "تم اعتماد خطة متجر الندى. سأرسل تحديثات شهري. إشعارات البريد غير مفعّلة.",
		freeReply: "لا يتصل هذا الموقع بنموذج مباشر. تستخدم المحادثة رداً معدّاً مسبقاً.",
	},
];

for (const state of states) {
	test(`chat demo submits inline form and uses its values in ${state.locale}`, async ({ page }, testInfo) => {
		await openPreview(page, state, "/chat");
		await expect(page.getByRole("textbox", { name: state.storeLabel })).toBeVisible();
		await expect(page.getByRole("button", { name: state.approve })).toBeVisible();
		const form = page.locator(".ts-form");
		const formWidth = (await form.boundingBox())?.width ?? 0;
		const submitWidth = (await page.getByRole("button", { name: state.approve }).boundingBox())?.width ?? formWidth;
		const segmentWidth = (await form.locator("[data-slot='segmented-control']").boundingBox())?.width ?? formWidth;
		expect(submitWidth).toBeLessThan(formWidth);
		expect(segmentWidth).toBeLessThan(formWidth);
		const replyHeadingSize = await page
			.locator(".ts-chat-reply__markdown h2")
			.evaluate((heading) => Number.parseFloat(getComputedStyle(heading).fontSize));
		expect(replyHeadingSize).toBeLessThanOrEqual(20);
		await expect(page.getByText("orders-204")).toBeVisible();
		await expect(page.getByText("website-318")).toBeVisible();
		await expect(page.getByText("master-421")).toBeVisible();
		if (state.locale === "en") {
			await page.setViewportSize({ width: 1440, height: 900 });
			await capturePreviewScreenshots(page, testInfo, "chat-en-light-before-approve", [1440]);
		} else {
			await page.setViewportSize({ width: 390, height: 844 });
			await capturePreviewScreenshots(page, testInfo, "chat-ar-dark-before-approve", [390]);
		}

		const field = page.getByRole("textbox", { name: state.storeLabel });
		const email = page.getByRole("switch", { name: state.emailLabel });
		const monthly = page.getByRole("radio", { name: state.monthly, exact: true });
		await field.fill(state.store);
		await email.click();
		await monthly.click();
		await page.getByRole("button", { name: state.approve }).click();

		await expect(page.getByText(state.followup, { exact: false })).toBeVisible();
		await expect(page.locator(".ts-chat__user-message").last()).toHaveText(state.action);
		await expect(field).toBeDisabled();
		await expect(email).toBeDisabled();
		await expect(monthly).toBeDisabled();
		await expect(monthly).toBeChecked();
		await expect(email).not.toBeChecked();
		await expect(page.getByRole("button", { name: state.locale === "en" ? "Send" : "إرسال" })).toBeVisible();
		if (state.locale === "ar") {
			await page.setViewportSize({ width: 390, height: 844 });
			await capturePreviewScreenshots(page, testInfo, "chat-ar-dark-after-approve", [390]);
		} else {
			await capturePreviewScreenshots(page, testInfo, "chat-en-light-after-approve", [1440]);
		}
		await expectNoHorizontalScroll(page);
		await expectAccessible(page);
	});
}

test("chat replay stays in its reserved panel and typed messages get the local scripted reply", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/chat");
	const surface = page.locator(".chat-demo__surface");
	const initialBounds = await surface.boundingBox();
	await page.getByRole("button", { name: "Replay", exact: true }).click();
	await expect(page.getByRole("button", { name: "Approve plan" })).toBeVisible();
	expect(await surface.boundingBox()).toMatchObject({ height: initialBounds?.height });
	const message = page.getByRole("textbox", { name: "Try a message" });
	await message.fill("Can you connect inventory?");
	await page.getByRole("button", { name: "Send" }).click();
	await expect(page.locator(".ts-chat__log").getByText(states[0]!.freeReply)).toBeVisible();
});

test("chat reduced motion presents the completed fixture", async ({ page }) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/chat");
	await expect(page.getByRole("button", { name: "Approve plan" })).toBeVisible();
});
