import { expect, test } from "@playwright/test";
import { openPreview } from "./helpers/preview";

for (const locale of ["en", "ar"] as const) {
	for (const theme of ["light", "dark"] as const) {
		test(`Send arrow points up in ${locale}/${theme}`, async ({ page }) => {
			const direction = locale === "ar" ? "rtl" : "ltr";
			await openPreview(page, { locale, direction, theme }, "/components/Chat");
			const input = page.getByRole("textbox", { name: locale === "ar" ? "رسالة" : "Message" });
			const send = page.getByRole("button", { name: locale === "ar" ? "إرسال" : "Send", exact: true });
			const form = input.locator("xpath=ancestor::form");
			// The send arrow points up in both directions, so it is never mirrored.
			const orientation = () =>
				send.locator("svg").evaluate((svg: SVGSVGElement) => {
					const matrix = svg.getScreenCTM()!;
					return { horizontal: Math.sign(matrix.a), vertical: Math.sign(matrix.d) };
				});

			for (const width of [1440, 390]) {
				await page.setViewportSize({ width, height: 900 });
				for (const dir of [direction, direction === "rtl" ? "ltr" : "rtl", direction]) {
					await form.evaluate((node, value) => node.setAttribute("dir", value), dir);
					const expected = { horizontal: 1, vertical: 1 };
					await input.fill("   ");
					await expect(send).toBeDisabled();
					await expect.poll(orientation).toEqual(expected);
					await input.fill("Check send direction");
					await expect(send).toBeEnabled();
					await expect.poll(orientation).toEqual(expected);
					await send.click();
					await expect(input).toHaveValue("");
					await input.fill("First line");
					await input.press("End");
					await input.press("Shift+Enter");
					await expect(input).toHaveValue("First line\n");
					await input.press("Enter");
					await expect(input).toHaveValue("");
				}
			}
		});
	}
}
