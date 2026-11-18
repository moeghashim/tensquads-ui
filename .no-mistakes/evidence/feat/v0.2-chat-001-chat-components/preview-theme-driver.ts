import { test, expect } from '@playwright/test';
import { expectAccessible, expectNoHorizontalScroll, openPreview } from './helpers/preview';
const evidence='~/.no-mistakes/evidence/01M7RCHHQ9B9S1Q0SD2JGD56J4';
test('Chat remaining theme combinations and preserved preview navigation',async({page})=>{
 for(const state of [{locale:'en',direction:'ltr',theme:'dark'},{locale:'ar',direction:'rtl',theme:'light'}] as const){
  await openPreview(page,state,'/components/Chat');await expect(page.getByRole('log')).toBeVisible();await expectAccessible(page);await expectNoHorizontalScroll(page);await page.screenshot({path:`${evidence}/chat-${state.locale}-${state.theme}-390.png`,fullPage:true});
 }
 await openPreview(page,{locale:'en',direction:'ltr',theme:'light'},'/components/Button');
 await expect(page.locator('.component-doc-nav [rel="prev"]')).toHaveCount(0);
 await expect(page.locator('.component-doc-nav [rel="next"]')).toContainText('Badge');
 await openPreview(page,{locale:'en',direction:'ltr',theme:'light'},'/components/Tooltip');
 await expect(page.locator('.component-doc-nav [rel="next"]')).toContainText('Chat');
 await page.locator('.component-doc-nav [rel="next"]').click();await expect(page.getByRole('log')).toBeVisible();await expect(page.locator('.component-doc-nav [rel="prev"]')).toContainText('Tooltip');
});
