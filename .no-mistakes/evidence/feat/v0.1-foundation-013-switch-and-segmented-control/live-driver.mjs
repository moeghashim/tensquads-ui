import {chromium,expect} from '@playwright/test';
import {writeFile,readFile} from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7Q4FJXRV18TA1D3RVQESJY5';
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1000,height:800}});
const log=[];const errors=[];
page.on('pageerror',e=>errors.push(String(e)));
async function record(name){log.push({name,radios:await page.getByRole('radio').evaluateAll(nodes=>nodes.map(n=>({label:n.textContent,checked:n.getAttribute('aria-checked'),disabled:n.hasAttribute('data-disabled'),focused:n===document.activeElement}))),switches:await page.getByRole('switch').evaluateAll(nodes=>nodes.map(n=>({label:n.getAttribute('aria-label'),checked:n.getAttribute('aria-checked'),disabled:n.hasAttribute('data-disabled')})))});}
const stream=async(text,dir='ltr')=>{await page.evaluate(([text,dir])=>window.renderStream(text,dir),[text,dir]);};
const reset=()=>page.evaluate(()=>window.reset());
try{
 await page.goto('http://127.0.0.1:5174/.live-test/index.html');
 await page.waitForFunction(()=>typeof window.renderControls==='function');
 await page.evaluate(()=>window.renderControls());
 const consent=page.getByRole('switch',{name:'Consent'}), readOnly=page.getByRole('switch',{name:'Read only'}),disabled=page.getByRole('switch',{name:'Disabled'});
 expect(await page.locator('#consent').evaluate(f=>f.checkValidity())).toBe(false);
 await consent.click();await expect(consent).toHaveAttribute('aria-checked','false');
 expect(await page.evaluate(()=>window.events)).toEqual([{value:true,reason:'press'}]);
 await page.evaluate(()=>window.renderControls(true));await expect(consent).toHaveAttribute('aria-checked','true');
 expect(await page.locator('#consent').evaluate(f=>f.checkValidity())).toBe(true);
 expect(await page.locator('#consent').evaluate(f=>new FormData(f).get('consent'))).toBe('yes');
 await readOnly.click();await readOnly.press('Space');await expect(readOnly).toBeFocused();await expect(readOnly).toHaveAttribute('aria-checked','true');
 await disabled.click({force:true});await disabled.evaluate(e=>e.focus());await expect(disabled).not.toBeFocused();await expect(disabled).toHaveAttribute('aria-checked','true');
 expect(await page.evaluate(()=>window.events.length)).toBe(1);
 await record('Switch: required rejects unchecked; controlled request does not mutate; parent update validates and submits yes; readOnly ignores pointer and Space; disabled ignores click and focus');
 await page.screenshot({path:`${evidence}/switch-guards-controlled.png`,fullPage:true});
 for(const dir of ['ltr','rtl']){
  await reset();await page.evaluate(dir=>window.renderControls(false,dir),dir);
  const group=page.getByRole('radiogroup',{name:'Modes'}),list=group.getByRole('radio',{name:'List'}),grid=group.getByRole('radio',{name:'Grid'}),board=group.getByRole('radio',{name:'Board'});
  await list.focus();await expect(list).toBeFocused();
  expect(await group.locator('[role=radio][tabindex="0"]').count()).toBe(1);
  await page.keyboard.press(dir==='ltr'?'ArrowRight':'ArrowLeft');await expect(grid).toBeFocused();await expect(grid).toHaveAttribute('aria-checked','true');
  await page.keyboard.press(dir==='ltr'?'ArrowRight':'ArrowLeft');await expect(list).toBeFocused();await expect(list).toHaveAttribute('aria-checked','true');
  await page.keyboard.press(dir==='ltr'?'ArrowLeft':'ArrowRight');await expect(grid).toBeFocused();await expect(grid).toHaveAttribute('aria-checked','true');
  await board.click({force:true});await expect(board).toHaveAttribute('aria-checked','false');await expect(grid).toHaveAttribute('aria-checked','true');
  await grid.focus();await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'After group'})).toBeFocused();
  await page.keyboard.press('Shift+Tab');await expect(grid).toBeFocused();
  await record(`Segmented ${dir}: arrows skip Board, wrap both ways, transfer selection and focus; disabled pointer ignored; Tab leaves and Shift+Tab returns to sole tab stop`);
 }
 await page.screenshot({path:`${evidence}/segmented-disabled-rtl-focus.png`,fullPage:true});
 await reset();await stream('root = Switch("Updates",');
 const update=page.getByRole('switch',{name:'Updates'});await expect(update).toHaveAttribute('aria-checked','false');
 await update.focus();await stream('root = Switch("Updates", true, false)');await expect(update).toBeFocused();await expect(update).toHaveAttribute('aria-checked','true');
 await reset();await stream('root = Switch("Updates",');await update.click();await update.click();await stream('root = Switch("Updates", true, true)');
 await expect(update).toHaveAttribute('aria-checked','false');await expect(update).toHaveAttribute('data-disabled');
 await record('Streamed Switch: late true applies without focus loss; user false survives later true and disabled arrival');
 for(const dir of ['ltr','rtl']){
  await reset();await stream('root = SegmentedControl("View", ["List", "Grid"],',dir);
  const list=page.getByRole('radio',{name:'List',exact:true});await list.focus();
  await stream('root = SegmentedControl("View", ["List", "Grid"], "G',dir);await expect(list).toBeFocused();await expect(list).toHaveAttribute('aria-checked','true');
  await stream('root = SegmentedControl("View", ["List", "Grid"], "Grid")',dir);await expect(list).toBeFocused();await expect(page.getByRole('radio',{name:'Grid'})).toHaveAttribute('aria-checked','true');
  await list.click();await stream('root = SegmentedControl("View", ["List", "Grid"], "Grid")',dir);await expect(list).toHaveAttribute('aria-checked','true');
  await record(`Streamed Segmented ${dir}: incomplete initial G retains focus; completed Grid applies; user List overrides initial Grid`);
  await reset();await stream('root = SegmentedControl("View", ["List", "Gr',dir);const growing=page.getByRole('radio',{name:'Gr',exact:true});await growing.click();
  await stream('root = SegmentedControl("View", ["List", "Grid"], "G',dir);await expect(page.getByRole('radio',{name:'Grid'})).toBeFocused();await expect(page.getByRole('radio',{name:'Grid'})).toHaveAttribute('aria-checked','true');
  await stream('root = SegmentedControl("View", ["List", "Grid"], "List")',dir);await expect(page.getByRole('radio',{name:'Grid'})).toBeFocused();await expect(page.getByRole('radio',{name:'Grid'})).toHaveAttribute('aria-checked','true');
  await record(`Streamed Segmented ${dir}: user-selected Gr grows to Grid with focus and selection intact`);
  for(const preceding of [['List'],['List','Grid'],['List','Grid','Board']]){
   await reset();const prefix=`root = SegmentedControl("View", [${preceding.map(x=>JSON.stringify(x)).join(', ')}, "Li`;
   await stream(prefix,dir);await page.getByRole('radio',{name:'Li',exact:true}).click();
   const handle=await page.getByRole('radio',{name:'Li',exact:true}).elementHandle();
   for(const text of [prefix+'st',prefix+'st view"], "List view")']){
    await stream(text,dir);expect(await handle.evaluate(e=>e.isConnected&&e===document.activeElement)).toBe(true);expect(await handle.getAttribute('aria-checked')).toBe('true');expect(await handle.getAttribute('data-disabled')).toBe(null);
    await expect(page.getByRole('radio',{checked:true})).toHaveCount(1);
    expect(await page.getByRole('radio',{name:'List',exact:true}).evaluateAll(es=>es.filter(e=>!e.hasAttribute('data-disabled')).length)).toBe(1);
    await record(`Streamed Segmented ${dir} slot ${preceding.length+1}: ${text}`);
   }
   await page.getByRole('radio',{name:'List',exact:true}).click();await expect(page.getByRole('radio',{name:'List',exact:true})).toHaveAttribute('aria-checked','true');
  }
 }
 await page.screenshot({path:`${evidence}/streamed-fourth-slot-rtl.png`,fullPage:true});
 for(const [options,value] of [[['List','List','Grid'],'List'],[['List','Grid'],'Board']]){
  expect(await page.evaluate(([o,v])=>window.validate(o,v),[options,value])).toBe(false);
  await reset();await stream(`root = SegmentedControl("View", ${JSON.stringify(options)}, ${JSON.stringify(value)})`);
  await expect(page.getByRole('radio',{checked:true})).toHaveCount(1);
  await expect(page.locator('[role=radio]:not([data-disabled])')).toHaveCount(2);
  await page.getByRole('radio',{name:'Grid'}).click();await expect(page.getByRole('radio',{name:'Grid'})).toHaveAttribute('aria-checked','true');
  await record(`Invalid schema rejected and streamed UI remains exclusively selectable: ${JSON.stringify({options,value})}`);
 }
 for(const locale of ['en','ar']){
  for(const component of ['Switch','SegmentedControl']){
   const fixture=await readFile(`packages/ui/src/react/${component}/${component}.fixture.${locale}.txt`,'utf8');await reset();await stream(fixture,locale==='ar'?'rtl':'ltr');
   const control=component==='Switch'?page.getByRole('switch',{name:locale==='en'?'Product updates':'تحديثات المنتج'}):page.getByRole('radiogroup',{name:locale==='en'?'View':'العرض'});
   await expect(control).toBeVisible();await record(`Real localized ${component} OpenUI fixture renders in ${locale}`);
  }
 }
 expect(errors).toEqual([]);
 await writeFile(`${evidence}/live-behavior.json`,JSON.stringify({result:'pass',oracle:'Task 013 and component public contracts: documented keyboard, focus, exclusive selection, stream precedence, schema membership and uniqueness',observations:log,pageErrors:errors},null,2));
 console.log(`PASS: browser interactions recorded in ${evidence}/live-behavior.json`);
} catch(error){await page.screenshot({path:`${evidence}/live-failure.png`,fullPage:true});await writeFile(`${evidence}/live-failure.json`,JSON.stringify({error:String(error),log,errors},null,2));throw error;}finally{await browser.close();}
