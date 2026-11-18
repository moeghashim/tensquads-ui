import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const root=process.cwd();
const require=createRequire(root+'/package.json');
const {chromium,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const {getRegisteredComponents}=await import(pathToFileURL(root+'/packages/ui/dist/openui/index.js'));
const order=getRegisteredComponents().map(x=>x.name);
const evidence='~/.no-mistakes/evidence/01M7R3QX693WMP0YQPJGRV86E1/revalidation';
await mkdir(evidence+'/screenshots',{recursive:true});
const browser=await chromium.launch();
const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
const page=await context.newPage();
page.setDefaultTimeout(7000);
const report=process.env.SCENARIO?JSON.parse(await readFile(evidence+'/live-results.json','utf8')):{oracle:'Task 002, PLAN D20, component Markdown and fixture documents as public content contracts; registry order from library public API',order,scenarios:[],pages:[],errors:[]};
page.on('pageerror',e=>report.errors.push(e.message));
async function open(name,locale='en',theme='light',width=1440){
 await page.setViewportSize({width,height:900});
 await page.goto(`http://localhost:5173/components/${name}?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}`);
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForLoadState('networkidle');
 await expect(page.locator('html')).toHaveAttribute('lang',locale);
 await expect(page.locator('html')).toHaveAttribute('dir',locale==='ar'?'rtl':'ltr');
}
async function scenario(name,fn){if(process.env.SCENARIO&&!name.startsWith(process.env.SCENARIO))return;report.scenarios=report.scenarios.filter(x=>x.name!==name);try{await fn();report.scenarios.push({name,result:'pass'});console.log('PASS '+name)}catch(e){report.scenarios.push({name,result:'fail',error:e.stack});console.log('FAIL '+name+' '+e.message);await page.screenshot({path:evidence+'/screenshots/failure-'+report.scenarios.length+'.png',fullPage:true});}}
try {
await scenario('Read every component document and active-locale fixture in English/Arabic, light/dark, desktop/mobile',async()=>{
 for(const locale of ['en','ar'])for(const theme of ['light','dark'])for(const name of order){
  await open(name,locale,theme);
  await expect(page.locator('h1')).toHaveText(name);
  const doc=page.locator('.markdown-document');
  for(const label of locale==='ar'?['الوصف','الخصائص','الاستخدام']:['Description','Props','Usage'])await expect(doc.getByRole('heading',{name:label,exact:true})).toBeVisible();
  const markdown=await readFile(root+`/packages/ui/src/react/${name}/${name}.md`,'utf8');
  const description=markdown.split('\n\n')[1].replaceAll('`','');
  await expect(doc.locator('section').first()).toContainText(description);
  const fixture=await readFile(root+`/packages/ui/src/react/${name}/${name}.fixture.${locale}.txt`,'utf8');
  const source=page.locator('.fixture-source');
  await expect(source).not.toHaveAttribute('open','');
  await source.locator('summary').click();
  await expect(source.locator('pre code')).toHaveText(fixture.trim());
  const rendered=page.locator('.gallery > .component-list').last();
  await expect(rendered).toBeVisible();
  expect(await rendered.locator('[data-slot],img,svg').count()).toBeGreaterThan(0);
  await expect(rendered).not.toContainText(/error|failed|unknown component/i);
  const firstString=JSON.parse(fixture.match(/\("(?:[^"\\]|\\.)*"/)?.[0].slice(1)??'""');
  if(name==='Squadmate')await expect(rendered.getByRole('img')).toHaveAccessibleName(locale==='ar'?'بترا، تخطيط':'Petra, Planning');
  else expect((await rendered.innerText())+' '+(await rendered.locator('[aria-label]').evaluateAll(els=>els.map(e=>e.getAttribute('aria-label')).join(' ')))+' '+(await rendered.locator('input').evaluateAll(els=>els.map(e=>e.getAttribute('placeholder')??'').join(' ')))).toContain(firstString);
  await source.locator('summary').click();
  const violations=(await new AxeBuilder({page}).analyze()).violations;
  expect(violations).toEqual([]);
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:900});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
   await page.screenshot({path:`${evidence}/screenshots/${name}-${locale}-${theme}-${width}.png`,fullPage:true,animations:'disabled'});
  }
  report.pages.push({name,locale,theme,fixtureSource:fixture.trim(),renderedText:await rendered.innerText(),axe:'no violations',widths:[1440,390]});
 }
});
await scenario('Copy a documented Input example with the real browser clipboard and handle denied permission visibly',async()=>{
 await open('Input','ar','dark');
 const block=page.locator('.markdown-document .copyable-code').first();
 const expected=await block.locator('pre code').textContent();
 await block.getByRole('button',{name:'نسخ',exact:true}).click();
 await expect(block.getByRole('status')).toHaveText('تم النسخ');
 expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(expected);
 await block.screenshot({path:evidence+'/screenshots/clipboard-success.png'});
 await context.clearPermissions();
 await context.grantPermissions([]);
 await context.browser().contexts()[0].newCDPSession(page).then(cdp=>cdp.send('Browser.setPermission',{permission:{name:'clipboard-write'},setting:'denied',origin:'http://localhost:5173'}));
 await block.getByRole('button',{name:'نسخ',exact:true}).click();
 await expect(block.getByRole('status')).toHaveText('تعذّر نسخ هذا الرمز.');
 await block.screenshot({path:evidence+'/screenshots/clipboard-denied.png'});
 await context.grantPermissions(['clipboard-read','clipboard-write']);
});
await scenario('Retained Button, Squadmate and Chip examples each expose corresponding copyable code',async()=>{
 for(const locale of ['en','ar']){
 await open('Button',locale);
 const rows=page.locator('.button-preview__row');
 await expect(rows).toHaveCount(5);
 for(const row of await rows.all()){
  const variant=(await row.locator('h2').innerText()).toLowerCase();
  const snippets=await row.locator('pre code').innerText();
  for(const size of ['sm','md','lg'])expect(snippets).toContain(`size="${size}"`);
  for(const prop of ['pill','iconOnly','disabled'])expect(snippets).toContain(prop);
  expect(snippets.split('\n')).toHaveLength(6);
  expect(snippets.split(`variant="${variant}"`).length-1).toBe(6);
  await expect(row.locator(':scope > button')).toHaveCount(6);
  await row.getByRole('button',{name:locale==='ar'?'نسخ':'Copy',exact:true}).click();
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(snippets);
 }
 await open('Squadmate',locale);
 const agents=page.locator('.squadmate-gallery__agent');
 await expect(agents).toHaveCount(13);
 for(const agent of await agents.all()){
  const snippets=await agent.locator('pre code').innerText();
  const states=['idle','waiting','planning','running','checking','done','sentback','blocked','escalated','dropped'];
  await expect(agent.locator('figure')).toHaveCount(states.length);
  for(const state of states)expect(snippets).toContain(`state="${state}"`);
  await agent.getByRole('button',{name:locale==='ar'?'نسخ':'Copy',exact:true}).click();
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(snippets);
 }
 await open('Chip',locale);
 const snippets=(await page.locator('.chip-preview__grid pre code').allTextContents()).join('\n');
 for(const name of ['response_schema','tool_search','output_format','disabled_object','this_is_a_long_object_identifier_that_stays_visible'])expect(snippets).toContain(`name="${name}"`);
 await expect(page.locator('.chip-preview__grid .ts-chip')).toHaveCount(5);
 }
});
await scenario('Follow previous/next registry links, preserve Arabic dark settings, and handle first/last and unknown pages',async()=>{
 for(let i=0;i<order.length;i++){
  await open(order[i],'ar','dark',390);
  await page.keyboard.press('Escape');
  const prev=page.locator('.component-doc-nav [rel="prev"]');
  const next=page.locator('.component-doc-nav [rel="next"]');
  await expect(prev).toHaveCount(i>0?1:0);await expect(next).toHaveCount(i<order.length-1?1:0);
  if(i<order.length-1){
   await expect(next).toContainText('التالي: '+order[i+1]);
   await expect(next.locator('[aria-hidden]')).toHaveText('←');
   await next.click();
   await expect(page.locator('h1')).toHaveText(order[i+1]);
   const url=new URL(page.url()); for(const [key,value]of [['locale','ar'],['dir','rtl'],['theme','dark']])expect(url.searchParams.get(key)).toBe(value);
   await page.keyboard.press('Escape');
   await page.locator('.component-doc-nav [rel="prev"]').click();
   await expect(page.locator('h1')).toHaveText(order[i]);
  }
 }
 await open('UnknownComponent','ar','dark',390);
 await expect(page.locator('main')).toContainText('توثيق المكوّن غير متاح.');
 await expect(page.locator('.component-doc-nav')).toHaveCount(0);
 await page.screenshot({path:evidence+'/screenshots/unknown-component.png',fullPage:true});
});
await scenario('Focus horizontal Tooltips and verify copied logical sides mirror physical placement in RTL',async()=>{
 for(const locale of ['en','ar']){
 await open('Tooltip',locale);
 const items=page.locator('.tooltip-preview__item');
 for(const [index,logical,physical]of [[1,'end',locale==='ar'?'left':'right'],[3,'start',locale==='ar'?'right':'left']]){
  const item=items.nth(index), trigger=item.locator('button').first();
  const snippets=await item.locator('pre code').innerText();expect(snippets).toContain(`side="${logical}"`);
  await page.keyboard.press('Tab');await trigger.focus();const popup=page.locator('[data-slot="tooltip-content"][data-open]');
  await expect(popup).toBeVisible();await expect(popup).toHaveAttribute('data-side',physical);
  await page.screenshot({path:`${evidence}/screenshots/tooltip-${locale}-${logical}.png`,fullPage:true});
  await page.keyboard.press('Escape');
  await item.getByRole('button',{name:locale==='ar'?'نسخ':'Copy',exact:true}).click();
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(snippets);
 }
 }
});
}finally{await browser.close();await writeFile(evidence+'/live-results.json',JSON.stringify(report,null,2));}
if(report.scenarios.some(x=>x.result==='fail'))process.exitCode=1;
