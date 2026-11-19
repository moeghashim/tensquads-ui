import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const dir='~/.no-mistakes/evidence/01M7SFX7PX0SVEPJ943Y64AXJJ';
const browser=await chromium.launch();
const results=[];
try {
for (const locale of ['en','ar']) for (const theme of ['light','dark']) {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const ar=locale==='ar'; const tag=`${locale}-${theme}`;
 await page.goto(`http://127.0.0.1:5173/chat?locale=${locale}&dir=${ar?'rtl':'ltr'}&theme=${theme}`);
 await page.evaluate(()=>document.fonts.ready);
 const field=page.getByRole('textbox',{name:ar?'اسم المتجر':'Store name'});
 const approve=page.getByRole('button',{name:ar?'اعتماد الخطة':'Approve plan',exact:true});
 const note=page.locator('.ts-chat-reply__locked-note');
 await expect(approve).toBeEnabled(); await expect(note).toHaveCount(0);
 const initial=await field.inputValue();
 const store=ar?'متجر الاختبار 42':'Boundary Store 42';
 await field.fill(store);
 const email=page.getByRole('switch',{name:ar?'أرسل إليّ إشعاراً عند الانتهاء':'Email me when done'});
 await email.click();
 const monthly=page.getByRole('radio',{name:ar?'شهري':'Monthly',exact:true});await monthly.click();
 await approve.scrollIntoViewIfNeeded();
 await page.locator('.chat-demo__surface').screenshot({path:`${dir}/${tag}-before.png`});
 await approve.click();
 await expect(page.locator('.ts-chat-reply__markdown').last()).toContainText(store);
 await expect(note).toHaveText(ar?'أُرسلت':'Sent');
 await expect(note).toHaveCount(1);
 await expect(field).toHaveValue(store);await expect(field).toBeDisabled();
 await expect(email).toBeDisabled(); await expect(email).not.toBeChecked();
 await expect(monthly).toBeChecked();await expect(monthly).toBeDisabled();await expect(approve).toBeDisabled();
 const style=await field.evaluate(el=>({cursor:getComputedStyle(el).cursor,color:getComputedStyle(el).color,normal:getComputedStyle(el).getPropertyValue('--ts-text').trim()}));
 expect(style.cursor).toBe('default');
 const canonical=await field.evaluate(el=>{const s=document.createElement('span');s.style.color='var(--ts-text)';el.parentElement.append(s);const color=getComputedStyle(s).color;s.remove();return color;});
 expect(style.color).toBe(canonical);
 // Try a real pointer click and keyboard edit on the consumed form. It must remain a record.
 const bounds=await approve.boundingBox();
 await page.mouse.click(bounds.x+bounds.width/2,bounds.y+bounds.height/2);
 await field.scrollIntoViewIfNeeded(); const fb=await field.boundingBox();
 await page.mouse.click(fb.x+20,fb.y+fb.height/2);await page.keyboard.type('tampered');await page.keyboard.press('Enter');
 await expect(field).toHaveValue(store);await expect(note).toHaveCount(1);await expect(page.locator('.ts-chat__user-message')).toHaveCount(2);
 await note.scrollIntoViewIfNeeded();
 await page.locator('.chat-demo__surface').screenshot({path:`${dir}/${tag}-sent.png`});
 const record=await page.locator('.chat-demo__surface').innerText();
 await page.getByRole('button',{name:ar?'إعادة العرض':'Replay',exact:true}).click();
 await expect(approve).toBeEnabled();await expect(note).toHaveCount(0);await expect(field).toHaveValue(initial);
 results.push({scenario:'submit-lock-replay',locale,theme,store,record,style,duplicateActions:0,resetValue:initial,errors});
 // Measure and operate the resized header at both required viewport widths.
 for(const width of [1440,390]) {
  await page.setViewportSize({width,height:1000});
  const metrics=await page.locator('.site-header').evaluate(header=>{
   const read=el=>({text:el.textContent,height:el.getBoundingClientRect().height,fontSize:getComputedStyle(el).fontSize,lineHeight:getComputedStyle(el).lineHeight});
   return {nav:[...header.querySelectorAll('.site-nav a')].map(read),controls:[...header.querySelectorAll('.site-controls [role="radio"]')].map(read),viewport:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth};
  });
  expect(metrics.controls.length).toBe(5);
  metrics.sizeMatches = metrics.controls.every(item=>item.height===metrics.nav[0].height && item.fontSize===metrics.nav[0].fontSize);
  expect(metrics.sizeMatches).toBe(true);
  expect(metrics.scroll).toBeLessThanOrEqual(metrics.viewport);
  await page.locator('.site-header').screenshot({path:`${dir}/${tag}-header-${width}.png`});
  results.push({scenario:'header-size',locale,theme,width,metrics});
 }
 // The header controls retain pointer and keyboard interaction after shrinking.
 await page.locator('.site-controls').getByRole('radio',{name:ar?'English':'العربية',exact:true}).click();
 await expect(page.locator('html')).toHaveAttribute('lang',ar?'en':'ar');
 await expect(page.locator('html')).toHaveAttribute('dir',ar?'ltr':'rtl');
 const oppositeTheme=theme==='light'?'dark':'light';
 const themeItems=page.locator('.site-controls [data-slot="segmented-control"]').nth(1).getByRole('radio');
 await themeItems.nth(oppositeTheme==='light'?0:1).focus();await page.keyboard.press('Space');
 await expect(page.locator('html')).toHaveAttribute('data-theme',oppositeTheme);
 await page.locator('.site-nav a').nth(1).click();
 await expect(page).toHaveURL(/\/components\?/);
 await expect(page.locator('html')).toHaveAttribute('lang',ar?'en':'ar');
 await expect(page.locator('html')).toHaveAttribute('data-theme',oppositeTheme);
 expect(errors).toEqual([]);
 results.push({scenario:'header-operate',from:tag,locale:ar?'en':'ar',theme:oppositeTheme,navigation:page.url()});
 await page.close();
}
} catch(e) {results.push({failure:e.stack});throw e;} finally {await writeFile(`${dir}/browser-results.json`,JSON.stringify(results,null,2));await browser.close();}
console.log('Completed live chat submission, lock guard, replay, header size and interaction checks in en/ar light/dark at 1440/390.');
