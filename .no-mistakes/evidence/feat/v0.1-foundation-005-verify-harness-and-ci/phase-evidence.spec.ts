import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { openPreview, capturePreviewScreenshots, expectAccessible, expectNoHorizontalScroll, expectThemeFocusRing } from './helpers/preview';
const evidence='~/.no-mistakes/evidence/01M7NV0E5DTF17YN6TW97Q6B82';
test('capture live preview fonts and unchanged baselines', async ({page}, testInfo)=>{
 const records=[];
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('DOM.enable');
 await cdp.send('CSS.enable');
 for(const locale of ['en','ar'] as const) for(const theme of ['light','dark'] as const){
  const direction=locale==='en'?'ltr':'rtl';
  await openPreview(page,{locale,direction,theme});

  await expectAccessible(page);
  await expectThemeFocusRing(page,theme);
  await expectNoHorizontalScroll(page);
  const probe=page.locator('h1');
  await expect(probe).toBeVisible();
  const doc=await cdp.send('DOM.getDocument');
  const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'h1'});
  const {fonts}=await cdp.send('CSS.getPlatformFontsForNode',{nodeId});
  console.log(JSON.stringify({locale,theme,fonts}));
  const expected=locale==='en'?'Inter':'IBM Plex Sans Arabic';
  expect(fonts.some(f=>f.familyName.startsWith(expected) && f.isCustomFont && f.glyphCount>0)).toBe(true);
  records.push({locale,theme,heading:await probe.textContent(),fonts});
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:900});
   await page.screenshot({path:`${evidence}/${locale}-${theme}-${width}.png`,fullPage:true});
  }
 }
 await writeFile(`${evidence}/browser-fonts.json`,JSON.stringify(records,null,2));
});
