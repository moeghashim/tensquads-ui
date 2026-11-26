import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { capturePreviewScreenshots, expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

const templates = [
	["app-shell", "AppShell.tsx", "Workspace overview", "نظرة عامة على مساحة العمل"],
	["dashboard", "Dashboard.tsx", "Store overview", "نظرة عامة على المتجر"],
	["list", "List.tsx", "Accounts", "الحسابات"],
	["list-detail", "ListDetail.tsx", "Orders", "الطلبات"],
	["settings", "Settings.tsx", "Rules", "القواعد"],
	["chat", "ChatPage.tsx", "Petra", "بترا"],
] as const;

for (const [name, file, english, arabic] of templates) {
	for (const [locale, direction, title] of [
		["en", "ltr", english],
		["ar", "rtl", arabic],
	] as const) {
		for (const theme of ["light", "dark"] as const) {
			test(`${name} renders in ${locale} / ${theme}`, async ({ page }, testInfo) => {
				await openPreview(page, { locale, direction, theme }, `/templates/${name}`);
				await expect(page.getByRole("main").getByRole("heading", { name: title, level: 1 })).toBeVisible();
				await expect(page.getByRole("link", { name: /GitHub/ }).first()).toHaveAttribute(
					"href",
					`https://github.com/moeghashim/tensquads-ui/blob/main/templates/${name}/${file}`,
				);
				if (name === "list-detail") {
					await page.setViewportSize({ width: 1440, height: 900 });
					const scroll = page.locator(".template-order__list .ts-data-table__scroll");
					await expect
						.poll(() => scroll.evaluate(({ scrollWidth, clientWidth }) => scrollWidth - clientWidth))
						.toBe(0);
				}
				await capturePreviewScreenshots(page, testInfo, `template-${name}-${locale}-${theme}`);
				await expectAccessible(page);
				await expectNoHorizontalScroll(page);
				await expectAccessible(page);
			});
		}
	}

	test(`${name} copies both source files and has a Markdown twin`, async ({ page, context, request }) => {
		await context.grantPermissions(["clipboard-read", "clipboard-write"]);
		await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, `/templates/${name}`);
		const base = new URL(`../templates/${name}/`, import.meta.url);
		for (const [button, filename] of [
			["Copy source", file],
			["Copy styles", `${name}.css`],
		] as const) {
			await page.getByRole("button", { name: button, exact: true }).click();
			const expected = await readFile(new URL(filename, base), "utf8");
			await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(expected);
		}
		const twin = await request.get(`/templates/${name}.md`);
		expect(twin.ok()).toBe(true);
		expect(twin.headers()["content-type"]).toBe("text/markdown; charset=utf-8");
		const markdown = await twin.text();
		expect(markdown).toContain((await readFile(new URL(file, base), "utf8")).trim());
		expect(markdown).toContain((await readFile(new URL(`${name}.css`, base), "utf8")).trim());
		await expect(page.locator('link[rel="alternate"][type="text/markdown"]')).toHaveAttribute(
			"href",
			`/templates/${name}.md`,
		);
	});
}

test("templates are discoverable from the site navigation and the agent index", async ({ page, request }) => {
	await openPreview(page, { locale: "ar", direction: "rtl", theme: "dark" }, "/components");
	await page.getByRole("navigation").getByRole("link", { name: "القوالب", exact: true }).click();
	const index = page.getByRole("main");
	await expect(index.getByRole("heading", { name: "القوالب" })).toBeVisible();
	await expect(index.locator(".foundation-grid").getByRole("link")).toHaveCount(templates.length);
	await index.getByRole("link", { name: /لوحة المؤشرات/ }).click();
	await expect(page.getByRole("heading", { name: "نظرة عامة على المتجر", level: 1 })).toBeVisible();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	const llms = await (await request.get("/llms.txt")).text();
	expect(llms).toContain("## Templates");
	for (const [name] of templates) expect(llms).toContain(`/templates/${name}.md`);
	const markdown = await (await request.get("/templates.md?locale=ar")).text();
	expect(markdown).toContain("# القوالب");
	expect(markdown).toContain("/templates/dashboard.md?locale=ar");
	const unknown = await request.get("/templates/missing");
	expect(unknown.status()).toBe(404);
});

test("list search and status filters can be cleared from the empty state", async ({ page }) => {
	await page.goto("/templates/list");
	const table = page.getByRole("table", { name: "Companies" });
	await expect(table.getByText("Coast Supply")).toBeVisible();
	await page.getByRole("button", { name: "Active only" }).click();
	await expect(table.getByText("Coast Supply")).toHaveCount(0);
	const search = page.getByRole("searchbox", { name: "Search companies" });
	await search.fill("no match");
	await expect(page.getByText("No matching companies")).toBeVisible();
	await page.getByRole("button", { name: "Clear filters" }).click();
	await expect(search).toHaveValue("");
	await expect(table.getByText("Coast Supply")).toBeVisible();
});

