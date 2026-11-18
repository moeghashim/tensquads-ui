import { test, expect } from '@playwright/test';
import { openPreview } from './helpers/preview';

test('Chip disabled guard, complete long label, and merged gallery navigation', async ({ page }, testInfo) => {
  for (const locale of ['en', 'ar'] as const) {
    for (const theme of ['light', 'dark'] as const) {
      const state = {locale, direction: locale === 'ar' ? 'rtl' as const : 'ltr' as const, theme};
      await openPreview(page, state);
      const links = page.getByRole('region', {name: locale === 'en' ? 'Components' : 'المكوّنات'}).getByRole('link');
      expect(await links.allTextContents()).toEqual(expect.arrayContaining(['Chip', 'Menu', 'Dialog']));
      await page.getByRole('link', {name: 'Chip', exact:true}).click();
      const grid = page.locator('.chip-preview__grid');
      const first = grid.getByRole('button', {name:'response_schema', exact:true});
      const disabled = grid.getByRole('button', {name:'disabled_object'});
      await page.evaluate(() => {
        (window as any).events = [];
        document.addEventListener('click', event => {
          const target = (event.target as HTMLElement).closest('.ts-chip');
          if (target) (window as any).events.push(target.textContent);
        });
      });
      await first.click();
      await first.press('Enter');
      await first.press('Space');
      expect(await page.evaluate(() => (window as any).events.length)).toBe(3);
      await expect(disabled).toBeDisabled();
      const box = await disabled.boundingBox();
      if (!box) throw new Error('Disabled chip has no bounds');
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await first.focus();
      await disabled.evaluate(element => (element as HTMLElement).focus());
      await expect(first).toBeFocused();
      expect(await page.evaluate(() => (window as any).events.length)).toBe(3);
      await grid.getByRole('button', {name:'output_format'}).focus();
      await page.keyboard.press('Tab');
      const longName = 'this_is_a_long_object_identifier_that_stays_visible';
      await expect(grid.getByRole('button', {name:longName})).toBeFocused();
      for (const width of [1440,390]) {
        await page.setViewportSize({width,height:900});
        const label = grid.getByRole('button', {name:longName}).locator('.ts-chip__name');
        await expect(label).toHaveText(longName);
        const layout = await label.evaluate(element => {
          const range = document.createRange(); range.selectNodeContents(element);
          const bounds = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {right:bounds.right,left:bounds.left,client:element.clientWidth,scroll:element.scrollWidth,
            textOverflow:style.textOverflow, lines:range.getClientRects().length,
            outside:[...range.getClientRects()].some(rect => rect.left < bounds.left - 1 || rect.right > bounds.right + 1)};
        });
        expect(layout.outside).toBe(false);
        expect(layout.textOverflow).not.toBe('ellipsis');
        expect(layout.scroll).toBeLessThanOrEqual(layout.client);
        expect(layout.left).toBeGreaterThanOrEqual(0);
        expect(layout.right).toBeLessThanOrEqual(width);
        if (width === 390) expect(layout.lines).toBeGreaterThan(1);
        await testInfo.attach(`chip-guard-${locale}-${theme}-${width}.png`, {body:await page.screenshot({fullPage:true}),contentType:'image/png'});
      }
    }
  }
});
