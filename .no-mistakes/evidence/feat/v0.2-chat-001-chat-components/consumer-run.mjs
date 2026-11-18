import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {writeFile, mkdir, copyFile} from 'node:fs/promises';
import {chromium, expect} from '@playwright/test';
const require=createRequire(new URL('../apps/preview/package.json',import.meta.url));
const {createServer}=await import(pathToFileURL(require.resolve('vite')).href);
const evidence='~/.no-mistakes/evidence/01M7RCHHQ9B9S1Q0SD2JGD56J4';
await mkdir(evidence,{recursive:true});
const observations=[];
let browser,server;
try{
server=await createServer({configFile:false,root:process.cwd(),server:{host:'127.0.0.1',port:0,fs:{allow:[process.cwd()]}}});await server.listen();
browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1440,height:900}});
page.on('pageerror',e=>observations.push({pageerror:String(e)}));
const base=server.resolvedUrls.local[0];
for(const locale of ['en','ar']){
await page.goto(base+'.local-chat-validation/?locale='+locale);
const input=page.getByRole('textbox',{name:locale==='ar'?'رسالة':'Message'});
const send=page.getByRole('button',{name:locale==='ar'?'إرسال':'Send',exact:true});
const events=()=>page.getByRole('status',{name:'Events'}).textContent().then(JSON.parse);
await expect(input).toBeVisible();
await expect(send).toBeDisabled();await input.fill('   ');await input.press('Enter');expect((await events()).sent).toEqual([]);await expect(send).toBeDisabled();
// Keyboard movement starts from the header and reaches the composer through its real controls.
await page.getByRole('button',{name:locale==='ar'?'محادثة جديدة':'New chat'}).focus();
await page.keyboard.press('Enter');expect((await events()).resets).toBe(1);
await input.focus();await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Attach',exact:true})).toBeFocused();await page.keyboard.press('Shift+Tab');await expect(input).toBeFocused();
const ring=await page.locator('.ts-chat__composer').evaluate(el=>{const s=getComputedStyle(el);return {width:s.outlineWidth,offset:s.outlineOffset,color:s.outlineColor,token:s.getPropertyValue('--ts-ring').trim()}});
expect(ring.width).toBe('2px');expect(ring.offset).toBe('2px');
const small=await input.evaluate(el=>el.getBoundingClientRect().height);
await input.fill(Array.from({length:30},(_,i)=>'Line '+i).join('\n'));
await expect.poll(()=>input.evaluate(el=>el.getBoundingClientRect().height)).toBe(160);
const dimensions=await input.evaluate(el=>({height:el.clientHeight,scroll:el.scrollHeight}));expect(dimensions.scroll).toBeGreaterThan(dimensions.height);expect(small).toBeLessThan(160);
await input.fill('First');await input.press('End');await input.press('Shift+Enter');await page.keyboard.type('Second');await expect(input).toHaveValue('First\nSecond');expect((await events()).sent).toEqual([]);await input.press('Enter');expect((await events()).sent).toEqual(['First\nSecond']);await expect(input).toHaveValue('');await expect(input).toBeFocused();
await input.fill('');
const cdp=await page.context().newCDPSession(page);
await cdp.send('Input.imeSetComposition',{text:'こんにちは',selectionStart:5,selectionEnd:5});
await input.press('Enter');expect((await events()).sent).toHaveLength(1);
await cdp.send('Input.insertText',{text:'こんにちは'});await input.press('Enter');expect((await events()).sent).toEqual(['First\nSecond','こんにちは']);await cdp.detach();
observations.push({locale,scenario:'keyboard, IME, blank-send, focus and textarea growth',events:await events(),ring,textarea:dimensions});
await page.getByRole('button',{name:'Start busy'}).click();await input.fill('Pending synthetic draft');await input.press('Enter');expect((await events()).sent).toHaveLength(2);await page.getByRole('button',{name:locale==='ar'?'إيقاف':'Stop',exact:true}).click();expect((await events()).stops).toBe(1);expect((await events()).sent).toHaveLength(2);await expect(input).toHaveValue('Pending synthetic draft');
await input.fill('');
// No ChatLog rerender is needed for this nested child's own state update.
const log=page.getByRole('log');const geometry=()=>log.evaluate(el=>({top:el.scrollTop,height:el.scrollHeight,viewport:el.clientHeight,bottom:el.scrollHeight-el.clientHeight-el.scrollTop}));
await log.evaluate(el=>{el.scrollTop=el.scrollHeight});await expect.poll(async()=>(await geometry()).bottom).toBeLessThanOrEqual(1);
const before=await geometry();await page.getByRole('button',{name:'Grow nested reply'}).click();await expect.poll(async()=>(await geometry()).height).toBeGreaterThan(before.height);await expect.poll(async()=>(await geometry()).bottom).toBeLessThanOrEqual(1);const after=await geometry();
// Scroll with a real wheel so the reader's action unpins the log.
await log.hover();await page.mouse.wheel(0,-500);await expect.poll(async()=>(await geometry()).bottom).toBeGreaterThan(100);const up=await geometry();await page.getByRole('button',{name:'Grow nested reply'}).click();await expect.poll(async()=>(await geometry()).height).toBeGreaterThan(after.height);const preserved=await geometry();expect(Math.abs(preserved.top-up.top)).toBeLessThanOrEqual(1);
await log.evaluate(el=>{el.scrollTop=el.scrollHeight});await expect.poll(async()=>(await geometry()).bottom).toBeLessThanOrEqual(1);await page.getByRole('button',{name:'Grow nested reply'}).click();await expect.poll(async()=>(await geometry()).height).toBeGreaterThan(preserved.height);await expect.poll(async()=>(await geometry()).bottom).toBeLessThanOrEqual(1);
observations.push({locale,scenario:'follow nested content, preserve reader position, resume following',before,after,up,preserved,resumed:await geometry()});
await page.getByRole('button',{name:'Reply action',exact:true}).click();expect((await events()).clicks).toBe(1);
await expect(page.getByText('resp_live',{exact:true})).toBeVisible();await expect(page.getByText(locale==='ar'?'معاينة الوكيل':'Preview your agent',{exact:true})).toBeVisible();
await page.emulateMedia({reducedMotion:'reduce'});expect(await page.locator('.ts-chat__spinner').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
await input.fill('long_unbroken_message_'.repeat(30));await input.press('Enter');expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
await log.evaluate(el=>{el.scrollTop=0});await page.screenshot({path:evidence+'/chat-consumer-'+locale+'-390.png',fullPage:true,animations:'disabled'});
observations.push({locale,scenario:'arbitrary reply action, states, reduced motion and mobile overflow',events:await events(),spinner:'animation none',documentWidth:await page.evaluate(()=>document.documentElement.scrollWidth)});
await page.setViewportSize({width:1440,height:900});
}
await copyFile('test-results/screenshots/chat-en-light-1440.png',evidence+'/chat-en-light-1440.png');await copyFile('test-results/screenshots/chat-ar-dark-390.png',evidence+'/chat-ar-dark-390.png');
observations.push({result:'All disposable consumer assertions passed'});
}catch(e){observations.push({failure:String(e),stack:e.stack});process.exitCode=1;}
finally{if(browser)await browser.close();if(server)await server.close();await writeFile(evidence+'/chat-live-observations.json',JSON.stringify(observations,null,2));console.log(JSON.stringify(observations,null,2));}
