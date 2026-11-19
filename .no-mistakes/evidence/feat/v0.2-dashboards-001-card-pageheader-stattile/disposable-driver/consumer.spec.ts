import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const evidence='~/.no-mistakes/evidence/01M7SMMD2XH955PSB96AAGBXGM';
for(const locale of ['en','ar']) for(const theme of ['light','dark']) {
 test(`Public React consumer grid, optional trends and actions ${locale} ${theme}`,async({page})=>{
  await page.goto(`http://127.0.0.1:5174/?locale=${locale}&theme=${theme}`);
  const tiles=page.locator('[data-slot="stat-tile"]');await expect(tiles).toHaveCount(6);
  await page.evaluate(()=>document.fonts.ready);
  const dimensions=[];
  for(const [width,columns] of [[1440,6],[1180,3],[760,2],[480,1],[390,1]]){
   await page.setViewportSize({width,height:900});
   await expect(page.locator('.ts-stat-grid')).toHaveCSS('display','grid');
   expect(await page.locator('.ts-stat-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(columns);
   const overflow=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,content:document.documentElement.scrollWidth}));
   const overlaps=await tiles.evaluateAll(els=>els.flatMap((el,i)=>{
    const value=el.querySelector('.ts-stat-tile__value')?.getBoundingClientRect(), chart=el.querySelector('svg')?.getBoundingClientRect();
    return value && chart && value.left < chart.right && value.right > chart.left && value.top < chart.bottom && value.bottom > chart.top ? [{tile:i,value:{x:value.x,y:value.y,width:value.width,height:value.height},chart:{x:chart.x,y:chart.y,width:chart.width,height:chart.height}}]:[];
   }));
   dimensions.push({width,columns,overflow,overlaps});
   expect.soft(overlaps,`Metric and sparkline must not overlap at ${width}`).toEqual([]);
   await page.screenshot({path:`${evidence}/consumer-${locale}-${theme}-${width}.png`,fullPage:true});
   expect.soft(overflow.content,`No page overflow at ${width}`).toBeLessThanOrEqual(overflow.viewport);
  }
  for(let i=0;i<3;i++) await expect(tiles.nth(i).getByRole('img')).toHaveCount(1);
  for(let i=3;i<6;i++) await expect(tiles.nth(i).getByRole('img')).toHaveCount(0);
  await expect(tiles.nth(5)).toContainText(locale==='ar'?'لا توجد فترة سابقة':'No previous period');
  await expect(tiles.nth(3).locator('.ts-stat-tile__unit')).toHaveText('USD');
  for(const tone of ['positive','negative','neutral']) await expect(page.locator(`.ts-stat-tile__delta--${tone}`).first()).toBeVisible();
  const colors=await page.locator('.ts-stat-tile__delta').evaluateAll(els=>els.slice(0,3).map(el=>getComputedStyle(el).color));
  expect(new Set(colors).size).toBe(3);
  await expect(tiles.first().getByRole('img')).toHaveAccessibleName(locale==='ar'?'الإيرادات':'Revenue');
  await expect(tiles.first().getByRole('img')).toHaveCSS('transform',locale==='ar'?'matrix(-1, 0, 0, 1, 0, 0)':'none');
  const flatPoints=await tiles.nth(2).locator('polyline').getAttribute('points');
  expect(new Set(flatPoints!.split(' ').map(p=>p.split(',')[1])).size).toBe(1);
  const exportButton=page.getByRole('button',{name:locale==='ar'?'تصدير التقرير':'Export report'});
  await exportButton.focus(); await page.keyboard.press('Enter'); await expect(page.getByRole('status')).toHaveText('1');
  const filter=page.getByRole('button',{name:locale==='ar'?'تصفية':'Filter'});await filter.focus();await page.keyboard.press('Space');await expect(page.getByRole('status')).toHaveText('2');
  const header=page.locator('.ts-page-header');const copy=await header.locator('.ts-page-header__copy').boundingBox();const action=await exportButton.boundingBox();expect(action!.y).toBeGreaterThanOrEqual(copy!.y+copy!.height);
  const axe=(await new AxeBuilder({page}).analyze()).violations; await test.info().attach('accessibility',{body:JSON.stringify(axe,null,2),contentType:'application/json'}); expect.soft(axe).toEqual([]);
  await test.info().attach('layout measurements',{body:JSON.stringify(dimensions,null,2),contentType:'application/json'});
 });
}
