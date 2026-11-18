import { expect, test } from "@playwright/test";
import {
	capturePreviewScreenshots,
	expectAccessible,
	expectNoHorizontalScroll,
	expectThemeFocusRing,
	openPreview,
	type PreviewState,
} from "./helpers/preview";

const states: PreviewState[] = [
	{ locale: "en", direction: "ltr", theme: "light" },
	{ locale: "en", direction: "ltr", theme: "dark" },
	{ locale: "ar", direction: "rtl", theme: "light" },
	{ locale: "ar", direction: "rtl", theme: "dark" },
];

test("home works in both directions and themes", async ({ page }, testInfo) => {
	for (const state of states) {
		await openPreview(page, state);
		await expect(page.getByRole("main")).toBeVisible();
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
		await expect(
			page.getByRole("navigation", { name: state.locale === "ar" ? "التنقل الرئيسي" : "Primary navigation" }),
		).toBeVisible();
		await expect(page.locator(".component-card")).toHaveCount(11);
		await expect(
			page.getByRole("button", { name: state.locale === "ar" ? "اعتماد الخطة" : "Approve plan" }),
		).toBeVisible({ timeout: 5000 });
		await capturePreviewScreenshots(page, testInfo, `${state.locale}-${state.direction}-${state.theme}`);
		await expectNoHorizontalScroll(page);
		await expectAccessible(page);
		await expectThemeFocusRing(page, state.theme);
	}
});

test("site routes render in English and Arabic", async ({ page }) => {
	for (const locale of ["en", "ar"] as const) {
		const direction = locale === "ar" ? "rtl" : "ltr";
		for (const route of ["/", "/components", "/get-started"]) {
			await openPreview(page, { locale, direction, theme: "light" }, route);
			await expect(page.getByRole("main")).toBeVisible();
			await expect(page.getByRole("navigation")).toBeVisible();
		}
	}
});

test("locale and theme controls update the URL state", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" });
	await page.getByRole("radio", { name: "العربية", exact: true }).click();
	await expect(page.locator("html")).toHaveAttribute("lang", "ar");
	await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
	await expect(page).toHaveURL(/locale=ar/);
	await expect(page).toHaveURL(/dir=rtl/);
	await page.getByRole("radio", { name: "داكنة" }).click();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	await expect(page).toHaveURL(/theme=dark/);
});

test("stream demo replays localized OpenUI fixtures", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" });
	await expect(page.getByRole("button", { name: "Approve plan" })).toBeVisible({ timeout: 5000 });
	await expect(page.getByRole("textbox", { name: "Store name" })).toBeVisible();
	await expect(page.getByRole("switch", { name: "Email me when done" })).toBeVisible();
	await expect(page.getByRole("radio", { name: "Weekly" })).toBeVisible();
	await expect(page.locator(".stream-screen__agent [data-slot='badge']")).toHaveText("Checking");
	await page.getByRole("radio", { name: "العربية · RTL" }).click();
	await expect(page.getByRole("button", { name: "اعتماد الخطة" })).toBeVisible({ timeout: 5000 });
	await expect(page.locator(".stream-screen")).toHaveAttribute("dir", "rtl");
});
