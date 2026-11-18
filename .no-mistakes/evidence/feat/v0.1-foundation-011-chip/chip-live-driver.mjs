import {chromium, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFile} from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7PVSP7RFJCWRM65H4X017SS';
const browser=await chromium.launch({headless:true,args:['--disable-lcd-text','--font-render-hinting=none']});
const context=await browser.newContext();
const page=await context.newPage();
const results=[];
try {
 for (const locale of ['en','ar']) for (const theme of ['light','dark']) {
  const direction=locale==='ar'?'rtl':'ltr';
  await page.goto(`http://127.0.0.1:5173/components/Chip?locale=${locale}&dir=${direction}&theme=${theme}`);
  await page.evaluate(()=>document.fonts.ready);
  const first=page.locator('.chip-preview__grid').getByRole('button',{name:'response_schema',exact:true});
  await expect(first).toBeVisible();
  await page.keyboard.press('Tab'); await first.focus();
  const visual=await first.evaluate(el=>{const s=getComputedStyle(el);return {height:el.getBoundingClientRect().height,background:s.backgroundColor,outline:s.outlineWidth,outlineColor:s.outlineColor,outlineOffset:s.outlineOffset,pressed:el.getAttribute('aria-pressed')}});
  expect(visual.height).toBe(28); expect(visual.pressed).toBe(null);
  expect(visual.outline).toBe('2px'); expect(visual.outlineOffset).toBe('2px');
  expect(visual.outlineColor).toBe(theme==='light'?'rgb(1, 105, 204)':'rgb(2, 133, 255)');
  for (const width of [1440,390]) {
   await page.setViewportSize({width,height:900});
   await page.screenshot({path:`${evidence}/chip-${locale}-${theme}-${width}.png`,fullPage:true});
  }
  const long=page.getByRole('button',{name:'this_is_a_long_object_identifier_that_stays_visible',exact:true});
  const layout=await long.evaluate(el=>{const n=el.querySelector('.ts-chip__name'),s=getComputedStyle(n),r=n.getBoundingClientRect(),b=el.getBoundingClientRect();return {text:n.textContent,textOverflow:s.textOverflow,whiteSpace:s.whiteSpace,overflowWrap:s.overflowWrap,nameWidth:n.clientWidth,nameScrollWidth:n.scrollWidth,nameHeight:r.height,buttonHeight:b.height,inside:r.x>=b.x&&r.right<=b.right,documentWidth:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}});
  expect(layout.text).toBe('this_is_a_long_object_identifier_that_stays_visible');expect(layout.nameScrollWidth).toBeLessThanOrEqual(layout.nameWidth);expect(layout.inside).toBe(true);expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewport);
  const axe=await new AxeBuilder({page}).analyze();expect(axe.violations).toEqual([]);
  results.push({surface:'production preview',locale,direction,theme,visual,longIdentifier:layout,axeViolations:axe.violations});
 }
 await page.goto('http://127.0.0.1:5174/.chip-live/index.html');
 const react=page.getByRole('region',{name:'React consumer'});
 const chip=react.getByRole('button',{name:'customer_schema',exact:true});
 await expect(chip).toBeVisible(); await expect(chip.locator('[data-object-icon="customer"]')).toBeVisible();
 const output=page.getByLabel('Object openings');
 await chip.click();await expect(output).toHaveText('["customer_schema"]');
 await chip.focus();await page.keyboard.press('Enter');await expect(output).toHaveText('["customer_schema","customer_schema"]');
 await page.keyboard.press('Space');await expect(output).toHaveText('["customer_schema","customer_schema","customer_schema"]');
 expect(await chip.getAttribute('aria-pressed')).toBeNull();
 const disabled=react.getByRole('button',{name:'disabled_object'});
 await expect(disabled).toBeDisabled();
 await disabled.click({force:true});await disabled.evaluate(el=>el.click());await page.evaluate(()=>{document.body.tabIndex=-1;document.body.focus()});await disabled.focus();
 expect(await disabled.evaluate(el=>el===document.activeElement)).toBe(false);
 await page.keyboard.press('Enter');await page.keyboard.press('Space');
 await expect(output).toHaveText('["customer_schema","customer_schema","customer_schema"]');
 await chip.focus();await page.keyboard.press('Tab');await expect(react.getByRole('link',{name:'linked_schema'})).toBeFocused();
 await page.keyboard.press('Enter');expect(new URL(page.url()).hash).toBe('#linked-object');
 results.push({surface:'real React Chip with synthetic customer_schema host',actions:['mouse','Enter','Space'],openings:await output.textContent(),customIconVisible:true,disabledBlocksMouseProgrammaticClickAndFocus:true,tabSkipsDisabled:true,renderLinkNavigated:page.url()});
 await page.screenshot({path:`${evidence}/chip-consumer.png`,fullPage:true});
 const stream=page.getByRole('region',{name:'OpenUI consumer'}).getByRole('button',{name:'customer_schema'});
 await stream.click();await stream.focus();await page.keyboard.press('Enter');await page.keyboard.press('Space');
 const streamResult={surface:'real TensquadsRenderer stream root = Chip("customer_schema")',rendered:await stream.isVisible(),iconChildren:await stream.locator('.ts-chip__icon > *').count(),openingsAfter:await output.textContent(),expected:'Consumer-provided icon and opening action',result:'fail'};
 results.push(streamResult);
 await page.screenshot({path:`${evidence}/chip-openui-inert.png`,fullPage:true});
 console.log(JSON.stringify(results,null,2));
 await writeFile(`${evidence}/chip-live-results.json`,JSON.stringify(results,null,2));
} finally {await browser.close()}
