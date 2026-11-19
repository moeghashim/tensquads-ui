import { pathToFileURL } from 'node:url';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const { chromium } = await import(pathToFileURL(`${process.cwd()}/node_modules/playwright/index.mjs`));
const evidence = '~/.no-mistakes/evidence/01M7TSN2PMJSWQ8Y9V6W78BTQJ';
const browser = await chromium.launch();
const observations = [];
try {
  for (const locale of ['en', 'ar']) for (const theme of ['light', 'dark']) for (const width of [1440, 1180, 760, 390]) {
    const page = await browser.newPage({viewport: {width, height: 900}});
    try {
      await page.goto(`http://localhost:5173/dashboards/home?locale=${locale}&dir=${locale === 'ar' ? 'rtl' : 'ltr'}&theme=${theme}`);
      await page.locator('.ts-approval-card__content').first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      const result = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        documentWidth: document.documentElement.scrollWidth,
        approvals: [...document.querySelectorAll('.ts-approval-card')].map(card => {
          const content = card.querySelector('.ts-approval-card__content');
          const body = content.parentElement;
          const rect = content.getBoundingClientRect();
          const bodyRect = body.getBoundingClientRect();
          const style = getComputedStyle(body);
          return {text: content.textContent, width: rect.width, availableWidth: bodyRect.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight), scrollWidth: content.scrollWidth, clientWidth: content.clientWidth, agent: card.querySelector('.ts-approval-card__agent')?.textContent, task: card.querySelector('.ts-approval-card__task')?.textContent};
        }),
        tiles: [...document.querySelectorAll('.ts-stat-tile')].map(tile => ({label: tile.querySelector('.ts-stat-tile__label').textContent, footer: tile.querySelector('.ts-stat-tile__footer').innerText, deltaCount: tile.querySelectorAll('.ts-stat-tile__delta').length, footCount: tile.querySelectorAll('.ts-stat-tile__foot').length})),
      }));
      assert.equal(result.approvals.length, 4);
      assert.equal(result.tiles.length, 6);
      assert.ok(result.documentWidth <= result.viewport);
      for (const [i, card] of result.approvals.entries()) {
        assert.ok(Math.abs(card.width - card.availableWidth) < 1, `approval ${i} does not use full body width`);
        assert.ok(card.scrollWidth <= card.clientWidth, 'approval content clips horizontally');
        assert.ok(card.task.includes(`TASK-${1042+i}`));
      }
      assert.deepEqual(result.tiles.map(tile => tile.deltaCount), [1,1,1,1,0,0]);
      assert.deepEqual(result.tiles.map(tile => tile.footCount), [1,1,1,1,1,1]);
      assert.equal(result.tiles[5].footer, locale === 'ar' ? 'تقديري هذا الأسبوع' : 'Estimated this week');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const launcher = await page.getByRole('button', {name: /Ask Petra|اسأل بيترا/}).boundingBox();
      const actions = await page.locator('.ts-approval-card__footer').last().boundingBox();
      assert.ok(actions.y + actions.height <= launcher.y, 'launcher overlaps last approval controls');
      observations.push({locale, theme, width, ...result, clearance: launcher.y - actions.y - actions.height});
      if (width === 1440 || width === 390) await page.screenshot({path: `${evidence}/home-${locale}-${theme}-${width}.png`,fullPage:true});
    } finally { await page.close(); }
  }
  const page = await browser.newPage({viewport:{width:390,height:900}});
  try {
    await page.goto('http://localhost:5173/dashboards/home?locale=en&dir=ltr&theme=light');
    await page.getByRole('button', {name:'Approve',exact:true}).first().click();
    await page.locator('.sent-commands summary').waitFor();
    assert.equal(await page.locator('.sent-commands').getAttribute('open'),null);
    assert.equal(await page.locator('.ts-card__count').innerText(),'3');
    await page.locator('.sent-commands summary').focus();
    await page.keyboard.press('Enter');
    const command = JSON.parse(await page.locator('.sent-commands pre').innerText());
    assert.equal(command.type,'ApprovalDecision');
    assert.equal(command.approvalId,'approval-1042');
    assert.equal(command.decision,'approve');
    await page.screenshot({path:`${evidence}/approved-command-mobile.png`,fullPage:true});
    const decisions = [command];
    await page.locator('.sent-commands summary').press('Enter');
    for (let i=0;i<3;i++) {
      await page.getByRole('button', {name:'Decline',exact:true}).first().click();
      await page.waitForFunction(expected => document.querySelectorAll('.ts-approval-card').length === expected,2-i);
    }
    assert.equal(await page.locator('.ts-card__count').innerText(),'0');
    assert.equal(await page.locator('.ts-approval-card').count(),0);
    assert.equal(await page.getByRole('button',{name:'Ask Petra',exact:true}).count(),1);
    await page.locator('.sent-commands summary').click();
    const finalCommand = JSON.parse(await page.locator('.sent-commands pre').innerText());
    assert.equal(finalCommand.approvalId,'approval-1045');
    assert.equal(finalCommand.decision,'reject');
    decisions.push(finalCommand);
    await page.screenshot({path:`${evidence}/all-decisions-mobile.png`,fullPage:true});
    observations.push({scenario:'approve then decline remaining requests to zero',decisions,remaining:0});
  } finally { await page.close(); }
  await writeFile(`${evidence}/live-observations.json`,JSON.stringify(observations,null,2));
  console.log('Live dashboard geometry, captions, metadata, command disclosure and zero-count boundary passed.');
} finally { await browser.close(); }
