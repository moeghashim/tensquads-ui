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

test("getting started covers agent setup in both locales, directions, and themes", async ({ page }, testInfo) => {
	for (const state of states) {
		await openPreview(page, state, "/get-started");
		await expect(page.getByRole("heading", { level: 1 })).toHaveText(
			state.locale === "ar" ? "عقد الواجهة لوكلاء البرمجة" : "Give your agent the UI contract",
		);
		await expect(
			page.getByRole("heading", {
				name: state.locale === "ar" ? "تثبيت مهارات الوكيل" : "Install the agent skills",
			}),
		).toBeVisible();
		await expect(
			page.getByRole("link", {
				name: state.locale === "ar" ? /فهرس المكوّنات في llms.txt/ : /component index in llms.txt/,
			}),
		).toHaveAttribute("href", "https://github.com/moeghashim/tensquads-ui/blob/main/llms.txt");
		await expect(page.locator(".get-started-code pre[dir='ltr']")).toHaveCount(5);
		await expect(page.locator(".get-started-code code").first()).toContainText("tensquads-ui#<commit-sha>");
		await expect(page.locator(".get-started-code code").nth(2)).toContainText("vercel-labs/ui --skill ui-sdk");
		await expect(page.locator(".get-started-code code").last()).toContainText(
			"createAnthropicProvider(env.ANTHROPIC_API_KEY)",
		);
		await capturePreviewScreenshots(page, testInfo, `get-started-${state.locale}-${state.direction}-${state.theme}`);
		await expectNoHorizontalScroll(page);
		await expectAccessible(page);
		await expectThemeFocusRing(page, state.theme);
	}
});

test("getting started code blocks copy their content", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/get-started");
	await page.evaluate(() => {
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: { writeText: async (text: string) => sessionStorage.setItem("copied-code", text) },
		});
	});
	const codeBlock = page.locator(".get-started-code").first();
	await codeBlock.getByRole("button", { name: "Copy" }).click();
	await expect(codeBlock.getByRole("status")).toHaveText("Copied");
	expect(await page.evaluate(() => sessionStorage.getItem("copied-code"))).toContain(
		"github:moeghashim/tensquads-ui#",
	);
});
