import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { expectThemeFocusRing, openPreview, type PreviewState } from "./helpers/preview";

const states: PreviewState[] = [
	{ locale: "en", direction: "ltr", theme: "light" },
	{ locale: "en", direction: "ltr", theme: "dark" },
	{ locale: "ar", direction: "rtl", theme: "light" },
	{ locale: "ar", direction: "rtl", theme: "dark" },
];

test("Dialog screenshots cover closed and open states in both directions and themes", async ({ page }) => {
	for (const state of states) {
		await openPreview(page, state, "/components/Dialog");
		const title = state.locale === "en" ? "Review request" : "مراجعة الطلب";
		const trigger = page.getByRole("button", { name: state.locale === "en" ? "Open dialog" : "فتح الحوار" });
		const fixtureTrigger = page
			.getByRole("region", { name: state.locale === "en" ? "OpenUI fixture" : "عينة OpenUI" })
			.getByRole("button", { name: state.locale === "en" ? "Review" : "مراجعة" });
		await expect(trigger).toBeVisible();
		await expect(fixtureTrigger).toBeVisible();
		await expect(page.getByRole("dialog")).toHaveCount(0);
		for (const width of [1440, 390]) {
			await page.setViewportSize({ width, height: 900 });
			await expect(page).toHaveScreenshot(`dialog-${state.locale}-${state.theme}-closed-${width}.png`, {
				animations: "disabled",
				fullPage: true,
				maxDiffPixelRatio: 0.001,
			});
		}
		await expectThemeFocusRing(page, state.theme);
		await trigger.click();
		const dialog = page.getByRole("dialog", { name: title });
		await expect(dialog).toBeVisible();
		await expect(dialog).not.toHaveAttribute("data-starting-style");
		await expect(dialog).toHaveCSS("opacity", "1");
		const axe = await new AxeBuilder({ page }).analyze();
		expect(axe.violations).toEqual([]);
		for (const width of [1440, 390]) {
			await page.setViewportSize({ width, height: 900 });
			const bounds = await dialog.boundingBox();
			expect(bounds).not.toBeNull();
			if (!bounds) throw new Error("Dialog has no visible bounds");
			expect(bounds.x).toBeGreaterThanOrEqual(0);
			expect(bounds.y).toBeGreaterThanOrEqual(0);
			expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
			expect(bounds.y + bounds.height).toBeLessThanOrEqual(900);
			await expect(page).toHaveScreenshot(`dialog-${state.locale}-${state.theme}-open-${width}.png`, {
				animations: "disabled",
				fullPage: true,
				maxDiffPixelRatio: 0.001,
			});
			const dimensions = await page.evaluate(() => ({
				viewport: document.documentElement.clientWidth,
				content: document.documentElement.scrollWidth,
			}));
			expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
		}
		await page.keyboard.press("Escape");
		await expect(page.getByRole("dialog")).toHaveCount(0);
	}
});

test("every Dialog example stays within the viewport", async ({ page }) => {
	for (const state of states) {
		await openPreview(page, state, "/components/Dialog");
		const labels =
			state.locale === "en"
				? ["Open dialog", "Edit project", "Delete project", "Review"]
				: ["فتح الحوار", "تعديل المشروع", "حذف المشروع", "مراجعة"];
		for (const width of [1440, 390]) {
			await page.setViewportSize({ width, height: 900 });
			for (const name of labels) {
				await page.getByRole("button", { name, exact: true }).click();
				const dialog = page.getByRole("dialog");
				await expect(dialog).toBeVisible();
				await expect(dialog).not.toHaveAttribute("data-starting-style");
				const bounds = await dialog.boundingBox();
				expect(bounds).not.toBeNull();
				if (!bounds) throw new Error("Dialog has no visible bounds");
				expect(bounds.x).toBeGreaterThanOrEqual(0);
				expect(bounds.y).toBeGreaterThanOrEqual(0);
				expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
				expect(bounds.y + bounds.height).toBeLessThanOrEqual(900);
				await page.keyboard.press("Escape");
				await expect(dialog).toHaveCount(0);
			}
		}
	}
});

test("Dialog traps Tab, opens from the keyboard, and returns focus after Escape", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/components/Dialog");
	const trigger = page.getByRole("button", { name: "Open dialog" });
	await trigger.focus();
	await page.keyboard.press("Enter");
	const dialog = page.getByRole("dialog", { name: "Review request" });
	await expect(dialog).toBeVisible();
	await expect(dialog).toContainText("Review their profile before adding them to the squad.");
	await expect
		.poll(() => page.evaluate(() => document.activeElement?.closest('[data-slot="dialog-content"]') !== null))
		.toBe(true);
	const controls = dialog.getByRole("button");
	await controls.last().focus();
	await page.keyboard.press("Tab");
	await expect(controls.first()).toBeFocused();
	await page.keyboard.press("Escape");
	await expect(dialog).toHaveCount(0);
	await expect(trigger).toBeFocused();
});
