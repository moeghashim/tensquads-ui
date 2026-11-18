import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7Q0TS59GMGAYZAXK8C9R9GJ';
const browser=await chromium.launch({args:['--disable-lcd-text','--font-render-hinting=none']});
const context=await browser.newContext();
const page=await context.newPage();
const results=[];
async function scenario(name,run){try{const detail=await run();results.push({name,result:'pass',detail});}catch(e){results.push({name,result:'fail',error:String(e)});}await fs.writeFile(evidence+'/live-results.json',JSON.stringify(results,null,2));}
try{
await page.goto('http://127.0.0.1:5174');
await scenario('React consumer opens customer_schema by mouse, Enter and Space',async()=>{
 const chip=page.getByRole('button',{name:'customer_schema',exact:true});
 await expect(chip).toBeVisible(); await expect(chip.locator('.ts-chip__icon')).toHaveText('§');
 await chip.click();await chip.focus();await page.keyboard.press('Enter');await page.keyboard.press('Space');
 await expect(page.getByLabel('Opened objects')).toHaveText('["customer_schema","customer_schema","customer_schema"]');
 await page.screenshot({path:evidence+'/consumer-actions.png',fullPage:true});return {opened:await page.getByLabel('Opened objects').innerText()};
});
await scenario('Disabled React consumer blocks pointer and keyboard activation and leaves tab order',async()=>{
 const disabled=page.getByRole('button',{name:'locked_schema'});await expect(disabled).toBeDisabled();
 const b=await disabled.boundingBox();await page.mouse.click(b.x+b.width/2,b.y+b.height/2);
 await page.getByRole('button',{name:'customer_schema',exact:true}).focus();await page.keyboard.press('Tab');
 await expect(disabled).not.toBeFocused();await page.keyboard.press('Shift+Tab');await page.keyboard.press('Enter');await page.keyboard.press('Space');
 expect(await page.getByLabel('Opened objects').innerText()).not.toContain('locked_schema');return {opened:await page.getByLabel('Opened objects').innerText()};
});
await scenario('Narrow React consumer wraps a 320-character identifier without clipping or document overflow',async()=>{
 await page.setViewportSize({width:390,height:844});const chip=page.getByRole('button',{name:'customer_schema_'.repeat(20),exact:true});
 const metrics=await chip.evaluate(el=>{const label=el.querySelector('.ts-chip__name');const range=document.createRange();range.selectNodeContents(label);const box=el.getBoundingClientRect();return {height:box.height,width:box.width,clipped:label.scrollWidth>label.clientWidth,lines:range.getClientRects().length,viewport:document.documentElement.clientWidth,content:document.documentElement.scrollWidth};});
 expect(metrics.height).toBeGreaterThan(28);expect(metrics.width).toBeLessThanOrEqual(300);expect(metrics.clipped).toBe(false);expect(metrics.lines).toBeGreaterThan(1);expect(metrics.content).toBeLessThanOrEqual(metrics.viewport);
 await page.screenshot({path:evidence+'/consumer-long-name-mobile.png',fullPage:true});return metrics;
});
await scenario('OpenUI consumer renders supplied invoice icon and navigates by mouse and Enter',async()=>{
 const link=page.getByRole('link',{name:'invoice_schema'});await expect(link.locator('.ts-chip__icon')).toHaveText('⌕');await expect(link).toHaveAttribute('href','#invoice_schema');
 await link.click();expect(new URL(page.url()).hash).toBe('#invoice_schema');await page.evaluate(()=>history.replaceState(null,'',location.pathname));await link.focus();await page.keyboard.press('Enter');expect(new URL(page.url()).hash).toBe('#invoice_schema');return {url:page.url(),icon:await link.locator('.ts-chip__icon').innerText()};
});
await scenario('Chip preview preserves pill sizing, hover, focus, accessibility and mobile layout in en/ltr and ar/rtl light/dark',async()=>{
 const matrix=[];
 for(const [locale,dir] of [['en','ltr'],['ar','rtl']])for(const theme of ['light','dark']){
 await page.setViewportSize({width:1440,height:900});await page.goto(`http://localhost:5173/components/Chip?locale=${locale}&dir=${dir}&theme=${theme}`);await page.addStyleTag({content:'select { appearance: none; padding-inline-end: calc(var(--ts-space-3) + 16px); }'});await page.evaluate(()=>document.fonts.ready);
 await expect(page.locator('html')).toHaveAttribute('dir',dir);await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
 const chip=page.locator('.chip-preview__grid').getByRole('button',{name:'response_schema',exact:true});await page.mouse.move(0,0);
 const metrics=await chip.evaluate(el=>{const s=getComputedStyle(el),icon=getComputedStyle(el.querySelector('.ts-chip__icon'));return {height:el.getBoundingClientRect().height,iconWidth:icon.width,iconHeight:icon.height,radius:s.borderRadius,background:s.backgroundColor,token:s.getPropertyValue('--ts-primary-soft').trim(),text:s.color};});
 expect(metrics.height).toBe(28);expect(metrics.iconWidth).toBe('16px');expect(metrics.iconHeight).toBe('16px');expect(parseFloat(metrics.radius)).toBeGreaterThanOrEqual(14);
 await chip.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');await expect(chip).toBeFocused();await expect(chip).toHaveCSS('outline-width','2px');await expect(chip).toHaveCSS('outline-offset','2px');await expect(chip).toHaveCSS('outline-color',theme==='light'?'rgb(1, 105, 204)':'rgb(2, 133, 255)');
 await chip.hover();await page.waitForTimeout(250);const hover=await chip.evaluate(el=>getComputedStyle(el).backgroundColor);expect(hover).not.toBe(metrics.background);await page.mouse.move(0,0);
 for(const width of [1440,390]){await page.setViewportSize({width,height:900});await page.screenshot({path:`${evidence}/chip-${locale}-${theme}-${width}.png`,fullPage:true,animations:'disabled'});
 const dims=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,content:document.documentElement.scrollWidth}));expect(dims.content).toBeLessThanOrEqual(dims.viewport);
 const long=page.getByRole('button',{name:'this_is_a_long_object_identifier_that_stays_visible'});expect(await long.evaluate(el=>{const n=el.querySelector('.ts-chip__name');return n.scrollWidth<=n.clientWidth})).toBe(true);
 const axe=await new AxeBuilder({page}).analyze();expect(axe.violations).toEqual([]);
 matrix.push({locale,dir,theme,width,...metrics,hover,violations:axe.violations.length,...dims});}
 const link=page.locator('.component-list').getByRole('link',{name:'response_schema'});await expect(link.locator('.ts-chip__icon')).toHaveText('◇');await link.click();expect(new URL(page.url()).hash).toBe('#response_schema');await page.evaluate(()=>history.replaceState(null,'',location.pathname+location.search));await link.focus();await page.keyboard.press('Enter');expect(new URL(page.url()).hash).toBe('#response_schema');
 }return matrix;
});
await scenario('Home gallery includes Chip and all six sibling components in both locales and themes at desktop and mobile widths',async()=>{
 const matrix=[];
 for(const [locale,dir] of [['en','ltr'],['ar','rtl']])for(const theme of ['light','dark'])for(const width of [1440,390]){
 await page.setViewportSize({width,height:900});await page.goto(`http://localhost:5173/?locale=${locale}&dir=${dir}&theme=${theme}`);await page.addStyleTag({content:'select { appearance: none; padding-inline-end: calc(var(--ts-space-3) + 16px); }'});await page.evaluate(()=>document.fonts.ready);
 for(const name of ['Badge','Button','Chip','Field','Input','Menu','Squadmate'])await expect(page.getByRole('link',{name,exact:true})).toBeVisible();
 await page.screenshot({path:`${evidence}/gallery-${locale}-${theme}-${width}.png`,fullPage:true});
 const dims=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,content:document.documentElement.scrollWidth}));expect(dims.content).toBeLessThanOrEqual(dims.viewport);matrix.push({locale,dir,theme,width,...dims});
 }return matrix;
});
}finally{await browser.close();}
console.log(JSON.stringify(results,null,2));if(results.some(x=>x.result==='fail'))process.exitCode=1;
