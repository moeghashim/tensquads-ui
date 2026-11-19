import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFile} from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7SCAZZ83964P5NRZ0Y9YC0K';
const results=[];
const browser=await chromium.launch();
async function scenario(name,fn){try{await fn();results.push({name,result:'pass'});console.log('PASS '+name)}catch(e){results.push({name,result:'fail',error:e.stack});console.error('FAIL '+name+' '+e.message)}}
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
const run=Date.now();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
async function shot(name,locator){await (locator||page).screenshot({path:`${evidence}/${name}.png`,animations:'disabled',...(locator?{}:{fullPage:true})})}
try{
await scenario('Production /chat frameless thread and inline form in English/Arabic, light/dark, desktop/mobile',async()=>{
 for(const locale of ['en','ar'])for(const theme of ['light','dark'])for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});await page.goto(`http://127.0.0.1:5173/chat?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}`);
  const approve=page.getByRole('button',{name:locale==='en'?'Approve plan':'اعتماد الخطة',exact:true});await expect(approve).toBeVisible();await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('.chat-demo__surface .ts-chat__header')).toHaveCount(0);
  await expect(page.locator('.ts-chat__assistant')).toHaveCount(1);
  const style=await page.locator('.chat-demo__surface').evaluate(el=>{const s=getComputedStyle(el);return {border:s.borderTopWidth,bg:s.backgroundColor}});expect(style.border).toBe('0px');expect(style.bg).toBe('rgba(0, 0, 0, 0)');
  const reply=await page.locator('.ts-chat__assistant').evaluate(el=>{const s=getComputedStyle(el);return {border:s.borderTopWidth,bg:s.backgroundColor}});expect(reply).toEqual({border:'0px',bg:'rgba(0, 0, 0, 0)'});
  const composer=page.locator('.ts-chat__composer');const bounds=await composer.boundingBox();expect(bounds.width).toBeLessThanOrEqual(768);const curve=await composer.evaluate(el=>parseFloat(getComputedStyle(el).borderTopLeftRadius));expect(curve).toBeGreaterThanOrEqual(bounds.height/2-2);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await shot(`thread-${locale}-${theme}-${width}`);
  if(width===390){const a11y=await new AxeBuilder({page}).analyze();expect(a11y.violations).toEqual([])}
  const field=page.getByRole('textbox',{name:locale==='en'?'Store name':'اسم المتجر'});await field.fill(locale==='en'?'Northstar Goods':'متجر الندى');await approve.click();
  await expect(field).toBeDisabled();await expect(page.locator('.ts-chat__assistant')).toHaveCount(2);await expect(page.locator('.ts-chat__user-message').last()).toHaveText(locale==='en'?'Approve plan':'اعتماد الخطة');
  await expect(page.locator('.ts-chat__assistant').last()).toContainText(locale==='en'?'Northstar Goods':'متجر الندى');
 }
});
await scenario('Production /chat working status transitions to reply, Stop preserves draft, Replay resets, reduced motion completes',async()=>{
 await page.setViewportSize({width:1000,height:1000});await page.goto('http://127.0.0.1:5173/chat?locale=en&dir=ltr&theme=light');
 await expect(page.getByRole('status').filter({hasText:'Working'})).toBeVisible();await shot('production-working',page.locator('.chat-demo__surface'));
 const input=page.getByRole('textbox',{name:'Try a message'});await input.fill('Unsent draft');await page.getByRole('button',{name:'Stop',exact:true}).click();await expect(input).toHaveValue('Unsent draft');await expect(page.locator('.ts-chat__working')).toHaveCount(0);await page.waitForTimeout(1100);await expect(page.locator('.ts-chat__assistant')).toHaveCount(0);
 await page.getByRole('button',{name:'Replay',exact:true}).click();await expect(page.getByRole('button',{name:'Approve plan',exact:true})).toBeVisible();await expect(page.locator('.ts-chat__working')).toHaveCount(0);await expect(page.locator('.ts-chat__user-message')).toHaveCount(1);
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await expect(page.getByRole('button',{name:'Approve plan',exact:true})).toBeVisible();await expect(page.locator('.ts-chat__working')).toHaveCount(0);await page.emulateMedia({reducedMotion:'no-preference'});
});
await scenario('Real exported composer rejects whitespace and IME Enter, supports multiline/long drafts and keyboard send in both directions',async()=>{
 for(const locale of ['en','ar']){
  await page.setViewportSize({width:390,height:900});await page.goto(`http://127.0.0.1:5174/?locale=${locale}&theme=light&session=composer-${locale}-${run}`);const input=page.getByRole('textbox');const send=page.getByRole('button',{name:locale==='en'?'Send':'إرسال',exact:true});
  await expect(input).toHaveAttribute('placeholder',locale==='en'?'Ask anything':'اكتب رسالة');await input.fill('   ');await expect(send).toBeDisabled();await input.press('Enter');await expect(page.locator('.ts-chat__user-message')).toHaveCount(0);
  await input.fill('First line');await input.press('End');await input.press('Shift+Enter');await expect(input).toHaveValue('First line\n');
  await input.dispatchEvent('compositionstart');await input.dispatchEvent('keydown',{key:'Enter',code:'Enter',keyCode:229,isComposing:true,bubbles:true});await expect(page.locator('.ts-chat__user-message')).toHaveCount(0);await input.dispatchEvent('compositionend');
  await input.fill('Long draft '.repeat(150));const b=await input.boundingBox();expect(b.height).toBeLessThanOrEqual(200);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await shot(`composer-long-${locale}`);await input.fill('  Submitted message  ');await input.press('Enter');await expect(page.locator('.ts-chat__user-message')).toHaveText('Submitted message');await expect(input).toHaveValue('');await expect(page.getByRole('button',{name:locale==='en'?'Stop':'إيقاف',exact:true})).toBeVisible();await input.fill('Next draft');await input.press('Enter');await expect(page.locator('.ts-chat__user-message')).toHaveCount(1);await page.getByRole('button',{name:locale==='en'?'Stop':'إيقاف',exact:true}).click();await expect(input).toHaveValue('Next draft');
 }
});
await scenario('Real exported ChatError handles localhost HTTP 503 and Retry recovers without duplicate user turns, localized and reduced motion',async()=>{
 for(const locale of ['en','ar'])for(const theme of ['light','dark']){
  await page.setViewportSize({width:locale==='en'?1000:390,height:900});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(`http://127.0.0.1:5174/?locale=${locale}&theme=${theme}&session=retry-${locale}-${theme}-${run}`);
  await page.getByRole('textbox').fill('Please recover this turn');await page.getByRole('textbox').press('Enter');const working=page.locator('.ts-chat__working-label');await expect(working).toBeVisible();expect(await working.evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
  const alert=page.getByRole('alert');await expect(alert).toContainText(locale==='en'?'Something went wrong':'حدث خطأ');await expect(alert).toContainText('Local service unavailable');await expect(page.locator('.ts-chat__working')).toHaveCount(0);await shot(`error-${locale}-${theme}`);
  await page.getByRole('button',{name:locale==='en'?'Retry':'إعادة المحاولة',exact:true}).click();await expect(alert).toHaveCount(0);await expect(page.getByRole('status')).toBeVisible();await expect(page.locator('.ts-chat__assistant')).toHaveText('Recovered reply complete');await expect(page.locator('.ts-chat__user-message')).toHaveCount(1);await expect(page.locator('.ts-chat__working')).toHaveCount(0);await shot(`retry-recovered-${locale}-${theme}`);
 }
});
expect(errors).toEqual([]);
}finally{await browser.close();await writeFile(`${evidence}/live-results.json`,JSON.stringify({results,pageErrors:errors},null,2))}
if(results.some(r=>r.result!=='pass'))process.exitCode=1;
