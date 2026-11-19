import { test, expect } from '@playwright/test';
for (const locale of ['en','ar']) for (const theme of ['light','dark']) {
 test(`Dashboard OpenUI and keyboard ${locale} ${theme}`, async ({page})=>{
 const dir=locale==='ar'?'rtl':'ltr';
 for (const name of ['Card','PageHeader','StatTile']) {
 await page.goto(`/components/${name}?locale=${locale}&dir=${dir}&theme=${theme}`);
 await page.evaluate(()=>document.fonts.ready);
 const fixture=page.getByRole('region',{name:locale==='ar'?'عينة OpenUI':'OpenUI fixture'});
 await expect(fixture).toBeVisible();
 for(const width of [1440,390]) { await page.setViewportSize({width,height:900}); await page.screenshot({path:`~/.no-mistakes/evidence/01M7SMMD2XH955PSB96AAGBXGM/screenshots/${name}-${locale}-${dir}-${theme}-${width}.png`,fullPage:true}); }
 await page.setViewportSize({width:1440,height:900});
 if(name==='Card') {
 const grid=fixture.locator('.ts-stat-grid');
 await expect(grid).toHaveCount(1);
 await expect(grid.getByRole('article')).toHaveCount(2);
 for(const width of [1440,390]) {
 await page.setViewportSize({width,height:900});
 const tiles=grid.getByRole('article');
 const a=await tiles.nth(0).boundingBox(), b=await tiles.nth(1).boundingBox();
 expect(a).toBeTruthy(); expect(b).toBeTruthy();
 if(width===1440) { expect(b!.y).toBeCloseTo(a!.y,0); expect(dir==='rtl'?b!.x<a!.x:b!.x>a!.x).toBe(true); }
 else expect(b!.y).toBeGreaterThan(a!.y);
 }
 } else if(name==='PageHeader') {
 await expect(fixture.getByRole('heading',{name:locale==='ar'?'نظرة عامة':'Overview'})).toBeVisible();
 const button=page.locator('.dashboard-component-preview').getByRole('button',{name:locale==='ar'?'تصدير التقرير':'Export report'});
 await button.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab'); await expect(button).toBeFocused();
 await page.keyboard.press('Enter'); await expect(button).toBeVisible();
 } else {
 const img=fixture.getByRole('img',{name:locale==='ar'?'الإيرادات':'Revenue',exact:true});
 await expect(img).toBeVisible(); await expect(img).toHaveCSS('transform',dir==='rtl'?'matrix(-1, 0, 0, 1, 0, 0)':'none');
 }
 }
 });
}
