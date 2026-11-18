import { expect, test } from "@playwright/test";
import { getRegisteredComponents } from "../packages/ui/src/openui";
import { expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

const registryOrder = [...getRegisteredComponents().map(({ name }) => name), "Chat"].sort();

test("component docs load in English and Arabic with localized fixtures", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/components");
	const names = await page.locator(".component-card__link strong").allTextContents();
	expect(names.length).toBeGreaterThan(0);

	for (const locale of ["en", "ar"] as const) {
		const direction = locale === "ar" ? "rtl" : "ltr";
		for (const name of names) {
			await openPreview(page, { locale, direction, theme: "light" }, `/components/${name}`);
			await expect(page.locator(".component-doc-page__header h1")).toHaveText(name);
			const docs = page.locator(".markdown-document");
			await expect(docs.getByRole("heading", { name: locale === "ar" ? "الوصف" : "Description" })).toBeVisible();
			await expect(docs.getByRole("heading", { name: locale === "ar" ? "الخصائص" : "Props" })).toBeVisible();
			// Usage shows only when the component doc has code samples.
			const usage = docs.getByRole("heading", { name: locale === "ar" ? "الاستخدام" : "Usage" });
			if (["Field", "Input"].includes(name)) await expect(usage).toBeVisible();
			else await expect(usage).toHaveCount(0);
			// English doc text stays left-to-right on Arabic pages.
			await expect(docs.locator("p[lang='en'][dir='ltr']").first()).toBeVisible();
			await expect(
				page.getByRole("heading", { name: locale === "ar" ? "أمثلة تفاعلية" : "Live examples" }),
			).toBeVisible();
			if (name === "Chat") await expect(page.locator(".chat-preview")).toBeVisible();
			else await expect(page.locator(".component-list").first()).toBeVisible();
			if (name === "Chat") {
				await expect(page.getByText(/hosts replies and inline OpenUI content/)).toBeVisible();
			} else {
				await expect(page.locator(".fixture-source summary")).toHaveText(
					locale === "ar" ? "عرض مصدر العينة" : "Show fixture source",
				);
			}
			const index = registryOrder.indexOf(name);
			const previous = page.locator('.component-doc-nav [rel="prev"]');
			const next = page.locator('.component-doc-nav [rel="next"]');
			if (index > 0) {
				await expect(previous).toContainText(registryOrder[index - 1] ?? "");
				await expect(previous).toContainText(locale === "ar" ? "السابق" : "Previous");
			} else {
				await expect(previous).toHaveCount(0);
			}
			if (index < registryOrder.length - 1) {
				await expect(next).toContainText(registryOrder[index + 1] ?? "");
				await expect(next).toContainText(locale === "ar" ? "التالي" : "Next");
			} else {
				await expect(next).toHaveCount(0);
			}
			await expectAccessible(page);
			await expectNoHorizontalScroll(page);
		}
	}
});

test("component code examples copy and show confirmation", async ({ page }) => {
	await openPreview(page, { locale: "ar", direction: "rtl", theme: "dark" }, "/components/Dialog");
	await page.evaluate(() => {
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: { writeText: async (text: string) => sessionStorage.setItem("copied-code", text) },
		});
	});
	const code = page.locator(".dialog-preview__item .copyable-code").first();
	const content = await code.locator("pre code").textContent();
	const button = code.getByRole("button", { name: "نسخ" });
	await button.click();
	await expect(button).toHaveText("تم النسخ");
	await expect(code.getByRole("status")).toHaveText("تم النسخ");
	expect(await page.evaluate(() => sessionStorage.getItem("copied-code"))).toBe(content);
});

test("copied confirmation is also the accessible button name", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/components/Button");
	await page.evaluate(() => {
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: { writeText: async () => undefined },
		});
	});
	const code = page.locator(".button-preview__row .copyable-code").first();
	const button = code.getByRole("button");
	await button.click();
	await expect(button).toHaveText("Copied");
	await expect(button).toHaveAccessibleName("Copied");
	await expect(code.getByRole("status")).toHaveText("Copied");
});
