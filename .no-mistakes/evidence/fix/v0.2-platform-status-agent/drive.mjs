import { createServer } from '../apps/preview/node_modules/vite/dist/node/index.js';
import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const evidence = '~/.no-mistakes/evidence/01M7VY15N70RJTJE8HRPKYRBT9';
const server = await createServer({configFile: false, root: `${process.cwd()}/.local-lookup-validation`, esbuild: {jsx: 'automatic'}, server: {host: '127.0.0.1', port: 0, fs: {allow: [process.cwd()]} }});
let browser;
const results = [];
try {
 await server.listen();
 browser = await chromium.launch({headless: true});
 for (const mode of ['prototype', 'inherited', 'explicit']) {
  for (const locale of ['en', 'ar']) {
   const page = await browser.newPage({viewport: {width: locale === 'ar' ? 390 : 1100, height: 900}});
   const errors = [];
   page.on('pageerror', error => errors.push(String(error)));
   await page.goto(`${server.resolvedUrls.local[0]}?mode=${mode}&locale=${locale}`);
   const bots = mode === 'prototype' ? ['constructor', 'toString', '__proto__', 'hasOwnProperty'] : mode === 'inherited' ? ['constructor', 'toString', '__proto__', 'inherited-bot'] : ['support-bot', 'constructor', 'toString', '__proto__', 'invalid-bot', 'missing-bot', 'petra'];
   const observations = [];
   for (const [i, bot] of bots.entries()) {
    const section = page.locator('section').filter({has: page.locator(`h2`, {hasText: new RegExp(`^${bot}$`)})});
    await expect(section.getByRole('status')).toContainText(`Checking ${bot}`);
    const expectedImages = mode === 'explicit' && i < 4 ? 2 : 0;
    await expect(section.getByRole('img', {includeHidden: true})).toHaveCount(expectedImages);
    await expect(section.locator('.ts-approval-card')).toContainText('task-1');
    await expect(section.locator('.ts-approval-card__content')).toHaveText(`Refund order ${i + 1}`);
    const decision = i % 2 === 0 ? 'approve' : 'reject';
    await section.getByRole('button', {name: locale === 'en' ? (decision === 'approve' ? 'Approve' : 'Decline') : (decision === 'approve' ? 'موافقة' : 'رفض'), exact: true}).click();
    await expect(section.locator('.ts-approval-card__outcome')).toHaveAttribute('data-decision', decision);
    await expect(section.getByRole('button').first()).toBeDisabled();
    await expect(section.getByRole('button').last()).toBeDisabled();
    observations.push({bot, mascotImages: await section.locator('img').count(), status: await section.getByRole('status').innerText(), decision});
   }
   const commands = JSON.parse(await page.locator('#commands').innerText());
   expect(commands).toEqual(bots.map((_, i) => ({type: 'ApprovalDecision', approvalId: `approval-${i}`, contentHash: `hash-${i}`, decision: i % 2 === 0 ? 'approve' : 'reject'})));
   expect(errors).toEqual([]);
   await page.screenshot({path: `${evidence}/${mode}-${locale}.png`, fullPage: true});
   results.push({mode, locale, viewport: locale === 'ar' ? 390 : 1100, observations, commands, browserErrors: errors, result: 'pass'});
   await page.close();
  }
 }
 await writeFile(`${evidence}/lookup-browser-results.json`, JSON.stringify(results, null, 2));
 console.log(JSON.stringify(results, null, 2));
} finally {
 await browser?.close();
 await server.close();
}
