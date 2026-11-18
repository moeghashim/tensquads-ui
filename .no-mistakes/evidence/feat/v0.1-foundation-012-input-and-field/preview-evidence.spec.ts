import {test,expect} from '@playwright/test';
import {openPreview,expectNoHorizontalScroll} from './helpers/preview';
import {writeFileSync} from 'node:fs';
const evidence='~/.no-mistakes/evidence/01M7PW8P4S5GKXNZ25E44Z2QJ6';
test('capture live Input and Field preview evidence and localized fixture values',async({page})=>{
 const observations=[];
 for(const component of ['Input','Field']) for(const locale of ['en','ar'] as const) for(const theme of ['light','dark'] as const){
  await openPreview(page,{locale,direction:locale==='ar'?'rtl':'ltr',theme},`/components/${component}`);
  const fixture=page.getByRole('region',{name:locale==='en'?'OpenUI fixture':'عينة OpenUI'}).getByRole('textbox');
  await expect(fixture).toHaveValue(locale==='en'?'Northstar':'بنّاء');
  await expect(fixture).toHaveAccessibleName(component==='Input'?(locale==='en'?'Search projects':'ابحث عن المشاريع'):(locale==='en'?'Project name':'اسم المشروع'));
  if(component==='Field') await expect(fixture).toHaveAccessibleDescription(locale==='en'?'Use a name your team recognizes.':'استخدم اسماً يعرفه فريقك.');
  const disabled=page.getByRole('textbox',{name:locale==='en'?'Disabled':'معطّل',exact:true});
  const readOnly=page.getByRole('textbox',{name:locale==='en'?'Read only':'للقراءة فقط',exact:true});
  await expect(disabled).toBeDisabled();
  await readOnly.focus();await page.keyboard.type('attempt');
  await expect(readOnly).toHaveValue(locale==='en'?'Read only':'للقراءة');
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:900});
   await page.screenshot({path:`${evidence}/${component.toLowerCase()}-${locale}-${theme}-${width}.png`,fullPage:true,animations:'disabled',caret:'hide'});
  }
  await expectNoHorizontalScroll(page);
  observations.push({component,locale,theme,fixtureValue:await fixture.inputValue(),readOnlyValue:await readOnly.inputValue(),disabled:true,mobileOverflow:false});
 }
 writeFileSync(`${evidence}/preview-observations.json`,JSON.stringify(observations,null,2));
});
