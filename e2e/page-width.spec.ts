import { expect, type Locator, test } from "@playwright/test";
import { openPreview } from "./helpers/preview";

const widths = [1440, 1024, 390] as const;

function inlineEdges(locator: Locator) {
	return locator.evaluate((element) => {
		const { left, right } = element.getBoundingClientRect();
		return getComputedStyle(element).direction === "rtl" ? { start: right, end: left } : { start: left, end: right };
	});
}

for (const [locale, direction] of [
	["en", "ltr"],
	["ar", "rtl"],
] as const) {
	for (const [group, matches] of [
		["component docs", (path: string) => path.startsWith("/components/")],
		["foundations and references", (path: string) => /^\/(foundations|reference)\//.test(path)],
		["top-level pages and demos", (path: string) => !/^\/(components|foundations|reference)\//.test(path)],
	] as const) {
		test(`${group} use the shared inline edges in ${direction}`, async ({ page, request }) => {
			test.setTimeout(120_000);
			const index = await (await request.get("/llms.txt")).text();
			const paths = Array.from(index.matchAll(/^- \[[^\]]+\]\((https:\/\/[^)]+\.md)\): .+$/gm), ([, url]) => {
				const path = new URL(url).pathname;
				return path === "/index.md" ? "/" : path.slice(0, -3);
			}).filter(matches);
			expect(paths.length).toBeGreaterThan(0);

			const state = { locale, direction, theme: "light" } as const;
			const height = 900;
			const expected = new Map<number, Awaited<ReturnType<typeof inlineEdges>>>();
			await openPreview(page, state, "/components");
			for (const width of widths) {
				await page.setViewportSize({ width, height });
				const catalog = page.getByRole("main");
				await expect(catalog).toBeVisible();
				await expect
					.poll(async () => {
						const edges = await inlineEdges(catalog);
						if (edges.start === edges.end) return false;
						expected.set(width, edges);
						return true;
					})
					.toBe(true);
			}

			for (const path of paths) {
				await openPreview(page, state, path);
				const builder = path === "/nodes" || path.startsWith("/nodes/");
				const main = page.getByRole("main");
				const frame = builder
					? main.locator(".builder-header")
					: path.startsWith("/templates/")
						? page.locator(".template-preview")
						: main;
				for (const width of widths) {
					await page.setViewportSize({ width, height });
					const context = `${path}, ${width}px, ${direction}`;
					await expect.poll(() => inlineEdges(frame), { message: context }).toEqual(expected.get(width));
					expect(await inlineEdges(page.locator(".site-header__inner")), `Header on ${context}`).toEqual(
						expected.get(width),
					);
					if (builder) {
						expect(await inlineEdges(main), `Canvas on ${context}`).toEqual(
							await inlineEdges(page.locator("html")),
						);
					} else {
						expect(await inlineEdges(page.locator(".site-footer__inner")), `Footer on ${context}`).toEqual(
							expected.get(width),
						);
					}
					if (width === 390) {
						expect(
							await page.evaluate(() => document.documentElement.scrollWidth),
							`Horizontal overflow on ${context}`,
						).toBeLessThanOrEqual(width);
					}
				}
			}
		});
	}
}
