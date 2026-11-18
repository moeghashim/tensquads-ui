import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const evidence = '~/.no-mistakes/evidence/01M7R3QX693WMP0YQPJGRV86E1';
await mkdir(`${evidence}/docs-screenshots`, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'], viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const log = [];
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const names = ['Button','Badge','Dialog','Field','Input','Chip','Squadmate','Menu','Switch','SegmentedControl','Tooltip'];
const fixtureLabels = { Button: ['Continue','متابعة'], Badge: ['Ready','جاهز'], Dialog: ['Review','مراجعة'] };
const shot = async name => { await page.screenshot({path:`${evidence}/docs-screenshots/${name}.png`, fullPage:true, animations:'disabled'}); };
try {
 if (!process.env.SKIP_MATRIX) for (const locale of ['en','ar']) for (const theme of ['light','dark']) for (const name of names) {
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  await page.setViewportSize({width:1440,height:900});
  await page.goto(`http://localhost:5174/components/${name}?locale=${locale}&dir=${dir}&theme=${theme}`);
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('.component-list').last().waitFor();
  await page.waitForFunction(()=>[...document.querySelectorAll('.component-list')].at(-1)?.children.length > 0);
  const fixture = page.locator('.component-list').last();
  assert.ok((await fixture.innerHTML()).length > 0);
  if (fixtureLabels[name]) assert.ok((await fixture.innerText()).includes(fixtureLabels[name][locale === 'ar' ? 1 : 0]));
  const details=page.locator('.fixture-source');
  assert.equal(await details.getAttribute('open'), null);
  await details.locator('summary').click();
  const source=await readFile(`packages/ui/src/react/${name}/${name}.fixture.${locale}.txt`,'utf8');
  assert.equal(await details.locator('pre code').textContent(),source.trim());
  await details.locator('summary').click();
  const codes=page.locator('.gallery .copyable-code');
  assert.ok(await codes.count() > 0, `${name} has live-example code`);
  if (name==='Button') for (const row of await page.locator('.button-preview__row').all()) {
   assert.equal((await row.locator('pre code').textContent()).split('\n').length,6);
   assert.equal(await row.locator(':scope > button').count(),6);
  }
  if (name==='Squadmate') for (const row of await page.locator('.squadmate-gallery__agent').all()) {
   assert.equal((await row.locator('pre code').textContent()).split('\n').length,await row.locator('figure').count());
  }
  if (name==='Chip') assert.ok((await codes.first().innerText()).includes('tool_search'));
  if (theme==='light') for (const code of await codes.all()) {
   const text=await code.locator('pre code').textContent();
   await code.locator('button').click();
   assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),text);
   assert.equal(await code.locator('[role=status]').innerText(),locale==='ar'?'تم النسخ':'Copied');
  }
  await shot(`${name}-${locale}-${theme}-1440`);
  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= document.documentElement.clientWidth), `${name} ${locale} ${theme} mobile overflow`);
  const axe=await new AxeBuilder({page}).analyze();
  assert.deepEqual(axe.violations,[],`${name} ${locale} ${theme} mobile axe`);
  await shot(`${name}-${locale}-${theme}-390`);
  console.log(`Verified ${name} ${locale} ${theme}`);
  log.push({name,locale,theme,fixtureSource:'exact active-locale fixture',fixtureRendered:true,copy:theme==='light'?'all live-example blocks copied to real browser clipboard':'covered in light',axe:'pass',overflow390:'pass'});
 }
 // Follow every next link, then previous and back, using Arabic dark settings.
 await page.goto('http://localhost:5174/components/Button?locale=ar&dir=rtl&theme=dark');
 for (let i=1;i<names.length;i++) {
  await page.keyboard.press('Escape');
  console.log('Navigate', await page.locator('.component-doc-nav [rel=next]').getAttribute('href'));
  await page.locator('.component-doc-nav [rel=next]').click();
  console.log('URL after click', page.url());
  await page.waitForURL(`**/components/${names[i]}?locale=ar&dir=rtl&theme=dark`);
  assert.equal(await page.locator('.component-doc-page__header h1').innerText(),names[i]);
 }
 assert.equal(await page.locator('.component-doc-nav [rel=next]').count(),0);
 await page.locator('.component-doc-nav [rel=prev]').click();
 await page.waitForURL('**/components/SegmentedControl?locale=ar&dir=rtl&theme=dark');
 await page.locator('.back-link').click();
 await page.waitForURL('**/components?locale=ar&dir=rtl&theme=dark');
 log.push({navigation:'all next links, previous, and gallery preserve Arabic/RTL/dark; final next absent'});
 // Real Tooltip geometry matches the copied logical-side example in both directions.
 for (const locale of ['en','ar']) {
  await page.setViewportSize({width:1440,height:900});
  await page.goto(`http://localhost:5174/components/Tooltip?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=light`);
  const item=page.locator('.tooltip-preview__item').nth(1);
  assert.ok((await item.locator('pre code').textContent()).includes('side="end"'));
  const trigger=item.locator('button').first();
  await trigger.hover();
  const tip=page.getByRole('tooltip');
  await tip.waitFor();
  const a=await trigger.boundingBox(), b=await tip.boundingBox();
  assert.ok(locale==='ar'?b.x+b.width<=a.x:a.x+a.width<=b.x,`logical end in ${locale}`);
  await shot(`Tooltip-${locale}-logical-end-open`);
  log.push({tooltip:locale,logicalEnd:locale==='ar'?'left':'right',copiedSide:'end'});
 }
 await page.goto('http://localhost:5174/components/Dialog?locale=ar&dir=rtl&theme=dark');
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new DOMException('Clipboard permission denied','NotAllowedError')}}}));
 const code=page.locator('.dialog-preview__item .copyable-code').first();
 await code.locator('button').click();
 assert.equal(await code.locator('[role=status]').innerText(),'تعذّر نسخ هذا الرمز.');
 await shot('clipboard-denied-ar');
 log.push({clipboardDenied:'visible localized failure; code remains available for manual copy'});
 await page.goto('http://localhost:5174/components/not-a-component?locale=ar&dir=rtl&theme=dark');
 assert.ok((await page.locator('main').innerText()).includes('توثيق المكوّن غير متاح.'));
 await shot('unknown-component-ar');
 log.push({unknownComponent:'localized unavailable message'});
 assert.deepEqual(errors,[],'no browser runtime errors');
} finally {
 await page.screenshot({path:`${evidence}/last-browser-state.png`, fullPage:true});
 await writeFile(`${evidence}/${process.env.SKIP_MATRIX?'navigation-results':'manual-browser-results'}.json`,JSON.stringify({log,errors},null,2));
 await browser.close();
}
console.log(JSON.stringify(log,null,2));
