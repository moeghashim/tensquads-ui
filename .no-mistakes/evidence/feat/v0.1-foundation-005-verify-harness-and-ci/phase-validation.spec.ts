import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { openPreview, expectThemeFocusRing, expectAccessible, expectNoHorizontalScroll } from './helpers/preview';
const evidence='~/.no-mistakes/evidence/01M7NQYXPTB2DE06FNQH7XHC4A';
test('capture live preview states and layout',async({page})=>{
 const listener=spawnSync('lsof',['-nP','-iTCP:5173','-sTCP:LISTEN'],{encoding:'utf8'});
 await writeFile(`${evidence}/localhost-listener.log`,listener.stdout+listener.stderr);
 expect(listener.status).toBe(0);
 expect(listener.stdout).toMatch(/(?:127\.0\.0\.1|\[::1\]):5173/);
 expect(listener.stdout).not.toContain('*:5173');
 const results=[];
 for(const locale of ['en','ar'] as const)for(const theme of ['light','dark'] as const){
  const direction=locale==='ar'?'rtl':'ltr';
  await openPreview(page,{locale,direction,theme});
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:900});
   await page.screenshot({path:`${evidence}/${locale}-${theme}-${width}.png`,fullPage:true});
  }
  await expectNoHorizontalScroll(page);
  await expectAccessible(page);
  await expectThemeFocusRing(page,theme);
  results.push(await page.evaluate(()=>({lang:document.documentElement.lang,dir:document.documentElement.dir,theme:document.documentElement.dataset.theme,viewport:innerWidth,content:document.documentElement.scrollWidth,focus:{width:getComputedStyle(document.activeElement!).outlineWidth,offset:getComputedStyle(document.activeElement!).outlineOffset,color:getComputedStyle(document.activeElement!).outlineColor},axe:'no violations'})));
 }
 await writeFile(`${evidence}/preview-observations.json`,JSON.stringify(results,null,2));
});
test('preview controls and invalid query values remain consistent',async({page})=>{
 const events:string[]=[];
 page.on('console',msg=>events.push(`console ${msg.type()}: ${msg.text()}`));
 page.on('pageerror',err=>events.push(`pageerror: ${err.message}`));
 page.on('requestfailed',req=>events.push(`requestfailed ${req.url()} ${req.failure()?.errorText}`));
 await page.goto('/?locale=invalid&dir=invalid&theme=invalid');
 await page.waitForLoadState('networkidle');
 await writeFile(`${evidence}/browser-events.log`,events.join('\n'));
 await page.screenshot({path:`${evidence}/invalid-query.png`,fullPage:true});
 await expect(page.locator('html')).toHaveAttribute('lang','en');
 await expect(page.locator('html')).toHaveAttribute('dir','ltr');
 await expect(page.locator('html')).not.toHaveAttribute('data-theme');
 const controls=page.getByRole('combobox');
 await expect(controls.nth(0)).toHaveValue('en');
 await expect(controls.nth(1)).toHaveValue('ltr');
 await expect(controls.nth(2)).toHaveValue('system');
 await controls.nth(0).selectOption('ar');
 await expect(page.locator('html')).toHaveAttribute('lang','ar');
 await expect(page.locator('html')).toHaveAttribute('dir','rtl');
 await controls.nth(1).selectOption('ltr');
 await expect(page.locator('html')).toHaveAttribute('dir','ltr');
 await controls.nth(2).selectOption('dark');
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.getByRole('link',{name:'Component preview route'}).click();
 await expect(page.getByRole('heading',{name:'example'})).toBeVisible();
 await expect(page.locator('html')).toHaveAttribute('dir','ltr');
 await page.getByRole('link',{name:'Back to gallery'}).click();
 await expect(controls.nth(0)).toHaveValue('ar');
 await expect(controls.nth(1)).toHaveValue('ltr');
 await expect(controls.nth(2)).toHaveValue('dark');
 await controls.nth(2).selectOption('system');
 await expect(page.locator('html')).not.toHaveAttribute('data-theme');
 await page.emulateMedia({colorScheme:'dark'});
 const dark=await page.locator('html').evaluate(el=>getComputedStyle(el).backgroundColor);
 await page.emulateMedia({colorScheme:'light'});
 const light=await page.locator('html').evaluate(el=>getComputedStyle(el).backgroundColor);
 expect(dark).not.toBe(light);
 await page.screenshot({path:`${evidence}/controls-system-theme.png`,fullPage:true});
 await writeFile(`${evidence}/preview-controls.json`,JSON.stringify({invalidQuery:'en/ltr/system',localeChange:'ar/rtl',explicitDirection:'ar/ltr',routeRoundtrip:'ar/ltr/dark',systemBackground:{dark,light}},null,2));
});
