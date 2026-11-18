import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { openPreview } from "./helpers/preview";

const evidence = "~/.no-mistakes/evidence/01M7Q67JPBXKJBJGGF9KBGNYKF";

test("mobile physical sides and hover, Escape, and localized OpenUI fixture", async ({ page }) => {
  test.setTimeout(90_000);
  const observations = [];
  for (const locale of ["en", "ar"] as const) {
    for (const direction of ["ltr", "rtl"] as const) {
      for (const theme of ["light", "dark"] as const) {
        await page.setViewportSize({ width: 390, height: 844 });
        await openPreview(page, { locale, direction, theme }, "/components/Tooltip");
        await page.keyboard.press("Tab");
        const name = locale === "en" ? "Add item" : "إضافة عنصر";
        const hint = locale === "en" ? "Create a new item" : "أنشئ عنصراً جديداً";
        const region = page.getByRole("region", { name: locale === "en" ? "Tooltip placements" : "مواضع التلميح" });
        const tooltip = page.locator('[data-slot="tooltip-content"][data-open]');
        for (const [index, side] of ["top", "right", "bottom", "left"].entries()) {
          const trigger = region.getByRole("button", { name }).nth(index);
          await trigger.scrollIntoViewIfNeeded();
          await trigger.focus();
          await expect(tooltip).toHaveCount(1);
          await expect(tooltip).toBeVisible();
          await expect(tooltip).not.toHaveAttribute("data-starting-style");
          // Oracle: preview labels denote physical sides in every reading direction.
          const anchor = (await trigger.boundingBox())!;
          await expect.poll(async () => {
            const box = (await tooltip.boundingBox())!;
            return side === "top" ? box.y + box.height <= anchor.y : side === "right" ? box.x >= anchor.x + anchor.width : side === "bottom" ? box.y >= anchor.y + anchor.height : box.x + box.width <= anchor.x;
          }).toBe(true);
          const box = (await tooltip.boundingBox())!;
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual(390);
          observations.push({ locale, direction, theme, side, anchor, tooltip: box });
          await page.keyboard.press("Escape");
          await expect(tooltip).toHaveCount(0);
          await expect(trigger).toBeFocused();
        }
        await page.reload();
        const first = region.getByRole("button", { name }).first();
        await first.hover();
        await expect(tooltip).toHaveCount(1);
        await expect(tooltip).toContainText(hint);
        await expect(first).not.toBeFocused();
        await page.keyboard.press("Escape");
        await expect(tooltip).toHaveCount(0);
        await page.mouse.move(0, 0);
        const fixture = page.getByRole("region", { name: locale === "en" ? "OpenUI fixture" : "عينة OpenUI" }).getByRole("button", { name });
        await fixture.scrollIntoViewIfNeeded();
        await fixture.focus();
        await expect(tooltip).toHaveCount(1);
        await expect(tooltip).toContainText(hint);
        await expect(fixture).toHaveAttribute("aria-describedby", await tooltip.getAttribute("id") as string);
        await expect(tooltip).not.toHaveAttribute("data-starting-style");
        await page.screenshot({ path: `${evidence}/screenshots/fixture-${locale}-${direction}-${theme}.png`, fullPage: true });
        await page.keyboard.press("Escape");
        await expect(tooltip).toHaveCount(0);
        await expect(fixture).toBeFocused();
      }
    }
  }
  await writeFile(`${evidence}/mobile-placement-observations.json`, JSON.stringify(observations, null, 2));
});
