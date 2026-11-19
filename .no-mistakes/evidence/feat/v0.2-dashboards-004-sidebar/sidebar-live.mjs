import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const evidence = '~/.no-mistakes/evidence/01M7THSYJFJS6AZ0N5NNTPK6HN';
const browser = await chromium.launch();
const results = [];
try {
  for (const locale of ['en', 'ar']) for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({viewport: {width:1440,height:1000}});
    try {
      const errors=[];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(`http://localhost:5173/components/Sidebar?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}`);
      await page.evaluate(() => document.fonts.ready);
      const preview = page.locator('.sidebar-preview');
      await preview.scrollIntoViewIfNeeded();
      const nav = preview.locator('.ts-sidebar-shell > .ts-sidebar');
      await expect(nav).toBeVisible();
      await expect(nav.locator('.ts-sidebar-user-copy strong')).toHaveText('Moe Ghashim');
      const inspect = async root => root.evaluate(el => {
        const measure = selector => [...el.querySelectorAll(selector)].map(n => {
          const s=getComputedStyle(n), b=n.getBoundingClientRect();
          return {text:n.textContent,size:s.fontSize,weight:s.fontWeight,color:s.color,background:s.backgroundColor,x:b.x,y:b.y,width:b.width,height:b.height,scrollWidth:n.scrollWidth,clientWidth:n.clientWidth};
        });
        return {secondary:measure('.ts-sidebar-brand-copy > span, .ts-sidebar-user-copy > span, .ts-sidebar-agent-copy > span'),titles:measure('.ts-sidebar-brand-copy strong, .ts-sidebar-user-copy strong, .ts-sidebar-agent-copy strong'),tile:measure('.ts-sidebar-brand-icon'),agents:[...el.querySelectorAll('.ts-sidebar-agent')].map(row=>{const name=row.querySelector('strong'),role=row.querySelector('.ts-sidebar-agent-copy > span');const a=name.getBoundingClientRect(),b=role.getBoundingClientRect();return {featured:row.classList.contains('ts-sidebar-agent--featured'),name:name.textContent,role:role.textContent,nameBox:{x:a.x,y:a.y,width:a.width,height:a.height},roleBox:{x:b.x,y:b.y,width:b.width,height:b.height}};})};
      });
      const desktop = await inspect(preview);
      for (const text of desktop.secondary) expect(text.size).toBe('13px');
      for (const text of desktop.titles) expect(text.size).toBe('14px');
      expect(desktop.tile[0].width).toBe(36);
      expect(desktop.tile[0].height).toBe(36);
      for (const row of desktop.agents) {
        if (row.featured) expect(row.roleBox.y).toBeGreaterThanOrEqual(row.nameBox.y+row.nameBox.height);
        else {
          expect(Math.abs(row.nameBox.y-row.roleBox.y)).toBeLessThan(4);
          if (locale==='ar') expect(row.roleBox.x+row.roleBox.width).toBeLessThan(row.nameBox.x);
          else expect(row.roleBox.x).toBeGreaterThan(row.nameBox.x+row.nameBox.width);
        }
      }
      await preview.screenshot({path:`${evidence}/review-${locale}-${theme}-desktop.png`,animations:'disabled'});
      await page.setViewportSize({width:390,height:844});
      await preview.scrollIntoViewIfNeeded();
      const narrow = await inspect(preview.locator('.sidebar-preview__content'));
      for (const row of narrow.agents.filter(r=>!r.featured)) expect(Math.abs(row.nameBox.y-row.roleBox.y)).toBeLessThan(4);
      await preview.screenshot({path:`${evidence}/review-${locale}-${theme}-mobile.png`,animations:'disabled'});
      await page.getByRole('button',{name:locale==='ar'?'فتح التنقل':'Open navigation',exact:true}).click();
      const sheet=page.getByRole('dialog');
      await expect(sheet).toBeVisible();
      await expect(sheet.locator('.ts-sidebar-user-copy strong')).toHaveText('Moe Ghashim');
      const mobile=await inspect(sheet);
      for(const text of mobile.secondary) expect(text.size).toBe('13px');
      await sheet.screenshot({path:`${evidence}/review-${locale}-${theme}-sheet.png`,animations:'disabled'});
      await sheet.getByRole('button',{name:locale==='ar'?'الشركات 8':'Companies 8',exact:true}).click();
      await expect(sheet).toBeHidden();
      expect(errors).toEqual([]);
      results.push({locale,theme,desktop,narrow,mobile,selectionClosesSheet:true,pageErrors:errors});
    } finally { await page.close(); }
  }
  await writeFile(`${evidence}/rendered-sidebar-measurements.json`,JSON.stringify(results,null,2));
  console.log('Rendered preview verified: 13px secondary text, 14px names, inline roles with RTL order, stacked lead metadata, Latin account name, 36px brand tile, and item selection closes mobile sheet in en/ar × light/dark.');
} finally { await browser.close(); }
