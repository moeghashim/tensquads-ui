import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const evidence = '~/.no-mistakes/evidence/01M7X685W7Z9CQVBJ7DWC7B089';
for (const locale of ['en','ar']) {
 test(`SDK guidance and real clipboard in ${locale}`, async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto(`/get-started?locale=${locale}&dir=${locale === 'ar' ? 'rtl':'ltr'}&theme=light`);
  await page.evaluate(() => document.fonts.ready);
  const section = page.locator('.get-started-section').last();
  const note = section.locator('.get-started-note').filter({hasText:'@anthropic-ai/sdk'});
  await expect(note).toBeVisible();
  const text = await note.innerText();
  expect(text).toContain('1.10.0');
  if (locale === 'en') {
   expect(text).toMatch(/Apps.*Anthropic.*install.*@anthropic-ai\/sdk.*themselves/);
   expect(text).not.toMatch(/[\u0600-\u06ff]/);
  } else {
   expect(text).toMatch(/تثبّت التطبيقات.*Anthropic.*@anthropic-ai\/sdk.*بنفسها/);
   expect(text).not.toContain('Apps that use');
  }
  const block = section.locator('.get-started-code');
  await block.getByRole('button', {name: locale === 'ar' ? 'نسخ':'Copy', exact:true}).click();
  await expect(block.getByRole('status')).toHaveText(locale === 'ar' ? 'تم النسخ':'Copied');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('import { createAnthropicProvider } from "@tensquads/ui/openui/server/anthropic";');
  expect(copied).not.toContain('1.10.0');
  expect(copied).not.toContain(text);
  expect(copied).toContain('export default {');
  await writeFile(`${evidence}/worker-clipboard-${locale}.txt`, copied);
  await writeFile(`${evidence}/sdk-note-${locale}.txt`, text);
  for (const width of [1440,390]) {
   await page.setViewportSize({width,height:900});
   await section.screenshot({path:`${evidence}/sdk-section-${locale}-${width}.png`});
  }
 });
}
