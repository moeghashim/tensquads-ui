import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

for (const locale of ["en", "ar"] as const) {
	for (const theme of ["light", "dark"] as const) {
		for (const name of ["DataTable", "EmptyState"] as const) {
			test(`${name} renders and stays contained in ${locale} ${theme}`, async ({ page }) => {
				const direction = locale === "ar" ? "rtl" : "ltr";
				await openPreview(page, { locale, direction, theme }, `/components/${name}`);
				await expectAccessible(page);
				for (const width of [1440, 390]) {
					await page.setViewportSize({ width, height: 900 });
					const directory = join(process.cwd(), ".review", "003");
					await mkdir(directory, { recursive: true });
					await writeFile(
						join(directory, `${name}-${locale}-${direction}-${theme}-${width}.png`),
						await page.screenshot({ fullPage: true, animations: "disabled" }),
					);
				}
				if (name === "DataTable") {
					const row = page.getByRole("row", { name: /Acme Studio/ });
					await row.click();
					await expect(row).toHaveAttribute("aria-selected", "true");
					await row.focus();
					await page.keyboard.press("Space");
					await expect(row).toBeFocused();
				}
				await expectNoHorizontalScroll(page);
			});
		}
	}
}
