import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7Q492AVMJCAE3MNAWAJJCFJ';
const observations:any[]=[];
test.afterAll(async()=>{await writeFile(`${evidence}/tooltip-live-observations.json`,JSON.stringify(observations,null,2));});
for(const locale of ['en','ar']){
 test(`Preview ${locale}: hover, keyboard dismissal, and actual OpenUI hint`,async({page})=>{
  await page.goto(`/components/Tooltip?locale=${locale}&dir=${locale==='en'?'ltr':'rtl'}&theme=light`);
  await page.waitForLoadState('networkidle'); await page.evaluate(()=>document.fonts.ready);
  const item=page.locator('.tooltip-preview__item').first();
  const trigger=item.getByRole('button'); const tip=item.getByRole('tooltip');
  await trigger.hover(); await expect(tip).toBeVisible();
  const hint=locale==='en'?'Create a new item':'أنشئ عنصراً جديداً';
  await expect(tip).toContainText(hint);
  const focusBefore=await page.evaluate(()=>document.activeElement?.tagName);
  await tip.hover(); await expect(tip).toBeVisible();
  await page.mouse.move(0,0); await expect(tip).not.toBeVisible();
  await page.reload(); await page.waitForLoadState('networkidle'); await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
  await expect(trigger).toBeFocused(); await expect(tip).toBeVisible();
  const ring=await trigger.evaluate(el=>{const s=getComputedStyle(el);return {width:s.outlineWidth,offset:s.outlineOffset,color:s.outlineColor};});
  expect(ring).toEqual({width:'2px',offset:'2px',color:'rgb(1, 105, 204)'});
  await page.keyboard.press('Escape'); await expect(tip).not.toBeVisible(); await expect(trigger).toBeFocused();
  await page.keyboard.press('Tab'); await expect(trigger).not.toBeFocused();
  const fixture=page.getByRole('region',{name:locale==='en'?'OpenUI fixture':'عينة OpenUI'});
  const ft=fixture.getByRole('button',{name:locale==='en'?'Add item':'إضافة عنصر'});
  await ft.focus(); await expect(fixture.getByRole('tooltip')).toBeVisible();
  await expect(fixture.getByRole('tooltip')).toHaveText(hint);
  const tipId=await fixture.getByRole('tooltip').getAttribute('id');
  expect((await ft.getAttribute('aria-describedby'))?.split(' ')).toContain(tipId);
  await expect(page.locator('[data-starting-style], [data-ending-style]')).toHaveCount(0);
  await page.screenshot({path:`${evidence}/openui-tooltip-${locale}.png`,fullPage:true});
  observations.push({locale,hoverHint:hint,hoverPreservedFocus:focusBefore==='BODY',pointerOverHint:'stayed open',pointerAway:'closed',escape:'closed and retained trigger focus',focusRing:ring,openui:{label:await ft.getAttribute('aria-label'),description:await fixture.getByRole('tooltip').innerText(),id:tipId}});
 });
}
test('Consumer: disabled guard, controlled state, collision flip, touch toggle',async({browser})=>{
 const context=await browser.newContext({hasTouch:true,viewport:{width:390,height:844}});
 const page=await context.newPage();
 try{
 await page.goto('http://127.0.0.1:5174');
 const disabled=page.getByRole('region',{name:'Disabled tooltip'}); const action=disabled.getByRole('button');
 await action.hover(); await page.waitForTimeout(900); await expect(disabled.getByRole('tooltip')).not.toBeVisible();
 await action.focus(); await expect(disabled.getByRole('tooltip')).not.toBeVisible();
 await action.press('Enter'); await expect(disabled.locator('output')).toHaveText('Actions: 1');
 const controlled=page.getByRole('region',{name:'Controlled tooltip'});
 await controlled.getByRole('button').focus(); await expect(controlled.getByRole('tooltip')).toBeVisible(); await expect(controlled.locator('output')).toHaveText('Open');
 await page.keyboard.press('Escape'); await expect(controlled.getByRole('tooltip')).not.toBeVisible(); await expect(controlled.locator('output')).toHaveText('Closed');
 const edge=page.getByRole('region',{name:'Edge placement'}); await edge.getByRole('button').focus(); await expect(edge.getByRole('tooltip')).toBeVisible();
 await expect(edge.getByRole('tooltip')).toHaveAttribute('data-side','bottom');
 const box=await edge.getByRole('tooltip').boundingBox(); expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.x+box!.width).toBeLessThanOrEqual(390);
 await expect(page.locator('[data-starting-style], [data-ending-style]')).toHaveCount(0);
  await page.screenshot({path:`${evidence}/consumer-edge-flip.png`,fullPage:true});
 await page.keyboard.press('Escape');
 const touch=page.getByRole('region',{name:'Touch tooltip'}); await touch.getByRole('button').tap(); await expect(touch.getByRole('tooltip')).toBeVisible();
 await expect(page.locator('[data-starting-style], [data-ending-style]')).toHaveCount(0);
  await page.screenshot({path:`${evidence}/consumer-touch-open.png`,fullPage:true});
 await touch.getByRole('button').tap(); await expect(touch.getByRole('tooltip')).not.toBeVisible();
 observations.push({consumer:'real Tooltip React exports with synthetic labels',disabled:'hover and focus keep hint closed; Enter still executes action',controlled:'focus opens and updates output; Escape closes and updates output',collision:{requested:'top',actual:'bottom',viewport:390,bounds:box},touch:'tap opens; second tap closes'});
 }finally{await context.close();}
});

