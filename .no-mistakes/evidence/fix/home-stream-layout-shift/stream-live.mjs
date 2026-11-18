import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const evidence = '~/.no-mistakes/evidence/01M7R9KZBZ1DYA7WMVKJET5FGC';
const browser = await chromium.launch();
const results = [];
try {
for (const width of [1440, 390]) for (const locale of ['en','ar']) {
 const page = await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 const replay=locale==='en'?'Replay':'إعادة العرض';
 await page.goto(`http://localhost:5173/?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${width===1440?'light':'dark'}`);
 await page.evaluate(()=>document.fonts.ready);
 await expect(page.locator('.stream-code__footer')).toContainText('7/7');
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForTimeout(250);
 await page.locator('.stream-demo').scrollIntoViewIfNeeded();
 await page.evaluate(()=>{
  window.samples=[]; window.sampling=true;
  const sample=()=>{
   const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y+scrollY,w:r.width,h:r.height}};
   window.samples.push({t:performance.now(),footer:document.querySelector('.stream-code__footer').innerText,demo:rect('.stream-demo'),screen:rect('.stream-screen'),next:rect('.home-section'),field:rect('.stream-screen__field'),settings:rect('.stream-screen__settings'),actions:rect('.stream-screen__actions')});
   if(window.sampling)requestAnimationFrame(sample);
  };sample();
 });
 await page.getByRole('button',{name:replay,exact:true}).click();
 await expect(page.locator('.stream-screen').getByRole('textbox')).toHaveCount(0);
 const focus = await page.locator('.stream-screen input').first().evaluate(el=>{el.focus();return document.activeElement===el});
 expect(focus).toBe(false);
 await page.keyboard.press('Tab');
 expect(await page.evaluate(()=>!!document.activeElement.closest('.stream-screen [inert]'))).toBe(false);
 await page.screenshot({path:`${evidence}/${locale}-${width}-start.png`});
 await page.waitForFunction(()=>document.querySelector('.stream-code__footer').innerText.includes('3/7'));
 await page.screenshot({path:`${evidence}/${locale}-${width}-partial.png`});
 await expect(page.locator('.stream-code__footer')).toContainText('7/7');
 await page.waitForTimeout(250);
 const samples=await page.evaluate(()=>{window.sampling=false;return window.samples});
 const ranges={};
 for(const part of ['demo','screen','next','field','settings','actions'])for(const axis of ['x','y','w','h']){
  const values=samples.map(s=>s[part][axis]);ranges[`${part}.${axis}`]=Math.max(...values)-Math.min(...values);
 }
 const stable = Math.max(...Object.values(ranges)) <= 1;
 expect(stable, JSON.stringify(ranges)).toBe(true);
 const steps=[...new Set(samples.map(s=>s.footer.match(/(\d)\/7/)?.[1]).filter(Boolean))].sort();
 expect(steps).toEqual(['0','1','2','3','4','5','6','7']);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 expect(overflow).toBe(0);
 await page.screenshot({path:`${evidence}/${locale}-${width}-complete.png`,fullPage:true});
 expect(errors).toEqual([]);
 results.push({scenario:'Replay reserves layout and hidden controls are inaccessible',stable,locale,width,steps,frames:samples.length,ranges,overflow,hiddenFocusRejected:!focus,errors});
 await writeFile(`${evidence}/${locale}-${width}-frames.json`,JSON.stringify(samples,null,2));
 // Adversarial: edit all controls, then replay twice, including interruption.
 const pane=page.locator('.stream-screen');
 await pane.getByRole('textbox').fill('Edited store');await pane.getByRole('switch').click();
 await pane.getByRole('radio',{name:locale==='en'?'Monthly':'شهري',exact:true}).click();
 await page.getByRole('button',{name:replay,exact:true}).click();
 await page.waitForTimeout(400);
 await page.getByRole('button',{name:replay,exact:true}).click();
 await expect(page.locator('.stream-code__footer')).toContainText('7/7');
 await expect(pane.getByRole('textbox')).toHaveValue(locale==='en'?'Bannaa Market':'متجر بنّاء');
 await expect(pane.getByRole('switch')).toBeChecked();
 await expect(pane.getByRole('radio',{name:locale==='en'?'Weekly':'أسبوعي',exact:true})).toBeChecked();
 results.push({scenario:'Edited controls reset after interrupted Replay',locale,width,result:'pass'});
 await page.close();
}
for(const locale of ['en','ar']) {
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await page.goto(`http://localhost:5173/?locale=${locale}&dir=${locale==='en'?'ltr':'rtl'}&theme=light`);
 await expect(page.locator('.stream-code__footer')).toContainText('7/7');
 await expect(page.locator('.stream-screen').getByRole('textbox')).toBeVisible();
 expect(await page.locator('.stream-reveal').evaluateAll(els=>els.every(el=>getComputedStyle(el).transitionDuration==='0s'))).toBe(true);
 await page.getByRole('button',{name:locale==='en'?'Replay':'إعادة العرض',exact:true}).click();
 await expect(page.locator('.stream-code__footer')).toContainText('7/7');
 await page.screenshot({path:`${evidence}/${locale}-reduced-motion.png`});
 results.push({scenario:'Reduced motion displays complete stream immediately and Replay remains complete',locale,result:'pass'});
 await page.close();
}
} catch(e) {results.push({failure:e.stack});process.exitCode=1;} finally {
 await browser.close(); await writeFile(`${evidence}/live-results.json`,JSON.stringify(results,null,2));
 console.log(JSON.stringify(results,null,2));
}
