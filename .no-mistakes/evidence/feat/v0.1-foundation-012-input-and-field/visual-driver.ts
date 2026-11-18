import {test, expect} from '@playwright/test';
import {openPreview,expectAccessible,expectNoHorizontalScroll} from './helpers/preview';
const evidence='~/.no-mistakes/evidence/01M7PW8P4S5GKXNZ25E44Z2QJ6';
for(const component of ['Input','Field'])test(`${component} actual visual matrix and state guards`,async({page})=>{
 for(const locale of ['en','ar'] as const)for(const theme of ['light','dark'] as const){
  const direction=locale==='en'?'ltr':'rtl';
  await openPreview(page,{locale,direction,theme},`/components/${component}`);
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:900});
   await page.screenshot({path:`${evidence}/${component}-${locale}-${theme}-${width}.png`,fullPage:true,animations:'disabled',caret:'hide'});
  }
  await expectNoHorizontalScroll(page);
  await expectAccessible(page);
  const inputs=page.getByRole('textbox');
  const disabled=inputs.nth(3),readOnly=inputs.nth(4);
  await expect(disabled).toBeDisabled();
  await expect(readOnly).toHaveAttribute('readonly','');
  const original=await readOnly.inputValue();
  await readOnly.focus();await page.keyboard.type('changed');await expect(readOnly).toHaveValue(original);
  const first=inputs.first();
  await first.focus();await page.keyboard.type(locale==='en'?'Atlas':'مشروع');
  await expect(first).toHaveValue(locale==='en'?'Atlas':'مشروع');
  await page.keyboard.press('Tab');await expect(inputs.nth(1)).toBeFocused();
  const ring=await inputs.nth(1).evaluate(el=>{const s=getComputedStyle(el);return {width:s.outlineWidth,offset:s.outlineOffset,color:s.outlineColor}});
  expect(ring).toEqual({width:'2px',offset:'2px',color:theme==='light'?'rgb(1, 105, 204)':'rgb(2, 133, 255)'});
  await page.keyboard.press('Tab');await expect(inputs.nth(2)).toBeFocused();
  await page.keyboard.press('Tab');await expect(readOnly).toBeFocused();
  const fixture=page.getByRole('region',{name:locale==='en'?'OpenUI fixture':'عينة OpenUI'});
  const fixtureInput=fixture.getByRole('textbox',{name:component==='Input'?(locale==='en'?'Search projects':'ابحث عن المشاريع'):(locale==='en'?'Project name':'اسم المشروع')});
  await expect(fixtureInput).toBeVisible();await fixtureInput.fill(locale==='en'?'Edited fixture':'عينة معدلة');await expect(fixtureInput).toHaveValue(locale==='en'?'Edited fixture':'عينة معدلة');
  if(component==='Field'){
   const invalid=page.locator('[data-slot="field"][data-invalid] input');
   await expect(invalid).toHaveAttribute('aria-invalid','true');
   await expect(invalid).toHaveAccessibleDescription(locale==='en'?'This field is required.':'هذا الحقل مطلوب.');
   await page.getByText(locale==='en'?'Empty':'فارغ',{exact:true}).click();await expect(first).toBeFocused();
  }
 }
});
