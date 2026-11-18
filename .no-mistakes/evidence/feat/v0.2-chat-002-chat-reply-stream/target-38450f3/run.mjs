import {createServer} from '../apps/preview/node_modules/vite/dist/node/index.js';
import react from '../apps/preview/node_modules/@vitejs/plugin-react/dist/index.js';
import {chromium,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const evidence='~/.no-mistakes/evidence/01M7RCJYCNAFA7FG3E3MGJ80MJ/target-38450f3';
const results=[]; const errors=[];
const server=await createServer({configFile:false,root:resolve('.chat-reply-live'),plugins:[react()],resolve:{dedupe:['react','react-dom']},server:{host:'127.0.0.1',port:5178,strictPort:true,fs:{allow:[process.cwd()]}}});
let browser;
try {
await server.listen();browser=await chromium.launch();const page=await browser.newPage({viewport:{width:900,height:900}});
page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:5178');await page.waitForFunction(()=>typeof window.setReply==='function');
const set=async(reply,locale='en',theme='light')=>page.evaluate(({reply,locale,theme})=>window.setReply(reply,locale,theme),{reply,locale,theme});
const shot=async name=>{await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`${evidence}/${name}.png`,fullPage:true});};
async function scenario(name,fn){try{const detail=await fn();results.push({name,result:'pass',detail});}catch(e){results.push({name,result:'fail',error:e.stack});await shot(`failure-${results.length}`);}await writeFile(`${evidence}/live-browser-results.json`,JSON.stringify({results,errors},null,2));}
await scenario('Localized fixtures stream character by character in reading order and keep fence text hidden',async()=>{
 let prefixes=0;
 for(const locale of ['en','ar']){
 const fixture=await readFile(`packages/ui/src/react/ChatReply/ChatReply.fixture.${locale}.txt`,'utf8');await set('',locale);
 for(let i=1;i<=fixture.length;i++){
 await set(fixture.slice(0,i),locale);
 const visible=await page.locator('#root .ts-chat-reply').innerText();expect(visible).not.toContain('```');expect(visible).not.toContain('root =');prefixes++;
 if(fixture.slice(0,i).endsWith('"success")')){await expect(page.locator('#root .ts-chat-reply__openui').first()).toContainText(locale==='en'?'Ready':'جاهز');await shot(`stream-open-${locale}`);}
 }
 await expect(page.locator('#root .ts-chat-reply__openui')).toHaveCount(2);
 const order=await page.locator('#root .ts-chat-reply').evaluate(el=>Array.from(el.children).map(n=>n.textContent));
 expect(order.length).toBe(5);expect(order[1]).toBe(locale==='en'?'Ready':'جاهز');expect(order[3]).toBe(locale==='en'?'Continue':'متابعة');
 await shot(`stream-complete-${locale}`);
 }
 // A focused link must survive a streaming continuation, including inside lists.
 for(const prefix of ['','- ','1. ','- Parent\n  - ']){
 const text=prefix+'[runbook](https://example.com)';await set(text);await page.getByRole('link',{name:'runbook'}).focus();await set(text+'\nMore');await expect(page.getByRole('link',{name:'runbook'})).toBeFocused();
 }
 return {prefixes,focusCases:4};
});
await scenario('Markdown displays headings lists and LTR code while rejecting unsafe links and raw HTML',async()=>{
 const reply='# Release\n\nParagraph **ready** with `npm run deploy`.\n\n3. Resume\n4. Finish\n\n- Parent\n  - Child\n\n[http](http://example.com) [https](https://example.com) [mail](mailto:help@example.com) [bad](javascript:alert(1)) [data](data:text/html,boom) [relative](/local)\n\n<img src=x onerror="window.compromised=true"><script>window.compromised=true</script>\n\n```js\n    const x = 1;\n```';
 await set(reply,'ar','dark');await expect(page.getByRole('heading',{name:'Release'})).toBeVisible();await expect(page.locator('#root ol')).toHaveAttribute('start','3');await expect(page.locator('#root ul ul li')).toHaveText('Child');
 expect(await page.locator('#root a').evaluateAll(as=>as.map(a=>a.getAttribute('href')))).toEqual(['http://example.com','https://example.com','mailto:help@example.com']);
 expect(await page.locator('#root .ts-chat-reply img,.ts-chat-reply script').count()).toBe(0);expect(await page.evaluate(()=>window.compromised)).toBeUndefined();await expect(page.locator('#root .ts-chat-reply')).toContainText('<img src=x');
 await expect(page.locator('#root pre')).toHaveAttribute('dir','ltr');expect(await page.locator('#root pre code').textContent()).toBe('    const x = 1;');
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);await shot('markdown-safety-ar-dark-mobile');await page.setViewportSize({width:900,height:900});return {safeLinks:3,executableHtmlNodes:0,code:'    const x = 1;'};
});
await scenario('Loose nested and lazy lists retain containers around streamed OpenUI and literal fences',async()=>{
 let cases=0;
 for(const [name,prefix,indent] of [['unordered','- Example:',2],['ordered','3. Example:',3],['nested','- Parent\n  - Example:',4],['nested ordered','- Parent\n  3. Example:',5]]){
 for(const marker of ['```','~~~']){
 const pad=' '.repeat(indent);const code=prefix+'\n'+pad+'  '+marker+'text\n'+pad+'    '+marker+'\n'+pad+'- literal\n'+pad+marker;
 await set(code);expect(await page.locator('#root .ts-chat-reply__openui').count()).toBe(0);
 await set(code+'\n\n```openui\nroot = Badge("Ready", "success")\n```');expect(await page.locator('#root li pre code').textContent()).toBe('  '+marker+'\n- literal');await expect(page.locator('#root .ts-chat-reply > .ts-chat-reply__openui')).toContainText('Ready');cases++;
 }
 }
 for(const reply of ['1. Check\n\n ```openui\nroot = Badge("Ready", "success")\n ```\n\n Continue\n\n1. Finish','- Parent\n\n  3. Check\n\n     ```openui\nroot = Badge("Ready", "success")\n     ```\n\n     Continue\n\n  1. Finish\n\n- Sibling']){
 await set('');for(let i=1;i<=reply.length;i++){await set(reply.slice(0,i));expect(await page.locator('#root .ts-chat-reply').innerText()).not.toContain('```');if(await page.locator('#root .ts-chat-reply__openui').count())expect(await page.locator('#root .ts-chat-reply__openui').evaluate(el=>!!el.closest('li'))).toBe(true);}
 expect(await page.getByText('Continue',{exact:true}).evaluate(el=>el.closest('li')===document.querySelector('.ts-chat-reply__openui').closest('li'))).toBe(true);await expect(page.locator('#root ol > li')).toHaveCount(2);cases++;
 }
 for(const prefix of ['1. First','- First','- Parent\n  1. First']){await set(prefix+'\ncontinued\n'+(prefix.startsWith('1.')?'1. Second':prefix.includes('Parent')?'  1. Second':'- Second'));const li=page.getByText('First continued',{exact:true});await expect(li).toBeVisible();expect(await li.evaluate(el=>!!el.closest('li'))).toBe(true);cases++;}
 for(const [prefix,pad] of [['- Example:', '  '],['3. Example:','   '],['- Parent\n  - Example:','    ']]){
 const initial=prefix+'\n'+pad+'  Details\n\n'+pad+'```python\n'+pad+'    print(1)';await set(initial);expect(await page.locator('#root pre code').textContent()).toBe('    print(1)');await set(initial+'\n'+pad+'```');expect(await page.locator('#root pre code').textContent()).toBe('    print(1)');cases++;}
 await shot('list-openui-boundaries');return {cases};
});
await scenario('A thousand-item ordered reply remains usable when its final item streams',async()=>{
 const list=Array.from({length:1000},(_,i)=>`${i+1}. Item ${i+1}`).join('\n');const elapsed=await page.evaluate(list=>{const t=performance.now();window.setReply(list);return performance.now()-t;},list);await expect(page.locator('#root ol > li')).toHaveCount(1000);
 for(const tail of ['\n\n1. Final','\n\n1. Final `command`'])await set(list+tail);await expect(page.locator('#root ol')).toHaveCount(1);await expect(page.locator('#root ol > li')).toHaveCount(1001);await expect(page.locator('#root li').last()).toHaveText('Final command');await page.locator('#root li').last().scrollIntoViewIfNeeded();await page.screenshot({path:`${evidence}/long-list-final.png`});return {items:1001,initialRenderMs:elapsed};
});
expect(errors).toEqual([]);await writeFile(`${evidence}/live-browser-results.json`,JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors},null,2));if(results.some(r=>r.result==='fail'))process.exitCode=1;
} finally {await browser?.close();await server.close();}
