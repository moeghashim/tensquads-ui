import {test,expect} from '@playwright/test';
import {openPreview} from './helpers/preview';
const evidence='~/.no-mistakes/evidence/01M7PVW5QEA38D4RYKDFYE2EMA';
test('Task 013 bilingual fixtures and visual evidence',async({page})=>{
 for(const name of ['Switch','SegmentedControl'])for(const locale of ['en','ar'] as const)for(const theme of ['light','dark'] as const){
  await openPreview(page,{locale,direction:locale==='ar'?'rtl':'ltr',theme},`/components/${name}`);
  const fixture=page.getByRole('region',{name:locale==='ar'?'عينة OpenUI':'OpenUI fixture'});
  if(name==='Switch'){
   const sw=fixture.getByRole('switch',{name:locale==='ar'?'تحديثات المنتج':'Product updates'});
   await expect(sw).toHaveAttribute('aria-checked','true');await sw.click();await expect(sw).toHaveAttribute('aria-checked','false');
  }else{
   const group=fixture.getByRole('radiogroup',{name:locale==='ar'?'العرض':'View'});
   await expect(group.getByRole('radio',{checked:true})).toHaveCount(1);
   const option=group.getByRole('radio').last();await option.click();await expect(option).toHaveAttribute('aria-checked','true');
  }
  for(const width of [1440,390]){await page.setViewportSize({width,height:900});await page.screenshot({path:`${evidence}/${name}-${locale}-${theme}-${width}.png`,fullPage:true,animations:'disabled'});}
 }
});
