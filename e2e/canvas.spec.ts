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

	test(`Canvas connects nodes with the pointer in ${locale}`, async ({ page }) => {
		const direction = locale === "ar" ? "rtl" : "ltr";
		await openPreview(page, { locale, direction, theme: "light" }, "/components/Canvas");
		const root = page.getByRole("region", { name: locale === "ar" ? "منشئ سير العمل" : "Workflow builder" });
		const node = (id: string) => root.locator(`[data-node-id="${id}"]`);
		const output = (id: string, port = 0) => node(id).locator(`[data-port="out"][data-port-index="${port}"]`);
		const edgeCount = () => root.locator("[data-edge-from]").count();
		const draw = async (from: Locator, to: Locator, inspect = false) => {
			const a = await from.boundingBox();
			const b = await to.boundingBox();
			if (!a || !b) throw new Error("Connection endpoint has no visible box");
			const start = { x: a.x + a.width / 2, y: a.y + a.height / 2 };
			const end = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
			await page.mouse.move(start.x, start.y);
			await page.mouse.down();
			await page.mouse.move((start.x + end.x) / 2, (start.y + end.y) / 2, { steps: 3 });
			await page.mouse.move(end.x, end.y, { steps: 4 });
			if (inspect) {
				const path = root.locator(".ts-canvas__connection");
				await expect(path).toHaveAttribute("data-active", "true");
				const points = await path.evaluate((element) => {
					const svg = element as SVGPathElement;
					const matrix = svg.getScreenCTM();
					if (!matrix) throw new Error("Connection path has no screen transform");
					return [0, svg.getTotalLength()].map((length) => {
						const point = svg.getPointAtLength(length);
						const screen = new DOMPoint(point.x, point.y).matrixTransform(matrix);
						return { x: screen.x, y: screen.y };
					});
				});
				for (const [actual, locator] of [
					[points[0], from],
					[points[1], to.locator('[data-port="in"]')],
				] as const) {
					const box = await locator.boundingBox();
					if (!box || !actual) throw new Error("Connection port has no visible box");
					expect(
						Math.hypot(actual.x - box.x - box.width / 2, actual.y - box.y - box.height / 2),
					).toBeLessThanOrEqual(1);
				}
			}
			await page.mouse.up();
		};
		await root.scrollIntoViewIfNeeded();
		const before = await edgeCount();
		await draw(output("start"), node("other"), true);
		await expect.poll(edgeCount).toBe(before + 1);
		await expect.poll(() => edgeErrors(root)).toEqual([]);
		await draw(output("classify", 1), node("end"));
		await expect(
			root.locator('[data-edge-from="classify"][data-edge-to="end"][data-edge-from-port="1"]'),
		).toHaveCount(1);
		await expect.poll(() => edgeErrors(root)).toEqual([]);
		const connected = await edgeCount();
		const groundSource = await output("start").boundingBox();
		const canvasBox = await root.boundingBox();
		if (!groundSource || !canvasBox) throw new Error("Canvas has no visible ground area");
		await page.mouse.move(groundSource.x + groundSource.width / 2, groundSource.y + groundSource.height / 2);
		await page.mouse.down();
		await page.mouse.move(canvasBox.x + canvasBox.width - 16, canvasBox.y + canvasBox.height - 16, { steps: 4 });
		await page.mouse.up();
		await expect.poll(edgeCount).toBe(connected);
		await draw(output("start"), node("start"));
		await expect.poll(edgeCount).toBe(connected);
		await draw(output("start"), node("other"));
		await expect.poll(edgeCount).toBe(connected);

		const source = await output("start").boundingBox();
		const target = await node("question").boundingBox();
		if (!source || !target) throw new Error("Connection endpoint has no visible box");
		await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
		await page.mouse.down();
		await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 3 });
		await page.keyboard.press("Escape");
		await page.mouse.up();
		await expect.poll(edgeCount).toBe(connected);
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
			await expectAccessible(page);
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
	test(`Canvas deletes selected items and keeps focus in ${locale}`, async ({ page }) => {
		const direction = locale === "ar" ? "rtl" : "ltr";
		await openPreview(page, { locale, direction, theme: "light" }, "/components/Canvas");
		const root = page.getByRole("region", { name: locale === "ar" ? "منشئ سير العمل" : "Workflow builder" });
		const node = (id: string) => root.locator(`[data-node-id="${id}"]`);
		await root.scrollIntoViewIfNeeded();
		const hitPath = root.locator(".ts-canvas__edge-hit").first();
		const edgeId = await hitPath.evaluate((element) =>
			element.closest("[data-edge-id]")?.getAttribute("data-edge-id"),
		);
		const edge = root.locator(`[data-edge-id="${edgeId}"]`);
		const edges = root.locator("[data-edge-id]");
		const before = await edges.count();
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
		expect(await root.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe("none");
		// The press alone put focus in the canvas, so the key reaches it.
		await page.keyboard.press("Backspace");
		await expect(edge).toHaveCount(0);
		await expect(edges).toHaveCount(before - 1);

		await node("start").click();
		await page.keyboard.press("Delete");
		await expect(node("start")).toHaveCount(0);
		await expect(root.locator('[data-edge-from="start"], [data-edge-to="start"]')).toHaveCount(0);
		await expect(node("classify")).toBeFocused();
	});

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

test("Canvas localizes graph copy while preserving edits", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/components/Canvas");
	const root = page.locator(".canvas-preview .ts-canvas");
	const node = (id: string) => root.locator(`[data-node-id="${id}"]`);
	const relativeTop = () =>
		node("start").evaluate((element) => {
			const world = element.closest(".ts-canvas__world")!;
			return element.getBoundingClientRect().top - world.getBoundingClientRect().top;
		});
	await node("start").focus();
	await page.keyboard.press("Enter");
	const before = await relativeTop();
	await page.keyboard.press("Shift+ArrowDown");
	await expect.poll(relativeTop).toBeCloseTo(before + 13, 0);

	for (const locale of ["ar", "en"] as const) {
		const ar = locale === "ar";
		await page.getByRole("radio", { name: ar ? "العربية" : "English", exact: true }).click();
		await expect(root).toHaveAttribute("dir", ar ? "rtl" : "ltr");
		for (const [id, title] of Object.entries(
			ar
				? {
						start: "البداية",
						classify: "تصنيف الطلب",
						refund: "وكيل الاسترداد",
						question: "وكيل الدعم",
						other: "وكيل الطلبات",
						approval: "موافقة المستخدم",
						end: "النهاية",
						note: "ملاحظة",
					}
				: {
						start: "Start",
						classify: "Classify request",
						refund: "Refund agent",
						question: "Support agent",
						other: "Orders agent",
						approval: "User approval",
						end: "End",
						note: "Note",
					},
		)) {
			await expect(node(id).getByText(title, { exact: true })).toBeVisible();
		}
		await expect(node("classify").getByText(ar ? "ثلاثة مسارات" : "Three paths", { exact: true })).toBeVisible();
		for (const id of ["refund", "question", "other"]) {
			await expect(node(id).getByText(ar ? "وكيل" : "Agent", { exact: true })).toBeVisible();
		}
		await expect(node("approval").getByText(ar ? "قبل الاسترداد" : "Before refund", { exact: true })).toBeVisible();
		for (const branch of ar ? ["استرداد", "استفسار", "أخرى"] : ["Refund", "Question", "Other"]) {
			await expect(node("classify").getByText(branch, { exact: true })).toBeVisible();
		}
		await expect(node("classify")).toHaveAttribute(
			"aria-description",
			ar
				? "يتصل بـ: وكيل الاسترداد، وكيل الدعم، وكيل الطلبات"
				: "Connects to Refund agent, Support agent, Orders agent",
		);
		await expect(node("start")).toHaveAttribute("aria-selected", "true");
		await expect.poll(relativeTop).toBeCloseTo(before + 13, 0);
	}

	await node("note").focus();
	await page.keyboard.press("Enter");
	await page.keyboard.press("Delete");
	await expect(node("note")).toHaveCount(0);
	await page.getByRole("radio", { name: "العربية", exact: true }).click();
	await expect(root).toHaveAttribute("dir", "rtl");
	await expect(node("note")).toHaveCount(0);
	await expect.poll(relativeTop).toBeCloseTo(before + 13, 0);
});
