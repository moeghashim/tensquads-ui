import { expect, test } from "@playwright/test";
import { openPreview } from "./helpers/preview";

test("ThemeToggle keeps the preview theme URL-driven", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/components/ThemeToggle");
	const toggle = page.getByRole("button", { name: "Switch to dark theme" });
	await expect(toggle).toBeVisible();
	expect(await toggle.boundingBox()).toMatchObject({ width: 36, height: 36 });
	await toggle.click();
	await expect(page).toHaveURL(/theme=dark/);
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
});
