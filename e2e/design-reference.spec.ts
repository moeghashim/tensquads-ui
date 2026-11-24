import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { liveHomepages, productScreens } from "../apps/preview/src/reference";
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
	}
});

test("reference catalogs feature the live homepage and omit the archived designs", async ({ page, request }) => {
	await openPreview(page, states[0], "/reference/screens");
	await expect(page.locator(".reference-screen-list a[href^='/reference/screens/home']")).toHaveCount(0);
	await openPreview(page, states[0], "/reference/pages");
	const homepage = page.locator(".reference-page-card").first();
	await expect(homepage.getByRole("heading", { name: "Homepage" })).toBeVisible();
	for (const [locale, href] of Object.entries(liveHomepages)) {
		const link = homepage.locator(`a[hreflang="${locale}"]`);
		await expect(link).toHaveAttribute("href", href);
		await expect(link).toHaveAttribute("target", "_blank");
	}
	await expect(page.locator("main a[href^='/reference/pages/home-v2']")).toHaveCount(0);
	for (const path of ["/reference/screens/home", "/reference/pages/home-v2", "/design/pages/home-v2/home.html"]) {
		expect((await request.get(path)).status(), path).toBe(404);
	}
});
