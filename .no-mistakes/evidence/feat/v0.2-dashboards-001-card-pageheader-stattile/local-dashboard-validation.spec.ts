import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StatTile } from '../packages/ui/src/react/StatTile/StatTile';
const evidence='~/.no-mistakes/evidence/01M7SMMD2XH955PSB96AAGBXGM';
const states=[{locale:'en',dir:'ltr',theme:'light'},{locale:'en',dir:'ltr',theme:'dark'},{locale:'ar',dir:'rtl',theme:'light'},{locale:'ar',dir:'rtl',theme:'dark'}];
async function open(page,name,state,width){
 await page.setViewportSize({width,height:900});
 await page.goto(`/components/${name}?${new URLSearchParams(state)}`);
 await page.evaluate(()=>document.fonts.ready);
 await expect(page.locator('html')).toHaveAttribute('dir',state.dir);
 await expect(page.locator('html')).toHaveAttribute('lang',state.locale);
 await expect(page.locator('html')).toHaveAttribute('data-theme',state.theme);
 return page.locator('.dashboard-component-preview');
}
async function capture(page,name,state,width){
 await page.screenshot({path:`${evidence}/${name}-${state.locale}-${state.theme}-${width}.png`,fullPage:true,animations:'disabled'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const result=await new AxeBuilder({page}).analyze();
 expect(result.violations).toEqual([]);
}
test('Card: read parts, flush and inset states, and responsive OpenUI tile composition',async({page})=>{
 for(const state of states) for(const width of [1440,390]){
  const root=await open(page,'Card',state,width);const ar=state.locale==='ar';
  await expect(root.getByRole('heading',{name:ar?'الطلبات المفتوحة':'Open orders'})).toBeVisible();
  await expect(root.getByText(ar?'عرض كل الطلبات':'View all orders')).toBeVisible();
  await expect(root.locator('.ts-card__count').first()).toHaveText('3');
  await expect(root.locator('.ts-card__legend li')).toHaveCount(2);
  await expect(root.locator('.ts-card--flush [data-slot="card-body"]')).toHaveCSS('padding','0px');
  await expect(root.locator('[data-variant="inset"]')).toHaveCSS('border-top-width','0px');
  const fixture=root.getByRole('region',{name:ar?'عينة OpenUI':'OpenUI fixture'});
  await expect(fixture.getByRole('heading',{name:ar?'الإيرادات':'Revenue'})).toBeVisible();
  await expect(fixture.locator('.ts-stat-grid > article')).toHaveCount(2);
  const boxes=await fixture.locator('article').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y}}));
  if(width===1440){expect(boxes[1].y).toBeCloseTo(boxes[0].y,0);expect(ar?boxes[1].x<boxes[0].x:boxes[1].x>boxes[0].x).toBe(true)}
  else expect(boxes[1].y).toBeGreaterThan(boxes[0].y);
  await capture(page,'Card',state,width);
 }
});
test('PageHeader: localized title, metadata and keyboard-reachable action wrap at mobile width',async({page})=>{
 for(const state of states) for(const width of [1440,390]){
  const root=await open(page,'PageHeader',state,width);const ar=state.locale==='ar';
  const header=root.locator('.ts-page-header').first();
  await expect(header.getByRole('heading',{name:ar?'نظرة عامة':'Overview'})).toBeVisible();
  await expect(header.getByText(ar?'بيانات تجريبية':'Demo data')).toBeVisible();
  const button=header.getByRole('button',{name:ar?'تصدير التقرير':'Export report'});
  await button.focus();await expect(button).toBeFocused();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');await expect(button).toBeFocused();
  await expect(button).toHaveCSS('outline-width','2px');
  const action=await button.boundingBox();const copy=await header.locator('.ts-page-header__copy').boundingBox();
  if(width===390)expect(action!.y).toBeGreaterThanOrEqual(copy!.y+copy!.height);
  else expect(ar?action!.x<copy!.x:action!.x>copy!.x).toBe(true);
  await capture(page,'PageHeader',state,width);
 }
});
test('StatTile: localized deltas, optional trend, reading direction and accessible contrast',async({page})=>{
 for(const state of states) for(const width of [1440,390]){
  const root=await open(page,'StatTile',state,width);const ar=state.locale==='ar';
  const tiles=root.locator('.ts-stat-grid > article');await expect(tiles).toHaveCount(6);
  await expect(tiles.first().getByRole('img')).toHaveAccessibleName(ar?'الإيرادات':'Revenue');
  await expect(tiles.first().locator('.ts-stat-tile__delta')).toHaveText(ar?'+١٢٪ مقارنة بالأسبوع الماضي':'+12% vs last week');
  await expect(tiles.nth(1).locator('.ts-stat-tile__delta')).toHaveText(ar?'−٢٫١٪ مقارنة بالأسبوع الماضي':'−2.1% vs last week');
  await expect(tiles.last().getByRole('img')).toHaveCount(0);
  await expect(tiles.first().getByRole('img')).toHaveCSS('transform',ar?'matrix(-1, 0, 0, 1, 0, 0)':'none');
  const ratios=await tiles.evaluateAll(es=>es.flatMap(tile=>Array.from(tile.querySelectorAll('.ts-stat-tile__delta')).map(delta=>{
   const rgb=(s)=>s.match(/[\d.]+/g).slice(0,3).map(Number);
   const lum=(s)=>rgb(s).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
   const a=lum(getComputedStyle(delta).color),b=lum(getComputedStyle(tile).backgroundColor);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  })));
  for(const ratio of ratios)expect(ratio).toBeGreaterThanOrEqual(4.5);
  console.log(`contrast ${state.locale} ${state.theme} ${width}: ${ratios.map(n=>n.toFixed(2)).join(', ')}`);
  await capture(page,'StatTile',state,width);
 }
});
test('StatGrid: six real React metrics reflow 6/3/2/1 without overlapping values and 112x32 trends',async({page})=>{
 for(const state of states){
  const tiles=Array.from({length:6},(_,i)=>renderToStaticMarkup(createElement(StatTile,{label:state.locale==='ar'?'الإيرادات':'Revenue',value:state.locale==='ar'?'٢٤٬٨٦٠':'24,860',unit:i%2===0?'SAR':undefined,series:[3,7,4,9]}))).join('');
  await page.setContent(`<html lang="${state.locale}" dir="${state.dir}" data-theme="${state.theme}"><body><div class="ts-stat-grid">${tiles}</div></body></html>`);
  for(const file of ['tokens/tokens.css','styles/stat-tile.css'])await page.addStyleTag({content:readFileSync(`packages/ui/src/${file}`,'utf8')});
  for(const [width,columns] of [[1440,6],[1180,3],[760,2],[480,1],[390,1]]){
   await page.setViewportSize({width,height:900});
   expect(await page.locator('.ts-stat-grid').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length)).toBe(columns);
   for(const tile of await page.getByRole('article').all()){
    const value=await tile.locator('.ts-stat-tile__value').boundingBox(),trend=await tile.getByRole('img').boundingBox();
    expect(trend!.width).toBe(112);expect(trend!.height).toBe(32);
    expect(value!.x+value!.width<=trend!.x||trend!.x+trend!.width<=value!.x||value!.y+value!.height<=trend!.y||trend!.y+trend!.height<=value!.y).toBe(true);
   }
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   if([1440,390].includes(width))await page.screenshot({path:`${evidence}/StatGrid-${state.locale}-${state.theme}-${width}.png`,fullPage:true});
  }
 }
});
