import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { openPreview } from './helpers/preview';
const evidence='~/.no-mistakes/evidence/01M7TTSM5Y7Y1ZFJN1NP486SSS';
const widths=[1440,1180,760,390];
const variants=[{locale:'en',direction:'ltr'},{locale:'ar',direction:'rtl'}] as const;
for(const state of variants) for(const theme of ['light','dark'] as const){
 const tag=`${state.locale}-${theme}`;
 test(`chart cards fit, align ticks and keep keyboard tooltips ${tag}`,async({page})=>{
  for(const view of ['home','admin']) for(const width of widths){
   await page.setViewportSize({width,height:900});
   await openPreview(page,{...state,theme},`/dashboards/${view}`);
   await page.waitForLoadState('networkidle');
   const chart=page.locator('.ts-bar-chart');
   await expect(chart.locator('.ts-bar-chart__gridline')).toHaveText(view==='admin'?['12','6','0']:['1200','600','0']);
   await expect(chart.locator('.ts-bar-chart__column')).toHaveCount(view==='home'?14:8);
   const geometry=await chart.evaluate(el=>{
    const vp=el.querySelector('.ts-bar-chart__viewport')!;
    const columns=[...el.querySelectorAll('.ts-bar-chart__column')].map(e=>e.getBoundingClientRect().toJSON());
    const ticks=[...el.querySelectorAll('.ts-bar-chart__tick')].map(e=>e.getBoundingClientRect().toJSON());
    return {client:vp.clientWidth,scroll:vp.scrollWidth,columns,ticks,doc:document.documentElement.scrollWidth,win:innerWidth};
   });
   expect(geometry.doc).toBeLessThanOrEqual(geometry.win);
   if(width===1440 || (view==='admin' && width>390)) expect(geometry.scroll).toBeLessThanOrEqual(geometry.client+1);
   geometry.columns.forEach((c,i)=>{
    expect(Math.abs(c.x-geometry.ticks[i].x)).toBeLessThan(1);
    expect(Math.abs(c.width-geometry.ticks[i].width)).toBeLessThan(1);
   });
   const buttons=chart.locator('.ts-bar-chart__column');
   await buttons.first().focus();
   await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab');
   await expect(page.getByRole('tooltip')).toContainText((await buttons.first().getAttribute('aria-label'))!);
   await page.keyboard.press(state.direction==='rtl'?'ArrowLeft':'ArrowRight');
   await expect(buttons.nth(1)).toBeFocused();
   for(let i=1;i<await buttons.count();i++) await page.keyboard.press(state.direction==='rtl'?'ArrowLeft':'ArrowRight');
   await expect(page.getByRole('tooltip')).toContainText((await buttons.last().getAttribute('aria-label'))!);
   const visible=await buttons.last().evaluate(el=>{const r=el.getBoundingClientRect(); const v=el.closest('.ts-bar-chart__viewport')!.getBoundingClientRect();return r.left>=v.left-1&&r.right<=v.right+1});
   expect(visible).toBe(true);
   await page.keyboard.press('Escape'); await buttons.last().blur();
   if(width===1440||width===390) await page.screenshot({path:`${evidence}/${view}-${tag}-${width}.png`,fullPage:true});
  }
 });
 test(`dashboard tile numbers stay whole and within cards ${tag}`,async({page})=>{
  for(const view of ['home','admin']) for(const width of [...widths,339]){
   await page.setViewportSize({width,height:900});
   await openPreview(page,{...state,theme},`/dashboards/${view}`);
   for(const tile of await page.locator('.ts-stat-tile').all()){
    const g=await tile.evaluate(el=>{
     const value=el.querySelector('.ts-stat-tile__value')!;const r=document.createRange();r.selectNodeContents(value);
     const b=el.getBoundingClientRect(),v=r.getBoundingClientRect(),s=el.querySelector('.ts-stat-tile__sparkline')?.getBoundingClientRect();
     return {tile:b.toJSON(),value:v.toJSON(),lines:r.getClientRects().length,spark:s?.toJSON(),text:value.textContent};
    });
    expect(g.lines,`${g.text} at ${width}`).toBe(1);
    expect(g.value.left,`${g.text} at ${width}`).toBeGreaterThanOrEqual(g.tile.left);
    expect(g.value.right,`${g.text} at ${width}`).toBeLessThanOrEqual(g.tile.right);
    if(g.spark) expect(g.value.right<=g.spark.left||g.spark.right<=g.value.left||g.value.bottom<=g.spark.top||g.spark.bottom<=g.value.top).toBe(true);
   }
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
 });
 test(`registry paths truncate and selected full path remains available ${tag}`,async({page})=>{
  for(const width of widths){
   await page.setViewportSize({width,height:900});
   await page.goto(`/dashboards/admin?locale=${state.locale}&dir=${state.direction}&theme=${theme}&view=images`);
   await page.evaluate(()=>document.fonts.ready);
   const paths=page.locator('.dashboard-image-copy small');await expect(paths).toHaveCount(7);
   for(const path of await paths.all()){
    expect(await path.evaluate(el=>el.scrollWidth>el.clientWidth && getComputedStyle(el).textOverflow==='ellipsis' && el.clientWidth<=176)).toBe(true);
   }
   const row=page.getByRole('row').filter({hasText:'registry.agents.example/analytics:1.1.2'});
   await row.click();await expect(page.locator('.dashboard-details')).toContainText('registry.agents.example/analytics:1.1.2');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   if(width===1440||width===390) await page.screenshot({path:`${evidence}/images-${tag}-${width}.png`,fullPage:true});
  }
 });
}
test('rule labels translate, null rule stays absent, and decisions retain command identity',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await openPreview(page,{locale:'en',direction:'ltr',theme:'light'},'/dashboards/home');
 await expect(page.locator('.ts-approval-card__limit > span:first-child')).toHaveText(['Refund limit','Discount limit','Refund limit']);
 await expect(page.locator('.ts-approval-card').nth(1).locator('.ts-approval-card__limit')).toHaveCount(0);
 await page.getByRole('radio',{name:'العربية',exact:true}).click();
 await expect(page.locator('.ts-approval-card__limit > span:first-child')).toHaveText(['حد الاسترداد','حد الخصم','حد الاسترداد']);
 await page.screenshot({path:`${evidence}/rule-labels-ar.png`,fullPage:true});
 await page.getByRole('button',{name:'موافقة',exact:true}).first().click();
 await expect(page.locator('.ts-card__count')).toHaveText('3');
 await page.getByRole('radio',{name:'English',exact:true}).click();
 await expect(page.locator('.ts-approval-card__limit > span:first-child')).toHaveText(['Discount limit','Refund limit']);
 await page.locator('.sent-commands summary').click();
 const command=JSON.parse((await page.locator('.sent-commands pre').textContent())!);
 expect(command).toMatchObject({type:'ApprovalDecision',approvalId:'approval-1042',decision:'approve',contentHash:'sha256:request-1042'});
 await writeFile(`${evidence}/approval-command.json`,JSON.stringify(command,null,2));
});
