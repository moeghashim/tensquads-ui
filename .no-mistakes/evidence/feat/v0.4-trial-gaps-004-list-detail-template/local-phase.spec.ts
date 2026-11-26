import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

async function capturePreviewScreenshots(page, testInfo, name, widths = [1440, 390]) {
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('[data-starting-style], [data-ending-style]')).toHaveCount(0);
  const original = page.viewportSize();
  for (const width of widths) {
    await page.setViewportSize({width, height:900});
    const path = `${process.env.LOCAL_EVIDENCE}/${name}-${width}.png`;
    await page.screenshot({path, fullPage:true, animations:'disabled', caret:'hide'});
    await testInfo.attach(name, {path, contentType:'image/png'});
  }
  if (original) await page.setViewportSize(original);
}
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

test("orders clear combined filters with one pointer click", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/templates/list-detail");
	const search = page.getByRole("searchbox", { name: "Search orders" });
	await search.fill("#1044");
	await page.getByRole("button", { name: "Status: All" }).click();
	await page.getByRole("menuitemradio", { name: "Processing", exact: true }).click();
	await expect(page.getByText("No orders match", { exact: true })).toBeVisible();
	await expect(page.locator("[data-starting-style], [data-ending-style]")).toHaveCount(0);
	await page.getByRole("button", { name: "Clear filters", exact: true }).click();
	await expect(search).toHaveValue("");
	await expect(page.getByRole("button", { name: "Status: All" })).toBeVisible();
	const orders = page.getByRole("table", { name: "Orders" });
	await expect(orders.getByRole("row").filter({ hasText: "#1044" })).toBeVisible();
	await expect(page.getByText("Showing 6 of 128", { exact: true })).toBeVisible();
	await expect(page.getByRole("button", { name: "Previous page" })).toBeDisabled();
	await expect(page.locator(".template-order__panel")).toHaveCount(0);
  await page.screenshot({path:process.env.LOCAL_EVIDENCE + "/orders-clear-filters.png",fullPage:true});
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

test('orders date and archive filters constrain exported data and demo actions stay local', async ({page, request}) => {
  const {writeFile, readFile:read} = await import('node:fs/promises');
  const evidence = process.env.LOCAL_EVIDENCE!;
  await page.setViewportSize({width:1440,height:900});
  await openPreview(page,{locale:'en',direction:'ltr',theme:'light'},'/templates/list-detail');
  await page.getByRole('button',{name:'Next page',exact:true}).click();
  await expect(page.locator('.template-order__panel')).toHaveCount(0);
  await page.getByRole('button',{name:'Order dates',exact:true}).click();
  const picker=page.getByRole('dialog',{name:'Order dates',exact:true});
  await picker.getByRole('button',{name:'Last 7 days',exact:true}).click();
  await picker.getByRole('button',{name:'Apply',exact:true}).click();
  await expect(picker).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Previous page',exact:true})).toBeDisabled();
  const downloadPromise=page.waitForEvent('download');
  await page.getByRole('button',{name:'Export',exact:true}).click();
  const download=await downloadPromise;
  await download.saveAs(evidence+'/orders-last-7-days.csv');
  const csv=await read(evidence+'/orders-last-7-days.csv','utf8');
  const lines=csv.split('\r\n');
  expect(lines[0]).toBe('"Order","Customer","Date","Status"');
  expect(lines.length).toBeGreaterThan(6);
  for(const line of lines.slice(1)) {
    const [,customer,date,status] = line.slice(1,-1).split('","');
    expect(customer.length).toBeGreaterThan(0);
    expect(date >= '2026-11-20' && date <= '2026-11-26').toBe(true);
    expect(['paid','pending','processing','refunded','failed']).toContain(status);
  }
  const search=page.getByRole('searchbox',{name:'Search orders'});
  await search.fill('#1044');
  const row=page.getByRole('table',{name:'Orders'}).getByRole('row').filter({hasText:'#1044'});
  await row.click();
  const panel=page.locator('.template-order__panel');
  await expect(panel).toContainText('Yousef Nasser');
  await expect(panel).toContainText('SAR 779.70');
  for(const name of ['Refund','Contact customer']) {
    await Promise.all([
      page.waitForEvent('dialog').then(async dialog => {
        expect(dialog.message()).toBe(name==='Refund'?'This is a sample order.':'This is a sample customer.');
        await dialog.accept();
      }),
      panel.getByRole('button',{name,exact:true}).click()
    ]);
  }
  await page.setViewportSize({width:1023,height:900});
  await expect(panel).toHaveCount(0);
  await row.press('Enter');
  await expect(page.getByRole('dialog',{name:'#1044',exact:true})).toBeVisible();
  await page.screenshot({path:evidence+'/orders-sheet-1023.png',fullPage:true});
  await page.keyboard.press('Escape');
  await expect(row).toBeFocused();
  await page.setViewportSize({width:1024,height:900});
  await row.press('Enter');
  await expect(panel).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.screenshot({path:evidence+'/orders-panel-1024.png',fullPage:true});
  await search.fill('#917');
  await expect(page.getByText('No orders match',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Clear filters',exact:true}).click();
  await search.fill('#917');
  await expect(page.getByText('No orders match',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Status: All',exact:true}).click();
  await page.getByRole('menuitemcheckbox',{name:'Hide archived orders',exact:true}).click();
  await expect(page.getByRole('table',{name:'Orders'})).toContainText('#917');
  await page.getByRole('table',{name:'Orders'}).getByRole('row').filter({hasText:'#917'}).click();
  await expect(panel).toContainText('Refunded');
  await expect(panel.getByRole('button',{name:'Refund',exact:true})).toBeDisabled();
  await page.screenshot({path:evidence+'/orders-archived-filter.png',fullPage:true});
  const markdown=await request.get('/templates/list-detail.md');
  await writeFile(evidence+'/list-detail.md',await markdown.text());
  await writeFile(evidence+'/orders-interactions.txt',[
    'Live Chromium against the local built preview, using bundled demo orders.',
    'Next page clears stale detail. Last 7 days resets pagination.',
    `Export contains ${lines.length-1} orders; every date is in 2026-11-20 through 2026-11-26.`,
    '#1044: Yousef Nasser, SAR 779.70. Refund and Contact show sample-only alerts.',
    '1023px: modal sheet, Escape returns focus. 1024px: side panel, no modal.',
    '#917: hidden while archive filter is on; visible when unchecked. Refunded order cannot be refunded again.',
  ].join('\n'));
});
