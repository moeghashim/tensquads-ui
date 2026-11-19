import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll, openPreview } from "./helpers/preview";

// Agent-UI's Button contract specifies a 32px medium control.
for (const [locale, direction, theme] of [
	["en", "ltr", "light"],
	["en", "ltr", "dark"],
	["ar", "rtl", "light"],
	["ar", "rtl", "dark"],
] as const) {
	for (const name of ["ApprovalCard", "OwnerMessageView"] as const) {
		test(`${name} medium controls and spacing in ${locale} ${theme}`, async ({ page }, testInfo) => {
			await openPreview(page, { locale, direction, theme }, `/components/${name}`);
			const preview = page.locator(".owner-message-preview");
			const cards = preview.locator(".ts-approval-card");
			await expect(cards).toHaveCount(name === "ApprovalCard" ? 2 : 1);
			for (const width of [1440, 390]) {
				await page.setViewportSize({ width, height: 900 });
				for (const button of await preview.locator("button").all()) {
					expect((await button.boundingBox())?.height).toBe(32);
				}
				for (const card of await cards.all()) {
					const gaps = await card.evaluate((element) => {
						const header = element.querySelector("header")!.getBoundingClientRect();
						const children = [...element.querySelector(".ts-card__body")!.children];
						const rects = children.map((child) => child.getBoundingClientRect());
						return {
							header: rects[0].top - header.bottom,
							body: rects[1].top - rects[0].bottom,
							footer: rects.at(-1)!.top - rects.at(-2)!.bottom,
						};
					});
					// The header shares the body rhythm; the decision row has double separation.
					expect(gaps.header).toBe(gaps.body);
					expect(gaps.footer).toBe(2 * gaps.body);
				}
				await testInfo.attach(`${name}-${locale}-${theme}-${width}.png`, {
					body: await preview.screenshot(),
					contentType: "image/png",
				});
			}
			await expectNoHorizontalScroll(page);
			const commands = page.getByRole("region", {
				name: locale === "ar" ? "الأوامر المرسلة" : "Sent commands",
			});
			if (name === "OwnerMessageView") {
				const options = preview.locator(".ts-owner-message__options button");
				await options.nth(1).focus();
				await page.keyboard.press("Enter");
				await expect(options.nth(1)).toHaveAttribute("aria-pressed", "true");
				for (const option of await options.all()) await expect(option).toBeDisabled();
				await expect(commands).toContainText('"type": "OwnerAnswer"');
				await expect(commands).toContainText('"questionId": "question_42"');
			}
			for (const [index, card] of (await cards.all()).entries()) {
				const buttons = card.getByRole("button");
				const reject = index === 1 || name === "OwnerMessageView";
				await buttons.nth(reject ? 1 : 0).focus();
				await page.keyboard.press("Space");
				await expect(card.locator(".ts-approval-card__outcome")).toHaveText(
					locale === "ar" ? (reject ? "تم الرفض" : "تمت الموافقة") : reject ? "Declined" : "Approved",
				);
				for (const button of await buttons.all()) await expect(button).toBeDisabled();
				await expect(commands).toContainText('"approvalId": "approval_42"');
				await expect(commands).toContainText('"contentHash": "sha256:42"');
				await expect(commands).toContainText(`"decision": "${reject ? "reject" : "approve"}"`);
			}
			await expectNoHorizontalScroll(page);
			await testInfo.attach(`${name}-${locale}-${theme}-decided.png`, {
				body: await preview.screenshot(),
				contentType: "image/png",
			});
		});
	}
}
