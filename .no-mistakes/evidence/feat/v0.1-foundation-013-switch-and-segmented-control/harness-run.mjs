import {chromium,expect} from '@playwright/test';
import fs from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7PVW5QEA38D4RYKDFYE2EMA';
const browser=await chromium.launch({args:['--disable-lcd-text','--font-render-hinting=none']});
const page=await browser.newPage({viewport:{width:1000,height:700}});
const results=[];
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const reset=async()=>page.evaluate(()=>window.reset());
const mount=async(kind,props)=>page.evaluate(({kind,props})=>window.mount(kind,props),{kind,props});
const stream=async(text)=>page.evaluate(text=>window.stream(text),text);
const radio=name=>page.getByRole('radio',{name,exact:true});
const checked=async(name)=>{await expect(radio(name)).toHaveAttribute('aria-checked','true');await expect(page.getByRole('radio',{checked:true})).toHaveCount(1);};
async function scenario(name,fn){try{await fn();results.push({name,result:'pass',live:true});console.log('PASS '+name);}catch(e){results.push({name,result:'fail',live:true,error:e.stack});await page.screenshot({path:evidence+'/failure-'+results.length+'.png',fullPage:true});console.error('FAIL '+name+' '+e.stack);}}
try{
await page.goto('http://127.0.0.1:5174/.local-test/index.html');await page.waitForFunction(()=>window.ready);
await scenario('Switch public API: disabled/readOnly guards, required form submission, controlled state, render and callback details',async()=>{
 await mount('switch',{defaultChecked:true,readOnly:true});let sw=page.getByRole('switch');await sw.focus();await expect(sw).toBeFocused();await sw.press('Space');await sw.click();await expect(sw).toHaveAttribute('aria-checked','true');expect(await page.evaluate(()=>window.events)).toEqual([]);expect(await page.evaluate(()=>[...new FormData(document.querySelector('form'))])).toEqual([['updates','on']]);
 await reset();await mount('switch',{disabled:true,defaultChecked:true});sw=page.getByRole('switch');await sw.evaluate(e=>e.click());await expect(sw).toHaveAttribute('aria-checked','true');await page.getByRole('button',{name:'Save'}).focus();await sw.focus();await expect(sw).not.toBeFocused();expect(await page.evaluate(()=>[...new FormData(document.querySelector('form'))])).toEqual([]);
 await reset();await mount('switch',{required:true});await page.getByRole('button',{name:'Save'}).click();expect(await page.evaluate(()=>window.events)).toEqual([]);expect(await page.locator('form').evaluate(e=>e.checkValidity())).toBe(false);await page.getByRole('switch').click();await page.getByRole('button',{name:'Save'}).click();expect(await page.evaluate(()=>window.events.at(-1))).toEqual({submitted:[['updates','on']]});
 await reset();await mount('switch',{checked:false});sw=page.getByRole('switch');await sw.click();await expect(sw).toHaveAttribute('aria-checked','false');expect(await page.evaluate(()=>window.events[0])).toEqual({value:true,reason:'press',cancel:'function'});await mount('switch',{checked:true});await expect(sw).toHaveAttribute('aria-checked','true');
 await page.screenshot({path:evidence+'/switch-required-controlled.png'});
});
await scenario('SegmentedControl public API: arrows skip disabled items and wrap in LTR/RTL, one tab stop, Space/Enter, render and controlled updates',async()=>{
 for(const dir of ['ltr','rtl']){
 await reset();await page.evaluate(dir=>document.documentElement.dir=dir,dir);await mount('segmented',{defaultValue:'List'});await radio('List').focus();await page.keyboard.press(dir==='ltr'?'ArrowRight':'ArrowLeft');await checked('Board');await expect(radio('Board')).toBeFocused();await expect(radio('Board')).toHaveAttribute('data-custom','yes');await page.keyboard.press(dir==='ltr'?'ArrowRight':'ArrowLeft');await checked('List');await expect(radio('List')).toBeFocused();await page.keyboard.press(dir==='ltr'?'ArrowLeft':'ArrowRight');await checked('Board');await expect(radio('Board')).toBeFocused();expect(await page.getByRole('radio').evaluateAll(es=>es.filter(e=>e.tabIndex===0&&!e.disabled).length)).toBe(1);await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Save'})).toBeFocused();await radio('List').focus();await page.keyboard.press('Space');await checked('List');await page.keyboard.press('Enter');expect(await page.evaluate(()=>window.events.at(-1))).toEqual({submitted:[['view','List']]});
 expect(await page.evaluate(()=>window.events.some(e=>e.reason==='list-navigation'&&e.cancel==='function'))).toBe(true);
 }
 await reset();await mount('segmented',{value:'List'});await radio('Board').click();await checked('List');await mount('segmented',{value:'Board'});await checked('Board');await page.screenshot({path:evidence+'/segmented-disabled-controlled.png'});
});
await scenario('Streamed Switch: late initial checked state applies until user interaction takes precedence',async()=>{
 await reset();await stream('root = Switch("Updates",');await expect(page.getByRole('switch')).toHaveAttribute('aria-checked','false');await stream('root = Switch("Updates", true, false)');await expect(page.getByRole('switch')).toHaveAttribute('aria-checked','true');await page.getByRole('switch').press('Space');await stream('root = Switch("Updates", true, false)');await expect(page.getByRole('switch')).toHaveAttribute('aria-checked','false');await page.screenshot({path:evidence+'/stream-switch-user-choice.png'});
});
await scenario('Streamed SegmentedControl: late and partial initial values preserve focus; growing labels preserve user selection in LTR/RTL',async()=>{
 for(const dir of ['ltr','rtl']){
 await reset();await page.evaluate(dir=>document.documentElement.dir=dir,dir);await stream('root = SegmentedControl("View", ["List", "Grid"],');await radio('List').focus();await stream('root = SegmentedControl("View", ["List", "Grid"], "G');await expect(radio('List')).toBeFocused();await checked('List');await stream('root = SegmentedControl("View", ["List", "Grid"], "Grid")');await expect(radio('List')).toBeFocused();await checked('Grid');
 await reset();await stream('root = SegmentedControl("View", ["List", "Gr');await radio('Gr').click();await stream('root = SegmentedControl("View", ["List", "Grid"], "G');await checked('Grid');await expect(radio('Grid')).toBeFocused();await stream('root = SegmentedControl("View", ["List", "Grid"], "List")');await checked('Grid');await expect(radio('Grid')).toBeFocused();
 }
 await page.screenshot({path:evidence+'/stream-growing-option-rtl.png'});
});
await scenario('Adversarial streamed duplicates: every growing option slot retains focus and exclusive selection through duplicate labels; invalid schema inputs are rejected',async()=>{
 for(const dir of ['ltr','rtl'])for(const preceding of [['List'],['List','Grid'],['List','Grid','Board']]){
 await reset();await page.evaluate(dir=>document.documentElement.dir=dir,dir);const prefix=`root = SegmentedControl("View", [${preceding.map(x=>JSON.stringify(x)).join(', ')}, "Li`;await stream(prefix);await radio('Li').click();const growing=await radio('Li').elementHandle();
 for(const suffix of ['st','st view"], "List view")']){await stream(prefix+suffix);expect(await growing.evaluate(e=>e===document.activeElement)).toBe(true);expect(await growing.getAttribute('aria-checked')).toBe('true');expect(await growing.getAttribute('data-disabled')).toBeNull();await expect(page.getByRole('radio',{checked:true})).toHaveCount(1);if(suffix==='st'){expect(await page.getByRole('radio').evaluateAll(es=>es.filter(e=>e.textContent==='List'&&!e.hasAttribute('data-disabled')).length)).toBe(1);await page.screenshot({path:evidence+`/stream-duplicate-${dir}-slot${preceding.length+1}.png`});}}
 await radio('List').click();await checked('List');
 }
 expect(await page.evaluate(()=>window.schema(['List','List'],'List'))).toBe(false);expect(await page.evaluate(()=>window.schema(['List','Grid'],'Board'))).toBe(false);expect(await page.evaluate(()=>window.schema(['List','Grid'],'Grid'))).toBe(true);
 await reset();await stream('root = SegmentedControl("View", ["List", "List", "Grid"], "List")');await expect(page.getByRole('radio',{checked:true})).toHaveCount(1);await radio('Grid').click();await checked('Grid');
 await reset();await stream('root = SegmentedControl("View", ["List", "Grid"], "Board")');await checked('List');await radio('Grid').click();await checked('Grid');
});
await scenario('Built preview: bilingual fixtures, visual states and no mobile overflow in light/dark at 1440/390px',async()=>{
 for(const component of ['Switch','SegmentedControl'])for(const locale of ['en','ar'])for(const theme of ['light','dark'])for(const width of [1440,390]){
 await page.setViewportSize({width,height:900});await page.goto(`http://localhost:5173/components/${component}?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}`);await page.evaluate(()=>document.fonts.ready);const fixture=page.getByRole('region',{name:locale==='en'?'OpenUI fixture':'عينة OpenUI'});await expect(fixture.getByRole(component==='Switch'?'switch':'radiogroup')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);await page.screenshot({path:evidence+`/preview-${component}-${locale}-${theme}-${width}.png`,fullPage:true});
 }
});
} finally {await browser.close();await fs.writeFile(evidence+'/live-results.json',JSON.stringify({results,pageErrors:errors},null,2));}
if(results.some(r=>r.result==='fail'))process.exitCode=1;
