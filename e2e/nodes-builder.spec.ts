import { expect, type Locator, type Page, test } from "@playwright/test";
import { capturePreviewScreenshots, expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

const step = (page: Page, id: string) => page.locator(`[data-node-id="${id}"]`);
const edge = (page: Page, from: string, to: string) => page.locator(`[data-edge-from="${from}"][data-edge-to="${to}"]`);
const steps = (page: Page) => page.locator(".builder-stage [data-node-id]");

async function positions(page: Page) {
	return steps(page).evaluateAll((nodes) =>
		nodes.map((element) => {
			const node = element as HTMLElement;
			return [node.dataset.nodeId, node.style.insetInlineStart, node.style.insetBlockStart];
		}),
	);
}

async function tabTo(page: Page, locator: Locator) {
	for (let attempts = 0; attempts < 30; attempts++) {
		if (await locator.evaluate((node) => node === document.activeElement)) return;
		await page.keyboard.press("Tab");
	}
	await expect(locator).toBeFocused();
}

async function command(page: Page, label: string) {
	const dialog = page.getByRole("dialog", { name: "Search workflow" });
	await expect(async () => {
		await page.keyboard.press("Control+k");
		await expect(dialog).toBeVisible({ timeout: 500 });
	}).toPass({ timeout: 5000 });
	await page.keyboard.type(label);
	await page.keyboard.press("Enter");
	await expect(dialog).toBeHidden();
}

async function drag(page: Page, source: Locator, destination: { x: number; y: number }) {
	const box = (await source.boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
	await page.mouse.move(destination.x, destination.y, { steps: 8 });
	await page.mouse.up();
}

for (const locale of ["en", "ar"] as const) {
	test(`Builder minimap opens at the inline start in ${locale}`, async ({ page }) => {
		await page.setViewportSize({ width: 1200, height: 900 });
		await openPreview(page, { locale, direction: locale === "ar" ? "rtl" : "ltr", theme: "light" }, "/nodes");
		const canvas = page.locator('[data-slot="workflow-canvas"]');
		const minimap = canvas.getByRole("region", { name: locale === "ar" ? "خريطة مصغّرة" : "Minimap" });
		await expect(minimap).toHaveCount(0);
		await expect(canvas.locator(".ts-canvas__world")).not.toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
		await canvas.focus();
		for (let count = 0; count < 8; count++) await page.keyboard.press("+");
		await expect(minimap).toHaveAttribute("data-placement", "start");
		const surface = (await canvas.boundingBox())!;
		const map = (await minimap.boundingBox())!;
		const inset = locale === "ar" ? surface.x + surface.width - map.x - map.width : map.x - surface.x;
		expect(inset).toBeLessThan(20);
	});
	for (const theme of ["light", "dark"] as const) {
		const ar = locale === "ar";
		const direction = ar ? "rtl" : "ltr";
		test(`Nodes builder in ${locale} ${theme}`, async ({ page }, testInfo) => {
			await page.setViewportSize({ width: 1440, height: 900 });
			await openPreview(page, { locale, direction, theme }, "/nodes");
			await expect(page.getByRole("heading", { level: 1 })).toHaveText(ar ? "فرز طلبات الدعم" : "Support triage");
			await expect(page.getByRole("navigation").getByRole("link", { name: ar ? "العُقَد" : "Nodes" })).toHaveAttribute(
				"aria-current",
				"page",
			);
			const start = (await step(page, "start").boundingBox())!;
			const end = (await step(page, "end").boundingBox())!;
			expect(ar ? start.x > end.x : start.x < end.x).toBe(true);
			await expectAccessible(page);
			await capturePreviewScreenshots(page, testInfo, `nodes-${locale}-${direction}-${theme}`);
			await expectNoHorizontalScroll(page);

			const palette = page.getByRole("button", { name: ar ? "إضافة خطوة" : "Add a step", exact: true });
			const inspector = page.getByRole("button", { name: ar ? "لوحة الخصائص" : "Inspector", exact: true });
			await palette.click();
			await expect(palette).toHaveAttribute("aria-expanded", "true");
			await expect(page.locator("#builder-palette").getByRole("button", { name: "MCP" })).toBeVisible();
			await inspector.click();
			await expect(palette).toHaveAttribute("aria-expanded", "false");
			await expect(inspector).toHaveAttribute("aria-expanded", "true");
			await expect(page.getByRole("textbox", { name: ar ? "العنوان" : "Title" })).toBeVisible();
			await expectAccessible(page);
		});
	}
}

test("build a flow with keys, then undo the move and connection", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/nodes");
	await command(page, "Transform");
	const inserted = step(page, "step-1");
	await expect(inserted).toHaveAttribute("aria-selected", "true");
	const connect = page.getByRole("combobox", { name: "+ Connect to a step" });
	await tabTo(page, connect);
	await page.keyboard.press("Enter");
	const targets = page.locator('[data-slot="select-content"]');
	await expect(targets).toBeVisible();
	await page.keyboard.press("End");
	await page.keyboard.press("Enter");
	await expect(edge(page, "step-1", "end")).toHaveCount(1);
	await page.keyboard.press("Escape");
	await expect(targets).toBeHidden();

	await tabTo(page, inserted);
	const before = await positions(page);
	const x = await inserted.evaluate((node) => Number.parseInt((node as HTMLElement).style.insetInlineStart, 10));
	await page.keyboard.press("Shift+ArrowRight");
	await expect(inserted).toHaveCSS("inset-inline-start", `${x + 20}px`);
	await page.keyboard.press("Control+z");
	await expect.poll(() => positions(page)).toEqual(before);
	await page.keyboard.press("Control+z");
	await expect(edge(page, "step-1", "end")).toHaveCount(0);
	await page.keyboard.press("Control+Shift+z");
	await expect(edge(page, "step-1", "end")).toHaveCount(1);
});

test("drag to add a step, connect it, move it, and undo", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/nodes");
	const palette = page.getByRole("toolbar", { name: "Add a step" });
	await drag(page, palette.getByRole("button", { name: "Transform" }), { x: 433, y: 635 });
	const inserted = step(page, "step-1");
	await expect(inserted).toHaveAttribute("aria-selected", "true");
	const end = (await step(page, "end").boundingBox())!;
	await drag(page, inserted.locator('[data-port="out"]'), { x: end.x + end.width / 2, y: end.y + end.height / 2 });
	await expect(edge(page, "step-1", "end")).toHaveCount(1);
	const before = await positions(page);
	const box = (await inserted.boundingBox())!;
	await drag(page, inserted, { x: box.x + box.width / 2 + 40, y: box.y + box.height / 2 - 40 });
	await expect.poll(() => positions(page)).not.toEqual(before);
	await page.getByRole("button", { name: "Undo (⌘Z)" }).click();
	await expect.poll(() => positions(page)).toEqual(before);
});

