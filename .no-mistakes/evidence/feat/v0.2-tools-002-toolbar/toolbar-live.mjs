import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const out='~/.no-mistakes/evidence/01M7W7KARBJ0H7PJ2BXN6H5KVD';
const browser=await chromium.launch();
const records=[];
const style=async l=>l.evaluate(el=>{const s=getComputedStyle(el);return {bg:s.backgroundColor,image:s.backgroundImage,color:s.color,width:s.width,height:s.height};});
try {
for(const locale of ['en','ar']) for(const theme of ['light','dark','system']) {
 const context=await browser.newContext({viewport:{width:1440,height:900},colorScheme:theme==='light'?'light':'dark'});
 const page=await context.newPage();
 await page.goto(`http://localhost:5173/components/Toolbar?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}`);
 await page.evaluate(()=>document.fonts.ready);
 const toolbar=page.getByRole('toolbar'); await expect(toolbar).toBeVisible();
 const [pan,select,undo,redo]=await toolbar.getByRole('button').all();
 await expect(pan).toHaveAttribute('aria-pressed','true');
 await page.mouse.move(0,0);
 const pressed=await style(pan), unpressed=await style(select), disabled=await style(redo);
 expect(pressed.bg).not.toBe(unpressed.bg);
 expect(pressed.color).not.toBe(unpressed.color);
 await select.hover();
 const hover=await style(select);
 expect(hover.bg).not.toBe(unpressed.bg);
 const oracle=await select.evaluate(el=>{ const p=document.createElement('span'); p.style.backgroundColor='var(--ts-ghost-hover)';p.style.color='var(--ts-text)';el.append(p);const s=getComputedStyle(p);const r={bg:s.backgroundColor,color:s.color};p.remove();return r;});
 expect(hover.bg).toBe(oracle.bg);expect(hover.color).toBe(oracle.color);
 await expect(page.getByRole('tooltip')).toHaveText(locale==='ar'?'تحديد':'Select');
 await toolbar.screenshot({path:`${out}/states-${locale}-${theme}-unpressed-hover.png`});
 await pan.hover(); const pressedHover=await style(pan);
 expect(pressedHover.color).toBe(pressed.color);
 expect(pressedHover.bg===hover.bg && pressedHover.image===hover.image).toBe(false);
 await redo.hover();expect(await style(redo)).toEqual(disabled);
 await redo.click({force:true}); await expect(pan).toHaveAttribute('aria-pressed','true');await expect(undo).toHaveAttribute('aria-disabled','true');
 await select.click();await expect(select).toHaveAttribute('aria-pressed','true');await expect(pan).toHaveAttribute('aria-pressed','false'); await expect(undo).not.toHaveAttribute('aria-disabled','true');
 await page.mouse.move(0,0); await toolbar.screenshot({path:`${out}/states-${locale}-${theme}-select-pressed.png`});
 await undo.click();await expect(pan).toHaveAttribute('aria-pressed','true');
 await pan.focus(); await page.keyboard.press(locale==='ar'?'ArrowLeft':'ArrowRight');await expect(select).toBeFocused();
 await page.keyboard.press('Space');await expect(select).toHaveAttribute('aria-pressed','true');
 await page.keyboard.press('Home');await expect(pan).toBeFocused();await page.keyboard.press('End');await expect(redo).toBeFocused();
 await page.keyboard.press('Enter');await expect(select).toHaveAttribute('aria-pressed','true');
 await page.keyboard.press('Home');await page.keyboard.press('Enter');await expect(pan).toHaveAttribute('aria-pressed','true');
 expect(await toolbar.getByRole('button').evaluateAll(es=>es.filter(e=>e.tabIndex===0).length)).toBe(1);
 await page.keyboard.press('Tab');expect(await toolbar.evaluate(el=>el.contains(document.activeElement))).toBe(false);
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
 records.push({locale,theme,pressed,unpressed,hover,pressedHover,disabled,result:'pass',actions:'hover unpressed/pressed/disabled; tooltip; disabled click; select; undo; reading-direction arrow; Space; Home; End; disabled Enter; enabled Enter; Tab exit; mobile overflow'});
 await context.close();
}
await writeFile(`${out}/live-states.json`,JSON.stringify(records,null,2));
console.log(JSON.stringify(records,null,2));
} finally {await browser.close();}
