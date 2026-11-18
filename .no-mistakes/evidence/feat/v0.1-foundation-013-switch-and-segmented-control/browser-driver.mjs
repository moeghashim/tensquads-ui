import {chromium,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7PVW5QEA38D4RYKDFYE2EMA';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1000,height:700}});
const results=[];
const errors=[];page.on('pageerror',e=>errors.push(e.message));
async function run(name,fn){try{await fn();results.push({name,result:'pass'});}catch(e){results.push({name,result:'fail',error:e.message});await page.screenshot({path:`${evidence}/failure-${results.length}.png`});}}
async function stream(s,reset=false){await page.evaluate(([s,r])=>window.renderStream(s,r),[s,reset]);}
const radio=n=>page.getByRole('radio',{name:n,exact:true});
try{
 await page.goto('http://127.0.0.1:5174'); await page.waitForFunction(()=>typeof window.renderStream==='function');
 await run('Switch controlled value, required submission, readOnly, disabled and custom render keyboard',async()=>{
 const consent=page.getByRole('switch',{name:'Consent'});const readOnly=page.getByRole('switch',{name:'Read only'});const custom=page.getByRole('switch',{name:'Custom'});
 expect(await page.locator('#form').evaluate(f=>f.checkValidity())).toBe(false);
 await page.getByRole('button',{name:'Submit'}).click();expect(await page.evaluate(()=>window.submissions||0)).toBe(0);
 await consent.click();await expect(consent).toHaveAttribute('aria-checked','false');expect(await page.evaluate(()=>window.change)).toEqual({value:true,reason:'press'});
 await page.evaluate(()=>window.renderControls(true));await expect(consent).toHaveAttribute('aria-checked','true');expect(await page.locator('#form').evaluate(f=>f.checkValidity())).toBe(true);
 expect(await page.locator('#form').evaluate(f=>new FormData(f).get('consent'))).toBe('on');
 await readOnly.focus();await page.keyboard.press('Space');await readOnly.click();await expect(readOnly).toHaveAttribute('aria-checked','true');
 await readOnly.focus();await page.keyboard.press('Tab');await expect(custom).toBeFocused();
 await page.keyboard.press('Enter');await expect(custom).toHaveAttribute('aria-checked','false');await page.keyboard.press('Space');await expect(custom).toHaveAttribute('aria-checked','true');
 await expect(page.getByRole('switch',{name:'Unavailable'})).toBeDisabled();
 await page.screenshot({path:`${evidence}/switch-behavior.png`});
 });
 await run('SegmentedControl direction-aware arrows skip disabled, wrap, one tab stop, Space and Enter form submission',async()=>{
 for(const dir of ['ltr','rtl']){
 await page.evaluate(dir=>{document.documentElement.dir=dir;window.renderControls(true);},dir);
 const list=radio('List'),grid=radio('Grid'),board=radio('Board');
 await list.focus();await page.keyboard.press(dir==='ltr'?'ArrowRight':'ArrowLeft');await expect(grid).toBeFocused();await expect(grid).toHaveAttribute('aria-checked','true');
 await page.keyboard.press(dir==='ltr'?'ArrowRight':'ArrowLeft');await expect(list).toBeFocused();await expect(list).toHaveAttribute('aria-checked','true');
 await page.keyboard.press(dir==='ltr'?'ArrowLeft':'ArrowRight');await expect(grid).toBeFocused();await expect(grid).toHaveAttribute('aria-checked','true');await expect(board).toHaveAttribute('aria-checked','false');
 expect(await page.getByRole('radiogroup').locator('[role=radio][tabindex="0"]').count()).toBe(1);
 await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Submit'})).toBeFocused();
 await list.focus();await page.keyboard.press('Space');await expect(list).toHaveAttribute('aria-checked','true');const before=await page.evaluate(()=>window.submissions||0);await page.keyboard.press('Enter');expect(await page.evaluate(()=>window.submissions)).toBe(before+1);
 }
 await page.screenshot({path:`${evidence}/segmented-keyboard-rtl.png`});
 });
 await run('Switch streamed initial value arrives and subsequent user interaction takes precedence',async()=>{
 await stream('root = Switch("Updates",',true);const sw=page.getByRole('switch');await expect(sw).toHaveAttribute('aria-checked','false');
 await stream('root = Switch("Updates", true, false)');await expect(sw).toHaveAttribute('aria-checked','true');await sw.click();await expect(sw).toHaveAttribute('aria-checked','false');
 await stream('root = Switch("Updates", true, false)\n');await expect(sw).toHaveAttribute('aria-checked','false');
 });
 await run('SegmentedControl late initial value and partial identity retain focus and user choice',async()=>{
 await stream('root = SegmentedControl("View", ["List", "Grid"],',true);await radio('List').focus();
 await stream('root = SegmentedControl("View", ["List", "Grid"], "G');await expect(radio('List')).toBeFocused();await expect(radio('List')).toHaveAttribute('aria-checked','true');
 await stream('root = SegmentedControl("View", ["List", "Grid"], "Grid")');await expect(radio('Grid')).toHaveAttribute('aria-checked','true');await expect(radio('List')).toBeFocused();
 for(const dir of ['ltr','rtl']){
 await page.evaluate(d=>document.documentElement.dir=d,dir);await stream('root = SegmentedControl("View", ["List", "Gr',true);await radio('Gr').click();
 for(const s of ['root = SegmentedControl("View", ["List", "Grid"], "G','root = SegmentedControl("View", ["List", "Grid"], "List")']){await stream(s);await expect(radio('Grid')).toBeFocused();await expect(radio('Grid')).toHaveAttribute('aria-checked','true');await expect(page.getByRole('radio',{checked:true})).toHaveCount(1);}
 }
 });
 await run('Growing second, third and fourth option keeps selection and focus through a temporary duplicate in LTR and RTL',async()=>{
 for(const dir of ['ltr','rtl'])for(const preceding of [['List'],['List','Grid'],['List','Grid','Board']]){
 await page.evaluate(d=>document.documentElement.dir=d,dir);
 const prefix=`root = SegmentedControl("View", [${preceding.map(x=>JSON.stringify(x)).join(', ')}, "Li`;
 await stream(prefix,true);await radio('Li').click();const slot=page.getByRole('radio').nth(preceding.length);
 for(const s of [prefix+'st',prefix+'st view"], "List view")']){await stream(s);await expect(slot).toBeFocused();await expect(slot).toHaveAttribute('aria-checked','true');await expect(slot).toBeEnabled();await expect(page.getByRole('radio',{checked:true})).toHaveCount(1);await expect(page.getByRole('radio')).toHaveCount(preceding.length+1);}
 await radio('List').click();await expect(radio('List')).toHaveAttribute('aria-checked','true');
 }
 await page.screenshot({path:`${evidence}/stream-duplicate-recovered.png`});
 });
 await run('Duplicate options and absent initial value are rejected by schema while streamed controls remain exclusive and usable',async()=>{
 expect(await page.evaluate(()=>window.schemaValid(['List','List'],'List'))).toBe(false);expect(await page.evaluate(()=>window.schemaValid(['List','Grid'],'Board'))).toBe(false);
 for(const s of ['root = SegmentedControl("View", ["List", "List", "Grid"], "List")','root = SegmentedControl("View", ["List", "Grid"], "Board")']){await stream(s,true);await expect(page.getByRole('radio',{checked:true})).toHaveCount(1);await radio('Grid').click();await expect(radio('Grid')).toHaveAttribute('aria-checked','true');}
 });
 await run('Explicitly selecting the current first option remains selected when duplicate grows and late default arrives',async()=>{
 await stream('root = SegmentedControl("View", ["List", "List',true);await radio('List').first().click();
 await page.screenshot({path:`${evidence}/stream-current-before.png`});
 await stream('root = SegmentedControl("View", ["List", "List view"], "List view")');
 await page.screenshot({path:`${evidence}/stream-current-after.png`});
 await expect(radio('List')).toBeFocused();await expect(radio('List')).toHaveAttribute('aria-checked','true');
 });
}finally{await writeFile(`${evidence}/live-results.json`,JSON.stringify({results,errors},null,2));await browser.close();}
console.log(JSON.stringify({results,errors},null,2));
process.exitCode=results.some(x=>x.result==='fail')?1:0;
