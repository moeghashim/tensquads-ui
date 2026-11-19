import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { openPreview, expectAccessible } from './helpers/preview';
const evidence = '~/.no-mistakes/evidence/01M7SQ6N6MZDW1BE1XM4YK4S86';
for (const locale of ['en','ar'] as const) for (const theme of ['light','dark'] as const) {
 test(`StatTile intent ${locale} ${theme}`, async ({page}) => {
  const state = {locale, direction: locale === 'ar' ? 'rtl' as const : 'ltr' as const, theme};
  const measurements: unknown[] = [];
  // Oracle: the author's explicit 14px requirement and prohibition on example glyphs.
  async function checkTiles(root: ReturnType<typeof page.locator>, count: number) {
   const tiles = root.locator('[data-slot="stat-tile"]');
   await expect(tiles).toHaveCount(count);
   await expect(root.locator('.ts-stat-tile__glyph')).toHaveCount(0);
   for (const tile of await tiles.all()) {
    await expect(tile.locator('.ts-stat-tile__label')).toHaveCSS('font-size','14px');
    await expect(tile.locator('.ts-stat-tile__delta')).toHaveCSS('font-size','14px');
    const text = await tile.innerText();
    expect(text).not.toMatch(/[◷◇◆◈⌕]/u);
    measurements.push(await tile.evaluate(el => ({text: (el as HTMLElement).innerText, labelSize: getComputedStyle(el.querySelector('.ts-stat-tile__label')!).fontSize, deltaSize: getComputedStyle(el.querySelector('.ts-stat-tile__delta')!).fontSize})));
   }
  }
  for (const width of [1440,390]) {
   await page.setViewportSize({width,height:900});
   await openPreview(page,state,'/components/StatTile');
   const examples = page.locator('.dashboard-component-preview');
   await checkTiles(examples,7);
   const reactTiles = examples.locator('.ts-stat-grid > article');
   await expect(reactTiles).toHaveCount(6);
   await expect(reactTiles.last().locator('svg')).toHaveCount(0);
   await expect(reactTiles.first().locator('svg')).toHaveAccessibleName(locale === 'ar' ? 'الإيرادات' : 'Revenue');
   const fixture = page.getByRole('region',{name: locale === 'ar' ? 'عينة OpenUI' : 'OpenUI fixture'});
   for (const text of locale === 'ar' ? ['الإيرادات','٢٤٫٨ ألف','دولار','مقارنة بالأسبوع الماضي','+١٢٪ مقارنة بالأسبوع الماضي'] : ['Revenue','$24.8k','USD','Compared with last week','+12% vs last week']) {
    await expect(fixture.getByText(text,{exact:true})).toBeVisible();
   }
   await expectAccessible(page);
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
   // Longer Arabic delta text must fit without clipping at mobile width.
   for (const delta of await examples.locator('.ts-stat-tile__delta').all()) {
    expect(await delta.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
   }
   await page.screenshot({path:`${evidence}/stat-tile-${locale}-${theme}-${width}.png`,fullPage:true});
  }
  await page.setViewportSize({width:390,height:900});
  await openPreview(page,state,'/components');
  for (const name of ['StatTile','Card']) {
   const card = page.locator('.component-card').filter({has:page.getByRole('link',{name: new RegExp(`^${name}`)})});
   await expect(card).toHaveCount(1);
   await checkTiles(card,name === 'StatTile' ? 1 : 2);
   await card.screenshot({path:`${evidence}/gallery-${name}-${locale}-${theme}.png`});
  }
  await writeFile(`${evidence}/measurements-${locale}-${theme}.json`,JSON.stringify(measurements,null,2));
 });
}
