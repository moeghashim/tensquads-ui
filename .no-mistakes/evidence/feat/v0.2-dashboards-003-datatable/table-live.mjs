import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const evidence = '~/.no-mistakes/evidence/01M7TDFM23RBA6KJGRCSJJNSS2';
const browser = await chromium.launch();
const records = [];
try {
 for (const locale of ['en','ar']) for (const theme of ['light','dark']) {
  const page = await browser.newPage({viewport:{width:390,height:844}});
  await page.goto(`http://localhost:5173/components/DataTable?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}`);
  await page.evaluate(() => document.fonts.ready);
  const card = page.locator('.dashboard-component-preview > [data-slot=card]');
  const scroll = card.locator('.ts-data-table__scroll');
  const acme = card.getByRole('row',{name:/Acme Studio/});
  const north = card.getByRole('row',{name:/Northstar/});
  await expect(acme).toBeVisible();
  await scroll.scrollIntoViewIfNeeded();
  const geometry = await scroll.evaluate(el=>({width:el.clientWidth, content:el.scrollWidth, offset:el.scrollLeft, table:el.querySelector('table').getBoundingClientRect().toJSON(), scroller:el.getBoundingClientRect().toJSON(), page:document.documentElement.scrollWidth}));
  records.push({locale,theme,geometry});
  await card.screenshot({path:`${evidence}/card-${locale}-${theme}-start.png`});
  await scroll.focus();
  await page.keyboard.press(locale==='ar'?'ArrowLeft':'ArrowRight');
  await page.waitForTimeout(300);
  const after = await scroll.evaluate(el=>el.scrollLeft);
  expect(Math.abs(after)).toBeGreaterThan(Math.abs(geometry.offset));
  await scroll.hover();
  await page.mouse.wheel(locale==='ar'?-1500:1500,0);
  await page.waitForTimeout(300);
  const far = await scroll.evaluate(el=>({offset:el.scrollLeft, width:el.clientWidth, content:el.scrollWidth}));
  expect(Math.abs(far.offset)).toBeGreaterThan(Math.abs(after));
  const status = acme.locator('td').last();
  const sb = await status.boundingBox();
  const vb = await scroll.boundingBox();
  expect(sb.x).toBeGreaterThanOrEqual(vb.x-1);
  expect(sb.x+sb.width).toBeLessThanOrEqual(vb.x+vb.width+1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
  await card.screenshot({path:`${evidence}/card-${locale}-${theme}-scrolled.png`});
  await page.setViewportSize({width:1440,height:900});
  await north.click();
  await expect(north).toHaveAttribute('aria-selected','true');
  for (const [row,tint] of [[acme,'primary'],[north,'success']]) {
   const colors = await row.locator('.ts-data-table__tile').evaluate((tile,tint)=>{
    const ref = document.createElement('span');
    ref.style.backgroundColor = `var(--ts-${tint==='primary'?'primary-soft':'success-surface'})`;
    ref.style.color = `var(--ts-${tint==='primary'?'primary-solid':'success-text'})`;
    tile.append(ref);
    const actual=getComputedStyle(tile), expected=getComputedStyle(ref);
    const result={actual:{background:actual.backgroundColor,color:actual.color},expected:{background:expected.backgroundColor,color:expected.color}};
    ref.remove(); return result;
   },tint);
   expect(colors.actual).toEqual(colors.expected);
   records.push({locale,theme,tint,...colors});
  }
  await acme.focus(); await page.keyboard.press('Space');
  await expect(acme).toHaveAttribute('aria-selected','true');
  await expect(north).toHaveAttribute('aria-selected','false');
  await card.screenshot({path:`${evidence}/card-${locale}-${theme}-desktop.png`});
  records.push({locale,theme,keyboardScroll:after,wheelScroll:far,selection:'mouse Northstar then Space Acme'});
  await page.close();
 }
} finally {
 await writeFile(`${evidence}/scroll-tint-results.json`,JSON.stringify(records,null,2));
 await browser.close();
}
