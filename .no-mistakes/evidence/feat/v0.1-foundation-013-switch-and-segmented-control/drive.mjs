import { chromium, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const out='~/.no-mistakes/evidence/01M7PVW5QEA38D4RYKDFYE2EMA';
const browser=await chromium.launch({args:['--disable-lcd-text','--font-render-hinting=none']});
const page=await browser.newPage();const results=[];
async function scenario(name,fn){try{await fn();results.push({name,result:'pass'});}catch(e){results.push({name,result:'fail',error:String(e)});await page.screenshot({path:`${out}/failure-${results.length}.png`});}writeFileSync(`${out}/live-results.json`,JSON.stringify(results,null,2));}
async function setStream(s){await page.evaluate(s=>window.stream(s),s);}
async function clear(){await page.evaluate(()=>window.clear());}
try{
await page.goto('http://127.0.0.1:5174');await page.waitForFunction(()=>window.wrapper);
await scenario('Switch readOnly, required validation, controlled state, render and callback API',async()=>{
const ro=page.getByRole('switch',{name:'Read only',exact:true});await ro.focus();await expect(ro).toBeFocused();await ro.press('Space');await ro.click();await expect(ro).toHaveAttribute('aria-checked','true');
const disabled=page.getByRole('switch',{name:'Unavailable'});await expect(disabled).toBeDisabled();await disabled.dispatchEvent('click');await expect(disabled).toHaveAttribute('aria-checked','true');
const consent=page.getByRole('switch',{name:'Consent'});await expect(consent).toHaveAttribute('data-custom','switch');expect(await page.locator('#controls').evaluate(f=>f.checkValidity())).toBe(false);await consent.click();await expect(consent).toHaveAttribute('aria-checked','false');expect(await page.evaluate(()=>window.events.at(-1))).toEqual({next:true,reason:'press'});
await page.evaluate(()=>window.wrapper({checked:true}));await expect(consent).toHaveAttribute('aria-checked','true');expect(await page.locator('#controls').evaluate(f=>f.checkValidity())).toBe(true);expect(await page.locator('#controls').evaluate(f=>Object.fromEntries(new FormData(f)))).toEqual({readonly:'on',consent:'on',view:'list'});
await page.screenshot({path:`${out}/consumer-states.png`,fullPage:true});
});
await scenario('SegmentedControl controlled API and directional focus skips disabled options and wraps',async()=>{
for(const dir of ['ltr','rtl']){await page.evaluate(dir=>document.documentElement.dir=dir,dir);await page.evaluate(()=>window.wrapper({checked:true,value:'list'}));
const controlled=page.getByRole('radiogroup',{name:'View',exact:true});await controlled.getByRole('radio',{name:'Grid',exact:true}).click();expect(await page.evaluate(()=>window.events.at(-1))).toEqual({next:'grid',reason:'item-press'});await expect(controlled.getByRole('radio',{name:'List',exact:true})).toBeChecked();await page.evaluate(()=>window.wrapper({checked:true,value:'grid'}));await expect(controlled.getByRole('radio',{name:'Grid',exact:true})).toBeChecked();await expect(controlled.getByRole('radio',{name:'List',exact:true})).toHaveAttribute('data-custom','item');
const group=page.getByRole('radiogroup',{name:'Navigation'});const list=group.getByRole('radio',{name:'List',exact:true}), grid=group.getByRole('radio',{name:'Grid',exact:true});await list.focus();await page.keyboard.press(dir==='ltr'?'ArrowRight':'ArrowLeft');await expect(grid).toBeFocused();await expect(grid).toBeChecked();await page.keyboard.press(dir==='ltr'?'ArrowRight':'ArrowLeft');await expect(list).toBeFocused();await expect(list).toBeChecked();await page.keyboard.press(dir==='ltr'?'ArrowLeft':'ArrowRight');await expect(grid).toBeFocused();await expect(grid).toBeChecked();await expect(group.getByRole('radio',{name:'Board'})).not.toBeChecked();await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Submit',exact:true})).toBeFocused();}
});
await scenario('Streamed Switch applies late initial state and preserves subsequent user choices',async()=>{
await clear();await setStream('root = Switch("Updates",');const s=page.getByRole('switch');await expect(s).not.toBeChecked();await setStream('root = Switch("Updates", true, false)');await expect(s).toBeChecked();await clear();await setStream('root = Switch("Updates",');await s.click();await s.click();await setStream('root = Switch("Updates", true, true)');await expect(s).not.toBeChecked();await expect(s).toBeDisabled();
});
await scenario('Segmented stream late and partial initial values preserve selection and focus',async()=>{
await clear();await setStream('root = SegmentedControl("View", ["List", "Grid"],');const list=page.getByRole('radio',{name:'List',exact:true});await list.focus();await setStream('root = SegmentedControl("View", ["List", "Grid"], "G');await expect(list).toBeFocused();await expect(list).toBeChecked();await setStream('root = SegmentedControl("View", ["List", "Grid"], "Grid")');await expect(list).toBeFocused();await expect(page.getByRole('radio',{name:'Grid'})).toBeChecked();await list.click();await setStream('root = SegmentedControl("View", ["List", "Grid"], "Grid")');await expect(list).toBeChecked();
});
await scenario('Growing option identities and temporary duplicates preserve every selected slot in LTR and RTL',async()=>{
for(const dir of ['ltr','rtl']){await page.evaluate(dir=>document.documentElement.dir=dir,dir);
await clear();await setStream('root = SegmentedControl("View", ["List", "Gr');const growing=page.getByRole('radio',{name:'Gr',exact:true});await growing.click();await setStream('root = SegmentedControl("View", ["List", "Grid"], "G');await expect(page.getByRole('radio',{name:'Grid'})).toBeFocused();await expect(page.getByRole('radio',{name:'Grid'})).toBeChecked();
for(const previous of [['List'],['List','Grid'],['List','Grid','Board']]){await clear();const prefix=`root = SegmentedControl("View", [${previous.map(x=>JSON.stringify(x)).join(', ')}, "Li`;await setStream(prefix);await page.getByRole('radio',{name:'Li',exact:true}).click();const slot=page.getByRole('radio').nth(previous.length);for(const s of [prefix+'st',prefix+'st view"], "List view")']){await setStream(s);await expect(slot).toBeFocused();await expect(slot).toBeChecked();await expect(slot).not.toBeDisabled();await expect(page.getByRole('radio',{checked:true})).toHaveCount(1);const copies=await page.getByRole('radio',{name:'List',exact:true}).evaluateAll(es=>es.filter(e=>!e.hasAttribute('data-disabled')).length);expect(copies).toBe(1);}await expect(slot).toHaveText('List view');await page.getByRole('radio',{name:'List',exact:true}).click();await expect(slot).not.toBeChecked();}
}
await page.screenshot({path:`${out}/stream-completed-rtl.png`,fullPage:true});
});
await scenario('Invalid OpenUI options reject duplicate and unknown schema values while streamed controls remain exclusive and usable',async()=>{
for(const props of [{label:'View',options:['List','List','Grid'],value:'List'},{label:'View',options:['List','Grid'],value:'Board'}]){expect(await page.evaluate(p=>window.schema(p),props)).toBe(false);await clear();await setStream(`root = SegmentedControl("View", ${JSON.stringify(props.options)}, ${JSON.stringify(props.value)})`);await expect(page.getByRole('radio',{checked:true})).toHaveCount(1);expect(await page.getByRole('radio').evaluateAll(es=>es.filter(e=>!e.hasAttribute('data-disabled')).length)).toBe(2);await page.getByRole('radio',{name:'Grid'}).click();await expect(page.getByRole('radio',{name:'Grid'})).toBeChecked();}
});
await scenario('Bilingual production previews render fixtures across themes and widths without overflow',async()=>{
for(const name of ['Switch','SegmentedControl'])for(const locale of ['en','ar'])for(const theme of ['light','dark'])for(const width of [390,1440]){await page.setViewportSize({width,height:900});await page.goto(`http://127.0.0.1:5173/components/${name}?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}`);await page.evaluate(()=>document.fonts.ready);const fixture=page.getByRole('region',{name:locale==='ar'?'عينة OpenUI':'OpenUI fixture'});await expect(fixture.getByRole(name==='Switch'?'switch':'radiogroup')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);await page.screenshot({path:`${out}/${name}-${locale}-${theme}-${width}.png`,fullPage:true});}
});
}finally{await browser.close();writeFileSync(`${out}/live-results.json`,JSON.stringify(results,null,2));}
console.log(JSON.stringify(results,null,2));if(results.some(r=>r.result==='fail'))process.exitCode=1;
