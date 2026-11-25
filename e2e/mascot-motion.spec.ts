import { expect, type Locator, test } from "@playwright/test";
import {
	capturePreviewScreenshots,
	expectAccessible,
	expectNoHorizontalScroll,
	openPreview,
	type PreviewState,
} from "./helpers/preview";

const path = "/foundations/mascots/motion";
const states: PreviewState[] = [
	{ locale: "en", direction: "ltr", theme: "light" },
	{ locale: "en", direction: "ltr", theme: "dark" },
	{ locale: "ar", direction: "rtl", theme: "light" },
	{ locale: "ar", direction: "rtl", theme: "dark" },
];

function runningAnimations(locator: Locator) {
	return locator.evaluate(
		(element) =>
			element.getAnimations({ subtree: true }).filter((animation) => animation.playState === "running").length,
	);
}

for (const state of states) {
	test(`mascot motion in ${state.locale} ${state.theme}`, async ({ page }, testInfo) => {
		await openPreview(page, state, "/foundations/mascots");
		await page.getByRole("link", { name: state.locale === "ar" ? "حركة الشخصيات" : "Mascot motion" }).click();
		await expect(page).toHaveURL(
			new RegExp(`${path}\\?locale=${state.locale}&dir=${state.direction}&theme=${state.theme}$`),
		);

		const gallery = page.locator(".mascot-motion__states");
		const mascots = gallery.locator("[data-animated]");
		await expect(mascots).toHaveCount(10);
		expect(
			await mascots.evaluateAll((elements) => elements.map((element) => element.getAttribute("data-state"))),
		).toEqual([
			"idle",
			"waiting",
			"planning",
			"running",
			"checking",
			"done",
			"sentback",
			"blocked",
			"escalated",
			"dropped",
		]);

		const running = gallery.locator('[data-state="running"]');
		await running.scrollIntoViewIfNeeded();
		await expect.poll(() => runningAnimations(running)).toBeGreaterThan(0);
		await expect(running.locator(".sm-raised").first()).toHaveCSS("animation-name", "ts-sm-raised-wave");

		const waitingFace = gallery.locator('[data-state="waiting"] .sm-face');
		const glance = await waitingFace.evaluate((face) => {
			const animation = face.getAnimations()[0];
			animation.pause();
			animation.currentTime = 3000;
			return new DOMMatrixReadOnly(getComputedStyle(face).transform).m41;
		});
		expect(glance).toBe(state.direction === "rtl" ? 7 : -7);

		const small = page.locator('.mascot-motion__sizes [data-state="escalated"][data-size="24"]');
		await small.scrollIntoViewIfNeeded();
		await expect(small.locator(".sm-all")).toHaveCSS("animation-name", "none");
		await expect(small.locator(".sm-arm-l").first()).toHaveCSS("animation-name", "none");
		await expect.poll(() => runningAnimations(small)).toBe(1);

		await page.emulateMedia({ reducedMotion: "reduce" });
		await expect
			.poll(() =>
				page.locator(".mascot-motion").evaluate((element) => element.getAnimations({ subtree: true }).length),
			)
			.toBe(0);
		await expect(running.locator(".sm-raised").first()).toHaveCSS("animation-name", "none");

		await page.evaluate(() => window.scrollTo(0, 0));
		await capturePreviewScreenshots(
			page,
			testInfo,
			`mascot-motion-${state.locale}-${state.direction}-${state.theme}`,
		);
		await expectNoHorizontalScroll(page);
		await expectAccessible(page);
	});
}

test("the motion controls pause, replay one-shots, and reduce motion", async ({ page }) => {
	await openPreview(page, states[0], path);
	const gallery = page.locator(".mascot-motion__states");
	const done = gallery.locator('[data-state="done"]');
	const running = gallery.locator('[data-state="running"]');
	const gradient = (mascot: Locator) => mascot.locator("radialGradient").first().getAttribute("id");
	const doneId = await gradient(done);
	const runningId = await gradient(running);
	await page.getByRole("button", { name: "Replay one-shots" }).click();
	await expect.poll(() => gradient(done)).not.toBe(doneId);
	await expect.poll(() => gradient(running)).toBe(runningId);

	const pause = page.getByRole("button", { name: "Pause", exact: true });
	await pause.click();
	await expect(pause).toHaveAttribute("aria-pressed", "true");
	await running.scrollIntoViewIfNeeded();
	await expect(running.locator(".sm-all")).toHaveCSS("animation-play-state", "paused");
	await pause.click();
	await running.scrollIntoViewIfNeeded();
	await expect.poll(() => runningAnimations(running)).toBeGreaterThan(0);

	const reduce = page.getByRole("button", { name: "Reduce motion" });
	await reduce.click();
	await expect(reduce).toHaveAttribute("aria-pressed", "true");
	await expect(running.locator(".sm-raised").first()).toHaveCSS("animation-name", "none");
});

test("Pisa moves from Waiting to Planning after the state fades in", async ({ page }) => {
	await openPreview(page, states[0], path);
	const flow = page.locator(".mascot-motion__flow");
	await flow.scrollIntoViewIfNeeded();
	await expect(flow.getByRole("img", { name: "Pisa, Waiting" })).toBeVisible();
	const planning = flow.getByRole("img", { name: "Pisa, Planning" });
	await expect(planning).toBeVisible();
	await expect(flow.locator('[aria-current="step"]')).toHaveText("Planning");
	await expect.poll(() => runningAnimations(planning)).toBeGreaterThan(0);
});
