import { expect, test } from "@playwright/test";
import { capturePreviewScreenshots, expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

for (const locale of ["en", "ar"] as const) {
	for (const theme of ["light", "dark"] as const) {
		test(`Node kinds, ports, and accessibility in ${locale} ${theme}`, async ({ page }, testInfo) => {
			const direction = locale === "ar" ? "rtl" : "ltr";
			await openPreview(page, { locale, direction, theme }, "/components/Node");
			const preview = page.locator(".node-preview");
			const nodes = preview.locator(".node-preview__grid [data-slot='workflow-node']");
			await expect(nodes).toHaveCount(13);
			await expect(preview.locator('[data-kind="start"] [data-port="in"]')).toHaveCount(0);
			await expect(preview.locator('[data-kind="end"] [data-port="out"]')).toHaveCount(0);
			await expect(preview.locator('[data-kind="if-else"][data-selected="true"] [data-port="out"]')).toHaveCount(2);
			const sides = await preview
				.locator('[data-kind="agent"]')
				.first()
				.evaluate((node) => {
					const bounds = (element: Element) => {
						const rect = element.getBoundingClientRect();
						return { left: rect.left, right: rect.right };
					};
					return {
						card: bounds(node),
						input: bounds(node.querySelector('[data-port="in"]')!),
						output: bounds(node.querySelector('[data-port="out"]')!),
					};
				});
			if (direction === "rtl") {
				expect(sides.input.left).toBeGreaterThan(sides.card.left + (sides.card.right - sides.card.left) / 2);
				expect(sides.output.right).toBeLessThan(sides.card.left + (sides.card.right - sides.card.left) / 2);
			} else {
				expect(sides.input.right).toBeLessThan(sides.card.left + (sides.card.right - sides.card.left) / 2);
				expect(sides.output.left).toBeGreaterThan(sides.card.left + (sides.card.right - sides.card.left) / 2);
			}
			await expectAccessible(page);
			await capturePreviewScreenshots(page, testInfo, `Node-${locale}-${direction}-${theme}`, [1440, 390]);
			await expectNoHorizontalScroll(page);
		});
	}
}
