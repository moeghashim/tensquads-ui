import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { capturePreviewScreenshots, expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

const route = "/foundations/guide";
const site = "https://tensquads-ui-preview.mohanadgh.workers.dev";

for (const [locale, direction, title] of [
	["en", "ltr", "Design guide"],
	["ar", "rtl", "دليل التصميم"],
] as const) {
	for (const theme of ["light", "dark"] as const) {
		test(`the design guide renders in ${locale} / ${theme}`, async ({ page }, testInfo) => {
			await openPreview(page, { locale, direction, theme }, "/foundations");
			const guideLink = page.locator("main .foundation-grid").getByRole("link").first();
			await expect(guideLink).toHaveAccessibleName(new RegExp(title));
			await guideLink.click();
			await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
			const guide = page.getByRole("article");
			await expect(guide).toHaveAttribute("lang", "en");
			await expect(guide).toHaveAttribute("dir", "ltr");
			await expect(guide.getByRole("heading", { level: 2 })).toHaveCount(9);
			await expect(guide.locator("ol").first().locator(":scope > li")).toHaveCount(5);
			await expect(guide.locator("pre").first()).toContainText('@import "@tensquads/ui/fonts.css";');
			await expect(guide.getByRole("columnheader", { name: "Principle", exact: true })).toBeVisible();
			await expect(guide.getByRole("link", { name: "/foundations/mascots/motion" })).toBeVisible();
			await expect(page.locator('link[rel="alternate"][type="text/markdown"]')).toHaveAttribute(
				"href",
				`${route}.md${locale === "ar" ? "?locale=ar" : ""}`,
			);
			await capturePreviewScreenshots(page, testInfo, `design-guide-${locale}-${direction}-${theme}`);
			await expectNoHorizontalScroll(page);
			await expectAccessible(page);
		});
	}
}

test("the Markdown twin serves the guide and its reference and live links resolve", async ({ page, request }) => {
	const source = await readFile(new URL("../DESIGN.md", import.meta.url), "utf8");
	for (const query of ["", "?locale=ar"]) {
		const twin = await request.get(`${route}.md${query}`);
		expect(twin.ok()).toBe(true);
		expect(twin.headers()["content-type"]).toBe("text/markdown; charset=utf-8");
		expect(await twin.text()).toBe(source);
	}

	await page.goto(route);
	const links = await page
		.getByRole("article")
		.getByRole("link")
		.evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute("href")));
	const targets = new Set(
		Array.from(source.matchAll(/\]\(([^)]+)\)/g), ([, href]) => {
			const url = new URL(href, site);
			expect(url.origin).toBe(site);
			return url.pathname + url.search + url.hash;
		}),
	);
	expect([...targets]).toEqual(
		expect.arrayContaining([
			"/design/screens/Main.dc.html",
			"/design/screens/AgentDetail.dc.html",
			"/design/screens/SignIn.dc.html",
			"/dashboards/home",
			"/dashboards/admin?view=images",
			"/chat",
			"/nodes",
			"/foundations/mascots/motion",
		]),
	);
	expect(new Set(links)).toEqual(targets);
	for (const target of targets) {
		const response = await request.get(target);
		expect(response.ok(), target).toBe(true);
		expect(response.headers()["content-type"], target).toContain("text/html");
	}
});
