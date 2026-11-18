import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { openPreview, expectAccessible, expectThemeFocusRing, expectNoHorizontalScroll } from './helpers/preview';
const evidence = '~/.no-mistakes/evidence/01M7Q492AVMJCAE3MNAWAJJCFJ';
const observations: unknown[] = [];
test.afterAll(async () => { await writeFile(`${evidence}/tooltip-observations.json`, JSON.stringify(observations, null, 2)); });
for (const locale of ['en','ar'] as const) for (const theme of ['light','dark'] as const) {
 test(`${locale} ${theme}: focus, dismissal, hover, OpenUI and responsive appearance`, async ({page}) => {
  await mkdir(evidence, {recursive:true});
  const state = { locale, direction: locale === 'ar' ? 'rtl' as const : 'ltr' as const, theme };
  const label = locale === 'en' ? 'Add item' : 'إضافة عنصر';
  const hint = locale === 'en' ? 'Create a new item' : 'أنشئ عنصراً جديداً';
  await openPreview(page, state, '/components/Tooltip');
  await expectThemeFocusRing(page, theme);
  await page.keyboard.press('Tab');
  const trigger = page.getByRole('button', {name:label}).first();
  const tip = page.locator('[data-slot="tooltip-content"]').first();
  await expect(trigger).toBeFocused(); await expect(tip).toBeVisible(); await expect(tip).toContainText(hint);
  await expect(trigger).toHaveAttribute('aria-describedby', await tip.getAttribute('id') as string);
  await expect(tip.locator('[data-slot="tooltip-shortcut"]')).toContainText('K');
  await expect(trigger).toHaveCSS('outline-width','2px'); await expect(trigger).toHaveCSS('outline-offset','2px');
  await expect(trigger).toHaveCSS('outline-color',theme === 'light' ? 'rgb(1, 105, 204)' : 'rgb(2, 133, 255)');
  await expectAccessible(page);
  for (const width of [1440,390]) {
   await page.setViewportSize({width,height:900}); await page.evaluate(()=>document.fonts.ready);
   await expect(page.locator('[data-starting-style], [data-ending-style]')).toHaveCount(0);
   await expect(tip).toBeVisible();
   await expect.poll(async () => page.locator('[data-slot="tooltip-content"][data-open]').evaluateAll(els => els.every(el => {const b=el.getBoundingClientRect();return b.x >= 0 && b.right <= innerWidth;}))).toBe(true);
   const geometry = await page.locator('[data-slot="tooltip-content"][data-open]').evaluateAll(els=>els.map(el=>{
    const b=el.getBoundingClientRect(); const s=getComputedStyle(el);
    return {text:el.textContent, side:el.getAttribute('data-side'), x:b.x,right:b.right,y:b.y,bottom:b.bottom,background:s.backgroundColor,color:s.color};
   }));
   for (const g of geometry) {expect(g.x).toBeGreaterThanOrEqual(0); expect(g.right).toBeLessThanOrEqual(width);}
   expect(geometry[0].background).toBe(theme==='light'?'rgb(48, 48, 48)':'rgb(175, 175, 175)');
   expect(geometry[0].color).toBe(theme==='light'?'rgb(255, 255, 255)':'rgb(13, 13, 13)');
   observations.push({locale,theme,width,geometry});
   await page.screenshot({path:`${evidence}/tooltip-${locale}-${theme}-${width}.png`, fullPage:true,animations:'disabled'});
  }
  await expectNoHorizontalScroll(page);
  await page.keyboard.press('Escape'); await expect(tip).not.toBeVisible(); await expect(trigger).toBeFocused();
  await page.getByRole('link').first().focus(); await trigger.hover(); await expect(tip).toBeVisible();
  await page.mouse.move(0,0); await expect(tip).not.toBeVisible();
  const fixture = page.getByRole('region',{name:locale==='en'?'OpenUI fixture':'عينة OpenUI'});
  const fixtureTrigger=fixture.getByRole('button',{name:label});
  await fixtureTrigger.focus();
  const fixtureTip=fixture.getByRole('tooltip'); await expect(fixtureTip).toBeVisible(); await expect(fixtureTip).toContainText(hint);
  await expect(fixtureTrigger).toHaveAttribute('aria-describedby',await fixtureTip.getAttribute('id') as string);
  await page.keyboard.press('Escape'); await expect(fixtureTip).not.toBeVisible(); await expect(fixtureTrigger).toBeFocused();
 });
}
