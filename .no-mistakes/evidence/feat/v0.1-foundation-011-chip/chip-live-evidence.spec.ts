import { test } from '@playwright/test';
import { openPreview } from './helpers/preview';
const evidence='~/.no-mistakes/evidence/01M7PVSP7RFJCWRM65H4X017SS';
test('retain Chip production preview evidence', async ({page})=>{
 for(const locale of ['en','ar'] as const) for(const theme of ['light','dark'] as const) for(const width of [1440,390]) {
 await page.setViewportSize({width,height:900});
 await openPreview(page,{locale,theme,direction:locale==='ar'?'rtl':'ltr'},'/components/Chip');
 await page.locator('.chip-preview__grid .ts-chip').first().focus();
 await page.screenshot({path:`${evidence}/preview-${locale}-${theme}-${width}.png`,fullPage:true,animations:'disabled'});
 }
});
