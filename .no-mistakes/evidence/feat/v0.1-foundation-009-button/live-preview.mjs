import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json');
const {chromium,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const out='~/.no-mistakes/evidence/01M7PRG7NK22K1E5MT11WVRXH0';
const browser=await chromium.launch({args:['--disable-lcd-text','--font-render-hinting=none']});
const context=await browser.newContext({viewport:{width:1440,height:900}});
const page=await context.newPage();
const evidence=[];
const labels=['في استراحة','بانتظارك','تخطيط','قيد العمل','قيد التحقق','تم','إعادة للتعديل','معلّق','بانتظار قرارك','أُلغي'];
const names=['بترا','بيزا','كيوتو','ريو','زيورخ','الجيزة','ماتشو','أنغكور','دلفي','سيدني','غرينتش','الإسكندرية','البندقية'];
async function open(component,locale,theme,scheme='light'){
 await page.emulateMedia({colorScheme:scheme});
 await page.goto(`http://localhost:5173/components/${component}?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}`);
 await page.evaluate(()=>document.fonts.ready);
 await page.addStyleTag({content:'select { appearance: none; padding-inline-end: calc(var(--ts-space-3) + 16px); }'});
}
try {
 for(const [theme,scheme] of [['light','light'],['dark','light'],['system','dark'],['light','dark']]){
  await open('Button','en',theme,scheme);
  const danger=page.locator('.ts-button--danger:not([data-disabled])');
  const colors=await danger.evaluateAll(els=>els.map(el=>({color:getComputedStyle(el).color,mapping:getComputedStyle(el).getPropertyValue('--ts-button-danger-text').trim(),background:getComputedStyle(el).backgroundColor})));
  assert.equal(colors.length,5);
  colors.forEach(x=>assert.equal(x.color,'rgb(255, 255, 255)'));
  if(theme==='system')assert.equal(await page.locator('html').getAttribute('data-theme'),null);
  await page.screenshot({path:`${out}/danger-${theme}-os-${scheme}.png`,fullPage:true});
  evidence.push({scenario:'danger color',theme,system:scheme,colors});
 }
 for(const locale of ['en','ar'])for(const theme of ['light','dark']){
  await page.setViewportSize({width:1440,height:900});
  await open('Button',locale,theme);
  await expect(page.locator('[data-slot="button"]')).toHaveCount(31);
  const first=page.getByRole('button',{name:locale==='ar'?'متابعة':'Continue',exact:true}).first();
  await page.evaluate(()=>{window.phaseClicks=0;document.addEventListener('click',e=>{if(e.target.closest('[data-slot="button"]'))window.phaseClicks++})});
  await first.focus();await page.keyboard.press('Enter');await page.keyboard.press('Space');
  assert.equal(await page.evaluate(()=>window.phaseClicks),2);
  const ring=await first.evaluate(el=>{const s=getComputedStyle(el);return [s.outlineWidth,s.outlineOffset,s.outlineColor]});
  assert.deepEqual(ring,['2px','2px',theme==='light'?'rgb(1, 105, 204)':'rgb(2, 133, 255)']);
  const disabled=page.locator('[data-slot="button"][data-disabled]');
  assert.equal(await disabled.count(),5);
  for(const el of await disabled.all()) {await expect(el).toBeDisabled();await el.scrollIntoViewIfNeeded();const box=await el.boundingBox();await page.mouse.click(box.x+box.width/2,box.y+box.height/2);}
  assert.equal(await page.evaluate(()=>window.phaseClicks),2);
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:900});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),true);
   await page.screenshot({path:`${out}/button-${locale}-${theme}-${width}.png`,fullPage:true});
  }
  const axe=(await new AxeBuilder({page}).analyze()).violations;
  assert.deepEqual(axe,[]);
  evidence.push({scenario:'button interactions',locale,theme,keyboardClicks:2,disabledClicks:0,ring,widths:[1440,390],axeViolations:axe});
 }
 for(const theme of ['light','dark']){
  await page.setViewportSize({width:1440,height:900});await open('Squadmate','ar',theme);
  const gallery=page.getByRole('region',{name:'الزملاء وحالاتهم'});
  const alts=await gallery.getByRole('img').evaluateAll(els=>els.map(el=>el.alt));
  const expected=names.flatMap(name=>labels.map(label=>`${name}، ${label}`));
  assert.deepEqual([...alts].sort(),[...expected].sort());
  const captions=await gallery.locator('figcaption').allTextContents();
  assert.deepEqual([...captions].sort(),names.flatMap(()=>labels).sort());
  assert.equal(await gallery.getByRole('img').evaluateAll(els=>els.every(el=>el.complete&&el.naturalWidth>0)),true);
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:900});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),true);
   await page.screenshot({path:`${out}/squadmate-ar-${theme}-${width}.png`,fullPage:true});
  }
  evidence.push({scenario:'D18 Arabic state labels',theme,alts,captions,loadedImages:130});
 }
 await writeFile(`${out}/live-observations.json`,JSON.stringify(evidence,null,2));
 console.log(JSON.stringify(evidence.map(({alts,captions,...rest})=>rest),null,2));
}finally{await browser.close();}
