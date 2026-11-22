import { expect, test } from "@playwright/test";
import { expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

for (const locale of ["en", "ar"] as const) {
	for (const theme of ["light", "dark"] as const) {
		test(`Palette inserts by pointer and keyboard in ${locale} ${theme}`, async ({ page }) => {
			const direction = locale === "ar" ? "rtl" : "ltr";
			await openPreview(page, { locale, direction, theme }, "/components/Palette");
			const palette = page.getByRole("toolbar", { name: locale === "ar" ? "عُقد سير العمل" : "Workflow nodes" });
			const button = palette.getByRole("button", { name: locale === "ar" ? "وكيل" : "Agent" });
			await expect(palette).toHaveCSS("width", "200px");
			await expect(button).toHaveCSS("height", "40px");
			await button.click();
			await expect(page.getByRole("status")).toHaveText(locale === "ar" ? "تمت إضافة: وكيل" : "Added: Agent");
			await expect(page.locator(".palette-preview")).toHaveAttribute("data-last-source", "mouse");
			await button.focus();
			await page.keyboard.press("ArrowDown");
			await page.keyboard.press("Enter");
			await expect(page.getByRole("status")).toHaveText(locale === "ar" ? "تمت إضافة: النهاية" : "Added: End");
			await expect(page.locator(".palette-preview")).toHaveAttribute("data-last-source", "keyboard");
			await page.keyboard.press("Space");
			await page.keyboard.press("ArrowDown");
			await page.keyboard.press("Space");
			await expect(page.getByRole("status")).toHaveText(locale === "ar" ? "تمت إضافة: ملاحظة" : "Added: Note");
			await expectAccessible(page);
			await page.setViewportSize({ width: 390, height: 844 });
			await expectNoHorizontalScroll(page);
		});
	}
	test(`Palette drops on Canvas in ${locale}`, async ({ page }) => {
		const direction = locale === "ar" ? "rtl" : "ltr";
		await openPreview(page, { locale, direction, theme: "light" }, "/components/Palette");
		const button = page
			.getByRole("toolbar", { name: locale === "ar" ? "عُقد سير العمل" : "Workflow nodes" })
			.getByRole("button", { name: locale === "ar" ? "وكيل" : "Agent" });
		const canvas = page.getByRole("region", { name: locale === "ar" ? "منشئ سير العمل" : "Workflow builder" });
		await button.scrollIntoViewIfNeeded();
		const canvasBox = await canvas.boundingBox();
		if (!canvasBox) throw new Error("Canvas has no layout box");
		const drop = {
			x: direction === "rtl" ? canvasBox.x + 80 : canvasBox.x + canvasBox.width - 80,
			y: canvasBox.y + canvasBox.height - 90,
		};
		const rowBox = await button.boundingBox();
		if (!rowBox) throw new Error("Palette row has no layout box");
		await page.mouse.move(rowBox.x + rowBox.width / 2, rowBox.y + rowBox.height / 2);
		await page.mouse.down();
		await page.mouse.move(drop.x, drop.y, { steps: 12 });
		await expect(page.locator(".ts-palette__ghost")).toBeVisible();
		await page.mouse.up();
		await expect(page.locator(".palette-preview")).toHaveAttribute("data-last-source", "mouse");
		const added = page.locator('[data-node-id="palette-1"]');
		await expect(added).toBeVisible();
		const box = await added.boundingBox();
		if (!box) throw new Error("Inserted node has no layout box");
		expect(Math.abs(box.x - drop.x)).toBeLessThanOrEqual(2);
		expect(Math.abs(box.y - drop.y)).toBeLessThanOrEqual(2);
		await expect(canvas.locator('[data-node-id="palette-2"]')).toHaveCount(0);
		await page.keyboard.down("Control");
		await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
		await page.mouse.wheel(0, -120);
		await page.keyboard.up("Control");
		const zoomedBox = await canvas.boundingBox();
		if (!zoomedBox) throw new Error("Canvas has no layout box after zoom");
		const zoomDrop = {
			x: direction === "rtl" ? zoomedBox.x + 110 : zoomedBox.x + zoomedBox.width - 110,
			y: zoomedBox.y + zoomedBox.height - 110,
		};
		await page.mouse.move(rowBox.x + rowBox.width / 2, rowBox.y + rowBox.height / 2);
		await page.mouse.down();
		await page.mouse.move(zoomDrop.x, zoomDrop.y, { steps: 12 });
		await page.mouse.up();
		const zoomedNode = page.locator('[data-node-id="palette-2"]');
		await expect(zoomedNode).toBeVisible();
		const zoomedNodeBox = await zoomedNode.boundingBox();
		if (!zoomedNodeBox) throw new Error("Zoomed node has no layout box");
		expect(Math.abs(zoomedNodeBox.x - zoomDrop.x)).toBeLessThanOrEqual(2);
		expect(Math.abs(zoomedNodeBox.y - zoomDrop.y)).toBeLessThanOrEqual(2);
		await page.mouse.move(rowBox.x + rowBox.width / 2, rowBox.y + rowBox.height / 2);
		await page.mouse.down();
		await page.mouse.move(zoomDrop.x, zoomDrop.y, { steps: 8 });
		await page.mouse.move(rowBox.x + rowBox.width / 2, rowBox.y + rowBox.height / 2, { steps: 8 });
		await page.mouse.up();
		await expect(canvas.locator('[data-node-id="palette-2"]')).toHaveCount(1);
		await page.mouse.move(rowBox.x + rowBox.width / 2, rowBox.y + rowBox.height / 2);
		await page.mouse.down();
		await page.mouse.move(zoomDrop.x, zoomDrop.y, { steps: 8 });
		await page.keyboard.press("Escape");
		await expect(page.locator(".ts-palette__ghost")).toHaveCount(0);
		await expect(canvas.locator('[data-node-id="palette-3"]')).toHaveCount(0);
	});
}
