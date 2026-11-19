import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFile,readFile} from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7STRCVXYWPWRHVYBR04B9MM';
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
const results=process.env.GALLERY_ONLY?JSON.parse(await readFile(`${evidence}/chart-scenarios.json`,'utf8')).results.filter(r=>!r.name.startsWith('Bilingual')):[]; const errors=[];
page.on('pageerror',error=>errors.push(error.message));
const snap=async name=>page.screenshot({path:`${evidence}/${name}.png`,fullPage:true,animations:'disabled'});
const near=(a,b,message,tolerance=1)=>expect(Math.abs(a-b),message).toBeLessThanOrEqual(tolerance);
const rects=async selector=>page.locator(selector).evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}}));
const show=async(name,props,options={})=>{await page.evaluate(({name,props,options})=>window.showChart(name,props,options),{name,props,options});await page.waitForTimeout(100);};
async function scenario(name,run){if(process.env.GALLERY_ONLY&&!name.startsWith('Bilingual'))return;try{const observations=await run();results.push({name,result:'pass',live:true,observations});console.log('PASS '+name)}catch(e){await snap('failure-'+results.length);results.push({name,result:'fail',live:true,error:e.stack});console.error('FAIL '+name+' '+e.message)}}
try{
await scenario('Bilingual OpenUI chart previews render in both themes at desktop and mobile widths with aligned RTL dates and no page overflow',async()=>{
 const observations=[];
 for(const name of ['BarChart','Bars','Distribution']) for(const locale of ['en','ar']) for(const theme of ['light','dark']){
  const dir=locale==='ar'?'rtl':'ltr';
  await page.goto(`http://localhost:5173/components/${name}?locale=${locale}&dir=${dir}&theme=${theme}`);
  await expect(page.getByRole('heading',{name,exact:true,level:1})).toBeVisible();
  await expect(page.locator('.component-list .ts-card')).toBeVisible();
  const slot=name==='BarChart'?'bar-chart':name.toLowerCase();
  await expect(page.locator(`.component-list [data-slot="${slot}"]`)).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);
  if(name==='BarChart'){
   const cols=page.locator('.component-list .ts-bar-chart__column');
   await expect(cols).toHaveCount(14);
   await expect(page.locator('.component-list .ts-bar-chart__segment')).toHaveCount(14);
   expect(await cols.first().getAttribute('aria-label')).toContain(': 12');
   await expect(page.locator('.component-list .ts-bar-chart__legend li')).toHaveCount(2);
  } else if(name==='Bars'){
   await expect(page.locator('.ts-bars__row')).toHaveCount(2);
   const tracks=await rects('.ts-bars__track'),fills=await rects('.ts-bars__fill');
   near(fills[0].width,tracks[0].width,'maximum plan fills track');
   near(fills[1].width,tracks[1].width/2,'second plan is half the maximum');
  }else{
   await expect(page.locator('.ts-distribution__key li')).toHaveCount(3);
   const titles=await page.locator('.ts-distribution__segment').evaluateAll(es=>es.map(e=>e.title));
   expect(titles[0]).toContain(': 68');
  }
  const axe=await new AxeBuilder({page}).analyze();expect(axe.violations).toEqual([]);
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});
   const dim=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
   expect(dim.scroll).toBeLessThanOrEqual(dim.client);
   if(name==='BarChart'){
    const cs=await rects('.ts-bar-chart__column'),ts=await rects('.ts-bar-chart__tick');
    for(let i=0;i<14;i++){near(cs[i].x,ts[i].x,'column/date alignment');near(cs[i].width,ts[i].width,'column/date width');expect(cs[i].width).toBeLessThanOrEqual(28);}
    expect(dir==='rtl'?cs[0].x>cs[13].x:cs[0].x<cs[13].x).toBeTruthy();
    if(width===390){const dim=await page.locator('.ts-bar-chart__viewport').evaluate(e=>({client:e.clientWidth,scroll:e.scrollWidth}));expect(dim.scroll).toBeGreaterThan(dim.client);}
   }
   await page.locator(`.component-list [data-slot="${slot}"]`).scrollIntoViewIfNeeded();
   await page.waitForTimeout(100);
   await snap(`${name}-${locale}-${theme}-${width}`);
  }
  observations.push(`${name} ${locale} ${theme}: OpenUI render, axe, 1440/390px screenshots and geometry passed`);
 }
 return observations;
});
await page.goto('http://127.0.0.1:5174');
await page.waitForFunction(()=>typeof window.showChart==='function');
await scenario('BarChart keyboard navigation and tooltips follow inherited RTL and remain reachable after shrinking or emptying data',async()=>{
 const points=Array.from({length:14},(_,i)=>({label:`Day ${i+1}`,value:i+1}));
 await show('BarChart',{points});
 const cols=page.locator('.ts-bar-chart__column');
 await expect(page.locator('.ts-bar-chart__column[tabindex="0"]')).toHaveCount(1);
 await page.keyboard.press('Tab');await expect(cols.first()).toBeFocused();
 await expect(page.getByRole('tooltip')).toBeVisible();await expect(page.getByRole('tooltip')).toContainText('Day 1: 1');
 const ring=await cols.first().evaluate(e=>{const s=getComputedStyle(e);return [s.outlineWidth,s.outlineOffset,s.outlineColor]});
 expect(ring).toEqual(['2px','2px','rgb(1, 105, 204)']);
 await page.keyboard.press('ArrowLeft');await expect(cols.first()).toBeFocused();
 await page.keyboard.press('ArrowRight');await expect(cols.nth(1)).toBeFocused();
 await page.keyboard.press('ArrowLeft');await expect(cols.first()).toBeFocused();
 await page.locator('.ts-bar-chart').evaluate(e=>e.dir='rtl');
 await page.keyboard.press('ArrowLeft');await expect(cols.nth(1)).toBeFocused();
 await page.keyboard.press('ArrowRight');await expect(cols.first()).toBeFocused();
 await page.locator('.ts-bar-chart').evaluate(e=>e.removeAttribute('dir'));
 for(let i=0;i<14;i++)await page.keyboard.press('ArrowRight');
 await expect(cols.nth(13)).toBeFocused();
 await show('BarChart',{points:points.slice(0,7)});
 await expect(page.locator('.ts-bar-chart__column[tabindex="0"]')).toHaveCount(1);
 await expect(cols.nth(6)).toHaveAttribute('tabindex','0');
 await page.locator('h1').click();await page.keyboard.press('Tab');await expect(cols.nth(6)).toBeFocused();
 await page.keyboard.press('ArrowRight');await expect(cols.nth(6)).toBeFocused();
 await snap('keyboard-after-shrink');
 await show('BarChart',{points:[]});await expect(cols).toHaveCount(0);
 await show('BarChart',{points:points.slice(0,2)});
 await expect(page.locator('.ts-bar-chart__column[tabindex="0"]')).toHaveCount(1);
 await cols.first().hover();await expect(page.getByRole('tooltip')).toBeVisible();await expect(page.getByRole('tooltip')).toContainText('Day 1: 1');
 await snap('column-hover-tooltip');
 return {ring,nestedRTL:'ArrowLeft advances and ArrowRight returns',shrink:'index 13 -> one reachable tab stop at index 6',empty:'repopulate preserves tab stop'};
});
await scenario('BarChart zero, fractional, stacked and odd-maximum values match the zero-baseline axis and highlight range',async()=>{
 await page.setViewportSize({width:900,height:900});
 await show('BarChart',{points:[{label:'Zero',value:0},{label:'Quarter',value:.25},{label:'Half',value:.5}],highlight:[1,1]});
 const columns=await rects('.ts-bar-chart__column'),stacks=await rects('.ts-bar-chart__stack'),marks=await rects('.ts-bar-chart__segment');
 near(stacks[0].height,0,'zero has zero stack height');await expect(page.locator('.ts-bar-chart__column').first().locator('.ts-bar-chart__segment')).toHaveCount(0);
 near(marks[0].height,columns[1].height*.25,'quarter visible mark matches 0.25 on axis maximum 1');near(marks[1].height,columns[2].height*.5,'half visible mark matches 0.5 on axis maximum 1');
 await expect(page.locator('.ts-bar-chart__column').nth(1).locator('.ts-bar-chart__segment')).toHaveClass(/segment--strong/);
 await expect(page.locator('.ts-bar-chart__column').nth(2).locator('.ts-bar-chart__segment')).toHaveClass(/segment--muted/);
 await snap('fractional-scalar-chart');
 await show('BarChart',{points:[{label:'Two',value:2},{label:'Three',value:3}]});
 await expect(page.locator('.ts-bar-chart__gridline > span')).toHaveText(['3','1.5','0']);
 const odd=await rects('.ts-bar-chart__stack'),plot=await rects('.ts-bar-chart__column');near(odd[0].height,plot[0].height*2/3,'2 reaches two thirds of max 3');
 await show('BarChart',{points:[{label:'Stack',segments:[{key:'a',value:.1},{key:'b',value:.2},{key:'zero',value:0}]}],keys:[{key:'a',label:'A',tone:'muted'},{key:'b',label:'B',tone:'strong'}]});
 await expect(page.locator('.ts-bar-chart__segment')).toHaveCount(2);
 const stack=await rects('.ts-bar-chart__stack'),segments=await rects('.ts-bar-chart__segment');
 near(segments[0].height+segments[1].height+2,stack[0].height,'stack segments fill available height with one 2px gap');near(segments[1].height/segments[0].height,2,'stacked .2/.1 ratio',.05);
 await page.locator('.ts-bar-chart__column').focus();await expect(page.getByRole('tooltip')).toContainText('A: 0.1');await expect(page.getByRole('tooltip')).toContainText('B: 0.2');
 await snap('fractional-stacked-chart');
 return {scalar:{columns,stacks,marks},oddMaximum:{ticks:[3,1.5,0],stacks:odd},stacked:{stack,segments}};
});
await scenario('Bars ranks and caps rows, scales fractional values to their actual maximum, and renders progress captions and zero data',async()=>{
 const rows=[{label:'Quarter',value:.25,display:'0.25 s'},{label:'Half',value:.5,display:'0.5 s',tone:'info'},{label:'Zero',value:0,display:'0 s'}];
 const observations=[];
 for(const style of ['ranked','progress'])for(const dir of ['ltr','rtl']){
  await show('Bars',{rows,style,caption:'Fractional timings'},{dir});
  await expect(page.locator('.ts-bars__labels > :first-child')).toHaveText(['Half','Quarter','Zero']);
  const tracks=await rects('.ts-bars__track'),fills=await rects('.ts-bars__fill');
  near(fills[0].width,tracks[0].width,'0.5 is max: full width');near(fills[1].width,tracks[1].width*.5,'0.25 is half max');near(fills[2].width,0,'zero fill width');
  if(dir==='rtl')near(fills[1].x+fills[1].width,tracks[1].x+tracks[1].width,'RTL fill anchored at inline start');
  await expect(page.locator('.ts-bars__caption')).toHaveText('Fractional timings');await expect(page.locator('.ts-bars__track').first()).toHaveAttribute('title','Half: 0.5 s');
  await snap(`Bars-fractions-${style}-${dir}`);observations.push({style,dir,tracks,fills});
 }
 await show('Bars',{rows:Array.from({length:10},(_,i)=>({label:`Rank ${i}`,value:i,display:String(i)}))});
 await expect(page.locator('.ts-bars__row')).toHaveCount(8);await expect(page.locator('.ts-bars__labels > :first-child').first()).toHaveText('Rank 9');
 await show('Bars',{rows:[{label:'Zero',value:0,display:'0'}]});near((await rects('.ts-bars__fill'))[0].width,0,'all-zero rows show zero');
 await show('Bars',{rows:[]});await expect(page.locator('.ts-bars__row')).toHaveCount(0);
 return observations;
});
await scenario('Distribution sorts and folds seven parts into six, preserves totals and proportions, and localizes Arabic labels and hover information',async()=>{
 const observations=[];
 for(const locale of ['en','ar']){
  await show('Distribution',{parts:[{label:'One',value:1},{label:'Seven',value:7},{label:'Three',value:3},{label:'Five',value:5},{label:'Two',value:2},{label:'Six',value:6},{label:'Four',value:4}],locale},{locale,dir:locale==='ar'?'rtl':'ltr'});
  const key=page.locator('.ts-distribution__key');await expect(key.locator('li')).toHaveCount(6);
  await expect(key.locator('li > span:first-child')).toHaveText(['Seven','Six','Five','Four','Three',locale==='ar'?'أخرى':'Other']);
  await expect(key.locator('strong')).toHaveText(['7','6','5','4','3','3']);
  await expect(key.locator('li > span:last-child').first()).toHaveText(locale==='ar'?' من 28':' of 28');
  const title=locale==='ar'?'أخرى: 3':'Other: 3';await expect(page.locator('.ts-distribution__segment').last()).toHaveAttribute('title',title);await page.locator('.ts-distribution__segment').last().hover();
  const parts=await rects('.ts-distribution__segment');near(parts[0].width/parts[1].width,7/6,'7-to-6 count ratio',.02);
  await expect(page.locator('.ts-distribution > p')).toContainText(locale==='ar'?'التوزيع':'Distribution');
  await snap(`Distribution-folded-${locale}`);observations.push({locale,parts,hoverTitle:title,total:28});
 }
 await show('Distribution',{parts:[]});await expect(page.locator('.ts-distribution__segment')).toHaveCount(0);
 await show('Distribution',{parts:[{label:'Zero',value:0}]});near((await rects('.ts-distribution__segment'))[0].width,0,'zero total has zero segment');
 return observations;
});
}finally{await browser.close();await writeFile(`${evidence}/chart-scenarios.json`,JSON.stringify({results,browserErrors:errors},null,2));}
if(results.some(r=>r.result==='fail')||errors.length){console.error(JSON.stringify(errors));process.exitCode=1;}
