import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
const evidence='~/.no-mistakes/evidence/01M7X5402C02AMR0BZ1J1B018E';
const browser=await chromium.launch({headless:true});
try {
const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});
const page=await context.newPage();
for (const [locale,dir,theme] of [['en','ltr','light'],['en','ltr','dark'],['ar','rtl','light'],['ar','rtl','dark']]) {
 await page.goto(`http://localhost:5173/get-started?locale=${locale}&dir=${dir}&theme=${theme}`);
 await page.evaluate(()=>document.fonts.ready);
 await expect(page.locator('html')).toHaveAttribute('dir',dir);
 await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
 const code=page.locator('.get-started-code').last();
 await expect(code.locator('code')).toContainText('@tensquads/ui/openui/server/anthropic');
 await expect(page.locator('.get-started-note').filter({hasText:'install @anthropic-ai/sdk'})).toContainText('1.10.0');
 await code.getByRole('button').click();
 const text=await page.evaluate(()=>navigator.clipboard.readText());
 expect(text).toContain('@tensquads/ui/openui/server/anthropic');
 expect(text).not.toContain('Apps using the Anthropic provider install');
 if(locale==='en' && theme==='light') {
  writeFileSync(evidence+'/copied-worker.ts',text);
  writeFileSync('.phase-test/consumer/copied-worker.mjs',stripTypeScriptTypes(text));
 }
 for(const width of [1440,390]) {
  await page.setViewportSize({width,height:900});
  await page.screenshot({path:`${evidence}/get-started-${locale}-${theme}-${width}.png`,fullPage:true});
  const size=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,content:document.documentElement.scrollWidth}));
  expect(size.content).toBeLessThanOrEqual(size.viewport);
 }
 const a11y=await new AxeBuilder({page}).analyze();expect(a11y.violations).toEqual([]);
 console.log(`Rendered ${locale}/${dir}/${theme} at 1440 and 390 px: SDK 1.10.0 note outside code; actual clipboard uses new subpath and excludes prose; no overflow or axe violations.`);
}
await context.close();
}finally{await browser.close();}
