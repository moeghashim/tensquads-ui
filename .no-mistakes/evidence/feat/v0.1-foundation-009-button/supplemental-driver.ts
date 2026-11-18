import { expect, test } from '@playwright/test';
import { openPreview, expectAccessible, expectNoHorizontalScroll, expectThemeFocusRing } from './helpers/preview';
import { writeFileSync } from 'node:fs';

const evidence = '~/.no-mistakes/evidence/01M7PRG7NK22K1E5MT11WVRXH0';

test('D18 labels, keyboard guards, and theme boundaries on the production preview', async ({page}) => {
  const observations: unknown[] = [];
  // Oracle: PLAN.md D18, in the gallery's documented idle-first state order.
  const labels = ['في استراحة', 'بانتظارك', 'تخطيط', 'قيد العمل', 'قيد التحقق', 'تم', 'إعادة للتعديل', 'معلّق', 'بانتظار قرارك', 'أُلغي'];
  for (const theme of ['light', 'dark'] as const) {
    await openPreview(page, {locale:'ar',direction:'rtl',theme}, '/components/Squadmate');
    const gallery = page.getByRole('region', {name:'الزملاء وحالاتهم'});
    const agents = gallery.locator('.squadmate-gallery__agent');
    await expect(agents).toHaveCount(13);
    const rendered = [];
    for (let i=0; i<13; i++) {
      const agent = agents.nth(i);
      const name = await agent.locator('h2').innerText();
      await expect(agent.locator('figcaption')).toHaveText(labels);
      const images = agent.getByRole('img');
      for (let j=0; j<labels.length; j++) await expect(images.nth(j)).toHaveAttribute('alt', `${name}، ${labels[j]}`);
      rendered.push({name, labels: await agent.locator('figcaption').allTextContents(), names: await images.evaluateAll(imgs => imgs.map(img=>img.getAttribute('alt')))});
    }
    await page.setViewportSize({width:1440,height:900});
    await page.screenshot({path:`${evidence}/squadmate-ar-${theme}-desktop.png`, fullPage:true});
    await expectNoHorizontalScroll(page);
    await page.screenshot({path:`${evidence}/squadmate-ar-${theme}-mobile.png`, fullPage:true});
    observations.push({scenario:'D18 all 13 agents', theme, agents:rendered});
  }
  for (const locale of ['en','ar'] as const) for (const theme of ['light','dark'] as const) {
    await openPreview(page,{locale,direction:locale==='ar'?'rtl':'ltr',theme},'/components/Button');
    await page.evaluate(()=> {
      (window as any).activations=[];
      document.addEventListener('click', e=> {const b=(e.target as Element).closest('[data-slot="button"]'); if(b) (window as any).activations.push(b.className);});
    });
    for (const variant of ['solid','soft','outline','ghost','danger']) {
      const button=page.locator(`.ts-button--${variant}:not([data-disabled])`).first();
      await button.focus();
      await page.keyboard.press('Enter');
      await page.keyboard.press('Space');
      const disabled=page.locator(`.ts-button--${variant}[data-disabled]`);
      await expect(disabled).toBeDisabled();
      const box=await disabled.boundingBox();
      if(!box) throw Error('Disabled button has no painted box');
      await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
    }
    expect(await page.evaluate(()=>(window as any).activations.length)).toBe(10);
    await expectAccessible(page);
    await expectThemeFocusRing(page,theme);
    await page.setViewportSize({width:1440,height:900});
    await page.screenshot({path:`${evidence}/button-${locale}-${theme}-desktop.png`,fullPage:true});
    await expectNoHorizontalScroll(page);
    await page.screenshot({path:`${evidence}/button-${locale}-${theme}-mobile.png`,fullPage:true});
    observations.push({scenario:'Keyboard and disabled guards',locale,theme,activations:await page.evaluate(()=>(window as any).activations),axe:'no violations',mobileOverflow:false});
  }
  for(const colorScheme of ['light','dark'] as const) for(const theme of ['light','dark','system']) {
    await page.emulateMedia({colorScheme});
    await page.goto(`/components/Button?locale=en&dir=ltr&theme=${theme}`);
    const danger=page.locator('.ts-button--danger:not([data-disabled])');
    await expect(danger.first()).toHaveCSS('color','rgb(255, 255, 255)');
    if(theme==='system') await expect(page.locator('html')).not.toHaveAttribute('data-theme');
    else await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
    const colors=await danger.evaluateAll(buttons=> buttons.map(b=> {const s=getComputedStyle(b);return {color:s.color,componentText:s.getPropertyValue('--ts-button-danger-text').trim(),background:s.backgroundColor};}));
    expect(colors).toHaveLength(5);
    for(const c of colors) expect(c.color).toBe('rgb(255, 255, 255)');
    observations.push({scenario:'Danger text theme boundaries',colorScheme,theme,colors});
    if(colorScheme==='dark') await page.screenshot({path:`${evidence}/danger-os-dark-${theme}.png`,fullPage:true});
  }
  writeFileSync(`${evidence}/browser-observations.json`,JSON.stringify(observations,null,2));
});
