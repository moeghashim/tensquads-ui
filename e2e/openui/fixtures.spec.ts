import { readFileSync } from "node:fs";
import { createParser } from "@openuidev/lang-core";
import { expect, test } from "@playwright/test";
import { createTensquadsLibrary, getRegisteredComponents } from "../../packages/ui/src/openui";

test("every component fixture parses and renders", async ({ page }) => {
	for (const locale of ["en", "ar"] as const) {
		for (const component of getRegisteredComponents()) {
			const fixture = readFileSync(
				`packages/ui/src/react/${component.name}/${component.name}.fixture.${locale}.txt`,
				"utf8",
			);
			const parsed = createParser(createTensquadsLibrary(locale).toJSONSchema()).parse(fixture);
			expect(parsed?.root).toBeTruthy();
			expect(parsed?.meta.errors).toEqual([]);
			await page.goto(
				`/components/${component.name}?locale=${locale}&dir=${locale === "ar" ? "rtl" : "ltr"}&theme=light`,
			);
			await expect(page.getByRole("heading", { name: component.name })).toBeVisible();
			const fixtureRegion = page.getByRole("region", {
				name: locale === "en" ? "OpenUI fixture" : "عينة OpenUI",
			});
			if (component.name === "Button") {
				await expect(
					fixtureRegion.getByRole("button", { name: locale === "en" ? "Continue" : "متابعة" }),
				).toBeVisible();
			} else if (component.name === "Badge") {
				const badge = fixtureRegion.getByText(locale === "en" ? "Ready" : "جاهز", { exact: true });
				await expect(badge).toBeVisible();
				await expect(badge).toHaveJSProperty("tagName", "SPAN");
			} else {
				const image = fixtureRegion.getByRole("img", {
					name: locale === "en" ? "Petra, Planning" : "بترا، تخطيط",
				});
				await expect(image).toBeVisible();
				await expect(image).toHaveCSS("width", "64px");
				await expect(image).toHaveCSS("height", "64px");
			}
		}
	}
});
