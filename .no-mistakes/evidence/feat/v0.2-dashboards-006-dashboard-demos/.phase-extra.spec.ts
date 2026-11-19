import { test, expect } from '@playwright/test';
import { openPreview } from './helpers/preview';
import { writeFile } from 'node:fs/promises';
const evidence = '~/.no-mistakes/evidence/01M7TM9Y4S3DPMSVDX7MAR57N8';
for (const locale of ['en','ar'] as const) {
 test(`image population totals and filters agree ${locale}`, async ({page}) => {
  await openPreview(page,{locale,direction:locale==='ar'?'rtl':'ltr',theme:'light'},'/dashboards/admin');
  await page.getByRole('button',{name:locale==='ar'?'صور الفرق':'Squad images'}).click();
  await expect(page.locator('.ts-stat-tile__value')).toHaveText(['3','3','2','3','5']);
  await expect(page.getByRole('row')).toHaveCount(4);
  await page.getByRole('button',{name:locale==='ar'?'تحتاج إلى مراجعة':'Needs attention',exact:true}).click();
  await expect(page.getByRole('row')).toHaveCount(3);
  await page.screenshot({path:`${evidence}/image-attention-${locale}.png`,fullPage:true});
 });
 test(`ChatLauncher localized OpenUI count and keyboard focus ${locale}`, async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await openPreview(page,{locale,direction:locale==='ar'?'rtl':'ltr',theme:'dark'},'/components/ChatLauncher');
  const region=page.getByRole('region',{name:locale==='ar'?'عينة OpenUI':'OpenUI fixture'});
  const launcher=region.getByRole('button',{name:locale==='ar'?'اسأل بيترا ، ٤ بانتظارك':'Ask Petra , 4 waiting'});
  await expect(launcher).toBeVisible();
  await launcher.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
  await expect(launcher).toBeFocused();
  await expect(launcher).toHaveCSS('outline-width','2px');
  await launcher.press('Space');
  await expect(launcher).toBeVisible();
  await page.screenshot({path:`${evidence}/launcher-openui-${locale}.png`,fullPage:true});
 });
}
test('owner can decide every approval then open chat by keyboard without overlay',async({page})=>{
 await openPreview(page,{locale:'en',direction:'ltr',theme:'dark'},'/dashboards/home');
 for(const count of [3,2,1,0]) {
  await page.getByRole('button',{name:'Approve',exact:true}).first().click();
  await expect(page.locator('.ts-card__count')).toHaveText(String(count));
 }
 await expect(page.locator('.ts-approval-card__content')).toHaveCount(0);
 await page.screenshot({path:`${evidence}/owner-empty-approvals.png`,fullPage:true});
 const command=JSON.parse(await page.locator('.sent-command pre').innerText());
 expect(command.type).toBe('ApprovalDecision');expect(command.decision).toBe('approve');
 await writeFile(`${evidence}/approval-command.json`,JSON.stringify(command,null,2));
 const launcher=page.getByRole('button',{name:'Ask Petra',exact:true});
 await launcher.focus(); await launcher.press('Enter');
 await expect(page).toHaveURL(/\/chat\?.*locale=en.*dir=ltr.*theme=dark/);
 await expect(page.locator('.ts-chat-launcher')).toHaveCount(0);
 await page.screenshot({path:`${evidence}/chat-after-launch.png`,fullPage:true});
});
test('home page dashboard links preserve selected URL settings',async({page})=>{
 await openPreview(page,{locale:'en',direction:'ltr',theme:'dark'},'/');
 await page.locator('a[href*="/dashboards/admin"]').click();
 await expect(page).toHaveURL(/dashboards\/admin\?.*locale=en.*dir=ltr.*theme=dark/);
 await expect(page.getByRole('heading',{name:'Companies',exact:true,level:1})).toBeVisible();
 await page.goBack();
 await page.locator('main a[href*="/dashboards/home"]').click();
 await expect(page).toHaveURL(/dashboards\/home\?.*locale=en.*dir=ltr.*theme=dark/);
 await expect(page.getByRole('heading',{name:'Good morning, Moe',exact:true})).toBeVisible();
});
