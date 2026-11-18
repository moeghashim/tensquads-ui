import { test, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { openPreview, expectAccessible, expectNoHorizontalScroll } from './helpers/preview';
const evidence = '~/.no-mistakes/evidence/01M7PJGTNPRF22XTR91SEKT313';
test('capture live gallery and home and exercise OpenUI keyboard behavior', async ({page}) => {
 const observations: unknown[] = [];
 const names = { en: ['Petra','Pisa','Kyoto','Rio','Zurich','Giza','Machu','Angkor','Delphi','Sydney','Greenwich','Alexandria','Venice'], ar: ['بترا','بيزا','كيوتو','ريو','زيورخ','الجيزة','ماتشو','أنغكور','دلفي','سيدني','غرينتش','الإسكندرية','البندقية'] };
 const labels = { en: ['Idle','Waiting','Planning','Running skill','Checking','Done','Sent back','Blocked','Escalated','Dropped'], ar: ['خامل','بانتظارك','تخطيط','يعمل','يتحقق','تم','أُعيد','محظور','مُصعّد','متوقف'] };
 for (const locale of ['en','ar'] as const) for (const theme of ['light','dark'] as const) {
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  await openPreview(page,{locale,direction,theme},'/components/Squadmate');
  for (const name of names[locale]) for (const label of labels[locale]) await expect(page.getByRole('img',{name:`${name}${locale === 'ar' ? '،' : ','} ${label}`,exact:true})).toBeVisible();
  await expect.poll(() => page.locator('img').evaluateAll(images => images.every(i => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0))).toBe(true);
  for (const width of [1440,390]) {
   await page.setViewportSize({width,height:900});
   await page.screenshot({path:`${evidence}/gallery-${locale}-${theme}-${width}.png`,fullPage:true,animations:'disabled'});
  }
  await expectNoHorizontalScroll(page);
  await expectAccessible(page);
  observations.push({surface:'gallery',locale,theme,images:await page.getByRole('img').count(),allNamesAndLabels:true,allImagesDecoded:true,mobileOverflow:false,axeViolations:0});
  await page.getByRole('link').click();
  await expect(page.getByRole('link',{name:'Squadmate',exact:true})).toBeVisible();
  await page.setViewportSize({width:1440,height:900});
  await page.screenshot({path:`${evidence}/home-${locale}-${theme}.png`,fullPage:true});
  await page.getByRole('link',{name:'Squadmate',exact:true}).click();
  await expect(page.getByRole('img')).toHaveCount(130);
  observations.push({surface:'home',locale,theme,squadmateLinkOpensGallery:true});
 }
 for(const locale of ['en','ar'] as const) {
  await page.goto(`/phase-squadmate.html?locale=${locale}`);
  await expect(page.getByRole('img',{name:locale === 'ar' ? 'بترا، تخطيط':'Petra, Planning',exact:true})).toBeVisible();
  await expect(page.locator('body')).toHaveAttribute('data-errors','[]');
  await expect(page.getByRole('img')).toHaveAttribute('width','64');
  await expect(page.getByRole('img')).toHaveAttribute('height','64');
  await expect.poll(() => page.getByRole('img').evaluate((i:HTMLImageElement) => i.complete && i.naturalWidth === 64)).toBe(true);
  await page.locator('#before').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#after')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#before')).toBeFocused();
  await page.screenshot({path:`${evidence}/openui-${locale}.png`,fullPage:true});
  await expectAccessible(page);
  observations.push({surface:'OpenUI fixture consumer',locale,name:await page.getByRole('img').getAttribute('alt'),dimensions:'64x64',imageDecoded:true,tabSkipsImageBothDirections:true,rendererErrors:[],axeViolations:0});
 }
 writeFileSync(`${evidence}/browser-observations.json`,JSON.stringify(observations,null,2));
});
