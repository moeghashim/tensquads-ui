import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const out = '~/.no-mistakes/evidence/01M7SFFSC5T01EGXR031QS4FC3';
const results = [];
const browser = await chromium.launch();
const context = await browser.newContext({viewport:{width:1440,height:1000}});
const page = await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(String(e)));
async function open(locale='en',theme='light',width=1440) {
 await page.setViewportSize({width,height:1000});
 await page.goto(`http://127.0.0.1:5173/chat?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}`);
 await expect(page.getByRole('button',{name:locale==='ar'?'اعتماد الخطة':'Approve plan',exact:true})).toBeVisible();
 await page.evaluate(()=>document.fonts.ready);
}
async function inspect() {
 return page.evaluate(()=>{
  const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}};
  const frame=getComputedStyle(document.querySelector('.chat-demo__surface'));
  const title=getComputedStyle(document.querySelector('main h1'));
  return {title:{size:title.fontSize,lineHeight:title.lineHeight},frame:{border:frame.borderTopWidth,radius:frame.borderTopLeftRadius,shadow:frame.boxShadow,background:frame.backgroundColor},surface:box('.chat-demo__surface'),intro:box('.chat-page__intro'),footer:box('.chat-page__footer'),composer:box('.ts-chat__composer'),width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,lang:document.documentElement.lang,dir:document.documentElement.dir};
 });
}
function validate(m) {
 expect(m.title).toEqual({size:'36px',lineHeight:'40px'}); // Published design page-title contract.
 expect(parseFloat(m.frame.border)).toBeGreaterThan(0);
 expect(parseFloat(m.frame.radius)).toBeGreaterThan(0);
 expect(m.frame.shadow).not.toBe('none');
 expect(m.frame.background).not.toBe('rgba(0, 0, 0, 0)');
 expect(m.intro.bottom).toBeLessThan(m.surface.y);
 expect(m.footer.y).toBeGreaterThan(m.surface.bottom);
 expect(m.composer.x).toBeGreaterThanOrEqual(m.surface.x);
 expect(m.composer.right).toBeLessThanOrEqual(m.surface.right);
 expect(m.composer.bottom).toBeLessThanOrEqual(m.surface.bottom);
 expect(m.scrollWidth).toBeLessThanOrEqual(m.width);
}
async function shot(name){await page.screenshot({path:`${out}/${name}.png`,fullPage:true});}
async function scenario(name,run) {
 try {const detail=await run();results.push({name,result:'pass',detail});}
 catch(e){results.push({name,result:'fail',error:String(e)});await shot(`failure-${results.length}`);}
 await writeFile(`${out}/live-results.json`,JSON.stringify({results,errors},null,2));
}
try {
 await scenario('Desktop local chat shows a separate app window and site page-title hierarchy',async()=>{
  await open();const m=await inspect();validate(m);
  await expect(page.getByRole('heading',{level:1})).toHaveText('See the conversation behind an agent-built screen.');
  await expect(page).toHaveTitle('tensquads ui');
  await shot('chat-en-light-1440');
  await page.getByRole('navigation').getByRole('link',{name:'Get started',exact:true}).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('Give your agent the UI contract');
  const other=await page.locator('main h1').evaluate(e=>({size:getComputedStyle(e).fontSize,lineHeight:getComputedStyle(e).lineHeight}));
  expect(m.title).toEqual(other);
  await page.getByRole('navigation').getByRole('link',{name:'Chat demo',exact:true}).click();
  await expect(page.getByRole('button',{name:'Approve plan',exact:true})).toBeVisible();validate(await inspect());
  return {initial:m,otherSiteTitle:other,navigation:'get-started and back'};
 });
 await scenario('390px local chat contains long input, approval, scrolling, and replay inside its frame',async()=>{
  await open('en','light',390);const initial=await inspect();validate(initial);await shot('chat-en-light-390');
  const longStore='Northstar Goods '+ 'very long store name '.repeat(10);
  const field=page.getByRole('textbox',{name:'Store name',exact:true});
  await field.fill(longStore);
  await page.getByRole('button',{name:'Approve plan',exact:true}).click();
  await expect(field).toBeDisabled();
  await expect(page.locator('.ts-chat-reply__markdown').last()).toContainText(`Plan approved for ${longStore.trim()}`);
  const composer=page.getByRole('textbox',{name:'Try a message',exact:true});
  await composer.fill(Array.from({length:10},(_,i)=>`Line ${i+1}: can you connect inventory?`).join('\n'));
  await composer.scrollIntoViewIfNeeded();validate(await inspect());await shot('chat-mobile-long-input');
  await page.getByRole('button',{name:'Send',exact:true}).click();
  await expect(page.locator('.ts-chat__log').getByText('This site has no live model. The chat demo uses a scripted reply.',{exact:true})).toBeVisible();
  const after=await inspect();validate(after);expect(after.surface.height).toEqual(initial.surface.height);await shot('chat-mobile-after-send');
  await page.getByRole('button',{name:'Replay',exact:true}).click();
  await expect(page.getByRole('button',{name:'Approve plan',exact:true})).toBeEnabled();
  await expect(page.locator('.ts-chat__user-message')).toHaveCount(1);validate(await inspect());
  return {initial,after,actions:['long store approval locks form','ten-line composer sends fixed local reply','Replay resets in same frame']};
 });
 await scenario('Arabic RTL and English chat retain framing and readable titles across light and dark at desktop and mobile sizes',async()=>{
  const observations=[];
  for(const locale of ['en','ar'])for(const theme of ['light','dark']) {
   await open(locale,theme);let desktop=await inspect();validate(desktop);
   expect(desktop.lang).toBe(locale);expect(desktop.dir).toBe(locale==='ar'?'rtl':'ltr');
   await shot(`chat-${locale}-${theme}-1440`);
   await page.setViewportSize({width:390,height:1000});let mobile=await inspect();validate(mobile);await shot(`chat-${locale}-${theme}-390`);
   await page.getByRole('button',{name:locale==='ar'?'إعادة العرض':'Replay',exact:true}).click();
   await expect(page.getByRole('button',{name:locale==='ar'?'اعتماد الخطة':'Approve plan',exact:true})).toBeEnabled();validate(await inspect());
   await page.getByRole('link',{name:locale==='ar'?'عرض المكوّنات':'Browse components',exact:true}).click();
   await expect(page).toHaveURL(/\/components\?/);expect(new URL(page.url()).searchParams.get('locale')).toBe(locale);expect(new URL(page.url()).searchParams.get('theme')).toBe(theme);
   observations.push({locale,theme,desktop,mobile,footerNavigation:'components with locale and theme preserved'});
  }
  expect(errors).toEqual([]);return observations;
 });
} finally {await context.close();await browser.close();}
console.log(JSON.stringify({results,errors},null,2));
if(results.some(r=>r.result!=='pass'))process.exitCode=1;
