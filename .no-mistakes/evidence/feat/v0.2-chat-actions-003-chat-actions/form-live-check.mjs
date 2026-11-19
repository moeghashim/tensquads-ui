import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const evidence = '~/.no-mistakes/evidence/01M7RPD9QVAWGQ77ZZZNXKTYX5';
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const locale of ['en', 'ar']) for (const theme of ['light', 'dark']) {
    const ar = locale === 'ar';
    const copy = ar
      ? { form: 'المشروع', name: 'اسم المشروع', owner: 'المسؤول', updates: 'تحديثات البريد', list: 'قائمة', grid: 'شبكة', submit: 'حفظ المشروع', saved: 'تم حفظ المشروع.', initial: 'بنّاء', initialOwner: 'محمد', edited: 'مشروع جديد', editedOwner: 'سارة' }
      : { form: 'Project', name: 'Project name', owner: 'Owner', updates: 'Email updates', list: 'List', grid: 'Grid', submit: 'Save project', saved: 'Project saved.', initial: 'Northstar', initialOwner: 'Moe', edited: 'New project', editedOwner: 'Sarah' };
    for (const mode of ['defaults', 'edited']) {
      const context = await browser.newContext({ viewport: { width: ar ? 390 : 1440, height: 900 } });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`http://127.0.0.1:5173/components/Form?locale=${locale}&dir=${ar ? 'rtl' : 'ltr'}&theme=${theme}`);
      await page.evaluate(() => document.fonts.ready);
      const example = page.getByTestId('form-example');
      const name = example.getByRole('textbox', { name: copy.name });
      const owner = example.getByRole('textbox', { name: copy.owner });
      const updates = example.getByRole('switch', { name: copy.updates });
      const list = example.getByRole('radio', { name: copy.list, exact: true });
      const grid = example.getByRole('radio', { name: copy.grid, exact: true });
      const submit = example.getByRole('button', { name: copy.submit });
      await expect(name).toHaveValue(copy.initial);
      await expect(owner).toHaveValue(copy.initialOwner);
      await expect(updates).toHaveAttribute('aria-checked', 'true');
      await expect(list).toHaveAttribute('aria-checked', 'true');
      await name.focus();
      for (const control of [owner, updates, list, submit]) {
        await page.keyboard.press('Tab');
        await expect(control).toBeFocused();
      }
      if (mode === 'edited') {
        await name.fill(copy.edited);
        await owner.fill(copy.editedOwner);
        await updates.focus();
        await page.keyboard.press('Space');
        await expect(updates).toHaveAttribute('aria-checked', 'false');
        await list.focus();
        await page.keyboard.press(ar ? 'ArrowLeft' : 'ArrowRight');
        await expect(grid).toHaveAttribute('aria-checked', 'true');
        // Return to the initial option then select the alternate by pointer too.
        await list.click();
        await grid.click();
      }
      const prefix = `${locale}-${theme}-${mode}`;
      await example.screenshot({ path: `${evidence}/${prefix}-before.png` });
      if (theme === 'light') await owner.press('Enter');
      else await submit.click();
      await expect(example.getByText(copy.saved, { exact: true })).toBeVisible();
      const pill = example.locator('.ts-chat__user-message');
      await expect(pill).toHaveCount(1);
      await expect(pill).toHaveText(copy.submit);
      const values = JSON.parse(await pill.getAttribute('data-values'));
      const expected = {
        planId: 'p1',
        [copy.form]: {
          project: { value: mode === 'edited' ? copy.edited : copy.initial, componentType: 'Field' },
          owner: { value: mode === 'edited' ? copy.editedOwner : copy.initialOwner, componentType: 'Input' },
          emailUpdates: { value: mode !== 'edited', componentType: 'Switch' },
          layout: { value: mode === 'edited' ? copy.grid : copy.list, componentType: 'SegmentedControl' },
        },
      };
      expect(values).toEqual(expected);
      for (const control of [name, owner, updates, list, grid, submit]) await expect(control).toBeDisabled();
      // Real mouse/keyboard attempts must neither mutate the locked values nor resubmit.
      await updates.click({ force: true });
      await (mode === 'edited' ? list : grid).click({ force: true });
      await submit.click({ force: true });
      await owner.press('Enter');
      await expect(pill).toHaveCount(1);
      await expect(name).toHaveValue(expected[copy.form].project.value);
      await expect(owner).toHaveValue(expected[copy.form].owner.value);
      await expect(updates).toHaveAttribute('aria-checked', String(mode !== 'edited'));
      await expect(mode === 'edited' ? grid : list).toHaveAttribute('aria-checked', 'true');
      expect(JSON.parse(await pill.getAttribute('data-values'))).toEqual(expected);
      const accessibility = await new AxeBuilder({ page }).analyze();
      expect(accessibility.violations).toEqual([]);
      await example.screenshot({ path: `${evidence}/${prefix}-after.png` });
      await page.setViewportSize({ width: 390, height: 844 });
      const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
      expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
      expect(errors).toEqual([]);
      results.push({ locale, theme, mode, submission: theme === 'light' ? 'Enter' : 'button', values, lockedAfterAttemptedEdits: true, actionPills: await pill.count(), accessibilityViolations: accessibility.violations, mobileDimensions: dimensions });
      console.log(`PASS ${prefix}: submitted ${JSON.stringify(values)}; locked interactions ignored; one action pill`);
      await context.close();
    }
  }
} finally {
  await writeFile(`${evidence}/form-live-results.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
