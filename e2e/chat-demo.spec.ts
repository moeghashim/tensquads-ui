import { expect, test } from "@playwright/test";
import {
	capturePreviewScreenshots,
	expectAccessible,
	expectNoHorizontalScroll,
	expectThemeFocusRing,
	openPreview,
} from "./helpers/preview";

const states = [
	{
		locale: "en" as const,
		direction: "ltr" as const,
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

for (const localized of states) {
	for (const theme of ["light", "dark"] as const) {
		const state = { ...localized, theme };
		test(`chat demo submits inline form and uses its values in ${state.locale}/${theme}`, async ({
			page,
		}, testInfo) => {
			await openPreview(page, state, "/chat");
			await expect(page.getByRole("textbox", { name: state.storeLabel })).toBeVisible();
			await expect(page.getByRole("button", { name: state.approve })).toBeVisible();
			const form = page.locator(".ts-form");
			const formWidth = (await form.boundingBox())?.width ?? 0;
			const submitWidth =
				(await page.getByRole("button", { name: state.approve }).boundingBox())?.width ?? formWidth;
			const segmentWidth = (await form.locator("[data-slot='segmented-control']").boundingBox())?.width ?? formWidth;
			expect(submitWidth).toBeLessThan(formWidth);
			expect(segmentWidth).toBeLessThan(formWidth);
			const replyHeadingSize = await page
				.locator(".chat-demo__plan h2")
				.evaluate((heading) => Number.parseFloat(getComputedStyle(heading).fontSize));
			expect(replyHeadingSize).toBeLessThanOrEqual(20);
			const steps = page.locator(".chat-demo__steps");
			await expect(steps.locator(".ts-chat__step")).toHaveCount(3);
			await expect(steps.locator(".ts-chat__response-id")).toHaveText(["orders-204", "website-318", "master-421"]);
			await expect(page.locator(".chat-demo__header")).toContainText(state.locale === "ar" ? "بترا" : "Petra");
			await expect(page.locator(".chat-demo__plan > header")).toContainText("OpenUI");
			await expect(page.locator(".chat-guide li")).toHaveCount(6);
			await expect(page.locator(".chat-demo__suggestions button")).toHaveCount(3);
			for (const width of [1440, 390]) {
				await page.setViewportSize({ width, height: 900 });
				await expect
					.poll(() =>
						page
							.locator(".ts-chat__user-message")
							.first()
							.evaluate((message) => {
								const log = message.closest(".ts-chat__log");
								return !!log && message.getBoundingClientRect().top >= log.getBoundingClientRect().top;
							}),
					)
					.toBe(true);
			}
			await expectAccessible(page);
			await capturePreviewScreenshots(page, testInfo, `chat-${state.locale}-${theme}-before-approve`);

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
			await expect(
				page.getByRole("button", { name: state.locale === "en" ? "Send" : "إرسال", exact: true }),
			).toBeVisible();
			await capturePreviewScreenshots(page, testInfo, `chat-${state.locale}-${theme}-after-approve`);
			await expectNoHorizontalScroll(page);
			await expect(page.locator(".chat-demo__scripted")).toBeHidden();
			await expectAccessible(page);
		});
	}
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
	await page.getByRole("button", { name: "Send", exact: true }).click();
	await expect(page.locator(".ts-chat__log").getByText(states[0]!.freeReply)).toBeVisible();
});

test("chat reduced motion presents the completed fixture", async ({ page }) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/chat");
	await expect(page.getByRole("button", { name: "Approve plan" })).toBeVisible();
});

