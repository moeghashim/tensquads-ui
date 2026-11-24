import { expect, test } from "@playwright/test";
import { capturePreviewScreenshots, expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

for (const locale of ["en", "ar"] as const) {
	const ar = locale === "ar";
	const direction = ar ? "rtl" : "ltr";
	for (const theme of ["light", "dark"] as const) {
		test(`MiniMap pans by pointer and keyboard in ${locale} ${theme}`, async ({ page }) => {
			await openPreview(page, { locale, direction, theme }, "/components/MiniMap");
			const large = page.getByRole("region", { name: ar ? "مخطط كبير" : "Large graph", exact: true });
			const small = page.getByRole("region", { name: ar ? "مخطط صغير" : "Small graph", exact: true });
			const name = ar ? "خريطة مصغّرة" : "Minimap";
			const map = large.getByRole("region", { name, exact: true });
			const mask = map.locator("[data-viewport-mask]");
			await expect(map).toBeVisible();
			await expect(small.getByRole("region", { name })).toHaveCount(0);
			await expect(map).toHaveCSS("width", "180px");
			await expect(map).toHaveCSS("height", "110px");
			const frame = (await large.boundingBox())!;
			const bounds = (await map.boundingBox())!;
			expect(ar ? frame.x + frame.width - bounds.x - bounds.width : bounds.x - frame.x).toBeCloseTo(16);
			expect(frame.y + frame.height - bounds.y - bounds.height).toBeCloseTo(16);
			await expectAccessible(page);
			await capturePreviewScreenshots(page, test.info(), `MiniMap-${locale}-${theme}`);

			await map.focus();
			await expect(map).toHaveCSS("outline-width", "2px");
			await expect(map).toHaveCSS("outline-offset", "2px");
			await expect(map).toHaveCSS("outline-color", theme === "light" ? "rgb(1, 105, 204)" : "rgb(2, 133, 255)");
			const world = large.getByRole("listbox");
			const before = await world.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).e);
			await page.keyboard.press("ArrowRight");
			await expect
				.poll(() => world.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).e))
				.toBeCloseTo(before - frame.width * 0.1, 2);

			const beforeDrag = Number(await mask.getAttribute("x"));
			const mapBox = (await map.boundingBox())!;
			const maskBox = (await mask.boundingBox())!;
			const dragX =
				(Math.max(mapBox.x, maskBox.x) + Math.min(mapBox.x + mapBox.width, maskBox.x + maskBox.width)) / 2;
			const dragY =
				(Math.max(mapBox.y, maskBox.y) + Math.min(mapBox.y + mapBox.height, maskBox.y + maskBox.height)) / 2;
			expect(
				await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.hasAttribute("data-viewport-mask"), {
					x: dragX,
					y: dragY,
				}),
			).toBe(true);
			await page.mouse.move(dragX, dragY);
			await page.mouse.down();
			await page.mouse.move(dragX + (ar ? -18 : 18), dragY, { steps: 4 });
			await page.mouse.up();
			await expect.poll(async () => Number(await mask.getAttribute("x"))).toBeGreaterThan(beforeDrag);
			const oldX = Number(await mask.getAttribute("x"));
			await map.click({ position: { x: ar ? 14 : 166, y: 55 } });
			await expect.poll(async () => Number(await mask.getAttribute("x"))).toBeGreaterThan(oldX);
			await expectNoHorizontalScroll(page);
		});

		test(`WorkflowCard fits its graphs and keeps menu actions separate in ${locale} ${theme}`, async ({
			page,
			request,
		}) => {
			await openPreview(page, { locale, direction, theme }, "/components/WorkflowCard");
			const grid = page.locator(".workflow-card-preview__grid");
			const cards = grid.getByRole("article");
			await expect(cards).toHaveCount(3);
			const card = cards.first();
			const thumbnail = card.locator(".ts-workflow-card__thumbnail");
			await expect(thumbnail).toHaveCSS("height", "132px");
			await expect(thumbnail.locator("svg")).toHaveCSS("transform", ar ? "matrix(-1, 0, 0, 1, 0, 0)" : "none");
			await expect(cards.last().locator(".ts-workflow-card__thumbnail svg")).toHaveCount(0);
			await expect(card.getByRole("term")).toHaveCount(3);
			await expectAccessible(page);
			await capturePreviewScreenshots(page, test.info(), `WorkflowCard-${locale}-${theme}`);
			await thumbnail.scrollIntoViewIfNeeded();
			const thumbnailBox = (await thumbnail.boundingBox())!;
			await page.mouse.click(thumbnailBox.x + thumbnailBox.width / 2, thumbnailBox.y + thumbnailBox.height / 2);
			await expect(page).toHaveURL(/#order-review$/);
			const trigger = card.getByRole("button");
			await trigger.click();
			await expect(page).toHaveURL(/#order-review$/);
			const menu = page.getByRole("menu");
			await expect(menu.getByRole("menuitem")).toHaveText(
				ar ? ["فتح", "إنشاء نسخة", "إلغاء النشر", "حذف"] : ["Open", "Duplicate", "Unpublish", "Delete"],
			);
			await expect(menu.getByRole("menuitem").last()).toHaveAttribute("data-destructive", "");
			await expectAccessible(page);
			await page.keyboard.press("Escape");
			await expect(trigger).toBeFocused();
			await expect(trigger).toHaveCSS("outline-width", "2px");
			await expect(trigger).toHaveCSS("outline-offset", "2px");
			await expect(trigger).toHaveCSS("outline-color", theme === "light" ? "rgb(1, 105, 204)" : "rgb(2, 133, 255)");
			await expectNoHorizontalScroll(page);
			const markdown = await request.get(`/components/WorkflowCard.md?locale=${locale}`);
			expect(markdown.ok()).toBe(true);
			expect(markdown.headers()["content-type"]).toContain("text/markdown");
		});
	}
}

test("serves the MiniMap Markdown twin", async ({ request }) => {
	const markdown = await request.get("/components/MiniMap.md");
	expect(markdown.ok()).toBe(true);
	expect(markdown.headers()["content-type"]).toContain("text/markdown");
	expect(await markdown.text()).toContain("# MiniMap");
});
