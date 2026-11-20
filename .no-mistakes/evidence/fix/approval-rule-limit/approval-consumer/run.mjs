import { build, preview } from '../apps/preview/node_modules/vite/dist/node/index.js';
import { chromium, expect } from '@playwright/test';
import {mkdir, writeFile} from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7W1PS2S1QYRQAGAMGEAVSV8';
await mkdir(evidence,{recursive:true});
const config={configFile:false,root:new URL('.',import.meta.url).pathname,esbuild:{jsx:'automatic'},build:{outDir:'dist',emptyOutDir:true},preview:{host:'127.0.0.1',port:5197,strictPort:true}};
let server,browser;
const records=[];
try {
 await build(config);
 server=await preview(config);
 browser=await chromium.launch();
 const page=await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const locale of ['en','ar']) for(const theme of ['light','dark']) for(const width of [1440,390]) {
  await page.setViewportSize({width,height:1000});
  await page.goto(`http://127.0.0.1:5197/?locale=${locale}&theme=${theme}`);
  await expect(page.locator('.ts-approval-card')).toHaveCount(12);
  await page.evaluate(()=>document.fonts.ready);
  const clean=s=>s.replace(/[\u200e\u200f\u061c]/g,'').replace(/\s+/g,' ').trim();
  const money=locale==='en'?'$42.00':'٤٢٫٠٠ US$';
  const zero=locale==='en'?'$0.00':'٠٫٠٠ US$';
  const amount=locale==='en'?'Amount $12.00':'المبلغ ١٢٫٠٠ US$';
  const label=locale==='en'?'Refund limit':'حد الاسترداد';
  const generic=locale==='en'?'Limit':'الحد';
  const ceiling=locale==='en'?'Ceiling':'السقف';
  const observed={};
  for(const surface of ['react','openui']) {
   for(const [id,expected] of [
    ['labelled',[amount,`${label} ${money}`]],
    ['unmapped',[`${generic} ${money}`]],
    ['no-rule-zero',[`${ceiling} ${zero}`]],
    ['label-only',[label]],
    ['absent',[]],
    ['unmapped-null',[]],
   ]) {
    const card=page.locator(`[data-case="${surface}-${id}"]`);
    const row=card.locator('.ts-approval-card__limit');
    if(expected.length) {
      await expect(row).toBeVisible();
      const actual=(await row.locator(':scope > span').allTextContents()).map(clean);
      expect(actual).toEqual(expected);
      observed[`${surface}-${id}`]=actual;
    } else {await expect(row).toHaveCount(0);observed[`${surface}-${id}`]='No money/rule row';}
    await expect(card).not.toContainText('internal_rule_id');
   }
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  const screenshot=`approval-${locale}-${theme}-${width}.png`;
  await page.screenshot({path:`${evidence}/${screenshot}`,fullPage:true});
  records.push({locale,theme,width,observed,screenshot});
 }
 await writeFile(`${evidence}/approval-live-results.json`,JSON.stringify({oracle:'Author intent and ApprovalCard public contract: labelled rule replaces generic Limit, unlabelled limit retains fallback, null limit renders label alone; fixed USD examples $12/$42/$0 independently chosen.',runtime:'Production Vite build of real React public entry and TensquadsRenderer; synthetic local requests; Chromium',records},null,2));
 console.log(JSON.stringify({status:'passed',views:records.length,results:`${evidence}/approval-live-results.json`}));
} finally {
 await browser?.close();
 if(server) {await new Promise((resolve,reject)=>server.httpServer.close(e=>e?reject(e):resolve()));}
}
