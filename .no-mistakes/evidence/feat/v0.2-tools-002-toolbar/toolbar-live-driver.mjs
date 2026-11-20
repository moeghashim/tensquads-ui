import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const evidence = '~/.no-mistakes/evidence/01M7W6JC7S0KTQ1HEM8D9KDN0K';
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({headless:true});
const results = [];
const observations = [];
const run = async (name, fn) => { try { await fn(); results.push({name,result:'pass'}); } catch(error) { results.push({name,result:'fail',error:String(error)}); } };
try {
for(const locale of ['en','ar']) for(const theme of ['light','dark']) {
 const context = await browser.newContext({viewport:{width:1440,height:900}});
 const page = await context.newPage();
 const errors=[]; page.on('pageerror',error=>errors.push(String(error)));
 const dir=locale==='ar'?'rtl':'ltr';
 const names=locale==='ar'?['تحريك اللوحة','تحديد','تراجع','إعادة']:['Pan','Select','Undo','Redo'];
 await page.goto(`http://localhost:5173/components/Toolbar?locale=${locale}&dir=${dir}&theme=${theme}`);
 await page.evaluate(()=>document.fonts.ready);
 const toolbar=page.getByRole('toolbar');
 const [pan,select,undo,redo]=names.map(name=>toolbar.getByRole('button',{name,exact:true}));
 await run(`layout ${locale} ${theme}`, async()=>{
  await expect(toolbar).toHaveAccessibleName(locale==='ar'?'أدوات اللوحة':'Canvas tools');
  await expect(pan).toHaveAttribute('aria-pressed','true');
  await expect(undo).toHaveAttribute('aria-disabled','true');
  await expect(redo).toHaveAttribute('aria-disabled','true');
  await expect(toolbar.getByRole('button')).toHaveCount(4);
  for(const width of [1440,390]) {
   await page.setViewportSize({width,height:900});
   const sizes=await toolbar.evaluate(el=>{const b=el.getBoundingClientRect(), c=el.parentElement.getBoundingClientRect(), s=getComputedStyle(el);return {height:b.height,center:b.x+b.width/2,canvasCenter:c.x+c.width/2,canvasWidth:c.width,gap:s.gap,padding:s.padding,bottom:c.bottom-b.bottom,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,buttons:[...el.querySelectorAll('button')].map(x=>({w:x.getBoundingClientRect().width,h:x.getBoundingClientRect().height})),separator: (()=>{const sep=el.querySelector('[role=separator]'),r=sep.getBoundingClientRect();return {line:getComputedStyle(sep).borderInlineStartWidth,height:r.height}})() }});
   expect(sizes.height).toBe(56); expect(sizes.overflow).toBe(false); expect(Math.abs(sizes.center-sizes.canvasCenter)).toBeLessThan(1);
   expect(sizes.buttons).toEqual(Array(4).fill({w:40,h:40})); expect(sizes.separator).toEqual({line:'1px',height:24});
   expect(sizes.gap).toBe('8px'); expect(sizes.padding).toBe('8px'); expect(sizes.bottom).toBe(24);
   const axe=await new AxeBuilder({page}).analyze(); expect(axe.violations).toEqual([]);
   observations.push({locale,theme,width,...sizes,axeViolations:axe.violations});
   await page.screenshot({path:`${evidence}/Toolbar-${locale}-${theme}-${width}.png`,fullPage:true,animations:'disabled'});
  }
 });
 await run(`modes and history ${locale} ${theme}`,async()=>{
  await select.click(); await expect(select).toHaveAttribute('aria-pressed','true'); await expect(pan).toHaveAttribute('aria-pressed','false'); await expect(undo).toBeEnabled();
  await select.click(); await expect(select).toHaveAttribute('aria-pressed','true');
  await undo.click(); await expect(pan).toHaveAttribute('aria-pressed','true'); await expect(select).toHaveAttribute('aria-pressed','false');
  await select.focus(); await page.keyboard.press('Space'); await expect(select).toHaveAttribute('aria-pressed','true');
  await pan.focus(); await page.keyboard.press('Enter'); await expect(pan).toHaveAttribute('aria-pressed','true'); await expect(select).toHaveAttribute('aria-pressed','false');
 });
 await run(`keyboard ${locale} ${theme}`,async()=>{
  await pan.focus();
  expect(await toolbar.locator('[tabindex="0"]').count()).toBe(1);
  await page.keyboard.press(dir==='rtl'?'ArrowLeft':'ArrowRight'); await expect(select).toBeFocused();
  await expect(pan).toHaveAttribute('aria-pressed','true');
  await page.keyboard.press(dir==='rtl'?'ArrowRight':'ArrowLeft'); await expect(pan).toBeFocused();
  await page.keyboard.press('End'); await expect(redo).toBeFocused();
  await page.keyboard.press('Home'); await expect(pan).toBeFocused();
  const ring=await pan.evaluate(el=>{const s=getComputedStyle(el);return {width:s.outlineWidth,offset:s.outlineOffset,color:s.outlineColor}});
  expect(ring).toEqual({width:'2px',offset:'2px',color:theme==='light'?'rgb(1, 105, 204)':'rgb(2, 133, 255)'});
  await page.screenshot({path:`${evidence}/Toolbar-focus-${locale}-${theme}.png`,fullPage:true,animations:'disabled'});
  await page.keyboard.press('Tab'); expect(await toolbar.evaluate(el=>el.contains(document.activeElement))).toBe(false);
  await page.keyboard.press('Shift+Tab'); await expect(pan).toBeFocused();
  observations.push({locale,theme,keyboard:'reading-direction arrows, Home, End, Tab exit/reentry',ring});
 });
 await run(`tooltips and disabled guard ${locale} ${theme}`,async()=>{
  await page.reload(); await expect(undo).toHaveAttribute('aria-disabled','true');
  await pan.focus(); await page.keyboard.press(dir==='rtl'?'ArrowLeft':'ArrowRight'); await page.keyboard.press(dir==='rtl'?'ArrowLeft':'ArrowRight'); await expect(undo).toBeFocused();
  await page.keyboard.press('Enter'); await page.keyboard.press('Space'); await expect(undo).toHaveAttribute('aria-disabled','true'); await expect(pan).toHaveAttribute('aria-pressed','true');
  await page.keyboard.press('End'); await expect(redo).toBeFocused(); await page.keyboard.press('Enter'); await expect(redo).toHaveAttribute('aria-disabled','true');
  for(const [i,control] of [pan,select,undo,redo].entries()) {
    await control.focus(); await expect(page.getByRole('tooltip',{name:names[i],exact:true})).toBeVisible();
  }
  await pan.focus(); await expect(page.getByRole('tooltip',{name:names[0],exact:true})).toBeVisible();
  await page.screenshot({path:`${evidence}/Toolbar-tooltip-${locale}-${theme}.png`,fullPage:true,animations:'disabled'});
  await page.keyboard.press('Escape'); await expect(page.getByRole('tooltip',{name:names[0],exact:true})).toBeHidden();
  await page.locator('h1').click(); await select.hover(); await expect(page.getByRole('tooltip',{name:names[1],exact:true})).toBeVisible();
  observations.push({locale,theme,tooltipLabels:names,disabledActions:'Undo/Redo remain disabled after Enter and Space',pageErrors:errors});
  expect(errors).toEqual([]);
 });
 await context.close();
}
} finally { await browser.close(); await writeFile(`${evidence}/toolbar-live-results.json`,JSON.stringify({oracle:'dev/milestones/v0.2-tools/002-toolbar.md, design Toolbar spec, PLAN.md section 12',results,observations},null,2)); }
console.log(JSON.stringify(results,null,2));
if(results.some(r=>r.result==='fail')) process.exitCode=1;
