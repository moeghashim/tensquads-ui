import { chromium } from 'playwright';
import { strict as assert } from 'node:assert';
import { writeFile, copyFile, readdir } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
const evidence = '~/.no-mistakes/evidence/01M7R2Y1F6KWW7WEDESC1CABPX';
const browser = await chromium.launch();
const logs = [];
try {
 const context = await browser.newContext({permissions:['clipboard-read','clipboard-write']});
 const page = await context.newPage();
 for (const locale of ['en','ar']) {
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto(`http://127.0.0.1:5173/get-started?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=light`);
  await page.evaluate(()=>document.fonts.ready);
  const blocks = page.locator('.get-started-code');
  for (let i=0;i<5;i++) {
   const block=blocks.nth(i), code=await block.locator('code').innerText();
   await block.getByRole('button').click();
   await page.waitForFunction(()=>navigator.clipboard.readText().then(text=>text.length>0));
   assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),code);
   assert.equal(await block.getByRole('status').innerText(),locale==='en'?'Copied':'تم النسخ');
   logs.push(`${locale}: code block ${i+1} copied verbatim through the browser clipboard (${code.length} characters).`);
  }
  const sample=await blocks.last().locator('code').innerText();
  await writeFile(`.test-cache/worker-${locale}.mjs`,stripTypeScriptTypes(sample));
  const worker=(await import(`./worker-${locale}.mjs`)).default;
  for(const turns of [[],[{role:'assistant',content:'Hello'}],[{role:'user',content:'Hello'},{role:'assistant',content:'Done'}]]) {
   const response=await worker.fetch(new Request('http://localhost/example',{method:'POST',body:JSON.stringify({turns})}),{});
   assert.equal(response.status,400);
   assert.equal(await response.text(),'A user turn is required.');
   logs.push(`${locale}: executed displayed Worker example with ${JSON.stringify(turns)} => 400 A user turn is required. (No API key or provider call.)`);
  }
  const session=await context.newCDPSession(page);
  const browserSession=await browser.newBrowserCDPSession();
  const {browserContextIds}=await browserSession.send('Target.getBrowserContexts');
  await browserSession.send('Browser.setPermission',{permission:{name:'clipboard-write'},setting:'denied',origin:'http://127.0.0.1:5173',browserContextId:browserContextIds[0]});
  const block=blocks.first();
  await block.getByRole('button').click();
  await page.waitForFunction(()=>document.querySelector('.get-started-code__status').textContent.includes('failed')||document.querySelector('.get-started-code__status').textContent.includes('تعذّر'));
  assert.equal(await block.getByRole('status').innerText(),locale==='en'?'Copy failed. Select the code and copy it manually.':'تعذّر النسخ. حدّد الشيفرة وانسخها يدوياً.');
  await block.scrollIntoViewIfNeeded();
  await page.screenshot({path:`${evidence}/clipboard-denied-${locale}.png`,fullPage:false});
  logs.push(`${locale}: browser denied clipboard-write; localized manual-copy fallback displayed and success state cleared.`);
  await browserSession.send('Browser.setPermission',{permission:{name:'clipboard-write'},setting:'granted',origin:'http://127.0.0.1:5173',browserContextId:browserContextIds[0]});
  await session.detach(); await browserSession.detach();
 }
 await context.close();
 for (const name of await readdir('test-results/screenshots')) await copyFile(`test-results/screenshots/${name}`,`${evidence}/${name}`);
 await writeFile(`${evidence}/live-behavior.txt`, logs.join('\n')+'\n');
 console.log(logs.join('\n'));
} finally { await browser.close(); }
