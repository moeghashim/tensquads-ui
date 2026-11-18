import {test,expect} from '@playwright/test';
import {openPreview,expectAccessible,expectNoHorizontalScroll} from './helpers/preview';
const evidence='~/.no-mistakes/evidence/01M7PYF8X62X6R5ZZRMJJ89R3M';
const consumer='http://127.0.0.1:5174';
test('Capture bilingual preview matrix and action events',async({page})=>{
 for(const locale of ['en','ar'] as const)for(const theme of ['light','dark'] as const){
 await openPreview(page,{locale,direction:locale==='ar'?'rtl':'ltr',theme},'/components/Menu');
 for(const width of [1440,390]){await page.setViewportSize({width,height:900});await page.screenshot({path:`${evidence}/menu-${locale}-${theme}-${width}.png`,fullPage:true,animations:'disabled'});}
 await expectNoHorizontalScroll(page);await expectAccessible(page);
 await page.evaluate(()=>{(window as any).actions=[];document.addEventListener('tensquads:menu-action',(e:any)=>(window as any).actions.push(e.detail));});
 const region=page.getByRole('region',{name:locale==='en'?'OpenUI fixture':'عينة OpenUI'});
 await region.getByRole('button').press('Enter');
 const items=region.getByRole('menuitem');
 await expect(items.last()).toHaveAttribute('data-destructive');
 await expect(region.getByRole('separator')).toBeVisible();
 await items.first().click();await expect.poll(()=>page.evaluate(()=>(window as any).actions)).toEqual([{value:'open'}]);
 }
});
test('Controlled render trigger, disabled action, typeahead and outside dismissal',async({page})=>{
 await page.goto(consumer);const trigger=page.getByRole('button',{name:'الإجراءات'});
 await expect(trigger).toHaveText('⋯');await expect(trigger).toHaveAttribute('data-slot','menu-trigger');
 await trigger.press('ArrowDown');await expect(page.getByRole('menuitem',{name:'Save'})).toBeFocused();
 await page.keyboard.press('ArrowDown');const disabled=page.getByRole('menuitem',{name:'Unavailable'});await expect(disabled).toBeFocused();await page.keyboard.press('Enter');
 await expect(trigger).toHaveAttribute('aria-expanded','true');expect(await page.evaluate(()=>(window as any).events.filter(e=>e.type==='action'))).toEqual([]);
 await page.keyboard.press('s');await expect(page.getByRole('menuitem',{name:'Save'})).toBeFocused();
 await page.keyboard.press('Enter');await expect(trigger).toHaveAttribute('aria-expanded','false');
 expect(await page.evaluate(()=>(window as any).events.find(e=>e.type==='action'))).toMatchObject({value:'save',hasEvent:true});
 await trigger.click();await page.getByRole('button',{name:'Outside',exact:true}).click();await expect(trigger).toHaveAttribute('aria-expanded','false');
 expect(await page.evaluate(()=>(window as any).events.some(e=>e.type==='open'&&e.value===false&&e.reason==='outside-press'))).toBe(true);
 await trigger.press('Enter');await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
});
test('Exported submenus work with directional keys and selection parts persist',async({page})=>{
 for(const dir of ['ltr','rtl']){
 await page.goto(`${consumer}?dir=${dir}`);const trigger=page.getByRole('button',{name:'الإجراءات'});await trigger.press('ArrowDown');await page.keyboard.press('End');const more=page.getByRole('menuitem',{name:'More',exact:true});await expect(more).toBeFocused();await page.keyboard.press(dir==='ltr'?'ArrowRight':'ArrowLeft');await expect(page.getByRole('menuitem',{name:'Archive'})).toBeFocused();
 await page.screenshot({path:`${evidence}/submenu-${dir}.png`});
 await page.keyboard.press('Escape');await expect(more).toBeFocused();await page.keyboard.press(dir==='ltr'?'ArrowRight':'ArrowLeft');await page.getByRole('menuitem',{name:'Archive'}).press('Enter');
 expect(await page.evaluate(()=>(window as any).events.find(e=>e.type==='action'))).toMatchObject({value:'archive'});
 await page.getByRole('button',{name:'View',exact:true}).click();const check=page.getByRole('menuitemcheckbox');await check.click();await expect(check).toHaveAttribute('aria-checked','true');await expect(page.getByText('Checked',{exact:true})).toBeVisible();
 await page.getByRole('menuitemradio',{name:'Comfortable'}).click();await expect(page.getByRole('menuitemradio',{name:'Comfortable'})).toHaveAttribute('aria-checked','true');await expect(page.getByRole('menuitemradio',{name:'Compact'})).toHaveAttribute('aria-checked','false');
 expect(await page.evaluate(()=>(window as any).events.filter(e=>['check','radio'].includes(e.type)).map(e=>[e.type,e.value]))).toEqual([['check',true],['radio','comfortable']]);
 await page.keyboard.press('Escape');const context=page.getByText('File area',{exact:true});await context.click({button:'right'});await page.getByRole('menuitem',{name:'Open file'}).click();expect(await page.evaluate(()=>(window as any).events.find(e=>e.type==='context'))).toMatchObject({value:'open-file'});
 await context.focus();await page.keyboard.press('Shift+F10');await expect(page.getByRole('menuitem',{name:'Open file'})).toBeVisible();await page.keyboard.press('Escape');
 }
});
test('Async action remains pending and blocks repeated activation until resolved',async({page})=>{
 await page.goto(consumer);await page.getByRole('button',{name:'Async',exact:true}).click();const upload=page.getByRole('menuitem',{name:'Upload'});await upload.click();await expect(upload).toHaveAttribute('aria-busy','true');await expect(upload).toHaveAttribute('data-pending');await upload.press('Enter');expect(await page.evaluate(()=>(window as any).events.filter(e=>e.type==='async').length)).toBe(1);
 await page.screenshot({path:`${evidence}/async-pending.png`});await page.evaluate(()=>(window as any).resolveAction());await expect(page.getByRole('button',{name:'Async',exact:true})).toHaveAttribute('aria-expanded','false');
});
test('OpenUI accepts one and six items, orders danger last, rejects invalid payloads',async({page})=>{
 await page.goto(consumer);
 const set=async(label,items)=>{await page.evaluate(({label,items})=>(window as any).setStream(`root = Menu(${JSON.stringify(label)}, ${JSON.stringify(items)})`),{label,items});};
 for(const count of [1,6]){
 const actions=[{label:'Delete',value:'delete',danger:true},...Array.from({length:count-1},(_,i)=>({label:`Action ${i}`,value:`a${i}`}))];await set('Actions',actions);const region=page.locator('#stream');await region.getByRole('button',{name:'Actions'}).click();await expect(region.getByRole('menuitem')).toHaveCount(count);await expect(region.getByRole('menuitem').last()).toHaveText('Delete');await expect(region.getByRole('separator')).toHaveCount(1);await page.keyboard.press('Escape');
 }
 const good=[{label:'Open',value:'open'}];
 for(const [label,items] of [['',good],['Actions',[]],['Actions',Array.from({length:7},(_,i)=>({label:`Action ${i}`,value:`a${i}`}))],['Actions',[{label:'',value:'open'}]],['Actions',[{label:'Open',value:''}]],['Actions',[{label:'',value:'delete',danger:true}]],['Actions',[{label:'Delete',value:'',danger:true}]],['Actions',[{label:'Delete',value:'d1',danger:true},{label:'Erase',value:'d2',danger:true}]]]){
 await page.evaluate(()=>(window as any).events=[]);await set(label,items);await expect.poll(()=>page.evaluate(()=>(window as any).events.some(e=>e.type==='errors'&&e.value>0))).toBe(true);await expect(page.locator('#stream').getByRole('button')).toHaveCount(0);
 }
 await page.screenshot({path:`${evidence}/invalid-menu-rejected.png`});
});
