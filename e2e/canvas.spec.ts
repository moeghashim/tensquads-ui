import { expect, type Locator, test } from "@playwright/test";
import { capturePreviewScreenshots, expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

for (const locale of ["en", "ar"] as const) {
	for (const theme of ["light", "dark"] as const) {
		test(`Canvas renders edges and supports viewport gestures in ${locale} ${theme}`, async ({ page }, testInfo) => {
			const direction = locale === "ar" ? "rtl" : "ltr";
			await openPreview(page, { locale, direction, theme }, "/components/Canvas");
			const root = page.getByRole("region", { name: locale === "ar" ? "منشئ سير العمل" : "Workflow builder" });
			const world = root.locator(".ts-canvas__world");
			await expect(root.locator(".ts-canvas__edge")).toHaveCount(8);
			await expect.poll(() => edgeErrors(root)).toEqual([]);
			await expectAccessible(page);

			const startNode = root.locator('[data-node-id="start"]');
			await startNode.click();
			await expect(startNode).toHaveAttribute("aria-selected", "true");
			const hitPath = root.locator(".ts-canvas__edge-hit").first();
			const edge = hitPath.locator("xpath=..");
			const midpoint = await hitPath.evaluate((element) => {
				const path = element as SVGPathElement;
				const point = path.getPointAtLength(path.getTotalLength() / 2);
				const matrix = path.getScreenCTM();
				if (!matrix) throw new Error("Edge hit path has no screen transform");
				const screen = new DOMPoint(point.x, point.y).matrixTransform(matrix);
				return { x: screen.x, y: screen.y };
			});
			await page.mouse.click(midpoint.x, midpoint.y);
			await expect(edge).toHaveAttribute("data-selected", "true");
			const groundPoint = await root.evaluate((element) => {
				const rect = element.getBoundingClientRect();
				return { x: rect.right - 24, y: rect.bottom - 24 };
			});
			await page.mouse.move(groundPoint.x, groundPoint.y);
			await page.mouse.down();
			await page.mouse.move(groundPoint.x + 8, groundPoint.y + 1, { steps: 2 });
			await page.mouse.up();
			await expect(edge).toHaveAttribute("data-selected", "true");
			await page.mouse.click(groundPoint.x, groundPoint.y);
			await expect(edge).not.toHaveAttribute("data-selected", "true");
			if (direction === "rtl") {
				const start = await root.locator('[data-kind="start"]').boundingBox();
				const end = await root.locator('[data-kind="end"]').boundingBox();
				expect(start && end && start.x).toBeGreaterThan(end?.x ?? Infinity);
			}

			const initial = await world.evaluate((element) => getComputedStyle(element).transform);
			await root.scrollIntoViewIfNeeded();
			const visibleGround = await root.boundingBox();
			if (!visibleGround) throw new Error("Canvas surface has no visible box");
			await page.mouse.move(visibleGround.x + visibleGround.width - 24, visibleGround.y + visibleGround.height - 24);
			await page.mouse.down();
			await page.mouse.move(visibleGround.x + visibleGround.width + 26, visibleGround.y + visibleGround.height + 6, {
				steps: 2,
			});
			await page.mouse.up();
			const panned = await world.evaluate((element) => getComputedStyle(element).transform);
			const tx = (value: string) =>
				Number(value.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,\s*([^,]+),\s*([^)]+)\)/)?.[1]);
			const ty = (value: string) =>
				Number(value.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,\s*([^,]+),\s*([^)]+)\)/)?.[2]);
			expect(tx(panned) - tx(initial)).toBeCloseTo(50, 0);
			expect(ty(panned) - ty(initial)).toBeCloseTo(30, 0);
			await expect.poll(() => edgeErrors(root)).toEqual([]);

			const beforeWheel = await world.evaluate((element) => getComputedStyle(element).transform);
			await page.mouse.move(visibleGround.x + visibleGround.width / 2, visibleGround.y + visibleGround.height - 8);
			await page.mouse.wheel(0, -80);
			await expect
				.poll(() => world.evaluate((element) => getComputedStyle(element).transform))
				.not.toBe(beforeWheel);
			await expect.poll(() => edgeErrors(root)).toEqual([]);

			const surface = await root.boundingBox();
			if (!surface) throw new Error("Canvas surface has no box");
			const point = { x: surface.x + surface.width * 0.55, y: surface.y + surface.height * 0.45 };
			// The world is a zero-size box at the graph origin, so its box is the origin on screen in both directions.
			const graphPoint = () =>
				world.evaluate((element, at) => {
					const origin = element.getBoundingClientRect();
					const zoom = new DOMMatrix(getComputedStyle(element).transform).a;
					return { x: (at.x - origin.left) / zoom, y: (at.y - origin.top) / zoom };
				}, point);
			const beforeZoomPoint = await graphPoint();
			await root.evaluate((element, coordinates) => {
				element.dispatchEvent(
					new WheelEvent("wheel", {
						bubbles: true,
						cancelable: true,
						ctrlKey: true,
						deltaY: -20,
						clientX: coordinates.x,
						clientY: coordinates.y,
					}),
				);
			}, point);
			const afterZoomPoint = await graphPoint();
			expect(Math.abs(afterZoomPoint.x - beforeZoomPoint.x)).toBeLessThanOrEqual(1);
			expect(Math.abs(afterZoomPoint.y - beforeZoomPoint.y)).toBeLessThanOrEqual(1);
			await expect.poll(() => edgeErrors(root)).toEqual([]);

			const select = root.getByRole("radio", { name: locale === "ar" ? "تحديد" : "Select" });
			await select.focus();
			const overlayBefore = await world.evaluate((element) => getComputedStyle(element).transform);
			await page.keyboard.press("+");
			expect(await world.evaluate((element) => getComputedStyle(element).transform)).toBe(overlayBefore);
			await root
				.locator("[data-canvas-overlay]")
				.dispatchEvent("wheel", { bubbles: true, cancelable: true, deltaY: -100 });
			expect(await world.evaluate((element) => getComputedStyle(element).transform)).toBe(overlayBefore);

			await page.reload();
			await root.waitFor({ state: "visible" });
			await root.scrollIntoViewIfNeeded();
			const node = root.locator('[data-node-id="start"]');
			const nodeBox = await node.boundingBox();
			if (!nodeBox) throw new Error("Start node has no box");
			const selectMode = await world.evaluate((element) => getComputedStyle(element).transform);
			await page.mouse.move(nodeBox.x + nodeBox.width / 2, nodeBox.y + nodeBox.height / 2);
			await page.mouse.down();
			await page.mouse.move(nodeBox.x + nodeBox.width / 2 + 24, nodeBox.y + nodeBox.height / 2 + 12);
			await page.mouse.up();
			expect(await world.evaluate((element) => getComputedStyle(element).transform)).toBe(selectMode);
			const pan = root.getByRole("radio", { name: locale === "ar" ? "تحريك" : "Pan" });
			await pan.click();
			const panMode = await world.evaluate((element) => getComputedStyle(element).transform);
			await page.mouse.move(nodeBox.x + nodeBox.width / 2, nodeBox.y + nodeBox.height / 2);
			await page.mouse.down();
			await page.mouse.move(nodeBox.x + nodeBox.width / 2 + 24, nodeBox.y + nodeBox.height / 2 + 12);
			await page.mouse.up();
			const panModeAfter = await world.evaluate((element) => getComputedStyle(element).transform);
			expect(tx(panModeAfter) - tx(panMode)).toBeCloseTo(24, 0);
			expect(ty(panModeAfter) - ty(panMode)).toBeCloseTo(12, 0);

			await capturePreviewScreenshots(page, testInfo, `Canvas-${locale}-${direction}-${theme}`, [1440, 390]);
			await expectNoHorizontalScroll(page);
		});
	}
}

