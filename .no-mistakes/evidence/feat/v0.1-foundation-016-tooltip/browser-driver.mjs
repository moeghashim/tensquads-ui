import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7Q0HVEDANQ66H639YJDYJWV';
const browser=await chromium.launch({args:['--disable-lcd-text','--font-render-hinting=none']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const results=[];
async function scenario(name,fn){try{const observations=await fn();results.push({name,result:'pass',observations});}catch(e){await page.screenshot({path:`${evidence}/failure-${results.length}.png`,fullPage:true});results.push({name,result:'fail',error:e.stack});}}
const tipFor=async trigger=>page.locator(`[id="${await trigger.getAttribute('aria-describedby')}"]`);
try {
await scenario('Production preview: keyboard focus opens a named and described trigger; Escape closes without moving focus',async()=>{
 await page.goto('http://127.0.0.1:5173/components/Tooltip?locale=en&dir=ltr&theme=light');
 await page.getByRole('heading',{name:'Tooltip',exact:true}).waitFor();
 await page.keyboard.press('Tab');await page.keyboard.press('Tab');
 const trigger=page.getByRole('button',{name:'Add item'}).first();await expect(trigger).toBeFocused();
 const tip=await tipFor(trigger);await expect(tip).toBeVisible();await expect(tip).toContainText('Create a new item');
 await expect(trigger).toHaveAccessibleName('Add item');await expect(trigger).toHaveAccessibleDescription('Create a new item');
 await expect(trigger).toHaveAttribute('aria-keyshortcuts',/K/i);
 await page.screenshot({path:`${evidence}/keyboard-focus.png`,fullPage:true});
 await page.keyboard.press('Escape');await expect(tip).not.toBeVisible();await expect(trigger).toBeFocused();
 await page.keyboard.press('Tab');await expect(trigger).not.toBeFocused();
 return 'Tab opened the hint with aria-describedby and aria-keyshortcuts; Escape hid it and retained trigger focus.';
});
await scenario('Production preview: four placements, arrow, shortcut, compact colors, and no overflow at 1440/390 in EN/AR and light/dark',async()=>{
 const observations=[];
 for(const locale of ['en','ar'])for(const theme of ['light','dark'])for(const width of [1440,390]){
 await page.setViewportSize({width,height:900});
 await page.goto(`http://127.0.0.1:5173/components/Tooltip?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}`);
 await page.evaluate(()=>document.fonts.ready);
 await page.keyboard.press('Tab');await page.keyboard.press('Tab');
 const rows=page.locator('.tooltip-preview__item');
 for(let i=0;i<4;i++){
 const trigger=rows.nth(i).getByRole('button');await trigger.focus();
 const tip=await tipFor(trigger);await expect(tip).toBeVisible();
 const side=await tip.getAttribute('data-side');const t=await trigger.boundingBox(),b=await tip.boundingBox();
 if(side==='top')expect(b.y+b.height).toBeLessThanOrEqual(t.y+1);
 if(side==='bottom')expect(b.y).toBeGreaterThanOrEqual(t.y+t.height-1);
 if(side==='left')expect(b.x+b.width).toBeLessThanOrEqual(t.x+1);
 if(side==='right')expect(b.x).toBeGreaterThanOrEqual(t.x+t.width-1);
 expect(b.x).toBeGreaterThanOrEqual(0);expect(b.x+b.width).toBeLessThanOrEqual(width+1);
 if(width===1440)expect(side).toBe(['top','right','bottom','left'][i]);
 const arrow=tip.locator('[data-slot="tooltip-arrow"]');await expect(arrow).toHaveAttribute('data-side',side);
 await expect(arrow).toBeVisible();const shortcut=tip.locator('[data-slot="tooltip-shortcut"]');await expect(shortcut).toContainText(/K/i);await expect(shortcut).toHaveAttribute('aria-hidden','true');
 const colors=await tip.evaluate(el=>{const c=getComputedStyle(el);return {bg:c.backgroundColor,fg:c.color,tokenBg:c.getPropertyValue('--ts-tooltip-compact-bg').trim(),tokenFg:c.getPropertyValue('--ts-gray-0').trim(),arrow:getComputedStyle(el.querySelector('[data-slot="tooltip-arrow"]')).backgroundColor};});
 // Token pair mandated by design/tokens.json; compare resolved paint with an independent reference element.
 const expected=await page.evaluate(()=>{const el=document.createElement('span');el.style.background='var(--ts-tooltip-compact-bg)';el.style.color='var(--ts-gray-0)';document.body.append(el);const c=getComputedStyle(el);const out={bg:c.backgroundColor,fg:c.color};el.remove();return out;});
 expect(colors.bg).toBe(expected.bg);expect(colors.fg).toBe(expected.fg);expect(colors.arrow).toBe(expected.bg);
 observations.push({locale,theme,width,requested:['top','right','bottom','left'][i],side,colors});
 }
 await rows.first().getByRole('button').focus();
 await page.screenshot({path:`${evidence}/tooltip-${locale}-${theme}-${width}.png`,fullPage:true,animations:'disabled'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
 }
 return observations;
});
await scenario('Production OpenUI fixtures: English and Arabic streams render named triggers and localized hover hints',async()=>{
 const observations=[];
 for(const locale of ['en','ar']){
 await page.goto(`http://127.0.0.1:5173/components/Tooltip?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=light`);
 const fixture=page.getByRole('region',{name:locale==='en'?'OpenUI fixture':'عينة OpenUI'});
 const trigger=fixture.getByRole('button',{name:locale==='en'?'Add item':'إضافة عنصر'});
 await expect(trigger).toBeVisible();await trigger.hover();const tip=await tipFor(trigger);await expect(tip).toBeVisible();
 await expect(tip).toHaveText(locale==='en'?'Create a new item':'أنشئ عنصراً جديداً');
 await page.screenshot({path:`${evidence}/openui-${locale}.png`,fullPage:true});
 await page.evaluate(()=>window.__hoverFocus=document.activeElement);
 await tip.hover();await expect(tip).toBeVisible();
 await page.mouse.move(1,899);await expect(tip).not.toBeVisible();
 expect(await page.evaluate(()=>window.__hoverFocus===document.activeElement)).toBe(true);
 observations.push({locale,trigger:await trigger.getAttribute('aria-label'),description:await tip.textContent(),focusUnchanged:await page.evaluate(()=>window.__hoverFocus===document.activeElement)});
 }
 return observations;
});
await scenario('Disposable real Tooltip consumer: disabled guard, delayed hover cancellation, controlled callbacks, render props, toggle and edge flip',async()=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('http://127.0.0.1:5174');
 const edge=page.getByRole('button',{name:'Edge help'});const edgeTip=await tipFor(edge);await expect(edgeTip).toBeVisible();await expect(edgeTip).toHaveAttribute('data-side','bottom');
 await page.screenshot({path:`${evidence}/consumer-edge-flip.png`,fullPage:true});
 await page.keyboard.press('Escape');await expect(edgeTip).not.toBeVisible();
 const disabled=page.getByRole('button',{name:'Disabled help'});const disabledTip=await tipFor(disabled);
 await disabled.hover();await page.waitForTimeout(700);await expect(disabledTip).not.toBeVisible();await disabled.focus();await expect(disabledTip).not.toBeVisible();
 await page.mouse.move(1,899);await page.getByRole('button',{name:'Open controlled state'}).focus();await page.waitForTimeout(2000);
 const delayed=page.getByRole('button',{name:'Delayed help'});const delayedTip=await tipFor(delayed);
 await delayed.hover();await page.waitForTimeout(150);await expect(delayedTip).not.toBeVisible();await page.mouse.move(1,899);await page.waitForTimeout(650);await expect(delayedTip).not.toBeVisible();
 await delayed.hover();await expect(delayedTip).toBeVisible();await delayedTip.hover();await expect(delayedTip).toBeVisible();await page.mouse.move(1,899);await page.waitForTimeout(80);await expect(delayedTip).toBeVisible();await expect(delayedTip).not.toBeVisible();
 const controlled=page.getByRole('button',{name:'Controlled help'});await controlled.focus();const ctip=await tipFor(controlled);await expect(ctip).toBeVisible();await expect(ctip).toHaveJSProperty('tagName','ASIDE');await expect(controlled).toHaveAttribute('data-render-open','true');await expect(page.getByRole('status',{name:'Open events'})).toContainText('true:trigger-focus');
 await page.keyboard.press('Escape');await expect(ctip).not.toBeVisible();await expect(controlled).toBeFocused();await expect(page.getByRole('status',{name:'Open events'})).toContainText('false:escape-key');
 await page.getByRole('button',{name:'Open controlled state'}).click();await expect(ctip).toBeVisible();await page.screenshot({path:`${evidence}/consumer-controlled.png`,fullPage:true});await page.getByRole('button',{name:'Close controlled state'}).click();await expect(ctip).not.toBeVisible();
 const touch=page.getByRole('button',{name:'Touch help'});await touch.click();const ttip=await tipFor(touch);await expect(ttip).toBeVisible();await touch.click();await expect(ttip).not.toBeVisible();
 return {events:await page.getByRole('status',{name:'Open events'}).textContent(),guards:'disabled stays closed; early pointer exit cancels 600ms hover; 300ms close delay honored',render:'button render function receives open state; content renders as aside',edge:'top request flips bottom at viewport edge',toggle:'press opens and closes'};
});
} finally {await browser.close();await writeFile(`${evidence}/live-results.json`,JSON.stringify(results,null,2));}
console.log(JSON.stringify(results,null,2));if(results.some(r=>r.result==='fail'))process.exitCode=1;
