import { expect, test } from "@playwright/test";
import { capturePreviewScreenshots, expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

test("admin dashboard filters companies and selects image details", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/dashboards/admin");
	await expect(page.getByRole("row")).toHaveCount(10);
	await expect(page.locator(".ts-bars__labels")).toHaveText(["Growth4", "Starter3", "Scale2"]);
	const online = await page.getByRole("row").all();
	const onlineCounts = await Promise.all(online.slice(1).map((row) => row.getByRole("cell").last().innerText()));
	expect(onlineCounts.reduce((sum, value) => sum + Number(value), 0)).toBe(53);
	await page.getByRole("button", { name: "Trial", exact: true }).click();
	await expect(page.getByRole("row")).toHaveCount(3);
	await page.getByRole("button", { name: "All", exact: true }).click();
	await page.getByRole("textbox", { name: "Search companies" }).fill("northstar");
	await expect(page.getByRole("row")).toHaveCount(2);
	await page.getByRole("textbox", { name: "Search companies" }).fill("no matching company");
	await expect(page.locator("[data-slot='empty-state']")).toBeVisible();
	await page.getByRole("button", { name: "Clear filters" }).click();
	await page.getByRole("button", { name: "Squad images" }).click();
	await expect(page).toHaveURL(/view=images/);
	await page.getByRole("button", { name: "With bugs" }).click();
	await expect(page.getByRole("row")).toHaveCount(3);
	await page.getByRole("button", { name: "All", exact: true }).click();
	await page.getByRole("row", { name: /squad\/pisa.svg/ }).click();
	await expect(page.locator(".dashboard-details")).toContainText("pisa.svg");
	await expect(page.locator(".dashboard-stack .ts-card").nth(1).locator("p")).toHaveCount(0);
	await expect(page.locator(".dashboard-stack .ts-card").nth(2).locator("p")).toHaveCount(0);
	await page.getByRole("button", { name: "With requests" }).click();
	await expect(page.getByRole("row")).toHaveCount(2);
	await page.getByRole("row", { name: /squad\/kyoto.svg/ }).click();
	await expect(page.locator(".dashboard-details")).toContainText("kyoto.svg");
	await expect(page.locator(".dashboard-stack .ts-card").nth(1).locator("p")).toHaveCount(2);
	await expect(page.locator(".dashboard-stack .ts-card").nth(2).locator("p")).toHaveCount(5);
	await expectAccessible(page);
	await expectNoHorizontalScroll(page);
});

test("store approvals send a command and launcher preserves URL state", async ({ page }) => {
	await openPreview(page, { locale: "ar", direction: "rtl", theme: "dark" }, "/dashboards/home");
	await expect(page.getByRole("heading", { name: /Moe/ })).toBeVisible();
	await expect(page.getByRole("button", { name: "موافقة" }).first()).toBeEnabled();
	await page.getByRole("button", { name: "موافقة" }).first().click();
	await expect(page.locator(".ts-card__count")).toHaveText("3");
	await expect(page.locator(".sent-commands")).toBeVisible();
	await expect(page.locator(".sent-commands")).not.toHaveAttribute("open", "");
	await page.getByText("الأوامر المُرسلة", { exact: true }).click();
	await expect(page.locator(".sent-commands pre")).toContainText('"type": "ApprovalDecision"');
	await expect(page.locator(".ts-approval-card__agent").first()).toContainText("كيوتو");
	await expectAccessible(page);
	await expectNoHorizontalScroll(page);
	await expect(page.getByRole("button", { name: /اسأل بيترا.*٣ بانتظارك/ })).toBeVisible();
	await page.getByRole("button", { name: /اسأل بيترا.*٣ بانتظارك/ }).click();
	await expect(page).toHaveURL(/\/chat\?.*locale=ar.*dir=rtl.*theme=dark/);
});

for (const [locale, direction] of [
	["en", "ltr"],
	["ar", "rtl"],
] as const) {
	for (const theme of ["light", "dark"] as const) {
		for (const view of ["home", "companies", "images"] as const) {
			for (const width of [1440, 1180, 760, 390]) {
				test(`dashboard ${view} ${locale} ${theme} at ${width}px`, async ({ page }, testInfo) => {
					await page.setViewportSize({ width, height: 900 });
					await openPreview(
						page,
						{ locale, direction, theme },
						`/dashboards/${view === "home" ? "home" : "admin"}`,
					);
					if (view === "images") {
						if (width <= 760) {
							await page
								.getByRole("button", { name: locale === "ar" ? "فتح التنقل" : "Open navigation" })
								.click();
						}
						await page.getByRole("button", { name: locale === "ar" ? "صور الفرق" : "Squad images" }).click();
						await expect(page).toHaveURL(/view=images/);
						await expect(page.getByRole("dialog")).toHaveCount(0);
						await expect(page.locator(".dashboard-details")).toContainText(
							locale === "ar" ? "١٤ نوفمبر ٢٠٢٥" : "Nov 14, 2025",
						);
					}
					await expect(page.locator(".dashboard-panel h1")).toBeVisible();
					if (view === "companies") {
						await expect(page.locator(".ts-bars__labels")).toHaveText(["Growth4", "Starter3", "Scale2"]);
					} else if (view === "home") {
						await expect(page.locator(".ts-bar-chart__legend li")).toHaveText([
							locale === "ar" ? "الأسبوع السابق" : "Previous week",
							locale === "ar" ? "هذا الأسبوع" : "This week",
						]);
						await expect(page.locator(".ts-stat-tile__delta")).toHaveCount(4);
						if (width === 390) {
							await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
							const [launcher, lastActions] = await Promise.all([
								page.getByRole("button", { name: /Ask Petra|اسأل بيترا/ }).boundingBox(),
								page.locator(".ts-approval-card__footer").last().boundingBox(),
							]);
							expect(launcher).not.toBeNull();
							expect(lastActions).not.toBeNull();
							expect(lastActions!.y + lastActions!.height).toBeLessThanOrEqual(launcher!.y);
						}
					}
					await expectAccessible(page);
					const dimensions = await page.evaluate(() => ({
						viewport: document.documentElement.clientWidth,
						content: document.documentElement.scrollWidth,
					}));
					expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
					await capturePreviewScreenshots(page, testInfo, `dashboard-${view}-${locale}-${direction}-${theme}`, [
						width,
					]);
				});
			}
		}
	}
}

test("approval decisions survive language changes while pending content is translated", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/dashboards/home");
	await page.getByRole("button", { name: "Approve", exact: true }).first().click();
	await expect(page.locator(".ts-card__count")).toHaveText("3");
	await page.getByRole("radio", { name: "العربية", exact: true }).click();
	await expect(page.locator(".ts-approval-card__content")).toHaveText([
		"إبلاغ العميل بتحديث استبدال المنتج",
		"تقديم خصم ١٥٪ على الطلب التالي",
		"استرداد قيمة الطلب ١٠٨٨ بعد تكرار الدفع",
	]);
	await expect(page.locator(".ts-card__count")).toHaveText("3");
	await page.getByRole("button", { name: "رفض", exact: true }).first().click();
	await page.getByRole("radio", { name: "English", exact: true }).click();
	await expect(page.locator(".ts-approval-card__content")).toHaveText([
		"Offer a 15% discount on the next order",
		"Refund order 1088 after duplicate payment",
	]);
	await expect(page.locator(".ts-card__count")).toHaveText("2");
	await page.locator(".sent-commands summary").click();
	await expect(page.locator(".sent-commands pre")).toContainText('"decision": "reject"');
});
