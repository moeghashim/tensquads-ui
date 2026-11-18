import {test,expect} from '@playwright/test';
const evidence='~/.no-mistakes/evidence/01M7Q6E1J64DFZ7GH4XRC3KVGC';
test.beforeEach(async({page})=>{await page.goto('/.phase-test/index.html');await page.waitForFunction(()=>window.ready);});
async function stream(page,text,dir='ltr'){await page.evaluate(({text,dir})=>window.stream(text,dir),{text,dir});}
async function exclusive(page){await expect(page.getByRole('radio',{checked:true})).toHaveCount(1);}

test('consumer form preserves controlled, required, readOnly, disabled and keyboard contracts',async({page})=>{
 await page.evaluate(()=>window.consumer(false));
 const consent=page.getByRole('switch',{name:'Consent',exact:true});
 await expect(consent).toHaveAttribute('aria-checked','false');
 expect(await page.locator('form').evaluate(f=>f.checkValidity())).toBe(false);
 await consent.click();
 await expect(consent).toHaveAttribute('aria-checked','false');
 expect(await page.evaluate(()=>window.changes)).toEqual([{value:true,reason:'press'}]);
 await page.evaluate(()=>window.consumer(true));
 await expect(consent).toHaveAttribute('aria-checked','true');
 expect(await page.locator('form').evaluate(f=>f.checkValidity())).toBe(true);
 expect(await page.locator('form').evaluate(f=>new FormData(f).get('consent'))).toBe('yes');
 const readonly=page.getByRole('switch',{name:'Read only',exact:true});
 await readonly.click();await readonly.press('Space');await readonly.press('Enter');
 await expect(readonly).toHaveAttribute('aria-checked','true');
 expect(await page.evaluate(()=>window.changes.length)).toBe(1);
 const disabled=page.getByRole('switch',{name:'Disabled',exact:true});
 await expect(disabled).toBeDisabled();
 await disabled.dispatchEvent('click');await expect(disabled).toHaveAttribute('aria-checked','true');
 for(const dir of ['ltr','rtl']){
  await page.evaluate(dir=>document.documentElement.dir=dir,dir);
  const list=page.getByRole('radio',{name:'List',exact:true}),grid=page.getByRole('radio',{name:'Grid',exact:true});
  await list.focus();await list.press('Space');
  await list.press(dir==='ltr'?'ArrowRight':'ArrowLeft');await expect(grid).toBeFocused();await expect(grid).toBeChecked();
  await grid.press(dir==='ltr'?'ArrowRight':'ArrowLeft');await expect(list).toBeFocused();await expect(list).toBeChecked();
  await list.press(dir==='ltr'?'ArrowLeft':'ArrowRight');await expect(grid).toBeFocused();await expect(grid).toBeChecked();
  await expect(page.getByRole('radio',{name:'Blocked'})).not.toBeChecked();
  await expect(page.locator('[role=radio][tabindex="0"]')).toHaveCount(1);
  await list.focus();await list.press('Space');await expect(list).toBeChecked();await exclusive(page);
  const previous=await page.evaluate(()=>window.submissions??0);
  await list.press('Enter');expect(await page.evaluate(()=>window.submissions)).toBe(previous+1);
 }
 await page.screenshot({path:`${evidence}/consumer-form-rtl.png`,fullPage:true});
});

test('Switch stream applies late values and keeps user choice',async({page})=>{
 const prefix='root = Switch("Updates",';
 await stream(page,prefix);const control=page.getByRole('switch',{name:'Updates'});
 await expect(control).not.toBeChecked();await control.focus();
 await stream(page,prefix+' true, false)');await expect(control).toBeChecked();await expect(control).toBeFocused();
 await control.press('Space');await expect(control).not.toBeChecked();
 await stream(page,prefix+' true, false)\n');await expect(control).not.toBeChecked();
 await page.screenshot({path:`${evidence}/switch-stream-user-choice.png`,fullPage:true});
});

