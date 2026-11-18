import {test,expect} from '@playwright/test';
const evidence='~/.no-mistakes/evidence/01M7PMSWBP7PG047JXJ2WYVZZG';
test('production preview visual evidence and interactive styling',async({page})=>{
 for(const locale of ['en','ar']) for(const theme of ['light','dark']) {
  await page.goto(`/components/Button?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}`);
  await page.evaluate(()=>document.fonts.ready);
  const first=page.getByRole('button',{name:locale==='en'?'Continue':'متابعة'}).first();
  await expect(first).toBeVisible();
  await page.mouse.move(0,0);
  const idle=await first.evaluate(el=>getComputedStyle(el).backgroundColor);
  await first.hover();
  await page.waitForTimeout(250);
  expect(await first.evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe(idle);
  await page.mouse.down();
  await page.waitForTimeout(250);
  const active=await first.evaluate(el=>getComputedStyle(el).backgroundColor);
  expect(active).not.toBe(idle);
  await page.mouse.up();
  await first.focus();
  await page.keyboard.press('Tab');
  const focused=page.locator(':focus');
  await expect(focused).toHaveAttribute('data-slot','button');
  await expect(focused).toHaveCSS('outline-width','2px');
  await expect(focused).toHaveCSS('outline-offset','2px');
  await expect(focused).toHaveCSS('outline-color',theme==='light'?'rgb(1, 105, 204)':'rgb(2, 133, 255)');
  for(const width of [1440,390]) {
   await page.setViewportSize({width,height:900});
   await page.screenshot({path:`${evidence}/button-${locale}-${theme}-${width}.png`,fullPage:true,animations:'disabled'});
  }
 }
 await page.goto('/?locale=en&theme=light');
 await expect(page.getByRole('link',{name:'Button',exact:true})).toBeVisible();
 await expect(page.getByRole('link',{name:'Example',exact:true})).toHaveCount(0);
 await page.screenshot({path:`${evidence}/gallery.png`,fullPage:true});
 await page.goto('/components/Squadmate?locale=ar&dir=rtl&theme=dark');
 await expect(page.getByRole('region',{name:'عينة OpenUI'}).getByRole('img',{name:'بترا، تخطيط'})).toHaveCSS('width','64px');
 await page.screenshot({path:`${evidence}/squadmate-fixture.png`,fullPage:true});
});
test('packed consumer preserves async class callbacks and prevents duplicate native and link actions',async({page})=>{
 await page.goto('http://localhost:5174');
 for(const key of ['button','link']) {
  const control=page.getByRole(key==='link'?'link':'button',{name:key==='link'?'Save link':'Save button'});
  await expect(control).toHaveClass(/ready/);
  await expect(control).toHaveCSS('height','28px');
  await expect(control).toHaveCSS('border-radius','9999px');
  await control.focus();
  await page.keyboard.press('Enter');
  await expect(control).toHaveAttribute('aria-busy','true');
  await expect(control).toHaveAttribute('aria-disabled','true');
  await expect(control).toHaveClass(/saving/);
  await expect(control).not.toHaveClass(/ready/);
  await expect(control).toHaveClass(/ts-button--soft/);
  await expect(control).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await control.evaluate(el=>(el as HTMLElement).click());
  expect(JSON.parse(await page.getByLabel('Action counts').innerText())[key]).toBe(1);
  await page.screenshot({path:`${evidence}/packed-${key}-pending.png`,fullPage:true});
  await page.evaluate(k=>(window as any)['finish'+k](),key);
  await expect(control).not.toHaveAttribute('aria-busy');
  await expect(control).toHaveClass(/ready/);
  await expect(control).not.toHaveClass(/saving/);
 }
});
test('packed consumer disables activation, keeps optional disabled focus, and rejects unnamed icons',async({page})=>{
 await page.goto('http://localhost:5174');
 const disabled=page.getByRole('button',{name:'Unavailable'});
 await expect(disabled).toBeDisabled();
 const publish=page.getByRole('button',{name:'Publish',exact:true});
 expect(await publish.evaluate(el=>(el as HTMLButtonElement).disabled)).toBe(false);
 await expect(publish).toHaveAttribute('aria-disabled','true');
 await publish.focus();
 await expect(publish).toBeFocused();
 await page.keyboard.press('Enter');
 await page.keyboard.press('Space');
 await publish.click({force:true});
 await disabled.evaluate(el=>(el as HTMLElement).click());
 expect(JSON.parse(await page.getByLabel('Action counts').innerText()).disabled).toBe(0);
 await page.keyboard.press('Tab');
 await expect(page.getByRole('button',{name:'Add',exact:true})).toBeFocused();
 const icon=page.getByRole('button',{name:'Add',exact:true});
 const box=await icon.boundingBox();
 expect(box?.height).toBe(32);expect(box?.width).toBe(32);
 await expect(page.getByRole('alert')).toHaveText('Button requires aria-label when iconOnly is true');
 await expect(page.getByRole('button',{name:'Save fixture'})).toBeVisible();
 expect(await page.evaluate(()=>(window as any).fixtureErrors.map((e:any)=>e.code))).toContain('excess-args');
 await page.screenshot({path:`${evidence}/packed-guards.png`,fullPage:true});
});
