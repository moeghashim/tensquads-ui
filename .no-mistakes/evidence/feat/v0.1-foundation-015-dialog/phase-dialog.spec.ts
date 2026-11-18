import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openPreview, expectThemeFocusRing } from './helpers/preview';
const evidence='~/.no-mistakes/evidence/01M7Q102P8FP7G4TZK07CNF8FC';
const states = [
 {locale:'en',direction:'ltr',theme:'light'}, {locale:'en',direction:'ltr',theme:'dark'},
 {locale:'ar',direction:'rtl',theme:'light'}, {locale:'ar',direction:'rtl',theme:'dark'}
] as const;
test('English dark closed mobile view matches the selected Linux baseline', async ({page})=>{
 await openPreview(page, states[1], '/components/Dialog');
 await page.setViewportSize({width:390,height:900});
 await expect(page.getByRole('button',{name:'Review',exact:true})).toBeVisible();
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.screenshot({path:`${evidence}/dialog-en-dark-closed-390-actual.png`,fullPage:true,animations:'disabled'});
 await expect(page).toHaveScreenshot('dialog-en-dark-closed-390.png',{fullPage:true,animations:'disabled',maxDiffPixelRatio:0.001});
 console.log('Closed English dark 390px: all four triggers visible, no dialog open, rendered pixels match selected baseline within repository tolerance.');
});
test('All Dialog examples remain on screen in both locales and themes and expose accessible content',async({page})=>{
 test.setTimeout(120000);
 for(const state of states){
  await openPreview(page,state,'/components/Dialog');
  const labels=state.locale==='en'?['Open dialog','Edit project','Delete project','Review']:['فتح الحوار','تعديل المشروع','حذف المشروع','مراجعة'];
  await expect(page.getByRole('button',{name:labels[3],exact:true})).toBeVisible();
  await expectThemeFocusRing(page,state.theme);
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:900});
   for(const name of labels){
    const trigger=page.getByRole('button',{name,exact:true});
    await trigger.click();
    const dialog=page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).not.toHaveAttribute('data-starting-style');
    await expect(dialog).toHaveCSS('opacity','1');
    const box=await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x+box!.width).toBeLessThanOrEqual(width); expect(box!.y+box!.height).toBeLessThanOrEqual(900);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
    expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
    if(name===labels[0])await page.screenshot({path:`${evidence}/dialog-${state.locale}-${state.theme}-open-${width}.png`,fullPage:true,animations:'disabled'});
    console.log(JSON.stringify({locale:state.locale,theme:state.theme,width,trigger:name,dialogBounds:box,axeViolations:0,horizontalOverflow:false}));
    await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0); await expect(trigger).toBeFocused();
   }
  }
 }
});
test('Keyboard opening, bidirectional Tab containment, close, Escape, and backdrop dismissal restore focus',async({page})=>{
 await openPreview(page,states[0],'/components/Dialog');
 const trigger=page.getByRole('button',{name:'Edit project',exact:true});
 await trigger.focus(); await page.keyboard.press('Enter');
 const dialog=page.getByRole('dialog',{name:'Edit project',exact:true});
 await expect(dialog).toBeVisible();
 const input=dialog.getByRole('textbox',{name:'Project name'});
 await expect(input).toBeFocused(); await input.fill('Disposable project');
 const save=dialog.getByRole('button',{name:'Save changes'});
 await save.focus(); await page.keyboard.press('Tab'); await expect(input).toBeFocused();
 await page.keyboard.press('Shift+Tab'); await expect(save).toBeFocused();
 await expect(dialog).not.toHaveAttribute('data-starting-style');
 await expect(dialog).toHaveCSS('opacity','1');
 await page.screenshot({path:`${evidence}/dialog-form-keyboard.png`,fullPage:true,animations:'disabled'});
 await save.press('Enter'); await expect(dialog).toHaveCount(0); await expect(trigger).toBeFocused();
 await trigger.press('Space'); await expect(dialog).toBeVisible(); await page.keyboard.press('Escape');
 await expect(dialog).toHaveCount(0); await expect(trigger).toBeFocused();
 await trigger.click(); await expect(dialog).toBeVisible(); await page.mouse.click(5,5);
 await expect(dialog).toHaveCount(0); await expect(trigger).toBeFocused();
 console.log('Form: Enter/Space open, textbox accepts synthetic text, Tab and Shift+Tab wrap, Save/Escape/backdrop dismiss and return focus.');
});
test('English and Arabic OpenUI fixtures open and both actions dismiss without persistent result text',async({page})=>{
 for(const state of [states[0],states[2]]){
  await openPreview(page,state,'/components/Dialog');
  const en=state.locale==='en';
  const region=page.getByRole('region',{name:en?'OpenUI fixture':'عينة OpenUI'});
  const trigger=region.getByRole('button',{name:en?'Review':'مراجعة',exact:true});
  for(const action of en?['Cancel','Add member']:['إلغاء','إضافة العضو']){
   await trigger.click();
   const dialog=page.getByRole('dialog',{name:en?'Review request':'مراجعة الطلب'});
   await expect(dialog).toBeVisible();
   await expect(dialog).toContainText(en?'Check their profile':'راجع');
   await page.screenshot({path:`${evidence}/dialog-openui-${state.locale}.png`,fullPage:true,animations:'disabled'});
   await dialog.getByRole('button',{name:action,exact:true}).press('Enter');
   await expect(dialog).toHaveCount(0); await expect(trigger).toBeFocused();
   await expect(region.getByRole('status')).toHaveCount(0);
   console.log(`${state.locale} OpenUI: ${action} dismisses dialog and returns focus; no persistent status.`);
  }
 }
});
