import { expect, test } from "@playwright/test";

test("disabled Chip resists pointer and keyboard; long identifier wraps; gallery opens Chip", async ({ page }, testInfo) => {
  const observations = [];
  for (const locale of ["en", "ar"]) {
    for (const theme of ["light", "dark"]) {
      const dir = locale === "ar" ? "rtl" : "ltr";
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/?locale=${locale}&dir=${dir}&theme=${theme}`);
      await page.getByRole("link", { name: "Chip", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Chip", exact: true })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const disabled = page.getByRole("button", { name: "disabled_object" });
      await expect(disabled).toBeDisabled();
      await page.evaluate(() => {
        (window as any).disabledClicks = 0;
        document.querySelector('[disabled].ts-chip')!.addEventListener("click", () => (window as any).disabledClicks++);
      });
      const box = await disabled.boundingBox();
      await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
      await disabled.evaluate((element: HTMLElement) => element.focus());
      await expect(disabled).not.toBeFocused();
      await page.keyboard.press("Enter");
      await page.keyboard.press("Space");
      expect(await page.evaluate(() => (window as any).disabledClicks)).toBe(0);
      const long = page.getByRole("button", { name: "this_is_a_long_object_identifier_that_stays_visible" });
      const layout = await long.evaluate(element => {
        const label = element.querySelector(".ts-chip__name")!;
        const range = document.createRange();
        range.selectNodeContents(label);
        const button = element.getBoundingClientRect();
        const lines = [...range.getClientRects()].map(r => ({x:r.x,y:r.y,width:r.width,height:r.height}));
        return { button: {x:button.x,y:button.y,width:button.width,height:button.height}, lines,
          labelWidth: label.clientWidth, contentWidth: label.scrollWidth, text: label.textContent };
      });
      expect(layout.lines.length).toBeGreaterThan(1);
      expect(layout.contentWidth).toBeLessThanOrEqual(layout.labelWidth);
      for (const line of layout.lines) {
        expect(line.x).toBeGreaterThanOrEqual(layout.button.x);
        expect(line.x + line.width).toBeLessThanOrEqual(layout.button.x + layout.button.width);
      }
      observations.push({ locale, theme, disabledClicks: 0, disabledFocused: false, layout });
    }
  }
  await testInfo.attach("chip-boundary-observations.json", { body: JSON.stringify(observations, null, 2), contentType: "application/json" });
});
