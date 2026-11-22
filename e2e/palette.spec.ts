import { expect, test } from "@playwright/test";
import { capturePreviewScreenshots, expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

for (const locale of ["en", "ar"] as const) {
	for (const theme of ["light", "dark"] as const) {
		test(`Palette inserts by pointer and keyboard in ${locale} ${theme}`, async ({ page }) => {
			const direction = locale === "ar" ? "rtl" : "ltr";
			await openPreview(page, { locale, direction, theme }, "/components/Palette");
			await capturePreviewScreenshots(page, test.info(), `palette-${locale}-${direction}-${theme}`);
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
		const palette = page.getByRole("toolbar", { name: locale === "ar" ? "عُقد سير العمل" : "Workflow nodes" });
		const row = palette.getByRole("button", { name: locale === "ar" ? "وكيل" : "Agent" });
		const canvas = page.getByRole("region", { name: locale === "ar" ? "منشئ سير العمل" : "Workflow builder" });
		const ghost = page.locator(".ts-palette__ghost");
		const nodes = canvas.locator("[data-node-id]");
		await canvas.scrollIntoViewIfNeeded();
		const canvasBox = (await canvas.boundingBox())!;
		const paletteBox = (await palette.boundingBox())!;
		expect(paletteBox.height).toBeLessThan(canvasBox.height);
		const rowBox = (await row.boundingBox())!;
		const press = { x: rowBox.x + rowBox.width / 2, y: rowBox.y + rowBox.height / 2 };
		const place = {
			x: canvasBox.x + canvasBox.width * (direction === "rtl" ? 0.3 : 0.7),
			y: canvasBox.y + canvasBox.height * 0.75,
		};
		const dragTo = async (to: { x: number; y: number }) => {
			await page.mouse.move(press.x, press.y);
			await page.mouse.down();
			await page.mouse.move(to.x, to.y, { steps: 12 });
			await expect(ghost).toBeVisible();
		};
		const expectAtPlace = async (index: number) => {
			const box = (await nodes.nth(index).boundingBox())!;
			const start = direction === "rtl" ? box.x + box.width : box.x;
			expect(Math.abs(start - place.x)).toBeLessThanOrEqual(2);
			expect(Math.abs(box.y - place.y)).toBeLessThanOrEqual(2);
		};

		await dragTo(place);
		// The ghost keeps the place under the pointer where the row was pressed.
		await expect
			.poll(async () => {
				const box = (await ghost.boundingBox())!;
				return Math.hypot(box.x + press.x - rowBox.x - place.x, box.y + press.y - rowBox.y - place.y);
			})
			.toBeLessThanOrEqual(1);
		await page.mouse.up();
		await expect(nodes).toHaveCount(2);
		await expect(ghost).toHaveCount(0);
		await expect(page.locator(".palette-preview")).toHaveAttribute("data-last-source", "mouse");
		await expectAtPlace(1);

		await page.mouse.move(place.x, canvasBox.y + canvasBox.height * 0.3);
		await page.keyboard.down("Control");
		await page.mouse.wheel(0, -120);
		await page.keyboard.up("Control");
		await expect.poll(async () => (await nodes.nth(0).boundingBox())!.width).toBeGreaterThan(90);
		await dragTo(place);
		await page.mouse.up();
		await expect(nodes).toHaveCount(3);
		await expectAtPlace(2);

		await dragTo(place);
		await page.mouse.move(press.x, press.y + 60, { steps: 8 });
		await page.mouse.up();
		await expect(ghost).toHaveCount(0);
		await expect(nodes).toHaveCount(3);

		await dragTo(place);
		await page.keyboard.press("Escape");
		await expect(ghost).toHaveCount(0);
		await page.mouse.up();
		await expect(nodes).toHaveCount(3);

		await row.press("Enter");
		await expect(nodes).toHaveCount(4);
	});
}
