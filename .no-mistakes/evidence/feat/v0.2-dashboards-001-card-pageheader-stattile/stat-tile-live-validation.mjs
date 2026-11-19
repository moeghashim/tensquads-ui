import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const evidence = '~/.no-mistakes/evidence/01M7SQ6N6MZDW1BE1XM4YK4S86';
await mkdir(evidence, {recursive:true});
const browser = await chromium.launch();
const observations = [];
const failures = [];
const check = async (name, operation) => { try { await operation(); } catch(error) { failures.push({name, error:String(error)}); } };
try {
 for (const locale of ['en','ar']) for (const theme of ['light','dark']) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  for (const width of [1440,390]) {
   await page.setViewportSize({width,height:1000});
   const url=`http://127.0.0.1:5173/components/StatTile?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}`;
   await page.goto(url);
   await page.evaluate(()=>document.fonts.ready);
   const preview=page.locator('.dashboard-component-preview');
   await expect(preview).toBeVisible();
   const react=preview.locator('.ts-stat-grid > article');
   await check(`React ${locale} ${theme} ${width}`,async()=>{
    await expect(react).toHaveCount(6);
    for (const tile of await react.all()) {
     await expect(tile.locator('.ts-stat-tile__label')).toHaveCSS('font-size','14px');
     await expect(tile.locator('.ts-stat-tile__delta')).toHaveCSS('font-size','14px');
     await expect(tile.locator('.ts-stat-tile__glyph')).toHaveCount(0);
    }
    await expect(react.first().locator('.ts-stat-tile__delta')).toHaveText(locale==='en'?'+12% vs last week':'+١٢٪ مقارنة بالأسبوع الماضي');
    await expect(react.nth(1).locator('.ts-stat-tile__delta')).toHaveText(locale==='en'?'−2.1% vs last week':'−٢٫١٪ مقارنة بالأسبوع الماضي');
    await expect(react.last().getByRole('img')).toHaveCount(0);
   });
   const fixture=preview.getByRole('region',{name:locale==='en'?'OpenUI fixture':'عينة OpenUI'});
   await check(`OpenUI ${locale} ${theme} ${width}`,async()=>{
    await expect(fixture.locator('article')).toHaveCount(1);
    await expect(fixture.locator('.ts-stat-tile__label')).toHaveText(locale==='en'?'Revenue':'الإيرادات');
    await expect(fixture.locator('.ts-stat-tile__value')).toHaveText(locale==='en'?'$24.8k':'٢٤٫٨ ألف');
    await expect(fixture.locator('.ts-stat-tile__unit')).toHaveText(locale==='en'?'USD':'دولار');
    await expect(fixture.locator('.ts-stat-tile__foot')).toHaveText(locale==='en'?'Compared with last week':'مقارنة بالأسبوع الماضي');
    await expect(fixture.locator('.ts-stat-tile__delta')).toHaveText(locale==='en'?'+12% vs last week':'+١٢٪ مقارنة بالأسبوع الماضي');
    await expect(fixture.locator('.ts-stat-tile__label')).toHaveCSS('font-size','14px');
    await expect(fixture.locator('.ts-stat-tile__delta')).toHaveCSS('font-size','14px');
    await expect(fixture.locator('.ts-stat-tile__glyph')).toHaveCount(0);
    await expect(fixture.getByRole('img')).toHaveAccessibleName(locale==='en'?'Revenue':'الإيرادات');
    await expect(fixture.getByRole('img')).toHaveCSS('width','112px');
    await expect(fixture.getByRole('img')).toHaveCSS('height','32px');
   });
   await check(`Layout and accessibility ${locale} ${theme} ${width}`,async()=>{
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    for (const tile of await preview.locator('article').all()) {
     const data=await tile.evaluate(el=>{const box=el.getBoundingClientRect();return [...el.querySelectorAll('.ts-stat-tile__label,.ts-stat-tile__delta')].map(text=>{const r=text.getBoundingClientRect();return {text:text.textContent,fontSize:getComputedStyle(text).fontSize,within:r.x>=box.x-1&&r.right<=box.right+1,clipped:text.scrollWidth>text.clientWidth};});});
     expect(data.every(x=>x.within&&!x.clipped),JSON.stringify(data)).toBe(true);
    }
    const a11y=await new AxeBuilder({page}).include('.dashboard-component-preview').analyze();
    expect(a11y.violations).toEqual([]);
   });
   const metrics=await preview.locator('article').evaluateAll(tiles=>tiles.map(tile=>({label:tile.querySelector('.ts-stat-tile__label')?.textContent,labelSize:getComputedStyle(tile.querySelector('.ts-stat-tile__label')).fontSize,delta:tile.querySelector('.ts-stat-tile__delta')?.textContent,deltaSize:getComputedStyle(tile.querySelector('.ts-stat-tile__delta')).fontSize,glyphs:tile.querySelectorAll('.ts-stat-tile__glyph').length})));
   const screenshot=`stat-tile-${locale}-${theme}-${width}.png`;
   await page.screenshot({path:`${evidence}/${screenshot}`,fullPage:true,animations:'disabled'});
   observations.push({url,width,metrics,screenshot,errors:[...errors]});
  }
  // Embedded StatTile examples in the public Card page must follow the same contract.
  await page.setViewportSize({width:390,height:1000});
  await page.goto(`http://127.0.0.1:5173/components/Card?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}`);
  await page.evaluate(()=>document.fonts.ready);
  const cardTiles=page.locator('.dashboard-component-preview article');
  await check(`Embedded Card fixture ${locale} ${theme}`,async()=>{
   await expect(cardTiles).toHaveCount(2);
   for(const tile of await cardTiles.all()) {
    await expect(tile.locator('.ts-stat-tile__label')).toHaveCSS('font-size','14px');
    await expect(tile.locator('.ts-stat-tile__delta')).toHaveCSS('font-size','14px');
    await expect(tile.locator('.ts-stat-tile__glyph')).toHaveCount(0);
   }
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
  await check(`Browser runtime ${locale} ${theme}`,async()=>expect(errors).toEqual([]));
  await context.close();
 }
} finally { await browser.close(); }
await writeFile(`${evidence}/stat-tile-live-observations.json`,JSON.stringify({oracle:'Author intent requires label and delta at 14px and icon-free examples. Localized fixture content must retain its original argument meaning.',observations,failures},null,2));
console.log(JSON.stringify({observations:observations.length,failures},null,2));
if(failures.length) process.exitCode=1;
