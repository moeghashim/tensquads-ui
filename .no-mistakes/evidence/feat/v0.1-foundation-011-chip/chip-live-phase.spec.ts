import { expect, test } from '@playwright/test';
import { openPreview, expectAccessible, expectNoHorizontalScroll } from './helpers/preview';
const evidence = '~/.no-mistakes/evidence/01M7PVSP7RFJCWRM65H4X017SS';
for (const locale of ['en','ar'] as const) for (const theme of ['light','dark'] as const) {
 test(`Chip live layout ${locale} ${theme}`, async ({page}) => {
  const state = {locale, direction: locale === 'ar' ? 'rtl' as const : 'ltr' as const, theme};
  await openPreview(page,state,'/components/Chip');
  const first = page.getByRole('button',{name:'response_schema',exact:true});
  await first.focus();
  await page.keyboard.press('Space');
  await expect(first).toHaveCSS('outline-width','2px');
  await expect(first).toHaveCSS('outline-offset','2px');
  await expect(first).toHaveCSS('outline-color',theme==='light'?'rgb(1, 105, 204)':'rgb(2, 133, 255)');
  expect(await first.getAttribute('aria-pressed')).toBeNull();
  expect(await first.evaluate(el=>el.getBoundingClientRect().height)).toBe(28);
  await expect(first).toHaveCSS('background-color', theme==='light'?'rgb(237, 237, 237)':'rgb(48, 48, 48)');
  for(const width of [1440,390]) {
   await page.setViewportSize({width,height:900});
   const long=page.getByRole('button',{name:'this_is_a_long_object_identifier_that_stays_visible',exact:true});
   await expect(long).toHaveText('◇this_is_a_long_object_identifier_that_stays_visible');
   const metrics=await long.locator('.ts-chip__name').evaluate(el=>({width:el.clientWidth, scroll:el.scrollWidth, overflow:getComputedStyle(el).textOverflow, height:el.getBoundingClientRect().height}));
   expect(metrics.scroll).toBeLessThanOrEqual(metrics.width+1);
   expect(metrics.overflow).not.toBe('ellipsis');
   if(width===390) expect(metrics.height).toBeGreaterThan(20);
   await expectAccessible(page);
   await page.screenshot({path:`${evidence}/chip-${locale}-${theme}-${width}.png`,fullPage:true});
  }
  await expectNoHorizontalScroll(page);
  const disabled=page.getByRole('button',{name:'disabled_object'});
  await expect(disabled).toBeDisabled();
  await page.getByRole('button',{name:'output_format'}).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button',{name:'this_is_a_long_object_identifier_that_stays_visible'})).toBeFocused();
 });
}
