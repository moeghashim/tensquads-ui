import { chromium, expect } from '{run-worktree}/node_modules/@playwright/test/index.mjs';
import { writeFile } from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7SGN85CEMHWV4VJPTQ5Q8T8';
const browser=await chromium.launch({headless:true});
const results=[];
const page=await browser.newPage();
const errors=[];
page.on('pageerror', error=>errors.push(error.message));
async function open(locale,theme='light',width=1440){
 await page.setViewportSize({width,height:1000});
 await page.goto(`http://127.0.0.1:5173/chat?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}`);
 await page.evaluate(()=>document.fonts.ready);
 await expect(page.getByRole('button',{name:locale==='ar'?'اعتماد الخطة':'Approve plan',exact:true})).toBeEnabled();
}
async function screenshot(name){await page.screenshot({path:`${evidence}/${name}.png`,fullPage:true,animations:'disabled'});}
async function run(name,fn){try{await fn();results.push({name,result:'pass'});}catch(e){results.push({name,result:'fail',error:e.stack}); await screenshot('failure-'+results.length);}}
try{
 await run('Scroll chat without edge fading; desktop/mobile, English/Arabic, light/dark',async()=>{
  for(const locale of ['en','ar']) for(const theme of ['light','dark']) for(const width of [1440,390]){
   await open(locale,theme,width);
   const composer=page.getByRole('textbox',{name:locale==='ar'?'جرّب إرسال رسالة':'Try a message',exact:true});
   for(let i=0;i<3;i++){
    await composer.fill(locale==='ar'?'تحقق من المخزون':'Check inventory');
    await page.getByRole('button',{name:locale==='ar'?'إرسال':'Send',exact:true}).click();
    await expect(page.locator('.ts-chat-reply__markdown').last()).toHaveText(locale==='ar'?'لا يتصل هذا الموقع بنموذج مباشر. تستخدم المحادثة رداً معدّاً مسبقاً.':'This site has no live model. The chat demo uses a scripted reply.');
   }
   const log=page.locator('.ts-chat__log');
   const metrics=await log.evaluate(el=>({mask:getComputedStyle(el).maskImage,overflow:el.scrollHeight>el.clientHeight}));
   expect(metrics.mask).toBe('none'); expect(metrics.overflow).toBe(true);
   await log.evaluate(el=>el.scrollTop=0);
   await expect(log).toHaveJSProperty('scrollTop',0);
   await screenshot(`edges-${locale}-${theme}-${width}-top`);
   await log.evaluate(el=>el.scrollTop=el.scrollHeight);
   const atBottom=await log.evaluate(el=>Math.abs(el.scrollHeight-el.clientHeight-el.scrollTop)<2);
   expect(atBottom).toBe(true);
   await screenshot(`edges-${locale}-${theme}-${width}-bottom`);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
   results.push({state:`${locale}/${theme}/${width}`,metrics});
  }
 });
 await run('Empty and whitespace-only store approvals produce localized readable fallback',async()=>{
  for(const locale of ['en','ar']) for(const value of ['', '   ', '\u00a0\u2003']){
   await open(locale);
   await page.getByRole('textbox',{name:locale==='ar'?'اسم المتجر':'Store name',exact:true}).fill(value);
   await page.getByRole('button',{name:locale==='ar'?'اعتماد الخطة':'Approve plan',exact:true}).click();
   const reply=page.locator('.ts-chat-reply__markdown').last();
   await expect(reply).toHaveText(locale==='ar'?'تم اعتماد خطة متجرك. سأرسل تحديثات أسبوعي. إشعارات البريد مفعّلة.':'Plan approved for your store. I will send Weekly updates. Email notifications are on.');
   await expect(reply.locator('strong')).toHaveCount(3);
   results.push({locale,input:JSON.stringify(value),reply:await reply.innerText()});
   if(value==='')await screenshot(`fallback-${locale}`);
  }
 });
 await run('Submit normal and markdown-like names; retain literal values and show locked Sent record; replay unlocks',async()=>{
  for(const locale of ['en','ar']) for(const store of [locale==='ar'?'متجر الندى':'Northstar Goods','  A **B** {frequency} [shop](https://example.com)  ']){
   await open(locale,'dark');
   const field=page.getByRole('textbox',{name:locale==='ar'?'اسم المتجر':'Store name',exact:true});
   await field.fill(store);
   await page.getByRole('radio',{name:locale==='ar'?'شهري':'Monthly',exact:true}).click();
   await page.getByRole('switch',{name:locale==='ar'?'أرسل إليّ إشعاراً عند الانتهاء':'Email me when done'}).click();
   await expect(page.locator('.ts-chat-reply__locked-note')).toHaveCount(0);
   await page.getByRole('button',{name:locale==='ar'?'اعتماد الخطة':'Approve plan',exact:true}).click();
   const reply=page.locator('.ts-chat-reply__markdown').last();
   await expect(reply).toHaveText(locale==='ar'?`تم اعتماد خطة ${store.trim()}. سأرسل تحديثات شهري. إشعارات البريد غير مفعّلة.`:`Plan approved for ${store.trim()}. I will send Monthly updates. Email notifications are off.`);
   await expect(reply.locator('a,code')).toHaveCount(0);
   await expect(field).toBeDisabled(); await expect(field).toHaveValue(store);
   const note=page.locator('.ts-chat-reply__locked-note');
   await expect(note).toHaveText(locale==='ar'?'أُرسلت':'Sent');
   await note.scrollIntoViewIfNeeded();
   expect(await field.evaluate(el=>getComputedStyle(el).cursor)).toBe('default');
   await screenshot(`sent-${locale}-${store.includes('**')?'literal':'normal'}`);
   await page.getByRole('button',{name:locale==='ar'?'إعادة العرض':'Replay',exact:true}).click();
   await expect(field).toBeEnabled(); await expect(note).toHaveCount(0);
  }
 });
 await run('Header language/theme controls match nav sizing and remain operable on mobile',async()=>{
  await open('en');
  const measures=await page.locator('.site-header').evaluate(el=>({links:[...el.querySelectorAll('.site-nav a')].map(x=>x.getBoundingClientRect().height),controls:[...el.querySelectorAll('.site-controls [data-slot="segmented-control-item"]')].map(x=>x.getBoundingClientRect().height)}));
  expect(measures.controls.length).toBeGreaterThan(0);
  for(const height of measures.controls) expect(Math.abs(height-measures.links[0])).toBeLessThanOrEqual(2);
  results.push({header:measures});
  await page.setViewportSize({width:390,height:1000});
  const radios=page.locator('.site-controls [role="radio"]');
  results.push({headerControls:await radios.allTextContents()});
  await page.getByRole('radio',{name:'Dark',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await screenshot('header-mobile-dark');
 });
 expect(errors).toEqual([]);
}finally{await browser.close(); await writeFile(`${evidence}/chat-live-results.json`,JSON.stringify({results,errors},null,2)); console.log(JSON.stringify({results,errors},null,2));}
if(results.some(x=>x.result==='fail'))process.exitCode=1;
