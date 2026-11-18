import { test, expect } from '@playwright/test';
import { openPreview, expectNoHorizontalScroll, expectAccessible, expectThemeFocusRing } from './helpers/preview';
const evidence='~/.no-mistakes/evidence/01M7QZPFSSNC2R9TG3030PVBWN';
for (const locale of ['en','ar'] as const) for (const theme of ['light','dark'] as const) {
 test(`local layout ${locale} ${theme}`, async ({page})=>{
  await openPreview(page,{locale,direction:locale==='ar'?'rtl':'ltr',theme});
  await expect(page.locator('.component-card')).toHaveCount(11);
  await expect(page.locator('.stream-code__line')).toHaveCount(7);
  for (const width of [1440,390]) {
   await page.setViewportSize({width,height:900});
   await page.screenshot({path:`${evidence}/home-${locale}-${theme}-${width}.png`,fullPage:true});
  }
  await expectNoHorizontalScroll(page);
  await expectAccessible(page);
  await expectThemeFocusRing(page,theme);
 });
}
test('local real clipboard, replay, live inputs, reduced motion and navigation',async({page,context})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 await openPreview(page,{locale:'en',direction:'ltr',theme:'light'});
 await page.locator('.install-card').getByRole('button').click();
 await expect(page.locator('.install-card').getByRole('button')).toHaveText('Copied');
 expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe('npm install github:moeghashim/tensquads-ui#<commit-sha>');
 await expect(page.locator('.stream-code__line')).toHaveCount(7);
 const pane=page.locator('.stream-screen');
 await pane.getByRole('textbox',{name:'Store name'}).fill('Disposable store');
 await expect(pane.getByRole('textbox')).toHaveValue('Disposable store');
 const toggle=pane.getByRole('switch');
 const previous=await toggle.getAttribute('aria-checked');
 await toggle.focus(); await toggle.press('Space');
 await expect(toggle).toHaveAttribute('aria-checked',previous==='true'?'false':'true');
 await pane.getByRole('radio',{name:'Weekly',exact:true}).click();
 await expect(pane.getByRole('radio',{name:'Weekly',exact:true})).toBeChecked();
 await pane.getByRole('button',{name:'Send back',exact:true}).click();
 await pane.getByRole('button',{name:'Approve plan',exact:true}).click();
 await page.getByRole('button',{name:'Replay',exact:true}).click();
 await expect(page.locator('.stream-code__line')).toHaveCount(0);
 await expect(page.locator('.stream-code__line')).toHaveCount(7);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.getByRole('button',{name:'Replay',exact:true}).click();
 await expect(page.locator('.stream-code__line')).toHaveCount(7,{timeout:500});
 await page.locator('.hero__links').getByRole('link',{name:'Get started',exact:true}).click();
 await expect(page).toHaveURL(/get-started\?locale=en&dir=ltr&theme=light/);
 await page.getByRole('heading',{level:1}).isVisible();
 await page.locator('.site-nav').getByRole('link',{name:'Components',exact:true}).click();
 await expect(page).toHaveURL(/components\?locale=en&dir=ltr&theme=light/);
 await expect(page.locator('.component-card')).toHaveCount(11);
});
