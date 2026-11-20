import {build, preview} from 'vite';
import {chromium,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7VY15N70RJTJE8HRPKYRBT9';
const config={configFile:false,root:'.local-validation',esbuild:{jsx:'automatic'},build:{outDir:'dist'},preview:{host:'127.0.0.1',port:5187,strictPort:true}};
let server,browser; const results=[];
try {
 await build(config);
 server=await preview(config);
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1100,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const mode of ['inherited','owned','fallback']){
  for(const locale of ['en','ar']){
   await page.goto(`http://127.0.0.1:5187/?mode=${mode}&locale=${locale}`);
   const sections=page.locator('section[data-bot]');
   await expect(sections).toHaveCount(mode==='inherited'?5:3);
   for(let i=0;i<await sections.count();i++){
    const section=sections.nth(i);
    await expect(section.getByRole('status')).toContainText(locale==='en'?'Checking the order':'التحقق من الطلب');
    await expect(section.locator('img')).toHaveCount(mode==='owned'?2:0);
    await expect(section.locator('.ts-approval-card')).toContainText('task-42');
    if(mode==='owned'){
     const names=locale==='en'?['Petra','Rio','Kyoto']:['بترا','ريو','كيوتو'];
     await expect(section.locator('img').first()).toHaveAttribute('alt',new RegExp('^'+names[i]));
     await expect(section.locator('.ts-approval-card__agent')).toContainText(names[i]);
    }
   }
   const button=sections.first().getByRole('button',{name:locale==='en'?'Approve':'موافقة',exact:true});
   await button.click();
   await expect(sections.first().locator('.ts-approval-card__outcome')).toHaveText(locale==='en'?'Approved':'تمت الموافقة');
   await expect(sections.first().getByRole('button',{name:locale==='en'?'Decline':'رفض',exact:true})).toBeDisabled();
   expect(await page.evaluate(()=>window.commands)).toEqual([{type:'ApprovalDecision',approvalId:'approval-0',contentHash:'hash-42',decision:'approve'}]);
   await page.screenshot({path:`${evidence}/${mode}-${locale}.png`,fullPage:true});
   results.push({mode,locale,statusRows:await page.getByRole('status').count(),images:await page.locator('section[data-bot] img').count(),command:await page.evaluate(()=>window.commands),result:'pass'});
  }
 }
 await page.goto('http://127.0.0.1:5187/?mode=fallback&noMap=1');
 await expect(page.getByRole('status')).toHaveCount(3);
 await expect(page.locator('section[data-bot] img')).toHaveCount(0);
 results.push({mode:'absent-map',result:'pass'});
 expect(errors).toEqual([]);
 await writeFile(`${evidence}/browser-results.json`,JSON.stringify({surface:'Production-built local consumer of @tensquads/ui/react',oracle:'User intent and PLAN D27: only explicit valid host mappings show squadmates; unmapped bots retain usable status and approval controls.',results,browserErrors:errors},null,2));
 console.log(JSON.stringify(results,null,2));
} finally {await browser?.close();await new Promise(r=>server?server.httpServer.close(r):r());}
