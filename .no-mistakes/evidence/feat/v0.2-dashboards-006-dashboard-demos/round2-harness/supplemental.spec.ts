import { expect, test } from '@playwright/test';
import { openPreview, capturePreviewScreenshots } from './helpers/preview';

for (const locale of ['en','ar'] as const) {
 const ar=locale==='ar';
 const state={locale,direction:ar?'rtl' as const:'ltr' as const,theme:'light' as const};
 test(`company status boundaries and image totals ${locale}`,async({page},info)=>{
  await openPreview(page,state,'/dashboards/admin');
  for(const [label,count] of [[ar?'نشطة':'Active',7],[ar?'تجريبية':'Trial',3],[ar?'متوقفة':'Paused',2]] as const){
   await page.getByRole('button',{name:label,exact:true}).click();
   await expect(page.getByRole('row')).toHaveCount(count);
  }
  await page.getByRole('button',{name:ar?'الكل':'All',exact:true}).click();
  await expect(page.getByRole('row')).toHaveCount(10);
  await page.getByRole('button',{name:ar?/صور الفرق/:/Squad images/}).click();
  const url=new URL(page.url());
  for(const [key,value] of Object.entries({locale,dir:state.direction,theme:state.theme,view:'images'}))expect(url.searchParams.get(key)).toBe(value);
  await expect(page.getByRole('row')).toHaveCount(4);
  await expect(page.locator('.dashboard-stats .ts-stat-tile__value')).toHaveText(['3','3','2','3','5']);
  await page.getByRole('button',{name:ar?'تحتاج إلى مراجعة':'Needs attention',exact:true}).click();
  await expect(page.getByRole('row')).toHaveCount(3);
  await page.getByRole('button',{name:ar?'الكل':'All',exact:true}).click();
  const pisa=page.getByRole('row',{name:/squad\/pisa.svg/});
  await pisa.focus(); await pisa.press('Enter');
  await expect(page.locator('.dashboard-details')).toContainText('pisa.svg');
  await capturePreviewScreenshots(page,info,`image-totals-${locale}`,[1440]);
 });
 test(`localized OpenUI ChatLauncher has count and visible keyboard focus ${locale}`,async({page},info)=>{
  await openPreview(page,state,'/components/ChatLauncher');
  const fixture=page.getByRole('region',{name:ar?'عينة OpenUI':'OpenUI fixture'});
  const launcher=fixture.getByRole('button',{name:ar?/اسأل بيترا.*٤ بانتظارك/:/Ask Petra.*4 waiting/});
  await expect(launcher).toBeVisible();
  await launcher.focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab');
  await expect(launcher).toBeFocused();
  await expect(launcher).toHaveCSS('outline-width','2px');
  await expect(launcher.locator('.ts-chat-launcher__count')).toHaveText(ar?'٤':'4');
  await capturePreviewScreenshots(page,info,`launcher-fixture-${locale}`,[390]);
 });
 test(`all owner decisions remove cards and keyboard launcher preserves state ${locale}`,async({page},info)=>{
  await openPreview(page,state,'/dashboards/home');
  for(let remaining=3;remaining>=0;remaining--){
   await page.getByRole('button',{name:remaining%2===0?(ar?'رفض':'Decline'):(ar?'موافقة':'Approve'),exact:true}).first().click();
   await expect(page.locator('.ts-card__count')).toHaveText(String(remaining));
  }
  await expect(page.locator('.ts-approval-card__content')).toHaveCount(0);
  await expect(page.locator('.sent-command pre')).toContainText('"decision": "reject"');
  await capturePreviewScreenshots(page,info,`owner-decisions-${locale}`,[390]);
  const launcher=page.getByRole('button',{name:ar?'اسأل بيترا':'Ask Petra',exact:true});
  await launcher.focus(); await expect(launcher).toBeFocused(); await launcher.press('Space');
  await expect(page).toHaveURL(/\/chat\?/);
  const url=new URL(page.url());
  for(const [key,value] of Object.entries({locale,dir:state.direction,theme:state.theme}))expect(url.searchParams.get(key)).toBe(value);
  await expect(page.locator('.ts-chat-launcher')).toHaveCount(0);
 });
}
