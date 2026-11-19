import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7SBF3TJ8J5HSRSXRYXDJ9QM';
const browser=await chromium.launch();
const results=[];
const pageErrors=[];
const states=[];
for(const locale of ['en','ar']) for(const theme of ['light','dark']) for(const width of [1440,390]) states.push({locale,theme,width});
async function run(name,fn) {try { const detail=await fn(); results.push({name,result:'pass',detail}); console.log('PASS',name); } catch(e) {results.push({name,result:'fail',error:e.stack}); console.log('FAIL',name,e.message);}}
try {
 for(const {locale,theme,width} of states) {
  const ar=locale==='ar', dir=ar?'rtl':'ltr', tag=`${locale}-${theme}-${width}`;
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',e=>pageErrors.push({tag,error:e.message}));
  await page.goto(`http://127.0.0.1:5173/chat?locale=${locale}&dir=${dir}&theme=${theme}`);
  const input=page.locator('.ts-chat__textarea');
  const composer=page.locator('.ts-chat__composer');
  const send=page.getByRole('button',{name:ar?'إرسال':'Send',exact:true});
  const approve=page.getByRole('button',{name:ar?'اعتماد الخطة':'Approve plan',exact:true});
  await expect(approve).toBeVisible(); await page.evaluate(()=>document.fonts.ready);
  await run(`compact composer, placeholder, focus and keyboard send ${tag}`,async()=>{
   await expect(input).toHaveAttribute('placeholder',ar?'اكتب رسالة':'Write a message'); await expect(send).toBeDisabled();
   await input.focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); await expect(input).toBeFocused();
   const focus=await composer.evaluate(el=>{const c=getComputedStyle(el),t=getComputedStyle(el.querySelector('textarea'));return {width:c.outlineWidth,offset:c.outlineOffset,color:c.outlineColor,innerStyle:t.outlineStyle};});
   expect(focus).toEqual({width:'2px',offset:'2px',color:theme==='light'?'rgb(1, 105, 204)':'rgb(2, 133, 255)',innerStyle:'none'});
   const t=await input.boundingBox(),s=await send.boundingBox();
   expect(Math.abs(t.y+t.height-s.y-s.height)).toBeLessThanOrEqual(2);
   if(ar) expect(s.x+s.width).toBeLessThanOrEqual(t.x);else expect(t.x+t.width).toBeLessThanOrEqual(s.x);
   await page.screenshot({path:`${evidence}/composer-focus-${tag}.png`,fullPage:true});
   await input.fill(ar?'سطر أول':'First line'); await input.press('End'); await input.press('Shift+Enter'); await expect(input).toHaveValue(ar?'سطر أول\n':'First line\n');
   await page.keyboard.insertText(ar?'سطر ثان':'Second line'); const draft=await input.inputValue(); await input.press('Enter'); await expect(input).toHaveValue('');
   await expect(page.locator('.ts-chat__user-message').last()).toHaveText(draft);
   await expect(page.locator('.ts-chat-reply__markdown').last()).toHaveText(ar?'لا يتصل هذا الموقع بنموذج مباشر. تستخدم المحادثة رداً معدّاً مسبقاً.':'This site has no live model. The chat demo uses a scripted reply.');
   return {focus,textarea:t,send:s,sent:draft};
  });
  await run(`long draft stays bounded; whitespace and IME cannot send ${tag}`,async()=>{
   const before=await page.locator('.ts-chat__user-message').count();
   await input.fill('   ');await expect(send).toBeDisabled();await input.press('Enter');expect(await page.locator('.ts-chat__user-message').count()).toBe(before);
   const long=(ar?'تفاصيل رسالة طويلة لاختبار التفاف النص ':'A long draft to check wrapping and scrolling ').repeat(20)+'\n'+Array(15).fill('More detail').join('\n');
   await input.fill(long);
   const measure=await input.evaluate(el=>({height:el.getBoundingClientRect().height,client:el.clientHeight,scroll:el.scrollHeight}));
   expect(measure.height).toBeLessThanOrEqual(161);expect(measure.scroll).toBeGreaterThan(measure.client);
   const t=await input.boundingBox(),s=await send.boundingBox();expect(Math.abs(t.y+t.height-s.y-s.height)).toBeLessThanOrEqual(2);
   await input.dispatchEvent('compositionstart',{data:'文'});await input.dispatchEvent('keydown',{key:'Enter',code:'Enter',isComposing:true,keyCode:229});
   await expect(input).toHaveValue(long);expect(await page.locator('.ts-chat__user-message').count()).toBe(before);await input.dispatchEvent('compositionend',{data:'文'});
   const dims=await page.evaluate(()=>({w:document.documentElement.clientWidth,sw:document.documentElement.scrollWidth,cw:document.querySelector('.ts-chat__composer').clientWidth,csw:document.querySelector('.ts-chat__composer').scrollWidth}));expect(dims.sw).toBeLessThanOrEqual(dims.w);expect(dims.csw).toBeLessThanOrEqual(dims.cw);
   await page.screenshot({path:`${evidence}/composer-long-${tag}.png`,fullPage:true});
   await input.fill('');await expect(send).toBeDisabled();
   return {measure,dims};
  });
  await run(`spaced conversation and inline form submit preserves values and locks ${tag}`,async()=>{
   const card=page.locator('.ts-chat-reply__openui').filter({has:page.locator('.ts-form')});
   const field=page.getByRole('textbox',{name:ar?'اسم المتجر':'Store name',exact:true});
   await field.scrollIntoViewIfNeeded();
   const geometry=await card.evaluate(el=>{const c=getComputedStyle(el); const r=el.getBoundingClientRect();return {width:r.width,parent:el.parentElement.getBoundingClientRect().width,padding:parseFloat(c.paddingInlineStart),border:c.borderTopWidth,radius:c.borderTopLeftRadius};});
   expect(geometry.width).toBeLessThanOrEqual(480);expect(geometry.width).toBeLessThanOrEqual(geometry.parent+1);expect(geometry.padding).toBeGreaterThan(0);expect(geometry.border).toBe('1px');expect(parseFloat(geometry.radius)).toBeGreaterThan(0);
   const controls=await card.locator('input,button,[role=switch],[role=radiogroup]').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width};}));
   const cr=await card.boundingBox();for(const c of controls){expect(c.left).toBeGreaterThanOrEqual(cr.x);expect(c.right).toBeLessThanOrEqual(cr.x+cr.width+1);}
   const gaps=await page.locator('.ts-chat__log-content').evaluate(el=>{const c=[...el.children].map(x=>x.getBoundingClientRect());return c.slice(1).map((r,i)=>r.top-c[i].bottom);});for(const gap of gaps)expect(gap).toBeGreaterThan(0);
   await page.screenshot({path:`${evidence}/inline-form-${tag}.png`,fullPage:true});
   await field.fill(ar?'متجر الندى':'Northstar Goods'); const email=page.getByRole('switch',{name:ar?'أرسل إليّ إشعاراً عند الانتهاء':'Email me when done'});await email.press('Space');
   const monthly=page.getByRole('radio',{name:ar?'شهري':'Monthly',exact:true});await monthly.click();await approve.press('Enter');
   await expect(page.locator('.ts-chat-reply__markdown').last()).toHaveText(ar?'تم اعتماد خطة متجر الندى. سأرسل تحديثات شهري. إشعارات البريد غير مفعّلة.':'Plan approved for Northstar Goods. I will send Monthly updates. Email notifications are off.');
   await expect(field).toBeDisabled();await expect(email).toBeDisabled();await expect(monthly).toBeDisabled();await expect(approve).toBeDisabled();await expect(monthly).toBeChecked();await expect(email).not.toBeChecked();
   await expect(page.locator('.ts-chat__user-message').last()).toHaveText(ar?'اعتماد الخطة':'Approve plan');
   const audit=await new AxeBuilder({page}).analyze();expect(audit.violations).toEqual([]);
   await page.screenshot({path:`${evidence}/approved-${tag}.png`,fullPage:true});
   return {geometry,gaps,controls,accessibilityViolations:audit.violations};
  });
  await run(`attachment and send remain reachable in compact gallery composer ${tag}`,async()=>{
   await page.goto(`http://127.0.0.1:5173/components/Chat?locale=${locale}&dir=${dir}&theme=${theme}`);
   const input=page.getByRole('textbox',{name:ar?'رسالة':'Message',exact:true}); await expect(input).toBeVisible();await input.fill('Draft with attachment');
   await input.press('Tab');await expect(page.getByRole('button',{name:ar?'إرفاق ملف':'Attach file'})).toBeFocused();await page.keyboard.press('Tab');await expect(send).toBeFocused();
   const noOverlap=await composer.evaluate(el=>{const nodes=[el.querySelector('textarea'),...el.querySelectorAll('button')];const r=nodes.map(n=>n.getBoundingClientRect());return r.every((a,i)=>r.every((b,j)=>i===j||a.right<=b.left+1||b.right<=a.left+1||a.bottom<=b.top+1||b.bottom<=a.top+1));});expect(noOverlap).toBe(true);
   await composer.screenshot({path:`${evidence}/attachment-${tag}.png`});await send.press('Space');await expect(input).toHaveValue('');
   return {noOverlap,keyboardOrder:'textarea, attachment, send'};
  });
  await context.close();
 }
} finally {await browser.close();await writeFile(`${evidence}/live-results.json`,JSON.stringify({oracle:'Author intent: polish composer, spacing and inline forms; Chat.md keyboard/resize/localization contract; PLAN D8/D23 direction and action locking. Geometry rejects overlapping, clipped or oversized controls.',results,pageErrors},null,2));}
if(results.some(r=>r.result==='fail')||pageErrors.length)process.exitCode=1;
