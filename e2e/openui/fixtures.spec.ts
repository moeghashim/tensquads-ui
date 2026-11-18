import { readFileSync } from "node:fs";
import { createParser } from "@openuidev/lang-core";
import { expect, test } from "@playwright/test";
import { createTensquadsLibrary } from "../../packages/ui/src/openui";

test("component preview renders its locale fixture", async ({ page }) => {
	for (const locale of ["en", "ar"] as const) {
		const fixture = readFileSync(`packages/ui/src/react/Example/Example.fixture.${locale}.txt`, "utf8");
		const parsed = createParser(createTensquadsLibrary(locale).toJSONSchema()).parse(fixture);
		expect(parsed?.root).toBeTruthy();
		expect(parsed?.meta.errors).toEqual([]);
		await page.goto(`/components/Example?locale=${locale}&dir=${locale === "ar" ? "rtl" : "ltr"}&theme=light`);
		await expect(page.getByRole("heading", { name: "Example" })).toBeVisible();
		await expect(
			page.getByText(locale === "en" ? "OpenUI fixture rendered in English" : "تم عرض عينة OpenUI باللغة العربية", {
				exact: true,
			}),
		).toBeVisible();
	}
});
