import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
const require = createRequire(`${process.cwd()}/package.json`);
const {chromium, expect} = require('@playwright/test');
const evidence = '~/.no-mistakes/evidence/01M7R19XBNY5QFSPW8AKJXF5BW';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: {width:1440,height:1000} });
const page = await context.newPage();
const errors=[]; page.on('pageerror',error=>errors.push(error.message));
const results=[];
async function open(locale,theme,width=1440) {
 await page.setViewportSize({width,height:1000});
 await page.goto(`http://127.0.0.1:5173/?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}`);
 await page.evaluate(()=>document.fonts.ready);
 await expect(page.locator('.stream-code__line')).toHaveCount(7);
 await expect(page.locator('html')).toHaveAttribute('lang',locale);
}
async function directions() {
 return page.locator('pre, code').evaluateAll(elements=>elements.map(el=>({text:el.textContent,direction:getComputedStyle(el).direction,bidi:getComputedStyle(el).unicodeBidi})));
}
try {
 // Oracle: explicit intent requires LTR code despite Arabic RTL page, including mixed-script streams.
 for (const theme of ['light','dark']) {
  await open('ar',theme);
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  const code=await directions();
  expect(code.length).toBeGreaterThan(10);
  expect(code.every(el=>el.direction==='ltr'&&el.bidi==='isolate')).toBe(true);
  await expect(page.locator('.install-card code')).toHaveText('npm install github:moeghashim/tensquads-ui#<commit-sha>');
  const glyphs=await page.locator('.install-card code').evaluate(el=>{
   const text=el.firstChild; const a=document.createRange(),b=document.createRange();
   a.setStart(text,0);a.setEnd(text,3);b.setStart(text,12);b.setEnd(text,18);
   return {npm:a.getBoundingClientRect().x,github:b.getBoundingClientRect().x};
  });
  expect(glyphs.npm).toBeLessThan(glyphs.github);
  await page.screenshot({path:`${evidence}/arabic-${theme}-desktop.png`,fullPage:true});
  results.push({scenario:'Arabic desktop code remains LTR',theme,code,glyphs});
 }
 // Adversarial boundary: narrow RTL layouts must contain code overflow locally, and allow keyboard scrolling.
 for (const theme of ['light','dark']) {
  await open('ar',theme,390);
  const dims=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,content:document.documentElement.scrollWidth}));
  expect(dims.content).toBeLessThanOrEqual(dims.viewport);
  expect((await directions()).every(el=>el.direction==='ltr')).toBe(true);
  const command=page.locator('.install-card__command');
  await command.focus();
  await expect(command).toBeFocused();
  const scroll=await command.evaluate(el=>({width:el.clientWidth,content:el.scrollWidth}));
  await page.keyboard.press('Home'); await page.keyboard.press('ArrowLeft');
  await page.screenshot({path:`${evidence}/arabic-${theme}-mobile.png`,fullPage:true});
  results.push({scenario:'Arabic mobile code stays LTR without document overflow',theme,dims,scroll});
 }
 // Oracle: intent drops untranslated role; state follows demo language, independently of page language.
 for (const locale of ['en','ar']) {
  await open(locale,'light');
  const pane=page.locator('.stream-screen');
  for (const selected of ['ar','en','ar']) {
   await pane.getByRole('radio',{name:selected==='ar'?'العربية · RTL':'English',exact:true}).click();
   await expect(pane).toHaveAttribute('lang',selected);
   await expect(pane).toHaveAttribute('dir',selected==='ar'?'rtl':'ltr');
   await expect(pane.locator('.stream-screen__agent-copy strong')).toHaveText(selected==='ar'?'إعداد المتجر مع بترا':'Petra is setting up your store');
   await expect(pane.locator('.stream-screen__agent-copy span')).toHaveText(selected==='ar'?'قيد العمل':'Running skill');
   await expect(pane.getByRole('button',{name:selected==='ar'?'اعتماد الخطة':'Approve plan',exact:true})).toBeVisible();
   await expect(page.locator('html')).toHaveAttribute('lang',locale);
   results.push({scenario:'Demo locale switches show localized state without a role',pageLocale:locale,demoLocale:selected,agent:await pane.locator('.stream-screen__agent-copy').innerText()});
   if(selected==='en') await page.locator('.stream-demo').screenshot({path:`${evidence}/${locale}-page-english-demo.png`});
  }
 }
 expect(errors).toEqual([]);
 await writeFile(`${evidence}/live-results.json`,JSON.stringify({baseURL:'http://127.0.0.1:5173',results,errors},null,2));
 console.log(JSON.stringify({results,errors},null,2));
} finally {await context.close();await browser.close();}
