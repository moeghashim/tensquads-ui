import {chromium,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7TPSWRD43TYFTEVB7V8914N';
const browser=await chromium.launch();const page=await browser.newPage();const observations=[];
try {
for(const locale of ['en','ar']) {
await page.setViewportSize({width:1440,height:1000});
await page.goto(`http://127.0.0.1:5174/?locale=${locale}`);
await expect(page.locator('#integer .ts-bar-chart__column')).toHaveCount(3);
await page.evaluate(()=>document.fonts.ready);
for(const id of ['integer','stacked']) {
await expect(page.locator(`#${id} .ts-bar-chart__gridline`)).toHaveText(['10','5','0']);
const heights=await page.locator(`#${id}`).evaluate(el=>{const plot=el.querySelector('.ts-bar-chart__columns').getBoundingClientRect(); return [...el.querySelectorAll('.ts-bar-chart__stack')].map(e=>e.getBoundingClientRect().height/(plot.height-1));});
expect(heights[0]).toBeCloseTo(.2,2);expect(heights[1]).toBeCloseTo(.3,2);if(id==='integer')expect(heights[2]).toBe(0);
observations.push({locale,id,ticks:['10','5','0'],measuredHeightFractions:heights});
}
await expect(page.locator('#decimal .ts-bar-chart__gridline')).toHaveText(['2.5','1.25','0']);
for(const width of [1440,390]) {
await page.setViewportSize({width,height:1000});
const chart=page.locator('#currency');
await expect(chart.locator('.ts-bar-chart__gridline')).toHaveText(['$10,000.00','$5,000.00','$0.00']);
const bounds=await chart.evaluate(el=>{const box=e=>{const {left,right,top,bottom}=e.getBoundingClientRect();return {left,right,top,bottom}};return {viewport:box(el.querySelector('.ts-bar-chart__viewport')),labels:[...el.querySelectorAll('.ts-bar-chart__gridline > span')].map(box),columns:[...el.querySelectorAll('.ts-bar-chart__column')].map(box)}});
for(const label of bounds.labels) {expect(label.left).toBeGreaterThanOrEqual(bounds.viewport.left);expect(label.right).toBeLessThanOrEqual(bounds.viewport.right);expect(label.top).toBeGreaterThanOrEqual(bounds.viewport.top);expect(label.bottom).toBeLessThanOrEqual(bounds.viewport.bottom);for(const column of bounds.columns)expect(label.right<=column.left || label.left>=column.right).toBe(true);}
await chart.locator('button').first().scrollIntoViewIfNeeded();
await page.keyboard.press('Tab');
await chart.locator('button').first().focus();
await expect(page.getByRole('tooltip')).toContainText('A: $6,000.00');
await page.keyboard.press(locale==='ar'?'ArrowLeft':'ArrowRight');
await expect(chart.getByRole('button',{name:'B: $10,000.00'})).toBeFocused();
await expect(page.getByRole('tooltip')).toContainText('B: $10,000.00');
await chart.screenshot({path:`${evidence}/currency-${locale}-${width}.png`});
observations.push({locale,width,formattedAxis:bounds,keyboardTooltip:'B: $10,000.00'});
}
await page.setViewportSize({width:900,height:1000});
await expect(page.locator('#entities .ts-data-table__tile')).toHaveText(['BH','CE','NS','M']);
await page.locator('#entities').screenshot({path:`${evidence}/entities-${locale}.png`});
await expect(page.locator('#unmapped')).not.toContainText('daily_limit');
await expect(page.locator('#unmapped .ts-approval-card__limit')).toContainText(locale==='ar'?'٢٠٫٠٠':'$20.00');
await expect(page.locator('#mapped')).toContainText('Daily refund limit');
await expect(page.locator('#legacy').getByRole('button',{name:'موافقة',exact:true})).toBeEnabled();
await expect(page.locator('#legacy').getByRole('button',{name:'رفض',exact:true})).toBeEnabled();
await expect(page.locator('#legacy')).not.toContainText('daily_limit');
await expect(page.locator('#extended')).toContainText('Daily refund limit');
await expect(page.locator('#extended').getByRole('button',{name:'Allow',exact:true})).toBeEnabled();
await expect(page.locator('#extended').getByRole('button',{name:'رفض',exact:true})).toBeEnabled();
for(const id of ['unmapped','mapped','legacy','extended'])await page.locator(`#${id}`).screenshot({path:`${evidence}/approval-${id}-${locale}.png`});
await page.locator('#mapped').getByRole('button',{name:locale==='ar'?'موافقة':'Approve',exact:true}).click();
await expect(page.locator('#mapped').getByRole('button').first()).toBeDisabled();
observations.push({locale,initials:['BH','CE','NS','M'],approval:'unmapped rule hidden with limit retained; mapped rule visible; legacy Arabic locale and extended copy positions retained; approve locks controls'});
}
await writeFile(`${evidence}/live-observations.json`,JSON.stringify(observations,null,2));
console.log('Live library checks completed; screenshots and measured browser geometry retained.');
} finally {await browser.close()}
