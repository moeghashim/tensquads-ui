import { expect, test } from '@playwright/test';
import { openPreview } from './helpers/preview';

for (const locale of ['en', 'ar'] as const) {
 const ar = locale === 'ar';
 const state = {locale, direction: ar ? 'rtl' as const : 'ltr' as const, theme: 'dark' as const};
 test(`local chat navigation, keyboard approval, and no model traffic in ${locale}`, async ({page}, testInfo) => {
  const serviceRequests: string[] = [];
  page.on('request', r => {if (['fetch', 'xhr'].includes(r.resourceType()) && (r.method() !== 'GET' || new URL(r.url()).origin !== 'http://localhost:5173')) serviceRequests.push(`${r.method()} ${r.url()}`);});
  await openPreview(page, state);
  const headerLink = page.locator('.site-nav a[href*="/chat"]');
  const homeLink = page.locator('.hero__links a[href*="/chat"]');
  await expect(homeLink).toBeVisible();
  await homeLink.click();
  await expect(page).toHaveURL(/\/chat\?/);
  await expect(page.getByRole('textbox', {name: ar ? 'اسم المتجر' : 'Store name'})).toBeVisible();
  await page.locator('.site-brand').click();
  await headerLink.click();
  await expect(page).toHaveURL(/\/chat\?/);
  await expect(page.locator('html')).toHaveAttribute('lang', locale);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const field = page.getByRole('textbox', {name: ar ? 'اسم المتجر' : 'Store name'});
  await field.fill(ar ? 'متجر الاختبار' : 'Keyboard Shop');
  const email = page.getByRole('switch', {name: ar ? 'أرسل إليّ إشعاراً عند الانتهاء' : 'Email me when done'});
  await email.focus();
  await page.keyboard.press('Space');
  await expect(email).not.toBeChecked();
  const monthly = page.getByRole('radio', {name: ar ? 'شهري' : 'Monthly', exact: true});
  await monthly.focus();
  await page.keyboard.press('Space');
  await expect(monthly).toBeChecked();
  const approve = page.getByRole('button', {name: ar ? 'اعتماد الخطة' : 'Approve plan'});
  await approve.focus();
  await page.keyboard.press('Enter');
  await expect(field).toBeDisabled();
  await expect(page.locator('.ts-chat-reply__markdown').last()).toContainText(ar ? 'تم اعتماد خطة متجر الاختبار. سأرسل تحديثات شهري. إشعارات البريد غير مفعّلة.' : 'Plan approved for Keyboard Shop. I will send Monthly updates. Email notifications are off.');
  const composer = page.getByRole('textbox', {name: ar ? 'جرّب إرسال رسالة' : 'Try a message'});
  await composer.fill('Inventory <script>alert(1)</script>');
  await page.getByRole('button', {name: ar ? 'إرسال' : 'Send', exact: true}).click();
  await expect(page.locator('.ts-chat-reply').last()).toContainText(ar ? 'لا يتصل هذا الموقع بنموذج مباشر.' : 'This site has no live model.');
  expect(serviceRequests).toEqual([]);
  const shot = await page.screenshot({fullPage:true});
  await testInfo.attach(`chat-keyboard-local-only-${locale}.png`, {body:shot,contentType:'image/png'});
  await testInfo.attach(`network-${locale}.json`, {body:JSON.stringify({unexpectedServiceRequests:serviceRequests, surface:page.url()}),contentType:'application/json'});
 });
 test(`replay reserves layout and reduced motion completes the ${locale} local chat`, async ({page}, testInfo) => {
  await openPreview(page, state, '/chat');
  const approve = page.getByRole('button',{name:ar ? 'اعتماد الخطة':'Approve plan'});
  await expect(approve).toBeVisible();
  const samples = await page.evaluate(async () => {
   const heights: number[] = [], notePositions: number[] = [];
   const button = document.querySelector<HTMLButtonElement>('.ts-chat__header button');
   if (!button) throw new Error('Replay button not found');
   button.click();
   const start = performance.now();
   while (performance.now()-start < 800) {
    await new Promise(requestAnimationFrame);
    heights.push(document.querySelector('.chat-demo__surface')!.getBoundingClientRect().height);
    notePositions.push(document.querySelector('.chat-page__note')!.getBoundingClientRect().top);
   }
   return {heights,notePositions};
  });
  expect(Math.max(...samples.heights)-Math.min(...samples.heights)).toBeLessThanOrEqual(1);
  expect(Math.max(...samples.notePositions)-Math.min(...samples.notePositions)).toBeLessThanOrEqual(1);
  await expect(approve).toBeVisible();
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.reload();
  await expect(approve).toBeVisible();
  await expect(page.locator('.chat-demo__steps')).toHaveCount(1);
  await expect(page.getByText('master-421')).toBeVisible();
  await testInfo.attach(`replay-layout-${locale}.json`,{body:JSON.stringify(samples),contentType:'application/json'});
 });
}
