import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { openPreview } from './helpers/preview';
const evidence = '~/.no-mistakes/evidence/01M8C2DHGWGBKZ1GSHY3KDMVVH';

test('local Orders filters reject nonmatches, clear safely and export only matching records', async ({page}) => {
 await openPreview(page, {locale:'en',direction:'ltr',theme:'light'}, '/templates/list-detail');
 const table = page.getByRole('table', {name:'Orders'});
 const search = page.getByRole('searchbox', {name:'Search orders'});
 await page.getByRole('button', {name:'Next page',exact:true}).click();
 await search.fill('  #1044  ');
 await expect(table.getByRole('row')).toHaveCount(2);
 await expect(table).toContainText('Yousef Nasser');
 await expect(page.getByText('Showing 1 of 1', {exact:true})).toBeVisible();
 await table.getByRole('row').filter({hasText:'#1044'}).click();
 const panel = page.locator('.template-order__panel');
 await expect(panel).toContainText('Linen throw, sand');
 await expect(panel).toContainText('SAR 678.00');
 await expect(panel).toContainText('SAR 101.70');
 await expect(panel.getByRole('button',{name:'Refund',exact:true})).toBeEnabled();
 let message = '';
 page.once('dialog', async dialog => { message = dialog.message(); await dialog.dismiss(); });
 await panel.getByRole('button',{name:'Refund',exact:true}).click();
 expect(message).toBe('This is a sample order.');
 await search.fill('no such order 999999');
 await expect(page.getByText('No orders match',{exact:true})).toBeVisible();
 await expect(panel).toHaveCount(0);
 await page.screenshot({path:`${evidence}/empty-filters.png`, fullPage:true});
 await page.getByRole('button',{name:'Clear filters',exact:true}).click();
 await expect(search).toHaveValue('');
 await expect(page.getByText('Showing 6 of 128',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Status: All',exact:true}).click();
 await page.getByRole('menuitemcheckbox',{name:'Hide archived orders'}).click();
 await page.keyboard.press('Escape');
 await expect(page.getByText('Showing 6 of 134',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Order dates',exact:true}).click();
 await page.getByRole('button',{name:'Last 7 days',exact:true}).click();
 await page.getByRole('button',{name:'Apply',exact:true}).click();
 await page.getByRole('button',{name:'Status: All',exact:true}).click();
 await page.getByRole('menuitemradio',{name:'Processing',exact:true}).click();
 await expect(table).toContainText('#1046');
 await page.keyboard.press('Escape');
 await expect(page.getByRole('menu')).toHaveCount(0);
 await table.getByRole('row').filter({hasText:'#1046'}).press('Enter');
 await expect(panel.getByRole('button',{name:'Refund',exact:true})).toBeDisabled();
 const pending = page.waitForEvent('download');
 await page.getByRole('button',{name:'Export',exact:true}).click();
 const download=await pending; expect(download.suggestedFilename()).toBe('orders.csv');
 await download.saveAs(`${evidence}/filtered-orders.csv`);
 const csv=await readFile(`${evidence}/filtered-orders.csv`,'utf8');
 const records=csv.split('\r\n').slice(1).map(line=>line.split(',').map(x=>x.replaceAll('"','')));
 expect(records.length).toBeGreaterThan(0);
 for(const record of records){ expect(record[2] >= '2026-11-20' && record[2] <= '2026-11-26').toBe(true); expect(record[3]).toBe('processing'); }
 await page.screenshot({path:`${evidence}/filtered-orders.png`,fullPage:true});
});

for(const locale of ['en','ar'] as const) test(`local Orders shared edges and responsive boundary in ${locale}`,async({page})=>{
 const state={locale,direction:locale==='ar'?'rtl':'ltr',theme:'light'} as const;
 const edges=async(selector:string)=>page.locator(selector).evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right};});
 const expected=new Map();
 await openPreview(page,state,'/components');
 for(const width of [1440,1024,1023,390]){await page.setViewportSize({width,height:900}); await expect(page.getByRole('main')).toBeVisible(); await expect.poll(async()=>{const e=await edges('main');return e.right>e.left;}).toBe(true); expected.set(width,await edges('main'));}
 await openPreview(page,state,'/templates/list-detail');
 for(const width of [1440,1024,1023,390]){
  await page.setViewportSize({width,height:900});
  await expect.poll(()=>edges('.template-preview')).toEqual(expected.get(width));
  const panel=page.locator('.template-order__panel');
  if(width>=1024){
   await expect(panel).toBeVisible();
   const list=await page.locator('.template-order__list').boundingBox(); const detail=await panel.boundingBox();
   expect(locale==='en'?list!.x+list!.width<=detail!.x:detail!.x+detail!.width<=list!.x).toBe(true);
  }else{
   await expect(panel).toHaveCount(0);
   const row=page.getByRole('table').getByRole('row').filter({hasText:locale==='en'?'#1044':'#١٠٤٤'});
   await row.click();
   const sheet=page.getByRole('dialog'); await expect(sheet).toBeVisible();
   await expect(sheet).toHaveCSS('inset-block-end','0px');
   await page.screenshot({path:`${evidence}/pointer-sheet-${locale}-${width}.png`,fullPage:true});
   console.log('pointer sheet state', locale,width, await page.evaluate(()=>({active:document.activeElement?.tagName, dialogs:document.querySelectorAll('[role=dialog]').length})));
   await expect.poll(()=>sheet.evaluate(el=>el.contains(document.activeElement))).toBe(true);
   await page.keyboard.press('Tab');
   await expect.poll(()=>sheet.evaluate(el=>el.contains(document.activeElement))).toBe(true);
   if(width===1023)await page.screenshot({path:`${evidence}/boundary-${locale}-1023.png`,fullPage:true});
   await page.keyboard.press('Escape'); await expect(row).toBeFocused(); await expect(sheet).toHaveCount(0); await expect(page.locator('[data-starting-style], [data-ending-style]')).toHaveCount(0);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
   const scroll=page.locator('.ts-data-table__scroll');
   if(width===390) expect(await scroll.evaluate(el=>el.scrollWidth>el.clientWidth && getComputedStyle(el).overflowX==='auto')).toBe(true);
  }
 }
});

test('local gallery exposes the Orders template and moved admin detail styles render',async({page,request})=>{
 await openPreview(page,{locale:'ar',direction:'rtl',theme:'dark'},'/templates');
 await page.getByRole('main').getByRole('link',{name:/القائمة والتفاصيل/}).click();
 await expect(page.getByRole('heading',{name:'الطلبات',level:1})).toBeVisible();
 const index=await (await request.get('/llms.txt')).text(); expect(index).toContain('/templates/list-detail.md');
 await openPreview(page,{locale:'en',direction:'ltr',theme:'light'},'/dashboards/admin');
 await page.getByRole('button',{name:'Squad images'}).click();
 await page.getByRole('row',{name:/registry\.agents\.example\/orders:1\.8\.2/}).click();
 const rows=page.locator('.template-detail-rows');
 await expect(rows).toContainText('registry.agents.example/orders:1.8.2');
 await expect(rows).toHaveCSS('display','grid');
 await page.screenshot({path:`${evidence}/admin-detail-styles.png`,fullPage:true});
});
