import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { capturePreviewScreenshots, expectThemeFocusRing, openPreview, type PreviewState } from "./helpers/preview";

const states: PreviewState[] = [
	{ locale: "en", direction: "ltr", theme: "light" },
	{ locale: "en", direction: "ltr", theme: "dark" },
	{ locale: "ar", direction: "rtl", theme: "light" },
	{ locale: "ar", direction: "rtl", theme: "dark" },
];

for (const state of states) {
	test(`Dialog screenshots cover closed and open states in ${state.locale} ${state.theme}`, async ({ page }, testInfo) => {
		await openPreview(page, state, "/components/Dialog");
		const copy =
			state.locale === "en"
				? {
						simpleTrigger: "Open dialog",
						simpleTitle: "Review request",
						formTrigger: "Edit project",
						formTitle: "Edit project",
						field: "Project name",
						deleteTrigger: "Delete project",
						deleteTitle: "Delete project?",
					}
				: {
						simpleTrigger: "فتح الحوار",
						simpleTitle: "مراجعة الطلب",
						formTrigger: "تعديل المشروع",
						formTitle: "تعديل المشروع",
						field: "اسم المشروع",
						deleteTrigger: "حذف المشروع",
						deleteTitle: "حذف المشروع؟",
					};
		const examples = [
			{ id: "simple", trigger: copy.simpleTrigger, title: copy.simpleTitle },
			{ id: "form", trigger: copy.formTrigger, title: copy.formTitle },
			{ id: "destructive", trigger: copy.deleteTrigger, title: copy.deleteTitle },
		];
		const trigger = page.getByRole("button", { name: copy.simpleTrigger });
		const fixtureTrigger = page
			.getByRole("region", { name: state.locale === "en" ? "OpenUI fixture" : "عينة OpenUI" })
			.getByRole("button", { name: state.locale === "en" ? "Review" : "مراجعة" });
		await expect(trigger).toBeVisible();
		await expect(fixtureTrigger).toBeVisible();
		await expect(page.getByRole("dialog")).toHaveCount(0);
		await capturePreviewScreenshots(page, testInfo, `dialog-${state.locale}-${state.theme}-closed`);
		await expectThemeFocusRing(page, state.theme);
		for (const example of examples) {
			for (const width of [1440, 390]) {
				await page.setViewportSize({ width, height: 900 });
				await page.getByRole("button", { name: example.trigger, exact: true }).click();
				const dialog = page.getByRole("dialog", { name: example.title, exact: true });
				await expect(dialog).toBeVisible();
				await expect(dialog).toHaveAttribute("data-open");
				await expect(dialog).not.toHaveAttribute("data-starting-style");
				await page.evaluate(() => document.fonts.ready);
				await expect(dialog).toHaveCSS("opacity", "1");
				if (example.id === "form") {
					await expect(dialog.getByRole("textbox", { name: copy.field })).toBeVisible();
				}
				const axe = await new AxeBuilder({ page }).analyze();
				expect(axe.violations).toEqual([]);
				const bounds = await dialog.boundingBox();
				expect(bounds).not.toBeNull();
				if (!bounds) throw new Error("Dialog has no visible bounds");
				expect(bounds.x).toBeGreaterThanOrEqual(0);
				expect(bounds.y).toBeGreaterThanOrEqual(0);
				expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
				expect(bounds.y + bounds.height).toBeLessThanOrEqual(900);
				await capturePreviewScreenshots(
					page,
					testInfo,
					`dialog-${state.locale}-${state.theme}-${example.id}-open`,
					[width],
				);
				const dimensions = await page.evaluate(() => ({
					viewport: document.documentElement.clientWidth,
					content: document.documentElement.scrollWidth,
				}));
				expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
				await page.keyboard.press("Escape");
				await expect(dialog).toHaveCount(0);
			}
		}
	});
}

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
