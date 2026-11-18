import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
const req=createRequire(new URL('../apps/preview/package.json',import.meta.url));
const {createServer}=await import(pathToFileURL(req.resolve('vite')));
const {default:react}=await import(pathToFileURL(req.resolve('@vitejs/plugin-react')));
const evidence='~/.no-mistakes/evidence/01M7RCJYCNAFA7FG3E3MGJ80MJ';
const server=await createServer({configFile:false,root:process.cwd()+'/.local-test',plugins:[react()],server:{host:'127.0.0.1',port:0,fs:{allow:[process.cwd()]}}});
let browser;const results=[];const pageErrors=[];
async function scenario(name, fn){try{const details=await fn();results.push({name,result:'pass',details});console.log('PASS',name);}catch(e){results.push({name,result:'fail',error:e.stack});console.error('FAIL',name,e.message);}}
try {
 await server.listen();browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1000,height:850}});page.on('pageerror',e=>pageErrors.push(e.message));
 await page.goto(server.resolvedUrls.local[0]);await page.waitForFunction(()=>!!window.renderReply);await page.evaluate(()=>document.fonts.ready);
 const render=async(reply,locale='en')=>page.evaluate(({reply,locale})=>{document.documentElement.lang=locale;document.documentElement.dir=locale==='ar'?'rtl':'ltr';window.errors=[];window.renderReply(reply,locale);},{reply,locale});
 const screenshot=async(name)=>page.screenshot({path:`${evidence}/${name}.png`,fullPage:true});
 await scenario('Local React consumer streams both localized fixtures character by character, preserves UI nodes and focused links',async()=>{
  const details=[];
  for(const locale of ['en','ar']){
   const reply=await readFile(`packages/ui/src/react/ChatReply/ChatReply.fixture.${locale}.txt`,'utf8');
   await render('',locale);
   const frames=await page.evaluate(async({reply,locale})=>{let frames=0;for(let i=1;i<=reply.length;i++){window.renderReply(reply.slice(0,i),locale);await new Promise(requestAnimationFrame);const text=document.querySelector('.ts-chat-reply').textContent;if(text.includes('```')||text.includes('openui'))throw Error(`fence leaked at ${i}: ${text}`);frames++;}return frames;},{reply,locale});
   assert.equal(await page.locator('.ts-chat-reply__openui').count(),2);
   assert.equal(await page.getByRole('button',{name:locale==='ar'?'متابعة':'Continue',exact:true}).count(),1);
   const order=await page.locator('.ts-chat-reply').evaluate(el=>[...el.children].map(x=>x.classList.contains('ts-chat-reply__openui')?'ui':'text'));
   assert.deepEqual(order,['text','ui','text','ui','text']);
   await page.evaluate(()=>{window.savedBadge=document.querySelector('.ts-chat-reply__openui');});
   await render(reply+'\nMore details',locale);
   assert.equal(await page.evaluate(()=>window.savedBadge===document.querySelector('.ts-chat-reply__openui')),true);
   await screenshot(`stream-final-${locale}`);details.push({locale,frames,order});
  }
  for(const prefix of ['', '- ']){
   await render(prefix+'[runbook](https://example.com)');await page.getByRole('link',{name:'runbook'}).focus();await render(prefix+'[runbook](https://example.com)\nMore');
   assert.equal(await page.getByRole('link',{name:'runbook'}).evaluate(el=>el===document.activeElement),true);
  }
  const open='Status\n\n```openui\nroot = Badge("Ready", "success")';await render(open);assert.equal(await page.locator('.ts-chat-reply__openui').innerText(),'Ready');await screenshot('stream-open-fence');
  assert.deepEqual(pageErrors,[]);return {details,openFence:'Ready rendered before closing fence',focus:'retained in root and list paragraphs'};
 });
 await scenario('Local React consumer renders markdown safely, keeping code LTR and HTML inert',async()=>{
  const reply=['# Markdown safety','Paragraph with **strong** and `inline()`.', '[HTTP](http://example.com) [HTTPS](https://example.com/a_(b)) [Email](mailto:test@example.com)','[JS](javascript:alert(1)) [Data](data:text/html,test) [File](file:///etc/passwd) [Relative](/path)','<img src=x onerror="window.compromised=true"><script>window.compromised=true</script>','','```js','    const long = "'+ 'x'.repeat(250)+'";','```'].join('\n');
  await render(reply,'ar');assert.equal(await page.locator('.ts-chat-reply h1').textContent(),'Markdown safety');
  assert.equal(await page.locator('.ts-chat-reply strong').textContent(),'strong');assert.equal(await page.locator('.ts-chat-reply p code').textContent(),'inline()');
  assert.deepEqual(await page.locator('.ts-chat-reply a').evaluateAll(a=>a.map(x=>x.getAttribute('href'))),['http://example.com','https://example.com/a_(b)','mailto:test@example.com']);
  assert.equal(await page.locator('.ts-chat-reply img,.ts-chat-reply script').count(),0);assert.equal(await page.evaluate(()=>!!window.compromised),false);
  assert.equal(await page.locator('.ts-chat-reply pre').getAttribute('dir'),'ltr');assert.equal(await page.locator('.ts-chat-reply pre').evaluate(e=>getComputedStyle(e).direction),'ltr');
  await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),true);
  await screenshot('markdown-safety-ar-mobile');await page.setViewportSize({width:1000,height:850});return {safeLinks:3,unsafeLinks:4,rawHtml:'literal text',code:'LTR; long line scrolls within block'};
 });
 await scenario('Local React consumer preserves loose, nested and lazy list structure with streamed code and embedded OpenUI',async()=>{
  const cases=[];
  for(const marker of ['- ','3. '])for(const nested of [false,true]){
   const pad=nested?'  ':'';const lead=nested?'- Parent\n':'';const indent=' '.repeat(marker.length);
   const body=lead+pad+marker+'Example:\n'+pad+indent+'Details\n\n'+pad+indent+'```python\n'+pad+indent+'    print(1)';
   await render(body);assert.equal(await page.locator('pre code').textContent(),'    print(1)');
   await render(body+'\n'+pad+indent+'```');assert.equal(await page.locator('pre code').textContent(),'    print(1)');
   cases.push({marker,nested,code:'    print(1)'});
  }
  const mixed='3. Check\n\n   ```openui\n   root = Badge("Ready", "success")\n   ```\n\n   Continue\n\n1. Finish\ncontinued\n\n- Parent\n\n  - Child\n  - Next child\n- Sibling';
  await render(mixed);assert.equal(await page.locator('.ts-chat-reply__markdown > ol').count(),1);assert.equal(await page.locator('.ts-chat-reply ol').getAttribute('start'),'3');assert.equal(await page.locator('.ts-chat-reply ol > li').count(),2);assert.match(await page.locator('.ts-chat-reply ol > li').nth(0).innerText(),/Ready[\s\S]*Continue/);assert.match(await page.locator('.ts-chat-reply ol > li').nth(1).innerText(),/Finish continued/);assert.equal(await page.locator('.ts-chat-reply__markdown > ul > li').count(),2);assert.equal(await page.locator('.ts-chat-reply ul > li > ul > li').count(),2);await screenshot('lists-openui-context');
  for(const marker of ['- ','3. '])for(const fence of ['```','~~~']){
   const indent=' '.repeat(marker.length);
   const literal=marker+'Example:\n'+indent+'  '+fence+'text\n'+indent+'    '+fence+'\n'+indent+'  - literal\n'+indent+'  '+fence+'\n\n```openui\nroot = Badge("Live", "success")\n```';
   await render(literal);assert.equal(await page.locator('.ts-chat-reply__openui').count(),1);assert.equal(await page.locator('li .ts-chat-reply__openui').count(),0);assert.match(await page.locator('pre code').textContent(),/- literal/);assert.equal(await page.locator('.ts-chat-reply__openui').innerText(),'Live');
  }
  await screenshot('literal-fence-isolation');return {codeCases:cases,mixedList:'single ordered list starts at 3; embedded badge and continuation remain in first item; lazy continuation in second',literalFences:'backtick and tilde in ordered/unordered lists remain inert; following OpenUI renders at root'};
 });
 await scenario('Local React consumer updates a 1000-item streaming list without losing items',async()=>{
  const reply=Array.from({length:1000},(_,i)=>`${i+1}. Item ${i+1}`).join('\n');
  const times=await page.evaluate(reply=>{const times=[];for(let i=0;i<5;i++){const start=performance.now();window.renderReply(reply+'\ncontinued '+i);times.push(performance.now()-start);}return times;},reply);
  assert.equal(await page.locator('.ts-chat-reply ol > li').count(),1000);assert.match(await page.locator('.ts-chat-reply ol > li').last().innerText(),/Item 1000 continued 4/);assert.ok(Math.max(...times)<3000,JSON.stringify(times));return {items:1000,renderMilliseconds:times};
 });
 await scenario('Local public prompt API emits English and Arabic chat examples that render, preserving default UI mode',async()=>{
  const details=[];
  for(const locale of ['en','ar']){
   const output=await page.evaluate(locale=>({chat:window.promptOutput(locale,'chat'),implicit:window.promptOutput(locale),ui:window.promptOutput(locale,'ui')}),locale);
   assert.equal(output.implicit,output.ui);assert.notEqual(output.chat,output.ui);assert.ok(output.chat.includes('```openui'));
   await writeFile(`${evidence}/prompt-chat-${locale}.txt`,output.chat);
   const example=output.chat.match(/```openui\n([\s\S]*?)\n```/);assert.ok(example,'closed example block');await render(example[0],locale);assert.equal(await page.locator('.ts-chat-reply__openui').innerText(),locale==='ar'?'جاهز':'Ready');details.push({locale,defaultMatchesUi:true,exampleBadge:await page.locator('.ts-chat-reply__openui').innerText()});
  }return details;
 });
 await scenario('Built local preview documents ChatReply usage in English and Arabic',async()=>{
  const details=[];for(const locale of ['en','ar']){await page.goto(`http://127.0.0.1:5173/components/ChatReply?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=light`);await page.getByRole('button',{name:locale==='ar'?'متابعة':'Continue',exact:true}).waitFor();assert.equal(await page.locator('.markdown-document').getByRole('heading',{name:locale==='ar'?'الاستخدام':'Usage',exact:true}).count(),1);await screenshot(`docs-${locale}`);details.push({locale,usage:'visible'});}return details;
 });
}finally{await browser?.close();await server.close();await writeFile(`${evidence}/live-results.json`,JSON.stringify({results,pageErrors},null,2));}
if(results.some(r=>r.result==='fail'))process.exitCode=1;
