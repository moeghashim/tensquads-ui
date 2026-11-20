import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7WBBYE6PTB8B9ZSFYGX7H2J';
await mkdir(evidence,{recursive:true});
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900}});
await context.tracing.start({screenshots:true,snapshots:true});
const page=await context.newPage();
const results=[];
const details=[];
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
async function visit(locale='en',theme='light',path='/components/CommandPalette') {
 await page.goto(`http://127.0.0.1:5173${path}?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}`);
 await page.evaluate(()=>document.fonts.ready);
 await expect(page.locator('html')).toHaveAttribute('lang',locale);
}
async function shot(name){await page.screenshot({path:`${evidence}/${name}.png`,animations:'disabled',caret:'hide'});}
async function openDemo(locale='en'){
 await page.getByRole('button',{name:locale==='ar'?'افتح البحث':'Open search',exact:true}).click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await expect(page.getByRole('dialog')).not.toHaveAttribute('data-starting-style');
 await expect.poll(async()=>Math.abs((await page.getByRole('dialog').boundingBox()).y-108)).toBeLessThan(1);
}
const dialog=()=>page.getByRole('dialog');
const input=()=>dialog().getByRole('combobox');
async function scenario(name,fn){try {await fn();results.push({name,result:'pass',live:true});}catch(e){results.push({name,result:'fail',live:true,error:e.stack});await shot(`failure-${results.length}`);} }
try {
 await scenario('Site search ranks label matches before keyword-only matches in the Components group; Enter navigates to the leading label match',async()=>{
  await visit('en','dark','/');
  await page.locator('.site-search-button').click();
  await input().fill('dat');
  const group=dialog().getByRole('group',{name:'Components',exact:true});
  await expect(group.getByRole('option').first()).toHaveText('DataTable');
  await expect(group.getByRole('option',{name:'Field',exact:true})).toBeVisible();
  const order=await group.getByRole('option').allTextContents();
  details.push({query:'dat',visibleOrder:order});
  await shot('ranking-dat');
  await input().fill('no-such-command-9876');
  await input().fill('DAT');
  await expect(group.getByRole('option').first()).toHaveText('DataTable');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/components\/DataTable\?/);
  await expect(dialog()).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get('theme')).toBe('dark');
  details.push({selectedDestination:page.url()});
 });
 await scenario('English and Arabic demo search matches keywords and unaccented Arabic labels, hides unmatched groups, and selects by arrow and Enter',async()=>{
  for(const locale of ['en','ar']){
   await visit(locale,'dark');await openDemo(locale);
   await input().fill('dark');
   await expect(dialog().getByRole('group')).toHaveCount(1);
   await expect(dialog().getByRole('option')).toHaveText(locale==='ar'?'تغيير السمة⌘D':'Change theme⌘D');
   await shot(`keyword-${locale}`);
   await input().fill(locale==='ar'?'المكونات':'Components');
   await expect(dialog().getByRole('option')).toHaveText(locale==='ar'?'المكوّنات':'Components');
   await shot(`label-${locale}`);
   await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');
   await expect(dialog()).toHaveCount(0);
  }
 });
 await scenario('An unmatched query shows only the localized empty message, Enter does nothing, Escape restores focus, and reopening resets the query',async()=>{
  for(const locale of ['en','ar']){
   await visit(locale,'dark');await openDemo(locale);
   await input().fill('zzq-no-such-command-9876');
   await expect(dialog().getByRole('option')).toHaveCount(0);
   await expect(dialog().getByRole('group')).toHaveCount(0);
   await expect(dialog().getByText(locale==='ar'?'لا توجد نتائج':'No matches',{exact:true})).toBeVisible();
   await page.keyboard.press('Enter');await expect(dialog()).toBeVisible();
   await shot(`empty-${locale}`);
   await page.keyboard.press('Escape');await expect(dialog()).toHaveCount(0);
   await expect(page.getByRole('button',{name:locale==='ar'?'افتح البحث':'Open search',exact:true})).toBeFocused();
   await openDemo(locale);await expect(input()).toHaveValue('');
   await expect(dialog().getByRole('option')).toHaveCount(4);
   await page.locator('[data-slot="dialog-backdrop"]').click({position:{x:10,y:10}});
   await expect(dialog()).toHaveCount(0);
   await expect(page.getByRole('button',{name:locale==='ar'?'افتح البحث':'Open search',exact:true})).toBeFocused();
  }
 });
 await scenario('Open palette has no empty-state gap or unused icon column, styled header key hints, and no mobile overflow in both locales and themes',async()=>{
  for(const locale of ['en','ar'])for(const theme of ['light','dark'])for(const width of [1440,390]){
   await page.setViewportSize({width,height:900});await visit(locale,theme);
   const key=page.locator('.site-search-button kbd');
   const keyStyle=await key.evaluate(el=>{const s=getComputedStyle(el);return {border:s.borderTopWidth,radius:s.borderRadius,lineHeight:s.lineHeight};});
   expect(keyStyle.border).toBe('1px');expect(parseFloat(keyStyle.radius)).toBeGreaterThan(0);
   await shot(`header-${locale}-${theme}-${width}`);
   await openDemo(locale);
   const geometry=await dialog().evaluate(el=>{
    const search=el.querySelector('.ts-command-palette__search').getBoundingClientRect();
    const list=el.querySelector('[data-slot="command-list"]').getBoundingClientRect();
    const groupLabel=el.querySelector('[data-slot="command-group-label"]').getBoundingClientRect();
    const label=el.querySelector('.ts-command-palette__item-label').getBoundingClientRect();
    const empty=el.querySelector('[data-slot="command-empty"]');
    return {gap:list.top-search.bottom,emptyHeight:empty?.getBoundingClientRect().height??0,iconCount:el.querySelectorAll('.ts-command-palette__icon-slot').length,labelStart:groupLabel.x,labelEnd:groupLabel.right,itemStart:label.x,itemEnd:label.right,viewport:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,dialog:el.getBoundingClientRect().toJSON()};
   });
   expect(geometry.gap).toBeLessThanOrEqual(1);expect(geometry.emptyHeight).toBe(0);expect(geometry.iconCount).toBe(0);
   // Group labels and icon-free rows share 12px padding; label edge follows reading direction.
   const labelInset=locale==='ar'?geometry.labelEnd-geometry.itemEnd:geometry.itemStart-geometry.labelStart;
   expect(Math.abs(labelInset-12)).toBeLessThan(1);
   expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewport);
   expect(geometry.dialog.x).toBeGreaterThanOrEqual(0);expect(geometry.dialog.right).toBeLessThanOrEqual(width);
   expect(Math.abs(geometry.dialog.y-108)).toBeLessThan(2);
   await expect(dialog().getByText('↑↓',{exact:true})).toBeVisible();
   const audit=await new AxeBuilder({page}).include('[data-slot="dialog-content"]').analyze();expect(audit.violations).toEqual([]);
   details.push({locale,theme,width,keyStyle,geometry,axeViolations:audit.violations});
   await shot(`palette-${locale}-${theme}-${width}`);
   await page.keyboard.press('Escape');
  }
 });
 await scenario('Platform shortcut ignores IME composition, then opens site search; settings change language, direction, and theme',async()=>{
  await page.setViewportSize({width:1440,height:900});await visit('en','light','/');
  const apple=await page.evaluate(()=>/Mac|iPhone|iPad|iPod/.test(navigator.platform));
  await page.evaluate(apple=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'k',ctrlKey:!apple,metaKey:apple,isComposing:true,bubbles:true})),apple);
  await expect(dialog()).toHaveCount(0);
  await page.keyboard.press(apple?'Meta+k':'Control+k');await expect(dialog()).toBeVisible();
  await input().fill('Switch to Arabic');await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('lang','ar');await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await page.locator('.site-search-button').click();await input().fill('dark');await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await expect(dialog()).toHaveCount(0);
  await shot('settings-ar-dark');
  details.push({settingsDestination:page.url(),ignoredIME:true});
 });
} finally {
 await context.tracing.stop({path:`${evidence}/browser-trace.zip`}).catch(()=>{});
 await browser.close();
 await writeFile(`${evidence}/live-results.json`,JSON.stringify({results,details,pageErrors:errors},null,2));
 console.log(JSON.stringify({results,pageErrors:errors},null,2));
}
if(results.some(r=>r.result==='fail'))process.exitCode=1;
