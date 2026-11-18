import { chromium, expect } from '@playwright/test';
import { writeFile, copyFile } from 'node:fs/promises';
const evidence = '~/.no-mistakes/evidence/01M7PRG7NK22K1E5MT11WVRXH0';
const browser = await chromium.launch({args:['--disable-lcd-text','--font-render-hinting=none']});
const page = await browser.newPage({viewport:{width:1440,height:900}});
const results = [];
try {
 for (const [theme,system] of [['light','light'],['dark','light'],['system','dark'],['light','dark']]) {
  await page.emulateMedia({colorScheme:system});
  await page.goto(`http://localhost:5173/components/Button?locale=en&dir=ltr&theme=${theme}`);
  await page.evaluate(()=>document.fonts.ready);
  const buttons = page.locator('.ts-button--danger:not([data-disabled])');
  await expect(buttons).toHaveCount(5);
  for (const button of await buttons.all()) await expect(button).toHaveCSS('color','rgb(255, 255, 255)');
  if (theme==='system') await expect(page.locator('html')).not.toHaveAttribute('data-theme');
  else await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
  const computed = await buttons.evaluateAll(elements=>elements.map(el=>({text:el.textContent,color:getComputedStyle(el).color,componentProperty:getComputedStyle(el).getPropertyValue('--ts-button-danger-text').trim()})));
  results.push({theme,system,computed});
  await page.screenshot({path:`${evidence}/danger-${theme}-system-${system}.png`,fullPage:true});
 }
 const labels=['في استراحة','بانتظارك','تخطيط','قيد العمل','قيد التحقق','تم','إعادة للتعديل','معلّق','بانتظار قرارك','أُلغي'];
 for (const theme of ['light','dark']) {
  await page.goto(`http://localhost:5173/components/Squadmate?locale=ar&dir=rtl&theme=${theme}`);
  await page.evaluate(()=>document.fonts.ready);
  const gallery=page.getByRole('region',{name:'الزملاء وحالاتهم'});
  await expect(gallery.getByRole('img')).toHaveCount(130);
  const agents=gallery.locator('.squadmate-gallery__agent');
  await expect(agents).toHaveCount(13);
  const observed=[];
  for (const agent of await agents.all()) {
   const name=await agent.locator('h2').textContent();
   await expect(agent.locator('figcaption')).toHaveText(labels);
   const images=await agent.getByRole('img').evaluateAll(els=>els.map(el=>({alt:el.alt,loaded:el.complete&&el.naturalWidth>0})));
   expect(images.map(x=>x.alt)).toEqual(labels.map(label=>`${name}، ${label}`));
   expect(images.every(x=>x.loaded)).toBe(true);
   observed.push({name,images});
  }
  results.push({arabicLabels:theme,agents:observed});
  await page.screenshot({path:`${evidence}/squadmate-ar-${theme}-1440.png`,fullPage:true});
  await page.setViewportSize({width:390,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
  await page.screenshot({path:`${evidence}/squadmate-ar-${theme}-390.png`,fullPage:true});
  await page.setViewportSize({width:1440,height:900});
 }
 await writeFile(`${evidence}/live-observations.json`,JSON.stringify(results,null,2));
 for (const kind of ['actual','expected','diff']) await copyFile(`test-results/button-Button-previews-variants-sizes-and-interaction-states/chromium-button-ar-rtl-light-390-${kind}.png`,`${evidence}/button-ar-light-mobile-${kind}.png`);
 console.log('Live production preview: all five enabled danger sizes/shapes are white in light, explicit dark, system dark, and light override; every Arabic caption and image accessible name matches D18 across 13 agents in both themes; mobile pages have no overflow.');
} finally {await browser.close();}
