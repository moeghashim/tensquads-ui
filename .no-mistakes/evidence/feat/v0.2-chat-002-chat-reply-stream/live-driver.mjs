import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile,cp} from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7RCJYCNAFA7FG3E3MGJ80MJ';
await mkdir(evidence,{recursive:true});
await cp('test-results/screenshots',evidence+'/gallery',{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1000,height:900}});
const results=process.env.ONLY?JSON.parse(await readFile(evidence+'/live-results.json','utf8')).results.filter(r=>r.name!==process.env.ONLY):[]; const exceptions=[];
page.on('pageerror',e=>exceptions.push(e.message));
async function render(reply,locale='en'){await page.evaluate(({reply,locale})=>window.renderReply(reply,locale),{reply,locale});}
async function text(){return page.locator('.ts-chat-reply').textContent();}
async function scenario(name,fn){if(process.env.ONLY && name!==process.env.ONLY)return;try{const detail=await fn();results.push({name,result:'pass',detail});}catch(e){results.push({name,result:'fail',error:e.stack});await page.screenshot({path:evidence+'/'+name+'-failure.png',fullPage:true});}}
try{
await page.goto('http://127.0.0.1:5185/.local-chat-validation/');
await page.waitForFunction(()=>typeof window.renderReply==='function');
await scenario('streaming',async()=>{
 let frames=0;
 for(const locale of ['en','ar']){
 const fixture=await readFile('packages/ui/src/react/ChatReply/ChatReply.fixture.'+locale+'.txt','utf8');
 await page.evaluate(locale=>{document.documentElement.lang=locale;document.documentElement.dir=locale==='ar'?'rtl':'ltr'},locale);
 for(let n=1;n<=fixture.length;n++){
 await render(fixture.slice(0,n),locale); const shown=await text();
 assert(!shown.includes('```')&&!shown.includes('openui'),'fence text exposed at '+locale+':'+n);frames++;
 }
 const groups=await page.locator('.ts-chat-reply > *').evaluateAll(ns=>ns.map(n=>n.className));
 assert.deepEqual(groups,['ts-chat-reply__markdown','ts-chat-reply__openui','ts-chat-reply__markdown','ts-chat-reply__openui','ts-chat-reply__markdown']);
 assert.equal(await page.locator('.ts-chat-reply__openui').count(),2);
 await page.getByRole('button',{name:locale==='ar'?'متابعة':'Continue',exact:true}).waitFor();
 await page.screenshot({path:evidence+'/stream-final-'+locale+'.png',fullPage:true});
 const partial='Status\n\n```openui\nroot = Badge("Progressive", "success")';
 await render(partial,locale); await page.getByText('Progressive',{exact:true}).waitFor();
 }
 assert.deepEqual(exceptions,[]);return {frames,unclosedBlock:'Progressive badge visible before closing fence',exceptions};
});
await scenario('markdown-safety',async()=>{
const reply='# Learn C#\n\nParagraph **ready** and `npm run deploy`\n\n3. Resume\n4. Finish\n\n- Parent\n  - Child\n\n```js\n    const x = 1;\n```\n\n[http](http://example.com) [https](https://example.com/topic_(more)) [mail](mailto:a@example.com) [root](/path) [network](//example.com) [script](javascript:alert(1)) [data](data:text/html,test)\n\n<img src=x onerror="alert(1)"><script>alert(1)</script>';
await render(reply,'ar');
assert.equal(await page.locator('h1').textContent(),'Learn C#');
assert.equal(await page.locator('p > code').first().textContent(),'npm run deploy');
assert.equal(await page.locator('.ts-chat-reply ol').getAttribute('start'),'3');
assert.equal(await page.locator('ul > li > ul > li').textContent(),'Child');
assert.equal(await page.locator('.ts-chat-reply pre').getAttribute('dir'),'ltr');
assert.equal(await page.locator('.ts-chat-reply pre code').textContent(),'    const x = 1;');
assert.deepEqual(await page.locator('.ts-chat-reply a').evaluateAll(ns=>ns.map(n=>n.getAttribute('href'))),['http://example.com','https://example.com/topic_(more)','mailto:a@example.com']);
assert.equal(await page.locator('.ts-chat-reply img,.ts-chat-reply script').count(),0);
assert((await text()).includes('<img src=x onerror="alert(1)">'));
await page.screenshot({path:evidence+'/markdown-safety.png',fullPage:true});
return {links:await page.locator('.ts-chat-reply a').allTextContents(),literalHTML:true,code:'    const x = 1;'};
});
await scenario('list-fence-regressions',async()=>{
let cases=0;
for(const marker of ['-','3.'])for(const fence of ['```','~~~']){
const indent=marker==='3.'?'   ':'  ';
const reply=marker+' Example:\n    Details\n\n'+indent+fence+'python\n'+indent+'    print(1)\n'+indent+fence+'\n\n'+marker+' Finish';
await render(reply);assert.equal(await page.locator('li pre code').textContent(),'    print(1)');cases++;
}
for(const prefix of ['- ','3. ','- Parent\n  - ']){
const indent=prefix.includes('Parent')?'    ':prefix==='3. '?'   ':'  ';
const reply=prefix+'```text\n'+indent+'```openui\n'+indent+'root = Badge("Literal", "success")\n'+indent+'```\n\n```openui\nroot = Badge("Live", "success")\n```';
await render(reply);assert.equal(await page.locator('li pre code').textContent(),'```openui\nroot = Badge("Literal", "success")');
assert.equal(await page.locator('.ts-chat-reply__openui').count(),1);await page.getByText('Live',{exact:true}).waitFor();cases++;
}
const reply='1. Check\n\n ```openui\nroot = Badge("Ready", "success")\n ```\n\n Continue\n\n1. Finish';
for(let n=1;n<=reply.length;n++){
await render(reply.slice(0,n));assert(!(await text()).includes('```'));
if(await page.locator('.ts-chat-reply__openui').count())assert.equal(await page.locator('li .ts-chat-reply__openui').count(),1);
}
assert.equal(await page.locator('.ts-chat-reply ol').count(),1);assert.equal(await page.locator('.ts-chat-reply ol > li').count(),2);
assert.equal(await page.locator('.ts-chat-reply ol > li').first().textContent(),'CheckReadyContinue');cases++;
await page.screenshot({path:evidence+'/list-openui-context.png',fullPage:true});
const coords='- Example:\n    ```text\n      ```\n  - literal\n  ```\n\n```openui\nroot = Badge("Ready", "success")\n```';
await render(coords);assert.equal(await page.locator('li pre code').textContent(),'  ```\n- literal');assert.equal(await page.locator('li .ts-chat-reply__openui').count(),0);await page.getByText('Ready',{exact:true}).waitFor();cases++;
return {cases,looseList:'one list with two siblings, UI and continuation stay in first item',fenceCoordinates:'literal markers preserved; following live block outside list'};
});
await scenario('long-list',async()=>{
const reply=Array.from({length:1000},(_,i)=>'1. Step '+(i+1)).join('\n');
const start=performance.now();await render(reply);assert.equal(await page.locator('.ts-chat-reply ol > li').count(),1000);
await render(reply+'\n\n1. Final `command`');assert.equal(await page.locator('.ts-chat-reply ol').count(),1);assert.equal(await page.locator('.ts-chat-reply ol > li').count(),1001);assert.equal(await page.locator('.ts-chat-reply > .ts-chat-reply__markdown > ol > li:last-child code').textContent(),'command');
await page.locator('.ts-chat-reply > .ts-chat-reply__markdown > ol > li:last-child').scrollIntoViewIfNeeded();await page.screenshot({path:evidence+'/long-list-tail.png'});
return {items:1001,elapsedIncludingBrowserRoundTripsMs:Math.round(performance.now()-start),lastItem:await page.locator('.ts-chat-reply > .ts-chat-reply__markdown > ol > li:last-child').textContent()};
});
await scenario('emitted-prompts',async()=>{
const prompts=await page.evaluate(()=>Object.fromEntries(['en','ar'].map(locale=>[locale,{chat:window.promptOutput(locale,'chat'),default:window.promptOutput(locale),ui:window.promptOutput(locale,'ui')}])));
for(const locale of ['en','ar']){
assert.equal(prompts[locale].default,prompts[locale].ui);assert(prompts[locale].chat.includes('```openui'));
const match=prompts[locale].chat.match(/```openui\n([\s\S]*?)\n```/);assert(match,'no complete example');
await render(prompts[locale].chat.slice(prompts[locale].chat.lastIndexOf('\n',prompts[locale].chat.indexOf('```openui\n'))+1),locale);
await render('```openui\n'+match[1]+'\n```',locale);assert.equal(await page.locator('.ts-badge').textContent(),locale==='ar'?'جاهز':'Ready');
}
await writeFile(evidence+'/emitted-prompts.json',JSON.stringify(prompts,null,2));
return {defaultEqualsExplicitUI:true,chatExamplesRendered:['Ready','جاهز'],contract:'emitted prompt output only; model interpretation not evaluated'};
});
}finally{await browser.close();await writeFile(evidence+'/live-results.json',JSON.stringify({results,exceptions},null,2));}
console.log(JSON.stringify(results,null,2));
if(results.some(r=>r.result==='fail'))process.exitCode=1;
