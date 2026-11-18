import { expect, test } from '@playwright/test';

const evidence = '~/.no-mistakes/evidence/01M7Q67JPBXKJBJGGF9KBGNYKF';
for (const locale of ['en', 'ar']) {
  test(`Tooltip hover, keyboard dismissal and OpenUI in ${locale}`, async ({ page }) => {
    const ar = locale === 'ar';
    await page.goto(`/components/Tooltip?locale=${locale}&dir=${ar ? 'rtl' : 'ltr'}&theme=dark`);
    const region = page.getByRole('region', { name: ar ? 'مواضع التلميح' : 'Tooltip placements' });
    const trigger = region.getByRole('button', { name: ar ? 'إضافة عنصر' : 'Add item' }).first();
    const open = page.locator('[data-slot="tooltip-content"][data-open]');
    await trigger.hover();
    await expect(open).toHaveCount(1);
    await expect(open).toBeVisible();
    await expect(trigger).not.toBeFocused();
    await page.mouse.move(0, 0);
    await expect(open).toHaveCount(0);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(trigger).toBeFocused();
    await expect(open).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(open).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(region.getByRole('button').nth(1)).toBeFocused();
    await expect(open).toHaveCount(1);
    await page.keyboard.press('Escape');
    const fixture = page.getByRole('region', { name: ar ? 'عينة OpenUI' : 'OpenUI fixture' });
    const fixtureTrigger = fixture.getByRole('button', { name: ar ? 'إضافة عنصر' : 'Add item' });
    await fixtureTrigger.focus();
    await expect(open).toHaveCount(1);
    await expect(open).toContainText(ar ? 'أنشئ عنصراً جديداً' : 'Create a new item');
    const describedBy = await fixtureTrigger.getAttribute('aria-describedby');
    await expect(open).toHaveAttribute('id', describedBy!);
    await expect(open).not.toHaveAttribute('data-starting-style');
    await page.screenshot({ path: `${evidence}/openui-${locale}-dark.png`, fullPage: true, animations: 'disabled' });
    await page.keyboard.press('Escape');
    await expect(open).toHaveCount(0);
    await expect(fixtureTrigger).toBeFocused();
  });
}
