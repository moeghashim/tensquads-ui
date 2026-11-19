import { expect, test } from "@playwright/test";
import { expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

test("admin dashboard filters companies and selects image details", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/dashboards/admin");
	await expect(page.getByRole("row")).toHaveCount(10);
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
	await page.getByRole("button", { name: "With requests" }).click();
	await expect(page.getByRole("row")).toHaveCount(2);
	await page.getByRole("row", { name: /squad\/kyoto.svg/ }).click();
	await expect(page.locator(".dashboard-details")).toContainText("kyoto.svg");
	await expectAccessible(page);
	await expectNoHorizontalScroll(page);
});

test("store approvals send a command and launcher preserves URL state", async ({ page }) => {
	await openPreview(page, { locale: "ar", direction: "rtl", theme: "dark" }, "/dashboards/home");
	await expect(page.getByRole("heading", { name: /Moe/ })).toBeVisible();
	await expect(page.getByRole("button", { name: "موافقة" }).first()).toBeEnabled();
	await page.getByRole("button", { name: "موافقة" }).first().click();
	await expect(page.getByRole("heading", { name: "تم إرسال أمر قرار الموافقة" })).toBeVisible();
	await expect(page.locator(".ts-card__count")).toHaveText("3");
	await expect(page.locator(".sent-command pre")).toContainText('"type": "ApprovalDecision"');
	await page.getByRole("button", { name: "اسأل بيترا" }).click();
	await expect(page).toHaveURL(/\/chat\?.*locale=ar.*dir=rtl.*theme=dark/);
	await expectAccessible(page);
	await expectNoHorizontalScroll(page);
});
