import { expect, test } from '@playwright/test';
import { openPreview } from './helpers/preview';

const evidence = '~/.no-mistakes/evidence/01M7W9TK1DS74ZRGPNE3QA1PSM';

test('platform shortcuts ignore composing input and return focus after dismissal', async ({ browser }) => {
  for (const platform of ['MacIntel', 'Linux x86_64']) {
    const context = await browser.newContext();
    try {
      await context.addInitScript((platform) => Object.defineProperty(navigator, 'platform', { value: platform }), platform);
      const page = await context.newPage();
      await page.goto('http://localhost:5173/?locale=en&dir=ltr&theme=light');
      const trigger = page.locator('header.site-header').getByRole('button', { name: 'Search' });
      await trigger.focus();
      const apple = platform === 'MacIntel';
      const ignored = await page.evaluate((apple) => {
        const event = new KeyboardEvent('keydown', { key: 'k', metaKey: apple, ctrlKey: !apple, isComposing: true, bubbles: true, cancelable: true });
        window.dispatchEvent(event);
        return event.defaultPrevented;
      }, apple);
      expect(ignored).toBe(false);
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await page.keyboard.press(apple ? 'Meta+k' : 'Control+k');
      await expect(page.getByRole('dialog', { name: 'Search' })).toBeVisible();
      await expect(page.getByRole('combobox')).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(page.getByRole('combobox')).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(page.getByRole('combobox')).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(trigger).toBeFocused();
      console.log(`${platform}: composing shortcut ignored; real platform shortcut opened; Tab and Shift+Tab stayed inside; Escape restored Search focus`);
    } finally { await context.close(); }
  }
});

test('site palette navigates pages and description keywords in both locales, preserving URL settings', async ({ page }) => {
  for (const locale of ['en', 'ar'] as const) {
    const ar = locale === 'ar';
    await openPreview(page, { locale, direction: ar ? 'rtl' : 'ltr', theme: 'dark' });
    const trigger = page.locator('header.site-header').getByRole('button', { name: ar ? 'بحث' : 'Search' });
    for (const [label, path] of (ar ? [
      ['البدء', '/get-started'], ['المكوّنات', '/components'], ['عرض المحادثة', '/chat'],
      ['لوحة الإدارة', '/dashboards/admin'], ['لوحة صاحب المتجر', '/dashboards/home'], ['الرئيسية', '/'],
    ] : [
      ['Get started', '/get-started'], ['Components', '/components'], ['Chat demo', '/chat'],
      ['Admin dashboard', '/dashboards/admin'], ['Store owner dashboard', '/dashboards/home'], ['Home', '/'],
    ])) {
      await trigger.click();
      const dialog = page.getByRole('dialog');
      // Page labels and paths are specified by task 003, independent of runtime groups.
      const pages = dialog.getByRole('group', { name: ar ? 'الصفحات' : 'Pages', exact: true });
      await pages.getByRole('option', { name: label, exact: true }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect.poll(() => new URL(page.url()).pathname).toBe(path);
      const search = new URL(page.url()).searchParams;
      expect(search.get('locale')).toBe(locale);
      expect(search.get('dir')).toBe(ar ? 'rtl' : 'ltr');
      expect(search.get('theme')).toBe('dark');
    }
    await trigger.click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('combobox').fill('non-interactive');
    await expect(dialog.getByRole('option', { name: 'Badge', exact: true })).toBeVisible();
    await dialog.getByRole('option', { name: 'Badge', exact: true }).click();
    await expect.poll(() => new URL(page.url()).pathname).toBe('/components/Badge');
    await expect(page.getByRole('heading', { name: 'Badge', exact: true }).first()).toBeVisible();
    console.log(`${locale}: six page commands navigated and kept locale/direction/theme; description keyword selected Badge and rendered its page`);
  }
});

test('mobile site settings switch locale and all themes, with a named search button and contained scrolling list', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openPreview(page, { locale: 'en', direction: 'ltr', theme: 'light' }, '/components/CommandPalette');
  for (const locale of ['ar', 'en'] as const) {
    let ar = locale === 'en';
    await page.locator('header.site-header').getByRole('button', { name: ar ? 'بحث' : 'Search' }).click();
    let dialog = page.getByRole('dialog');
    await dialog.getByRole('combobox').fill(ar ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic');
    await page.keyboard.press('Enter');
    await expect(dialog).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    expect(new URL(page.url()).pathname).toBe('/components/CommandPalette');
    ar = locale === 'ar';
    for (const theme of ['dark', 'system', 'light']) {
      await page.locator('header.site-header').getByRole('button', { name: ar ? 'بحث' : 'Search' }).click();
      dialog = page.getByRole('dialog');
      await expect(dialog.getByRole('combobox')).toHaveValue('');
      const list = dialog.locator('[data-slot="command-list"]');
      expect(await list.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
      const box = await dialog.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(390);
      await dialog.getByRole('combobox').fill(theme);
      await expect(dialog.getByRole('group')).toHaveCount(1);
      await page.screenshot({ path: `${evidence}/site-settings-${locale}-${theme}-390.png`, animations: 'disabled' });
      await page.keyboard.press('Enter');
      await expect(dialog).toHaveCount(0);
      expect(new URL(page.url()).searchParams.get('theme')).toBe(theme);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      expect(new URL(page.url()).searchParams.get('dir')).toBe(ar ? 'rtl' : 'ltr');
      if (theme === 'system') {
        await page.emulateMedia({ colorScheme: 'dark' });
        await expect(page.locator('html')).not.toHaveAttribute('data-theme', /light|dark/);
      } else {
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      }
    }
    console.log(`${locale}: named mobile Search button opened scrolling palette within 390px; language changed direction; dark/system/light commands changed URL, retained route and locale, and reset query on reopen`);
  }
});
