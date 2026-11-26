import {chromium,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M8C6E2WKXYMMG8EH23GQHD1H';
const browser=await chromium.launch();
try {
const context=await browser.newContext();const page=await context.newPage({viewport:{width:1440,height:900}});
await page.goto('http://127.0.0.1:5187/dashboards/admin?locale=en&dir=ltr&theme=light');
await page.getByRole('button',{name:/Squad images/}).click();
await page.getByRole('row',{name:/registry\.agents\.example\/orders:1\.8\.2/}).click();
const details=page.locator('.template-detail-rows');
await expect(details).toContainText('registry.agents.example/orders:1.8.2');
await expect(details).toHaveCSS('display','grid');
await expect(details.locator('dd').first()).toHaveCSS('overflow-wrap','anywhere');
await page.evaluate(()=>document.fonts.ready);
await page.screenshot({path:`${evidence}/admin-shared-detail-styles.png`,fullPage:true});
const styles=await details.evaluate(e=>({display:getComputedStyle(e).display,columns:getComputedStyle(e).gridTemplateColumns,gap:getComputedStyle(e).gap,valueFont:getComputedStyle(e.querySelector('dd')).fontFamily}));
const response=await context.request.get('http://127.0.0.1:5187/templates/list-detail.md');expect(response.status()).toBe(200);expect(response.headers()['content-type']).toBe('text/markdown; charset=utf-8');await writeFile(`${evidence}/list-detail-served.md`,await response.text());
await writeFile(`${evidence}/shared-styles-observations.json`,JSON.stringify({selectedImage:await details.innerText(),styles,markdown:{status:response.status(),type:response.headers()['content-type']}},null,2));
console.log(JSON.stringify({selectedImage:'orders:1.8.2',styles,markdownStatus:response.status()}));
} finally {await browser.close();}
