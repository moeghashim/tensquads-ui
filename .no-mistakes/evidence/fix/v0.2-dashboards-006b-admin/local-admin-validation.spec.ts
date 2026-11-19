import { test, expect } from '@playwright/test';
import { openPreview } from './helpers/preview';
const evidence = '~/.no-mistakes/evidence/01M7TR2K5KB9FWFR7D5HNWYW27';
for (const locale of ['en', 'ar'] as const) {
 test(`local admin filter boundaries and keyboard selection ${locale}`, async ({page}) => {
  await page.setViewportSize({width:1440,height:1000});
  await openPreview(page, {locale,direction:locale==='ar'?'rtl':'ltr',theme:'dark'}, '/dashboards/admin');
  const labels = locale==='ar' ? ['نشطة','تجريبية','متوقفة','الكل'] : ['Active','Trial','Paused','All'];
  for (const [i,count] of [7,3,2,10].entries()) {
   await page.getByRole('button',{name:labels[i],exact:true}).click();
   await expect(page.getByRole('row')).toHaveCount(count);
  }
  const search=page.getByRole('textbox',{name:locale==='ar'?'البحث عن الشركات':'Search companies'});
  await search.fill('impossible-company-999');
  await expect(page.locator('[data-slot="empty-state"]')).toBeVisible();
  await page.screenshot({path:`${evidence}/companies-empty-${locale}.png`,fullPage:true});
  await page.getByRole('button',{name:locale==='ar'?'إزالة عوامل التصفية':'Clear filters'}).click();
  await expect(page.getByRole('row')).toHaveCount(10);
  await page.getByRole('button',{name:locale==='ar'?'صور الفرق':'Squad images'}).click();
  const url=new URL(page.url());
  expect(Object.fromEntries(url.searchParams)).toMatchObject({locale,dir:locale==='ar'?'rtl':'ltr',theme:'dark',view:'images'});
  await page.getByRole('button',{name:locale==='ar'?'تحتاج إلى مراجعة':'Needs attention',exact:true}).click();
  await expect(page.getByRole('row')).toHaveCount(3);
  const row=page.getByRole('row').filter({hasText:'registry.agents.example/support:'});
  await row.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.dashboard-stack .ts-card').first().getByRole('heading')).toHaveText(locale==='ar'?'الدعم':'Support');
  await page.screenshot({path:`${evidence}/images-attention-keyboard-${locale}.png`,fullPage:true});
  await page.getByRole('button',{name:locale==='ar'?'الكل':'All',exact:true}).click();
  await expect(page.getByRole('row')).toHaveCount(8);
  await page.getByRole('row').filter({hasText:'registry.agents.example/people:'}).click();
  await expect(page.locator('.dashboard-stack .dashboard-empty-line')).toHaveCount(2);
  await page.screenshot({path:`${evidence}/images-no-bugs-requests-${locale}.png`,fullPage:true});
 });
}
