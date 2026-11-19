const evidence = '~/.no-mistakes/evidence/01M7T96F3830VNXDNHBGZKXXNX';
import { expect, test } from "@playwright/test";
import { expectAccessible, expectNoHorizontalScroll, openPreview } from "../e2e/helpers/preview";

for (const locale of ["en", "ar"] as const) {
	for (const theme of ["light", "dark"] as const) {
		for (const name of ["DataTable", "EmptyState"] as const) {
			test(`${name} renders and stays contained in ${locale} ${theme}`, async ({ page }, testInfo) => {
				const direction = locale === "ar" ? "rtl" : "ltr";
				await openPreview(page, { locale, direction, theme }, `/components/${name}`);
				await expectAccessible(page);
				for (const width of [1440,390]) {
 await page.setViewportSize({width,height:1000});
 await page.screenshot({path: `${evidence}/${name}-${locale}-${theme}-${width}.png`,fullPage:true});
}
await page.setViewportSize({width:1440,height:1000});
				const ar = locale === "ar";
				const card = page.locator(".dashboard-component-preview > [data-slot=card]");
				const search = card.getByRole("textbox", { name: ar ? "البحث عن الشركات" : "Search companies" });
				const clear = card.getByRole("button", { name: ar ? "مسح البحث" : "Clear search" });
				const count = card.getByRole("heading", { level: 2 });
				const group = card.getByRole("radiogroup", { name: ar ? "حالة الشركة" : "Company status" });
				const all = group.getByRole("radio", { name: ar ? "الكل" : "All", exact: true });
				if (name === "EmptyState") {
					await expect(count).toHaveText(ar ? /^كل الشركات \([0٠] من [2٢]\)$/ : "All companies (0 of 2)");
					await expect(card.getByRole("table")).toHaveCount(0);
					await clear.click();
					await expect(search).toHaveValue("");
				}
				const acme = card.getByRole("row", { name: /Acme Studio/ });
				const northstar = card.getByRole("row", { name: /Northstar/ });
				await expect(acme).toHaveAttribute("aria-selected", "true");
				await expect(northstar).toHaveAttribute("aria-selected", "false");
				await northstar.click();
				await expect(northstar).toHaveAttribute("aria-selected", "true");
				await expect(acme).toHaveAttribute("aria-selected", "false");
				await acme.focus();
				await page.keyboard.press("Space");
				await expect(acme).toBeFocused();
				await expect(acme).toHaveAttribute("aria-selected", "true");
				await expect(northstar).toHaveAttribute("aria-selected", "false");
				await northstar.focus();
				await page.keyboard.press("Enter");
				await expect(northstar).toHaveAttribute("aria-selected", "true");
				await expect(acme).toHaveAttribute("aria-selected", "false");
				await expect(acme.getByText(ar ? "يُدفع شهرياً" : "Billed monthly")).toHaveAttribute(
					"title",
					ar ? "يُدفع شهرياً" : "Billed monthly",
				);
				await expect(acme.getByText("maya@example.com")).toHaveAttribute("title", "maya@example.com");
				await expect(acme.getByText(/Reach/)).toHaveAttribute(
					"title",
					"DS / Demo store / Reach $1M in annual sales",
				);
				await search.fill("  NORTH  ");
				await expect(acme).toHaveCount(0);
				await expect(northstar).toBeVisible();
				await expect(count).toHaveText(ar ? /^كل الشركات \([1١] من [2٢]\)$/ : "All companies (1 of 2)");
				const active = group.getByRole("radio", { name: ar ? "نشطة" : "Active", exact: true });
				await active.click();
				await expect(active).toHaveAttribute("aria-checked", "true");
				await expect(card.getByRole("table")).toHaveCount(0);
				await expect(
					card.getByRole("heading", { name: ar ? "لا تطابق أي شركة البحث" : "No companies match" }),
				).toBeVisible();
				await clear.click();
				await expect(search).toHaveValue("");
				await expect(all).toHaveAttribute("aria-checked", "true");
				for (const [label, expected] of [
					[ar ? "نشطة" : "Active", /Acme Studio/],
					[ar ? "تجربة" : "Trial", /Northstar/],
				] as const) {
					await group.getByRole("radio", { name: label, exact: true }).click();
					await expect(card.getByRole("row")).toHaveCount(2);
					await expect(card.getByRole("row", { name: expected })).toBeVisible();
					await expect(count).toHaveText(ar ? /^كل الشركات \([1١] من [2٢]\)$/ : "All companies (1 of 2)");
				}
				await group.getByRole("radio", { name: ar ? "متوقفة" : "Paused", exact: true }).click();
				await expect(count).toHaveText(ar ? /^كل الشركات \([0٠] من [2٢]\)$/ : "All companies (0 of 2)");
				await clear.click();
				await search.fill("No such company");
				await expect(card.getByRole("table")).toHaveCount(0);
				await expect(count).toHaveText(ar ? /^كل الشركات \([0٠] من [2٢]\)$/ : "All companies (0 of 2)");
				await clear.click();
				await expect(search).toHaveValue("");
				await expect(card.getByRole("row")).toHaveCount(3);
				await expect(count).toHaveText(ar ? /^كل الشركات \([2٢] من [2٢]\)$/ : "All companies (2 of 2)");
				await expectNoHorizontalScroll(page);
			});
		}
	}
}
