import {createServer} from '../apps/preview/node_modules/vite/dist/node/index.js';
import {chromium,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7TPSWRD43TYFTEVB7V8914N';
const results=[]; let browser; let server;
try {
 server=await createServer({configFile:false,root:process.cwd()+'/.test-phase',server:{host:'127.0.0.1',port:0,fs:{allow:[process.cwd()]}}}); await server.listen();
 browser=await chromium.launch(); const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',e=>console.error('PAGE ERROR',e));
 for(const locale of ['en','ar']) {
  await page.goto(server.resolvedUrls.local[0]+'?locale='+locale); await expect(page.locator('#integer .ts-bar-chart__column')).toHaveCount(3); await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('#integer .ts-bar-chart__gridline')).toHaveText(['10','5','0']);
  const heights=await page.locator('#integer .ts-bar-chart__stack').evaluateAll(es=>es.map(e=>e.style.blockSize)); expect(heights).toEqual(['20%','30%','0%']);
  const ticks=await page.locator('#long .ts-bar-chart__tick').allTextContents(); expect(ticks).toEqual(['Day 1','','','','','Day 6','','','','','Day 11','','','','']);
  for(const width of [1440,390]) {
   await page.setViewportSize({width,height:900}); await page.locator('h1').click();
   const columns=page.locator('#currency .ts-bar-chart__column'); await expect(columns.first()).toHaveAccessibleName('A: $6,000.00'); await columns.first().hover();
   await expect(page.getByRole('tooltip')).toContainText('A: $6,000.00');
   await columns.first().focus(); await page.keyboard.press(locale==='ar'?'ArrowLeft':'ArrowRight'); await expect(columns.last()).toBeFocused();
   const bounds=await page.locator('#currency').evaluate(e=>{const v=e.querySelector('.ts-bar-chart__viewport').getBoundingClientRect();return [...e.querySelectorAll('.ts-bar-chart__gridline > span')].map(n=>{const r=n.getBoundingClientRect();return {left:r.left-v.left,right:v.right-r.right,top:r.top-v.top,bottom:v.bottom-r.bottom}})});
   for(const b of bounds) for(const n of Object.values(b)) expect(n).toBeGreaterThanOrEqual(0);
   await page.locator('#currency').screenshot({path:`${evidence}/currency-${locale}-${width}.png`});
  }
  results.push({scenario:'chart ticks and currency clipping',locale,heights,ticks,result:'pass'});
  await expect(page.locator('#entities .ts-data-table__tile')).toHaveText(['AS','NO','LC']);
  await page.locator('#entities').screenshot({path:`${evidence}/initials-${locale}.png`});
  results.push({scenario:'entity initials ignore stale supplied initials',locale,initials:['AS','NO','LC'],result:'pass'});
  const label=locale==='ar'?'حد الاسترداد اليومي':'Daily refund limit';
  await expect(page.locator('#mapped .ts-approval-card__limit')).toContainText(label);
  await expect(page.locator('#openui .ts-approval-card__limit')).toContainText(label);
  await expect(page.locator('#hidden .ts-approval-card__limit')).not.toContainText('daily_limit');
  await expect(page.locator('#hidden .ts-approval-card__limit')).toContainText(locale==='ar'?'٢٠':'20');
  await expect(page.locator('#hidden-only .ts-approval-card__limit')).toHaveCount(0);
  await page.locator('#legacy').getByRole('button',{name:'Allow',exact:true}).click();
  await expect(page.locator('#legacy .ts-approval-card__outcome')).toHaveText(locale==='ar'?'تمت الموافقة':'Approved');
  await expect(page.locator('#legacy').getByRole('button',{name:'Deny'})).toBeDisabled();
  await page.locator('#mapped').screenshot({path:`${evidence}/approval-mapped-${locale}.png`});
  await page.locator('#hidden').screenshot({path:`${evidence}/approval-unmapped-${locale}.png`});
  await page.locator('#legacy').screenshot({path:`${evidence}/approval-legacy-${locale}.png`});
  results.push({scenario:'mapped and unmapped approval rules and legacy positional OpenUI',locale,result:'pass'});
 }
} catch(e) {results.push({result:'fail',error:String(e),stack:e.stack}); process.exitCode=1;} finally {await browser?.close();await server?.close();await writeFile(evidence+'/local-component-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));}
