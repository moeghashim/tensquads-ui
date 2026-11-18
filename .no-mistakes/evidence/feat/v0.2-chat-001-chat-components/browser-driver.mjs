import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7RCHHQ9B9S1Q0SD2JGD56J4';
const browser=await chromium.launch({headless:true});
const results=[];
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',e=>{results.push({pageerror:e.message})});
 const wait=()=>page.waitForTimeout(150);
 for(const locale of ['en','ar']) {
  await page.goto('http://127.0.0.1:5174/?locale='+locale); await page.getByRole('log').waitFor(); await wait();
  const input=page.getByRole('textbox'),send=page.getByRole('button',{name:locale==='ar'?'إرسال':'Send',exact:true});
  assert(await send.isDisabled()); await input.fill('   '); assert(await send.isDisabled());
  await input.fill('First line'); await input.press('End'); await input.press('Shift+Enter'); assert.equal(await input.inputValue(),'First line\n');
  await input.type('Second line'); await input.press('Enter'); assert.equal(await input.inputValue(),'');
  assert.equal(await page.getByLabel('Sent messages').textContent(),'["First line\\nSecond line"]'); assert(await input.evaluate(el=>el===document.activeElement));
  await input.fill('こんにちは');
  await input.dispatchEvent('compositionstart',{data:''});
  await input.dispatchEvent('keydown',{key:'Enter',code:'Enter',isComposing:true,bubbles:true,cancelable:true});
  assert.equal(await input.inputValue(),'こんにちは'); assert.equal(await page.getByLabel('Sent messages').textContent(),'["First line\\nSecond line"]');
  await input.dispatchEvent('compositionend',{data:'こんにちは'}); await input.press('Enter');
  assert.equal(await input.inputValue(),''); assert((await page.getByLabel('Sent messages').textContent()).includes('こんにちは'));
  await input.fill('Click send'); await send.click(); assert((await page.getByLabel('Sent messages').textContent()).includes('Click send'));
  await input.fill('Line\n'.repeat(60)); await wait();
  const dimensions=await input.evaluate(el=>({height:el.clientHeight,scroll:el.scrollHeight}));assert(dimensions.height<=160);assert(dimensions.scroll>dimensions.height);
  await input.fill('Hold while busy'); await page.getByRole('button',{name:'Start run',exact:true}).click(); await input.press('Enter'); assert.equal(await input.inputValue(),'Hold while busy');
  const stop=page.getByRole('button',{name:locale==='ar'?'إيقاف':'Stop',exact:true}); assert(await stop.isVisible());
  await input.focus(); await input.press('Tab'); assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'Attach'); await page.keyboard.press('Tab'); assert(await stop.evaluate(el=>el===document.activeElement)); await page.keyboard.press('Enter');
  assert.equal(await page.getByLabel('Stop count').textContent(),'1'); await wait();
  const afterStop={value:await input.inputValue(),messages:await page.getByLabel('Sent messages').textContent(),enabled:await send.isEnabled()};
  results.push({scenario:'Keyboard Enter on Stop must only stop, preserving the pending draft',locale,afterStop,result:afterStop.value==='Hold while busy'&&!afterStop.messages.includes('Hold while busy')?'pass':'fail'});
  await page.screenshot({path:evidence+'/stop-enter-'+locale+'.png',fullPage:true});
  await input.fill('Click Stop draft'); await page.getByRole('button',{name:'Start run',exact:true}).click(); await page.getByRole('button',{name:locale==='ar'?'إيقاف':'Stop',exact:true}).click(); await wait();
  results.push({scenario:'Pointer click Stop must only stop, preserving the pending draft',locale,value:await input.inputValue(),messages:await page.getByLabel('Sent messages').textContent(),stopCount:await page.getByLabel('Stop count').textContent(),result:(await input.inputValue())==='Click Stop draft'?'pass':'fail'});
  await input.focus();const ring=await input.evaluate(el=>{const s=getComputedStyle(el.closest('form'));return [s.outlineWidth,s.outlineOffset,s.outlineColor]});assert.deepEqual(ring,['2px','2px',locale==='ar'?'rgb(2, 133, 255)':'rgb(1, 105, 204)']);
  await page.screenshot({path:evidence+'/composer-'+locale+'.png',fullPage:true});
  results.push({scenario:'Composer keyboard, simulated IME, empty/whitespace guard, click Send, busy send guard, Tab focus and 160px growth',locale,dimensions,ring,result:'pass'});

 }
 assert(!results.some(r=>r.pageerror)); if(results.some(r=>r.result==='fail'))process.exitCode=1;
} catch(error){results.push({failure:error.stack});process.exitCode=1}finally{await browser.close();await writeFile(evidence+'/live-chat-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2))}