test("jump and tidy from commands and shortcut, with one undo per layout", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto("/nodes");
	const guide = page.getByRole("button", { name: "Guide", exact: true });
	await page.getByRole("button", { name: "Hide guide" }).click();
	await expect(guide).toBeFocused();
	await expect(guide).toHaveAttribute("aria-pressed", "false");
	await guide.click();
	await expect(page.getByRole("heading", { name: "How to build a workflow" })).toBeVisible();
	const view = page.locator(".ts-canvas__world");
	const initialView = await view.evaluate((element) => getComputedStyle(element).transform);
	await command(page, "Answer from FAQ");
	const faq = step(page, "faq");
	await expect(faq).toHaveAttribute("aria-selected", "true");
	await expect.poll(() => view.evaluate((element) => getComputedStyle(element).transform)).not.toBe(initialView);

	await tabTo(page, faq);
	await page.keyboard.press("Shift+ArrowUp");
	await page.keyboard.press("Shift+ArrowUp");
	const messy = await positions(page);
	for (const trigger of [() => command(page, "Tidy layout"), () => page.keyboard.press("Control+Shift+l")]) {
		await trigger();
		await expect.poll(() => positions(page)).not.toEqual(messy);
		await expect(faq).toHaveAttribute("aria-selected", "true");
		await expect(faq).toBeFocused();
		await expect
			.poll(() =>
				steps(page).evaluateAll((nodes) => {
					const boxes = nodes.map((node) => node.getBoundingClientRect());
					return boxes.some((a, index) =>
						boxes
							.slice(index + 1)
							.some((b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top),
					);
				}),
			)
			.toBe(false);
		await page.keyboard.press("Control+z");
		await expect.poll(() => positions(page)).toEqual(messy);
	}
});

test("workflow cards open the localized demos and edits end when leaving the page", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await openPreview(page, { locale: "en", direction: "ltr", theme: "dark" }, "/nodes");
	const title = page.getByRole("textbox", { name: "Title" });
	await title.fill("Refund review");
	await title.press("End");
	await title.press("v");
	await expect(title).toHaveValue("Refund reviewv");
	await expect(step(page, "refund")).toContainText("Refund reviewv");
	await expect(page.getByRole("button", { name: "Select (S)" })).toHaveAttribute("aria-pressed", "true");
	await page.getByRole("button", { name: "Undo (⌘Z)" }).click();
	await expect(title).toHaveValue("Refund agent");
	await title.fill("Refund review");
	await page.getByRole("link", { name: "Workflows" }).click();
	await expect(page).toHaveURL(/\/workflows\?locale=en&dir=ltr&theme=dark$/);
	await expect(page.locator(".workflow-list__grid article")).toHaveCount(3);
	for (const [name, id] of [
		["Order review", "orders"],
		["Store onboarding", "onboarding"],
		["Support triage", "support"],
	]) {
		await page.getByRole("link", { name }).click();
		await expect(page).toHaveURL(new RegExp(`/nodes/${id}\\?`));
		await expect(page.getByRole("heading", { level: 1 })).toHaveText(name!);
		if (id !== "support") await page.getByRole("link", { name: "Workflows" }).click();
	}
	await page.waitForLoadState("networkidle");
	await expect(title).toHaveValue("Refund agent");
	await page.getByRole("button", { name: "Duplicate" }).click();
	await expect(step(page, "step-1")).toHaveAttribute("aria-selected", "true");
	await expect(title).toHaveValue("Refund agent copy");
	const remove = page.getByRole("button", { name: "Delete step" });
	await expect(remove).toHaveAttribute("data-agent-confirm", /Refund agent copy/);
	await remove.click();
	await expect(step(page, "step-1")).toHaveCount(0);
	await expect(page.getByText("Select a step to edit its settings.")).toBeVisible();
	await page.getByRole("button", { name: "Undo (⌘Z)" }).click();
	await expect(step(page, "step-1")).toHaveCount(1);
	await page.emulateMedia({ colorScheme: "dark" });
	await page.getByRole("button", { name: "Switch to light theme" }).click();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
	await page.goto("/nodes");
	await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
