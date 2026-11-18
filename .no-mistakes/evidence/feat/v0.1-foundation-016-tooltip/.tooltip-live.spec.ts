import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const evidence = '~/.no-mistakes/evidence/01M7Q67JPBXKJBJGGF9KBGNYKF';
for (const locale of ['en','ar']) for (const direction of ['ltr','rtl']) for (const theme of ['light','dark']) {
 test(`live keyboard hover mobile and fixture ${locale}/${direction}/${theme}`, async ({page}) => {
  const records = [];
  await page.goto(`/components/Tooltip?locale=${locale}&dir=${direction}&theme=${theme}`);
  await page.evaluate(() => document.fonts.ready);
  const region = page.getByRole('region', {name: locale === 'en' ? 'Tooltip placements' : 'مواضع التلميح'});
  const triggers = region.getByRole('button');
  const opened = page.locator('[data-slot="tooltip-content"][data-open]');
  const sides = ['top','right','bottom','left'];
  for (const width of [1440,390]) {
   await page.setViewportSize({width, height:900});
   await page.getByRole('link', {name: locale === 'en' ? 'Back to gallery' : 'العودة إلى المعرض'}).focus();
   for (let index=0; index<4; index++) {
    const trigger = triggers.nth(index);
    await page.keyboard.press('Tab');
    await expect(trigger).toBeFocused();
    await expect(opened).toHaveCount(1);
    await expect(opened).toBeVisible();
    await expect(page.locator('[data-starting-style], [data-ending-style]')).toHaveCount(0);
    const side=sides[index];
    await expect.poll(async () => {
     const a=await trigger.boundingBox(); const c=await opened.boundingBox();
     if (!a || !c) return false;
     return side==='top' ? c.y+c.height<=a.y : side==='right' ? c.x>=a.x+a.width : side==='bottom' ? c.y>=a.y+a.height : c.x+c.width<=a.x;
    }).toBe(true);
    const a=await trigger.boundingBox(), c=await opened.boundingBox();
    const id=await opened.getAttribute('id');
    expect((await trigger.getAttribute('aria-describedby'))?.split(' ')).toContain(id);
    const dimensions=await page.evaluate(() => ({viewport:document.documentElement.clientWidth, content:document.documentElement.scrollWidth}));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
    expect(c!.x).toBeGreaterThanOrEqual(0);
    expect(c!.x+c!.width).toBeLessThanOrEqual(width);
    records.push({width, side, trigger:a, tooltip:c, dimensions});
    await page.keyboard.press('Escape');
    await expect(opened).toHaveCount(0);
    await expect(trigger).toBeFocused();
   }
  }
  await page.setViewportSize({width:1440,height:900});
  await page.getByRole('link').focus();
  for (let index=0; index<4; index++) {
   await triggers.nth(index).hover();
   await expect(opened).toHaveCount(1);
   await expect(opened).toBeVisible();
   await expect(opened).toHaveAttribute('data-side',sides[index]);
   await page.mouse.move(0,0);
   await expect(opened).toHaveCount(0);
  }
  const fixture=page.getByRole('region',{name:locale==='en'?'OpenUI fixture':'عينة OpenUI'}).getByRole('button',{name:locale==='en'?'Add item':'إضافة عنصر'});
  await fixture.focus();
  await expect(opened).toHaveCount(1);
  await expect(opened).toBeVisible();
  await expect(opened).toHaveText(locale==='en'?'Create a new item':'أنشئ عنصراً جديداً');
  expect((await fixture.getAttribute('aria-describedby'))?.split(' ')).toContain(await opened.getAttribute('id'));
  await expect(page.locator('[data-starting-style], [data-ending-style]')).toHaveCount(0);
  await page.screenshot({path:`${evidence}/fixture-${locale}-${direction}-${theme}.png`, fullPage:true});
  await page.keyboard.press('Escape');
  await expect(opened).toHaveCount(0);
  await expect(fixture).toBeFocused();
  await writeFile(`${evidence}/geometry-${locale}-${direction}-${theme}.json`,JSON.stringify(records,null,2));
 });
}
