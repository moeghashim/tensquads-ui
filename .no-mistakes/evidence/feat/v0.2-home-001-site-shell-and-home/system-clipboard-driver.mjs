import {chromium,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const out='~/.no-mistakes/evidence/01M7QYA6HGZQ2RZD9BZEHMTBF9';
const browser=await chromium.launch();
try{
const page=await browser.newPage();
await page.goto('http://localhost:5173/?locale=en&dir=ltr&theme=system');
await expect(page.getByRole('radio',{name:'System',exact:true})).toHaveAttribute('aria-checked','true');
await page.emulateMedia({colorScheme:'dark'});
const dark=await page.locator('html').evaluate(el=>getComputedStyle(el).backgroundColor);
await page.emulateMedia({colorScheme:'light'});
const light=await page.locator('html').evaluate(el=>getComputedStyle(el).backgroundColor);
expect(dark).not.toBe(light);
await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new DOMException('Permission denied','NotAllowedError')}}}));
await page.locator('.install-card button').click();
await expect(page.locator('.install-card [role=status]')).toHaveText('Could not copy. Select and copy the command above.');
await page.screenshot({path:`${out}/clipboard-denied.png`,fullPage:true});
await writeFile(`${out}/system-and-clipboard.json`,JSON.stringify({systemTheme:{dark,light},clipboardDenied:'Manual-copy instructions visible; install command remains selectable'},null,2));
}finally{await browser.close()}
