import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';
const dir='~/.no-mistakes/evidence/01M7TR2K5KB9FWFR7D5HNWYW27/admin-live';
const browser=await chromium.launch();
const results=[];
const errors=[];
async function run(name, fn){ const context=await browser.newContext({viewport:{width:1440,height:900}}); const page=await context.newPage(); page.on('pageerror', e=>errors.push(String(e))); try{await fn(page);results.push({name,result:'pass'});}catch(e){await page.screenshot({path:`${dir}/${name}-failure.png`,fullPage:true});results.push({name,result:'fail',error:String(e)});}finally{await context.close();await writeFile(`${dir}/live-results.json`,JSON.stringify({results,errors},null,2));}}
async function open(page,locale,view='companies',theme='light',width=1440){await page.setViewportSize({width,height:900});await page.goto(`http://127.0.0.1:5279/dashboards/admin?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}&view=${view}`);await page.evaluate(()=>document.fonts.ready);await expect(page.locator('.dashboard-panel h1')).toBeVisible();await expect(page.locator('html')).toHaveAttribute('lang',locale);await expect(page.locator('html')).toHaveAttribute('dir',locale==='ar'?'rtl':'ltr');}
for(const locale of ['en','ar']) await run(`companies-${locale}`, async page=>{
 const ar=locale==='ar';await open(page,locale);
 await expect(page.getByRole('row')).toHaveCount(10);
 await expect(page.locator('.ts-stat-tile__value')).toHaveText(['9','6','66','4,765','$1,294','$14,568']);
 const online=await page.getByRole('row').all();let total=0;for(const row of online.slice(1))total+=parseInt(await row.getByRole('cell').last().innerText());expect(total).toBe(53);
 await expect(page.locator('.ts-bars__labels')).toContainText(ar?['Growth4 شركات · 27 فرق','Starter3 شركات · 17 فرق','Scale2 شركات · 22 فرق']:['Growth4 companies · 27 squads','Starter3 companies · 17 squads','Scale2 companies · 22 squads']);
 await page.screenshot({path:`${dir}/companies-${locale}-1440.png`,fullPage:true});
 const observed={summary:await page.locator('.ts-stat-tile').allTextContents(),plans:await page.locator('.ts-bars__labels').allTextContents(),onlineTotal:total,rows:await page.getByRole('row').allTextContents()};
 for(const [name,count] of [[ar?'نشطة':'Active',7],[ar?'تجريبية':'Trial',3],[ar?'متوقفة':'Paused',2]]){await page.getByRole('button',{name,exact:true}).click();await expect(page.getByRole('row')).toHaveCount(count);}
 await page.getByRole('button',{name:ar?'الكل':'All',exact:true}).click();
 const search=page.getByRole('textbox',{name:ar?'البحث عن الشركات':'Search companies'});
 await search.fill('NORTHSTAR');await expect(page.getByRole('row')).toHaveCount(2);
 await page.getByRole('button',{name:ar?'متوقفة':'Paused',exact:true}).click();await expect(page.locator('[data-slot="empty-state"]')).toBeVisible();
 await page.screenshot({path:`${dir}/companies-${locale}-empty.png`,fullPage:true});
 await page.getByRole('button',{name:ar?'إزالة عوامل التصفية':'Clear filters'}).click();await expect(search).toHaveValue('');await expect(page.getByRole('row')).toHaveCount(10);
 await writeFile(`${dir}/companies-${locale}-surface.json`,JSON.stringify(observed,null,2));
});
for(const locale of ['en','ar'])await run(`image-filters-keyboard-${locale}`,async page=>{
 const ar=locale==='ar';await open(page,locale,'images','dark');
 await expect(page.getByRole('row')).toHaveCount(8);
 for(const [name,count] of [[ar?'تحتاج إلى مراجعة':'Needs attention',3],[ar?'بها أخطاء':'With bugs',5],[ar?'بها طلبات':'With requests',6],[ar?'الكل':'All',8]]){await page.getByRole('button',{name,exact:true}).click();await expect(page.getByRole('row')).toHaveCount(count);}
 const people=page.getByRole('row').filter({hasText:'registry.agents.example/people:'});await people.focus();await page.keyboard.press('Enter');await expect(page.locator('.dashboard-stack .ts-card').first().getByRole('heading')).toHaveText(ar?'الموارد البشرية':'People');
 await expect(page.locator('.dashboard-empty-line')).toHaveCount(2);
 await page.screenshot({path:`${dir}/images-${locale}-empty.png`,fullPage:true});
 const orders=page.getByRole('row').filter({hasText:'registry.agents.example/orders:'});await orders.focus();await page.keyboard.press('Space');await expect(page.locator('.dashboard-details')).toContainText(ar?'22 من 34 (65%)':'22 of 34 (65%)');
 await expect(page.locator('.dashboard-details dd[dir="ltr"]').first()).toHaveText('registry.agents.example/orders:1.8.2');
 await page.screenshot({path:`${dir}/images-${locale}-1440.png`,fullPage:true});
 await writeFile(`${dir}/images-${locale}-surface.json`,JSON.stringify({summary:await page.locator('.ts-stat-tile').allTextContents(),details:await page.locator('.dashboard-stack').innerText()},null,2));
 await page.getByRole('button',{name:ar?'الشركات':'Companies',exact:true}).click();await expect(page).toHaveURL(new RegExp(`locale=${locale}.*theme=dark.*view=companies`));
 await page.getByRole('button',{name:ar?'صور الفرق':'Squad images'}).click();await expect(page).toHaveURL(new RegExp(`locale=${locale}.*theme=dark.*view=images`));
});
await run('responsive-accessible-matrix',async page=>{
 const matrix=[];
 for(const locale of ['en','ar'])for(const theme of ['light','dark'])for(const view of ['companies','images'])for(const width of [1440,1180,760,390]){
  await open(page,locale,view,theme,width);
  await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
  const dimensions=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,content:document.documentElement.scrollWidth}));expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  const axe=await new AxeBuilder({page}).analyze();expect(axe.violations).toEqual([]);
  if(width<=760){await expect(page.locator('.ts-sidebar-mobile-bar')).toContainText('Platform admin');await page.getByRole('button',{name:locale==='ar'?'فتح التنقل':'Open navigation'}).click();await page.getByRole('button',{name:locale==='ar'?(view==='companies'?'صور الفرق':'الشركات'):(view==='companies'?'Squad images':'Companies')}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page).toHaveURL(new RegExp(`view=${view==='companies'?'images':'companies'}`));await open(page,locale,view,theme,width);}
  await page.screenshot({path:`${dir}/${view}-${locale}-${theme}-${width}.png`,fullPage:true});
  matrix.push({locale,theme,view,width,dimensions,accessibilityViolations:axe.violations.length}); console.log(locale,theme,view,width);
 }
 await writeFile(`${dir}/matrix.json`,JSON.stringify(matrix,null,2));
});
await browser.close();
console.log(JSON.stringify({results,errors},null,2));
process.exitCode=results.some(r=>r.result==='fail')||errors.length?1:0;
