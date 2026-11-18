import { expect, test } from '@playwright/test';
import { writeFile, rm } from 'node:fs/promises';
const evidence = '~/.no-mistakes/evidence/01M7R4CTBZTBMJVH4YMQ1VCZ33';
for (const locale of ['en', 'ar']) {
 test(`real clipboard copies every ${locale} example and denied writes show recovery`, async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(`/get-started?locale=${locale}&dir=${locale === 'ar' ? 'rtl' : 'ltr'}&theme=light`);
  const blocks = page.locator('.get-started-code');
  const transcript = [];
  for (let i = 0; i < 5; i++) {
   const block = blocks.nth(i);
   const rendered = await block.locator('code').innerText();
   await block.getByRole('button').click();
   await expect(block.getByRole('status')).toHaveText(locale === 'ar' ? 'تم النسخ' : 'Copied');
   const copied = await page.evaluate(() => navigator.clipboard.readText());
   expect(copied).toBe(rendered);
   if (i === 0) expect(copied).toBe('npm install github:moeghashim/tensquads-ui#<commit-sha>');
   transcript.push({ sample: i + 1, copied });
   if (i === 4) await writeFile(`.get-started-worker-${locale}.ts`, copied);
  }
  await page.route('**/get-started?**', async route => {
   const response = await route.fetch();
   await route.fulfill({ response, headers: { ...response.headers(), 'permissions-policy': 'clipboard-write=()' } });
  });
  await page.reload();
  await blocks.first().getByRole('button').click();
  const failure = locale === 'ar' ? 'تعذّر النسخ. حدّد الشيفرة وانسخها يدوياً.' : 'Copy failed. Select the code and copy it manually.';
  await expect(blocks.first().getByRole('status')).toHaveText(failure);
  await expect(blocks.first().getByRole('button')).toHaveText(locale === 'ar' ? 'نسخ' : 'Copy');
  await blocks.first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${evidence}/clipboard-denied-${locale}.png`, fullPage: false });
  await writeFile(`${evidence}/clipboard-${locale}.json`, JSON.stringify({ locale, transcript, deniedWrite: failure }, null, 2));
 });
}
test('copied Worker rejects empty and assistant-ended local synthetic histories with 400', async () => {
 const transcript = [];
 try {
  for (const locale of ['en', 'ar']) {
   const worker = (await import(`../.get-started-worker-${locale}.ts`)).default;
   for (const turns of [[], [{role:'assistant', content:'Done'}], [{role:'user',content:'Hello'}, {role:'assistant',content:'Done'}]]) {
    const response = await worker.fetch(new Request('http://localhost/openui', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({turns}) }), {});
    const body = await response.text();
    expect(response.status).toBe(400);
    expect(body).toBe('A user turn is required.');
    transcript.push({locale, turns, status: response.status, body});
   }
  }
  await writeFile(`${evidence}/worker-guard.json`, JSON.stringify(transcript, null, 2));
 } finally {
  for (const locale of ['en','ar']) await rm(`.get-started-worker-${locale}.ts`, { force: true });
 }
});
