import {chromium,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch(); const page=await browser.newPage({viewport:{width:390,height:900}});const results=[];
try{
await page.goto('http://localhost:5173/?locale=ar&dir=rtl&theme=dark');
await expect(page.locator('.stream-code__footer')).toContainText('7/7');
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(250);
for(let n=0;n<3;n++){
await page.evaluate(()=>{window.samples=[];window.running=true;const step=()=>{window.samples.push({time:performance.now(),height:document.querySelector('.stream-demo').getBoundingClientRect().height,fonts:document.fonts.status,code:document.querySelector('.stream-code').getBoundingClientRect().height,footer:document.querySelector('.stream-code__footer').innerText});if(window.running)requestAnimationFrame(step)};step()});
await page.getByRole('button',{name:'إعادة العرض',exact:true}).click();
await expect(page.locator('.stream-code__footer')).toContainText('7/7');
const samples=await page.evaluate(()=>{window.running=false;return window.samples});
results.push({iteration:n,delta:Math.max(...samples.map(s=>s.height))-Math.min(...samples.map(s=>s.height)),samples});
}
}finally{await browser.close();await writeFile('~/.no-mistakes/evidence/01M7R9KZBZ1DYA7WMVKJET5FGC/ar-font-check.json',JSON.stringify(results,null,2));console.log(results.map(({samples,...r})=>r));}
