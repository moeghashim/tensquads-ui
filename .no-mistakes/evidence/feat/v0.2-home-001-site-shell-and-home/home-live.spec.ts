import { test, expect } from '@playwright/test';
import { openPreview, expectAccessible, expectNoHorizontalScroll, expectThemeFocusRing } from './helpers/preview';
const evidence = '~/.no-mistakes/evidence/01M7R0RKKEGXGS3CV7YBM98KCG';
test('live home visual, accessibility and responsive matrix', async ({page}) => {
 for(const locale of ['en','ar'] as const) for(const theme of ['light','dark'] as const) {
  await page.setViewportSize({width:1440,height:900});
  await openPreview(page,{locale,direction:locale==='ar'?'rtl':'ltr',theme});
  await expect(page.locator('.stream-code__line')).toHaveCount(7);
  await expect(page.locator('.component-card')).toHaveCount(11);
  await expectAccessible(page);
  await expectThemeFocusRing(page,theme);
  for (const width of [1440,390]) {
   await page.setViewportSize({width,height:900});
   await page.screenshot({path:`${evidence}/home-${locale}-${theme}-${width}.png`,fullPage:true,animations:'disabled'});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
  }
  await expectNoHorizontalScroll(page);
 }
});
test('live replay progressively renders seven messages and usable controls without model requests', async ({page})=>{
 const outbound:string[]=[];
 page.on('request',r=>{if(!new URL(r.url()).hostname.match(/^(localhost|127\.0\.0\.1)$/))outbound.push(r.url())});
 await openPreview(page,{locale:'en',direction:'ltr',theme:'light'});
 await expect(page.locator('.stream-code__line')).toHaveCount(7);
 await page.getByRole('button',{name:'Replay',exact:true}).click();
 expect(await page.locator('.stream-code__line').count()).toBeLessThan(7);
 await expect(page.locator('.stream-code__line')).toHaveCount(7);
 const pane=page.locator('.stream-screen');
 const input=pane.getByRole('textbox',{name:'Store name'});
 await input.fill('Disposable shop'); await expect(input).toHaveValue('Disposable shop');
 const toggle=pane.getByRole('switch',{name:'Email me when done'});
 const before=await toggle.getAttribute('aria-checked'); await toggle.click();
 await expect(toggle).toHaveAttribute('aria-checked',before==='true'?'false':'true');
 await pane.getByRole('radio',{name:'Weekly',exact:true}).click();
 await expect(pane.getByRole('radio',{name:'Weekly',exact:true})).toBeChecked();
 expect(outbound).toEqual([]);
 await page.screenshot({path:`${evidence}/demo-controls.png`,fullPage:true});
});
test('live reduced-motion replay immediately presents the complete Arabic fixture', async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await openPreview(page,{locale:'ar',direction:'rtl',theme:'dark'});
 await expect(page.locator('.stream-code__line')).toHaveCount(7);
 await page.getByRole('button',{name:'إعادة العرض',exact:true}).click();
 await expect(page.locator('.stream-code__line')).toHaveCount(7);
 await expect(page.locator('.stream-screen').getByRole('button',{name:'اعتماد الخطة'})).toBeVisible();
 await page.screenshot({path:`${evidence}/reduced-motion-ar.png`,fullPage:true});
});
