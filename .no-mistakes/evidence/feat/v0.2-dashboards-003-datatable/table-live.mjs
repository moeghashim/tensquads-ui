import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile,cp} from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7TB9SFZAA73421ZD3RQ65FB';
await mkdir(evidence,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];
try {
 const page=await browser.newPage();
 for(const locale of ['en','ar']) for(const theme of ['light','dark']) {
  const dir=locale==='ar'?'rtl':'ltr';
  await page.setViewportSize({width:1440,height:900});
  await page.goto(`http://127.0.0.1:5173/components/DataTable?locale=${locale}&dir=${dir}&theme=${theme}`);
  await page.evaluate(()=>document.fonts.ready);
  const card=page.locator('.dashboard-component-preview > [data-slot=card]');
  await card.getByRole('radiogroup').waitFor();
  const tileData=await card.locator('.ts-data-table__tile').evaluateAll(tiles=>tiles.map(tile=>{
   const s=getComputedStyle(tile); const probe=document.createElement('span');
   const primary=tile.textContent==='AC';
   probe.style.backgroundColor=`var(--ts-${primary?'primary-soft':'success-surface'})`;
   probe.style.color=`var(--ts-${primary?'primary-solid':'success-text'})`;
   tile.append(probe); const ps=getComputedStyle(probe);
   const data={initials:tile.firstChild.textContent,background:s.backgroundColor,color:s.color,expectedBackground:ps.backgroundColor,expectedColor:ps.color};
   probe.remove(); return data;
  }));
  assert.equal(tileData.length,2);
  for(const tile of tileData){assert.equal(tile.background,tile.expectedBackground); assert.equal(tile.color,tile.expectedColor); assert.notEqual(tile.background,'rgba(0, 0, 0, 0)');}
  assert.notEqual(tileData[0].background,tileData[1].background);
  await card.screenshot({path:`${evidence}/table-${locale}-${theme}-desktop.png`});
  for(const width of [1440,390]) {
   await page.setViewportSize({width,height:900});
   const input=await card.getByRole('textbox').boundingBox(); const filters=await card.getByRole('radiogroup').boundingBox();
   assert.equal(input.height,filters.height);
   const scroll=card.locator('.ts-data-table__scroll');
   const before=await scroll.evaluate(el=>({client:el.clientWidth,content:el.scrollWidth,left:el.scrollLeft,page:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
   assert.ok(before.page<=before.viewport);
   if(width===390){
    assert.ok(before.content>before.client,'table must actually overflow its narrow wrapper');
    await scroll.hover(); console.log('scroll before',locale,theme,before,await scroll.evaluate(el=>({left:el.scrollLeft,dir:getComputedStyle(el).direction}))); 
    await page.mouse.wheel(dir==='rtl'?-1600:1600,0);
    await page.waitForFunction(({dir})=>{const el=document.querySelector('.dashboard-component-preview > [data-slot=card] .ts-data-table__scroll'); return Math.abs(el.scrollLeft)>=el.scrollWidth-el.clientWidth-1;},{dir},{timeout:3000});
    const after=await scroll.evaluate(el=>({left:el.scrollLeft,rect:el.getBoundingClientRect().toJSON(),page:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
    assert.ok(after.page<=after.viewport); assert.ok(Math.abs(after.left)>=before.content-before.client-1);
    const last=await card.locator('tbody tr').first().locator('td').last().boundingBox();
    assert.ok(last.x>=after.rect.x-1 && last.x+last.width<=after.rect.right+1,'last column is visible inside card after wheel scroll');
    await card.screenshot({path:`${evidence}/table-${locale}-${theme}-mobile-scrolled.png`});
    results.push({locale,theme,width,toolbarHeight:input.height,before,after,lastColumn:last,tiles:tileData});
   } else results.push({locale,theme,width,toolbarHeight:input.height,tiles:tileData});
  }
  await card.getByRole('textbox').fill('No such company');
  await card.getByRole('heading',{name:locale==='ar'?'لا تطابق أي شركة البحث':'No companies match'}).waitFor();
  await card.screenshot({path:`${evidence}/empty-${locale}-${theme}-mobile.png`});
  await card.getByRole('button',{name:locale==='ar'?'مسح البحث':'Clear search'}).click();
  assert.equal(await card.locator('tbody tr').count(),2);
 }
 await cp('test-results/screenshots',`${evidence}/preview-screenshots`,{recursive:true});
 await writeFile(`${evidence}/live-table-results.json`,JSON.stringify({surface:'production-built local preview at 127.0.0.1:5173 with synthetic Acme Studio and Northstar records',oracle:'Task 003 narrow-scroll and controlled toolbar contracts; author intent and Agent-UI semantic tint tokens',results},null,2));
 console.log(JSON.stringify({result:'pass',checks:results.length,evidence},null,2));
} finally {await browser.close();}
