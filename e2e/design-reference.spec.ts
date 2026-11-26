import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { pageDesigns, productScreens } from "../apps/preview/src/reference";
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
	for (const [path, name, selector, count] of [
		["/foundations/principles", "principles", ".reference-prose h2", 11],
		["/reference/screens", "screens", ".reference-screen-list li", 10],
		["/reference/pages", "page-designs", ".reference-page-card img", 1],
		["/reference/mascot-states", "mascot-states", ".squadmate-state-grid img", 130],
	] as const) {
		test(`${name} in ${state.locale} ${state.theme}`, async ({ page }, testInfo) => {
			await openPreview(page, state, path);
			await expect(page.locator(selector)).toHaveCount(count);
			if (name === "page-designs") {
				for (const image of await page.locator(selector).all()) {
					await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
				}
			}
			if (name === "mascot-states") {
				const ar = state.locale === "ar";
				const hero = page.getByRole("region", { name: ar ? "تعرّف على الفريق" : "Meet the squad" });
				const back = hero.locator(".mascot-hero__row--back").getByRole("figure");
				const front = hero.locator(".mascot-hero__row--front").getByRole("figure");
				await expect(back).toHaveCount(6);
				await expect(front).toHaveCount(7);
				await expect(hero.locator(".ts-squadmate[data-animated] svg .sm-all")).toHaveCount(13);
				await expect(hero.locator(".mascot-hero__counts > span")).toHaveText(
					ar ? ["١٣ زميلًا", "١٠ حالات", "١٣٠ رسمًا"] : ["13 squadmates", "10 states", "130 drawings"],
				);
				const firstX = (await back.first().boundingBox())?.x ?? 0;
				const lastX = (await back.last().boundingBox())?.x ?? 0;
				expect(ar ? firstX - lastX : lastX - firstX).toBeGreaterThan(0);

				const giza = back.first();
				const tag = giza.locator("figcaption");
				const petra = front.nth(3);
				await expect(petra).toHaveAccessibleName(ar ? "بترا، قائد الفريق" : "Petra, Master");
				await giza.locator(".sm-face").hover();
				await expect(tag).toHaveCSS("opacity", "1");
				await hero.getByRole("heading").hover();
				await expect(tag).toHaveCSS("opacity", "0");
				await page.keyboard.press("Tab");
				await giza.focus();
				await expect(giza).toBeFocused();
				await expect(tag).toHaveCSS("opacity", "1");
				await page.keyboard.press("Tab");
				await expect(back.nth(1)).toBeFocused();

				const jump = hero.getByRole("link", { name: ar ? "انتقل إلى الحالات" : "Jump to the states" });
				await jump.focus();
				await page.keyboard.press("Enter");
				await expect(page.locator("#states")).toBeFocused();
				await page.evaluate(() => {
					(document.activeElement as HTMLElement | null)?.blur();
					window.scrollTo(0, 0);
				});
			}
			await capturePreviewScreenshots(page, testInfo, `${name}-${state.locale}-${state.direction}-${state.theme}`);
			await expectNoHorizontalScroll(page);
			await expectAccessible(page);
		});
	}

	for (const [path, asset, innerText, name] of [
		["/reference/screens/main", "/design/screens/Main.dc.html", "Good morning, Moe", "screen-viewer"],
		[
			"/reference/pages/squadmates-sidebar",
			"/design/pages/squadmates-sidebar/sidebar.html",
			"Today",
			"sidebar-design-viewer",
		],
	] as const) {
		test(`${name} in ${state.locale} ${state.theme}`, async ({ page }, testInfo) => {
			await openPreview(page, state, path);
			const frame = page.locator("iframe");
			await expect(frame).toHaveAttribute("title", /\S+/);
			await expect(frame).toHaveAttribute("src", asset);
			await expect(frame.contentFrame().getByText(innerText, { exact: false }).first()).toBeVisible();
			await expect(page.locator(`.reference-viewer a[href="${asset}"]`)).toBeVisible();
			if (name === "screen-viewer") {
				await capturePreviewScreenshots(
					page,
					testInfo,
					`${name}-${state.locale}-${state.direction}-${state.theme}`,
				);
			}
			await expectNoHorizontalScroll(page);
			await expect.poll(async () => (await frame.boundingBox())?.width).toBeLessThan(390);
			// The design snapshots are preserved as supplied. Audit the documentation site and its viewer.
			expect((await new AxeBuilder({ page }).exclude("iframe").analyze()).violations).toEqual([]);
		});
	}
}