test('Segmented stream defers partial initial value and preserves user choice',async({page})=>{
 const prefix='root = SegmentedControl("View", ["List", "Grid"],';
 await stream(page,prefix);const list=page.getByRole('radio',{name:'List',exact:true}),grid=page.getByRole('radio',{name:'Grid',exact:true});
 await list.focus();await stream(page,prefix+' "G');await expect(list).toBeFocused();await expect(list).toBeChecked();
 await stream(page,prefix+' "Grid")');await expect(list).toBeFocused();await expect(grid).toBeChecked();
 await list.click();await stream(page,prefix+' "Grid")\n');await expect(list).toBeChecked();await exclusive(page);
 await page.screenshot({path:`${evidence}/segmented-stream-initial-value.png`,fullPage:true});
});

test('growing selected options retain identity and focus through duplicate labels in every later slot',async({page})=>{
 for(const dir of ['ltr','rtl']){
  for(const preceding of [['List'],['List','Grid'],['List','Grid','Board']]){
   // Reload separates independent consumer streams without reusing user state.
   await page.reload();await page.waitForFunction(()=>window.ready);
   const prefix=`root = SegmentedControl("View", [${preceding.map(x=>JSON.stringify(x)).join(', ')}, "Li`;
   await stream(page,prefix,dir);const growing=page.getByRole('radio',{name:'Li',exact:true});
   await growing.click();await growing.evaluate(el=>el.dataset.identity='growing');await expect(growing).toBeFocused();
   for(const text of [prefix+'st',prefix+'st view"], "List view")']){
    await stream(page,text,dir);const stable=page.locator('[data-identity=growing]');
    await expect(stable).toBeFocused();await expect(stable).toBeChecked();await expect(stable).toBeEnabled();await exclusive(page);
    const copies=page.getByRole('radio',{name:'List',exact:true});
    expect(await copies.evaluateAll(items=>items.filter(el=>!el.hasAttribute('data-disabled')).length)).toBe(1);
    await expect(page.getByRole('radio')).toHaveCount(preceding.length+1);
    if(text===prefix+'st') await page.screenshot({path:`${evidence}/duplicate-${dir}-slot-${preceding.length+1}.png`,fullPage:true});
   }
   await expect(page.locator('[data-identity=growing]')).toHaveText('List view');
   await page.getByRole('radio',{name:'List',exact:true}).click();await expect(page.getByRole('radio',{name:'List',exact:true})).toBeChecked();
  }
  await page.reload();await page.waitForFunction(()=>window.ready);
  await stream(page,'root = SegmentedControl("View", ["List", "Gr',dir);
  await page.getByRole('radio',{name:'Gr',exact:true}).click();
  await stream(page,'root = SegmentedControl("View", ["List", "Grid"], "G',dir);
  await expect(page.getByRole('radio',{name:'Grid',exact:true})).toBeChecked();await expect(page.getByRole('radio',{name:'Grid',exact:true})).toBeFocused();
  await stream(page,'root = SegmentedControl("View", ["List", "Grid"], "List")',dir);
  await expect(page.getByRole('radio',{name:'Grid',exact:true})).toBeChecked();await exclusive(page);
 }
});

test('invalid duplicate or unmatched initial options remain exclusive and usable',async({page})=>{
 for(const data of [{label:'View',options:['List','List','Grid'],value:'List'},{label:'View',options:['List','Grid'],value:'Board'}]){
  expect(await page.evaluate(data=>window.valid(data),data)).toBe(false);
  await stream(page,`root = SegmentedControl("View", ${JSON.stringify(data.options)}, "${data.value}")`);
  await exclusive(page);await page.getByRole('radio',{name:'Grid',exact:true}).click();
  await expect(page.getByRole('radio',{name:'Grid',exact:true})).toBeChecked();await exclusive(page);
 }
 for(const data of [{label:'View',options:['List','Grid']},{label:'View',options:['List','Grid'],value:'Grid'}]) expect(await page.evaluate(data=>window.valid(data),data)).toBe(true);
 await page.screenshot({path:`${evidence}/invalid-stream-fallback.png`,fullPage:true});
});
