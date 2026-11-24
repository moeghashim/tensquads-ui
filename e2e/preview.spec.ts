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
			await expect(card.getByRole("status")).toHaveText(state.locale === "ar" ? "تم النسخ" : "Copied");
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
		await expect(page.locator(".design-home__systems section")).toHaveCount(2);
		await expect(page.locator(".brand-specimen__squad img")).toHaveCount(3);
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
		for (const route of ["/", "/components", "/foundations", "/get-started"]) {
			await openPreview(page, { locale, direction, theme: "light" }, route);
			await expect(page.getByRole("main")).toBeVisible();
			await expect(
				page.getByRole("navigation", { name: locale === "ar" ? "التنقل الرئيسي" : "Primary navigation" }),
			).toBeVisible();
		}
	}
});

test("locale and theme controls update the URL state", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" });
	await page.getByRole("button", { name: "العربية", exact: true }).click();
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
	await page.getByRole("radio", { name: "العربية" }).click();
	await expect(page.getByRole("button", { name: "اعتماد الخطة" })).toBeVisible({ timeout: 5000 });
	await expect(page.locator(".stream-screen")).toHaveAttribute("dir", "rtl");
});

for (const locale of ["en", "ar"] as const) {
	test(`stream demo replay resets edited controls in ${locale}`, async ({ page }) => {
		await openPreview(page, { locale, direction: locale === "ar" ? "rtl" : "ltr", theme: "light" });
		const pane = page.locator(".stream-screen");
		const field = pane.getByRole("textbox", { name: locale === "ar" ? "اسم المتجر" : "Store name" });
		const notifications = pane.getByRole("switch");
		const weekly = pane.getByRole("radio", { name: locale === "ar" ? "أسبوعي" : "Weekly", exact: true });
		const monthly = pane.getByRole("radio", { name: locale === "ar" ? "شهري" : "Monthly", exact: true });
		await expect(page.locator(".stream-code__footer")).toContainText(
			locale === "ar" ? "السطر 7 من 7" : "Line 7 of 7",
		);
		await field.fill("Edited store");
		await notifications.click();
		await monthly.click();
		await expect(field).toHaveValue("Edited store");
		await expect(notifications).not.toBeChecked();
		await expect(monthly).toBeChecked();
		await page.getByRole("button", { name: locale === "ar" ? "إعادة العرض" : "Replay", exact: true }).click();
		await expect(page.locator(".stream-code__footer")).toContainText(
			locale === "ar" ? "السطر 7 من 7" : "Line 7 of 7",
		);
		await expect(field).toHaveValue(locale === "ar" ? "متجر بنّاء" : "Bannaa Market");
		await expect(notifications).toBeChecked();
		await expect(weekly).toBeChecked();
	});
}

test("demo copy follows its own locale in both directions", async ({ page }) => {
	for (const locale of ["en", "ar"] as const) {
		await openPreview(page, { locale, direction: locale === "ar" ? "rtl" : "ltr", theme: "light" });
		const pane = page.locator(".stream-screen");
		const controls = page.locator(".stream-demo__controls");
		for (const selected of ["ar", "en"] as const) {
			await controls.getByRole("radio", { name: selected === "ar" ? "العربية" : "English", exact: true }).click();
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
	await expect(page.locator(".stream-code__footer")).toContainText("Line 7 of 7");
	const endHeight = (await demo.boundingBox())?.height ?? 0;
	expect(Math.abs(endHeight - startHeight), "Stream demo height changed while streaming").toBeLessThanOrEqual(1);
});

test("homepage aligns the setup row and stream panes", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" });
	await page.setViewportSize({ width: 1440, height: 900 });
	const numbers = page.locator(".stream-code__number");
	await expect(numbers).toHaveText(["1", "2", "3", "4", "5", "6", "7"]);
	const installCommand = page.locator(".install-card code");
	await expect(installCommand).toHaveText("npm install github:moeghashim/tensquads-ui#<commit-sha>");
	expect(await installCommand.evaluate((element) => element.getClientRects().length)).toBe(1);
	await expect(page.locator(".design-setup").getByRole("link", { name: /Get started/ })).toBeVisible();
	const paneHeaders = page.locator(".stream-demo__pane-heading");
	const [code, rendered] = await paneHeaders.evaluateAll((headers) =>
		headers.map((header) => header.getBoundingClientRect().top),
	);
	expect(code).toBe(rendered);
	await expect(page.locator(".stream-code__line[data-current='true']")).toContainText("Approve plan");
	await expect(page.locator(".stream-screen__actions [data-current='true']")).toContainText("Approve plan");
});

test("catalog filters and links without interactive specimens", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "dark" }, "/components");
	const filter = page.getByRole("searchbox", { name: "Filter components" });
	const cards = page.locator(".component-card");
	await expect(cards).toHaveCount(33);
	await page.getByRole("radio", { name: "React only" }).click();
	await expect(cards).toHaveCount(11);
	await expect(page.getByRole("link", { name: /^Canvas / })).toBeVisible();
	await filter.fill("bar");
	await expect(cards).toHaveCount(2);
	await expect(page.getByRole("link", { name: /^Toolbar / })).toBeVisible();
	await page.getByRole("radio", { name: "OpenUI", exact: true }).click();
	await expect(cards).toHaveCount(2);
	await expect(page.locator(".component-card__stage[inert]")).toHaveCount(2);
	await filter.fill("no such component");
	await expect(page.getByRole("status")).toHaveText("No components match your search.");
	await filter.clear();
	const chart = page.getByRole("link", { name: /^BarChart / });
	await expect(chart.locator(".ts-bar-chart__tick")).toHaveText(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
	await chart.click();
	await expect(page).toHaveURL(/\/components\/BarChart\?locale=en&dir=ltr&theme=dark$/);
});

