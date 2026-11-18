import { chromium, expect } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
const out='~/.no-mistakes/evidence/01M7R3QX693WMP0YQPJGRV86E1';
const browser=await chromium.launch();
const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:1440,height:900}});
const page=await context.newPage();
const log=[]; const errors=[];
page.on('pageerror',e=>errors.push(e.message));
const go=async(name,locale='en',theme='light')=>{await page.goto(`http://localhost:5173/components/${name}?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}`);await page.evaluate(()=>document.fonts.ready);await expect(page.locator('.component-doc-page__header h1')).toHaveText(name);};
try {
await page.goto('http://localhost:5173/components?locale=en&dir=ltr&theme=light');
const names=await page.locator('.component-card__link strong').allTextContents();
if(process.env.NAV_ONLY) log.push(...JSON.parse(await readFile(`${out}/live-browser-results.json`,'utf8')).checks.filter(x=>x.name));
for(const locale of ['en','ar']) for(const theme of ['light','dark']) for(const name of (process.env.NAV_ONLY?[]:names)){
 await go(name,locale,theme);
 const docs=await page.locator('.markdown-document').innerText();
 const md=await readFile(`packages/ui/src/react/${name}/${name}.md`,'utf8');
 // Independent public documentation contract: preserve the reference's first paragraph.
 const first=md.split('\n\n')[1].replaceAll('`','').replaceAll('**','').replace(/\n/g,' ');
 expect(docs.replace(/\s+/g,' ')).toContain(first.replace(/\s+/g,' '));
 const summary=page.locator('.fixture-source summary'); await summary.click();
 if(await page.locator('.fixture-source').getAttribute('open')===null) await summary.click();
 await expect(page.locator('.fixture-source')).toHaveAttribute('open','');
 const source=await page.locator('.fixture-source pre code').textContent();
 expect(source).toBe((await readFile(`packages/ui/src/react/${name}/${name}.fixture.${locale}.txt`,'utf8')).trim());
 const rendered=page.locator('.gallery section[aria-label="'+(locale==='ar'?'عينة OpenUI':'OpenUI fixture')+'"]');
 await expect(rendered).toBeVisible(); await expect(rendered.locator('[data-slot], [role=img], img').first()).toBeVisible();
 const blocks=page.locator('.gallery .copyable-code, .fixture-source .copyable-code');
 // Exercise every displayed live-example and fixture copy control with the real browser clipboard.
 for(let i=0;i<await blocks.count();i++){
  const block=blocks.nth(i), code=await block.locator('pre code').textContent();
  const button=block.getByRole('button'); await button.click();
  await expect(button).toHaveAccessibleName(locale==='ar'?'تم النسخ':'Copied');
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(code);
 }
 for(const width of [1440,390]) {
  await page.setViewportSize({width,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
 }
 if(['Button','Dialog'].includes(name)) await page.screenshot({path:`${out}/${name}-${locale}-${theme}-390.png`,fullPage:true,animations:'disabled'});
 if(name==='Dialog'&&theme==='dark'){
  await page.setViewportSize({width:1440,height:900});await page.screenshot({path:`${out}/${name}-${locale}-${theme}-1440.png`,fullPage:true,animations:'disabled'});
 }
 await page.setViewportSize({width:1440,height:900});
 log.push({name,locale,theme,description:'Reference paragraph, localized fixture output and source, every example copied with real clipboard, 1440/390 overflow',blocks:await blocks.count()});
}
// Follow actual navigation, verify boundary controls and retained URL state.
await go('Button','ar','dark');
await expect(page.locator('[rel="prev"]')).toHaveCount(0);
const visited=[];
while(true){
 const name=await page.locator('.component-doc-page__header h1').innerText();visited.push(name);
 const next=page.locator('.component-doc-nav [rel="next"]'); if(!await next.count())break;
 await expect(next.locator('[aria-hidden]')).toHaveText('←');
 await page.keyboard.press('Escape'); await next.click(); await expect(page.locator('.component-doc-page__header h1')).not.toHaveText(name);
 const url=new URL(page.url());expect(url.searchParams.get('locale')).toBe('ar');expect(url.searchParams.get('dir')).toBe('rtl');expect(url.searchParams.get('theme')).toBe('dark');
}
expect([...visited].sort()).toEqual([...names].sort());
await expect(page.locator('.component-doc-nav [rel="next"]')).toHaveCount(0);
await page.locator('.component-doc-nav [rel="prev"]').click();
await expect(page.locator('.component-doc-page__header h1')).toHaveText(visited.at(-2));
log.push({navigation:visited,previousWorks:true,rtlArrow:'←',preserved:'locale=ar&dir=rtl&theme=dark'});
// Real denied permission, without replacing clipboard API.
await context.clearPermissions(); await context.grantPermissions([], {origin:'http://localhost:5173'});
await go('Button');
const status=await context.newCDPSession(page);
await status.send('Browser.setPermission',{permission:{name:'clipboard-write'},setting:'denied',origin:'http://localhost:5173'});
await page.locator('.button-preview__row .copyable-code').first().getByRole('button').click();
await expect(page.locator('.button-preview__row .copyable-code').first().getByRole('status')).toHaveText('Could not copy this code.');
await page.locator('.button-preview__row .copyable-code').first().screenshot({path:`${out}/clipboard-denied.png`});
log.push({clipboardDenied:'Could not copy this code.',clipboardAPI:'native Chromium permission denied'});

expect(errors).toEqual([]);
await writeFile(`${out}/live-browser-results.json`,JSON.stringify({result:'pass',checks:log,pageErrors:errors},null,2));
console.log(JSON.stringify({result:'pass',pages:log.length-2,navigation:visited,copiedBlocks:log.reduce((a,x)=>a+(x.blocks||0),0),errors},null,2));
} catch(error){await writeFile(`${out}/live-browser-results.json`,JSON.stringify({result:'fail',checks:log,error:String(error),pageErrors:errors},null,2));throw error;} finally {await browser.close();}
