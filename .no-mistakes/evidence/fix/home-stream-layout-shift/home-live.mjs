import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7RASEXFH7CJ815QMG5QYJFE';
const browser=await chromium.launch();
const results=[];
const errors=[];
const page=await browser.newPage({viewport:{width:1440,height:1000}});
page.on('pageerror',e=>errors.push(e.message));
const pane=page.locator('.stream-screen');
const footer=page.locator('.stream-code__footer');
const done=()=>expect(footer).toContainText('7/7');
const replay=()=>footer.getByRole('button').click();
const field=()=>pane.getByRole('textbox');
const weekly=l=>pane.getByRole('radio',{name:l==='ar'?'أسبوعي':'Weekly',exact:true});
const monthly=l=>pane.getByRole('radio',{name:l==='ar'?'شهري':'Monthly',exact:true});
const choose=l=>pane.getByRole('radio',{name:l==='ar'?'العربية · RTL':'English',exact:true}).click();
async function open(l='en',theme='light',width=1440){await page.setViewportSize({width,height:1000});await page.goto(`http://localhost:5173/?locale=${l}&dir=${l==='ar'?'rtl':'ltr'}&theme=${theme}`);await page.evaluate(()=>document.fonts.ready);await done();}
async function edit(l){await field().fill('Changed by visitor');await pane.getByRole('switch').click();await monthly(l).click();await expect(field()).toHaveValue('Changed by visitor');await expect(pane.getByRole('switch')).not.toBeChecked();await expect(monthly(l)).toBeChecked();}
async function defaults(l){await done();await expect(field()).toHaveValue(l==='ar'?'متجر بنّاء':'Bannaa Market');await expect(pane.getByRole('switch')).toBeChecked();await expect(weekly(l)).toBeChecked();await expect(pane).toHaveAttribute('lang',l);await expect(pane).toHaveAttribute('dir',l==='ar'?'rtl':'ltr');}
async function shot(name){await page.locator('.stream-demo').screenshot({path:`${evidence}/${name}.png`});}
async function scenario(name,run){try{const detail=await run();results.push({name,result:'pass',detail});}catch(e){results.push({name,result:'fail',error:e.stack});await page.screenshot({path:`${evidence}/failure-${results.length}.png`,fullPage:true});}}
try {
await scenario('Edited demo controls reset on demo and site language changes in both directions',async()=>{
 await open();await edit('en');await shot('edited-en');await choose('ar');await defaults('ar');await expect(page.locator('html')).toHaveAttribute('lang','en');await shot('locale-reset-ar');
 await edit('ar');await choose('en');await defaults('en');await shot('locale-reset-en');
 await edit('en');await page.locator('.site-header').getByRole('radio',{name:'العربية',exact:true}).click();await defaults('ar');await expect(page.locator('html')).toHaveAttribute('lang','ar');
 await edit('ar');await page.locator('.site-header').getByRole('radio',{name:'English',exact:true}).click();await defaults('en');
 return 'Field, notifications and cadence reset to the target fixture; demo toggle preserves site locale and header toggle updates it.';
});
await scenario('Replay clears visitor edits in English and Arabic, including repeated restarts',async()=>{
 for(const l of ['en','ar']){await open(l);await edit(l);await replay();await defaults(l);await shot(`replay-reset-${l}`);await edit(l);await replay();await page.waitForTimeout(350);await replay();await page.waitForTimeout(350);await replay();await defaults(l);}
 return 'Replay restored store name, enabled notifications and Weekly after edits and three overlapping playback restarts in each locale.';
});
await scenario('Playback reserves page geometry at desktop and mobile sizes and hidden controls cannot receive focus',async()=>{
 const measurements=[];
 for(const l of ['en','ar']) for(const theme of ['light','dark']) for(const width of [1440,390]){
  await open(l,theme,width);
  await page.evaluate(()=>{window.samples=[];window.sampling=true;function sample(){const demo=document.querySelector('.stream-demo').getBoundingClientRect();const next=document.querySelector('.home-section').getBoundingClientRect();window.samples.push({h:demo.height,next:next.top+scrollY});if(window.sampling)requestAnimationFrame(sample)}sample();});
  await replay();await expect(footer).toContainText('0/7');
  const hidden=await pane.locator('.stream-reveal[aria-hidden="true"]').count();expect(hidden).toBe(7);
  await expect(pane.getByRole('textbox')).toHaveCount(0);
  const blocked=await pane.locator('input').evaluateAll(nodes=>nodes.every(node=>{node.focus();return document.activeElement!==node}));expect(blocked).toBe(true);
  if(theme==='light')await shot(`stream-start-${l}-${width}`);
  await done();await page.waitForTimeout(250);
  const data=await page.evaluate(()=>{window.sampling=false;return {samples:window.samples,viewport:document.documentElement.clientWidth,content:document.documentElement.scrollWidth}});
  const heightRange=Math.max(...data.samples.map(x=>x.h))-Math.min(...data.samples.map(x=>x.h));
  const nextRange=Math.max(...data.samples.map(x=>x.next))-Math.min(...data.samples.map(x=>x.next));
  expect(heightRange).toBeLessThanOrEqual(1);expect(nextRange).toBeLessThanOrEqual(1);expect(data.content).toBeLessThanOrEqual(data.viewport);
  measurements.push({locale:l,theme,width,heightRange,nextRange,frames:data.samples.length,viewport:data.viewport,content:data.content});
  if(theme==='light')await shot(`stream-finished-${l}-${width}`);
 }
 return measurements;
});
await scenario('Reduced-motion visitors see final controls immediately and locale/replay still reset edits',async()=>{
 await page.emulateMedia({reducedMotion:'reduce'});await open();await edit('en');await replay();await defaults('en');await edit('en');await choose('ar');await defaults('ar');await edit('ar');await replay();await defaults('ar');
 const transitions=await pane.locator('.stream-reveal').evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).transitionDuration));expect(transitions.every(x=>x==='0s')).toBe(true);await shot('reduced-motion-ar');return {transitions};
});
expect(errors).toEqual([]);
} finally {await browser.close();await writeFile(`${evidence}/live-results.json`,JSON.stringify({surface:'production Vite build served by local Wrangler at localhost:5173; shipped synthetic home-demo fixtures',results,pageErrors:errors},null,2));}
if(results.some(r=>r.result==='fail')||errors.length)process.exitCode=1;
console.log(JSON.stringify(results,null,2));