async function edgeErrors(root: Locator) {
	return root.evaluate((element) => {
		const errors: number[] = [];
		for (const edge of element.querySelectorAll<SVGGElement>("[data-edge-from]")) {
			const path = edge.querySelector(".ts-canvas__edge");
			const from = element.querySelector<HTMLElement>(`[data-node-id="${edge.dataset.edgeFrom}"]`);
			const to = element.querySelector<HTMLElement>(`[data-node-id="${edge.dataset.edgeTo}"]`);
			const output = from?.querySelector<HTMLElement>(
				`[data-port="out"][data-port-index="${edge.dataset.edgeFromPort}"]`,
			);
			const input = to?.querySelector<HTMLElement>('[data-port="in"]');
			const matrix = path?.getScreenCTM();
			if (!path || !output || !input || !matrix) {
				errors.push(Number.POSITIVE_INFINITY);
				continue;
			}
			const start = path.getPointAtLength(0);
			const end = path.getPointAtLength(path.getTotalLength());
			const distance = (point: DOMPoint, port: HTMLElement) => {
				const transformed = new DOMPoint(point.x, point.y).matrixTransform(matrix);
				const rect = port.getBoundingClientRect();
				return Math.hypot(
					transformed.x - (rect.left + rect.width / 2),
					transformed.y - (rect.top + rect.height / 2),
				);
			};
			for (const error of [distance(start, output), distance(end, input)]) if (error > 1) errors.push(error);
		}
		return errors;
	});
}

test("Canvas zoom keys change the viewport", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/components/Canvas");
	const root = page.getByRole("region", { name: "Workflow builder" });
	const world = root.locator(".ts-canvas__world");
	await root.focus();
	await page.keyboard.press("0");
	const scale = async () =>
		world.evaluate((element) => Number(getComputedStyle(element).transform.match(/matrix\(([^,]+)/)?.[1]));
	await page.keyboard.press("+");
	await expect.poll(scale).toBeCloseTo(1.25);
	await page.keyboard.press("-");
	await expect.poll(scale).toBeCloseTo(1);
	await page.keyboard.press("0");
	await expect.poll(scale).toBeCloseTo(1);
});
