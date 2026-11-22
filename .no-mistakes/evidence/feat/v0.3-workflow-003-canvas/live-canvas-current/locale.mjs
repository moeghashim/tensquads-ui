import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:900}});
const evidence='~/.no-mistakes/evidence/01M82FRQGN7GR48DV2CT1824X3';
const result=[];
try{
await page.goto('http://127.0.0.1:5173/components/Canvas?locale=en&dir=ltr&theme=light');await page.locator('.ts-canvas').waitFor();await page.evaluate(()=>document.fonts.ready);
const root=page.locator('.canvas-preview .ts-canvas');
const read=async()=>root.evaluate(el=>({dir:el.dir,root:el.getBoundingClientRect().toJSON(),world:getComputedStyle(el.querySelector('.ts-canvas__world')).transform,nodes:[...el.querySelectorAll('[data-node-id]')].map(n=>({id:n.dataset.nodeId,title:n.textContent,rect:n.getBoundingClientRect().toJSON()}))}));
result.push({stage:'before',state:await read()});
await page.getByRole('radio',{name:'العربية',exact:true}).click();await page.waitForTimeout(500);await root.scrollIntoViewIfNeeded();result.push({stage:'switched to Arabic',state:await read()});await page.screenshot({path:evidence+'/language-switch-ar.png',fullPage:true});
await page.reload();await root.waitFor();await page.evaluate(()=>document.fonts.ready);await root.scrollIntoViewIfNeeded();result.push({stage:'fresh Arabic',state:await read()});await page.screenshot({path:evidence+'/fresh-ar.png',fullPage:true});
await writeFile(evidence+'/language-switch-geometry.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result.map(r=>({stage:r.stage,dir:r.state.dir,world:r.state.world,nodes:r.state.nodes.map(n=>({id:n.id,x:n.rect.x,y:n.rect.y}))})),null,2));
}finally{await browser.close();}
