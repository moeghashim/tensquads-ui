import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch();const page=await browser.newPage();page.setDefaultTimeout(5000);
try{
await page.goto('http://127.0.0.1:5173/templates/list-detail');
await page.getByRole('searchbox',{name:'Search orders'}).fill('absent');
await page.getByRole('button',{name:'Clear filters',exact:true}).click();
console.log('simple clear',await page.getByRole('searchbox').inputValue());
await page.getByRole('searchbox').fill('#1044');
await page.getByRole('button',{name:'Status: All',exact:true}).click();
await page.getByRole('menuitemradio',{name:'Processing',exact:true}).click();
await expect(page.getByText('No orders match',{exact:true})).toBeVisible();
await expect(page.locator('[data-starting-style], [data-ending-style]')).toHaveCount(0);
await page.waitForTimeout(600);
await page.getByRole('button',{name:'Clear filters',exact:true}).click();
console.log('combined first click',await page.getByRole('searchbox').inputValue());
await page.getByRole('button',{name:'Clear filters',exact:true}).press('Enter');
console.log('combined Enter',await page.getByRole('searchbox').inputValue());
}catch(e){console.log(String(e));}finally{await browser.close();}
