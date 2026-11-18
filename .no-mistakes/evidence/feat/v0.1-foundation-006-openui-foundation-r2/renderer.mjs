import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch();const log=[];
try {
const page=await browser.newPage();await page.goto('http://localhost:5173/phase-renderer.html');
await page.waitForFunction(()=>typeof window.renderStream==='function');
await expect(page.locator('#root')).toHaveText('');log.push('Null stream renders an empty surface.');
await page.evaluate(()=>window.renderStream('root = Example("Stream'));
await expect(page.locator('#root')).toHaveText('Stream');log.push('Incomplete OpenUI stream displays partial message.');
await page.evaluate(()=>window.renderStream('root = Example("Stream complete")'));
await expect(page.locator('#root')).toHaveText('Stream complete');log.push('Updated complete stream replaces partial text.');
await page.evaluate(()=>window.renderStream('root = Example("hello", "unexpected")'));
await expect(page.locator('#root')).toHaveText('hello');
await page.waitForFunction(()=>window.reportedErrors?.some(e=>e.code==='excess-args'));
log.push('Malformed excess argument stream still displays hello and onError reports excess-args.');
await page.screenshot({path:'~/.no-mistakes/evidence/01M7P6ZFRFASWJ737ZXMFT71EQ/renderer-error.png'});
await page.evaluate(()=>window.renderStream('root = Example("تعافى العارض")','ar'));
await expect(page.locator('#root')).toHaveText('تعافى العارض');
await page.waitForFunction(()=>window.reportedErrors?.length===0);
log.push('Subsequent Arabic stream renders successfully and clears errors.');
await writeFile('~/.no-mistakes/evidence/01M7P6ZFRFASWJ737ZXMFT71EQ/renderer.txt',log.join('\n')+'\n');console.log(log.join('\n'));
}finally{await browser.close();}