for (const state of states) {
	test(`catalog category rail follows the document in ${state.locale} ${state.theme}`, async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await openPreview(page, state, "/components");
		const filter = page.getByRole("searchbox");
		// SSR links work before hydration, but the router can reset their scroll during startup.
		await expect(async () => {
			await filter.fill("BarChart");
			await expect(page.locator(".component-card")).toHaveCount(1);
		}).toPass({ timeout: 10_000 });
		await filter.clear();
		await expect(page.locator(".component-card")).toHaveCount(33);
		const rail = page.getByRole("navigation", { name: state.locale === "ar" ? "الفئات" : "Categories" });
		for (const id of ["actions", "forms", "feedback", "data", "chat", "app", "workflow"]) {
			const link = rail.locator(`a[href="#${id}"]`);
			await link.click();
			await expect(link).toHaveAttribute("aria-current", "location");
		}
		await page.locator("#chat").evaluate((section) => section.scrollIntoView({ block: "start" }));
		await expect(rail.locator('a[href="#chat"]')).toHaveAttribute("aria-current", "location");
	});

	test(`catalog and foundations render in ${state.locale} ${state.theme}`, async ({ page }, testInfo) => {
		for (const [path, name] of [
			["/components", "components"],
			["/foundations", "foundations"],
			["/foundations/colour", "colour"],
		] as const) {
			await openPreview(page, state, path);
			await capturePreviewScreenshots(page, testInfo, `${name}-${state.locale}-${state.direction}-${state.theme}`);
			await expectNoHorizontalScroll(page);
			await expectAccessible(page);
		}
	});

	test(`all foundation details preserve ${state.locale} ${state.theme} and show their source data`, async ({
		page,
	}) => {
		const fixtures = {
			typography: ".foundation-type__sample",
			spacing: ".foundation-swatch--spacing",
			radius: ".foundation-swatch--radius",
			shadow: ".foundation-swatch--shadow",
			motion: ".motion-specimen__track",
			logo: ".foundation-assets__image img",
			mascots: ".foundation-mascot",
		};
		for (const [path, specimen] of Object.entries(fixtures)) {
			await openPreview(page, state, "/foundations");
			const link = page.locator(`.foundation-grid a[href*="/foundations/${path}"]`);
			await link.click();
			await expect(page.locator(specimen).first()).toBeVisible();
			await expect(page).toHaveURL(
				new RegExp(`/foundations/${path}\\?locale=${state.locale}&dir=${state.direction}&theme=${state.theme}$`),
			);
			await expectNoHorizontalScroll(page);
			await expectAccessible(page);
		}
	});
}

test("catalog stages fit the full specimen at mobile and desktop widths", async ({ page }) => {
	for (const width of [390, 1440]) {
		await page.setViewportSize({ width, height: 900 });
		await openPreview(page, states[0]!, "/components");
		await expect
			.poll(() =>
				page
					.locator(".component-card__specimen")
					.evaluateAll((elements) =>
						elements.every((element) => getComputedStyle(element).getPropertyValue("--specimen-scale").trim()),
					),
			)
			.toBe(true);
		expect(
			await page.locator(".component-card__specimen").evaluateAll((elements) =>
				elements.flatMap((element) => {
					const stage = element.parentElement?.getBoundingClientRect();
					const rect = element.getBoundingClientRect();
					return !stage ||
						rect.left < stage.left ||
						rect.right > stage.right ||
						rect.top < stage.top ||
						rect.bottom > stage.bottom
						? [element.parentElement?.dataset.component]
						: [];
				}),
			),
		).toEqual([]);
		const tracks = await page
			.locator(".catalog-grid")
			.first()
			.evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(" ").length);
		expect(tracks).toBe(width === 390 ? 2 : 4);
	}
});
