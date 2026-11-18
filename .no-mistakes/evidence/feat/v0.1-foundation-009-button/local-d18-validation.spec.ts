import { writeFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const evidence = "~/.no-mistakes/evidence/01M7PRG7NK22K1E5MT11WVRXH0";

test("D18 labels are exact for all 13 agents in the production Arabic gallery", async ({ page }) => {
  // Independent oracle: PLAN.md D18, including diacritics.
  const labels = ["في استراحة", "بانتظارك", "تخطيط", "قيد العمل", "قيد التحقق", "تم", "إعادة للتعديل", "معلّق", "بانتظار قرارك", "أُلغي"];
  const results = [];
  for (const theme of ["light", "dark"]) {
    await page.goto(`/components/Squadmate?locale=ar&dir=rtl&theme=${theme}`);
    const gallery = page.getByRole("region", { name: "الزملاء وحالاتهم" });
    await expect(gallery.getByRole("img")).toHaveCount(130);
    const rows = gallery.locator(".squadmate-gallery__agent");
    await expect(rows).toHaveCount(13);
    for (const row of await rows.all()) {
      const name = await row.locator("h2").innerText();
      await expect(row.locator("figcaption")).toHaveText(labels);
      const actual = await row.getByRole("img").evaluateAll(imgs => imgs.map(img => img.getAttribute("alt")));
      expect(actual).toEqual(labels.map(label => `${name}، ${label}`));
      results.push({ theme, name, labels, accessibleNames: actual });
    }
    await page.evaluate(() => document.fonts.ready);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({ path: `${evidence}/d18-arabic-${theme}-1440.png`, fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await page.screenshot({ path: `${evidence}/d18-arabic-${theme}-390.png`, fullPage: true });
  }
  writeFileSync(`${evidence}/d18-labels.json`, JSON.stringify(results, null, 2));
});

test("danger color follows theme tokens despite opposing OS preferences", async ({ page }) => {
  const results = [];
  for (const [theme, os] of [["light", "light"], ["dark", "light"], ["system", "dark"], ["light", "dark"], ["dark", "dark"], ["system", "light"]] as const) {
    await page.emulateMedia({ colorScheme: os });
    await page.goto(`/components/Button?locale=en&dir=ltr&theme=${theme}`);
    const buttons = page.locator(".ts-button--danger:not([data-disabled])");
    await expect(buttons).toHaveCount(5);
    for (const button of await buttons.all()) await expect(button).toHaveCSS("color", "rgb(255, 255, 255)");
    const computed = await buttons.first().evaluate(el => {
      const style = getComputedStyle(el);
      return {color: style.color, background: style.backgroundColor, property: style.getPropertyValue("--ts-button-danger-text").trim(), gray0: style.getPropertyValue("--ts-gray-0").trim(), gray1000: style.getPropertyValue("--ts-gray-1000").trim()};
    });
    const dark = theme === "dark" || (theme === "system" && os === "dark");
    expect(computed.property).toBe(dark ? computed.gray1000 : computed.gray0);
    results.push({ theme, os, ...computed });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${evidence}/danger-${theme}-os-${os}.png`, fullPage: true });
  }
  writeFileSync(`${evidence}/danger-colors.json`, JSON.stringify(results, null, 2));
});
