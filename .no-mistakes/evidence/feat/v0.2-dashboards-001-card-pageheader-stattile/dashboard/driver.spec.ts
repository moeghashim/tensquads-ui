import { test, expect } from '@playwright/test';
import { writeFileSync, readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StatTile } from '../packages/ui/src/react/StatTile/StatTile';
const evidence = '~/.no-mistakes/evidence/01M7SMMD2XH955PSB96AAGBXGM/dashboard';
for (const locale of ['en','ar'] as const) for (const theme of ['light','dark'] as const) {
 test(`dashboard contracts ${locale} ${theme}`, async ({page}) => {
  const observations: unknown[] = [];
  for (const name of ['Card','PageHeader','StatTile']) {
   await page.goto(`/components/${name}?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}`);
   const fixture = page.locator('.dashboard-component-preview .component-list');
   await expect(fixture).toBeVisible();
   if (name==='Card') {
    await expect(fixture.locator('.ts-stat-grid article')).toHaveCount(2);
    await expect(fixture.getByRole('heading', {name:locale==='ar'?'الإيرادات':'Revenue'})).toBeVisible();
    await expect(fixture.getByText(locale==='ar'?'الطلبات':'Orders', {exact:true})).toBeVisible();
    await expect(page.locator('.dashboard-component-preview .ts-card__count').first()).toHaveText('3');
    await expect(page.locator('.dashboard-component-preview .ts-card__legend li')).toHaveCount(2);
   } else if (name==='PageHeader') {
    await expect(fixture.getByRole('heading', {name:locale==='ar'?'نظرة عامة':'Overview'})).toBeVisible();
    const action=page.locator('.dashboard-component-preview').getByRole('button', {name:locale==='ar'?'تصدير التقرير':'Export report'});
    await action.focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab');
    await expect(action).toBeFocused();
    const ring=await action.evaluate(el=>{const s=getComputedStyle(el);return [s.outlineWidth,s.outlineOffset,s.outlineColor]});
    expect(ring).toEqual(['2px','2px',theme==='dark'?'rgb(2, 133, 255)':'rgb(1, 105, 204)']);
    await page.keyboard.press('Enter');
    observations.push({headerAction:await action.textContent(),keyboardReachable:true,focusRing:ring});
   } else {
    const image=fixture.getByRole('img', {name:locale==='ar'?'الإيرادات':'Revenue',exact:true});
    await expect(image).toBeVisible();
    await expect(image).toHaveCSS('transform',locale==='ar'?'matrix(-1, 0, 0, 1, 0, 0)':'none');
    const delta=page.locator('.dashboard-component-preview .ts-stat-tile__delta--negative').first();
    const colors=await delta.evaluate(el=>({foreground:getComputedStyle(el).color,background:getComputedStyle(el.closest('article')!).backgroundColor}));
    const luminance=(rgb:string)=>{const a=rgb.match(/[\d.]+/g)!.slice(0,3).map(Number).map(x=>{x/=255;return x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4});return a[0]*.2126+a[1]*.7152+a[2]*.0722};
    const f=luminance(colors.foreground),b=luminance(colors.background);const ratio=(Math.max(f,b)+.05)/(Math.min(f,b)+.05);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
    observations.push({negativeDelta:await delta.textContent(),...colors,contrastRatio:ratio,rtlTrend:locale==='ar'});
   }
  }
  const tiles=Array.from({length:6},(_,i)=>renderToStaticMarkup(createElement(StatTile,{label:locale==='ar'?'الإيرادات':'Revenue',value:locale==='ar'?'٢٤٬٨٦٠':'24,860',unit:'SAR',series:i===5?null:[3,7,4,9],delta:i===5?null:{text:'0%',tone:'neutral'},foot:i===5?'No prior period':undefined}))).join('');
  await page.setContent(`<html lang="${locale}" dir="${locale==='ar'?'rtl':'ltr'}" data-theme="${theme}"><body><main class="ts-stat-grid">${tiles}</main></body></html>`);
  for (const path of ['packages/ui/src/tokens/tokens.css','packages/ui/src/styles/stat-tile.css']) await page.addStyleTag({content:readFileSync(path,'utf8')});
  await expect(page.locator('article').last().getByRole('img')).toHaveCount(0);
  await expect(page.locator('article').last().locator('.ts-stat-tile__delta')).toHaveCount(0);
  await expect(page.getByText('No prior period')).toBeVisible();
  for (const width of [1440,1180,760,480,390]) {
   await page.setViewportSize({width,height:900});
   const columns=await page.locator('main').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
   expect(columns).toBe(width===1440?6:width===1180?3:width===760?2:1);
   await page.screenshot({path:`${evidence}/grid-${locale}-${theme}-${width}.png`,fullPage:true});
   observations.push({width,columns,noPriorPeriod:true,absentSeries:true});
  }
  writeFileSync(`${evidence}/observations-${locale}-${theme}.json`,JSON.stringify(observations,null,2));
 });
}