test("the mascot hero hops every 420 ms and pauses when hidden or motion is reduced", async ({ page }) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.addInitScript(() => {
		Object.defineProperty(document, "hidden", { configurable: true, value: false });
	});
	await page.clock.install();
	await openPreview(page, states[0], "/reference/mascot-states");
	const hero = page.getByRole("region", { name: "Meet the squad" });
	const hopping = hero.locator("[data-hopping]");
	await page.clock.runFor(840);
	await expect(hopping).toHaveCount(0);
	expect(await hero.evaluate((element) => element.getAnimations({ subtree: true }))).toEqual([]);

	await page.clock.pauseAt(new Date(Date.now() + 1_000));
	await hero.evaluate((element: HTMLElement) => {
		let starts = 0;
		element.dataset.hopStarts = "0";
		const observer = new MutationObserver((changes) => {
			starts += changes.filter(({ oldValue }) => oldValue === null).length;
			element.dataset.hopStarts = String(starts);
		});
		observer.observe(element, { subtree: true, attributeFilter: ["data-hopping"], attributeOldValue: true });
		const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
		motion.addEventListener(
			"change",
			() => {
				element.dataset.motionChanged = "";
			},
			{ once: true },
		);
	});
	await page.emulateMedia({ reducedMotion: "no-preference" });
	await expect(hero).toHaveAttribute("data-motion-changed", "");
	await page.clock.runFor(419);
	await expect(hero).toHaveAttribute("data-hop-starts", "0");
	await page.clock.runFor(1);
	await expect(hero).toHaveAttribute("data-hop-starts", "1");
	await expect(hopping).toHaveCSS("animation-name", "mascot-hero-hop");
	await page.clock.runFor(420);
	await expect(hero).toHaveAttribute("data-hop-starts", "2");

	await page.evaluate(() => {
		Object.defineProperty(document, "hidden", { configurable: true, value: true });
		document.dispatchEvent(new Event("visibilitychange"));
	});
	await page.clock.runFor(840);
	await expect(hero).toHaveAttribute("data-hop-starts", "2");
	await expect(hopping).toHaveCount(0);
	expect(await hero.evaluate((element) => element.getAnimations({ subtree: true }))).toEqual([]);
});

test("home and foundations links reach local references with the current locale and theme", async ({ page }) => {
	const state = states[3];
	const links = ["/foundations/principles", "/reference/screens", "/reference/pages", "/reference/mascot-states"];
	for (const path of ["/", "/foundations"]) {
		await openPreview(page, state, path);
		for (const link of links) {
			await expect(page.locator(`.design-reference-row a[href^="${link}"]`)).toHaveAttribute(
				"href",
				`${link}?locale=ar&dir=rtl&theme=dark`,
			);
		}
	}
	await page.locator(".site-search-button").click();
	await page.getByRole("combobox").fill("شاشات");
	await page.getByRole("option", { name: "شاشات المنتج" }).click();
	await expect(page).toHaveURL(/\/reference\/screens\?locale=ar&dir=rtl&theme=dark$/);
});

test("built reference assets preserve relative paths and content types", async ({ request }) => {
	const samples = [
		...productScreens.map(({ src }) => [src, "text/html"]),
		["/design/pages/squadmates-sidebar/sidebar.html", "text/html"],
		["/design/screens/support.js", "javascript"],
		["/design/screens/ds/agent-ui/tokens.json", "application/json"],
		["/design/mascots/avatars/petra-idle.svg", "image/svg+xml"],
		["/design/logo/favicon.svg", "image/svg+xml"],
		["/design/screens/Home.dc.html", "text/html"],
		["/design/pages/squadmates-sidebar/sidebar.png", "image/png"],
	];
	for (const [path, contentType] of samples) {
		const response = await request.get(path);
		expect(response.ok(), path).toBe(true);
		expect(response.headers()["content-type"], path).toContain(contentType);
		if (contentType !== "image/png") {
			expect(await response.text(), `Served reference output: ${path}`).not.toMatch(/\b10squads\.com\b/i);
		}
	}
});

test("reference catalogs feature the live homepage and omit the archived designs", async ({ page, request }) => {
	await openPreview(page, states[0], "/reference/screens");
	await expect(page.locator(".reference-screen-list a[href^='/reference/screens/home']")).toHaveCount(0);
	await openPreview(page, states[0], "/reference/pages");
	const homepage = page.locator(".reference-page-card").first();
	await expect(homepage.getByRole("heading", { name: "Homepage" })).toBeVisible();
	for (const [locale, href] of Object.entries({
		en: "https://tensquads-website.mohanadgh.workers.dev/",
		ar: "https://tensquads-website-ar.mohanadgh.workers.dev/",
	})) {
		const link = homepage.locator(`a[hreflang="${locale}"]`);
		await expect(link).toHaveAttribute("href", href);
		await expect(link).toHaveAttribute("target", "_blank");
	}
	await expect(page.locator("main a[href^='/reference/pages/home-v2']")).toHaveCount(0);
	for (const path of ["/reference/screens/home", "/reference/pages/home-v2", "/design/pages/home-v2/home.html"]) {
		expect((await request.get(path)).status(), path).toBe(404);
	}
});

for (const state of states) {
	for (const path of [
		"/",
		"/foundations",
		"/foundations/principles",
		"/reference/screens",
		"/reference/pages",
		"/reference/mascot-states",
		...productScreens.map(({ id }) => `/reference/screens/${id}`),
		...pageDesigns.map(({ id }) => `/reference/pages/${id}`),
	]) {
		test(`D32 links avoid the legacy host on ${path} in ${state.locale} ${state.theme}`, async ({ page }) => {
			await openPreview(page, state, path);
			for (const frame of page.frames()) {
				await frame.waitForLoadState("domcontentloaded");
				const destinations = await frame.locator("[href], [src]").evaluateAll((elements) =>
					elements.flatMap((element) =>
						["href", "src"].flatMap((attribute) => {
							const value = element.getAttribute(attribute);
							return value ? [new URL(value, document.baseURI).href] : [];
						}),
					),
				);
				for (const destination of destinations) {
					expect(new URL(destination).hostname, `${path}: ${destination}`).not.toMatch(/(^|\.)10squads\.com$/i);
				}
			}
		});
	}
}
