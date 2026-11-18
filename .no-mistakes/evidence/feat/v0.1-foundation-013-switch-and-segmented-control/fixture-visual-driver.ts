import {expect,test} from '@playwright/test';
import {openPreview} from './helpers/preview';
const evidence=process.env.EVIDENCE_DIR!;
for(const name of ['Switch','SegmentedControl'])test(`${name} bilingual rendered fixtures and visual evidence`,async({page})=>{
 for(const locale of ['en','ar'] as const)for(const theme of ['light','dark'] as const){
 const dir=locale==='en'?'ltr':'rtl';
 await openPreview(page,{locale,direction:dir,theme},`/components/${name}`);
 const fixture=page.getByRole('region',{name:locale==='en'?'OpenUI fixture':'عينة OpenUI'});
 if(name==='Switch'){
 const control=fixture.getByRole('switch',{name:locale==='en'?'Product updates':'تحديثات المنتج'});
 await expect(control).toHaveAttribute('aria-checked','true');
 await control.click(); await expect(control).toHaveAttribute('aria-checked','false');
 await control.focus();await page.keyboard.press('Space');await expect(control).toHaveAttribute('aria-checked','true');
 }else{
 const grid=fixture.getByRole('radio',{name:locale==='en'?'Grid':'شبكة'});
 await expect(grid).toHaveAttribute('aria-checked','true');
 const list=fixture.getByRole('radio',{name:locale==='en'?'List':'قائمة'});
 await list.click();await expect(list).toHaveAttribute('aria-checked','true');
 await expect(grid).toHaveAttribute('aria-checked','false');
 }
 for(const width of [390,1440]){await page.setViewportSize({width,height:900});await page.screenshot({path:`${evidence}/${name}-${locale}-${theme}-${width}.png`,fullPage:true,animations:'disabled'});}
 }
});