for (const state of states) {
	for (const store of ["$$ Deals", "A **B**", "{frequency} {email}", "[shop](https://example.com) `sale` \\ end"]) {
		test(`chat approval preserves literal store name ${store} in ${state.locale}`, async ({ page }) => {
			await openPreview(page, { ...state, theme: "light" }, "/chat");
			await page.getByRole("textbox", { name: state.storeLabel }).fill(store);
			await page.getByRole("button", { name: state.approve }).click();
			const followup = page.locator(".ts-chat-reply__markdown").last();
			await expect(followup).toHaveText(
				state.locale === "en"
					? `Plan approved for ${store}. I will send Weekly updates. Email notifications are on.`
					: `تم اعتماد خطة ${store}. سأرسل تحديثات أسبوعي. إشعارات البريد مفعّلة.`,
			);
			await expect(followup.locator("a, code")).toHaveCount(0);
		});
	}

	test(`chat approval with an empty store name shows no markdown markers in ${state.locale}`, async ({ page }) => {
		await openPreview(page, { ...state, theme: "light" }, "/chat");
		await page.getByRole("textbox", { name: state.storeLabel }).fill("   ");
		await page.getByRole("button", { name: state.approve }).click();
		const followup = page.locator(".ts-chat-reply__markdown").last();
		await expect(followup).toHaveText(
			state.locale === "en"
				? "Plan approved for your store. I will send Weekly updates. Email notifications are on."
				: "تم اعتماد خطة متجرك. سأرسل تحديثات أسبوعي. إشعارات البريد مفعّلة.",
		);
		await expect(followup.locator("strong")).toHaveCount(3);
	});

	test(`repeated opening requests keep one scripted opening in ${state.locale}`, async ({ page }) => {
		await openPreview(page, { ...state, theme: "light" }, "/chat");
		const field = page.getByRole("textbox", { name: state.storeLabel });
		await field.fill(state.store);
		const opening = state.locale === "en" ? "Set up a store for me" : "أعدّ لي متجراً";
		const composer = page.getByRole("textbox", {
			name: state.locale === "en" ? "Try a message" : "جرّب إرسال رسالة",
		});
		for (let count = 1; count <= 2; count += 1) {
			await composer.fill(opening);
			await page.getByRole("button", { name: state.locale === "en" ? "Send" : "إرسال", exact: true }).click();
			await expect(page.locator(".ts-chat-reply").getByText(state.freeReply, { exact: true })).toHaveCount(count);
			await expect(page.locator(".ts-chat__user-message")).toHaveCount(count + 1);
			await expect(page.locator(".chat-demo__steps")).toHaveCount(1);
			await expect(field).toHaveValue(state.store);
		}
		await page.getByRole("button", { name: state.approve }).click();
		await expect(field).toBeDisabled();
		await page.getByRole("button", { name: state.locale === "en" ? "Replay" : "إعادة العرض", exact: true }).click();
		await expect(page.getByRole("button", { name: state.approve })).toBeEnabled();
		await expect(page.locator(".chat-demo__steps")).toHaveCount(1);
		await expect(page.locator(".ts-chat__user-message")).toHaveCount(1);
	});
}

test("chat guide highlights the matching part on hover and focus", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/chat");
	await expectThemeFocusRing(page, "light");
	await expect(page.getByRole("button", { name: "Approve plan" })).toBeVisible();
	const guide = page.getByRole("complementary", { name: "In this screen" });
	const plan = guide.getByRole("link", { name: "OpenUI block" });
	await guide.getByRole("link", { name: "ChatReply" }).hover();
	await expect(page.locator(".chat-demo__turn--opening")).toHaveCSS("outline-width", "2px");
	await plan.hover();
	await expect(page.locator(".chat-demo__plan")).toHaveCSS("outline-width", "2px");
	await guide.getByRole("link", { name: "Step rows" }).focus();
	await expect(page.locator(".chat-demo__steps")).toHaveCSS("outline-width", "2px");
	await plan.click();
	await expect(page).toHaveURL(/\/components\/Form\?locale=en&dir=ltr&theme=light$/);
});

test("chat suggestions fill the composer and Send back locks the plan", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/chat");
	const sendBack = page.getByRole("button", { name: "Send back" });
	await sendBack.click();
	await expect(page.getByText("The plan is back for revision. Share what should change.")).toBeVisible();
	await expect(page.locator(".ts-chat__user-message").last()).toHaveText("Send back");
	await expect(page.getByRole("button", { name: "Approve plan" })).toBeDisabled();
	await page.getByRole("button", { name: "Add a returns policy" }).click();
	const field = page.getByRole("textbox", { name: "Try a message" });
	await expect(field).toHaveValue("Add a returns policy");
	await expect(field).toBeFocused();
});
