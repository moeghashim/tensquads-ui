import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

test("Chat docs show the surface in both locales and themes", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/components/Chat");
	await expect(page.getByRole("log")).toBeVisible();
	await expect(page.getByText("Help me plan the project")).toBeVisible();
	await expect(page.getByText("I will break the work into clear steps.")).toBeVisible();
	await expect(page.getByRole("button", { name: "New chat" })).toBeVisible();
	await expectAccessible(page);
	await page.setViewportSize({ width: 1440, height: 900 });
	const englishShot = await page.screenshot({ fullPage: true, animations: "disabled" });
	const output = join(process.cwd(), "test-results", "screenshots");
	await mkdir(output, { recursive: true });
	await writeFile(join(output, "chat-en-light-1440.png"), englishShot);
	await test.info().attach("chat-en-light-1440.png", { body: englishShot, contentType: "image/png" });

	await openPreview(page, { locale: "ar", direction: "rtl", theme: "dark" }, "/components/Chat");
	await expect(page.getByText("ساعدني في تخطيط المشروع")).toBeVisible();
	await expect(page.getByRole("button", { name: "إرسال" })).toBeVisible();
	await expectAccessible(page);
	await expectNoHorizontalScroll(page);
	await page.setViewportSize({ width: 390, height: 844 });
	const arabicShot = await page.screenshot({ fullPage: true, animations: "disabled" });
	await writeFile(join(output, "chat-ar-dark-390.png"), arabicShot);
	await test.info().attach("chat-ar-dark-390.png", { body: arabicShot, contentType: "image/png" });
});

test("Chat composer inserts a newline with Shift+Enter and sends with Enter", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/components/Chat");
	const input = page.getByRole("textbox", { name: "Message" });
	await input.fill("First line");
	await input.press("End");
	await input.press("Shift+Enter");
	await expect(input).toHaveValue("First line\n");
	await input.press("Enter");
	await expect(input).toHaveValue("");
});