test('Preview placements and compact token colors in every locale, theme and width',async({page})=>{
 const measurements:any[]=[];
 for(const locale of ['en','ar'])for(const theme of ['light','dark'])for(const width of [1440,390]){
  await page.setViewportSize({width,height:900});
  await page.goto(`/components/Tooltip?locale=${locale}&dir=${locale==='en'?'ltr':'rtl'}&theme=${theme}`);
  await page.waitForLoadState('networkidle'); await page.evaluate(()=>document.fonts.ready);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  for(const [index,requested] of ['top','right','bottom','left'].entries()){
   const item=page.locator('.tooltip-preview__item').nth(index);
   const trigger=item.getByRole('button'); const tip=item.getByRole('tooltip');
   if(index>0)await page.keyboard.press('Tab');
   await expect(trigger).toBeFocused(); await expect(tip).toBeVisible();
   await expect(page.locator('[data-starting-style], [data-ending-style]')).toHaveCount(0);
   const actual=await tip.getAttribute('data-side');
   expect(actual).toBe(requested);
   const painted=await tip.evaluate(el=>{
    const s=getComputedStyle(el); const arrow=el.querySelector('[data-slot="tooltip-arrow"]')!;
    const shortcut=el.querySelector('[data-slot="tooltip-shortcut"]')!;
    return {fill:s.backgroundColor,text:s.color,arrow:getComputedStyle(arrow).backgroundColor,shortcut:getComputedStyle(shortcut).color};
   });
   // Independent oracle: synced design/tokens.json specifies gray-700 fill and gray-0 text.
   const fill=theme==='light'?'rgb(48, 48, 48)':'rgb(175, 175, 175)';
   const text=theme==='light'?'rgb(255, 255, 255)':'rgb(13, 13, 13)';
   expect(painted).toEqual({fill,text,arrow:fill,shortcut:text});
   const box=await tip.boundingBox(); const anchor=await trigger.boundingBox();
   expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.x+box!.width).toBeLessThanOrEqual(width);
   if(actual==='top')expect(box!.y+box!.height).toBeLessThanOrEqual(anchor!.y+1);
   if(actual==='bottom')expect(box!.y).toBeGreaterThanOrEqual(anchor!.y+anchor!.height-1);
   if(actual==='left')expect(box!.x+box!.width).toBeLessThanOrEqual(anchor!.x+1);
   if(actual==='right')expect(box!.x).toBeGreaterThanOrEqual(anchor!.x+anchor!.width-1);
   measurements.push({locale,theme,width,requested,actual,painted,box});
   if(index===1)await page.screenshot({path:`${evidence}/placement-right-${locale}-${theme}-${width}.png`,fullPage:true});

  }
  const scroll=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,content:document.documentElement.scrollWidth}));
  expect(scroll.content).toBeLessThanOrEqual(scroll.viewport);
 }
 observations.push({placementsAndPaintedTokenColors:measurements});
});
