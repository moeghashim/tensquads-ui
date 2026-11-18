import { chromium } from '@playwright/test';
import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
const evidence='~/.no-mistakes/evidence/01M7Q0TS59GMGAYZAXK8C9R9GJ';
const log=[];const browser=await chromium.launch({args:['--disable-lcd-text','--font-render-hinting=none']});
try {const context=await browser.newContext({viewport:{width:390,height:900}});const page=await context.newPage();
page.on('pageerror',e=>log.push({pageError:e.message}));
await page.goto('http://127.0.0.1:5174');
const chip=page.getByRole('button',{name:'customer_schema',exact:true});
await chip.waitFor();await chip.click();await chip.focus();await page.keyboard.press('Enter');await page.keyboard.press('Space');
assert.equal(await page.getByRole('status',{name:'Opened objects'}).textContent(),'customer_schema,customer_schema,customer_schema');
assert.equal(await chip.locator('svg').count(),1);
log.push({scenario:'React consumer mouse/Enter/Space',opened:await page.getByRole('status',{name:'Opened objects'}).textContent()});
const disabled=page.getByRole('button',{name:'disabled_object'});assert.equal(await disabled.isDisabled(),true);
await disabled.click({force:true});await disabled.evaluate(el=>el.focus());assert.equal(await disabled.evaluate(el=>el===document.activeElement),false);
await chip.focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.textContent),'⌕this_is_a_long_object_identifier_that_stays_visible');
assert.equal(await page.getByRole('status',{name:'Opened objects'}).textContent(),'customer_schema,customer_schema,customer_schema');
log.push({scenario:'Disabled consumer',clickIgnored:true,focusRejected:true,tabSkipped:true});
const link=page.getByRole('link',{name:'invoice_schema'});assert.equal(await link.locator('.ts-chip__icon').textContent(),'⌕');await link.click();assert.equal(new URL(page.url()).hash,'#invoice_schema');await page.evaluate(()=>history.replaceState(null,'','/'));await link.focus();await page.keyboard.press('Space');assert.equal(new URL(page.url()).hash,'');await page.keyboard.press('Enter');assert.equal(new URL(page.url()).hash,'#invoice_schema');
log.push({scenario:'Synthetic OpenUI invoice_schema',icon:'⌕',clickAndEnterDestination:'#invoice_schema',spaceUsesNativeLink:true});
await page.screenshot({path:`${evidence}/consumer.png`,fullPage:true});
for(const locale of ['en','ar'])for(const theme of ['light','dark']){
const dir=locale==='ar'?'rtl':'ltr';await page.goto(`http://127.0.0.1:5175/components/Chip?locale=${locale}&dir=${dir}&theme=${theme}`);await page.addStyleTag({content:'select { appearance:none;padding-inline-end:calc(var(--ts-space-3) + 16px); }'});await page.evaluate(()=>document.fonts.ready);
const first=page.locator('.chip-preview__grid').getByRole('button',{name:'response_schema',exact:true});await first.waitFor();await first.focus();
const style=await first.evaluate(el=>{const s=getComputedStyle(el);return {height:el.getBoundingClientRect().height,fill:s.backgroundColor,token:getComputedStyle(document.documentElement).getPropertyValue('--ts-primary-soft').trim(),outline:s.outlineWidth,offset:s.outlineOffset,color:s.outlineColor,radius:s.borderRadius,icon:el.querySelector('.ts-chip__icon').getBoundingClientRect().width};});
assert.equal(style.height,28);assert.equal(style.icon,16);assert.equal(style.outline,'2px');assert.equal(style.offset,'2px');assert.equal(style.color,theme==='light'?'rgb(1, 105, 204)':'rgb(2, 133, 255)');
const fills=await first.evaluate(el=>{let s=getComputedStyle(el);el.style.background='var(--ts-primary-soft)';let expected=getComputedStyle(el).backgroundColor;el.style.removeProperty('background');return {actual:s.backgroundColor,expected};});assert.equal(fills.actual,fills.expected);
await first.hover();await page.waitForTimeout(250);const hover=await first.evaluate(el=>{let actual=getComputedStyle(el).backgroundColor;el.style.background='var(--ts-primary-soft-hover)';let expected=getComputedStyle(el).backgroundColor;el.style.removeProperty('background');return {actual,expected};});assert.equal(hover.actual,hover.expected);await page.mouse.move(0,0);
const long=page.getByRole('button',{name:'this_is_a_long_object_identifier_that_stays_visible'});const dimensions=await long.evaluate(el=>{let name=el.querySelector('.ts-chip__name');let r=name.getBoundingClientRect();return {text:name.textContent,height:el.getBoundingClientRect().height,width:el.getBoundingClientRect().width,client:name.clientWidth,scroll:name.scrollWidth,overflow:getComputedStyle(name).overflow,textOverflow:getComputedStyle(name).textOverflow,viewport:document.documentElement.clientWidth,document:document.documentElement.scrollWidth};});assert.equal(dimensions.text,'this_is_a_long_object_identifier_that_stays_visible');assert.ok(dimensions.height>28);assert.ok(dimensions.scroll<=dimensions.client);assert.ok(dimensions.document<=dimensions.viewport);assert.notEqual(dimensions.textOverflow,'ellipsis');
const axe=await new AxeBuilder({page}).analyze();assert.equal(axe.violations.length,0,JSON.stringify(axe.violations));
for(const width of [1440,390]){await page.setViewportSize({width,height:900});await page.screenshot({path:`${evidence}/chip-${locale}-${theme}-${width}.png`,fullPage:true});}
log.push({scenario:'Preview styles, focus, long identifier and accessibility',locale,theme,style,hover,dimensions,axeViolations:axe.violations.length});
}
fs.writeFileSync(`${evidence}/live-results.json`,JSON.stringify(log,null,2));console.log(JSON.stringify(log,null,2));
}finally{await browser.close();}
