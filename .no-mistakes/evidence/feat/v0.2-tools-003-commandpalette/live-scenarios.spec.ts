import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const evidence = '~/.no-mistakes/evidence/01M7W9TK1DS74ZRGPNE3QA1PSM';
const dialog = (page) => page.getByRole('dialog');
async function openSite(page) {
  await page.locator('.site-search-button').click();
  await expect(dialog(page)).toBeVisible();
  await expect(dialog(page).getByRole('combobox')).toBeFocused();
}
for (const locale of ['en', 'ar']) {
 test(`filter keywords, hide empty groups, reject absent actions, Escape and reset (${locale})`, async ({page}) => {
  await page.goto(`/components/CommandPalette?locale=${locale}&dir=${locale === 'ar' ? 'rtl':'ltr'}&theme=dark`);
  const trigger = page.getByRole('button', {name:locale==='ar'?'افتح البحث':'Open search'});
  await trigger.click();
  const palette = dialog(page), input = palette.getByRole('combobox');
  await expect(input).toBeFocused();
  await expect(palette.getByRole('group')).toHaveCount(3);
  await input.fill('dark');
  await expect(palette.getByRole('group')).toHaveCount(1);
  await expect(palette.getByRole('option', {name: locale==='ar'?'تغيير السمة':'Change theme'})).toBeVisible();
  await input.fill('zzq-no-such-command-9876');
  await expect(palette.getByRole('option')).toHaveCount(0);
  await expect(palette.getByRole('group')).toHaveCount(0);
  await expect(palette.getByText(locale==='ar'?'لا توجد نتائج':'No matches', {exact:true})).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(palette).toBeVisible();
  await page.screenshot({path:`${evidence}/no-matches-${locale}.png`});
  await page.keyboard.press('Escape');
  await expect(palette).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(input).toHaveValue('');
  await expect(palette.getByRole('option')).toHaveCount(4);
  await palette.getByRole('option', {name: locale==='ar'?'الرئيسية':'Home', exact:true}).click();
  await expect(palette).toHaveCount(0);
  await expect(trigger).toBeFocused();
 });
}
for (const platform of ['MacIntel', 'Linux x86_64']) {
 test(`platform shortcut prevents default and ignores composing events (${platform})`, async ({page}) => {
  await page.addInitScript((platform) => Object.defineProperty(navigator, 'platform', {get:()=>platform}), platform);
  await page.goto('/?locale=en&dir=ltr&theme=light');
  await page.locator('.site-search-button').focus();
  // Synthetic IME key events exercise the actual page listener without OS input configuration.
  const composing = await page.evaluate((apple) => {
   const event = new KeyboardEvent('keydown', {key:'k', metaKey:apple,ctrlKey:!apple,isComposing:true,bubbles:true,cancelable:true});
   window.dispatchEvent(event); return event.defaultPrevented;
  }, platform==='MacIntel');
  expect(composing).toBe(false);
  await expect(dialog(page)).toHaveCount(0);
  await page.keyboard.press(platform==='MacIntel'?'Meta+k':'Control+k');
  await expect(dialog(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toHaveCount(0);
  await expect(page.locator('.site-search-button')).toBeFocused();
  const prevented = await page.evaluate((apple) => {
   const event = new KeyboardEvent('keydown', {key:'k',metaKey:apple,ctrlKey:!apple,bubbles:true,cancelable:true});
   window.dispatchEvent(event); return event.defaultPrevented;
  }, platform==='MacIntel');
  expect(prevented).toBe(true);
  await expect(dialog(page)).toBeVisible();
 });
}
test('site page navigation, registry keyword search, language and theme settings retain URL state', async ({page}) => {
 await page.goto('/?locale=en&dir=ltr&theme=dark');
 await openSite(page);
 await expect(dialog(page).getByRole('group')).toHaveCount(3);
 await expect(dialog(page).getByRole('option', {name:'Get started',exact:true})).toBeVisible();
 await dialog(page).getByRole('combobox').fill('Get started');
 await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/\/get-started\?/);
 await expect(dialog(page)).toHaveCount(0);
 expect(new URL(page.url()).searchParams.get('theme')).toBe('dark');
 await openSite(page);
 await dialog(page).getByRole('combobox').fill('Switch to Arabic');
 await page.keyboard.press('Enter');
 await expect(page.locator('html')).toHaveAttribute('lang','ar');
 await expect(page.locator('html')).toHaveAttribute('dir','rtl');
 expect(new URL(page.url()).pathname).toBe('/get-started');
 expect(new URL(page.url()).searchParams.get('theme')).toBe('dark');
 await openSite(page);
 await dialog(page).getByRole('combobox').fill('المكونات');
 await expect(dialog(page).getByRole('option', {name:'المكوّنات',exact:true})).toBeVisible();
 await page.screenshot({path:`${evidence}/site-arabic-normalized-search.png`});
 await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/\/components\?/);
 for (const theme of ['light', 'dark', 'system']) {
  await openSite(page);
  await dialog(page).getByRole('combobox').fill(theme);
  await expect(dialog(page).getByRole('option')).toHaveCount(1);
  await page.keyboard.press('Enter');
  await expect.poll(()=> new URL(page.url()).searchParams.get('theme')).toBe(theme);
  await expect(page.locator('html')).toHaveAttribute('lang','ar');
  expect(new URL(page.url()).pathname).toBe('/components');
 }
 await openSite(page);
 await dialog(page).getByRole('combobox').fill('language');
 await expect(dialog(page).getByRole('option')).toHaveCount(2);
 await dialog(page).getByRole('option',{name:'التبديل إلى الإنجليزية'}).click();
 await expect(page.locator('html')).toHaveAttribute('lang','en');
 await expect(page.locator('html')).toHaveAttribute('dir','ltr');
});
test('site palette remains usable with its long list at desktop and mobile widths in both directions and themes', async ({page}) => {
 for (const locale of ['en','ar']) for (const theme of ['light','dark']) for (const width of [1440,390]) {
  await page.setViewportSize({width,height:900});
  await page.goto(`/?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}`);
  const search = page.locator('.site-search-button');
  await expect(search).toHaveAccessibleName(locale==='ar'?'بحث ⌘K':'Search ⌘K');
  await openSite(page);
  const palette = dialog(page);
  await expect(palette).not.toHaveAttribute('data-starting-style');
  await palette.evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished.catch(()=>{}))));
  await page.evaluate(()=>document.fonts.ready);
  const box = await palette.boundingBox();
  expect(Math.abs(box!.y-108)).toBeLessThan(2);
  expect(box!.width).toBeLessThanOrEqual(width-32);
  const dimensions = await page.evaluate(()=>({viewport:document.documentElement.clientWidth,content:document.documentElement.scrollWidth}));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  const audit = await new AxeBuilder({page}).include('[data-slot="dialog-content"]').analyze();
  expect(audit.violations).toEqual([]);
  await page.screenshot({path:`${evidence}/site-${locale}-${theme}-${width}.png`,fullPage:true});
  await palette.getByRole('combobox').press('End');
  // Repeated navigation reaches the last settings action and scrolls the actual list.
  for(let i=0;i<60;i++) await page.keyboard.press('ArrowDown');
  const active = await palette.getByRole('combobox').getAttribute('aria-activedescendant');
  expect(active).toBeTruthy();
  await expect(page.locator(`[id="${active}"]`)).toBeInViewport();
  await expect(palette.locator('.ts-command-palette__footer')).toBeInViewport();
  await page.keyboard.press('Escape');
  await expect(search).toBeFocused();
 }
});
