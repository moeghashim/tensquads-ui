import { expect, test } from "@playwright/test";
import { portPosition } from "../packages/ui/src/react/workflow/geometry";
import type { WorkflowNode } from "../packages/ui/src/schemas/workflow";
import { capturePreviewScreenshots, expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

for (const locale of ["en", "ar"] as const) {
	for (const theme of ["light", "dark"] as const) {
		test(`Node kinds, Canvas port centres, and accessibility in ${locale} ${theme}`, async ({ page }, testInfo) => {
			const direction = locale === "ar" ? "rtl" : "ltr";
			await openPreview(page, { locale, direction, theme }, "/components/Node");
			const preview = page.locator(".node-preview");
			const nodes = preview.locator(".node-preview__grid [data-slot='workflow-node']");
			await expect(nodes).toHaveCount(13);
			await expect(preview.locator('[data-kind="start"] [data-port="in"]')).toHaveCount(0);
			await expect(preview.locator('[data-kind="end"] [data-port="out"]')).toHaveCount(0);
			await expect(preview.locator('[data-kind="if-else"][data-selected="true"] [data-port="out"]')).toHaveCount(3);
			const renderedNodes = await preview.locator('[data-slot="workflow-node"]').evaluateAll((nodes) =>
				nodes.map((node) => {
					const card = node.getBoundingClientRect();
					const rtl = getComputedStyle(node).direction === "rtl";
					return {
						kind: node.getAttribute("data-kind"),
						width: card.width,
						branches: Array.from(
							node.querySelectorAll(".ts-node__branch-label"),
							(label) => label.textContent ?? "",
						),
						ports: Array.from(node.querySelectorAll("[data-port]"), (port) => {
							const rect = port.getBoundingClientRect();
							const centreX = rect.left + rect.width / 2;
							return {
								type: port.getAttribute("data-port"),
								index: Number(port.getAttribute("data-port-index")),
								x: rtl ? card.right - centreX : centreX - card.left,
								y: rect.top + rect.height / 2 - card.top,
							};
						}),
					};
				}),
			);
			for (const rendered of renderedNodes) {
				const node: WorkflowNode = {
					id: "measured",
					kind: rendered.kind as WorkflowNode["kind"],
					title: "Measured node",
					position: { x: 0, y: 0 },
					...(rendered.branches.length ? { branches: rendered.branches } : {}),
				};
				for (const port of rendered.ports) {
					const input = port.type === "in";
					const expected = portPosition(node, input ? "in" : { out: port.index }, rendered.width);
					expect(port.x).toBeCloseTo(input ? 0 : rendered.width, 4);
					expect(port.y).toBeCloseTo(!input && node.branches ? 65 + 32 * port.index : 26.5, 4);
					expect(port.x).toBeCloseTo(expected.x, 4);
					expect(port.y).toBeCloseTo(expected.y, 4);
				}
			}
			await expectAccessible(page);
			await capturePreviewScreenshots(page, testInfo, `Node-${locale}-${direction}-${theme}`, [1440, 390]);
			await expectNoHorizontalScroll(page);
		});
	}
}
