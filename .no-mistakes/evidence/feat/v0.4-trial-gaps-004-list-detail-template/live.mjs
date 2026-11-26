import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFile,readFile} from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M8C6E2WKXYMMG8EH23GQHD1H';
const browser=await chromium.launch();
const report=[];
let page;
const record=(name,details)=>{report.push({name,...details});console.log(JSON.stringify(report.at(-1)));};
async function shot(name){await page.screenshot({path:`${evidence}/${name}.png`,fullPage:true,animations:'disabled'});}
async function open(locale='en',theme='light',width=1440){await page.setViewportSize({width,height:900});await page.goto(`http://127.0.0.1:5187/templates/list-detail?locale=${locale}&dir=${locale==='en'?'ltr':'rtl'}&theme=${theme}`);await page.evaluate(()=>document.fonts.ready);await expect(page.getByRole('heading',{level:1,name:locale==='en'?'Orders':'الطلبات',exact:true})).toBeVisible();}
async function noOverflow(){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);}
try {
const context=await browser.newContext(); page=await context.newPage();
for (const locale of ['en','ar']) for(const theme of ['light','dark']) {
 await open(locale,theme);
 const panel=page.locator('.template-order__panel');
 await expect(panel).toBeVisible();
 const listBox=await page.locator('.template-order__list').boundingBox(),panelBox=await panel.boundingBox();
 expect(Math.abs(listBox.y-panelBox.y)).toBeLessThan(2);
 expect(locale==='en'?panelBox.x>=listBox.x+listBox.width:panelBox.x+panelBox.width<=listBox.x).toBe(true);
 expect(await page.locator('.ts-data-table__scroll').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
 expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
 await shot(`orders-${locale}-${theme}-1440`);
 await page.setViewportSize({width:390,height:844}); await noOverflow();
 await expect(panel).toHaveCount(0); await expect(page.getByRole('dialog')).toHaveCount(0);
 await shot(`orders-${locale}-${theme}-390`);
 expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
 const id=locale==='en'?'#1044':'#١٠٤٤';
 const row=page.getByRole('table',{name:locale==='en'?'Orders':'الطلبات',exact:true}).getByRole('row').filter({hasText:id});
 await row.press('Enter');
 const sheet=page.getByRole('dialog',{name:id,exact:true});await expect(sheet).toBeVisible();
 await expect(sheet).toHaveCSS('inset-block-end','0px');
 await expect(sheet.getByRole('heading',{level:2}).locator('bdi')).toHaveAttribute('dir','ltr');
 await noOverflow();expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
 await shot(`orders-sheet-${locale}-${theme}-390`);
 for(let i=0;i<8;i++){await page.keyboard.press('Tab');expect(await sheet.evaluate(e=>e.contains(document.activeElement))).toBe(true);}
 await page.keyboard.press('Escape');await expect(sheet).toHaveCount(0);await expect(row).toBeFocused();
 record('localized responsive layout and sheet',{locale,theme,desktop:'aligned beside table without table overflow',mobile:'390px no document overflow; focus trapped and restored',axe:'no violations'});
}
await open('en','light',1024);
await expect(page.locator('.template-order__panel')).toBeVisible();
await shot('orders-breakpoint-1024');
await page.setViewportSize({width:1023,height:900});await expect(page.locator('.template-order__panel')).toHaveCount(0);
const row=page.getByRole('table',{name:'Orders',exact:true}).getByRole('row').filter({hasText:'#1044'});
await row.press('Space');await expect(page.getByRole('dialog',{name:'#1044'})).toBeVisible();
await shot('orders-breakpoint-1023');await page.keyboard.press('Escape');await expect(row).toBeFocused();
record('breakpoint',{width1024:'side panel',width1023:'sheet opens by Space and Escape restores row focus'});
await open();
await page.getByRole('button',{name:'Next page',exact:true}).click();
await expect(page.getByText('Showing 12 of 128',{exact:true})).toBeVisible();
await expect(page.locator('.template-order__panel')).toHaveCount(0);
await page.getByRole('button',{name:'Order dates',exact:true}).click();
await page.getByRole('button',{name:'Last 7 days',exact:true}).click();
await page.getByRole('button',{name:'Apply',exact:true}).click();
await expect(page.getByText('Showing 6 of 13',{exact:true})).toBeVisible();
await expect(page.getByRole('button',{name:'Previous page',exact:true})).toBeDisabled();
await page.getByRole('button',{name:'Order dates',exact:true}).click();
await page.getByRole('button',{name:'This month',exact:true}).click();
await page.getByRole('button',{name:'Apply',exact:true}).click();
await expect(page.getByText('Showing 6 of 128',{exact:true})).toBeVisible();
await page.getByRole('button',{name:'Status: All',exact:true}).click();
await page.getByRole('menuitemcheckbox',{name:'Hide archived orders',exact:true}).click();
await page.keyboard.press('Escape');
await expect(page.getByText('Showing 6 of 134',{exact:true})).toBeVisible();
await page.getByRole('searchbox',{name:'Search orders'}).fill('#919');
await expect(page.getByRole('table',{name:'Orders',exact:true})).toContainText('#919');
await page.getByRole('button',{name:'Status: All',exact:true}).click();
await page.getByRole('menuitemcheckbox',{name:'Hide archived orders',exact:true}).click();
await page.keyboard.press('Escape');
await expect(page.getByText('No orders match',{exact:true})).toBeVisible();
await shot('orders-archived-empty');
await page.getByRole('button',{name:'Clear filters',exact:true}).click();
await expect(page.getByText('Showing 6 of 128',{exact:true})).toBeVisible();
await expect(page.getByRole('searchbox',{name:'Search orders'})).toHaveValue('');
record('date,archive,pagination filters',{last7days:13,allWithArchived:134,archivedOrder919:'hidden by archive filter; Clear restores 128 unarchived orders and first page'});
await page.getByRole('searchbox',{name:'Search orders'}).fill('  #1044  ');
const one=page.getByRole('table',{name:'Orders',exact:true}).getByRole('row').filter({hasText:'#1044'});
await expect(page.getByText('Showing 1 of 1',{exact:true})).toBeVisible();
await one.click();
const panel=page.locator('.template-order__panel');
await expect(panel).toContainText('SAR 678.00');await expect(panel).toContainText('SAR 101.70');await expect(panel).toContainText('SAR 779.70');
await expect(panel.getByRole('button',{name:'Refund',exact:true})).toHaveAttribute('data-agent-confirm',/^Refund SAR\s779\.70 for order #1044\.$/);
for(const [button,message] of [['Refund','This is a sample order.'],['Contact customer','This is a sample customer.']]){
 const dialog=page.waitForEvent('dialog');const click=panel.getByRole('button',{name:button,exact:true}).click();const d=await dialog;expect(d.message()).toBe(message);await d.accept();await click;
}
const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export',exact:true}).click();const download=await downloadPromise;
expect(download.suggestedFilename()).toBe('orders.csv');await download.saveAs(`${evidence}/filtered-orders.csv`);
const csv=await readFile(`${evidence}/filtered-orders.csv`,'utf8');
expect(csv).toBe('"Order","Customer","Date","Status"\r\n"1044","Yousef Nasser","2026-11-23","paid"');
await shot('orders-filtered-selected');
await page.getByRole('searchbox',{name:'Search orders'}).fill('#1047');
await page.getByRole('table',{name:'Orders',exact:true}).getByRole('row').filter({hasText:'#1047'}).click();
await expect(page.locator('.template-order__panel').getByRole('button',{name:'Refund',exact:true})).toBeDisabled();
record('preview actions',{total:'678.00 + 101.70 = SAR 779.70',paidRefund:'confirmation effect attribute and sample alert',pendingRefund:'disabled',contact:'sample alert',export:'filtered-orders.csv contains only matching order 1044'});
await writeFile(`${evidence}/live-observations.json`,JSON.stringify(report,null,2));
} catch(error){if(page)await shot('failure');await writeFile(`${evidence}/live-observations.json`,JSON.stringify({completed:report,error:String(error)},null,2));throw error;} finally{await browser.close();}
