import { test, expect } from '@playwright/test';
test('Switch and SegmentedControl OpenUI fixtures render localized defaults and accept input', async ({ page }) => {
  for (const locale of ['en', 'ar']) {
    for (const name of ['Switch', 'SegmentedControl']) {
      await page.goto(`/components/${name}?locale=${locale}&dir=${locale === 'ar' ? 'rtl' : 'ltr'}&theme=light`);
      const fixture = page.getByRole('region', { name: locale === 'ar' ? 'عينة OpenUI' : 'OpenUI fixture' });
      if (name === 'Switch') {
        const control = fixture.getByRole('switch');
        await expect(control).toHaveAttribute('aria-checked', 'true');
        await control.press('Space');
        await expect(control).toHaveAttribute('aria-checked', 'false');
      } else {
        const radios = fixture.getByRole('radio');
        await expect(radios).toHaveCount(3);
        await expect(radios.nth(1)).toHaveAttribute('aria-checked', 'true');
        await radios.nth(0).click();
        await expect(radios.nth(0)).toHaveAttribute('aria-checked', 'true');
        await expect(radios.nth(1)).toHaveAttribute('aria-checked', 'false');
      }
    }
  }
});
