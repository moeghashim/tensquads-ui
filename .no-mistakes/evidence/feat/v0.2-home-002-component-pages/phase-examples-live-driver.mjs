import {chromium,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const out='~/.no-mistakes/evidence/01M7R3QX693WMP0YQPJGRV86E1';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});const checks=[];
try{
for(const locale of ['en','ar']){
 const ar=locale==='ar',dir=ar?'rtl':'ltr';
 const go=async n=>{await p.goto(`http://localhost:5173/components/${n}?locale=${locale}&dir=${dir}&theme=dark`);await p.evaluate(()=>document.fonts.ready);};
 await go('Dialog');
 for(const [i,label] of (ar?['فتح الحوار','تعديل المشروع','حذف المشروع']:['Open dialog','Edit project','Delete project']).entries()){
  const trigger=p.getByRole('button',{name:label,exact:true});await trigger.focus();await p.keyboard.press('Enter');
  const d=p.getByRole('dialog');await expect(d).toBeVisible();
  if(i===0)await expect(d.getByRole('button',{name:ar?'إغلاق':'Close',exact:true})).toBeVisible();
  if(i===1){await d.getByRole('textbox').fill(ar?'مشروع الاختبار':'Disposable project');await expect(d.getByRole('button',{name:ar?'حفظ التغييرات':'Save changes'})).toBeVisible();}
  if(i===2){await expect(d.getByRole('button',{name:label,exact:true})).toBeVisible();await p.screenshot({path:`${out}/dialog-destructive-open-${locale}.png`,fullPage:true,animations:'disabled'});}
  if(i===1)await p.screenshot({path:`${out}/dialog-form-open-${locale}.png`,fullPage:true,animations:'disabled'});
  await p.keyboard.press('Escape');await expect(d).toHaveCount(0);await expect(trigger).toBeFocused();
 }
 checks.push({locale,dialog:'Simple close, editable form with save/cancel, destructive action, keyboard opening and Escape focus return'});
 await go('Menu');await p.keyboard.press('Escape');
 const trigger=p.locator('[data-slot="menu-trigger"]').first();await trigger.focus();await p.keyboard.press('ArrowDown');
 await expect(p.getByRole('menuitem',{name:ar?'فتح المشروع':'Open project'}).first()).toBeFocused();
 await expect(p.locator('[data-slot="menu-item"][data-disabled]').first()).toHaveAttribute('aria-disabled','true');
 await expect(p.locator('[data-slot="menu-item"][data-destructive]').first()).toBeVisible();
 await p.keyboard.press('Escape');await expect(trigger).toBeFocused();
 checks.push({locale,menu:'Keyboard opens, disabled and destructive actions retained, Escape returns focus'});
 await go('Tooltip');await p.keyboard.press('Tab');
 const items=p.locator('.tooltip-preview__item');
 for(let i=0;i<4;i++){
  await items.nth(i).getByRole('button',{name:ar?'إضافة عنصر':'Add item'}).focus();
  const tip=p.locator('[data-slot="tooltip-content"][data-open]');await expect(tip).toBeVisible();
  const physical=(ar?['top','left','bottom','right']:['top','right','bottom','left'])[i];
  await expect(tip).toHaveAttribute('data-side',physical);
  if(ar&&i===1)await p.screenshot({path:`${out}/tooltip-rtl-logical-end.png`,fullPage:true,animations:'disabled'});
 }
 checks.push({locale,tooltip:'All four placements open by focus; horizontal logical placements mirror in RTL'});
}
await writeFile(`${out}/interactive-examples-results.json`,JSON.stringify({result:'pass',checks},null,2));console.log(JSON.stringify(checks));
}catch(error){await writeFile(`${out}/interactive-examples-results.json`,JSON.stringify({result:'fail',checks,error:String(error)},null,2));throw error;}finally{await b.close();}
