import { expect, test } from "@playwright/test";

const markdownType = "text/markdown; charset=utf-8";
const textType = "text/plain; charset=utf-8";

test("the agent index covers every page and the full document follows index order", async ({ request }) => {
	const indexResponse = await request.get("/llms.txt?locale=ar");
	expect(indexResponse.ok()).toBe(true);
	expect(indexResponse.headers()["content-type"]).toBe(textType);
	const index = await indexResponse.text();
	expect(index).toMatch(/^# tensquads design system\n\n> .+/);
	expect(index).toContain(
		"## Start here\n\n- [Design guide](https://tensquads-ui-preview.mohanadgh.workers.dev/foundations/guide.md): Read this before you build a screen\n",
	);
	const paths = Array.from(index.matchAll(/^- \[[^\]]+\]\((https:\/\/[^)]+\.md)\): .+$/gm), ([, url]) => {
		const target = new URL(url);
		expect(target.origin).toBe("https://tensquads-ui-preview.mohanadgh.workers.dev");
		return target.pathname;
	});
	expect(paths[0]).toBe("/foundations/guide.md");
	expect(paths).toEqual(
		expect.arrayContaining([
			"/index.md",
			"/foundations.md",
			"/foundations/colour.md",
			"/foundations/mascots/motion.md",
			"/components.md",
			"/components/Node.md",
			"/get-started.md",
			"/reference/screens.md",
			"/reference/pages.md",
			"/reference/mascot-states.md",
			"/nodes.md",
			"/nodes/support.md",
			"/nodes/orders.md",
			"/nodes/onboarding.md",
			"/workflows.md",
			"/chat.md",
			"/dashboards/home.md",
			"/dashboards/admin.md",
		]),
	);
	expect(paths.some((path) => path.startsWith("/reference/screens/"))).toBe(true);
	expect(paths.some((path) => path.startsWith("/reference/pages/"))).toBe(true);
	expect(new Set(paths).size).toBe(paths.length);
	expect(index.split("\n").filter((line) => line.startsWith("- ["))).toHaveLength(paths.length);

	const fullResponse = await request.get("/llms-full.txt");
	expect(fullResponse.ok()).toBe(true);
	expect(fullResponse.headers()["content-type"]).toBe(textType);
	const full = await fullResponse.text();
	let offset = 0;
	for (const path of paths) {
		const response = await request.get(path);
		expect(response.ok(), path).toBe(true);
		expect(response.headers()["content-type"], path).toBe(markdownType);
		const body = (await response.text()).trim();
		expect(body, path).toMatch(/^# /);
		const position = full.indexOf(body, offset);
		expect(position, path).toBeGreaterThanOrEqual(offset);
		offset = position + body.length;

		const htmlPath = path === "/index.md" ? "/" : path.slice(0, -3);
		const html = await request.get(htmlPath);
		expect(html.ok(), htmlPath).toBe(true);
		expect(await html.text(), htmlPath).toContain(`rel="alternate" type="text/markdown" href="${path}"`);
	}
});

test("Markdown twins preserve source content and the HTML locale", async ({ page, request }) => {
	const forNode = await request.get("/components/Node.md");
	expect(await forNode.text()).toContain("Node is without an OpenUI definition");
	const colour = await request.get("/foundations/colour.md");
	expect(await colour.text()).toContain("| `--ts-canvas` | `#f3f3f3` | `#161616` |");
	const setup = await request.get("/get-started.md");
	expect(await setup.text()).toContain('@import "@tensquads/ui/tokens.css"');
	const chat = await request.get("/chat.md");
	expect(await chat.text()).toContain("Set up a store for me");

	await page.goto("/?locale=ar");
	const expectedHref = "/index.md?locale=ar";
	await expect(page.locator('head link[rel="alternate"][type="text/markdown"]')).toHaveAttribute("href", expectedHref);
	const visibleLink = page.getByRole("link", { name: "عرض بصيغة Markdown" });
	await expect(visibleLink).toBeVisible();
	await expect(visibleLink).toHaveAttribute("href", expectedHref);
	const arabic = await request.get(expectedHref);
	expect(arabic.headers()["content-type"]).toBe(markdownType);
	expect(await arabic.text()).toMatch(/^# .*بنّاء/);
	expect(await (await request.get("/foundations/colour.md?locale=ar")).text()).toContain("الألوان");
});

test("shadow Markdown retains both source theme values in each locale and the full document", async ({ request }) => {
	for (const path of ["/foundations/shadow.md", "/foundations/shadow.md?locale=ar", "/llms-full.txt"]) {
		const response = await request.get(path);
		expect(response.ok(), path).toBe(true);
		expect(await response.text(), path).toContain(
			"| `--ts-shadow-hairline` | `0 0 0 1px #00000014` | `0 0 0 0.5px #ffffff1f` |",
		);
	}
});

test("Markdown endpoints support HEAD and report unknown paths", async ({ request }) => {
	const head = await request.head("/components/Node.md");
	expect(head.ok()).toBe(true);
	expect(head.headers()["content-type"]).toBe(markdownType);
	expect(await head.text()).toBe("");
	expect((await request.get("/components/missing.md")).status()).toBe(404);
});
