import { chromium, expect } from '@playwright/test';
import { writeFile, mkdir } from 'node:fs/promises';
const out='~/.no-mistakes/evidence/01M7TR3ZH6ENAQ0XT93GT8GPXF';
const browser=await chromium.launch();
const results=[];
const check=async(name, fn)=>{try{const detail=await fn(); results.push({name,result:'pass',detail});}catch(error){results.push({name,result:'fail',error:String(error.stack)});}};
try {
for(const locale of ['en','ar']) for(const theme of ['light','dark']) {
 const ar=locale==='ar'; const state=`locale=${locale}&dir=${ar?'rtl':'ltr'}&theme=${theme}`;
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
 const open=async()=>{await page.goto(`http://127.0.0.1:5173/dashboards/home?${state}`); await expect(page.locator('.ts-approval-card')).toHaveCount(4); await page.evaluate(()=>document.fonts.ready);};
 await check(`metrics and approval identity ${locale} ${theme}`,async()=>{
  await open();
  const expected=ar?['+١٢% مقارنة بالأسبوع السابق','+٨% مقارنة بالأسبوع السابق','+٤% مقارنة بالأسبوع السابق','-١ نقطة مقارنة بالأسبوع السابق','هذا الأسبوع','هذا الأسبوع']:['+12% vs last week','+8% vs last week','+4% vs last week','-1 pt vs last week','This week','This week'];
  await expect(page.locator('.ts-stat-tile__delta')).toHaveText(expected);
  await expect(page.locator('.ts-stat-tile').nth(4)).toContainText(ar?'المهام المنجزة بواسطة الفرق':'Tasks done by squads');
  await expect(page.locator('.ts-stat-tile').nth(5)).toContainText(ar?'تقديري هذا الأسبوع':'Estimated this week');
  const agents=ar?['الجيزة','كيوتو','ريو','بترا']:['Giza','Kyoto','Rio','Petra'];
  for(let i=0;i<4;i++) {await expect(page.locator('.ts-approval-card__agent').nth(i)).toContainText(agents[i]); await expect(page.locator('.ts-approval-card__task').nth(i)).toContainText(`TASK-${1042+i}`);}
  await expect(page.getByText(ar?'تشغّل ٥ فرق · متجر تجريبي':'Runs 5 squads · Demo store',{exact:true})).toBeVisible();
  await expect(page.locator('.sent-commands')).toHaveCount(0);
  await page.screenshot({path:`${out}/home-${locale}-${theme}-1440.png`,fullPage:true});
  return {deltas:await page.locator('.ts-stat-tile__delta').allTextContents(),identities:await page.locator('.ts-approval-card__meta').allTextContents(),errors};
 });
 await check(`approve, keyboard disclosure and language switch ${locale} ${theme}`,async()=>{
  await open();
  await page.getByRole('button',{name:ar?'موافقة':'Approve',exact:true}).first().click();
  await expect(page.locator('.ts-card__count')).toHaveText('3');
  await expect(page.locator('.ts-chat-launcher')).toHaveAccessibleName(ar?/اسأل بيترا\s*،\s*٣ بانتظارك/:/Ask Petra\s*,\s*3 waiting/);
  const details=page.locator('.sent-commands'); const summary=details.locator('summary');
  await expect(details.locator('pre')).toBeHidden();
  await summary.focus(); await page.keyboard.press('Enter'); await expect(details.locator('pre')).toBeVisible();
  const command=JSON.parse(await details.locator('pre').innerText());
  expect(command).toEqual({type:'ApprovalDecision',approvalId:'approval-1042',contentHash:'sha256:request-1042',decision:'approve'});
  await page.screenshot({path:`${out}/command-${locale}-${theme}-1440.png`,fullPage:true});
  await page.keyboard.press('Space'); await expect(details.locator('pre')).toBeHidden();
  await page.getByRole('radio',{name:ar?'English':'العربية',exact:true}).click();
  await expect(page.locator('.ts-approval-card')).toHaveCount(3);
  await expect(page.locator('.ts-approval-card__agent').first()).toContainText(ar?'Kyoto':'كيوتو');
  await expect(page.locator('.ts-approval-card__task').first()).toContainText('TASK-1043');
  await page.getByRole('button',{name:ar?'Decline':'رفض',exact:true}).first().click();
  await expect(page.locator('.ts-card__count')).toHaveText('2');
  await page.locator('.sent-commands summary').click();
  const rejection=JSON.parse(await page.locator('.sent-commands pre').innerText());
  expect(rejection).toEqual({type:'ApprovalDecision',approvalId:'approval-1043',contentHash:'sha256:request-1043',decision:'reject'});
  return {command,rejection,pending:await page.locator('.ts-approval-card__task').allTextContents()};
 });
 await check(`mobile clearance, empty approvals and chat navigation ${locale} ${theme}`,async()=>{
  await page.setViewportSize({width:390,height:844}); await open();
  await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
  const launcher=await page.locator('.ts-chat-launcher').boundingBox();
  const last=await page.locator('.ts-approval-card__footer').last().boundingBox();
  expect(last.y+last.height).toBeLessThanOrEqual(launcher.y);
  const hit=await page.locator('.ts-approval-card__footer').last().getByRole('button',{name:ar?'رفض':'Decline',exact:true}).evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}); expect(hit).toBe(true);
  await page.screenshot({path:`${out}/clearance-${locale}-${theme}-390.png`});
  await page.locator('.ts-approval-card__footer').last().getByRole('button',{name:ar?'رفض':'Decline',exact:true}).click();
  await page.locator('.sent-commands summary').click();
  const dimensions=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,content:document.documentElement.scrollWidth})); expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  await page.screenshot({path:`${out}/disclosure-${locale}-${theme}-390.png`,fullPage:true});
  while(await page.locator('.ts-approval-card').count()) await page.getByRole('button',{name:ar?'موافقة':'Approve',exact:true}).first().click();
  await expect(page.locator('.ts-card__count')).toHaveText('0');
  await expect(page.locator('.ts-chat-launcher__count')).toHaveCount(0);
  await expect(page.locator('.ts-chat-launcher')).toHaveAccessibleName(ar?'اسأل بيترا':'Ask Petra');
  await page.locator('.ts-chat-launcher').click();
  await expect(page).toHaveURL(`http://127.0.0.1:5173/chat?${state}`);
  await expect(page.locator('html')).toHaveAttribute('lang',locale);
  expect(errors).toEqual([]);
  return {launcher,lastActions:last,lastDeclineHitTest:hit,dimensions,url:page.url(),errors};
 });
 await page.close();
}
} finally { await browser.close(); await writeFile(`${out}/live-observations.json`,JSON.stringify(results,null,2)); }
console.log(JSON.stringify(results,null,2));
if(results.some(r=>r.result==='fail')) process.exitCode=1;
