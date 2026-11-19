import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
const requirePreview = createRequire(new URL('../../apps/preview/package.json', import.meta.url));
const { createServer } = await import(pathToFileURL(requirePreview.resolve('vite')).href);
const evidence = '~/.no-mistakes/evidence/01M7T96F3830VNXDNHBGZKXXNX';
const server = await createServer({configFile:false,root:new URL('./fixture/',import.meta.url).pathname,server:{host:'127.0.0.1',port:0,fs:{allow:[process.cwd()]}}});
let browser;
const results=[];
try {
 await server.listen();
 browser=await chromium.launch();
 for(const locale of ['en','ar']) for(const theme of ['light','dark']) {
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${server.resolvedUrls.local[0]}?locale=${locale}&theme=${theme}`);
 await page.evaluate(()=>document.fonts.ready);
 const table=page.getByRole('table',{name:'Interactive companies'});
 const row=table.getByRole('row',{name:/Acme/});
 const other=table.getByRole('row',{name:/Northstar/});
 const button=row.getByRole('button',{name:'Open company'});
 const input=row.getByRole('textbox',{name:'Company note'});
 await expect(other).toHaveAttribute('aria-selected','true');
 await button.focus(); await button.press('Space');
 await expect(page.getByRole('status',{name:'Activation count'})).toHaveText('1');
 await expect(page.getByRole('status',{name:'Selection count'})).toHaveText('1');
 await button.press('Enter');
 await expect(page.getByRole('status',{name:'Activation count'})).toHaveText('2');
 await expect(page.getByRole('status',{name:'Selection count'})).toHaveText('2');
 await input.focus(); await input.press('a'); await input.press('Space'); await input.press('b'); await input.press('Enter');
 await expect(input).toHaveValue('a b');
 await expect(page.getByRole('status',{name:'Selection count'})).toHaveText('2');
 await other.focus(); await other.press('Space');
 await expect(other).toHaveAttribute('aria-selected','true'); await expect(row).toHaveAttribute('aria-selected','false');
 await row.focus(); await row.press('Enter');
 await expect(row).toHaveAttribute('aria-selected','true'); await expect(other).toHaveAttribute('aria-selected','false');
 const ring=await row.evaluate(el=>{const s=getComputedStyle(el);return {width:s.outlineWidth,offset:s.outlineOffset,color:s.outlineColor}});
 expect(ring).toEqual({width:'2px',offset:'2px',color:theme==='light'?'rgb(1, 105, 204)':'rgb(2, 133, 255)'});
 for(const text of ['DS / Demo store / Reach $1M in annual sales and serve every company customer worldwide','customer.with.a.very.long.email.address@example.com','Billed monthly under the company subscription with a detailed annual renewal agreement']) {
 const el=row.getByText(text,{exact:true}); await expect(el).toHaveAttribute('title',text);
 expect(await el.evaluate(e=>e.scrollWidth>e.clientWidth)).toBe(true);
 await expect(el).toHaveCSS('text-overflow','ellipsis');
 }
 const amount=row.getByRole('cell',{name:'$149',exact:true});
 await expect(amount).toHaveCSS('text-align','end'); await expect(amount).toHaveCSS('font-variant-numeric','tabular-nums');
 const fixture=page.getByRole('region',{name:'Table fixture'});
 const ft=fixture.getByRole('table',{name:locale==='ar'?'الشركات':'Companies'});
 await expect(ft).toBeVisible(); await expect(ft.getByRole('row')).toHaveCount(2);
 await expect(ft.getByRole('cell',{name:locale==='ar'?'أكمي':'Acme',exact:true})).toBeVisible();
 await expect(ft.getByRole('cell',{name:locale==='ar'?'١٤٩ دولاراً / شهرياً':'$149 / mo',exact:true})).toHaveCSS('text-align','end');
 await expect(ft.locator('tbody tr')).not.toHaveAttribute('tabindex');
 const empty=page.getByRole('region',{name:'Empty fixture'});
 await expect(empty.getByRole('heading',{name:locale==='ar'?'لا توجد شركات بعد':'No companies yet'})).toBeVisible();
 await expect(empty.getByText(locale==='ar'?'أضف شركة لتظهر في هذه القائمة.':'Add a company to see it listed here.',{exact:true})).toBeVisible();
 expect(errors).toEqual([]);
 await page.screenshot({path:`${evidence}/nested-controls-openui-${locale}-${theme}.png`,fullPage:true});
 results.push({locale,theme,buttonActivations:2,note:'a b',rowKeyboardSelection:'passed',focusRing:ring,truncatedHelpers:3,openuiTable:'rendered one record',openuiEmpty:'rendered localized title and description',browserErrors:errors});
 await page.close();
 }
 await mkdir(evidence,{recursive:true});
 await writeFile(`${evidence}/live-contract-results.json`,JSON.stringify(results,null,2));
 console.log(JSON.stringify(results,null,2));
} finally { await browser?.close(); await server.close(); }
