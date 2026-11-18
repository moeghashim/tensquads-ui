import {chromium,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const evidence=process.env.EVIDENCE_DIR;
const browser=await chromium.launch({args:['--disable-lcd-text','--font-render-hinting=none']});
const page=await browser.newPage({viewport:{width:900,height:850}});
page.setDefaultTimeout(7000);
const results=[];const observations=[];const errors=[];
page.on('pageerror',e=>errors.push(String(e)));
async function state(label){observations.push({label,...await page.evaluate(()=>({direction:document.documentElement.dir,controls:[...document.querySelectorAll('[role=switch],[role=radio]')].map(el=>({text:el.textContent,label:el.getAttribute('aria-label'),checked:el.getAttribute('aria-checked'),disabled:el.hasAttribute('data-disabled'),focused:el===document.activeElement,tabindex:el.getAttribute('tabindex')})),events:window.events}))});}
async function run(name,fn){try{await fn();results.push({name,result:'pass'});}catch(e){results.push({name,result:'fail',error:String(e)});await page.screenshot({path:`${evidence}/consumer-failure-${results.length}.png`});}}
async function stream(text,reset=false){await page.evaluate(({text,reset})=>window.stream(text,reset),{text,reset});}
try{
await page.goto('http://127.0.0.1:5184/.validation/harness.html');await page.waitForFunction(()=>window.ready);
await run('Switch forms, controlled updates, readOnly, disabled, custom render and callbacks',async()=>{
await page.evaluate(()=>{window.events=[];window.controls(false)});
const consent=page.getByRole('switch',{name:'Consent',exact:true});
await expect(consent).toHaveAttribute('aria-checked','false');
expect(await page.locator('#consumer').evaluate(f=>f.checkValidity())).toBe(false);
await consent.focus();await page.keyboard.press('Space');
await expect(consent).toHaveAttribute('aria-checked','false');
expect(await page.evaluate(()=>window.events)).toContainEqual(expect.objectContaining({value:true,reason:'press'}));
await page.evaluate(()=>window.controls(true));await expect(consent).toHaveAttribute('aria-checked','true');
expect(await page.locator('#consumer').evaluate(f=>f.checkValidity())).toBe(true);
const readonly=page.getByRole('switch',{name:'Read only',exact:true});await readonly.click();await page.keyboard.press('Space');await expect(readonly).toHaveAttribute('aria-checked','true');await expect(readonly).toBeFocused();
const disabled=page.getByRole('switch',{name:'Disabled',exact:true});await disabled.dispatchEvent('click');await expect(disabled).toHaveAttribute('aria-checked','true');
const rendered=page.getByRole('switch',{name:'Rendered switch'});await expect(rendered).toHaveJSProperty('tagName','DIV');await rendered.focus();await page.keyboard.press('Space');await expect(rendered).toHaveAttribute('aria-checked','true');await page.keyboard.press('Enter');await expect(rendered).toHaveAttribute('aria-checked','true');
await page.getByRole('button',{name:'Save',exact:true}).click();
expect(await page.evaluate(()=>window.events.at(-1))).toEqual({submit:[['consent','yes'],['readonly','on'],['mode','list']]});
expect(await page.evaluate(()=>window.events.some(e=>e.bad))).toBe(false);
await state('Controlled switch update and submitted data');await page.screenshot({path:`${evidence}/consumer-controls.png`,fullPage:true});
});
await run('SegmentedControl arrows skip disabled and wrap with one tab stop in LTR and RTL; Space selects and Enter submits',async()=>{
for(const dir of ['ltr','rtl']){
await page.evaluate(dir=>{document.documentElement.dir=dir;window.events=[];window.uncontrolled()},dir);
const list=page.getByRole('radio',{name:'List',exact:true}),grid=page.getByRole('radio',{name:'Grid',exact:true}),board=page.getByRole('radio',{name:'Board',exact:true});
await page.getByRole('button',{name:'Before',exact:true}).focus();await page.keyboard.press('Tab');await expect(list).toBeFocused();await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Save',exact:true})).toBeFocused();
await list.focus();await page.keyboard.press(dir==='ltr'?'ArrowRight':'ArrowLeft');await expect(grid).toBeFocused();await expect(grid).toHaveAttribute('aria-checked','true');
await page.keyboard.press(dir==='ltr'?'ArrowRight':'ArrowLeft');await expect(list).toBeFocused();await expect(list).toHaveAttribute('aria-checked','true');
await page.keyboard.press(dir==='ltr'?'ArrowLeft':'ArrowRight');await expect(grid).toBeFocused();await expect(board).toHaveAttribute('aria-checked','false');
await list.focus();await page.keyboard.press('Space');await expect(list).toHaveAttribute('aria-checked','true');
await page.keyboard.press('Enter');expect(await page.evaluate(()=>window.events.at(-1))).toEqual({submit:[['mode','list']]});
await grid.click();await page.getByRole('button',{name:'Reset',exact:true}).click();await expect(list).toHaveAttribute('aria-checked','true');
await state(`${dir} wrapping, disabled skip and form reset`);
}
});
await run('Streamed Switch accepts arriving initial state and preserves a user override when disabled arrives',async()=>{
await stream('root = Switch("Updates",',true);const sw=page.getByRole('switch');await expect(sw).toHaveAttribute('aria-checked','false');await sw.focus();await sw.evaluate(el=>el.dataset.identity='original');
await stream('root = Switch("Updates", true, false)');await expect(sw).toHaveAttribute('aria-checked','true');await expect(sw).toHaveAttribute('data-identity','original');await expect(sw).toBeFocused();
await stream('root = Switch("Updates",',true);await sw.click();await sw.click();await expect(sw).toHaveAttribute('aria-checked','false');await stream('root = Switch("Updates", true, true)');await expect(sw).toHaveAttribute('aria-checked','false');await expect(sw).toHaveAttribute('data-disabled');await state('Arriving disabled state preserves user override');
});
await run('Streamed segmented initial values and partial strings preserve user choice, exclusive selection and focus',async()=>{
for(const dir of ['ltr','rtl']){
await page.evaluate(dir=>document.documentElement.dir=dir,dir);
await stream('root = SegmentedControl("View", ["List", "Grid"],',true);let list=page.getByRole('radio',{name:'List',exact:true});await list.focus();await list.evaluate(el=>el.dataset.identity='original');
await stream('root = SegmentedControl("View", ["List", "Grid"], "G');await expect(list).toBeFocused();await expect(list).toHaveAttribute('aria-checked','true');
await stream('root = SegmentedControl("View", ["List", "Grid"], "Grid")');await expect(list).toBeFocused();await expect(list).toHaveAttribute('data-identity','original');await expect(page.getByRole('radio',{name:'Grid',exact:true})).toHaveAttribute('aria-checked','true');
await stream('root = SegmentedControl("View", ["List", "Gr',true);let growing=page.getByRole('radio',{name:'Gr',exact:true});await growing.click();await growing.evaluate(el=>el.dataset.identity='growing');
await stream('root = SegmentedControl("View", ["List", "Grid"], "G');growing=page.locator('[data-identity=growing]');await expect(growing).toBeFocused();await expect(growing).toHaveText('Grid');await expect(growing).toHaveAttribute('aria-checked','true');
await stream('root = SegmentedControl("View", ["List", "Grid"], "List")');await expect(growing).toBeFocused();await expect(growing).toHaveAttribute('aria-checked','true');await expect(page.getByRole('radio',{checked:true})).toHaveCount(1);await state(`${dir} partial option and initial value`);
}
});
await run('Growing second, third and fourth options keep selected or unselected focus through temporary duplicate labels in LTR and RTL',async()=>{
for(const dir of ['ltr','rtl'])for(const preceding of [['List'],['List','Grid'],['List','Grid','Board']])for(const select of [true,false]){
await page.evaluate(dir=>document.documentElement.dir=dir,dir);
const prefix=`root = SegmentedControl("View", [${preceding.map(x=>JSON.stringify(x)).join(', ')}, "Li`;
await stream(prefix,true);let growing=page.getByRole('radio',{name:'Li',exact:true});await growing.focus();if(select)await growing.click();await growing.evaluate(el=>el.dataset.identity='growing');
for(const text of [`${prefix}st`,`${prefix}st view"], "List view")`]){
await stream(text);growing=page.locator('[data-identity=growing]');await expect(growing).toBeFocused();await expect(growing).not.toHaveAttribute('data-disabled');await expect(page.getByRole('radio')).toHaveCount(preceding.length+1);await expect(page.getByRole('radio',{checked:true})).toHaveCount(1);if(select)await expect(growing).toHaveAttribute('aria-checked','true');
const copies=page.getByRole('radio',{name:'List',exact:true});expect(await copies.evaluateAll(els=>els.filter(el=>!el.hasAttribute('data-disabled')).length)).toBe(1);
await state(`${dir} slot ${preceding.length+1} ${select?'selected':'focused'}: ${text}`);
}
await expect(growing).toHaveText('List view');await page.getByRole('radio',{name:'List',exact:true}).click();await expect(page.getByRole('radio',{name:'List',exact:true})).toHaveAttribute('aria-checked','true');
}
await page.screenshot({path:`${evidence}/streamed-duplicate-final.png`,fullPage:true});
});
await run('OpenUI schema rejects duplicate options and non-member values; rendered invalid streams remain exclusively selectable',async()=>{
expect(await page.evaluate(()=>window.schema(['List','List'],'List'))).toBe(false);expect(await page.evaluate(()=>window.schema(['List','Grid'],'Board'))).toBe(false);expect(await page.evaluate(()=>window.schema(['List','Grid'],'Grid'))).toBe(true);expect(await page.evaluate(()=>window.schema(['List','Grid']))).toBe(true);
for(const text of ['root = SegmentedControl("View", ["List", "List", "Grid"], "List")','root = SegmentedControl("View", ["List", "Grid"], "Board")']){
await stream(text,true);await expect(page.getByRole('radio',{checked:true})).toHaveCount(1);await page.getByRole('radio',{name:'Grid',exact:true}).click();await expect(page.getByRole('radio',{name:'Grid',exact:true})).toHaveAttribute('aria-checked','true');await expect(page.getByRole('radio',{checked:true})).toHaveCount(1);await state(`Invalid input remains usable: ${text}`);
}
});
}finally{await writeFile(`${evidence}/consumer-observations.json`,JSON.stringify({surface:'Real library components and TensquadsRenderer in Chromium on localhost:5184 with synthetic consumer props and streams',results,observations,errors},null,2));await browser.close();}
console.log(JSON.stringify({results,errors},null,2));if(results.some(r=>r.result==='fail')||errors.length)process.exitCode=1;
