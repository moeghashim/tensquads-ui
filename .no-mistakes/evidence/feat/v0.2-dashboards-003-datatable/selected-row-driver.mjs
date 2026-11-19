import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const evidence = '~/.no-mistakes/evidence/01M7TEG3BADJBQYRE0C5A2T745';
const browser = await chromium.launch();
const records = [];
const color = value => value.match(/[\d.]+/g).slice(0,3).map(Number);
function contrast(a,b) { const l = v => color(v).map(n => { n/=255; return n<=.04045?n/12.92:((n+.055)/1.055)**2.4; }).reduce((s,n,i)=>s+n*[.2126,.7152,.0722][i],0); const x=l(a),y=l(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); }
async function styles(row) { return row.evaluate(el => { const read = node => {const s=getComputedStyle(node);return {background:s.backgroundColor,color:s.color,shadow:s.boxShadow,text:node.textContent};};return {row:read(el),tile:read(el.querySelector('.ts-data-table__tile')),badge:read(el.querySelector('[data-slot=badge]'))}; }); }
async function visible(row, label) { const s=await styles(row); for(const part of ['tile','badge']) { expect(s[part].background,`${label} ${part} distinct fill`).not.toBe(s.row.background); if(part==='badge'||s.tile.text==='AC') expect(contrast(s[part].color,s[part].background),`${label} ${part} text contrast`).toBeGreaterThanOrEqual(4.5); } expect(s.badge.shadow).not.toBe('none'); records.push({label,...s}); return s; }
try {
for(const locale of ['en','ar']) for(const theme of ['light','dark']) {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const dir=locale==='ar'?'rtl':'ltr', id=`${locale}-${dir}-${theme}`;
 await page.goto(`http://localhost:5173/components/DataTable?locale=${locale}&dir=${dir}&theme=${theme}`);
 await page.evaluate(()=>document.fonts.ready);
 await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
 const card=page.locator('.dashboard-component-preview > [data-slot=card]');
 const acme=card.getByRole('row',{name:/Acme Studio/}), north=card.getByRole('row',{name:/Northstar/});
 await expect(acme).toHaveAttribute('aria-selected','true');
 await page.mouse.move(0,0);
 const initial=await visible(acme,`${id} initial selection`);
 expect(initial.tile.shadow).not.toBe('none');
 await card.screenshot({path:`${evidence}/${id}-selected.png`});
 await acme.hover(); await visible(acme,`${id} selected hover`);
 const otherBefore=await styles(north);
 await north.click();
 await expect(north).toHaveAttribute('aria-selected','true');
 await expect(acme).toHaveAttribute('aria-selected','false');
 const otherSelected=await visible(north,`${id} mouse selects success tile and neutral badge`);
 expect(otherSelected.tile).toEqual(otherBefore.tile);
 const deselected=await styles(acme);
 expect(deselected.tile.shadow).toBe('none'); expect(deselected.badge.shadow).toBe('none');
 expect(deselected.tile.background).not.toBe(initial.tile.background);
 await acme.focus(); await page.keyboard.press('Space');
 await expect(acme).toHaveAttribute('aria-selected','true');
 await expect(north).toHaveAttribute('aria-selected','false');
 await visible(acme,`${id} Space reselects primary tile`);
 await north.focus(); await page.keyboard.press('Enter');
 await expect(north).toHaveAttribute('aria-selected','true');
 await visible(north,`${id} Enter selects other row`);
 await acme.click(); await page.mouse.move(0,0);
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
 await visible(acme,`${id} 390px selection`);
 const scroll=card.locator('.ts-data-table__scroll');
 expect(await scroll.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
 await card.screenshot({path:`${evidence}/${id}-mobile-initials.png`});
 await acme.locator('[data-slot=badge]').scrollIntoViewIfNeeded();
 await expect(acme.locator('[data-slot=badge]')).toBeInViewport();
 await card.screenshot({path:`${evidence}/${id}-mobile-badge.png`});
 await page.close();
}
await writeFile(`${evidence}/selected-row-observations.json`,JSON.stringify(records,null,2));
console.log('Selected-row visibility passed: real production preview, EN/AR light/dark, mouse/Space/Enter, hover, deselection, 390px contained scrolling.');
} finally { await browser.close(); }
