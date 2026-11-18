import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const evidence='~/.no-mistakes/evidence/01M7PVSP7RFJCWRM65H4X017SS';
const browser=await chromium.launch({headless:true,args:['--disable-lcd-text','--font-render-hinting=none']});
const page=await browser.newPage({viewport:{width:390,height:900}});
const results=[];
try {
 await page.goto('http://127.0.0.1:5174/.chip-validation/index.html');
 const react=page.getByRole('region',{name:'React consumer'});
 const chip=react.getByRole('button',{name:'customer_schema',exact:true});
 await chip.waitFor();await page.evaluate(()=>document.fonts.ready);
 await chip.click();await page.keyboard.press('Enter');await page.keyboard.press('Space');
 assert.equal(await page.locator('#opened').textContent(),'customer_schema');assert.equal(await page.locator('#count').textContent(),'3');
 assert.equal(await chip.getAttribute('aria-pressed'),null);
 const style=await chip.evaluate(el=>{const s=getComputedStyle(el);return {height:el.getBoundingClientRect().height,background:s.backgroundColor,outline:s.outlineWidth,offset:s.outlineOffset,icon:el.querySelector('.ts-chip__icon').textContent}});
 assert.equal(style.height,28);assert.equal(style.icon,'◇');
 results.push({scenario:'React mouse Enter Space',opened:'customer_schema',count:3,style});
 const disabled=react.getByRole('button',{name:'disabled_schema'});
 assert(await disabled.isDisabled());
 await disabled.evaluate(el=>el.click());await disabled.focus();assert(!(await disabled.evaluate(el=>el===document.activeElement)));
 const box=await disabled.boundingBox();await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
 await chip.focus();await page.keyboard.press('Tab');assert(!(await disabled.evaluate(el=>el===document.activeElement)));
 assert.equal(await page.locator('#count').textContent(),'3');results.push({scenario:'Disabled blocks click focus tab',count:3});
 const long=react.getByRole('button').nth(2);
 const geometry=await long.evaluate(el=>{const n=el.querySelector('.ts-chip__name');const s=getComputedStyle(n);return {text:n.textContent,client:n.clientWidth,scroll:n.scrollWidth,height:el.getBoundingClientRect().height,overflow:s.overflow,textOverflow:s.textOverflow,document:document.documentElement.scrollWidth,viewport:innerWidth}});
 assert(geometry.text.length>200);assert(geometry.height>28);assert(geometry.scroll<=geometry.client);assert(geometry.document<=geometry.viewport);assert.notEqual(geometry.textOverflow,'ellipsis');
 await long.click();assert.equal(await page.locator('#opened').textContent(),geometry.text);results.push({scenario:'Long identifier preserved and opens at 390px',...geometry});
 await chip.focus();await page.screenshot({path:`${evidence}/react-consumer-390.png`,fullPage:true});
 const openui=page.getByRole('region',{name:'OpenUI consumer'}).getByRole('button',{name:'customer_schema'});
 const before=await page.locator('#count').textContent();await openui.click();await page.keyboard.press('Enter');await page.keyboard.press('Space');
 const observed={scenario:'OpenUI icon and opening action',icon:await openui.locator('.ts-chip__icon').textContent(),before,after:await page.locator('#count').textContent(),html:await openui.evaluate(el=>el.outerHTML)};
 results.push({...observed,result:observed.icon&&observed.after!==before?'pass':'fail'});
 await page.screenshot({path:`${evidence}/openui-inert-390.png`,fullPage:true});
 for(const locale of ['en','ar'])for(const theme of ['light','dark']){
  const dir=locale==='ar'?'rtl':'ltr';
  await page.goto(`http://localhost:5173/components/Chip?locale=${locale}&dir=${dir}&theme=${theme}`);
  const fixture=page.getByRole('region',{name:locale==='en'?'OpenUI fixture':'عينة OpenUI'});
  await fixture.getByRole('button',{name:'response_schema'}).waitFor();await page.evaluate(()=>document.fonts.ready);
  for(const width of [1440,390]){await page.setViewportSize({width,height:900});await page.screenshot({path:`${evidence}/chip-${locale}-${theme}-${width}.png`,fullPage:true});}
  results.push({scenario:'Localized fixture round trip',locale,dir,theme,name:await fixture.getByRole('button').textContent()});
 }
 await writeFile(`${evidence}/consumer-results.json`,JSON.stringify(results,null,2));
 console.log(JSON.stringify(results,null,2));
} finally {await browser.close();}
