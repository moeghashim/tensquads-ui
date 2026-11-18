import { writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { openPreview } from './helpers/preview';

const evidence = '~/.no-mistakes/evidence/01M7REPJ215PXXEFRJFN6EF43V/validation-current';
// Oracle: the requested arrow points right in LTR and left in RTL. The rendered
// SVG coordinate basis must reverse horizontally, including after dir changes.
for (const locale of ['en', 'ar'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    test(`send arrow follows direction: ${locale}/${theme}`, async ({ page }) => {
      const direction = locale === 'ar' ? 'rtl' : 'ltr';
      await openPreview(page, {locale, direction, theme}, '/components/Chat');
      const input = page.getByRole('textbox', {name: locale === 'ar' ? 'رسالة' : 'Message'});
      const send = page.getByRole('button', {name: locale === 'ar' ? 'إرسال' : 'Send', exact: true});
      const form = input.locator('xpath=ancestor::form');
      const measurements = [];
      const orientation = () => send.locator('svg').evaluate(svg => {
        const matrix = (svg as SVGSVGElement).getScreenCTM()!;
        return {horizontal: Math.sign(matrix.a), vertical: Math.sign(matrix.d)};
      });
      for (const width of [1440, 390]) {
        await page.setViewportSize({width, height: 900});
        await input.fill('   ');
        await expect(send).toBeDisabled();
        await expect.poll(orientation).toEqual({horizontal: direction === 'rtl' ? -1 : 1, vertical: 1});
        await form.screenshot({path: `${evidence}/arrow-${locale}-${theme}-${width}-disabled.png`});
        await input.fill(locale === 'ar' ? 'اختبار اتجاه الإرسال' : 'Check send direction');
        await expect(send).toBeEnabled();
        const rendered = await orientation();
        expect(rendered).toEqual({horizontal: direction === 'rtl' ? -1 : 1, vertical: 1});
        measurements.push({locale, theme, width, direction, rendered});
        await form.screenshot({path: `${evidence}/arrow-${locale}-${theme}-${width}-enabled.png`});
        await page.screenshot({path: `${evidence}/chat-${locale}-${theme}-${width}.png`, fullPage: true});
        await send.click();
        await expect(input).toHaveValue('');
      }
      // An explicit nested HTML direction must override the ancestor, independent of locale.
      const opposite = direction === 'rtl' ? 'ltr' : 'rtl';
      await form.evaluate((node, dir) => node.setAttribute('dir', dir), opposite);
      await input.fill('Nested direction');
      await page.waitForTimeout(200);
      const rendered = await orientation();
      await writeFile(`${evidence}/nested-${locale}-${theme}.html`, await form.evaluate(node => node.outerHTML));
      await form.screenshot({path: `${evidence}/arrow-${locale}-${theme}-nested-${opposite}.png`});
      expect.soft(rendered).toEqual({horizontal: opposite === 'rtl' ? -1 : 1, vertical: 1});
      measurements.push({locale, theme, width:390, direction:opposite, rendered});
      await form.screenshot({path: `${evidence}/arrow-${locale}-${theme}-nested-${opposite}.png`});
      await input.press('End');
      await input.press('Shift+Enter');
      await expect(input).toHaveValue('Nested direction\n');
      await input.press('Enter');
      await expect(input).toHaveValue('');
      await writeFile(`${evidence}/arrow-${locale}-${theme}.json`, JSON.stringify(measurements, null, 2));
    });
  }
}
