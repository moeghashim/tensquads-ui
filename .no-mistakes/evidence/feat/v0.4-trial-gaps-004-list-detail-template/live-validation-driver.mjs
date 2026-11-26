import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile, readFile, copyFile } from 'node:fs/promises';
const evidence = '~/.no-mistakes/evidence/01M8C57T2HRFNW0FEJS4G95XZG';
await mkdir(evidence, {recursive:true});
const browser = await chromium.launch();
const context = await browser.newContext({ viewport:{width:1440,height:1000}, acceptDownloads:true });
const page = await context.newPage();
page.setDefaultTimeout(8000);
const results=[];
const errors=[];
page.on('pageerror', error=>errors.push(error.message));
async function shot(name){await page.screenshot({path:`${evidence}/${name}.png`,fullPage:true,animations:'disabled'});}
async function run(name,fn){try{await fn();results.push({name,result:'pass'});}catch(error){results.push({name,result:'fail',error:String(error)});console.log(name,String(error));await shot(`failure-${results.length}`);}}
async function open(locale='en',width=1440){await page.setViewportSize({width,height:1000});await page.goto(`http://127.0.0.1:5173/templates/list-detail?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=light`);await page.evaluate(()=>document.fonts.ready);await expect(page.getByRole('heading',{name:locale==='ar'?'الطلبات':'Orders',level:1})).toBeVisible();}
try {
await run('Search/status/date/archive filters reset pagination, clear stale details and recover from no matches',async()=>{
 await open();
 const search=page.getByRole('searchbox',{name:'Search orders'});
 const table=page.getByRole('table',{name:'Orders',exact:true});
 await page.getByRole('button',{name:'Next page',exact:true}).click();
 await search.fill('#1044');
 await expect(table.getByRole('row')).toHaveCount(2);
 await expect(table).toContainText('Yousef Nasser');
 await expect(page.getByRole('button',{name:'Previous page',exact:true})).toBeDisabled();
 await table.getByRole('row').filter({hasText:'#1044'}).click();
 await expect(page.locator('.template-order__panel')).toContainText('SAR 779.70');
 await page.getByRole('button',{name:'Status: All',exact:true}).click();
 await page.getByRole('menuitemradio',{name:'Processing',exact:true}).click();
 await expect(page.getByText('No orders match', {exact:true})).toBeVisible();
 await expect(page.locator('.template-order__panel')).toHaveCount(0);
 await shot('filters-no-matches');
 await page.getByRole('button',{name:'Clear filters',exact:true}).click();
 let pointerClearFailure;
 try { await expect(search).toHaveValue(''); } catch(error) { pointerClearFailure=String(error); await shot('clear-filters-pointer-failure'); await page.getByRole('button',{name:'Clear filters',exact:true}).press('Enter'); }
 await expect(search).toHaveValue('');
 await expect(page.getByText('Showing 6 of 128',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Status: All',exact:true}).click();
 await page.getByRole('menuitemcheckbox',{name:'Hide archived orders',exact:true}).click();
 await page.keyboard.press('Escape');
 await expect(page.getByText('Showing 6 of 134',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Order dates',exact:true}).click();
 await page.getByRole('button',{name:'Last 7 days',exact:true}).click();
 await page.getByRole('button',{name:'Apply',exact:true}).click();
 await expect(page.getByText('Showing 6 of 13',{exact:true})).toBeVisible();
 await search.fill('missing customer 98765');
 await expect(page.getByText('No orders match',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Clear filters',exact:true}).click();
 await expect(page.getByText('Showing 6 of 128',{exact:true})).toBeVisible();
 await shot('filters-restored');
 if(pointerClearFailure) throw new Error('Clear filters pointer click did not clear the search/status after selecting Processing. Enter recovered the view. '+pointerClearFailure);
});
await run('Arabic search accepts Arabic-Indic and ASCII order identifiers and Arabic customer names',async()=>{
 await open('ar');
 const search=page.getByRole('searchbox',{name:'البحث في الطلبات'});
 const table=page.getByRole('table',{name:'الطلبات',exact:true});
 for(const value of ['#١٠٤٤','1044','يوسف']){
  await search.fill(value);
  await expect(table).toContainText('#١٠٤٤');
  await expect(table).toContainText('يوسف ناصر');
 }
 await search.fill('#١٠٤٤');
 await table.getByRole('row').filter({hasText:'#١٠٤٤'}).click();
 await expect(page.locator('.template-order__panel')).toContainText('٧٧٩٫٧٠');
 await shot('arabic-search-detail');
});
await run('At 1023px selection opens a modal sheet; at 1024px the same selection is a side panel',async()=>{
 for(const locale of ['en','ar']){
  await open(locale,1023);
  const id=locale==='ar'?'#١٠٤٤':'#1044';
  const row=page.getByRole('table').getByRole('row').filter({hasText:id});
  await expect(page.locator('.template-order__panel')).toHaveCount(0);
  await row.press('Space');
  await expect(page.getByRole('dialog',{name:id,exact:true})).toBeVisible();
  await shot(`boundary-${locale}-1023`);
  await page.keyboard.press('Escape');
  await expect(row).toBeFocused();
  await page.setViewportSize({width:1024,height:1000});
  await row.press('Enter');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const panel=page.locator('.template-order__panel');
  await expect(panel).toBeVisible();
  const listBox=await page.locator('.template-order__list').boundingBox();
  const panelBox=await panel.boundingBox();
  expect(Math.abs(listBox.y-panelBox.y)).toBeLessThan(2);
  expect(panelBox.x+panelBox.width<=listBox.x+1 || listBox.x+listBox.width<=panelBox.x+1).toBeTruthy();
  await shot(`boundary-${locale}-1024`);
 }
});
await run('Export contains only matching orders; paid refund and contact trigger sample notices; unpaid refund is disabled',async()=>{
 await open();
 const panel=page.locator('.template-order__panel');
 let refundNotice;
 page.once('dialog',async dialog=>{refundNotice=dialog.message();await dialog.dismiss();});
 await panel.getByRole('button',{name:'Refund',exact:true}).click();
 expect(refundNotice).toBe('This is a sample order.');
 let contactNotice;
 page.once('dialog',async dialog=>{contactNotice=dialog.message();await dialog.dismiss();});
 await panel.getByRole('button',{name:'Contact customer',exact:true}).click();
 expect(contactNotice).toBe('This is a sample customer.');
 await page.getByRole('table').getByRole('row').filter({hasText:'#1047'}).click();
 await expect(panel.getByRole('button',{name:'Refund',exact:true})).toBeDisabled();
 await page.getByRole('searchbox',{name:'Search orders'}).fill('#1044');
 const downloadPromise=page.waitForEvent('download');
 await page.getByRole('button',{name:'Export',exact:true}).click();
 const download=await downloadPromise;
 expect(download.suggestedFilename()).toBe('orders.csv');
 await download.saveAs(`${evidence}/filtered-orders.csv`);
 const csv=await readFile(`${evidence}/filtered-orders.csv`,'utf8');
 expect(csv.split('\r\n')).toEqual(['"Order","Customer","Date","Status"','"1044","Yousef Nasser","2026-11-23","paid"']);
 await shot('filtered-export');
});
await run('Admin image details retain their two-column layout after styles move into the template',async()=>{
 await page.goto('http://127.0.0.1:5173/dashboards/admin?locale=en&dir=ltr&theme=light&view=images');
 await page.getByRole('row',{name:/registry\.agents\.example\/orders:1\.8\.2/}).click();
 const details=page.locator('.template-detail-rows');
 await expect(details).toContainText('registry.agents.example/orders:1.8.2');
 await expect(details).toHaveCSS('display','grid');
 const geometry=await details.evaluate(el=>{const dt=el.querySelector('dt').getBoundingClientRect(),dd=el.querySelector('dd').getBoundingClientRect();return {sameLine:Math.abs(dt.y-dd.y)<2,separate:dd.x>dt.x+dt.width-1};});
 expect(geometry).toEqual({sameLine:true,separate:true});
 await shot('admin-moved-detail-styles');
});
} finally {
 await browser.close();
 await writeFile(`${evidence}/live-validation.json`,JSON.stringify({surface:'Built preview running locally with synthetic demo orders',results,pageErrors:errors},null,2));
 console.log(JSON.stringify({results,pageErrors:errors},null,2));
}
if(results.some(r=>r.result==='fail')||errors.length)process.exitCode=1;
