import { expect, test } from "@playwright/test";
import {
	capturePreviewScreenshots,
	expectAccessible,
	expectNoHorizontalScroll,
	openPreview,
	type PreviewState,
} from "./helpers/preview";

const states: PreviewState[] = [
	{ locale: "en", direction: "ltr", theme: "light" },
	{ locale: "en", direction: "ltr", theme: "dark" },
	{ locale: "ar", direction: "rtl", theme: "light" },
	{ locale: "ar", direction: "rtl", theme: "dark" },
];

for (const state of states) {
	test(`Chat docs show the surface in ${state.locale}/${state.theme}`, async ({ page }, testInfo) => {
		await openPreview(page, state, "/components/Chat");
		await expect(page.getByRole("log")).toBeVisible();
		if (state.locale === "en") {
			await expect(page.getByText("Help me plan the project")).toBeVisible();
			await expect(page.getByText("I will break the work into clear steps.")).toBeVisible();
			await expect(page.getByRole("button", { name: "New chat" })).toBeVisible();
		} else {
			await expect(page.getByText("ساعدني في تخطيط المشروع")).toBeVisible();
			await expect(page.getByRole("button", { name: "إرسال" })).toBeVisible();
		}
		await expectAccessible(page);
		await capturePreviewScreenshots(page, testInfo, `chat-${state.locale}-${state.theme}`);
		await expectNoHorizontalScroll(page);
	});
}

test("Chat composer inserts a newline with Shift+Enter and sends with Enter", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/components/Chat");
	const input = page.getByRole("textbox", { name: "Message" });
	await input.fill("First line");
	await input.press("End");
	await input.press("Shift+Enter");
	await expect(input).toHaveValue("First line\n");
	await input.press("Enter");
	await expect(input).toHaveValue("");
});

test("Chat action advances a turn and locks its control in English and Arabic", async ({ page }, testInfo) => {
	const cases = [
		{
			locale: "en",
			direction: "ltr",
			theme: "light",
			width: 1440,
			action: "Approve plan",
			locked: "Approved",
			pill: "Approve plan",
			reply: "Approval recorded. I will start the next step.",
		},
		{
			locale: "ar",
			direction: "rtl",
			theme: "dark",
			width: 390,
			action: "الموافقة على الخطة",
			locked: "تمت الموافقة",
			pill: "الموافقة على الخطة",
			reply: "تم تسجيل موافقتك. سأبدأ بالخطوة التالية.",
		},
	] as const;
	for (const state of cases) {
		await openPreview(page, state, "/components/Chat");
		await expect(page.getByRole("button", { name: state.action })).toBeEnabled();
		await capturePreviewScreenshots(page, testInfo, `ChatAction-before-${state.locale}-${state.theme}`, [
			state.width,
		]);
		await page.getByRole("button", { name: state.action }).click();
		await expect(page.getByText(state.pill, { exact: true })).toBeVisible();
		await expect(page.getByText(state.reply, { exact: true })).toBeVisible();
		await expect(page.getByRole("button", { name: state.locked })).toBeDisabled();
		await expectAccessible(page);
		await expectNoHorizontalScroll(page);
		await capturePreviewScreenshots(page, testInfo, `ChatAction-after-${state.locale}-${state.theme}`, [state.width]);
	}
});
