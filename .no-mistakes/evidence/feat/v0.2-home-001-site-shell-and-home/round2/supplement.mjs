import { chromium, expect } from '{run-worktree}/node_modules/@playwright/test/index.mjs';
import { writeFile } from 'node:fs/promises';
const evidence = '~/.no-mistakes/evidence/01M7QYA6HGZQ2RZD9BZEHMTBF9/round2';
const browser = await chromium.launch();
const records = [];
try {
 const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'], viewport: { width: 1440, height: 900 } });
 const page = await context.newPage();
 const errors = [];
 page.on('pageerror', error => errors.push(error.message));
 const open = async (locale='en', theme='light', route='/') => {
  await page.goto(`http://localhost:5173${route}?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}`);
  await page.evaluate(() => document.fonts.ready);
 };
 for(const locale of ['en','ar']) {
  await open(locale);
  const card = page.locator('.install-card');
  await card.getByRole('button').click();
  await expect(card.getByRole('button')).toHaveText(locale==='ar'?'تم النسخ':'Copied');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe('npm install github:moeghashim/tensquads-ui#<commit-sha>');
  records.push({ check:'Real Chromium clipboard', locale, copied });
  await expect(page.locator('.style-setup code')).toHaveText('@layer ui-sdk, tensquads;\n@import "@tensquads/ui/fonts.css";\n@import "@tensquads/ui/tokens.css";\n@import "@tensquads/ui/styles.css";');
  const replay = page.getByRole('button', {name:locale==='ar'?'إعادة العرض':'Replay',exact:true});
  await expect(page.locator('.stream-code__line')).toHaveCount(7);
  await replay.click();
  expect(await page.locator('.stream-code__line').count()).toBeLessThan(7);
  await expect(page.locator('.stream-code__line')).toHaveCount(7);
  const pane = page.locator('.stream-screen');
  await pane.getByRole('textbox').fill(locale==='ar'?'متجر الاختبار':'Test store');
  await expect(pane.getByRole('textbox')).toHaveValue(locale==='ar'?'متجر الاختبار':'Test store');
  const toggle=pane.getByRole('switch');
  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(toggle).not.toBeChecked();
  await pane.getByRole('radio',{name:locale==='ar'?'شهري':'Monthly',exact:true}).click();
  await expect(pane.getByRole('radio',{name:locale==='ar'?'شهري':'Monthly',exact:true})).toBeChecked();
  records.push({check:'Replay restarts and completes seven fixture lines; rendered input, switch and cadence work',locale});
  await page.emulateMedia({ reducedMotion:'reduce' });
  await open(locale);
  await expect(page.locator('.stream-code__line')).toHaveCount(7);
  await page.getByRole('button',{name:locale==='ar'?'إعادة العرض':'Replay',exact:true}).click();
  await expect(page.locator('.stream-code__line')).toHaveCount(7);
  records.push({check:'Reduced-motion load and replay immediately show complete fixture',locale});
  await page.emulateMedia({ reducedMotion:'no-preference' });
  await open(locale,'dark');
  const nav=page.getByRole('navigation');
  await nav.getByRole('link',{name:locale==='ar'?'المكوّنات':'Components',exact:true}).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(`/components\\?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=dark$`));
  await expect(page.locator('.component-card')).toHaveCount(11);
  await nav.getByRole('link',{name:locale==='ar'?'البدء':'Get started',exact:true}).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/get-started\?/);
  await expect(page.getByRole('main').getByRole('heading',{level:1})).toHaveText(locale==='ar'?'البدء':'Get started');
  await expect(page.getByRole('main').locator(':scope > *')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang',locale);
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  records.push({check:'Keyboard nav reaches components and heading-only Get started; URL state survives reload',locale,url:page.url()});
  for(const route of ['/components','/get-started']) {
   for(const theme of ['light','dark']) {
    await open(locale,theme,route);
    await page.setViewportSize({width:390,height:844});
    const sizes=await page.evaluate(()=>({content:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
    expect(sizes.content).toBeLessThanOrEqual(sizes.viewport);
    await page.screenshot({path:`${evidence}/${route.slice(1)}-${locale}-${theme}-390.png`,fullPage:true});
   }
  }
 }
 await page.setViewportSize({width:1440,height:900});
 await open('en','light');
 await page.getByRole('radio',{name:'System',exact:true}).click();
 await expect(page).toHaveURL(/theme=system/);
 await expect(page.locator('html')).not.toHaveAttribute('data-theme');
 const colors={};
 for(const colorScheme of ['light','dark']) {
  await page.emulateMedia({colorScheme});
  colors[colorScheme] = await page.locator('html').evaluate(el=>getComputedStyle(el).backgroundColor);
 }
 expect(colors.dark).not.toBe(colors.light);
 records.push({check:'System theme follows emulated OS preference without explicit theme attribute',colors});
 await context.clearPermissions();
 await context.grantPermissions([], {origin:'http://localhost:5173'});
 // Deny at the browser boundary, while keeping the real application and Clipboard API.
 const cdp=await context.newCDPSession(page);
 await cdp.send('Browser.setPermission',{permission:{name:'clipboard-write'},setting:'denied',origin:'http://localhost:5173'});
 await open('en');
 await page.locator('.install-card').getByRole('button').click();
 await expect(page.locator('.install-card').getByRole('status')).toHaveText('Could not copy. Select and copy the command above.');
 await page.screenshot({path:`${evidence}/clipboard-browser-denied.png`,fullPage:true});
 records.push({check:'Real browser clipboard permission denied yields visible manual-copy guidance'});
 expect(errors).toEqual([]);
 records.push({check:'No uncaught browser errors',errors});
 await context.close();
} finally {
 await browser.close();
 await writeFile(`${evidence}/supplement-results.json`,JSON.stringify(records,null,2));
}
console.log(JSON.stringify(records,null,2));
