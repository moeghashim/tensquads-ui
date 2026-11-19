import {test,expect} from '@playwright/test';
const evidence='~/.no-mistakes/evidence/01M7T96F3830VNXDNHBGZKXXNX';
for(const dir of ['ltr','rtl']) test(`Cell controls retain native keyboard behavior in ${dir}`,async({page})=>{
 await page.goto('http://localhost:5174');
 await page.locator('html').evaluate((el,dir)=>el.dir=dir,dir);
 const row=page.getByRole('row',{name:/Open company/});
 const other=page.getByRole('row',{name:/Other company/});
 const button=page.getByRole('button',{name:'Open company'});
 const selected=page.getByLabel('Selected');
 const activated=page.getByLabel('Activated');
 await expect(other).toHaveAttribute('aria-selected','true');
 await button.focus();await page.keyboard.press('Space');
 await expect(activated).toHaveText('1'); // native button activation can also click-select its row
 await other.focus();await page.keyboard.press('Enter');await expect(selected).toHaveText('other');
 const input=page.getByRole('textbox',{name:'Company note'});await input.focus();
 await page.keyboard.type('hello world');await page.keyboard.press('Enter');
 await expect(input).toHaveValue('hello world');await expect(selected).toHaveText('other');
 await button.focus();await page.keyboard.press('Enter');await expect(activated).toHaveText('2');
 await other.focus();await page.keyboard.press('Space');await expect(other).toHaveAttribute('aria-selected','true');
 await row.focus();await page.keyboard.press('Enter');await expect(row).toHaveAttribute('aria-selected','true');
 await expect(other).toHaveAttribute('aria-selected','false');
 const text='Billed monthly under the company subscription with a very long description that must remain available in its title';
 await expect(page.getByText(text)).toHaveAttribute('title',text);
 expect(await page.getByText(text).evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
 await page.screenshot({path:`${evidence}/interactive-cells-${dir}.png`,fullPage:true});
});
for(const locale of ['en','ar']) for(const name of ['DataTable','EmptyState']) test(`OpenUI ${name} localized fixture renders in ${locale}`,async({page})=>{
 await page.goto(`/components/${name}?locale=${locale}&dir=${locale==='en'?'ltr':'rtl'}&theme=light`);
 const fixture=page.getByRole('region',{name:locale==='en'?'OpenUI fixture':'عينة OpenUI'});
 if(name==='DataTable'){
  const table=fixture.getByRole('table',{name:locale==='en'?'Companies':'الشركات'});
  await expect(table).toBeVisible();await expect(table.getByRole('row')).toHaveCount(2);
  await expect(table.getByRole('cell',{name:locale==='en'?'Acme':'أكمي',exact:true})).toBeVisible();
  await expect(table.getByRole('cell',{name:locale==='en'?'$149 / mo':'١٤٩ دولاراً / شهرياً',exact:true})).toHaveCSS('text-align','end');
 }else{
  await expect(fixture.getByRole('heading',{name:locale==='en'?'No companies yet':'لا توجد شركات بعد'})).toBeVisible();
 }
 await fixture.screenshot({path:`${evidence}/fixture-${name}-${locale}.png`});
});
