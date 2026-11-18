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
			await expect(page.getByRole("heading", { name: component.name, level: 1, exact: true })).toBeVisible();
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
			} else if (component.name === "Chip") {
				const chip = fixtureRegion.getByRole("link", { name: "response_schema" });
				await expect(chip).toBeVisible();
				await expect(chip.locator(".ts-chip__icon")).toHaveText("◇");
				await expect(chip).toHaveAttribute("href", "#response_schema");
			} else if (component.name === "Menu") {
				const trigger = fixtureRegion.getByRole("button", { name: locale === "en" ? "Actions" : "الإجراءات" });
				await expect(trigger).toBeVisible();
				await trigger.press("Enter");
				await expect(
					fixtureRegion.getByRole("menuitem", { name: locale === "en" ? "Open project" : "فتح المشروع" }),
				).toBeVisible();
			} else if (component.name === "Tooltip") {
				const trigger = fixtureRegion.getByRole("button", { name: locale === "en" ? "Add item" : "إضافة عنصر" });
				await expect(trigger).toBeVisible();
				await expect(trigger).toHaveAttribute("aria-describedby", /.+/);
			} else if (component.name === "Squadmate") {
				const image = fixtureRegion.getByRole("img", {
					name: locale === "en" ? "Petra, Planning" : "بترا، تخطيط",
				});
				await expect(image).toBeVisible();
				await expect(image).toHaveCSS("width", "64px");
				await expect(image).toHaveCSS("height", "64px");
			} else if (component.name === "Dialog") {
				const trigger = locale === "en" ? "Review" : "مراجعة";
				await expect(fixtureRegion.getByRole("button", { name: trigger })).toBeVisible();
				await fixtureRegion.getByRole("button", { name: trigger }).click();
				const dialog = page.getByRole("dialog", {
					name: locale === "en" ? "Review request" : "مراجعة الطلب",
				});
				await expect(dialog).toBeVisible();
				await expect(dialog).not.toHaveAttribute("data-starting-style");
				await expect(dialog).toHaveCSS("opacity", "1");
				const action = dialog.getByRole("button", { name: locale === "en" ? "Add member" : "إضافة العضو" });
				await action.focus();
				await page.keyboard.press("Enter");
				await expect(dialog).toHaveCount(0);
				await expect(fixtureRegion.getByRole("button", { name: trigger })).toBeFocused();
			} else if (component.name === "Switch") {
				await expect(
					fixtureRegion.getByRole("switch", { name: locale === "en" ? "Product updates" : "تحديثات المنتج" }),
				).toBeVisible();
			} else if (component.name === "SegmentedControl") {
				await expect(
					fixtureRegion.getByRole("radiogroup", { name: locale === "en" ? "View" : "العرض" }),
				).toBeVisible();
			} else {
				const label =
					component.name === "Input"
						? locale === "en"
							? "Search projects"
							: "ابحث عن المشاريع"
						: locale === "en"
							? "Project name"
							: "اسم المشروع";
				await expect(fixtureRegion.getByRole("textbox", { name: label })).toBeVisible();
			}
		}
	}
});

test("home demo fixture lines parse in both locales", () => {
	for (const locale of ["en", "ar"] as const) {
		const fixture = readFileSync(`apps/preview/src/fixtures/home-demo.fixture.${locale}.txt`, "utf8");
		for (const line of fixture.trim().split("\n")) {
			const parsed = createParser(createTensquadsLibrary(locale).toJSONSchema()).parse(line);
			expect(parsed.root).toBeTruthy();
			expect(parsed.meta.errors).toEqual([]);
		}
	}
});