test("settings save the chosen approval mode and switch state", async ({ page }) => {
	await page.goto("/templates/settings");
	const form = page.getByRole("form", { name: "New rule" });
	await form.getByRole("textbox", { name: "Rule name" }).fill("Check incoming orders");
	await form.getByText("Within limit").click();
	await form.getByRole("switch", { name: "Enable this rule" }).click();
	await form.getByRole("button", { name: "Save rule" }).click();
	const newRule = page.getByRole("listitem").filter({ hasText: "Check incoming orders" });
	await expect(newRule).toContainText("Within limit");
	await expect(newRule.getByRole("switch")).not.toBeChecked();
	await expect(page.getByText("Rule saved")).toBeVisible();
});

test("chat submits an inline form and locks it until replay", async ({ page }) => {
	await page.goto("/templates/chat");
	const instructions = page.getByRole("textbox", { name: "Instructions for Kyoto" });
	await instructions.fill("Ask for the order number");
	await page.getByRole("button", { name: "Send instructions" }).click();
	await expect(page.getByText("Your instructions were sent to Kyoto in this demo.")).toBeVisible();
	await expect(instructions).toBeDisabled();
	await expect(instructions).toHaveValue("Ask for the order number");
	await page.getByRole("button", { name: "Replay" }).click();
	await expect(instructions).toBeEnabled();
	await expect(instructions).toHaveValue("");
});

test("the app shell supplies its text styles without the preview baseline", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "dark" }, "/templates/app-shell");
	await page.addStyleTag({ content: ":root { font-family: serif; color: black; }" });

	const body = page.getByText("Your squad handles orders, customer support and stock.");
	await expect(body).toHaveCSS("font-family", /Inter.*IBM Plex Sans Arabic/);
	await expect(body).toHaveCSS("color", "rgb(220, 220, 220)");

	await page.setViewportSize({ width: 390, height: 844 });
	await page.getByRole("button", { name: "Open workspace navigation" }).click();
	const sheet = page.getByRole("dialog").getByRole("navigation", { name: "Workspace navigation" });
	await expect(sheet.getByText("Accounts")).toHaveCSS("font-family", /Inter.*IBM Plex Sans Arabic/);
});

test("orders select with the keyboard, move between rows and restore focus", async ({ page }) => {
	await page.setViewportSize({ width: 1024, height: 900 });
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/templates/list-detail");
	const orders = page.getByRole("table", { name: "Orders" });
	const row = (id: string) => orders.getByRole("row").filter({ hasText: id });
	const panel = page.locator(".template-order__panel");
	await expect(row("#1044")).toHaveAttribute("aria-selected", "true");
	await expect(panel).toHaveCSS("position", "sticky");
	await expect(panel).toContainText("SAR 779.70");
	await expect(panel.getByRole("button", { name: "Refund" })).toHaveAttribute(
		"data-agent-confirm",
		/^Refund SAR\s779\.70 for order #1044\.$/,
	);
	await row("#1044").press("Enter");
	await row("#1044").press("ArrowUp");
	await expect(row("#1045")).toBeFocused();
	await expect(row("#1045")).toHaveAttribute("aria-selected", "true");
	await expect(panel.getByRole("heading", { name: "#1045" })).toBeVisible();
	await panel.getByRole("button", { name: "Close order details" }).press("Escape");
	await expect(panel).toHaveCount(0);
	await expect(row("#1045")).toBeFocused();
	await row("#1045").press("Space");
	await expect(panel.getByRole("heading", { name: "#1045" })).toBeVisible();
	await page.getByRole("button", { name: "Next page" }).click();
	await expect(orders).toContainText("#1041");
	await expect(page.getByText("Showing 12 of 128")).toBeVisible();
	await page.getByRole("button", { name: "Previous page" }).click();
	await expect(row("#1044")).toBeVisible();
	await page.getByRole("button", { name: "Status: All" }).click();
	await page.getByRole("menuitemradio", { name: "Processing" }).click();
	await expect(orders).toContainText("#1046");
	await expect(row("#1044")).toHaveCount(0);
});

for (const [locale, direction, orderNumber, title] of [
	["en", "ltr", "#1044", "Orders"],
	["ar", "rtl", "#١٠٤٤", "الطلبات"],
] as const) {
	for (const theme of ["light", "dark"] as const) {
		test(`orders open a bottom sheet in ${locale} / ${theme}`, async ({ page }, testInfo) => {
			await page.setViewportSize({ width: 390, height: 900 });
			await openPreview(page, { locale, direction, theme }, "/templates/list-detail");
			const row = page.getByRole("table", { name: title }).getByRole("row").filter({ hasText: orderNumber });
			const sheet = page.getByRole("dialog", { name: orderNumber });
			await expect(sheet).toHaveCount(0);
			await row.press("Enter");
			await expect(sheet).toBeVisible();
			await expect(sheet.getByRole("heading", { level: 2 }).locator("bdi")).toHaveAttribute("dir", "ltr");
			await expect(sheet).toHaveCSS("inset-block-end", "0px");
			await capturePreviewScreenshots(page, testInfo, `template-list-detail-sheet-${locale}-${theme}`, [390]);
			await expectNoHorizontalScroll(page);
			await expectAccessible(page);
			await page.keyboard.press("Escape");
			await expect(sheet).toHaveCount(0);
			await expect(row).toBeFocused();
		});
	}
}
