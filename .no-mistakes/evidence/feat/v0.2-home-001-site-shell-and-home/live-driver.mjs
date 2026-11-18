import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';
const out='~/.no-mistakes/evidence/01M7QYA6HGZQ2RZD9BZEHMTBF9';
const browser=await chromium.launch();
const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});
const page=await context.newPage();
const log=[];
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
const go=async(locale,theme,route='/')=>{await page.goto(`http://localhost:5173${route}?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}`); await page.evaluate(()=>document.fonts.ready);};
try {
for(const locale of ['en','ar']) for(const theme of ['light','dark']){
 await page.setViewportSize({width:1440,height:900});
 await go(locale,theme);
 await expect(page.locator('.stream-screen__actions button')).toHaveCount(2);
 await expect(page.locator('.component-card')).toHaveCount(11);
 await expect(page.locator('.style-setup code')).toHaveText('@layer ui-sdk, tensquads;\n@import "@tensquads/ui/fonts.css";\n@import "@tensquads/ui/tokens.css";\n@import "@tensquads/ui/styles.css";');
 await page.screenshot({path:`${out}/home-${locale}-${theme}-1440.png`,fullPage:true});
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
  const axe=await new AxeBuilder({page}).analyze();
  expect(axe.violations).toEqual([]);
  await page.keyboard.press('Tab');
  const ring=await page.evaluate(()=>{const s=getComputedStyle(document.activeElement);return [s.outlineWidth,s.outlineOffset,s.outlineColor]});
  expect(ring).toEqual(['2px','2px',theme==='light'?'rgb(1, 105, 204)':'rgb(2, 133, 255)']);
  if(width===390) await page.screenshot({path:`${out}/home-${locale}-${theme}-390.png`,fullPage:true});
  log.push(`${locale}/${theme}/${width}: home renders 11 component cards, CSS setup, no horizontal overflow, axe clean, keyboard focus ring correct`);
 }
 for(const route of ['/components','/get-started']){
  await go(locale,theme,route);
  await expect(page.getByRole('heading',{level:1})).toHaveText(route==='/components'?(locale==='ar'?'معرض المكوّنات':'Component gallery'):(locale==='ar'?'البدء':'Get started'));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.screenshot({path:`${out}/${route.slice(1)}-${locale}-${theme}-390.png`,fullPage:true});
 }
}
await page.setViewportSize({width:1440,height:900});
await go('en','light');
await page.locator('.install-card button').click();
await expect(page.locator('.install-card button')).toHaveText('Copied');
expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe('npm install github:moeghashim/tensquads-ui#<commit-sha>');
log.push('Real browser clipboard received the exact pinned-commit install command');
await page.locator('.stream-code button').click();
await expect(page.locator('.stream-code__footer')).toContainText('0/7');
await expect(page.locator('.stream-code__line')).toHaveCount(7);
await expect(page.getByRole('button',{name:'Approve plan',exact:true})).toBeVisible();
await page.getByRole('textbox',{name:'Store name',exact:true}).fill('Disposable test store');
await expect(page.getByRole('textbox',{name:'Store name',exact:true})).toHaveValue('Disposable test store');
const sw=page.getByRole('switch',{name:'Email me when done'});
const checked=await sw.getAttribute('aria-checked'); await sw.click(); await expect(sw).toHaveAttribute('aria-checked',checked==='true'?'false':'true');
await page.getByRole('radio',{name:'Monthly',exact:true}).click();
await expect(page.getByRole('radio',{name:'Monthly',exact:true})).toHaveAttribute('aria-checked','true');
log.push('Replay resets 0/7 and completes 7/7; rendered Input, Switch and SegmentedControl accept user changes');
for(const locale of ['en','ar']) {
 await go(locale,'dark');
 const nav=page.getByRole('navigation');
 for(const [label,path] of [[locale==='ar'?'المكوّنات':'Components','/components'],[locale==='ar'?'البدء':'Get started','/get-started'],[locale==='ar'?'الرئيسية':'Home','/']]){
  await nav.getByRole('link',{name:label,exact:true}).click();
  await expect(page).toHaveURL(`http://localhost:5173${path}?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=dark`);
 }
 await page.getByRole('radio',{name:locale==='ar'?'النظام':'System',exact:true}).click();
 await expect(page.locator('html')).not.toHaveAttribute('data-theme');
 await context.emulateMedia?.({colorScheme:'dark'});
 log.push(`${locale}: header navigation preserves locale/direction/theme; System clears explicit theme`);
}
const reduced=await browser.newContext({reducedMotion:'reduce'});
const rp=await reduced.newPage();
for(const locale of ['en','ar']){
 await rp.goto(`http://localhost:5173/?locale=${locale}&theme=light`);
 await expect(rp.locator('.stream-code__line')).toHaveCount(7,{timeout:1000});
 await rp.locator('.stream-code button').click();
 await expect(rp.locator('.stream-code__line')).toHaveCount(7,{timeout:500});
 log.push(`${locale}: reduced motion displays final seven-line fixture on load and replay`);
}
await reduced.close();
expect(errors).toEqual([]);
await writeFile(`${out}/live-checks.json`,JSON.stringify({result:'pass',checks:log,pageErrors:errors},null,2));
console.log(log.join('\n'));
} catch(error){ await page.screenshot({path:`${out}/failure.png`,fullPage:true}); await writeFile(`${out}/live-checks.json`,JSON.stringify({result:'fail',checks:log,error:String(error),pageErrors:errors},null,2));throw error; }
finally{await context.close();await browser.close();}
