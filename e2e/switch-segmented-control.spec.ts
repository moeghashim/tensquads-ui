import { expect, test } from "@playwright/test";
import {
	capturePreviewScreenshots,
	expectAccessible,
	expectNoHorizontalScroll,
	expectThemeFocusRing,
	openPreview,
	type PreviewState,
} from "./helpers/preview";

const states: PreviewState[] = [
	{ locale: "en", direction: "ltr", theme: "light" },
	{ locale: "en", direction: "ltr", theme: "dark" },
	{ locale: "ar", direction: "rtl", theme: "light" },
	{ locale: "ar", direction: "rtl", theme: "dark" },
];

test("Switch previews on, off, disabled, keyboard and focus states", async ({ page }, testInfo) => {
	for (const state of states) {
		await openPreview(page, state, "/components/Switch");
		const switches = page
			.getByRole("region", { name: state.locale === "ar" ? "حالات المفتاح" : "Switch states" })
			.getByRole("switch");
		await expect(switches).toHaveCount(3);
		const productUpdates = switches.nth(0);
		const notificationsOff = switches.nth(1);
		const disabledSwitch = switches.nth(2);
		await expect(productUpdates).toHaveAttribute("aria-checked", "true");
		await expect(notificationsOff).toHaveAttribute("aria-checked", "false");
		await expect(disabledSwitch).toHaveAttribute("aria-checked", "true");
		await expect(disabledSwitch).toBeDisabled();
		await capturePreviewScreenshots(page, testInfo, `switch-${state.locale}-${state.direction}-${state.theme}`);
		await notificationsOff.focus();
		await expect(notificationsOff).toBeFocused();
		await page.keyboard.press("Enter");
		await expect(notificationsOff).toHaveAttribute("aria-checked", "false");
		await page.keyboard.press("Space");
		await expect(notificationsOff).toHaveAttribute("aria-checked", "true");
		await expectNoHorizontalScroll(page);
		await expectAccessible(page);
		await switches.nth(0).focus();
		await expectThemeFocusRing(page, state.theme);
	}
});

test("SegmentedControl follows UI SDK arrow navigation in both directions", async ({ page }, testInfo) => {
	for (const state of states) {
		await openPreview(page, state, "/components/SegmentedControl");
		const section = page.getByRole("region", { name: state.locale === "ar" ? "أوضاع العرض" : "View modes" });
		const group = section.getByRole("radiogroup", { name: state.locale === "ar" ? "طريقة العرض" : "View" });
		const grid = group.getByRole("radio", { name: state.locale === "ar" ? "شبكة" : "Grid" });
		const list = group.getByRole("radio", { name: state.locale === "ar" ? "قائمة" : "List" });
		await expect(grid).toHaveAttribute("aria-checked", "true");
		await expect(list).toHaveAttribute("aria-checked", "false");
		await capturePreviewScreenshots(
			page,
			testInfo,
			`segmented-control-${state.locale}-${state.direction}-${state.theme}`,
		);
		await grid.focus();
		await page.keyboard.press(state.direction === "ltr" ? "ArrowLeft" : "ArrowRight");
		await expect(list).toHaveAttribute("aria-checked", "true");
		await expect(group).toBeVisible();
		await expectNoHorizontalScroll(page);
		await expectAccessible(page);
		await group.getByRole("radio", { name: state.locale === "ar" ? "شبكة" : "Grid" }).focus();
		await expectThemeFocusRing(page, state.theme);
	}
});

test("SegmentedControl Space selects and Enter submits its form", async ({ page }) => {
	for (const state of [states[0], states[2]]) {
		await openPreview(page, state, "/components/SegmentedControl");
		const section = page.getByRole("region", { name: state.locale === "ar" ? "أوضاع العرض" : "View modes" });
		const group = section.getByRole("radiogroup", { name: state.locale === "ar" ? "طريقة العرض" : "View" });
		const list = group.getByRole("radio", { name: state.locale === "ar" ? "قائمة" : "List" });
		await group.evaluate((element) => {
			const form = document.createElement("form");
			const submit = document.createElement("button");
			submit.type = "submit";
			submit.textContent = "Submit view";
			form.addEventListener("submit", (event) => {
				event.preventDefault();
				form.dataset.submissions = String(Number(form.dataset.submissions ?? 0) + 1);
			});
			element.before(form);
			form.append(element, submit);
		});
		await list.focus();
		await expect(list).toBeFocused();
		await page.keyboard.press("Space");
		await expect(list).toHaveAttribute("aria-checked", "true");
		await page.keyboard.press("Enter");
		await expect(group.locator("..")).toHaveAttribute("data-submissions", "1");
		await expect(list).toHaveAttribute("aria-checked", "true");
	}
});
