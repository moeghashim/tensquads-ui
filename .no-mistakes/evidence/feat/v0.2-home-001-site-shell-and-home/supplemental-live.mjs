import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const evidence = '~/.no-mistakes/evidence/01M7QYA6HGZQ2RZD9BZEHMTBF9';
const browser = await chromium.launch();
const checks = [];
try {
 const context = await browser.newContext({viewport:{width:1440,height:900}});
 const page = await context.newPage();
 const external = [];
 page.on('request', request => {if (!new URL(request.url()).hostname.match(/^(localhost|127\.0\.0\.1)$/)) external.push(request.url());});
 await page.goto('http://127.0.0.1:5173/?locale=en&dir=ltr&theme=light');
 await expect(page.locator('.stream-code__line')).toHaveCount(7);
 await page.getByRole('button',{name:'Replay',exact:true}).click();
 await expect(page.locator('.stream-code__line')).toHaveCount(0);
 await expect(page.locator('.stream-code__line')).toHaveCount(7);
 await expect(page.getByRole('button',{name:'Approve plan',exact:true})).toBeVisible();
 const field = page.locator('.stream-screen').getByRole('textbox',{name:'Store name'});
 await field.fill('Disposable test shop');
 await expect(field).toHaveValue('Disposable test shop');
 const toggle = page.locator('.stream-screen').getByRole('switch');
 const was = await toggle.getAttribute('aria-checked');
 await toggle.focus(); await page.keyboard.press('Space');
 await expect(toggle).toHaveAttribute('aria-checked',was==='true'?'false':'true');
 await page.locator('.stream-screen').getByRole('radio',{name:'Monthly',exact:true}).click();
 await expect(page.locator('.stream-screen').getByRole('radio',{name:'Monthly',exact:true})).toBeChecked();
 await page.screenshot({path:`${evidence}/replayed-live-demo.png`,fullPage:true});
 expect(external).toEqual([]);
 checks.push({behavior:'Replay clears then restores all seven fixture lines; rendered field, switch keyboard toggle, and billing selection work without external requests',result:'pass',externalRequests:external});
 await page.getByRole('radio',{name:'System',exact:true}).click();
 await expect(page).toHaveURL(/theme=system/);
 await expect(page.locator('html')).not.toHaveAttribute('data-theme');
 await page.emulateMedia({colorScheme:'light'});
 const light = await page.locator('html').evaluate(el=>getComputedStyle(el).backgroundColor);
 await page.emulateMedia({colorScheme:'dark'});
 const dark = await page.locator('html').evaluate(el=>getComputedStyle(el).backgroundColor);
 expect(dark).not.toEqual(light);
 await page.getByRole('radio',{name:'العربية',exact:true}).click();
 await expect(page.locator('html')).toHaveAttribute('dir','rtl');
 for(const [name,path] of [['المكوّنات','/components'],['البدء','/get-started'],['الرئيسية','/']]) {
  const link=page.getByRole('navigation').getByRole('link',{name,exact:true});
  await link.focus(); await page.keyboard.press('Enter');
  await expect(page).toHaveURL(`http://127.0.0.1:5173${path}?locale=ar&dir=rtl&theme=system`);
  await expect(page.getByRole('heading',{level:1})).toBeVisible();
 }
 await page.reload();
 await expect(page.locator('html')).toHaveAttribute('lang','ar');
 await expect(page.locator('html')).not.toHaveAttribute('data-theme');
 checks.push({behavior:'System follows browser light/dark preference; keyboard navigation and reload preserve Arabic RTL and system theme',result:'pass',light,dark});
 await context.close();
 const reduced = await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});
 const rp=await reduced.newPage();
 for(const locale of ['en','ar']){
  await rp.goto(`http://127.0.0.1:5173/?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=dark`);
  await expect(rp.locator('.stream-code__line')).toHaveCount(7,{timeout:1000});
  await rp.getByRole('button',{name:locale==='ar'?'إعادة العرض':'Replay',exact:true}).click();
  await expect(rp.locator('.stream-code__line')).toHaveCount(7,{timeout:1000});
  await expect(rp.getByRole('button',{name:locale==='ar'?'اعتماد الخطة':'Approve plan',exact:true})).toBeVisible();
 }
 await rp.screenshot({path:`${evidence}/reduced-motion-ar-mobile.png`,fullPage:true});
 checks.push({behavior:'Reduced motion shows complete English and Arabic demos immediately, including after Replay at mobile width',result:'pass'});
 await reduced.close();
} finally {
 await browser.close();
 await writeFile(`${evidence}/supplemental-live-results.json`, JSON.stringify(checks,null,2));
}
console.log(JSON.stringify(checks,null,2));
