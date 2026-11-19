import {chromium,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7SX6JJN2BVWKP97TR50TWFY';
const browser=await chromium.launch(); const results=[];
try{
 const page=await browser.newPage({viewport:{width:1100,height:900}});
 for(const locale of ['en','ar'])for(const theme of ['light','dark']){
 await page.goto(`http://127.0.0.1:5174/?locale=${locale}&theme=${theme}`);await page.locator('#long .ts-bar-chart__column').first().waitFor();await page.evaluate(()=>document.fonts.ready);
 const check=async(name,fn)=>{try{const detail=await fn();results.push({name:`${name} (${locale}, ${theme})`,result:'pass',detail})}catch(e){results.push({name:`${name} (${locale}, ${theme})`,result:'fail',error:e.message})}};
 await check('14-day labels and 30-day cadence',async()=>{
  expect(await page.locator('#series .ts-bar-chart__tick').allTextContents()).toEqual(Array.from({length:14},(_,i)=>`D${i+1}`));
  const labels=await page.locator('#long .ts-bar-chart__tick').allTextContents();expect(labels).toHaveLength(30);
  expect(labels.filter(Boolean)).toEqual(['D1','D6','D11','D16','D21','D26']);return {slots:labels.length,visible:labels.filter(Boolean)};
 });
 await check('Zero marks, fractional scalar and stacked heights, exact axis midpoint',async()=>{
  const geom=await page.evaluate(()=>{
   const rect=s=>document.querySelector(s).getBoundingClientRect();
   const base=rect('#fraction .ts-bar-chart__plot').height-1;
   return {segments:[...document.querySelectorAll('#fraction .ts-bar-chart__column')].map(c=>[...c.querySelectorAll('.ts-bar-chart__segment')].map(s=>s.getBoundingClientRect().height)),base,split:[...document.querySelectorAll('#stacked .ts-bar-chart__segment')].map(s=>s.getBoundingClientRect().height),splitStack:rect('#stacked .ts-bar-chart__stack').height,ticks:[...document.querySelectorAll('#range .ts-bar-chart__gridline span')].map(e=>e.textContent)};
  });
  expect(geom.segments[0]).toEqual([]);expect(geom.segments[1][0]/geom.base).toBeCloseTo(.25,2);expect(geom.segments[2][0]/geom.base).toBeCloseTo(.5,2);expect(geom.split).toHaveLength(2);expect(geom.split[1]/geom.split[0]).toBeCloseTo(2,1);expect(geom.split.reduce((a,b)=>a+b,2)).toBeCloseTo(geom.splitStack,0);expect(geom.ticks).toEqual(['3','1.5','0']);return geom;
 });
 await check('Highlight range and default latest remain distinct in both themes',async()=>{
 const colors=await page.evaluate(()=>({range:[...document.querySelectorAll('#range .ts-bar-chart__segment')].map(e=>getComputedStyle(e).backgroundColor),defaults:[...document.querySelectorAll('#series .ts-bar-chart__segment')].map(e=>getComputedStyle(e).backgroundColor)}));
 expect(colors.range[0]).toBe(colors.range[1]);expect(colors.range[0]).not.toBe(colors.range[2]);expect(colors.defaults[13]).not.toBe(colors.defaults[0]);
 expect(colors.range[0]).toBe(theme==='dark'?'rgb(243, 243, 243)':'rgb(24, 24, 24)');return colors;
 });
 await check('Inherited RTL arrows, end clamping, tooltip and reachable chart after shrink',async()=>{
 const cols=page.locator('#series .ts-bar-chart__column');await cols.first().focus();
 await page.keyboard.press(locale==='ar'?'ArrowLeft':'ArrowRight');await expect(cols.nth(1)).toBeFocused();
 await expect(page.getByRole('tooltip').filter({hasText:'D2: 2'})).toBeVisible();
 await page.locator('#series').evaluate(e=>e.dir=e.closest('html').dir==='rtl'?'ltr':'rtl');
 await page.keyboard.press(locale==='ar'?'ArrowRight':'ArrowLeft');await expect(cols.nth(2)).toBeFocused();
 await page.locator('#series').evaluate(e=>e.removeAttribute('dir'));
 for(let i=0;i<15;i++)await page.keyboard.press(locale==='ar'?'ArrowLeft':'ArrowRight');await expect(cols.last()).toBeFocused();
 await page.locator('#shrink').click();await expect(cols).toHaveCount(7);await expect(page.locator('#series .ts-bar-chart__column[tabindex="0"]')).toHaveCount(1);
 await page.keyboard.press('Tab');await expect(cols.last()).toBeFocused();return {lastReachable:'D7: 7',tabStops:1};
 });
 await check('Ranked Bars fractional widths',async()=>{
 const vals=await page.locator('#bars .ts-bars__row').evaluateAll(rows=>rows.map(r=>({label:r.querySelector('.ts-bars__labels').textContent,ratio:r.querySelector('.ts-bars__fill').getBoundingClientRect().width/r.querySelector('.ts-bars__track').getBoundingClientRect().width})));
 expect(vals.map(x=>x.ratio)).toEqual([1,.5,0]);return vals;
 });
 await check('Distribution folded total, localized hover and bold-count key layout',async()=>{
 const rows=page.locator('#distribution .ts-distribution__key li');await expect(rows).toHaveCount(6);await expect(rows.last().locator('strong')).toHaveText('3');
 await expect(rows.last().locator('span').first()).toHaveText(locale==='ar'?'أخرى':'Other');
 await expect(page.locator('#distribution .ts-distribution__segment').last()).toHaveAttribute('title',locale==='ar'?'أخرى: 3':'Other: 3');
 const counts=await rows.locator('strong').allTextContents();expect(counts).toEqual(['7','6','5','4','3','3']);
 await page.setViewportSize({width:390,height:900});
 const metrics=await rows.evaluateAll(rows=>rows.map(r=>{const a=r.querySelector('span').getBoundingClientRect(),b=r.querySelector('strong').getBoundingClientRect();return {a:{x:a.x,y:a.y,width:a.width,height:a.height},b:{x:b.x,y:b.y,width:b.width,height:b.height},weight:getComputedStyle(r.querySelector('strong')).fontWeight}}));
 for(const {a,b,weight} of metrics){expect(Math.abs(a.y-b.y)).toBeLessThan(2);expect(locale==='ar'?b.x+b.width<=a.x:a.x+a.width<=b.x).toBeTruthy();expect(Number(weight)).toBeGreaterThanOrEqual(600)}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=390)).toBeTruthy();return {counts,metrics};
 });
 await page.keyboard.press('Escape');await page.screenshot({path:`${evidence}/synthetic-${locale}-${theme}-390.png`,fullPage:true});
 await page.setViewportSize({width:1100,height:900});await page.screenshot({path:`${evidence}/synthetic-${locale}-${theme}-1100.png`,fullPage:true});
 }
 await writeFile(`${evidence}/live-chart-results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
}finally{await browser.close()}
if(results.some(r=>r.result==='fail'))process.exitCode=1;
