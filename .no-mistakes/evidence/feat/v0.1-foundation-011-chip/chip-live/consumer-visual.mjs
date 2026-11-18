import {chromium,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7PVSP7RFJCWRM65H4X017SS/chip-live';
const browser=await chromium.launch({args:['--disable-lcd-text','--font-render-hinting=none']});
const page=await browser.newPage();const results=[];
try {
 for(const locale of ['en','ar'])for(const theme of ['light','dark']){
 const dir=locale==='ar'?'rtl':'ltr';
 for(const width of [1440,390]){
 await page.setViewportSize({width,height:900});
 await page.goto(`http://localhost:5187/components/Chip?locale=${locale}&dir=${dir}&theme=${theme}`);
 await page.evaluate(()=>document.fonts.ready);
 const chip=page.locator('.chip-preview__grid').getByRole('button',{name:'response_schema',exact:true});
 await chip.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
 const ring=await chip.evaluate(el=>{const s=getComputedStyle(el);return {width:s.outlineWidth,offset:s.outlineOffset,color:s.outlineColor,height:el.getBoundingClientRect().height,background:s.backgroundColor,primary:getComputedStyle(document.documentElement).getPropertyValue('--ts-primary-soft').trim()}});
 expect(ring.width).toBe('2px');expect(ring.offset).toBe('2px');expect(ring.color).toBe(theme==='light'?'rgb(1, 105, 204)':'rgb(2, 133, 255)');expect(ring.height).toBe(28);
 const long=page.getByRole('button',{name:'this_is_a_long_object_identifier_that_stays_visible'});
 const bounds=await long.evaluate(el=>{const name=el.querySelector('.ts-chip__name');const r=document.createRange();r.selectNodeContents(name);const b=el.getBoundingClientRect();return {name:name.textContent,chip:{x:b.x,right:b.right,y:b.y,bottom:b.bottom,height:b.height},lines:[...r.getClientRects()].map(v=>({x:v.x,right:v.right,y:v.y,bottom:v.bottom})),ellipsis:getComputedStyle(name).textOverflow,documentWidth:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}});
 expect(bounds.documentWidth).toBeLessThanOrEqual(bounds.viewport);
 expect(bounds.name).toBe('this_is_a_long_object_identifier_that_stays_visible');
 for(const line of bounds.lines){expect(line.x).toBeGreaterThanOrEqual(bounds.chip.x);expect(line.right).toBeLessThanOrEqual(bounds.chip.right);expect(line.bottom).toBeLessThanOrEqual(bounds.chip.bottom);}
 expect(bounds.ellipsis).not.toBe('ellipsis');if(width===390)expect(bounds.lines.length).toBeGreaterThan(1);
 const shot=`chip-${locale}-${dir}-${theme}-${width}.png`;await page.screenshot({path:`${evidence}/${shot}`,fullPage:true});
 results.push({locale,dir,theme,width,ring,longIdentifier:bounds,screenshot:shot});
 await page.goto(`http://localhost:5187/?locale=${locale}&dir=${dir}&theme=${theme}`);await page.evaluate(()=>document.fonts.ready);
 await expect(page.getByRole('link',{name:'Chip',exact:true})).toBeVisible();
 await page.screenshot({path:`${evidence}/gallery-${locale}-${dir}-${theme}-${width}.png`,fullPage:true});
 }
 }
 await writeFile(evidence+'/visual-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
}finally{await browser.close()}
