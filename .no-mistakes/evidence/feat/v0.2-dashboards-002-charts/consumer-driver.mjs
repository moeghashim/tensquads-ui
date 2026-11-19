import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {writeFile} from 'node:fs/promises';
import {chromium,expect} from '@playwright/test';
const require=createRequire(new URL('../apps/preview/package.json',import.meta.url));
const {createServer}=await import(pathToFileURL(require.resolve('vite')).href);
const {default:react}=await import(pathToFileURL(require.resolve('@vitejs/plugin-react')).href);
const evidence='~/.no-mistakes/evidence/01M7SZES8NPH5TJ999NN74W5Z7';
const results=[];
const server=await createServer({configFile:false,root:new URL('.',import.meta.url).pathname,plugins:[react()],server:{host:'127.0.0.1',port:0,fs:{allow:[process.cwd()]}}});
let browser;
async function scenario(name,fn){try{const data=await fn();results.push({name,result:'pass',data});console.log('PASS '+name);}catch(e){results.push({name,result:'fail',error:String(e)});console.log('FAIL '+name+' '+e);}}
try{
 await server.listen(); browser=await chromium.launch();
 for(const locale of ['en','ar']) for(const theme of ['light','dark']) {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.goto(server.resolvedUrls.local[0]+`?locale=${locale}&theme=${theme}`);await expect(page.locator('#long button')).toHaveCount(30);await page.evaluate(()=>document.fonts.ready);
 await scenario(`Inherited ${locale} direction, tooltip and dataset shrink (${theme})`,async()=>{
 const cols=page.locator('#dynamic .ts-bar-chart__column'); await cols.first().focus();
 await page.keyboard.press(locale==='ar'?'ArrowLeft':'ArrowRight');await expect(cols.nth(1)).toBeFocused();
 await expect(page.locator('[role="tooltip"][data-open]')).toContainText('Day 2: 2');
 await page.getByRole('heading',{level:1}).click(); await cols.first().hover(); await expect(page.locator('[role="tooltip"][data-open]')).toContainText('Day 1: 1'); await cols.nth(1).focus();
 for(let i=0;i<12;i++)await page.keyboard.press(locale==='ar'?'ArrowLeft':'ArrowRight');await expect(cols.last()).toBeFocused();
 await page.getByRole('button',{name:'Use seven days'}).click();await expect(cols).toHaveCount(7);await expect(page.locator('#dynamic button[tabindex="0"]')).toHaveCount(1);
 await page.keyboard.press('Tab');await expect(cols.last()).toBeFocused();
 await page.keyboard.press(locale==='ar'?'ArrowLeft':'ArrowRight');await expect(cols.last()).toBeFocused();
 await page.keyboard.press(locale==='ar'?'ArrowRight':'ArrowLeft');await expect(cols.nth(5)).toBeFocused();return {columnsAfterShrink:7,tabStops:1};});
 await scenario(`30-point label cadence and theme highlight (${locale} ${theme})`,async()=>{
 const labels=await page.locator('#long .ts-bar-chart__tick').allTextContents();expect(labels.filter(Boolean)).toEqual(['D1','D6','D11','D16','D21','D26']);
 const colors=await page.locator('#long .ts-bar-chart__segment').evaluateAll(es=>es.map(e=>getComputedStyle(e).backgroundColor));
 const strong=theme==='dark'?'rgb(243, 243, 243)':'rgb(19, 19, 19)';expect(colors.slice(5,10)).toEqual(Array(5).fill(strong));expect(colors[0]).not.toBe(strong);
 const positions=await page.locator('#long').evaluate(el=>Array.from(el.querySelectorAll('.ts-bar-chart__column'),(e,i)=>{const a=e.getBoundingClientRect(),b=el.querySelectorAll('.ts-bar-chart__tick')[i].getBoundingClientRect();return {column:a.x,tick:b.x,width:a.width}}));for(const p of positions)expect(Math.abs(p.column-p.tick)).toBeLessThan(1);
 return {visibleLabels:labels.filter(Boolean),strongColor:strong};});
 await scenario(`Zero, fractional and odd-axis values (${locale} ${theme})`,async()=>{
 const data=await page.locator('#fraction').evaluate(el=>Array.from(el.querySelectorAll('.ts-bar-chart__column'),e=>({height:e.getBoundingClientRect().height,segments:Array.from(e.querySelectorAll('.ts-bar-chart__segment'),s=>s.getBoundingClientRect().height),stack:e.querySelector('.ts-bar-chart__stack').getBoundingClientRect().height})));
 expect(data[0].segments).toEqual([]);expect(data[0].stack).toBe(0);expect(data[1].segments[0]/data[1].height).toBeCloseTo(.25,2);expect(data[2].segments[0]/data[2].height).toBeCloseTo(.5,2);
 expect(await page.locator('#stacked .ts-bar-chart__column').first().locator('.ts-bar-chart__segment').count()).toBe(2);
 const stack=await page.locator('#stacked .ts-bar-chart__column').first().evaluate(e=>({column:e.clientHeight,stack:e.querySelector('.ts-bar-chart__stack').getBoundingClientRect().height,parts:Array.from(e.querySelectorAll('.ts-bar-chart__segment'),x=>x.getBoundingClientRect().height)}));expect(stack.stack/stack.column).toBeCloseTo(.5,2);expect(stack.parts[1]/stack.parts[0]).toBeCloseTo(4,1);expect(stack.parts.reduce((a,b)=>a+b,0)+2).toBeCloseTo(stack.stack,1);
 await expect(page.locator('#odd .ts-bar-chart__gridline span')).toHaveText(['3','1.5','0']);return {fractional:data,stacked:stack,axis:['3','1.5','0']};});
 await scenario(`Ranked fractional Bars and localized folded Distribution key (${locale} ${theme})`,async()=>{
 const rows=page.locator('#bars .ts-bars__row');await expect(rows.locator('.ts-bars__labels > span:first-child')).toHaveText(['Half','Quarter','Zero']);
 const fractions=await rows.evaluateAll(es=>es.map(e=>e.querySelector('.ts-bars__fill').getBoundingClientRect().width/e.querySelector('.ts-bars__track').getBoundingClientRect().width));expect(fractions[0]).toBeCloseTo(1,2);expect(fractions[1]).toBeCloseTo(.5,2);expect(fractions[2]).toBe(0);
 await expect(page.locator('#distribution li')).toHaveCount(6);const last=page.locator('#distribution li').last();await expect(last).toContainText(locale==='ar'?'أخرى':'Other');await expect(last.locator('strong')).toHaveText('3');await expect(last.locator('.ts-visually-hidden')).toHaveText(locale==='ar'?' من 28':' of 28');
 await expect(page.locator('#distribution .ts-distribution__segment').last()).toHaveAttribute('title',`${locale==='ar'?'أخرى':'Other'}: 3`);
 for(const width of [1440,390]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);const fits=await page.locator('#distribution li').evaluateAll(es=>es.map(e=>{const p=e.parentElement.getBoundingClientRect(),r=e.getBoundingClientRect();return r.left>=p.left-1&&r.right<=p.right+1}));expect(fits.every(Boolean)).toBe(true);await page.screenshot({path:`${evidence}/consumer-${locale}-${theme}-${width}.png`,fullPage:true});}return {fillFractions:fractions,foldedCount:3,total:28};});
 await page.close();
 }
}finally{await browser?.close();await server.close();await writeFile(`${evidence}/live-consumer-results.json`,JSON.stringify(results,null,2));}
if(results.some(r=>r.result==='fail'))process.exitCode=1;
