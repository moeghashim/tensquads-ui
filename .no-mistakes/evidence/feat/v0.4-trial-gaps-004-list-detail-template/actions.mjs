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
const context=await browser.newContext(); page=await context.newPage(); await open();
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
await writeFile(`${evidence}/actions-observations.json`,JSON.stringify(report,null,2));
} catch(error){if(page)await shot('failure');await writeFile(`${evidence}/actions-observations.json`,JSON.stringify({completed:report,error:String(error)},null,2));throw error;} finally{await browser.close();}
