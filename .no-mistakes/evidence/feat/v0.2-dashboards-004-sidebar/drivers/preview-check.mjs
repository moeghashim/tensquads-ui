import {chromium, expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7TGDSYKRTHQVD49EWM71BVH';
const browser=await chromium.launch(); const observations=[];
try {
 const page=await browser.newPage();
 for(const locale of ['en','ar']) for(const theme of ['light','dark']) {
  const rtl=locale==='ar';
  await page.setViewportSize({width:1440,height:900});
  await page.goto(`http://127.0.0.1:5173/components/Sidebar?locale=${locale}&dir=${rtl?'rtl':'ltr'}&theme=${theme}`);
  await page.evaluate(()=>document.fonts.ready);
  const nav=page.locator('.ts-sidebar-shell > nav'); const surface=page.locator('.sidebar-preview__content');
  await expect(nav).toBeVisible();
  const layout=await nav.evaluate(el=>({width:el.getBoundingClientRect().width,padding:getComputedStyle(el).padding,brandWidth:el.querySelector('.ts-sidebar-brand-icon').getBoundingClientRect().width,iconWidth:el.querySelector('.ts-sidebar-item-icon').getBoundingClientRect().width}));
  expect(layout.width).toBe(248);expect(layout.padding).toBe('12px');expect(layout.brandWidth).toBe(36);expect(layout.iconWidth).toBe(16);
  const n=await nav.boundingBox(), s=await surface.boundingBox();
  expect(rtl?n.x>=s.x+s.width-1:n.x+n.width<=s.x+1).toBe(true);
  const user=await nav.locator('.ts-sidebar-user').boundingBox();expect(Math.abs(n.y+n.height-12-user.y-user.height)).toBeLessThanOrEqual(1);
  await expect(nav.locator('[aria-current="page"]')).toHaveText(rtl?'نظرة عامة':'Overview');
  await expect(nav.locator('.ts-sidebar-count')).toHaveText('8');
  await expect(page.getByText('navigation belongs to application chrome',{exact:false})).toBeVisible();
  const rows=page.locator('.ts-sidebar-agent'); await expect(rows).toHaveCount(3);
  await expect(rows.nth(0)).toContainText(rtl?'تدير ٥ فرق · متجر تجريبي':'Runs 5 squads · Demo store');
  await expect(rows.nth(1)).toContainText(rtl?'الطلبات':'Orders');
  await expect(rows.nth(2)).toContainText(rtl?'المخزون':'Inventory');
  await expect(rows.nth(1).locator('.ts-sidebar-visually-hidden')).toHaveText(rtl?'متصل':'Online');
  await expect(rows.nth(2).locator('.ts-sidebar-visually-hidden')).toHaveText(rtl?'خامل':'Idle');
  const agents=await rows.evaluateAll(els=>els.map(el=>({text:el.textContent,imageWidth:el.querySelector('img').getBoundingClientRect().width,imageLoaded:el.querySelector('img').complete&&el.querySelector('img').naturalWidth>0,statusColor:el.querySelector('.ts-sidebar-status')?getComputedStyle(el.querySelector('.ts-sidebar-status')).backgroundColor:null,statusAtInlineEnd:el.querySelector('.ts-sidebar-status')?Math.sign(el.querySelector('.ts-sidebar-status').getBoundingClientRect().x-el.querySelector('img').getBoundingClientRect().x):null})));
  expect(agents.every(x=>x.imageLoaded)).toBe(true);expect(agents[1].imageWidth).toBe(28);expect(agents[2].imageWidth).toBe(28);expect(agents[1].statusColor).not.toBe(agents[2].statusColor);expect(agents[1].statusAtInlineEnd).toBe(rtl?-1:1);
  const first=nav.getByRole('button',{name:rtl?'نظرة عامة':'Overview',exact:true});
  await first.focus(); await page.keyboard.press('Tab');
  const ring=await page.evaluate(()=>{const s=getComputedStyle(document.activeElement);return {width:s.outlineWidth,offset:s.outlineOffset,color:s.outlineColor}});
  expect(ring).toEqual({width:'2px',offset:'2px',color:theme==='light'?'rgb(1, 105, 204)':'rgb(2, 133, 255)'});
  await page.locator('.sidebar-preview').screenshot({path:`${evidence}/sidebar-detail-${locale}-${theme}.png`});
  for(const width of [960,959]) {
   await page.setViewportSize({width,height:900});
   if(width===960) await expect(nav).toBeVisible(); else await expect(nav).toBeHidden();
  }
  await page.setViewportSize({width:390,height:844});
  const menu=page.getByRole('button',{name:rtl?'فتح التنقل':'Open navigation'}); await menu.click();
  const sheet=page.getByRole('dialog');
  await sheet.getByRole('link',{name:rtl?'الفرق':'Squads',exact:true}).click();
  await expect(sheet).toBeHidden(); await expect(menu).toBeFocused();expect(new URL(page.url()).hash).toBe('#squads');
  observations.push({locale,theme,layout,desktopMirrors:true,userPinned:true,agents,focusRing:ring,breakpoint960Visible959Collapsed:true,mobileLinkNavigatesAndCloses:true});
 }
 await writeFile(`${evidence}/preview-behavior.json`,JSON.stringify(observations,null,2));
 console.log(JSON.stringify(observations,null,2));
} catch(e) {await writeFile(`${evidence}/preview-behavior.json`,JSON.stringify([...observations,{failure:String(e)}],null,2));throw e;}
finally{await browser.close();}
