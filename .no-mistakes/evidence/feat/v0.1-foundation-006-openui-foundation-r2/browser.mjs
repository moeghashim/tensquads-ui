import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7P6ZFRFASWJ737ZXMFT71EQ';
const browser=await chromium.launch({headless:true});
try {
const page=await browser.newPage({viewport:{width:1000,height:700}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const log=[];
for(const [locale,dir,message] of [['en','ltr','OpenUI fixture rendered in English'],['ar','rtl','تم عرض عينة OpenUI باللغة العربية']]) {
await page.goto(`http://localhost:5173/?locale=${locale}&dir=${dir}&theme=light`);
await page.getByRole('link',{name:'Example',exact:true}).click();
await page.getByText(message,{exact:true}).waitFor();
assert.equal(await page.locator('html').getAttribute('dir'),dir);
await page.screenshot({path:`${evidence}/preview-${locale}.png`,fullPage:true});
log.push(`${locale}: gallery Example link navigated to ${page.url()}; localized fixture visible with ${dir} document direction.`);
await page.getByRole('link',{name:'Back to gallery'}).click();
await page.getByRole('link',{name:'Example',exact:true}).waitFor();
}
await page.goto('http://localhost:5173/components/Unknown?locale=ar&dir=rtl&theme=light');
await page.getByText('No ar OpenUI fixture is registered for this component.',{exact:true}).waitFor();
await page.screenshot({path:`${evidence}/preview-missing.png`,fullPage:true});
log.push('Unknown component route renders the Arabic-locale missing-fixture message without a crash.');
assert.deepEqual(errors,[]);log.push('No uncaught browser page errors.');
await writeFile(`${evidence}/browser.txt`,log.join('\n')+'\n');console.log(log.join('\n'));
}finally{await browser.close();}
