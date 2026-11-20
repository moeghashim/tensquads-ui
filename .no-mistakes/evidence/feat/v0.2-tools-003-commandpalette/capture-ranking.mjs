import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch();
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto('http://127.0.0.1:5173/components/CommandPalette?locale=en&dir=ltr&theme=dark');
 await page.evaluate(()=>document.fonts.ready);
 await page.locator('.site-search-button').click();
 const dialog=page.getByRole('dialog');
 await expect(dialog).toBeVisible();
 await expect.poll(async()=>Math.abs((await dialog.boundingBox()).y-108)).toBeLessThan(1);
 await dialog.getByRole('combobox').fill('dat');
 await expect(dialog.getByRole('group',{name:'Components',exact:true}).getByRole('option').first()).toHaveText('DataTable');
 await expect.poll(()=>dialog.evaluate(e=>getComputedStyle(e).opacity)).toBe('1');
 await page.screenshot({path:'~/.no-mistakes/evidence/01M7WBBYE6PTB8B9ZSFYGX7H2J/ranking-dat.png',caret:'hide'});
 console.log('Rendered Components results: '+JSON.stringify(await dialog.getByRole('option').allTextContents()));
}finally{await browser.close();}
