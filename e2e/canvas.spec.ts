import { expect, type Locator, test } from "@playwright/test";
import { capturePreviewScreenshots, expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

for (const locale of ["en", "ar"] as const) {
	test(`Canvas moves and cancels nodes in ${locale}`, async ({ page }) => {
		const direction = locale === "ar" ? "rtl" : "ltr";
		await openPreview(page, { locale, direction, theme: "light" }, "/components/Canvas");
		const root = page.getByRole("region", { name: locale === "ar" ? "منشئ سير العمل" : "Workflow builder" });
		const node = (id: string) => root.locator(`[data-node-id="${id}"]`);
		await expect.poll(() => edgeErrors(root)).toEqual([]);
		await root.scrollIntoViewIfNeeded();
		const clickBefore = await node("refund").boundingBox();
		await node("refund").click();
		await expect(node("refund")).toHaveAttribute("aria-selected", "true");
		const before = await node("refund").boundingBox();
		if (!before) throw new Error("Refund node has no visible box");
		expect(before?.x).toBeCloseTo(clickBefore?.x ?? NaN, 1);
		expect(before?.y).toBeCloseTo(clickBefore?.y ?? NaN, 1);
		const center = { x: before.x + before.width / 2, y: before.y + before.height / 2 };
		await page.mouse.move(center.x, center.y);
		await page.mouse.down();
		await page.mouse.move(center.x + 60, center.y + 40, { steps: 5 });
		await expect.poll(() => edgeErrors(root)).toEqual([]);
		const during = await node("refund").boundingBox();
		expect(during?.x).toBeCloseTo(before.x + 60, 0);
		expect(during?.y).toBeCloseTo(before.y + 40, 0);
		await page.mouse.up();
		await expect.poll(async () => (await node("refund").boundingBox())?.x).toBeCloseTo(before.x + 60, 0);
		await expect.poll(() => edgeErrors(root)).toEqual([]);
		await expect(node("refund")).toHaveAttribute("aria-selected", "true");

		await page.keyboard.press("Shift+ArrowRight");
		await expect.poll(async () => (await node("refund").boundingBox())?.x).toBeCloseTo(before.x + 60 + 13, 0);

		const cancelStart = await node("question").boundingBox();
		if (!cancelStart) throw new Error("Question node has no visible box");
		const cancelCenter = { x: cancelStart.x + cancelStart.width / 2, y: cancelStart.y + cancelStart.height / 2 };
		await page.mouse.move(cancelCenter.x, cancelCenter.y);
		await page.mouse.down();
		await page.mouse.move(cancelCenter.x + 45, cancelCenter.y + 25, { steps: 3 });
		await page.keyboard.press("Escape");
		await page.mouse.up();
		await expect(node("question")).toHaveAttribute("aria-selected", "true");
		await expect.poll(async () => (await node("question").boundingBox())?.x).toBeCloseTo(cancelStart.x, 0);
		await expect.poll(() => edgeErrors(root)).toEqual([]);

		await node("classify").click();
		await page.keyboard.down("Shift");
		await node("refund").click();
		await page.keyboard.up("Shift");
		const classifyBefore = await node("classify").boundingBox();
		const refundBefore = await node("refund").boundingBox();
		if (!classifyBefore || !refundBefore) throw new Error("Selected group has no visible boxes");
		const groupCenter = { x: refundBefore.x + refundBefore.width / 2, y: refundBefore.y + refundBefore.height / 2 };
		await page.mouse.move(groupCenter.x, groupCenter.y);
		await page.mouse.down();
		await page.mouse.move(groupCenter.x + 30, groupCenter.y + 20, { steps: 3 });
		await page.mouse.up();
		await expect.poll(async () => (await node("classify").boundingBox())?.x).toBeCloseTo(classifyBefore.x + 30, 0);
		await expect.poll(async () => (await node("refund").boundingBox())?.x).toBeCloseTo(refundBefore.x + 30, 0);
	});

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

for (const locale of ["en", "ar"] as const) {
	test(`Canvas moves focus by keyboard in ${locale}`, async ({ page }) => {
		const direction = locale === "ar" ? "rtl" : "ltr";
		await openPreview(page, { locale, direction, theme: "light" }, "/components/Canvas");
		const root = page.getByRole("region", { name: locale === "ar" ? "منشئ سير العمل" : "Workflow builder" });
		const world = root.locator(".ts-canvas__world");
		await expect.poll(() => edgeErrors(root)).toEqual([]);
		await root.scrollIntoViewIfNeeded();
		const node = (id: string) => root.locator(`[data-node-id="${id}"]`);
		const onward = direction === "rtl" ? "ArrowLeft" : "ArrowRight";
		const stops = () =>
			root
				.locator('[role="option"][tabindex="0"]')
				.evaluateAll((options) => options.map((option) => option.getAttribute("data-node-id")));
		const inCanvas = () =>
			root.evaluate(
				(element) =>
					Boolean(document.activeElement?.closest('[role="option"]')) && element.contains(document.activeElement),
			);
		expect(await stops()).toEqual(["start"]);
		await node("start").focus();
		await page.keyboard.press(onward);
		await expect(node("classify")).toBeFocused();
		await expect
			.poll(() => node("classify").evaluate((el) => getComputedStyle(el.querySelector(".ts-node")!).outlineStyle))
			.toBe("solid");
		await page.keyboard.press("Shift+Tab");
		expect(await inCanvas()).toBe(false);
		await page.keyboard.press("Tab");
		await expect(node("start")).toBeFocused();
		await page.keyboard.press(onward);
		await page.keyboard.press("Enter");
		await expect(node("classify")).toHaveAttribute("aria-selected", "true");
		await page.keyboard.press("End");
		await expect(node("note")).toBeFocused();
		await page.keyboard.press("Home");
		await expect(node("start")).toBeFocused();
		await page.keyboard.press("Tab");
		expect(await inCanvas()).toBe(false);
		await page.keyboard.press("Shift+Tab");
		await expect(node("classify")).toBeFocused();
		await page.keyboard.press("Escape");
		await expect(node("classify")).toHaveAttribute("aria-selected", "false");
		await node("refund").focus();
		await page.keyboard.press("ArrowDown");
		await expect(node("question")).toBeFocused();

		const place = () => world.evaluate((element) => element.style.transform);
		const home = await place();
		const surface = (await root.boundingBox())!;
		await page.mouse.move(surface.x + surface.width / 2, surface.y + surface.height - 40);
		await page.mouse.wheel(direction === "rtl" ? -900 : 900, 0);
		await expect.poll(place).not.toBe(home);
		await page.keyboard.press("ArrowDown");
		await expect(node("other")).toBeFocused();
		const revealed = (await node("other").boundingBox())!;
		expect(revealed.x).toBeGreaterThanOrEqual(surface.x);
		expect(revealed.x + revealed.width).toBeLessThanOrEqual(surface.x + surface.width);
		expect(await root.evaluate((element) => [element.scrollLeft, element.scrollTop])).toEqual([0, 0]);
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
