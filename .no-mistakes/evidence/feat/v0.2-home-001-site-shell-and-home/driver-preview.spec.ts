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

test("fixture cards allow input independently of navigation", async ({ page }) => {
	for (const locale of ["en", "ar"] as const) {
		const direction = locale === "ar" ? "rtl" : "ltr";
		for (const route of ["/", "/components"]) {
			await openPreview(page, { locale, direction, theme: "dark" }, route);
			const originalUrl = page.url();
			for (const name of ["Field", "Input"]) {
				const card = page.locator(".component-card").filter({
					has: page.getByRole("link", { name, exact: true }),
				});
				const input = card.getByRole("textbox");
				await input.click();
				await input.fill("Updated project");
				await expect(input).toHaveValue("Updated project");
				await expect(page).toHaveURL(originalUrl);
			}
			const chip = page.locator(".component-card").filter({
				has: page.getByRole("link", { name: "Chip", exact: true }),
			});
			await chip.getByRole("link", { name: /response_schema/ }).click();
			await expect(page).toHaveURL(`${originalUrl}#response_schema`);
			await chip.getByRole("link", { name: "Chip", exact: true }).click();
			await expect(page).toHaveURL(new RegExp(`/components/Chip\\?locale=${locale}&dir=${direction}&theme=dark$`));
		}
	}
});

test("demo copy follows its own locale in both directions", async ({ page }) => {
	for (const locale of ["en", "ar"] as const) {
		await openPreview(page, { locale, direction: locale === "ar" ? "rtl" : "ltr", theme: "light" });
		const pane = page.locator(".stream-screen");
		for (const selected of ["ar", "en"] as const) {
			await pane.getByRole("radio", { name: selected === "ar" ? "العربية · RTL" : "English", exact: true }).click();
			await expect(pane).toHaveAttribute("lang", selected);
			await expect(pane).toHaveAttribute("dir", selected === "ar" ? "rtl" : "ltr");
			await expect(pane.locator(".stream-screen__agent-copy strong")).toHaveText(
				selected === "ar" ? "بترا تجهّز متجرك" : "Petra is setting up your store",
			);
			await expect(pane.locator(".stream-screen__agent-copy span")).toHaveText(
				selected === "ar" ? "القائدة · تعمل" : "Master · Running",
			);
			await expect(
				pane.getByRole("button", { name: selected === "ar" ? "اعتماد الخطة" : "Approve plan" }),
			).toBeVisible();
			await expect(page.locator("html")).toHaveAttribute("lang", locale);
		}
	}
});

test("squad cards link to Squadmate with URL state", async ({ page }) => {
	for (const locale of ["en", "ar"] as const) {
		const direction = locale === "ar" ? "rtl" : "ltr";
		await openPreview(page, { locale, direction, theme: "dark" });
		const cards = page.locator(".squad-row").getByRole("link");
		await expect(cards).toHaveCount(13);
		for (const card of await cards.all()) {
			await expect(card).toHaveAttribute(
				"href",
				`/components/Squadmate?locale=${locale}&dir=${direction}&theme=dark`,
			);
		}
		await cards.first().click();
		await expect(page).toHaveURL(new RegExp(`/components/Squadmate\\?locale=${locale}&dir=${direction}&theme=dark$`));
	}
});
