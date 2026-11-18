import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFile,writeFile} from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7QWYPYNKJZ2J3E6AHZ84B59';
const browser=await chromium.launch();
const results=JSON.parse(await readFile(`${evidence}/live-results.json`,'utf8')).filter(r=>r.result==='pass');
async function scenario(name,fn){if(!name.startsWith('Keyboard'))return;try{await fn();results.push({name,result:'pass'});}catch(e){results.push({name,result:'fail',error:e.stack});} await writeFile(`${evidence}/live-results.json`,JSON.stringify(results,null,2));}
try {
await scenario('Responsive home and shell: EN/AR, light/dark, 1440/390; accessible routes and keyboard focus',async()=>{
for(const locale of ['en','ar']) for(const theme of ['light','dark']){
const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});const page=await context.newPage();
try{
for(const route of ['/','/components','/get-started']){
await page.goto(`http://localhost:5173${route}?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}`);await page.evaluate(()=>document.fonts.ready);
await expect(page.getByRole('heading',{level:1})).toBeVisible();
if(route==='/')await expect(page.getByRole('button',{name:locale==='ar'?'اعتماد الخطة':'Approve plan'})).toBeVisible();
for(const width of [1440,390]){
await page.setViewportSize({width,height:900});
await page.screenshot({path:`${evidence}/${route==='/'?'home':route.slice(1)}-${locale}-${theme}-${width}.png`,fullPage:true,animations:'disabled'});
const size=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth})); expect(size.scroll).toBeLessThanOrEqual(size.width);
const a11y=await new AxeBuilder({page}).analyze();expect(a11y.violations).toEqual([]);
}
await page.keyboard.press('Tab');
expect(await page.evaluate(()=>{const s=getComputedStyle(document.activeElement);return [s.outlineWidth,s.outlineOffset,s.outlineColor]})).toEqual(['2px','2px',theme==='light'?'rgb(1, 105, 204)':'rgb(2, 133, 255)']);
if(route==='/get-started')await expect(page.locator('main').locator(':scope > *')).toHaveCount(1);
}
}finally{await context.close();}
}
});
await scenario('Keyboard navigation preserves Arabic, direction and system theme; system follows OS preference',async()=>{
const context=await browser.newContext({colorScheme:'dark',reducedMotion:'reduce'});const page=await context.newPage();
try{
await page.goto('http://localhost:5173/?locale=ar&dir=rtl&theme=system');
const bg=await page.locator('html').evaluate(el=>getComputedStyle(el).backgroundColor);
await page.emulateMedia({colorScheme:'light'});expect(await page.locator('html').evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe(bg);
const nav=page.getByRole('navigation');const links=nav.getByRole('link');
for(const [i,path] of [[1,'/components'],[2,'/get-started'],[0,'/']]){await links.nth(i).focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(`http://localhost:5173${path}?locale=ar&dir=rtl&theme=system`);}
await page.getByRole('radio',{name:'English',exact:true}).first().focus();await page.keyboard.press('Space');await expect(page.locator('html')).toHaveAttribute('lang','en');await expect(page.locator('html')).toHaveAttribute('dir','ltr');
}finally{await context.close();}
});
await scenario('Replay streams fixture lines locally and rendered controls accept input; reduced motion renders immediately',async()=>{
const context=await browser.newContext();const page=await context.newPage();const requests=[];page.on('request',r=>{if(r.method()!=='GET'||!r.url().startsWith('http://localhost:5173'))requests.push(r.url());});
try{
await page.goto('http://localhost:5173/?locale=en&dir=ltr&theme=light');await expect(page.getByRole('button',{name:'Approve plan'})).toBeVisible();
await page.getByRole('button',{name:'Replay',exact:true}).click();await expect(page.locator('.stream-code__line')).toHaveCount(0);await expect(page.getByRole('button',{name:'Approve plan'})).toBeVisible();await expect(page.locator('.stream-code__line')).toHaveCount(7);
const pane=page.locator('.stream-screen');await pane.getByRole('textbox').fill('Disposable test store');await expect(pane.getByRole('textbox')).toHaveValue('Disposable test store');
const sw=pane.getByRole('switch');const before=await sw.getAttribute('aria-checked');await sw.focus();await page.keyboard.press('Space');await expect(sw).toHaveAttribute('aria-checked',before==='true'?'false':'true');await pane.getByRole('radio',{name:'Weekly',exact:true}).click();await expect(pane.getByRole('radio',{name:'Weekly',exact:true})).toBeChecked();
expect(requests).toEqual([]);
await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'Replay',exact:true}).click();await expect(page.locator('.stream-code__line')).toHaveCount(7,{timeout:500});await expect(pane.getByRole('button',{name:'Approve plan'})).toBeVisible();
}finally{await context.close();}
});
await scenario('Install command copies to browser clipboard and CSS setup is visible',async()=>{
const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});const page=await context.newPage();try{
await page.goto('http://localhost:5173/?locale=en&dir=ltr&theme=light');await page.locator('.install-card').getByRole('button').click();await expect(page.locator('.install-card').getByRole('button')).toHaveText('Copied');expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe('npm install github:moeghashim/tensquads-ui#<commit-sha>');
await expect(page.locator('.style-setup code')).toHaveText('@layer ui-sdk, tensquads;\n@import "@tensquads/ui/fonts.css";\n@import "@tensquads/ui/tokens.css";\n@import "@tensquads/ui/styles.css";');
}finally{await context.close();}
});
}finally{await browser.close();}
console.log(JSON.stringify(results,null,2));if(results.some(r=>r.result==='fail'))process.exitCode=1;
