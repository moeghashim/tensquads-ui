import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const evidence = '~/.no-mistakes/evidence/01M7R6QEWKX6CP0J88BAE98TC7';
const browser = await chromium.launch();
const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
const observations = [];
const errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  await page.goto('http://127.0.0.1:5173/components?locale=en&dir=ltr&theme=light');
  const names = await page.locator('.component-card__link strong').allTextContents();
  expect(names.length).toBeGreaterThan(0);
  for (const locale of ['ar', 'en']) {
    for (const theme of ['light', 'dark']) {
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 900 });
        for (const name of names) {
          await page.goto(`http://127.0.0.1:5173/components/${name}?locale=${locale}&dir=${locale === 'ar' ? 'rtl' : 'ltr'}&theme=${theme}`);
          await page.evaluate(() => document.fonts.ready);
          await page.waitForLoadState('networkidle');
          const docs = page.locator('.markdown-document');
          await expect(docs).toBeVisible();
          const observation = await docs.evaluate(el => {
            const effectiveLanguage = node => node.closest('[lang]')?.lang;
            return {
              prose: [...el.querySelectorAll('p, li, h3, h4, h5, h6')].map(node => ({
                text: node.textContent,
                direction: getComputedStyle(node).direction,
                language: effectiveLanguage(node),
              })),
              labels: [...el.querySelectorAll('section > h2')].map(node => ({ text: node.textContent, direction: getComputedStyle(node).direction })),
              codeDirections: [...el.querySelectorAll('pre')].map(node => getComputedStyle(node).direction),
              viewport: document.documentElement.clientWidth,
              contentWidth: document.documentElement.scrollWidth,
            };
          });
          expect(observation.prose.length).toBeGreaterThan(0);
          for (const prose of observation.prose) {
            expect(prose.direction, `${name}: ${prose.text}`).toBe('ltr');
            expect(prose.language).toBe('en');
          }
          expect(observation.labels.map(label => label.text)).toEqual([
            locale === 'ar' ? 'الوصف' : 'Description',
            locale === 'ar' ? 'الخصائص' : 'Props',
            ...(['Field', 'Input'].includes(name) ? [locale === 'ar' ? 'الاستخدام' : 'Usage'] : []),
          ]);
          for (const label of observation.labels) expect(label.direction).toBe(locale === 'ar' ? 'rtl' : 'ltr');
          expect(observation.contentWidth).toBeLessThanOrEqual(observation.viewport);
          for (const direction of observation.codeDirections) expect(direction).toBe('ltr');
          if (['Field', 'Input'].includes(name)) {
            const code = docs.locator('pre code');
            await expect(code).toHaveCount(1);
            // These identifiers belong to the documented public composition contracts.
            await expect(code).toContainText(name === 'Field' ? '<FieldSet>' : '<InputGroup>');
            const copy = docs.getByRole('button');
            await expect(copy).toHaveAccessibleName(locale === 'ar' ? 'نسخ' : 'Copy');
            const expectedCode = await code.textContent();
            await copy.click();
            await expect(copy).toHaveAccessibleName(locale === 'ar' ? 'تم النسخ' : 'Copied');
            expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(expectedCode);
            observation.clipboardMatched = true;
          } else {
            await expect(docs.locator('pre')).toHaveCount(0);
          }
          observations.push({ name, locale, theme, width, ...observation });
          if (locale === 'ar' && ['Button', 'Input'].includes(name)) {
            await docs.screenshot({ path: `${evidence}/${name.toLowerCase()}-ar-${theme}-${width}.png` });
          }
          if (locale === 'en' && theme === 'light' && width === 1440 && name === 'Input') {
            await page.screenshot({ path: `${evidence}/input-en-light-1440-full.png`, fullPage: true });
          }
        }
      }
    }
  }
  expect(errors).toEqual([]);
  console.log(`Live docs checks passed for ${observations.length} component/locale/theme/viewport combinations; real clipboard copies matched.`);
} finally {
  await writeFile(`${evidence}/live-docs-observations.json`, JSON.stringify({ observations, errors }, null, 2));
  await browser.close();
}
