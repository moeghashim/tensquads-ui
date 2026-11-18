import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const require=createRequire(process.cwd()+'/package.json');
const {chromium,expect}=require('@playwright/test');
const out='~/.no-mistakes/evidence/01M7PRG7NK22K1E5MT11WVRXH0';
const browser=await chromium.launch();
const context=await browser.newContext();const page=await context.newPage();
const observations=[];
try{
 await page.goto('http://127.0.0.1:5174');await page.evaluate(()=>document.fonts.ready);
 const save=page.getByRole('button',{name:'Save'});
 await expect(save).toHaveCSS('color','rgb(255, 255, 255)');
 await expect(save).toHaveCSS('background-color','rgb(224, 46, 42)');
 for(const [key,button] of [['button',save],['link',page.getByRole('link',{name:'Next'})]]){
  await expect(button).toHaveClass(/ready/);await button.focus();await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-busy','true');await expect(button).toHaveClass(/saving/);
  await expect(button).toBeFocused();await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(key=>window.phaseCalls[key],key),1);
  await page.screenshot({path:`${out}/consumer-${key}-pending.png`,fullPage:true});
  await page.evaluate(key=>window.phaseFinish[key](),key);
  await expect(button).not.toHaveAttribute('aria-busy');await expect(button).toHaveClass(/ready/);
  await expect(button).toHaveClass(/ts-button/);
  observations.push({element:key,readySavingReady:true,duplicateCallsBlocked:true,retainedFocus:true});
 }
 const disabled=page.getByRole('button',{name:'Unavailable'});
 await disabled.focus();await expect(disabled).toBeFocused();await page.keyboard.press('Enter');await page.keyboard.press('Space');
 assert.equal(await page.evaluate(()=>window.phaseCalls.disabled),0);
 observations.push({focusableDisabled:'retains focus; Enter and Space do not invoke handler',distributedDangerColors:{text:'rgb(255, 255, 255)',background:'rgb(224, 46, 42)'}});
 await writeFile(`${out}/consumer-observations.json`,JSON.stringify(observations,null,2));console.log(JSON.stringify(observations,null,2));
}finally{await browser.close()}
