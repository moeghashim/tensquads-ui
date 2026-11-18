import { expect, test } from '@playwright/test';
const evidence='~/.no-mistakes/evidence/01M7QW37MXE52HS36S5Q7S9HDB';
test('install copy, README CSS contract and stateful primary navigation',async({page,context})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 for(const locale of ['en','ar']){
  await page.goto(`/?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=dark`);
  await page.getByRole('button',{name:locale==='ar'?'نسخ':'Copy',exact:true}).click();
  await expect(page.getByRole('button',{name:locale==='ar'?'تم النسخ':'Copied',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe('npm install github:moeghashim/tensquads-ui#<commit-sha>');
  await expect(page.locator('.style-setup code')).toHaveText('@layer ui-sdk, tensquads;\n@import "@tensquads/ui/fonts.css";\n@import "@tensquads/ui/tokens.css";\n@import "@tensquads/ui/styles.css";');
  const nav=page.getByRole('navigation');
  await nav.getByRole('link',{name:locale==='ar'?'المكوّنات':'Components',exact:true}).click();
  await expect(page).toHaveURL(new RegExp(`/components\\?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=dark$`));
  await expect(page.locator('.component-card')).toHaveCount(11);
  for(const name of ['Badge','Button','Chip','Dialog','Field','Input','Menu','SegmentedControl','Squadmate','Switch','Tooltip']){
   await page.locator('.component-card').getByRole('link',{name,exact:true}).click();
   await expect(page.getByRole('heading',{name,exact:true,level:1})).toBeVisible();
   await page.keyboard.press('Escape');
   await nav.getByRole('link',{name:locale==='ar'?'المكوّنات':'Components',exact:true}).click();
   await expect(page.locator('.component-card')).toHaveCount(11);
  }
  await nav.getByRole('link',{name:locale==='ar'?'البدء':'Get started',exact:true}).click();
  await expect(page.getByRole('main').getByRole('heading',{level:1})).toHaveText(locale==='ar'?'البدء':'Get started');
  await page.screenshot({path:`${evidence}/get-started-${locale}.png`,fullPage:true});
 }
});
test('stream replay, real controls, reduced motion and no provider requests',async({page})=>{
 const remote=[];page.on('request',r=>{if(!r.url().startsWith('http://localhost:5173'))remote.push(r.url())});
 await page.goto('/?locale=en&dir=ltr&theme=light');
 const pane=page.locator('.stream-screen');
 await expect(pane.getByRole('button',{name:'Approve plan'})).toBeVisible();
 await pane.getByRole('textbox',{name:'Store name'}).fill('Disposable test store');
 await expect(pane.getByRole('textbox',{name:'Store name'})).toHaveValue('Disposable test store');
 const toggle=pane.getByRole('switch',{name:'Email me when done'});const checked=await toggle.isChecked();await toggle.click();await expect(toggle).toBeChecked({checked:!checked});
 await pane.getByRole('radio',{name:'Monthly'}).click();await expect(pane.getByRole('radio',{name:'Monthly'})).toBeChecked();
 await page.getByRole('button',{name:'Replay',exact:true}).click();
 await expect(pane.getByRole('button',{name:'Approve plan'})).toHaveCount(0);
 await expect(pane.getByRole('button',{name:'Approve plan'})).toBeVisible();
 await expect(pane.getByRole('textbox',{name:'Store name'})).toHaveValue('Bannaa Market');
 await page.screenshot({path:`${evidence}/stream-replayed.png`,fullPage:true});
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();
 await expect(pane.getByRole('button',{name:'Approve plan'})).toBeVisible();
 await expect(page.locator('.stream-code__footer')).toContainText('7/7');
 expect(remote).toEqual([]);
});
test('system theme follows the browser and persists after reload',async({page})=>{
 await page.emulateMedia({colorScheme:'dark'});await page.goto('/?locale=en&dir=ltr&theme=light');
 await page.getByRole('radio',{name:'System',exact:true}).click();await expect(page).toHaveURL(/theme=system/);
 await expect(page.locator('html')).not.toHaveAttribute('data-theme');
 const dark=await page.locator('html').evaluate(el=>getComputedStyle(el).backgroundColor);
 await page.emulateMedia({colorScheme:'light'});
 await expect.poll(()=>page.locator('html').evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe(dark);
 await page.reload();await expect(page.getByRole('radio',{name:'System',exact:true})).toBeChecked();
});
