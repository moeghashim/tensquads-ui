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

for (const state of states) {
	for (const failure of ["denied", "unavailable"] as const) {
		test(`install copy handles ${failure} clipboard in ${state.locale} ${state.theme}`, async ({ page }) => {
			const errors: string[] = [];
			page.on("pageerror", (error) => errors.push(error.message));
			await openPreview(page, state);
			await page.evaluate((mode) => {
				Object.defineProperty(navigator, "clipboard", {
					configurable: true,
					value:
						mode === "unavailable"
							? undefined
							: {
									writeText: async () => {
										throw new DOMException("Permission denied", "NotAllowedError");
									},
								},
				});
			}, failure);
			const card = page.locator(".install-card");
			const button = card.getByRole("button");
			await button.click();
			await expect(card.getByRole("status")).toHaveText(
				state.locale === "ar"
					? "تعذّر النسخ. يمكن تحديد الأمر أعلاه ونسخه يدوياً."
					: "Could not copy. Select and copy the command above.",
			);
			await expect(button).toHaveText(state.locale === "ar" ? "نسخ" : "Copy");
			await expect(card.locator("code")).toHaveText("npm install github:moeghashim/tensquads-ui#<commit-sha>");
			await page.evaluate(() => {
				Object.defineProperty(navigator, "clipboard", {
					configurable: true,
					value: {
						writeText: async (text: string) => {
							sessionStorage.setItem("copied-command", text);
						},
					},
				});
			});
			await button.click();
			await expect(button).toHaveText(state.locale === "ar" ? "تم النسخ" : "Copied");
			await expect(card.getByRole("status")).toBeEmpty();
			expect(await page.evaluate(() => sessionStorage.getItem("copied-command"))).toBe(
				"npm install github:moeghashim/tensquads-ui#<commit-sha>",
			);
			await expect(button).toHaveText(state.locale === "ar" ? "نسخ" : "Copy");
			expect(errors).toEqual([]);
		});
	}
}

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
				selected === "ar" ? "إعداد المتجر مع بترا" : "Petra is setting up your store",
			);
			await expect(pane.locator(".stream-screen__agent-copy span")).toHaveText(
				selected === "ar" ? "قيد العمل" : "Running skill",
			);
			await expect(
				pane.getByRole("button", { name: selected === "ar" ? "اعتماد الخطة" : "Approve plan" }),
			).toBeVisible();
			await expect(page.locator("html")).toHaveAttribute("lang", locale);
		}
	}
});

test("homepage stream demo keeps its size while streaming", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" });
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.getByRole("button", { name: "Replay" }).click();
	const demo = page.locator(".stream-demo");
	const startHeight = (await demo.boundingBox())?.height ?? 0;
	await expect(page.locator(".stream-code__footer")).toContainText("7/7");
	const endHeight = (await demo.boundingBox())?.height ?? 0;
	expect(Math.abs(endHeight - startHeight), "Stream demo height changed while streaming").toBeLessThanOrEqual(1);
});

test("homepage presents streamed messages and keeps previews readable", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" });
	await page.setViewportSize({ width: 1440, height: 900 });
	const messages = page.locator(".stream-code__line");
	await expect(messages).toHaveCount(7);
	await expect(messages.nth(2).locator(".stream-code__message-label")).toHaveText("Message 3 of 7");
	const installCommand = page.locator(".install-card code");
	await expect(installCommand).toHaveText("npm install github:moeghashim/tensquads-ui#<commit-sha>");
	expect(
		await installCommand.evaluate((element) => element.scrollWidth <= element.clientWidth),
		"The install command should fit on one line at desktop width",
	).toBe(true);
	const actions = page.locator(".hero__links");
	await expect(actions.getByRole("link", { name: "Get started", exact: true })).toBeVisible();
	const browse = actions.getByRole("link", { name: "Browse 11 components", exact: true });
	await expect(browse).toBeVisible();
	expect(await browse.evaluate((element) => getComputedStyle(element).textDecorationLine)).toBe("none");
	await expect(page.getByRole("tooltip")).toContainText("Create a new item");
	await expect(page.locator(".component-card__arrow").first()).toHaveText("→");
	const squadCards = page.locator(".squad-row").getByRole("link");
	const squadRows = await squadCards.evaluateAll(
		(cards) => new Set(cards.map((card) => Math.round(card.getBoundingClientRect().top))).size,
	);
	expect(squadRows).toBe(1);
	const streamGridBottom = await page
		.locator(".stream-screen__grid")
		.evaluate((element) => element.getBoundingClientRect().bottom);
	const localeControlTop = await page
		.locator(".stream-screen__locale")
		.evaluate((element) => element.getBoundingClientRect().top);
	expect(localeControlTop - streamGridBottom).toBeLessThanOrEqual(20);
	await page.setViewportSize({ width: 390, height: 844 });
	expect(
		await page
			.locator(".component-grid")
			.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length),
	).toBe(1);
	const fieldCard = page.locator(".component-card").filter({
		has: page.getByRole("link", { name: "Field", exact: true }),
	});
	await expect(fieldCard.getByRole("textbox")).toHaveValue("Northstar");
	const chipCard = page.locator(".component-card").filter({
		has: page.getByRole("link", { name: "Chip", exact: true }),
	});
	const chipText = chipCard.locator(".ts-chip__name");
	await expect(chipText).toHaveText("response_schema");
	expect(await chipText.evaluate((element) => getComputedStyle(element).whiteSpace)).toBe("nowrap");
	await expectNoHorizontalScroll(page);
	await openPreview(page, { locale: "ar", direction: "rtl", theme: "light" }, "/components");
	await expect(page.locator(".component-card__arrow").first()).toHaveText("←");
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
