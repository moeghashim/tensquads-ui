import {test,expect} from '@playwright/test';
import {openPreview} from './helpers/preview';
for(const locale of ['en','ar'] as const)for(const theme of ['light','dark'] as const)for(const width of [1440,390])test(`${locale} ${theme} ${width}`,async({page})=>{
const direction=locale==='en'?'ltr':'rtl';await openPreview(page,{locale,direction,theme},'/components/Chip');
await page.locator('.chip-preview__grid').getByRole('button',{name:'tool_search'}).focus();
await page.setViewportSize({width,height:900});
await expect(page).toHaveScreenshot(`chromium-chip-${locale}-${direction}-${theme}-${width}.png`,{animations:'disabled',caret:'hide',fullPage:true,maxDiffPixelRatio:0.001});
});
