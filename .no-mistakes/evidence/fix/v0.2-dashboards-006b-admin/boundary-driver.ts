import {expect,test} from '@playwright/test';
import {openPreview} from './helpers/preview';
for (const locale of ['en','ar'] as const) {
 test(`phase company filters and image attention boundary ${locale}`,async({page},info)=>{
  const ar=locale==='ar';
  await page.setViewportSize({width:1440,height:900});
  await openPreview(page,{locale,direction:ar?'rtl':'ltr',theme:'dark'},'/dashboards/admin');
  await expect(page.getByRole('row')).toHaveCount(10);
  for(const [name,count] of [[ar?'نشطة':'Active',7],[ar?'تجريبية':'Trial',3],[ar?'متوقفة':'Paused',2]] as const){
   await page.getByRole('button',{name,exact:true}).click();
   await expect(page.getByRole('row')).toHaveCount(count);
  }
  await page.getByRole('textbox',{name:ar?'البحث عن الشركات':'Search companies'}).fill('Northstar');
  await expect(page.locator('[data-slot="empty-state"]')).toBeVisible();
  await page.screenshot({path:`~/.no-mistakes/evidence/01M7TR2K5KB9FWFR7D5HNWYW27/company-empty-${locale}.png`,fullPage:true});
  await page.getByRole('button',{name:ar?'إزالة عوامل التصفية':'Clear filters'}).click();
  await expect(page.getByRole('row')).toHaveCount(10);
  await page.getByRole('textbox',{name:ar?'البحث عن الشركات':'Search companies'}).fill(ar?'أميرة':'AMIRA');
  await expect(page.getByRole('row')).toHaveCount(2);
  await expect(page.getByRole('row').last()).toContainText('Northstar Goods');
  await page.getByRole('button',{name:ar?'صور الفرق':'Squad images'}).click();
  await expect(page).toHaveURL(new RegExp(`locale=${locale}.*dir=${ar?'rtl':'ltr'}.*theme=dark.*view=images`));
  await page.getByRole('button',{name:ar?'تحتاج إلى مراجعة':'Needs attention',exact:true}).click();
  await expect(page.getByRole('row')).toHaveCount(3);
  await expect(page.getByRole('row').nth(1)).toContainText('registry.agents.example/orders:');
  await expect(page.getByRole('row').nth(2)).toContainText('registry.agents.example/support:');
  const support=page.getByRole('row').nth(2);
  await support.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.dashboard-details')).toContainText('registry.agents.example/support:1.6.0');
  await page.screenshot({path:`~/.no-mistakes/evidence/01M7TR2K5KB9FWFR7D5HNWYW27/image-attention-${locale}.png`,fullPage:true});
  await info.attach('observable state',{body:await page.locator('.dashboard-panel').innerText(),contentType:'text/plain'});
 });
}
