import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7Q67JPBXKJBJGGF9KBGNYKF';
await mkdir(evidence,{recursive:true});
const browser=await chromium.launch({headless:true});
const results={oracle:'Recorded user decision: labels top/right/bottom/left request physical sides regardless of locale or direction. Bounding rectangles independently prove placement; closed hints and count prove isolation.',captures:[],physical:[],mobile:[],interaction:[],accessibility:[]};
try {
 for(const locale of ['en','ar']) for(const dir of ['ltr','rtl']) for(const theme of ['light','dark']) {
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage();
  const key=`${locale}-${dir}-${theme}`;
  await page.goto(`http://localhost:5173/components/Tooltip?locale=${locale}&dir=${dir}&theme=${theme}`);
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(1000);
  await page.keyboard.press('Tab');
  await expect(page.locator('html')).toHaveAttribute('dir',dir);
  const preview=page.getByRole('region',{name:locale==='en'?'Tooltip placements':'مواضع التلميح'});
  const name=locale==='en'?'Add item':'إضافة عنصر';
  const hint=locale==='en'?'Create a new item':'أنشئ عنصراً جديداً';
  const open=page.locator('[data-slot="tooltip-content"][data-open]');
  for (const [i,side] of ['top','right','bottom','left'].entries()) {
   await page.setViewportSize({width:1440,height:900});
   const trigger=preview.getByRole('button',{name}).nth(i);
   await trigger.focus();
   await expect(open).toHaveCount(1); await expect(open).toBeVisible();
   await expect(page.locator('[data-starting-style], [data-ending-style]')).toHaveCount(0);
   await expect(open).toContainText(hint);
   const described=await trigger.getAttribute('aria-describedby');
   if(!described?.split(' ').includes(await open.getAttribute('id'))) throw Error('Missing description relation');
   for(const width of [1440,390]) {
    await page.setViewportSize({width,height:900});
    await trigger.scrollIntoViewIfNeeded();
    await expect(open).toBeVisible();
    // Let responsive top-layer positioning complete before measuring or capturing.
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const a=await trigger.boundingBox(), b=await open.boundingBox();
    const actual=b.y+b.height<=a.y+1?'top':b.y>=a.y+a.height-1?'bottom':b.x+b.width<=a.x+1?'left':b.x>=a.x+a.width-1?'right':'overlap';
    const screenshot=`tooltip-${key}-${side}-${width}.png`;
    await page.screenshot({path:`${evidence}/${screenshot}`,fullPage:true,animations:'disabled'});
    results.captures.push({key,side,width,openCount:await open.count(),screenshot});
    if(width===1440) results.physical.push({key,requested:side,actual,dataSide:await open.getAttribute('data-side'),pass:actual===side,trigger:a,tooltip:b});
    else {
     const dims=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
     results.mobile.push({key,side,actual,...dims,pass:dims.scroll<=dims.client && b.x>=-1 && b.x+b.width<=391});
    }
   }
   await trigger.press('Escape'); await expect(open).toHaveCount(0); await expect(trigger).toBeFocused();
  }
  await page.setViewportSize({width:1440,height:900});
  const fixture=page.getByRole('region',{name:locale==='en'?'OpenUI fixture':'عينة OpenUI'});
  const button=fixture.getByRole('button',{name});
  await button.focus(); await expect(open).toHaveCount(1); await expect(open).toContainText(hint);
  await button.press('Escape'); await expect(open).toHaveCount(0); await expect(button).toBeFocused();
  await page.getByRole('heading',{name:'Tooltip',exact:true}).click();
  await button.hover(); await expect(open).toHaveCount(1); await expect(open).toBeVisible();
  await page.mouse.move(0,0); await expect(open).toHaveCount(0);
  results.interaction.push({key,focus:true,escape:true,hover:true,pass:true});
  const axe=await new AxeBuilder({page}).analyze();
  results.accessibility.push({key,violations:axe.violations,pass:axe.violations.length===0});
  await context.close();
 }
} finally {
 await browser.close();
 await writeFile(`${evidence}/tooltip-results.json`,JSON.stringify(results,null,2));
}
const summary={captures:results.captures.length,physicalFailures:results.physical.filter(x=>!x.pass).map(({key,requested,actual})=>({key,requested,actual})),mobileFailures:results.mobile.filter(x=>!x.pass),interaction:results.interaction,accessibility:results.accessibility.map(({key,pass})=>({key,pass}))};
await writeFile(`${evidence}/tooltip-summary.json`,JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary,null,2));
process.exitCode=summary.physicalFailures.length||summary.mobileFailures.length||results.accessibility.some(x=>!x.pass)?1:0;
